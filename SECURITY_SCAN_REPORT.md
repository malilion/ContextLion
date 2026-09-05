# 🛡️ ContextLion 資安掃描報告

- **掃描對象**：ContextLion — WXT + Vue 3 瀏覽器擴充功能（將網頁轉為 AI-ready context）
- **掃描日期**：2026-09-06
- **整體評級**：🟢 良好（Low Risk）

---

## 1. 攻擊面分析

此擴充功能的核心風險來自**處理不受信任的網頁內容**：

```
DOM 擷取 → 清理 (cleanDom) → DOMPurify 淨化 → 轉 Markdown (Turndown) → 顯示 / 匯出
```

主要威脅類別：

- **XSS**（跨站腳本）— 惡意網頁內容在擴充 UI 中執行
- **間接提示注入（Indirect Prompt Injection）**— 隱藏文字混入送給 AI 的 context
- **惡意 URL scheme**（`javascript:` / `data:`）

---

## 2. ✅ 既有防禦（做得好的地方）

| 防護項目                   | 實作位置                                                           | 說明                                                                                              |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| HTML 淨化                  | `extract-document.ts`, `extract-selection.ts`, `element-picker.ts` | 全面使用 DOMPurify allowlist（僅允許安全標籤/屬性）                                               |
| 事件處理器 / style 清除    | `clean-dom.ts`                                                     | 移除所有 `on*` 屬性與 inline `style`（含 root 元素）                                              |
| 隱藏元素清除（反提示注入） | `clean-dom.ts`                                                     | 移除 `display:none`、`visibility:hidden`、`font-size:0`、`opacity:0`、`[hidden]`、`[aria-hidden]` |
| URL scheme 淨化            | `extract-metadata.ts`                                              | `sanitizeHttpUrl()` 僅允許 `http:`/`https:`                                                       |
| 訊息來源驗證               | `extractor.ts`                                                     | 驗證 `sender.id === chrome.runtime.id`                                                            |
| 安全渲染                   | `CodeBlock.vue`                                                    | 使用 `{{ content }}` 文字插值（自動轉義），無 `v-html`                                            |
| 最小權限                   | `wxt.config.ts`                                                    | 僅 `activeTab`（非 `<all_urls>`）、`scripting`、`storage`、`tabs`                                 |
| 受限 scheme 注入           | `client.ts`                                                        | `isExtractableUrl()` 擋掉 `chrome:`、`data:`、`javascript:`、Web Store                            |

**依賴套件版本（無已知 CVE）**：`dompurify@3.4.14`、`@mozilla/readability@0.6.0`、`turndown@7.2.4`

程式碼中**無** `eval` / `Function()` / `document.write` / `v-html` / `innerHTML`（生產程式碼）等危險 sink。

---

## 3. ⚠️ 發現的問題與修補狀態

### 🟡 VULN-04（中低風險）— 未轉義的 fallback 文字插值 ✅ 已修補

`extract-selection.ts` 與 `element-picker.ts` 中：

```ts
// 修補前
contentHtml: sanitizedHtml || `<p>${rawText}</p>`,
// 修補後
contentHtml: sanitizedHtml || `<p>${escapeHtml(rawText)}</p>`,
```

當 DOMPurify 回傳空字串時，`rawText` 原本被直接插入 HTML 字串而未轉義。雖然當前下游渲染路徑（`CodeBlock` 文字插值、Turndown）不會觸發 XSS，但屬不良習慣——若未來以 `v-html`/`innerHTML` 渲染 `contentHtml` 即成 XSS。

**修補**：新增 `escapeHtml()` helper，對 fallback 的 `rawText` 進行 HTML entity 編碼。`textContent` 欄位維持原始未轉義內容（供 AI/Markdown 消費）。

### 🔵 強化建議 — 明確 CSP ✅ 已補上

`wxt.config.ts` 新增嚴格的 MV3 CSP 作為縱深防禦：

```ts
content_security_policy: {
  extension_pages: "script-src 'self'; object-src 'self'; base-uri 'self'; frame-ancestors 'none'",
},
```

### 🔵 低風險 — JSON-LD 解析（維持現狀）

`extract-metadata.ts` 對頁面 `application/ld+json` 做 `JSON.parse`，已包在 try/catch，僅取字串欄位，風險低。

---

## 4. 🧪 新增資安測試

於 `tests/unit/security.test.ts` 新增 **VULN-04 / Unescaped Fallback Interpolation** 測試群組：

- ✅ 驗證 DOMPurify 回傳空字串時，fallback `<p>` 中的 `rawText` 被 HTML 轉義（`<img`、`onerror=` 不殘留；`&lt;`、`&amp;`、`&quot;` 正確編碼）
- ✅ 驗證 `textContent` 保留原始未轉義內容供下游消費
- ✅ 驗證純文字選取不會被雙重轉義或損壞

> 註：本次於受限沙箱環境無法直接執行 `pnpm vitest`（無檔案系統執行權限）。請於本機執行 `pnpm test` 驗證全部測試通過。

---

## 5. 結論

ContextLion 的資安基礎相當扎實——DOMPurify allowlist、隱藏元素清除、URL scheme 淨化、訊息來源驗證均到位，且已有對應資安測試。本次掃描**未發現立即可利用的高風險漏洞**；所有處置均為強化性修補：

1. ✅ 修補未轉義 fallback 插值（`extract-selection.ts`、`element-picker.ts`）
2. ✅ 補上明確 MV3 CSP（`wxt.config.ts`）
3. ✅ 新增對應資安單元測試（`tests/unit/security.test.ts`）

**建議後續**：於本機跑 `pnpm test` 與 `pnpm lint` 驗證，並定期執行 `pnpm audit` 追蹤依賴 CVE。
