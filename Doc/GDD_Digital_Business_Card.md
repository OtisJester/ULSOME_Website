# GDD: 電子名片 (Digital Business Card)

## 1. 核心概念與視覺語彙
本電子名片為 ULSOME 個人品牌網站 [About](file:///d:/GameDev/ULSOME_Website/src/app/about/page.tsx) 頁面的核心升級。名片設計將延續現有的**科幻控制台 / 藍圖 (Console / Blueprint / Cyberpunk) 風格**，以高質感的動態微互動與資訊層級設計，帶給使用者高級、專業的視覺印象。

## 2. 資訊結構 (Information Architecture)
依據使用者需求，聯絡資訊目前**僅保留網站連結**，不包含個人電話或 Email，以維持隱私並聚焦於個人作品集與品牌網站。

名片分為 **正面 (Front)** 與 **背面 (Back)** 雙面結構：

### A. 名片正面 (Front Side)
*   **個人頭像 (Avatar)**: 圓形/多邊形框體，具備發光與微動態外框。
*   **基本資訊**:
    *   姓名 (Name): Otis Chang
    *   職稱 (Role): Game Developer (遊戲開發)
    *   經歷摘要 (Experience): 10+ 年遊戲開發經歷，涵蓋數值、敘事、關卡設計。
*   **聯絡資訊 (Primary Contact)**:
    *   只放個人網站連結（即本形象網站 URL），並提供點擊「複製網站網址」按鈕與炫酷提示。
*   **互動按鈕**:
    *   「切換至 QR Code / 翻轉卡片」 (Flip Card) 按鈕。

### B. 名片背面 (Back Side)
*   **名片 QR Code**:
    *   中心可放置 ULSOME 標誌或極簡像素點。
    *   二維碼編碼內容為本電子名片的網址，便於手機相機掃描直接開啟。
*   **輔助操作**:
    *   「複製名片連結」 (Copy Link) 按鈕。
    *   「返回正面」 (Flip to Front) 按鈕。

---

## 3. 互動與動效設計 (Interactions & Animations)
為了創造 "Premium & Dynamic" 的網頁美學，將使用 `framer-motion` 實作以下效果：

1.  **3D 懸停傾斜 (3D Card Tilt)**:
    *   在桌上型電腦，滑鼠滑過卡片時，卡片會隨著游標移動進行微幅的 3D 空間傾斜，展現高質感立體光影折射感。
2.  **翻牌動畫 (Y-Axis Card Flip)**:
    *   點擊翻轉按鈕時，卡片沿 Y 軸進行 180 度翻轉，流暢地從正面切換至背面。
3.  **複製成功提示 (HUD Clipboard Toast)**:
    *   點擊複製連結時，名片下方彈出科幻風格的 HUD 提示框 `[ SYSTEM: LINK COPIED ]`，並伴隨短暫的綠色/金色閃爍。
4.  **QR Code 掃描引導動畫**:
    *   背面 QR Code 周圍會有科技感的掃描線 (Scanning Overlay) 做上下循環移動，增強視覺暗示。

---

## 4. 響應式佈局 (RWD)
*   **桌上型螢幕**: 居中呈現精緻的名片比例 (約 16:10)，寬度限制在 `max-w-xl`，背景為動態網格。
*   **行動端螢幕**: 縮小邊距，名片自動調整為直立式（手機螢幕比例），方便單手點擊複製與分享。
