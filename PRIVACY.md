# Privacy Policy for ContextLion

Last Updated: September 4, 2026

ContextLion is built by Malilion Browser Tools with an uncompromising privacy-first philosophy. We believe your reading habits, webpage content, and AI interactions belong strictly to you.

---

## 1. Zero Telemetry & No Remote Data Collection

- **No Remote Servers**: ContextLion does not operate any backend servers, analytics endpoints, or remote logging services.
- **No Third-Party Analytics**: We do not include Google Analytics, Sentry, Mixpanel, or any other telemetry libraries.
- **100% Local Processing**: All webpage content extraction, DOM sanitization, HTML-to-Markdown conversion, and token estimations occur strictly within your local browser runtime.
- **No Data Sale**: We do not collect, monetize, transmit, or sell user data or web traffic under any circumstances.

---

## 2. Permission Justifications

ContextLion adheres strictly to the Principle of Least Privilege and Chrome Web Store Single Purpose Policy. We request only the permissions strictly necessary to convert the active webpage into structured Markdown:

| Permission  | Purpose & Scope                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTab` | Grants temporary access to the active webpage **only when you explicitly open the extension popup**. It does not run continuously in the background and cannot observe your browsing history or other tabs. |
| `scripting` | Enables ContextLion to inject the local content extractor script into the active tab to read page content when requested.                                                                                   |
| `storage`   | Uses `chrome.storage.sync` strictly to persist your local user preferences (such as theme and export options).                                                                                              |

> [!NOTE]
> ContextLion **does not** request broad host permissions (e.g. `<all_urls>`) or permanent `tabs` access in the MVP release.

---

## 3. Data Storage & Clipboard

- **Temporary Memory**: Extracted content is held only in transient memory within the popup session. Closing the popup clears this temporary memory.
- **Clipboard Access**: Copying AI Context or Markdown occurs directly in response to your explicit button clicks (`Copy AI Context`, `Copy Markdown`, `Copy Plain Text`).
- **File Downloads**: Files downloaded (`.md`, `.txt`) are written directly to your browser's default download folder using standard browser Blob APIs.

---

## 4. Contact & Security Inquiries

If you have questions regarding this privacy policy or wish to report a security vulnerability, please consult our [SECURITY.md](SECURITY.md) or open an issue on the GitHub repository:

- GitHub Repository: [malilion/context-lion](https://github.com/malilion/context-lion)
- Maintainer: Malilion Browser Tools Team
