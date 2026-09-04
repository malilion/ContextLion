# ContextLion - Chrome 應用程式商店上架資料填寫指南 (Store Listing Guide)

本文件已為您準備好上架 **Chrome Web Store Developer Dashboard** 時所需填寫的所有中英文欄位、精簡字數限制、詳細介紹文案、權限理由與隱私權問卷選項，您可以直接「複製並貼上」至商店後台！

---

## 一、商品資訊 (Store Listing)

### 1. 擴充功能名稱 (Extension Name)
```text
ContextLion - 網頁轉 AI 脈絡與 Markdown (Web to AI Context)
```
*(英文版填寫：`ContextLion - Web to AI Context & Markdown`)*

---

### 2. 精簡說明 (Short Description / Summary)
> ⚠️ **注意**：Chrome 應用程式商店嚴格限制 **上限 132 個字元 (characters)**！

**繁體中文版 (71 字，符合限制)：**
```text
一鍵將任何網頁轉為乾淨的 Markdown 與 AI 脈絡！自動去廣告與雜訊、即時估算 Token，專為 Claude、ChatGPT 與 Gemini 打造。
```

**英文版 (121 字元，符合限制)：**
```text
Turn any webpage into clean, AI-ready Markdown. Strip ads, estimate LLM tokens, and export with zero telemetry. 100% local-first.
```

---

### 3. 詳細說明 (Detailed Description)
> 支援純文字與換行，上限 16,000 字元。請直接複製以下完整文案：

```text
🦁 ContextLion：將任何網頁一鍵轉換為乾淨、結構化的 AI 脈絡與 GFM Markdown！

在向 ChatGPT、Claude、Gemini 或 DeepSeek 提問時，直接複製網頁常常包含雜亂的導航列、廣告橫幅、頁尾連結與 Cookie 彈窗，不僅大量浪費 LLM 的 Context Window（上下文視窗）與 Token 費用，更可能導致「迷失在中間 (Lost in the Middle)」現象，降低 AI 回答品質。

ContextLion 是專為 AI 工作流設計的瀏覽器擴充功能。採用 100% 本地運算（Local-First），一鍵精準提取網頁核心內文，去除所有干擾元素，生成排版優雅的 GitHub Flavored Markdown，並即時計算中英文字元 Token 消耗！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 核心功能特色
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ 一鍵生成 AI 最佳化脈絡 (One-Click AI Context)
• 智慧文章提取：採用 Mozilla Readability 核心演算法，精準擷取文章本體、標題、作者與發布日期。
• 雜訊徹底淨化：自動移除廣告看板、導覽列、相關文章推薦、側邊欄與社群分享按鈕。
• 自動剝除肥大圖片：智慧過濾 Base64 Data URL 內嵌圖片，避免單張圖片吃掉數萬 Token。

✨ 內建 AI 提示詞模板 (Built-in Prompt Presets)
• 一鍵套用專業 Prompt 格式，複製後直接貼進 AI 對話框即可開始：
  - ⚡ 執行摘要 (TL;DR Executive Summary)
  - 🎯 核心重點與待辦事項 (Key Action Items & Takeaways)
  - 👶 深入淺出白話解釋 (Explain Like I'm 5)
  - 🌐 繁體中文在地化專業翻譯 (Traditional Chinese Translation)
  - 💻 程式碼與 API 規格提取 (Code & API Schema)
• 支援自訂 Prompt：可自由新增、修改與刪除您的常用 Prompt 模板。

🎯 外科手術式元素選取器 (Precision Element Picker)
• 遇到複雜網頁或只需要其中一部分？啟動視覺選取器，滑鼠移至任意區塊（如特定的比較表格、程式碼片段或社群貼文），點擊即可精確轉換該區塊為 Markdown，不受全頁面干擾！

📦 多分頁脈絡打包與批次匯出 (Multi-Tab Context Pack)
• 跨網頁研究利器：一次勾選瀏覽器中的多個研究分頁，自動聚合總 Token 數。
• 批次打包：支援一鍵複製為合併的單一 AI 脈絡，或匯出為包含結構化目錄的 ZIP 壓縮檔（.zip）。

🌐 智慧 CJK 語系感知 Token 估算 (Token Estimator)
• 針對繁體中文、簡體中文、日文、韓文與英文混合的特殊 Token 切割規則進行校準，比一般純英文估算精準數倍。
• 支援切換對齊 Claude 3.5、GPT-4o、Gemini 1.5 等主流模型比例。

🔒 100% 本地處理與零隱私追蹤 (Zero Telemetry & 100% Local)
• 無後端伺服器：所有 DOM 解析、Markdown 轉換與 Token 計算完全在您的本機瀏覽器內完成。
• 零遙測、零數據收集：絕無埋設 Google Analytics、Sentry 或任何第三方追蹤代碼。
• 您的網頁瀏覽紀錄與內容絕不離開您的電腦！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⌨️ 常用快捷操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 點擊圖示：開啟 ContextLion 彈出面板
• 快速複製：點擊「✨ 複製 AI 脈絡」立即將帶有來源標籤與格式的內容存入剪貼簿
• 匯出檔案：支援直接下載 `.md` 檔案

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ 隱私承諾與權限說明
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ContextLion 遵循最小權限原則（Principle of Least Privilege）：
• activeTab / scripting：僅在您點擊開啟擴充功能或啟動選取器時，於當前頁面提取純文字內容。
• storage / unlimitedStorage：用於在本機儲存您的個人設定與歷史紀錄，不傳輸至任何雲端。
• tabs：僅在您使用「多分頁打包」時讀取分頁標題，絕不監控或記錄瀏覽習慣。

讓網頁資料成為您 AI 助理的最佳養分——立即安裝 ContextLion，體驗極致純淨的 AI 閱讀與寫作工作流！
```

---

### 4. 類別 (Category)
- **主要類別**：選擇 `生產力工具` (Productivity) 或 `工作流程與規劃` (Workflow & Planning)

---

### 5. 官方素材檔案清單 (Assets Checklist)
上傳時請使用本專案已為您生成的檔案：

| 素材項目 | 建議上傳檔案 | 檔案路徑 |
| :--- | :--- | :--- |
| **商店圖示 (128x128)** | `icon-128.png` | `assets/store/icon-128.png` |
| **小宣傳圖磚 (440x280)** | `small-tile-440x280.png` | `assets/store/small-tile-440x280.png` |
| **大型宣傳橫幅 (1400x560)** | `marquee-promo-1400x560.png` | `assets/store/marquee-promo-1400x560.png` |
| **螢幕截圖 1** | `screenshot-1-overview.jpg` | `assets/store/screenshots/screenshot-1-overview.jpg` |
| **螢幕截圖 2** | `screenshot-2-presets.jpg` | `assets/store/screenshots/screenshot-2-presets.jpg` |
| **螢幕截圖 3** | `screenshot-3-picker.jpg` | `assets/store/screenshots/screenshot-3-picker.jpg` |
| **螢幕截圖 4** | `screenshot-4-pack.jpg` | `assets/store/screenshots/screenshot-4-pack.jpg` |
| **螢幕截圖 5** | `screenshot-5-options.jpg` | `assets/store/screenshots/screenshot-5-options.jpg` |

*(註：螢幕截圖已包含無 Alpha 透明層的 `.jpg` 與 `.png`，建議優先選取 `.jpg` 上傳避免任何格式問題)*

---

## 二、隱私權實務規範 (Privacy Practices)

> ⚠️ **Google 審查最常退件的項目**！請務必依照以下內容精準填寫：

### 1. 單一用途說明 (Single Purpose)
**問：請說明擴充功能的單一用途**
```text
ContextLion 的單一用途是將使用者主動瀏覽的網頁或特定選取區塊，在使用者本機端清洗去雜訊並轉換為結構化的 Markdown 格式與 AI 脈絡提示詞，供使用者複製至大型語言模型（LLM）中使用。
```
*(英文版備用：`ContextLion's single purpose is to convert active webpage content or selected DOM elements into clean, structured Markdown and AI-ready context completely locally within the user's browser.`)*

---

### 2. 權限使用理由 (Permission Justification)
後台會列出 `manifest.json` 中宣告的所有權限，並要求填寫理由：

| 權限名稱 | 請複製並貼上以下理由 |
| :--- | :--- |
| **`activeTab`** | 用於在使用者主動開啟擴充功能彈出面板或啟動元素選取器時，讀取當前作用中分頁的 DOM 內容以轉換為 Markdown。 |
| **`scripting`** | 用於在使用者觸發擷取時，將本機的純文字與 DOM 清理腳本注入至當前分頁中執行文章解析。 |
| **`storage`** | 用於在使用者裝置本機儲存使用者自訂的偏好設定（主題、Markdown 格式選項、自訂 Prompt）與本機歷史紀錄。 |
| **`unlimitedStorage`** | 用於確保使用者儲存的本地擷取歷史紀錄不會因為超出瀏覽器預設的 5MB 配額上限而遺失資料。 |
| **`tabs`** | 用於「多分頁 Context Pack 打包」功能，在使用者主動點擊時列出當前視窗的分頁標題與網址，供使用者自由勾選多篇文檔進行合併打包。 |

---

### 3. 資料使用情形問卷 (Data Usage)
- **問：您是否收集或使用任何個人資料？**
  👉 選擇 **「否 (No)」**（未收集任何個人識別資訊、健康資訊、金融資訊或身分憑證）。
- **三個合規聲明勾選方塊**（請全部打勾 ✅）：
  1. ✅ 我確認我不販售或轉讓使用者資料給任何第三方。
  2. ✅ 我確認我不將使用者資料用於與項目單一用途無關的目的。
  3. ✅ 我確認我不將使用者資料用於信用評估或貸款發放。

---

### 4. 隱私權政策網址 (Privacy Policy URL)
在後台填寫公開的 PRIVACY.md 網址，例如：
```text
https://github.com/malilion/context-lion/blob/main/PRIVACY.md
```
*(若尚未開源或有自己的網站，可填寫個人部落格或 GitHub gist 頁面)*

---

## 三、發布設定 (Distribution)

- **瀏覽權限 (Visibility)**：
  - `公開 (Public)`：任何人都可以在商店搜尋並安裝（正式上架選這個）。
  - `不公開 (Unlisted)`：只有擁有商店網址的人才能下載安裝（若想先給自己或特定好友測試可選這個）。
- **定價 (Pricing)**：
  - 選擇 `免費 (Free)`
- **支援網址 (Support URL)**：
  - 填寫您的 GitHub Repository 首頁或 Issues 網址。
