import { describe, it, expect } from 'vitest';
import { processWithPlugin } from '../../helpers.ts';
import { rehypeSanitizeTagsX } from '../../../src/x/plugins/rehype-sanitize-tags.ts';

describe('rehypeSanitizeTagsX', () => {
    it('should convert markdown images into placeholder text', async () => {
        const html = await processWithPlugin('![Architecture](./diagram.png)', rehypeSanitizeTagsX);
        expect(html).toContain('[Image: Architecture]');
        expect(html).not.toContain('<img');
    });

    it('should keep only https links and strip unsupported tags/styles', async () => {
        const md = [
            '# Title',
            '',
            '### Sub',
            '',
            'Text with **bold** *italic* ~~del~~ [link](https://example.com), [proto](//cdn.example.com/x), [http](http://insecure.example), [mail](mailto:test@example.com), [local](./a.md), [file](file:///tmp/a), [anchor](#sec).',
            '',
            '![Alt](./a.png)',
            '',
            '> Quote',
            '',
            '- Item',
            '',
            '1. One',
            '',
            '```js',
            'const x = 1;',
            '```',
            '',
            '| A | B |',
            '|---|---|',
            '| 1 | 2 |',
            '',
            '<div><span style="color:red">raw</span></div>',
        ].join('\n');

        const html = await processWithPlugin(md, rehypeSanitizeTagsX);

        expect(html).toContain('<h2>Title</h2>');
        expect(html).toContain('<h2>Sub</h2>');
        expect(html).toContain('<a href="https://example.com">link</a>');
        expect(html).toContain('<a href="https://cdn.example.com/x">proto</a>');
        expect(html).not.toContain('href="http://insecure.example"');
        expect(html).not.toContain('href="mailto:test@example.com"');
        expect(html).not.toContain('href="./a.md"');
        expect(html).not.toContain('href="file:///tmp/a"');
        expect(html).not.toContain('href="#sec"');
        expect(html).toContain('<blockquote>');
        expect(html).toContain('<ul>');
        expect(html).toContain('<ol>');

        expect(html).not.toContain('<h1>');
        expect(html).not.toContain('<h3>');
        expect(html).not.toContain('<img');
        expect(html).not.toContain('<table');
        expect(html).not.toContain('<pre');
        expect(html).not.toContain('<code');
        expect(html).not.toContain('<div');
        expect(html).not.toContain('<span');
        expect(html).not.toContain('style=');
        expect(html).not.toMatch(/\bclass="/);
    });
});
