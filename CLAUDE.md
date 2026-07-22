# JP-situations 專案規範

日文情境學習工具集，採共用引擎架構，靜態網站託管於 GitHub Pages
（`jp-study-list.github.io/JP-situations/`）。介面語言為台灣繁體中文。

---

## 檔案結構

所有檔案平放在 repo 根目錄，沒有子資料夾。

| 檔案 | 說明 |
|------|------|
| `index.html` | hub 首頁：卡片入口、熱力圖、統計、收藏視窗、Firebase 同步 |
| `common.js` | 共用模組：收藏資料層、雲端同步、回首頁按鈕。以 ES module 載入 |
| `app.css` | 全部情境頁樣式。顏色一律 `var(--xxx)`，**不定義任何色值** |
| `app.js` | 共用引擎：注入頁面骨架 HTML ＋ 全部互動邏輯，讀取各頁的 `PAGE_CONFIG` |
| `<情境>.html` | 各情境頁。**只含三樣東西**：配色區塊、四個資料區塊、`PAGE_CONFIG` |

`hotel.html` 是情境頁的標準範本，任何新增或修改都以它為結構基準。

---

## 鐵則

1. **不得修改 `app.js`、`app.css`、`common.js`**。這三個檔案影響全部情境頁。
   若需求必須動它們，先明確告知使用者會影響所有情境頁，取得同意後才動工。
2. 情境頁結構必須與 `hotel.html` 完全一致，不多不少：
   ```
   head：meta、title、Google Fonts、<link rel="stylesheet" href="./app.css">、<style> 配色 </style>
   body：
     <script>  四個資料區塊 ＋ PAGE_CONFIG  </script>
     <script src="./app.js"></script>
     <script type="module" src="./common.js"></script>
   ```
   載入順序不可調換：資料 → app.js → common.js。
3. **全檔禁止 emoji**（包含資料內容、註解、UI 文字）。
4. 檔名用英文或 romaji 小寫，可含連字號（如 `car-rental.html`）。
5. 不使用任何前端框架或建置工具。外部資源只有 Google Fonts 與 Firebase CDN。

---

## PAGE_CONFIG 規格

```js
const PAGE_CONFIG = {
  pageKey: "hotel",                                   // 必須等於檔名主體，全站唯一
  title: "商務飯店",                                   // 頂欄標題，2-5 字
  speakerLabels: { staff: "店員", customer: "客人" },  // 對話雙方稱呼，依情境調整
  defaultCat: "frontdesk",                            // 預設單字分類，須存在於 VOCAB_DATA
  defaultScene: "checkin",                            // 預設常用句場景，須存在於 PHRASE_DATA
  shapeLabels: { all: "全部" },                        // 無 shape 欄位時只留 all
};
```

- `pageKey` 是 localStorage 前綴（`{pageKey}-refZh`、`-autoSpeak`、`-showZh`）。
  **重複或誤植會導致不同情境的開關狀態互相覆蓋**，是最容易發生且最不易察覺的錯誤。
- `speakerLabels` 目前所有情境都是兩種說話者。若未來出現三種以上，
  需要修改 `app.js` 的說話者篩選邏輯，屬於鐵則 1 的範圍。

---

## 配色規格

情境頁的 `<style>` 只做兩件事：定義 `:root` 與 `html[data-theme="dark"]`。

**app.css / app.js 需要的 14 個變數，缺一不可**（少了會造成透明區塊或方角）：

```
--primary  --bg  --card  --card-alt  --line  --ink  --ink-soft  --muted
--accent-soft  --on-accent  --r-sm  --r-md  --r-lg  --r-pill
```

另建議一併定義 `--primary-deep`、`--secondary`、`--accent` 以維持與範本一致。

圓角固定值：`--r-sm:10px`、`--r-md:16px`、`--r-lg:22px`、`--r-pill:999px`。

**深色主題基底固定不變**：

```
--bg:#1C1B1A  --card:#262423  --card-alt:#302E2C  --line:#3F3D3A
--ink:#D9D5D0  --ink-soft:#A8A39C  --muted:#7A766F
```

主色為高彩度時（例如朱紅），深色模式須提供提亮版 `--primary`，
並覆寫 `--accent-soft`（改為暗色調）與 `--on-accent`（改為淺色）。

星號啟用色 `#C8A32C` 已寫死在 `app.css`，不隨主色改變，情境頁不需處理。

---

## 資料內容規格

四個資料區塊依序放在情境頁的第一個 `<script>` 內。

### VOCAB_DATA
4 個分類（key 英文小寫、label 中文 2-8 字），每類 10-14 個 `{ jp, kana, zh }`。
`kana` 為全平假名，`zh` 為台灣慣用繁體翻譯。
僅在該分類適合子分類篩選時才加 `shape` 欄位，並於 `PAGE_CONFIG.shapeLabels` 補中文標籤。

### CONFUSE_GROUPS
5-6 組，`title` 格式「〇〇易混：A vs B vs C」，每組 2-3 個 items。
`zh` 寫**區辨說明**（說明彼此差異），不是單純翻譯。

### PHRASE_DATA
4 個場景（key 英文小寫、label 中文 2-6 字），每場景固定 4 個情境
（label 格式「情境一：〇〇」到「情境四：〇〇」），每情境 12-14 句
`{ speaker: "staff"|"customer", jp, kana, zh }`。

- 對話須自然連貫：招呼或請求開場 → 中段詢問與回應 → 道謝或送別收尾，兩方大致交替
- staff 用服務業敬語：いらっしゃいませ、かしこまりました、承知いたしました、
  恐れ入ります、〜でございます、〜くださいませ
- customer 用禮貌體：です・ます、〜をお願いします、〜ていただけますか
- `kana` 為整句平假名，標點原樣保留
- `zh` 逗號用全形「,」，語氣自然口語

### KANJI_READINGS
`[漢字詞, 全平假名讀音]` 的二維陣列，用於常用句的假名 tooltip。

- 引擎會自動由長到短排序，但字典本身要**同時收錄長短兩種切法**以避免誤切
- 必須涵蓋 `PHRASE_DATA` 所有 `jp` 句中含漢字的詞組
- 情境頁**不得**包含 `KANJI_READINGS.sort(...)` 或 `buildFuriganaHTML` 函式，
  這些已在 `app.js`。同理不得宣告 `PHRASE_KEYS`、`currentPhraseScene`、`currentScenarioIndex`

---

## 新增情境的完整流程

1. 以 `hotel.html` 為結構範本建立 `<情境>.html`
2. **同步更新 `index.html` 的兩個地方**（只改其一會造成功能缺漏）：
   - 卡片入口，放進對應分類區塊（飲食／買い物／旅行）：
     ```html
     <a class="card" href="./檔名.html">
       <div class="card-title">中文名稱</div>
       <div class="card-sub">一句話說明</div>
     </a>
     ```
   - `const PAGES` 陣列加入 `{ file: "檔名.html", title: "中文名稱" }`
     供隨機學習、最少複習、收藏來源標籤使用。
     **`title` 必須與 `card-title` 完全相同**，否則收藏視窗的來源名稱會顯示錯誤
3. 執行下方驗證，並在最後列出本次新增或修改的所有檔案清單

---

## 遷移舊版情境頁

舊版是自包含單檔（樣式與邏輯都內嵌）。遷移時只做三件事，其餘一律刪除：

1. **逐字節保留**四個資料區塊，一個字都不改
   （但刪除其中屬於引擎的 `KANJI_READINGS.sort`、`buildFuriganaHTML`、三個狀態宣告）
2. 保留配色**色值**，只把變數名對齊本規範（主色改為 `--primary` 系列）
3. 從舊檔的 `SPEAKER_LABELS`、預設分類、預設場景、`SHAPE_LABELS` 組出 `PAGE_CONFIG`

舊檔的 UI 與邏輯全部丟棄，由 `app.js` / `app.css` 取代。
遷移後 `index.html` 不需改動（卡片與 PAGES 項目本來就存在）。

---

## 驗證清單

修改或新增情境頁後，交付前逐項確認：

- [ ] `node --check` 通過（將情境頁的第一個 script 內容抽出成 .js 後檢查）
- [ ] 四個資料區塊齊全；遷移案須與舊檔逐字節相同（比對字元數）
- [ ] 配色定義涵蓋上述 14 個必要變數
- [ ] `pageKey` 等於檔名主體，且與其他情境頁不重複
- [ ] `defaultCat` / `defaultScene` 指向的 key 確實存在於資料中
- [ ] script 載入順序為：資料 → `app.js` → `common.js`
- [ ] 無殘留舊變數名（如 `--navy`）、無 emoji
- [ ] KANJI_READINGS：以 Python 模擬最長匹配，確認對話中漢字詞零缺漏
- [ ] 新增情境時，`index.html` 的卡片與 `PAGES` 兩處都已更新且 title 一致

---

## 已知注意事項

- **iOS PWA 快取**：更新 `app.js` / `app.css` 後若手機沒吃到新版，
  在情境頁的引用加版本號強制刷新（`./app.js?v=2`）
- **PWA 圖示**：`index.html` 與 `manifest.json` 使用絕對路徑
  （`/JP-situations/apple-touch-icon.png`），這是 GitHub Pages 子路徑託管下
  iOS 抓圖示的必要寫法，不要改成相對路徑
- **Firebase 同步為選用**：使用者未設定同步碼時純本機運作，
  同步碼絕不自動產生
- **主題偏好**：情境頁與 hub 共用 localStorage 的 `hub-dark` 鍵
  （`'1'`=深色、`'0'`=淺色），未設定過才依系統偏好

---

## 工作環境

本機資料夾未使用 git 版本控制，變更由使用者手動上傳至 GitHub。因此：

- 不要執行任何 git 指令
- **每次任務結束時，務必列出本次新增或修改的所有檔案清單**，使用者需依此清單上傳
- 進行大範圍修改前，先提醒使用者備份資料夾

---

## 輸出慣例

- 情境頁 HTML 內容很長，不在對話中貼出全文，直接寫檔
- 結構差異無法直接套用本規範時，先說明差異與處理方式，不要靜默跳過
