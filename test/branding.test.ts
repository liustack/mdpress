import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

async function readProjectFile(path: string): Promise<string> {
    return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

describe('PostPress branding', () => {
    test('uses the approved public identifiers', async () => {
        const packageJson = JSON.parse(await readProjectFile('package.json'));
        const main = await readProjectFile('src/main.ts');
        const skill = await readProjectFile('skills/postpress/SKILL.md');

        expect(packageJson).toMatchObject({
            name: '@liustack/postpress',
            bin: { postpress: './dist/main.js' },
            repository: {
                url: 'git+https://github.com/liustack/postpress.git',
            },
        });
        expect(main).toContain(".name('postpress')");
        expect(skill).toContain('name: postpress');
        expect(skill).toContain('# PostPress');
    });
});
