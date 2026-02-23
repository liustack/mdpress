# Project Overview (for AI Agent)

## Goal
Provide the `mdpress` CLI tool to convert local Markdown files into **WeChat MP-compatible HTML** with inline styles, base64 images, and sanitized tags. The output can be directly pasted into the WeChat Official Accounts editor.

## Technical Approach
- **unified + remark + rehype** as the Markdown processing pipeline
- **remark-parse** for Markdown parsing
- **remark-gfm** for GitHub Flavored Markdown (tables, strikethrough, etc.)
- **remark-rehype** to bridge Markdown AST to HTML AST
- **rehype-raw** to parse raw HTML in Markdown into proper HAST element nodes
- **rehype plugins** for WeChat-specific transformations (inline styles, base64 images, tag sanitization)
- **rehype-stringify** for HTML serialization

## WeChat MP Constraints
- All styles must be **inline** (`style` attribute), no `<style>` or `<link>` tags
- Images must be converted to **base64 data URIs** or uploaded to WeChat CDN
- No `<script>`, `position: fixed`, custom fonts, or external resources
- Limited subset of HTML tags and CSS properties supported

## Code Organization (Domain-driven)

```
src/
├── main.ts                     # CLI entry
└── wechat/                     # WeChat domain
    ├── renderer.ts             # Main rendering pipeline
    ├── plugins/                # Rehype plugins for WeChat transformations
    │   ├── index.ts            # Re-exports all plugins
    │   ├── rehype-sanitize-tags.ts    # Tag whitelist, div→section, checkbox→Unicode
    │   ├── rehype-mermaid.ts            # Mermaid diagrams → Playwright + PNG base64 (optional)
    │   ├── rehype-base64-images.ts    # Local images → sharp compress → base64
    │   ├── rehype-code-highlight.ts   # Syntax highlighting + whitespace protection
    │   ├── rehype-footnote-links.ts   # External links → footnotes + References
    │   └── rehype-inline-styles.ts    # Default styles + hljs colors → inline style
    └── styles/                 # Style definitions
        └── default.ts          # Apple-inspired minimalist style map + Xcode Light hljs theme
```

## Pipeline Execution Order

```
Markdown → remarkParse → remarkGfm → remarkRehype → rehypeRaw
  → 1. rehypeSanitizeTags     (tag whitelist, div→section, checkbox→Unicode, attribute cleanup)
  → 2. rehypeMermaid          (mermaid code blocks → Playwright render → PNG base64, optional)
  → 3. rehypeBase64Images     (local images → sharp compress → base64 data URI)
  → 4. rehypeCodeHighlight    (syntax highlighting + whitespace protection)
  → 5. rehypeFootnoteLinks    (external links → footnotes, preserve mp.weixin.qq.com)
  → 6. rehypeInlineStyles     (default styles + hljs colors → inline style attr, remove className)
  → rehypeStringify → HTML
```

## Skills Directory

- **mdpress** — `skills/mdpress/SKILL.md`: Convert Markdown to WeChat MP-ready HTML

## CLI Usage

```bash
mdpress -i article.md -o output.html
```

## Mermaid Plugin Notes

`rehypeMermaid` renders mermaid code blocks to 2x PNG via Playwright Chromium.

**Key constraints:**
- `deviceScaleFactor: 2` + `<img width>` for Retina clarity — do NOT change to 1x (blurry)
- `htmlLabels: true` is required — `false` breaks CJK text wrapping
- sharp SVG→PNG is NOT viable (librsvg doesn't support foreignObject)
- SVG z-ordering: edges may cross subgraph titles — this is a mermaid limitation, accepted
- Read `docs/mermaid.md` before modifying this plugin

## Operational Docs (`docs/`)

1. Operational docs use front-matter metadata (`summary`, `read_when`).
2. Before creating a new doc, run `pnpm docs:list` to review the existing index.
3. Before coding, check the `read_when` hints and read relevant docs as needed.
4. Existing docs: `commit`, `testing`, `mermaid`, `research/wechat-editor-compatibility`.

## .gitignore must include
- `node_modules/`
- `dist/`
- `skills/**/outputs/`
- common logs/cache/system files
