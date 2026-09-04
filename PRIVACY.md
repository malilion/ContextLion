# Privacy Policy for ContextLion 🦁

**Effective Date:** September 5, 2026  
**Last Updated:** September 5, 2026  
**Open Source Repository:** [https://github.com/malilion/ContextLion](https://github.com/malilion/ContextLion)  
**Maintainer:** Malilion Browser Tools Team ([malilion.dev@gmail.com](mailto:malilion.dev@gmail.com))

[English](#english) | [繁體中文](#繁體中文)

---

<a name="english"></a>

## English Version

### 1. Overview & Privacy-First Philosophy

ContextLion is an open-source browser extension developed by Malilion Browser Tools. We are firmly committed to protecting user privacy. ContextLion operates under an uncompromising **100% Local-First (Client-Side)** architecture.

We believe that your browsing history, reading habits, web content, and AI prompts belong exclusively to you. **ContextLion does not collect, track, transmit, monetize, or sell any user data.**

---

### 2. Zero Telemetry & No Remote Data Transmission

- **No External Servers:** ContextLion operates without any backend servers, remote databases, or cloud processing pipelines.
- **No Third-Party Analytics:** We do not embed Google Analytics, Sentry, Mixpanel, telemetry beacons, or advertising trackers.
- **Client-Side Processing:** All web content extraction (via Mozilla Readability), DOM cleaning, HTML-to-Markdown conversion, and token estimations take place exclusively inside your local browser memory.
- **Zero Data Sale:** We do not sell, license, rent, or transfer user information or web traffic to data brokers, advertising networks, or third parties under any circumstances.

---

### 3. Permission Declarations & Single Purpose

ContextLion complies strictly with the **Chrome Web Store Single Purpose Policy** and the **Principle of Least Privilege**. Every requested permission is directly required to deliver its core functionality: converting web content into clean Markdown:

| Permission             | Purpose & Scope                                                                                                                                                                                                             |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`activeTab`**        | Grants temporary, read-only access to the currently active webpage **only when you explicitly click the ContextLion toolbar icon or activate the Element Picker**. It never monitors or accesses pages in the background.   |
| **`scripting`**        | Allows ContextLion to inject its local content extraction and cleaning script (`extractor.ts`) into the active tab upon your explicit request to parse the article body.                                                    |
| **`storage`**          | Enables saving your personal extension preferences (such as theme, formatting options, and custom prompt templates) via `chrome.storage.sync` and local context history via `chrome.storage.local`.                         |
| **`unlimitedStorage`** | Ensures that locally saved context history and favorite records on your computer do not hit the default 5MB browser quota, preventing data loss or storage exceptions.                                                      |
| **`tabs`**             | Used exclusively for the "Context Pack" multi-tab bundling feature. When explicitly triggered by the user, it queries the tab titles and URLs in the current window so you can select and merge multiple research articles. |

> 🛡️ **No Broad Host Permissions (`<all_urls>`):** ContextLion never requests broad access to all websites. Without your explicit click, the extension cannot inspect or read any webpage.

---

### 4. Data Storage & User Control

- **Local Storage Only:** Context history, favorite records, and preferences are stored exclusively on your device using Chrome's native storage API.
- **Data Deletion:** You have complete control over your data. You can selectively delete individual history items or click "Clear All History" at any time from the extension popup drawer or the Options page. Uninstalling the extension immediately removes all locally stored data.
- **Clipboard Access:** Text copied to your clipboard (such as AI context or Markdown) occurs strictly in response to your explicit button clicks ("Copy AI Context", "Copy Raw MD").
- **File Downloads:** Downloaded `.md` and `.zip` archives are created in-memory using client-side Blob APIs and saved to your default download directory. No data is sent to external servers.

---

### 5. Compliance with Chrome Web Store Policies

ContextLion guarantees compliance with the **Google Chrome Web Store Developer Program Policies**:

1. We do not sell or transfer user data to third parties outside the approved use cases.
2. We do not use or transfer user data for purposes unrelated to the extension's single purpose.
3. We do not use or transfer user data to determine creditworthiness or for lending purposes.

---

### 6. Contact & Inquiries

If you have questions about this Privacy Policy or wish to inspect the source code, please visit our open-source GitHub repository:

- **Repository:** [https://github.com/malilion/ContextLion](https://github.com/malilion/ContextLion)
- **Issues & Support:** [https://github.com/malilion/ContextLion/issues](https://github.com/malilion/ContextLion/issues)
- **Email Contact:** [malilion.dev@gmail.com](mailto:malilion.dev@gmail.com)

---

<a name="繁體中文"></a>

## 繁體中文版

### 1. 隱私權首要原則

ContextLion 是由 Malilion Browser Tools 團隊打造的開源瀏覽器擴充功能。我們堅持 **100% 本地優先（Local-First）** 的隱私核心哲學。

我們深信，您的瀏覽習慣、閱讀內容與 AI 提示詞完全屬於您個人。**ContextLion 絕不收集、絕不追蹤、絕不上傳、絕不轉移，更絕不販售任何使用者資料。**

---

### 2. 零遙測與零遠端傳輸

- **無遠端伺服器**：ContextLion 完全沒有架設後端伺服器、雲端資料庫或遠端 API。
- **無第三方追蹤代碼**：本專案未埋設 Google Analytics、Sentry、Mixpanel 或任何第三方廣告/行為追蹤程式庫。
- **全本機運算**：所有網頁 DOM 清洗（Mozilla Readability）、雜訊過濾、HTML 轉 Markdown 以及 Token 數估算，全數在您電腦的瀏覽器記憶體中執行。
- **絕不販售資料**：我們在任何情況下皆不收集、商業化、販售或轉讓使用者瀏覽內容與流量。

---

### 3. 權限宣告與使用理由

ContextLion 嚴格遵循 Chrome 應用程式商店的**「單一用途原則 (Single Purpose)」**與**「最小權限原則 (Least Privilege)」**，僅索取執行核心功能所必備的權限：

| 權限項目               | 用途說明與範圍                                                                                                               |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **`activeTab`**        | 僅在您**主動點擊擴充功能圖示或啟動元素選取器**時，暫時取得當前作用中分頁的讀取權限以擷取文章內容，絕不在背景常駐監視。       |
| **`scripting`**        | 僅在您要求擷取時，將本機的純文字與 DOM 清理腳本注入當前頁面以提取內文結構。                                                  |
| **`storage`**          | 透過 `chrome.storage.sync` 於本機儲存您的外觀主題、格式設定與自訂 Prompt，透過 `chrome.storage.local` 儲存本機歷史擷取紀錄。 |
| **`unlimitedStorage`** | 確保您儲存在本機電腦上的歷史紀錄與星號收藏不會因超過瀏覽器預設的 5MB 配額上限而發生異常或資料遺失。                          |
| **`tabs`**             | 僅用於「Context Pack 多分頁打包」功能。在您主動點選時列出當前視窗的分頁標題與網址，供您自主勾選打包多篇研究文章。            |

> 🛡️ **絕不索取 `<all_urls>` 全網域權限**：在未經您主動點擊觸發前，ContextLion 無法且永遠不會讀取任何網頁。

---

### 4. 資料儲存與使用者控制權

- **完全儲存於本機**：所有歷史紀錄、收藏與設定均存放於您裝置的瀏覽器本地儲存區。
- **隨時自主刪除**：您可隨時在擴充功能面板或設定頁面點擊個別刪除或「清除全部歷史」。當您解除安裝擴充功能時，所有本地資料亦會一併自動清除。
- **剪貼簿操作**：複製 AI 脈絡或 Markdown 僅在您主動點擊「複製」按鈕時才會將內容寫入系統剪貼簿。
- **檔案下載**：匯出的 `.md` 與 `.zip` 壓縮檔皆由前端記憶體（Blob API）即時生成並儲存至您的預設下載資料夾，完全不經過任何外部雲端。

---

### 5. 遵守 Chrome 線上應用程式商店規範

ContextLion 恪守 Google 開發人員計畫政策：

1. 我們不會將使用者資料販售或轉移給任何第三方。
2. 我們不會將使用者資料用於與單一用途無關之目的。
3. 我們不會將使用者資料用於信用評估或貸款發放。

---

### 6. 聯絡方式與專案首頁

若您對本隱私權政策有任何疑問，或欲審查原始碼，歡迎造訪 GitHub 開源倉庫：

- **官方開源儲存庫：** [https://github.com/malilion/ContextLion](https://github.com/malilion/ContextLion)
- **問題回報 (Issues)：** [https://github.com/malilion/ContextLion/issues](https://github.com/malilion/ContextLion/issues)
- **聯絡電子郵件：** [malilion.dev@gmail.com](mailto:malilion.dev@gmail.com)
