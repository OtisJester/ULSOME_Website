# 專案優化與重構：個人品牌網站 (Personal Brand Website)

## 專案目標
優化個人品牌網站，降低維運成本（維持 GitHub Pages 託管），並簡化內容更新流程（特別是部落格文章）。網站設計需具備現代感、動態效果與高級美學。

## 核心需求
1.  **託管**：GitHub Pages (免費)。
2.  **內容管理**：簡易的部落格發布流程 (建議使用 Markdown)。
3.  **既有內容**：保留 Unity 遊戲 ("CongressSimulator")，但在網站架構中調整為作品集的一部分，而非首頁。
4.  **設計**：Rich Aesthetics, Dynamic, Premium.

## 任務清單 (Task List)

- [x] **Phase 1: 架構分析與規劃** @AntiGravity
    - [x] 分析現有目錄結構與清理策略。
    - [x] 確認技術棧 (建議: Next.js + TailwindCSS 或 Vite + React)。
    - [x] 撰寫技術規格書 (Tech Spec)。

- [x] **Phase 2: 專案初始化** @AntiGravity
    - [x] 建立新的 Web 專案架構。
    - [x] 移動既有 Unity Build 至子目錄 (e.g., `/games/congress-simulator`)。
    - [x] 配置 GitHub Pages 部署流程 (GitHub Actions)。

- [x] **Phase 3: 核心頁面開發** @tech-spec-writer
    - [x] **Landing Page**: 設計高質感的 Hero Section，包含自我介紹與動態背景。
    - [x] **Portfolio**: 展示作品集（包含 Congress Simulator 的入口）。
    - [x] **Blog**: 搭建基於 Markdown 的部落格系統。

- [ ] **Phase 4: 樣式與互動優化** @unity-uiux-designer (Web 視角)
    - [ ] 實作 Glassmorphism 與動態漸層。 (已於 Phase 3 初步實作)
    - [ ] 添加微動效 (Hover effects, Scroll animations)。
    - [ ] 響應式設計 (RWD) 調整。 (已於 Phase 3 初步實作)

- [ ] **Phase 5: 內容遷移與發布**
    - [ ] 將 `_old_site` 有價值的內容遷移至新部落格。
    - [ ] 最終測試與上線。
