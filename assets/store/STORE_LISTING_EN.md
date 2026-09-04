# ContextLion - Chrome Web Store Listing Guide (English)

This document contains all the copy, field character counts, detailed descriptions, and privacy declarations required when submitting ContextLion to the **Chrome Web Store Developer Dashboard** in English.

---

## 1. Store Listing Information

### Extension Name

```text
ContextLion - Web to AI Context & Markdown
```

---

### Summary / Short Description

> ⚠️ **Google Enforcement**: Strictly limited to a maximum of **132 characters**.

```text
Turn any webpage into clean, AI-ready Markdown. Strip ads, estimate LLM tokens, and export with zero telemetry. 100% local-first.
```

_(Exact length: 121 characters — 100% compliant)_

---

### Detailed Description

> Maximum 16,000 characters. Supports line breaks, emojis, and bullet points. Copy and paste directly:

```text
🦁 ContextLion: Turn any webpage into clean, structured AI context and GitHub Flavored Markdown in one click!

When copying content from websites into ChatGPT, Claude, Gemini, or DeepSeek, raw web pages are loaded with cluttered navigation menus, banner ads, cookie popups, and sidebar links. This bloat squanders your LLM's precious context window, wastes tokens, and triggers the "Lost in the Middle" phenomenon, degrading AI response accuracy.

ContextLion is built specifically for AI-augmented workflows. Operating with an uncompromising 100% Local-First architecture, it surgically extracts core article content, eliminates all noise, generates elegant GitHub Flavored Markdown, and estimates CJK & Latin token consumption in real time!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ One-Click AI-Optimized Context
• Intelligent Article Extraction: Powered by the industry-standard Mozilla Readability algorithm to capture the article body, title, author, and publication timestamp.
• Noise Elimination: Automatically purges banner ads, sticky headers, related articles, sidebars, and tracking widgets.
• Image Bloat Protection: Strips heavy Base64 Data URL images automatically, preventing a single embedded image from devouring tens of thousands of tokens.

✨ Built-in AI Prompt Presets
• Wrap extracted context into proven, production-grade prompt templates ready to paste into any LLM:
  - ⚡ Executive Summary (TL;DR)
  - 🎯 Key Action Items & Strategic Takeaways
  - 👶 Explain Like I'm 5 (ELIF)
  - 🌐 Professional Translation (Traditional Chinese / Multi-language)
  - 💻 Code Architecture & API Schema Extraction
• Custom Prompt Builder: Add, edit, and organize your own reusable prompt presets.

🎯 Surgical Element Picker
• Need just a specific table, benchmark, or code snippet? Activate the interactive visual picker. Hover over any DOM section and click to capture only that element as pristine Markdown—completely bypassing the rest of the page.

📦 Multi-Tab Context Pack & Batch ZIP Export
• Power research made simple: Select multiple open research tabs across various domains.
• Aggregated Token Counter: View real-time combined token counts across all selected tabs.
• Export Flexibility: Copy as a single unified AI prompt context, or download as a structured ZIP archive (.zip) containing individual Markdown files.

🌐 CJK-Aware Token Estimation
• Accurately counts tokens for mixed Chinese, Japanese, Korean, and Latin content using tuned byte-pair and character heuristics.
• Optimized ratios calibrated for Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro.

🔒 100% Local-First & Zero Telemetry
• No Remote Backend: All DOM sanitization, HTML-to-Markdown transformations, and token math happen entirely within your local browser runtime.
• Zero Analytics: No Google Analytics, no Sentry, no Mixpanel, and zero telemetry beacons.
• Your reading habits, URLs, and research data never leave your device!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⌨️ QUICK ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Click Icon: Open ContextLion popup drawer
• Quick Copy: Click "✨ Copy AI Context" to load clean context into your clipboard
• Direct Download: Save extracted content directly as a `.md` file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ PERMISSIONS & PRIVACY PROMISE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ContextLion strictly follows the Principle of Least Privilege:
• activeTab / scripting: Only reads DOM content when you explicitly click the extension or launch the element picker.
• storage / unlimitedStorage: Stores your preferences and local history solely on your computer.
• tabs: Only reads window tab titles during multi-tab Context Pack selection.

Transform web research into high-octane fuel for your AI assistant—install ContextLion today!
```

---

### Category

- **Primary Category**: Select `Productivity` or `Workflow & Planning`

---

## 2. Privacy Practices

> ⚠️ **Crucial for Google Store Reviewers**: Accurate answers here prevent review delays and rejections.

### 1. Single Purpose Description

**Question: Please describe the single purpose of your extension:**

```text
ContextLion's single purpose is to convert active webpage content or user-selected DOM elements into clean, structured Markdown and AI-ready context completely locally within the user's browser.
```

---

### 2. Permission Justifications

Provide the exact justification for each declared permission in `manifest.json`:

| Permission             | Justification (Copy & Paste)                                                                                                                                                                |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`activeTab`**        | Used to access the DOM content of the currently active tab when the user explicitly clicks the extension icon or activates the element picker, converting article text into clean Markdown. |
| **`scripting`**        | Used to inject the client-side content parser (Mozilla Readability and DOM sanitizer) into the active page upon user request to extract main article text.                                  |
| **`storage`**          | Used to save user preferences (theme, Markdown format toggles, custom prompt presets) and local extraction history records directly on the user's device.                                   |
| **`unlimitedStorage`** | Used to ensure locally stored context history records are preserved without hitting the browser's default 5MB quota limit.                                                                  |
| **`tabs`**             | Used by the 'Context Pack' feature to query tab titles and URLs in the current window when the user actively chooses to bundle multiple research articles together.                         |

---

### 3. Data Usage Questionnaire

- **Question: Do you collect or process user data?**
  👉 Select **`No`** (ContextLion does not collect, store, or transmit personally identifiable information, browsing history, or analytics).
- **Compliance Certifications (Check all 3 boxes ✅):**
  1. ✅ _I confirm that I do not sell or transfer user data to third parties._
  2. ✅ _I confirm that I do not use or transfer user data for purposes unrelated to the item's single purpose._
  3. ✅ _I confirm that I do not use or transfer user data to determine creditworthiness or for lending purposes._

---

### 4. Privacy Policy URL

```text
https://github.com/malilion/ContextLion/blob/main/PRIVACY.md
```

---

## 3. Distribution & Visibility

- **Visibility**:
  - `Public`: Anyone can discover and install via Chrome Web Store search.
  - `Unlisted`: Only users with the direct store link can install (useful for private beta testing).
- **Pricing**: `Free`
- **Support URL**: Your GitHub repository URL or Issues tracker.
