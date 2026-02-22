import { describe, it, expect } from 'vitest';
import { processWithPlugin, processWithPlugins } from '../helpers.ts';
import { rehypeCodeHighlight, rehypeInlineStyles } from '../../src/wechat/plugins/index.ts';

describe('rehypeInlineStyles', () => {
    it('should add font-size and line-height to p tags', async () => {
        const html = await processWithPlugin('Hello world', rehypeInlineStyles);
        expect(html).toContain('font-size: 15px');
        expect(html).toContain('line-height: 1.8');
    });

    it('should add font-size: 24px to h1 tags', async () => {
        const html = await processWithPlugin('# Title', rehypeInlineStyles);
        expect(html).toContain('font-size: 24px');
    });

    it('should use "pre code" style for code inside pre', async () => {
        const html = await processWithPlugin('```\ncode\n```', rehypeInlineStyles);
        // pre code style has background: #282c34 (One Dark)
        expect(html).toContain('#282c34');
    });

    it('should use inline code style with #e96900 for inline code', async () => {
        const html = await processWithPlugin('Use `inline` code', rehypeInlineStyles);
        expect(html).toContain('#e96900');
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
        // hljs-keyword maps to color: #c678dd
        expect(html).toContain('#c678dd');
    });

    it('should add styles to table elements', async () => {
        const md = '| A | B |\n|---|---|\n| 1 | 2 |';
        const html = await processWithPlugin(md, rehypeInlineStyles);
        expect(html).toContain('border-collapse');
        expect(html).toContain('border: 1px solid');
    });

    it('should style blockquote with border-left', async () => {
        const html = await processWithPlugin('> quote', rehypeInlineStyles);
        expect(html).toContain('border-left');
    });
});
