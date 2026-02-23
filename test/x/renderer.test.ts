import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render } from '../../src/x/renderer.ts';
import * as fs from 'fs';
import * as path from 'path';

const TMP_DIR = path.resolve(__dirname, '../../test-output-x');
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

beforeAll(() => {
    fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
});

afterAll(() => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe('x render', () => {
    it('should output x-editor-friendly semantic HTML', async () => {
        const inputPath = path.join(FIXTURES_DIR, 'x-simple.md');
        fs.writeFileSync(
            inputPath,
            '# H1\n\n### H3\n\nBody [link](https://example.com)\n\n![Poster](./images/poster-blue.png)\n\n```ts\nconst n = 1;\n```\n',
        );

        const outputPath = path.join(TMP_DIR, 'x-simple.html');
        const result = await render({ input: inputPath, output: outputPath });

        expect(result.input).toBe(inputPath);
        expect(result.output).toBe(outputPath);
        expect(result.size).toBeGreaterThan(0);

        const html = fs.readFileSync(outputPath, 'utf-8');
        expect(html).toContain('<h2>H1</h2>');
        expect(html).toContain('<h2>H3</h2>');
        expect(html).toContain('<a href="https://example.com">link</a>');
        expect(html).toContain('[Image: Poster]');

        expect(html).not.toContain('<img');
        expect(html).not.toContain('<pre');
        expect(html).not.toContain('<code');
        expect(html).not.toContain('style=');
        expect(html).not.toMatch(/\bclass="/);

        fs.unlinkSync(inputPath);
    });

    it('should reject non-.md files', async () => {
        const inputPath = path.join(FIXTURES_DIR, 'x-test.txt');
        fs.writeFileSync(inputPath, 'hello');

        await expect(
            render({ input: inputPath, output: path.join(TMP_DIR, 'x-out.html') }),
        ).rejects.toThrow('Unsupported input format');

        fs.unlinkSync(inputPath);
    });

    it('should reject non-existent files', async () => {
        await expect(
            render({ input: '/nonexistent/x-file.md', output: path.join(TMP_DIR, 'x-out.html') }),
        ).rejects.toThrow('Input file not found');
    });
});
