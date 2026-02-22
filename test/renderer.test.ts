import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render } from '../src/wechat/renderer.ts';
import * as fs from 'fs';
import * as path from 'path';

const TMP_DIR = path.resolve(__dirname, '../test-output');
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

beforeAll(() => {
    fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
});

afterAll(() => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe('render', () => {
    it('should output HTML with inline styles and no class attributes', async () => {
        const inputPath = path.join(FIXTURES_DIR, 'simple.md');
        fs.writeFileSync(inputPath, '# Hello\n\n**World**\n');

        const outputPath = path.join(TMP_DIR, 'simple.html');
        const result = await render({ input: inputPath, output: outputPath });

        expect(result.input).toBe(inputPath);
        expect(result.output).toBe(outputPath);
        expect(result.size).toBeGreaterThan(0);

        const html = fs.readFileSync(outputPath, 'utf-8');
        expect(html).toContain('style=');
        expect(html).not.toMatch(/\bclass="/);
        expect(html).toContain('Hello');
        expect(html).toContain('World');

        fs.unlinkSync(inputPath);
    });

    it('should reject non-.md files', async () => {
        const inputPath = path.join(FIXTURES_DIR, 'test.txt');
        fs.writeFileSync(inputPath, 'hello');

        await expect(
            render({ input: inputPath, output: path.join(TMP_DIR, 'out.html') }),
        ).rejects.toThrow('Unsupported input format');

        fs.unlinkSync(inputPath);
    });

    it('should reject non-existent files', async () => {
        await expect(
            render({ input: '/nonexistent/file.md', output: path.join(TMP_DIR, 'out.html') }),
        ).rejects.toThrow('Input file not found');
    });

    it('should return correct RenderResult structure', async () => {
        const inputPath = path.join(FIXTURES_DIR, 'result-test.md');
        fs.writeFileSync(inputPath, 'Test content\n');

        const outputPath = path.join(TMP_DIR, 'result-test.html');
        const result = await render({ input: inputPath, output: outputPath });

        expect(result).toHaveProperty('input');
        expect(result).toHaveProperty('output');
        expect(result).toHaveProperty('size');
        expect(typeof result.size).toBe('number');

        fs.unlinkSync(inputPath);
    });
});
