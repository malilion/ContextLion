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

| Permission  | Purpose & Scope                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTab` | Grants temporary access to the active webpage **only when you explicitly open the extension popup**. It does not run continuously in the background.                                                      |
| `tabs`      | Allows ContextLion to query tab titles and URLs in your current window to display domain groupings and perform multi-tab Context Pack extraction upon user request. Zero browsing history is transmitted. |
| `scripting` | Enables ContextLion to inject the local content extractor script into selected tabs to extract clean content when requested.                                                                              |
| `storage`   | Uses `chrome.storage.sync` for user preferences and `chrome.storage.local` to store your local Context History records completely on your device.                                                         |

> [!NOTE]
> ContextLion **does not** request `<all_urls>` host permissions and never transmits your tab URLs or content to any remote server. Everything is processed and stored 100% locally.

---

## 3. Data Storage & Clipboard

- **Local Storage**: Context history and preferences are saved locally on your computer via standard Chrome extension storage APIs. You can clear history at any time from the popup drawer or Options page.
- **Clipboard Access**: Copying AI Context, Markdown, or Context Packs occurs strictly in response to your explicit button clicks.
- **File & ZIP Downloads**: Files downloaded (`.md`, `.txt`, `.zip`) are generated in-memory via client-side Blob APIs and saved to your default download folder.

---

## 4. Contact & Security Inquiries

If you have questions regarding this privacy policy or wish to report a security vulnerability, please consult our [SECURITY.md](SECURITY.md) or open an issue on the GitHub repository:

- GitHub Repository: [malilion/context-lion](https://github.com/malilion/context-lion)
- Maintainer: Malilion Browser Tools Team
