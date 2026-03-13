---
name: wxpress
description: "Format and package Markdown articles for WeChat Official Account (公众号) publishing. Also supports X/Twitter Articles mode."
---

# wxpress — Format & Package Articles for WeChat Publishing

**wxpress** formats and packages Markdown articles for **WeChat Official Account (公众号) publishing**. It handles all the painful WeChat editor constraints automatically — inline styles, base64 images, link-to-footnote conversion, code formatting — so you can **write in Markdown, publish to WeChat in one step**.

Also supports X/Twitter Articles as a secondary target.

## Key Features

- **One-command WeChat publishing** — Markdown → clipboard-ready HTML, paste directly into the WeChat MP editor
- **Full WeChat compatibility** — inline styles only, base64-encoded images, tag sanitization, footnoted links
- **Image processing** — local images auto-compressed and embedded as base64 data URIs (≤ 2MB)
- **Mermaid diagrams** — code blocks rendered to PNG via Playwright (optional)
- **Code highlighting** — syntax colors inlined, whitespace preserved for WeChat's quirky rendering
- **X/Twitter Articles mode** — semantic HTML subset for X Articles editor

## Installation

```bash
npm install -g @liustack/wxpress@latest
```

> **Version check**: Before converting, run `wxpress --version`. If the command is not found or the version is outdated, re-run the install command above.

### Playwright Chromium (Required for Mermaid)

`mermaid` and `playwright` are bundled as dependencies. After installing, download the Chromium browser binary:

```bash
npx playwright install chromium
```

> Without Chromium, mermaid code blocks will trigger an error. All other features work without it.

## Usage

```bash
# Format Markdown for WeChat and save to file
wxpress -i article.md -o output.html

# Format and copy to clipboard — paste directly into WeChat MP editor
wxpress -i article.md -o output.html --copy

# Format for X/Twitter Articles
wxpress -i article.md -o output.html --target x
```

Output is JSON:

```json
{
  "input": "/absolute/path/to/article.md",
  "output": "/absolute/path/to/output.html",
  "size": 12345
}
```

## Options

- `-i, --input <path>` — Input Markdown file path (required)
- `-o, --output <path>` — Output HTML file path (required)
- `-t, --target <target>` — `wechat` (default), `x`, or `twitter` (alias of `x`)
- `-c, --copy` — Copy rendered HTML to system clipboard as rich text (for direct paste into WeChat editor)

## Mandatory Workflow (AI Agent MUST Follow)

> [!CAUTION]
> **Every Markdown-to-WeChat conversion MUST follow these steps. Do NOT skip or reorder.**

1. **Prepare Markdown** — Write or locate the Markdown file. Ensure all images use **relative paths** from the Markdown file's directory.
2. **Confirm output path** — Decide where the HTML should be saved (the `-o` path).
3. **Run wxpress** — Execute the conversion:
   ```bash
   wxpress -i article.md -o output.html
   ```
   Or with clipboard copy:
   ```bash
   wxpress -i article.md -o output.html --copy
   ```
4. **Check result** — Verify the JSON output shows a successful result with `size > 0`.
5. **Deliver** — Tell the user the output HTML path. If `--copy` was used, inform them the HTML is ready to paste directly into the WeChat MP editor.

## What wxpress Handles for WeChat

> [!IMPORTANT]
> The WeChat MP editor has strict limitations. wxpress handles all of these automatically so you don't have to.

| WeChat Constraint | How wxpress Solves It |
|---|---|
| **Inline styles only** — no `<style>`, `<link>`, `<script>` | All CSS converted to `style` attributes |
| **No external images** | Local images compressed (sharp) → base64 data URIs (≤ 2MB) |
| **Limited tag support** | `<div>` → `<section>`, dangerous tags removed, tag whitelist enforced |
| **Code formatting breaks** | `\n` → `<br>`, spaces → NBSP, tabs → NBSP pairs, `text-align: left` |
| **External links blocked** | Links → text + `<sup>[N]</sup>` footnotes; `mp.weixin.qq.com` links preserved |
| **No class attributes** | All `className` removed; hljs colors → inline styles |

## Image Handling

| Source | Behavior |
|--------|----------|
| Local file (relative path) | Compressed via sharp → base64 data URI (PNG preferred, ≤ 2MB) |
| `data:` URI | Skipped (already inline) |
| `http://` / `https://` URL | Skipped (passed through as-is) |
| GIF | Preserved as animated GIF, resized if > 2MB |
| SVG | Rasterized to PNG via sharp (WeChat doesn't support `data:image/svg+xml`) |

> [!CAUTION]
> **Images must use relative paths** from the Markdown file location. Absolute paths or URLs to local files won't resolve correctly.

## X/Twitter Articles Mode

Use `--target x` (or `--target twitter`) for X Articles editor:

- Keep only semantic subset: `h2`, `p`, `strong/b`, `em/i`, `s/del`, `a`, `blockquote`, `ul/ol/li`, `br`
- Convert every image to placeholder text: `[Image: ...]`
- Remove unsupported structure/style tags
- Keep only `https://` links as `<a href="...">`
- Convert `//...` links to `https://...`
- Downgrade non-HTTPS links to plain text

## Pipeline Processing Order

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

## Output Verification Checklist

After conversion, the output HTML should have:

- [ ] No `class=` attributes
- [ ] No `<script>`, `<style>`, `<link>`, `<iframe>`, `<input>`, `<div>` tags
- [ ] All visible elements have `style=` attributes
- [ ] External links replaced with footnote references (`<sup>[N]</sup>`)
- [ ] A `References` section at the end (if external links existed)
- [ ] Code blocks use `<br>` for line breaks and NBSP for indentation
- [ ] Local images converted to `data:image/...;base64,...`
- [ ] Task list checkboxes rendered as ☑ / ☐
- [ ] Mermaid code blocks converted to PNG `<img>` (if mermaid + playwright installed)
