import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Convert CSS classes and default styles to inline style attributes.
 */
export const rehypeInlineStyles: Plugin<[], Root> = () => {
    return (tree: Root) => {
        visit(tree, 'element', (node: Element) => {
            // Remove class attributes (WeChat ignores them)
            if (node.properties?.className) {
                delete node.properties.className;
            }
        });
    };
};
