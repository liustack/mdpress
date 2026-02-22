import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import * as fs from 'fs';
import * as path from 'path';

interface Base64ImagesOptions {
    baseDir: string;
}

/**
 * Convert local image src to inline base64 data URIs.
 */
export const rehypeBase64Images: Plugin<[Base64ImagesOptions], Root> = (options) => {
    const { baseDir } = options;

    return (tree: Root) => {
        visit(tree, 'element', (node: Element) => {
            if (node.tagName !== 'img') return;

            const src = node.properties?.src;
            if (typeof src !== 'string') return;

            // Skip already-encoded or remote URLs
            if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return;

            const imgPath = path.resolve(baseDir, src);
            if (!fs.existsSync(imgPath)) return;

            const ext = path.extname(imgPath).slice(1).toLowerCase();
            const mimeMap: Record<string, string> = {
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                gif: 'image/gif',
                svg: 'image/svg+xml',
                webp: 'image/webp',
            };
            const mime = mimeMap[ext] || 'application/octet-stream';
            const data = fs.readFileSync(imgPath);
            const base64 = data.toString('base64');

            node.properties.src = `data:${mime};base64,${base64}`;
        });
    };
};
