import { describe, it, expect } from 'vitest';
import { processWithPlugin } from '../helpers.ts';
import { rehypeSanitizeTags } from '../../src/wechat/plugins/index.ts';

describe('rehypeSanitizeTags', () => {
    it('should preserve allowed tags (p, h1, strong, em)', async () => {
        const html = await processWithPlugin(
            '# Title\n\n**bold** and *italic*',
            rehypeSanitizeTags,
        );
        expect(html).toContain('<h1>');
        expect(html).toContain('<strong>');
        expect(html).toContain('<em>');
        expect(html).toContain('<p>');
    });

    it('should remove script tags with children', async () => {
        const html = await processWithPlugin(
            'Hello <script>alert("xss")</script> world',
            rehypeSanitizeTags,
        );
        expect(html).not.toContain('<script');
        expect(html).not.toContain('alert');
        expect(html).toContain('Hello');
        expect(html).toContain('world');
    });

    it('should remove style tags with children', async () => {
        const html = await processWithPlugin(
            'Hello <style>body{color:red}</style> world',
            rehypeSanitizeTags,
        );
        expect(html).not.toContain('<style');
        expect(html).not.toContain('body{color:red}');
    });

    it('should convert div to section', async () => {
        const html = await processWithPlugin(
            '<div>content</div>',
            rehypeSanitizeTags,
        );
        expect(html).not.toContain('<div');
        expect(html).toContain('<section>');
        expect(html).toContain('content');
    });

    it('should remove id attributes', async () => {
        const html = await processWithPlugin(
            '# Title {#my-id}',
            rehypeSanitizeTags,
        );
        expect(html).not.toMatch(/\sid="/);
        expect(html).not.toMatch(/\sid='/);
    });

    it('should remove on* event attributes', async () => {
        const html = await processWithPlugin(
            '<p onclick="alert(1)">text</p>',
            rehypeSanitizeTags,
        );
        expect(html).not.toContain('onclick');
    });

    it('should wrap bare text in block elements with span', async () => {
        const html = await processWithPlugin(
            'Hello world',
            rehypeSanitizeTags,
        );
        // p > span > text
        expect(html).toMatch(/<p><span>Hello world<\/span><\/p>/);
    });

    it('should not double-wrap inline elements', async () => {
        const html = await processWithPlugin(
            '**bold text**',
            rehypeSanitizeTags,
        );
        // strong is inline, should not be wrapped in extra span
        expect(html).toContain('<strong>');
        expect(html).not.toMatch(/<span><strong>/);
    });

    it('should convert checked checkbox to Unicode ☑', async () => {
        const html = await processWithPlugin(
            '- [x] done task',
            rehypeSanitizeTags,
        );
        expect(html).toContain('☑');
        expect(html).not.toContain('<input');
    });

    it('should convert unchecked checkbox to Unicode ☐', async () => {
        const html = await processWithPlugin(
            '- [ ] pending task',
            rehypeSanitizeTags,
        );
        expect(html).toContain('☐');
        expect(html).not.toContain('<input');
    });

    it('should unwrap unknown tags but preserve children', async () => {
        const html = await processWithPlugin(
            '<details><summary>Click</summary>Content</details>',
            rehypeSanitizeTags,
        );
        expect(html).not.toContain('<details');
        expect(html).not.toContain('<summary');
        expect(html).toContain('Click');
        expect(html).toContain('Content');
    });

    it('should remove iframe tags', async () => {
        const html = await processWithPlugin(
            '<iframe src="https://example.com"></iframe>',
            rehypeSanitizeTags,
        );
        expect(html).not.toContain('<iframe');
    });

    it('should preserve SVG-related tags', async () => {
        const html = await processWithPlugin(
            '<svg width="100" height="100"><circle cx="50" cy="50" r="40"></circle></svg>',
            rehypeSanitizeTags,
        );
        expect(html).toContain('<svg');
        expect(html).toContain('<circle');
    });
});
