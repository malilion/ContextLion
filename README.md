# ContextLion 🦁

<p align="center">
  <img src="public/logo-full.png" alt="ContextLion Logo" width="220" />
</p>

<p align="center">
  <strong>Turn any webpage into clean, structured, AI-ready GFM Markdown context in one click!</strong><br />
  Noise & ad elimination • CJK-aware LLM token estimation • Built-in prompt presets • 100% local-first & zero telemetry
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-TW.md">繁體中文</a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-amber.svg" alt="MIT License" /></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Manifest-V3-blue.svg" alt="Manifest V3" /></a>
  <a href="https://wxt.dev/"><img src="https://img.shields.io/badge/Framework-WXT%200.21.4-purple.svg" alt="WXT Framework" /></a>
  <img src="https://img.shields.io/badge/Privacy-100%25%20Local--First-emerald.svg" alt="100% Local-First" />
  <img src="https://img.shields.io/badge/Telemetry-Zero%20Tracking-green.svg" alt="Zero Telemetry" />
</p>

<p align="center">
  <img src="assets/store/marquee-promo-1400x560.png" alt="ContextLion Banner" width="100%" />
</p>

---

## 🤔 Why ContextLion?

When using **Claude, ChatGPT, Gemini, DeepSeek**, or **Cursor**, developers and researchers frequently feed web pages, API docs, and articles to LLMs as context.

| ❌ The Pain of Manual Copy-Pasting | ✅ The Seamless ContextLion Experience |
| :--- | :--- |
| Loaded with **cookie popups, banner ads, navigation bars, and footers** | **Surgically extracts core content** and removes all clutter automatically |
| Heavy Base64-encoded images eat up tens of thousands of tokens | **Strips Base64 data URLs**, protecting your context window and token budget |
| Clutter triggers the "Lost in the Middle" syndrome, degrading LLM output | **Clean GitHub Flavored Markdown (GFM)** with normalized heading hierarchy |
| Repeatedly typing "Please summarize this..." for every prompt | **Built-in Prompt Presets** (TL;DR, Key Takeaways, Code Specs, Translation) |
| Guessing token size and risking context overflow errors | **CJK-Aware Token Estimator** showing real-time token and size metrics |

```text
Web Article / Documentation ➔ ContextLion Auto-Cleaner ➔ Pristine Markdown + AI Prompt ➔ Ready for Claude / ChatGPT
```

---

## ⚡ 30-Second Quick Start

1. **Browse Any Webpage**: Open any technical documentation, news article, or blog post in Chrome.
2. **Click ContextLion 🦁**: Click the extension icon in the toolbar. It instantly extracts and cleans the content into Markdown.
3. **Copy & Prompt**: Click **"✨ Copy AI Context"** (or choose a prompt preset), then paste directly into Claude, ChatGPT, or Gemini!

---

## 📸 Key Features & Visual Walkthrough

### 1. ⚡ One-Click Web-to-Markdown Context
Converts the active webpage into structured GitHub Flavored Markdown, preserving code blocks with language tags, tables, and blockquotes while showing real-time token metrics.

![One-Click Web-to-Markdown Context](assets/store/screenshots/screenshot-1-overview.png)

---

### 2. ✨ Built-in AI Prompt Presets
Wrap your context with proven, high-performing prompts without re-typing instructions:
- ⚡ **Executive Summary (TL;DR)**: Concise overview with critical takeaways.
- 🎯 **Key Action Items**: Extract actionable decisions and to-do lists.
- 👶 **Explain Like I'm 5 (ELIF)**: Demystify complex jargon into simple terms.
- 🌐 **Translation**: Polished translation into Traditional Chinese and other languages.
- 💻 **Code & API Extraction**: Isolate interfaces, endpoints, and schemas.
- ➕ **Custom Prompts**: Create, edit, and organize your own reusable prompt templates.

![Built-in AI Prompt Presets](assets/store/screenshots/screenshot-2-presets.png)

---

### 3. 🎯 Precision Visual Element Picker
Only need a specific benchmark table, code snippet, or forum response?
Activate the visual picker, hover over any element to see the golden highlight box, and click to extract only that section—completely bypassing the rest of the page!

![Precision Visual Element Picker](assets/store/screenshots/screenshot-3-picker.png)

---

### 4. 📦 Multi-Tab Context Pack & Batch ZIP Export
Deep research often spans dozens of open tabs. ContextLion groups open tabs by domain:
- **Aggregated Token Counter**: Check your selected tabs and view combined token counts in real time.
- **Combined Context Copy**: Merge multiple articles into a single, cohesive AI prompt context.
- **Structured ZIP Export**: Client-side ZIP archive generation containing `README.md`, `all-sources-combined.md`, and individual source files.

![Multi-Tab Context Pack & Batch ZIP Export](assets/store/screenshots/screenshot-4-pack.png)

---

### 5. 🔒 100% Local-First & Rich Settings
- **100% Client-Side**: All DOM parsing, Markdown transformation, and token counting occur entirely inside your browser.
- **Zero Telemetry**: No backend servers, no analytics, no external APIs.
- **Rich Customization**: Heading level auto-normalization, Base64 image stripping, URL tracking parameter sanitization (`utm_*`, `fbclid`), and token ratio tuning.

![100% Local-First & Rich Settings](assets/store/screenshots/screenshot-5-options.png)

---

## 🤖 Supported AI Ecosystem

- **Frontier LLMs**: Claude 3.5 Sonnet / Opus, ChatGPT (GPT-4o / o1 / o3), Google Gemini 1.5 / 2.0 Pro, DeepSeek V3 / R1
- **AI Code Editors**: Cursor, GitHub Copilot, Windsurf
- **Note-Taking & PKM**: Obsidian, Notion, Logseq, NotebookLM

---

## 🔒 Permissions & Privacy Guarantee

ContextLion strictly follows the **Principle of Least Privilege**:

| Permission | Purpose |
| :--- | :--- |
| `activeTab` | Grants access to the active webpage **only upon explicit user interaction**. Never runs in the background. |
| `scripting` | Injects the local content extractor script into the active page upon user request. |
| `storage` | Stores preferences and local history records directly on your computer. |
| `unlimitedStorage` | Ensures your local history is preserved without being pruned by default 5MB browser quotas. |
| `tabs` | Used solely during "Context Pack" multi-tab bundling to read open tab titles and URLs. |

> 🛡️ **No `<all_urls>` permission requested.** ContextLion cannot read pages without your explicit permission. See [PRIVACY.md](PRIVACY.md).

---

## 🏗️ Technical Architecture

```text
Browser Tab (Active Webpage)
   │
   ▼ [User Gesture]
DOM Extractor (document.cloneNode Safe Sandbox)
   │
   ▼
Content Cleaner (Purges scripts, styles, ads, navbars, and footers)
   │
   ▼
Mozilla Readability (Extracts main semantic article structure)
   │
   ▼
Turndown + GFM Plugin (Converts to GitHub Flavored Markdown)
   │
   ▼
Token Estimator (CJK + Latin Heuristics) + Prompt Presets Formatter
   │
   ▼
One-Click Copy (Clipboard API) or Local File Download (.md / .zip)
```

---

## 🚀 Developer Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v9+)

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/malilion/context-lion.git
cd context-lion

# Install dependencies
pnpm install

# Start Chrome development mode with Hot Module Reloading (HMR)
pnpm dev
```

In Google Chrome, navigate to `chrome://extensions`:
1. Toggle on **"Developer mode"** in the top-right corner.
2. Click **"Load unpacked"** in the top-left corner.
3. Select the `.output/chrome-mv3` folder to test the extension!

### Build & Package for Release

```bash
# Type check with vue-tsc
pnpm compile

# Run Vitest test suite (63/63 passing)
pnpm test

# Run code style & lint checks
pnpm lint

# Build & package production ZIP for Chrome Web Store
pnpm build && pnpm zip
# Output artifact: .output/context-lion-1.0.0-chrome.zip
```

---

## 📄 License

Distributed under the [MIT License](LICENSE).
Crafted with pride by the **Malilion Browser Tools** team.
