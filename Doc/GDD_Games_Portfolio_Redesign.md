# GDD: 專案資料庫 (/games) 分類與卡片版面重構

## 1. 設計目標 (Design Goals)
針對 `/games` 作品集頁面進行結構升級，解決原先「左右分欄導致文字空間過窄」與「所有作品混在同一長列表」的問題：
1. **三段式戰術分頁 (Tactical Category Tabs)**：將專案明確切分為 **「正在開發」**、**「過去參與」**、**「Prototype」** 三大類別。
2. **Steam Badge 下方擴充敘事空間**：移除原本擁擠的右側 3/12 窄欄，改為「上視覺（Steam Widget / 橫幅）、下詳情（個人參與設計專區）」的垂直結構，支援多段文字與設計亮點條列。
3. **跨裝置響應式體驗 (Mobile & PC RWD)**：確保手機窄螢幕與 PC 寬螢幕在切換 Tab、瀏覽 Steam 小工具與閱讀長篇設計說明時皆具備極佳易讀性。

---

## 2. 資訊架構與分類定義 (Information Architecture)

### A. 三大分類 Tab
| 分類 ID (`category`) | 繁體中文名稱 | 英文名稱 | 預設歸類專案 |
| :--- | :--- | :--- | :--- |
| `developing` | **正在開發** | **In Development** | `Super Real AI` |
| `past` | **過去參與** | **Past Projects** | `月詠 (ARIE: Moonprayer)`、`OPUS:龍脈常歌`、`靈魂之橋 前傳`、`境界之詩 Tactics` |
| `prototype` | **Prototype** | **Prototypes** | `矩陣河內塔：空間躍遷 (Grid Hanoi)` |

*(註：各專案所屬分類皆由 [dictionary.ts](file:///d:/GameDev/ULSOME_Website/src/locales/dictionary.ts) 資料驅動，可隨時調整順序或歸類。)*

### B. 單一專案卡片垂直結構 (Card Layout)
每張卡片由上而下分為三個區塊：
1. **頂部標題列 (Card Header)**：
   - 左側：專案名稱 (`title`) + 擔任職責徽章 (`role`，如「關卡設計」、「系統與遊戲設計」)。
   - 右側：類型標籤 (`tags`) 與狀態標記。
2. **中段視覺 / Steam 嵌入區 (Visual / Steam Badge Area)**：
   - **Steam 專案**：全寬展示 Steam 商店 Widget (`190px` 高)，不會因分欄而被截斷。
   - **非 Steam 專案（Mobile / Web Prototype）**：全寬展示主題漸層視覺橫幅與快速啟動按鈕（如「前往遊玩」、「Google Play」）。
3. **底部設計參與詳情區 (Design Contributions Panel — 位於 Steam Badge 正下方)**：
   - 以戰術規格框線 (`border-l-2 border-primary/50`) 呈現「負責內容 / 設計細節」。
   - 支援 **主敘述 (`description`)** 與 **條列式設計重點 (`details?: string[]`)**，可撰寫完整的系統架構、關卡流程或解謎機制說明。

---

## 3. 手機與 PC 瀏覽體驗規範 (Responsive UX)
- **Tab 導覽列**：
  - **PC 端**：水平排列，顯示分類名稱與該分類專案數量（如 `過去參與 [04]`），切換時帶有些微發光指示條。
  - **手機端**：採用 3 等分網格 (`grid-cols-3`) 或緊湊水平膠囊按鈕，確保單手拇指點擊熱區充足（高度 $\ge 44\text{px}$），不需左右滑動找不到分類。
- **版面邊距與字級**：
  - 手機端外框與內距縮小為 `p-4`，避免雙層邊框吃掉螢幕寬度；PC 端維持 `p-8 md:p-14` 的寬敞戰術藍圖感。
