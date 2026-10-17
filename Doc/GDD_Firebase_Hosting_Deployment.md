# GDD: Firebase Hosting 網站部署架構定義

## 1. 目標概述 (Overview)
將個人品牌與作品集網站（Next.js Static Export + Web 遊戲子專案）部署至 **Google Firebase Hosting**，同時支援：
1. **本機 CLI 快速發布**：開發者可於本機透過單一 NPM 指令完成靜態編譯與上傳。
2. **GitHub Actions 自動化部署 (CI/CD)**：當程式碼推送至 `main` / `master` 分支時，自動觸發雲端建置並發布至 Firebase Hosting 正式環境。

## 2. 路由與多媒體資產體驗要求 (Routing & Media Requirements)
- **Next.js 靜態頁面 (`/`, `/about`, `/games`, `/games/grid-hanoi`)**：
  - 確保使用者直接輸入網址、重新整理頁面或透過連結跳轉時，皆能正確載入對應 HTML 與 RSC payload，不發生 404 或目錄衝突。
- **嵌入式與獨立 Web 遊戲 (`/play/grid-hanoi/`, `/play/moonshore/`)**：
  - 確保子目錄下的原生 HTML/JS/CSS 遊戲與 Godot WebAssembly (`.wasm`, `.pck`) 遊戲維持正確的相對路徑基準（Base URL），不因去掉斜線重導向而導致樣式或腳本 404。
- **第三方嵌入相容性 (Steam Widget iframe)**：
  - `/games` 頁面內嵌 Steam 商店小工具 iframe，Header 策略不可阻擋跨來源嵌入。
