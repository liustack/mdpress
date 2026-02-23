import { describe, it, expect } from 'vitest';
import { processWithPlugin, processWithPlugins } from '../helpers.ts';
import { rehypeCodeHighlight, rehypeInlineStyles } from '../../src/wechat/plugins/index.ts';

describe('rehypeInlineStyles', () => {
    it('should add font-size and line-height to p tags', async () => {
        const html = await processWithPlugin('Hello world', rehypeInlineStyles);
        expect(html).toContain('font-size: 15px');
        expect(html).toContain('line-height: 1.75');
    });

    it('should add font-size: 24px to h1 tags', async () => {
        const html = await processWithPlugin('# Title', rehypeInlineStyles);
        expect(html).toContain('font-size: 24px');
    });

    it('should use "pre code" style for code inside pre', async () => {
        const html = await processWithPlugin('```\ncode\n```', rehypeInlineStyles);
        // pre code style has background: #f5f5f7 (Apple light gray)
        expect(html).toContain('#f5f5f7');
    });

    it('should use inline code style with subtle gray background', async () => {
        const html = await processWithPlugin('Use `inline` code', rehypeInlineStyles);
        expect(html).toContain('#f5f5f7');
        expect(html).toContain('#1d1d1f');
    });

    it('should remove className attributes', async () => {
        // Use code block which gets hljs classes from remark
        const html = await processWithPlugin('```javascript\nconst x = 1;\n```', rehypeInlineStyles);
        expect(html).not.toMatch(/\bclass="/);
    });

    it('should merge existing style with default style', async () => {
        // remark-rehype + rehype-raw should preserve existing inline styles
        const html = await processWithPlugin(
            '<p style="color: red">text</p>',
            rehypeInlineStyles,
        );
        // Should have both the default p style and the existing red color
        expect(html).toContain('font-size: 15px');
        expect(html).toContain('color: red');
    });

    it('should convert hljs-keyword class to inline color', async () => {
        // Need rehypeCodeHighlight first to generate hljs classes
        const html = await processWithPlugins(
            '```javascript\nconst x = 1;\n```',
            [rehypeCodeHighlight, rehypeInlineStyles],
        );
        // hljs-keyword maps to color: #9b2393 (Xcode Light purple)
        expect(html).toContain('#9b2393');
    });

    it('should add styles to table elements', async () => {
        const md = '| A | B |\n|---|---|\n| 1 | 2 |';
        const html = await processWithPlugin(md, rehypeInlineStyles);
        expect(html).toContain('border-collapse');
        expect(html).toContain('border-bottom');
    });

    it('should style blockquote with border-left', async () => {
        const html = await processWithPlugin('> quote', rehypeInlineStyles);
        expect(html).toContain('border-left');
    });
});
