import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

interface MermaidOptions {
    /** Device scale factor for PNG quality. Default: 2 */
    scale?: number;
    /** Background color. Default: 'white' */
    backgroundColor?: string;
}

// pagepress default theme (Apple-style gray tones)
const MERMAID_THEME = {
    primaryColor: '#f5f5f7',
    primaryTextColor: '#1d1d1f',
    primaryBorderColor: '#d2d2d7',
    lineColor: '#86868b',
    secondaryColor: '#f5f5f7',
    tertiaryColor: '#ffffff',
    background: '#ffffff',
    mainBkg: '#f5f5f7',
    nodeBorder: '#d2d2d7',
    nodeTextColor: '#1d1d1f',
    clusterBkg: 'rgba(0, 0, 0, 0.02)',
    clusterBorder: 'rgba(0, 0, 0, 0.1)',
    titleColor: '#1d1d1f',
};

// pagepress flowchart config (spacing, curves, padding)
const FLOWCHART_CONFIG = {
    curve: 'basis',
    nodeSpacing: 40,
    rankSpacing: 50,
    htmlLabels: true,
    useMaxWidth: true,
    subGraphTitleMargin: { top: 15, bottom: 15 },
    padding: 20,
};

function collectMermaidBlocks(tree: Root) {
    const tasks: Array<{ node: Element; parent: Element | Root; index: number; definition: string }> = [];
    visit(tree, 'element', (node: Element, index, parent) => {
        if (node.tagName !== 'pre' || !parent || index === undefined) return;
        const codeChild = node.children.find(
            (c): c is Element => c.type === 'element' && c.tagName === 'code',
        );
        if (!codeChild) return;
        const classes = Array.isArray(codeChild.properties?.className)
            ? codeChild.properties.className
            : [];
        if (!classes.includes('language-mermaid')) return;
        const text = codeChild.children
            .filter((c): c is { type: 'text'; value: string } => c.type === 'text')
            .map((c) => c.value)
            .join('');
        if (text.trim()) {
            tasks.push({ node, parent: parent as Element, index, definition: text.trim() });
        }
    });
    return tasks;
}

/**
 * Rehype plugin: render mermaid code blocks to PNG images via Playwright.
 *
 * Uses the same approach as pagepress: inject mermaid.min.js into a Playwright
 * Chromium page, render with Apple-style theme, post-process SVG (rounded corners),
 * and screenshot to 2x PNG.
 *
 * Dependencies (mermaid + playwright) are optional and loaded dynamically.
 * When no mermaid blocks are detected, there is zero overhead.
 */
export const rehypeMermaid: Plugin<[MermaidOptions?], Root> = (options = {}) => {
    const { scale = 2, backgroundColor = 'white' } = options;

    return async (tree: Root) => {
        // 1. Collect mermaid code blocks
        const tasks = collectMermaidBlocks(tree);
        if (tasks.length === 0) return; // zero-overhead fast path

        // 2. Dynamic import (optional dependencies)
        let chromium: any;
        let mermaidPath: string;
        try {
            const pw = await import('playwright');
            chromium = pw.chromium;
            const { createRequire } = await import('module');
            const req = createRequire(import.meta.url);
            mermaidPath = req.resolve('mermaid/dist/mermaid.min.js');
        } catch {
            throw new Error(
                'Mermaid diagrams detected but required dependencies are missing.\n' +
                    'Run: npm install mermaid playwright && npx playwright install chromium',
            );
        }

        // 3. Launch Chromium (same as pagepress)
        const browser = await chromium.launch();
        try {
            const page = await browser.newPage();
            await page.setViewportSize({ width: 800, height: 600 });

            // 4. Inject mermaid.js + initialize (matches pagepress renderer.ts:196-281)
            await page.setContent('<html><body></body></html>');
            await page.addScriptTag({ path: mermaidPath });
            await page.evaluate(
                ({
                    theme,
                    flowchart,
                }: {
                    theme: typeof MERMAID_THEME;
                    flowchart: typeof FLOWCHART_CONFIG;
                }) => {
                    (window as any).mermaid.initialize({
                        startOnLoad: false,
                        theme: 'base',
                        themeVariables: {
                            ...theme,
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif',
                            fontSize: '14px',
                        },
                        flowchart,
                    });
                },
                { theme: MERMAID_THEME, flowchart: FLOWCHART_CONFIG },
            );

            // 5. Render each diagram → post-process SVG → screenshot to PNG
            for (const task of tasks) {
                // Create container
                await page.evaluate((def: string) => {
                    const container = document.createElement('div');
                    container.className = 'mermaid';
                    container.textContent = def;
                    container.id = 'mermaid-target';
                    document.body.innerHTML = '';
                    document.body.appendChild(container);
                }, task.definition);

                // Render
                await page.evaluate(() => (window as any).mermaid.run());
                await page.waitForSelector('#mermaid-target svg', { timeout: 10000 });
                await page.waitForTimeout(300);

                // SVG post-processing: rounded corners + label spacing (matches pagepress renderer.ts:296-322)
                await page.evaluate(() => {
                    // Node rounded corners 12px
                    document.querySelectorAll('.node rect').forEach((rect) => {
                        rect.setAttribute('rx', '12');
                        rect.setAttribute('ry', '12');
                    });
                    // Cluster rounded corners 16px
                    document.querySelectorAll('.cluster rect').forEach((rect) => {
                        rect.setAttribute('rx', '16');
                        rect.setAttribute('ry', '16');
                    });
                    // Cluster label shift down 8px
                    document.querySelectorAll('.cluster-label').forEach((label) => {
                        const transform = label.getAttribute('transform');
                        if (transform) {
                            const match = transform.match(
                                /translate\(([\d.]+),\s*([\d.]+)\)/,
                            );
                            if (match) {
                                const x = parseFloat(match[1]);
                                const y = parseFloat(match[2]) + 8;
                                label.setAttribute(
                                    'transform',
                                    `translate(${x}, ${y})`,
                                );
                            }
                        }
                    });
                });

                // Screenshot to PNG (2x resolution via viewport scale)
                const svgLocator = page.locator('#mermaid-target svg');
                const pngBuffer = await svgLocator.screenshot({
                    type: 'png',
                    scale: 'device',
                    omitBackground: backgroundColor === 'transparent',
                });
                const base64 = Buffer.from(pngBuffer).toString('base64');

                // 6. Replace <pre> with <img>
                const parentChildren =
                    (task.parent as any).children || (task.parent as Root).children;
                parentChildren[task.index] = {
                    type: 'element',
                    tagName: 'img',
                    properties: {
                        src: `data:image/png;base64,${base64}`,
                        alt: 'mermaid diagram',
                        style: 'max-width: 100%; height: auto; display: block; margin: 1.5em auto;',
                    },
                    children: [],
                } as Element;
            }
        } finally {
            await browser.close();
        }
    };
};
