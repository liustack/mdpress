import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import { defaultStyles } from '../styles/default.ts';
import type { StyleMap } from '../styles/default.ts';

function isElement(node: any): node is Element {
    return node && node.type === 'element';
}

/**
 * Merge two CSS style strings. The `override` styles take precedence.
 * Deduplicates properties by keeping the last occurrence.
 */
function mergeStyles(base: string, override: string): string {
    if (!base) return override;
    if (!override) return base;

    const props = new Map<string, string>();

    // Parse base styles
    for (const decl of base.split(';')) {
        const trimmed = decl.trim();
        if (!trimmed) continue;
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) continue;
        const prop = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        props.set(prop, val);
    }

    // Parse override styles (takes precedence)
    for (const decl of override.split(';')) {
        const trimmed = decl.trim();
        if (!trimmed) continue;
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) continue;
        const prop = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        props.set(prop, val);
    }

    return Array.from(props.entries())
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ') + ';';
}

export interface InlineStylesOptions {
    styles?: StyleMap;
}

/**
 * Rehype plugin: inject inline styles from a style map and convert hljs classes to inline colors.
 *
 * 1. For each element, determine the style key (supports compound "pre code" selector)
 * 2. Look up hljs-* classes and inject corresponding inline styles
 * 3. Merge default styles with any existing style attribute
 * 4. Remove className
 */
export const rehypeInlineStyles: Plugin<[InlineStylesOptions?], Root> = (options) => {
    const styles = options?.styles ?? defaultStyles;

    return (tree: Root) => {
        visit(tree, 'element', (node: Element, _index, parent) => {
            const props = node.properties || {};
            node.properties = props;

            let styleKey = node.tagName;

            // Compound selector: code inside pre → "pre code"
            if (node.tagName === 'code' && parent && isElement(parent) && parent.tagName === 'pre') {
                styleKey = 'pre code';
            }

            // Collect hljs class styles
            let hljsStyle = '';
            const classNames = props.className;
            if (Array.isArray(classNames)) {
                for (const cls of classNames) {
                    if (typeof cls === 'string' && cls.startsWith('hljs-')) {
                        const hljsCss = styles[cls];
                        if (hljsCss) {
                            hljsStyle = hljsStyle ? mergeStyles(hljsStyle, hljsCss) : hljsCss;
                        }
                    }
                }
            }

            // Get default style for this tag
            const defaultStyle = styles[styleKey] || '';

            // Get existing inline style
            const existingStyle = typeof props.style === 'string' ? props.style : '';

            // Merge: default → hljs → existing (existing takes highest precedence)
            let finalStyle = defaultStyle;
            if (hljsStyle) {
                finalStyle = mergeStyles(finalStyle, hljsStyle);
            }
            if (existingStyle) {
                finalStyle = mergeStyles(finalStyle, existingStyle);
            }

            if (finalStyle) {
                props.style = finalStyle;
            }

            // Remove className
            delete props.className;
        });
    };
};
