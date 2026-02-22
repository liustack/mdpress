/**
 * Default style map for WeChat MP editor inline styles.
 *
 * Keys: tag names, compound selectors ("pre code"), or hljs class names ("hljs-keyword").
 * Values: CSS property strings to inject as inline styles.
 */

export type StyleMap = Record<string, string>;

export const defaultStyles: StyleMap = {
    // Headings
    h1: 'font-size: 24px; font-weight: bold; margin: 24px 0 16px; line-height: 1.4; color: #333;',
    h2: 'font-size: 20px; font-weight: bold; margin: 20px 0 12px; line-height: 1.4; color: #333;',
    h3: 'font-size: 18px; font-weight: bold; margin: 18px 0 10px; line-height: 1.4; color: #333;',
    h4: 'font-size: 16px; font-weight: bold; margin: 16px 0 8px; line-height: 1.4; color: #333;',
    h5: 'font-size: 15px; font-weight: bold; margin: 14px 0 6px; line-height: 1.4; color: #333;',
    h6: 'font-size: 14px; font-weight: bold; margin: 14px 0 6px; line-height: 1.4; color: #999;',

    // Paragraphs
    p: 'font-size: 15px; line-height: 1.8; margin: 8px 0; color: #333;',

    // Blockquote
    blockquote: 'margin: 16px 0; padding: 12px 16px; border-left: 4px solid #ddd; background: #f7f7f7; color: #666;',

    // Code
    code: 'font-size: 13px; font-family: Menlo, Monaco, Consolas, monospace; background: #fff5f5; color: #e96900; padding: 2px 6px; border-radius: 3px;',
    'pre code': 'display: block; font-size: 13px; font-family: Menlo, Monaco, Consolas, monospace; background: #282c34; color: #abb2bf; padding: 16px; border-radius: 6px; overflow-x: auto; line-height: 1.6;',
    pre: 'margin: 16px 0;',

    // Lists
    ul: 'margin: 8px 0; padding-left: 24px; font-size: 15px; line-height: 1.8; color: #333;',
    ol: 'margin: 8px 0; padding-left: 24px; font-size: 15px; line-height: 1.8; color: #333;',
    li: 'margin: 4px 0;',

    // Table
    table: 'border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px;',
    th: 'border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; text-align: left;',
    td: 'border: 1px solid #ddd; padding: 8px 12px;',

    // Links (for preserved internal links)
    a: 'color: #576b95; text-decoration: none;',

    // Images
    img: 'max-width: 100%; height: auto; display: block; margin: 16px auto;',

    // Horizontal rule
    hr: 'border: none; border-top: 1px solid #ddd; margin: 24px 0;',

    // Inline formatting
    strong: 'font-weight: bold; color: #333;',
    em: 'font-style: italic;',
    del: 'text-decoration: line-through; color: #999;',
    s: 'text-decoration: line-through; color: #999;',

    // Superscript / subscript
    sup: 'font-size: 12px; vertical-align: super; color: #576b95;',
    sub: 'font-size: 12px; vertical-align: sub;',

    // Section / figure
    section: 'margin: 8px 0;',
    figcaption: 'font-size: 13px; color: #999; text-align: center; margin-top: 8px;',
    figure: 'margin: 16px 0; text-align: center;',

    // Mark
    mark: 'background: #fff3b0; padding: 2px 4px;',

    // hljs One Dark theme colors
    'hljs-keyword': 'color: #c678dd;',
    'hljs-string': 'color: #98c379;',
    'hljs-number': 'color: #d19a66;',
    'hljs-comment': 'color: #5c6370; font-style: italic;',
    'hljs-function': 'color: #61afef;',
    'hljs-title': 'color: #61afef;',
    'hljs-built_in': 'color: #e6c07b;',
    'hljs-literal': 'color: #d19a66;',
    'hljs-type': 'color: #e6c07b;',
    'hljs-params': 'color: #abb2bf;',
    'hljs-meta': 'color: #61afef;',
    'hljs-attr': 'color: #d19a66;',
    'hljs-variable': 'color: #e06c75;',
    'hljs-selector-tag': 'color: #e06c75;',
    'hljs-selector-class': 'color: #d19a66;',
    'hljs-regexp': 'color: #98c379;',
    'hljs-symbol': 'color: #56b6c2;',
    'hljs-tag': 'color: #e06c75;',
    'hljs-name': 'color: #e06c75;',
    'hljs-attribute': 'color: #d19a66;',
    'hljs-addition': 'color: #98c379; background: rgba(152, 195, 121, 0.1);',
    'hljs-deletion': 'color: #e06c75; background: rgba(224, 108, 117, 0.1);',
};
