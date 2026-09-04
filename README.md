# ContextLion 🦁

> **Turn any webpage into clean, structured, AI-ready context.**

[![CI](https://github.com/malilion/context-lion/actions/workflows/ci.yml/badge.svg)](https://github.com/malilion/context-lion/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![WXT](https://img.shields.io/badge/Framework-WXT%200.21.4-purple.svg)](https://wxt.dev/)

ContextLion is an open-source browser extension built for developers, researchers, and AI practitioners. It extracts articles, technical documentation, and long-form web content with high fidelity, strips away navigation, ads, cookie banners, and page clutter, and converts the clean body into structured Markdown ready to paste directly into ChatGPT, Claude, Gemini, or Codex.

```text
Web Article → ContextLion → Clean Markdown → ChatGPT / Claude / Gemini / Codex
```

---

## ✨ Features (v0.1.0 MVP)

- **Smart Content Extraction**: Powered by Mozilla Readability on a cloned DOM tree (`document.cloneNode(true)`) to safely extract main article content without disturbing page runtime.
- **Noise & Clutter Removal**: Aggressively strips scripts, stylesheets, tracking beacons, navigation headers, footers, and advertisement widgets.
- **High-Fidelity Markdown Transformation**:
  - Preserves headings, blockquotes, ordered/unordered lists, and links.
  - Retains syntax language tags on fenced code blocks (`pre > code.language-*`).
  - Converts tables to GitHub Flavored Markdown (GFM) tables.
- **Token Estimation Heuristics**: CJK-aware token estimator (~1.2 tokens/char for CJK, ~4 chars/token for Latin text) displayed alongside word and character counts.
- **Multiple Export Options**:
  - **Copy AI Context**: Includes rich YAML-like metadata header (Title, Source URL, Author, Published Date, Captured Timestamp).
  - **Copy Markdown**: Raw converted Markdown text.
  - **Copy Plain Text**: Clean stripped plain text.
  - **Download .md / .txt**: Directly downloads files in your browser.
- **Local-First & Zero Telemetry**: 100% of processing happens in your browser. No remote servers, no analytics, no external APIs.

---

## 📐 Popup UI

Designed with a clean, dark-mode-first aesthetic fitted within a standard 380px popup:

```text
┌──────────────────────────────────────┐
│ 🦁 ContextLion                [v0.1] │
│                                      │
│ CURRENT PAGE                         │
│ WXT Documentation                    │
│ https://wxt.dev                      │
│ By WXT Team • 2026-09-04             │
│                                      │
│ ┌─────────────────┬────────────────┐ │
│ │ Words: 3,241    │ Tokens: ~4,300 │ │
│ └─────────────────┴────────────────┘ │
│                                      │
│ [ ✨ Copy AI Context               ] │
│ [ 📋 Copy Markdown                 ] │
│                                      │
│ [Plain Text]        [.md]     [.txt] │
│                                      │
│ > Preview Content                    │
│ > Extraction Settings                │
│                                      │
│ Local-first • No remote tracking     │
└──────────────────────────────────────┘
```

---

## 🔒 Permissions & Security

ContextLion strictly follows the **Principle of Least Privilege** and Chrome Web Store's Single Purpose Policy. It requires only:

| Permission  | Justification                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| `activeTab` | Grants temporary access to the current tab only when you explicitly open the popup. No background snooping. |
| `scripting` | Allows programmatic injection of the extractor script into the active tab upon user request.                |
| `storage`   | Stores user interface preferences locally via `chrome.storage.sync`.                                        |

> **No `<all_urls>` permission requested.** ContextLion cannot read pages in the background without explicit user interaction.

Read our complete [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md) policies for details.

---

## 🏗️ Architecture

```text
Popup (User opens popup)
   ↓ chrome.scripting.executeScript (activeTab gesture)
Extractor Script (injected into active tab)
   ↓ DOM Extractor (document.cloneNode(true))
   ↓ Content Cleaner (scripts, ads, nav, footer removed)
   ↓ Readability Parser
   ↓ Returns RawExtraction { metadata, contentHtml, textContent }
Popup
   ↓ TurndownService + turndown-plugin-gfm
   ↓ Token Estimator (CJK + Latin heuristics)
   ↓ Clipboard API & File Blob Download
```

- **Clean Boundary**: The DOM extraction and cleaning run in the tab environment, but Markdown transformation, token estimation, and file exporting happen in the popup.
- **Service Worker Compatibility**: Chrome MV3 service workers lack `URL.createObjectURL`. All downloads and clipboard writes take place in the popup DOM context.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20+)
- [pnpm](https://pnpm.io/) (version 9+)

### Installation

```bash
# Clone repository
git clone https://github.com/malilion/context-lion.git
cd context-lion

# Install dependencies
pnpm install
```

### Development

```bash
# Start development with Hot Module Reloading in Chrome
pnpm dev

# Start development in Firefox
pnpm dev:firefox
```

Load the unpacked extension from `.output/chrome-mv3` in `chrome://extensions` (turn on **Developer mode**).

### Building for Production

```bash
# Build Chrome MV3 bundle
pnpm build

# Build Firefox MV3 bundle
pnpm build:firefox

# Create distributable zip archives
pnpm zip
pnpm zip:firefox
```

---

## 🧪 Testing

```bash
# Run unit tests (Vitest)
pnpm test

# Run type check
pnpm compile

# Run linter & formatter checks
pnpm lint
pnpm format -- --check

# Run Playwright E2E tests (persistent Chromium context)
pnpm test:e2e
```

---

## 🗺️ Roadmap

- **v0.1.0 (MVP)**: Active tab extraction, Markdown transformation, AI context formatting, local download and copy.
- **v0.2.0 (V1)**: Element selection tool, selection snippet capture, prompt templates (Summarize, Code Review, Notes).
- **v1.0.0 (V2)**: Context Pack — multi-tab batch extraction with URL normalization and deduplication.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

ContextLion is open-source software licensed under the [MIT License](LICENSE).
Part of the **Malilion Browser Tools** ecosystem.
