import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import type { Plugin } from 'unified';
import type { Root } from 'hast';

export async function processWithPlugin(
    markdown: string,
    plugin: Plugin<any[], Root>,
    pluginOptions?: any,
): Promise<string> {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw);

    if (pluginOptions !== undefined) {
        processor.use(plugin, pluginOptions);
    } else {
        processor.use(plugin);
    }

    const file = await processor
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdown);

    return String(file);
}

type PluginEntry = Plugin<any[], Root> | [Plugin<any[], Root>, any];

export async function processWithPlugins(
    markdown: string,
    plugins: PluginEntry[],
): Promise<string> {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw);

    for (const entry of plugins) {
        if (Array.isArray(entry)) {
            processor.use(entry[0], entry[1]);
        } else {
            processor.use(entry);
        }
    }

    const file = await processor
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdown);

    return String(file);
}
