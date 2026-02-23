import type { Plugin } from 'unified';
import type { Root, Element, Text } from 'hast';
import { visit, SKIP } from 'unist-util-visit';

const ALLOWED_TAGS = new Set([
    'h2',
    'p',
    'strong',
    'b',
    'em',
    'i',
    's',
    'del',
    'a',
    'blockquote',
    'ul',
    'ol',
    'li',
    'br',
]);

const REMOVE_WITH_CHILDREN = new Set([
    'script',
    'style',
    'iframe',
    'frame',
    'frameset',
    'object',
    'embed',
    'canvas',
    'audio',
    'video',
    'source',
    'track',
    'form',
    'input',
    'textarea',
    'select',
    'button',
    'noscript',
    'template',
    'link',
]);

function isHeadingTag(tagName: string): boolean {
    return /^h[1-6]$/.test(tagName);
}

function buildImagePlaceholder(alt: string, src: string): string {
    if (alt) return `[Image: ${alt}]`;
    if (src) return `[Image: ${src}]`;
    return '[Image]';
}

function normalizeHttpsHref(href: string): string | null {
    const trimmed = href.trim();
    if (!trimmed) return null;

    const candidate = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;

    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== 'https:' || !parsed.hostname) return null;
        return candidate;
    } catch {
        return null;
    }
}

/**
 * Rehype plugin for X/Twitter Article editor:
 * - Keep only X-supported semantic tags
 * - Convert all images to plain placeholder text
 * - Drop style/class/other attributes (except link href)
 * - Strip unsupported wrappers while preserving text
 */
export const rehypeSanitizeTagsX: Plugin<[], Root> = () => {
    return (tree: Root) => {
        visit(tree, 'element', (node: Element, index, parent) => {
            if (index === undefined || !parent) return;

            if (REMOVE_WITH_CHILDREN.has(node.tagName)) {
                parent.children.splice(index, 1);
                return [SKIP, index];
            }

            if (node.tagName === 'img') {
                const alt = typeof node.properties?.alt === 'string' ? node.properties.alt.trim() : '';
                const src = typeof node.properties?.src === 'string' ? node.properties.src.trim() : '';
                const text: Text = {
                    type: 'text',
                    value: buildImagePlaceholder(alt, src),
                };
                parent.children.splice(index, 1, text);
                return [SKIP, index];
            }

            if (isHeadingTag(node.tagName)) {
                node.tagName = 'h2';
            }

            if (!ALLOWED_TAGS.has(node.tagName)) {
                parent.children.splice(index, 1, ...node.children);
                return [SKIP, index];
            }

            if (node.tagName === 'a') {
                const href = typeof node.properties?.href === 'string' ? node.properties.href : '';
                const normalizedHref = normalizeHttpsHref(href);
                if (!normalizedHref) {
                    parent.children.splice(index, 1, ...node.children);
                    return [SKIP, index];
                }
                node.properties = { href: normalizedHref };
                return [SKIP, index + 1];
            }

            node.properties = {};
        });
    };
};
