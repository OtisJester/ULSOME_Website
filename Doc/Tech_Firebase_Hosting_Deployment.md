# Tech Spec: Firebase Hosting 部署設定與自動化管線

## 1. 資料結構與設定檔定義 (Configuration Definitions)

### A. [next.config.ts](file:///d:/GameDev/ULSOME_Website/next.config.ts)
啟用 `trailingSlash: true`，讓 Next.js `output: 'export'` 將各路由輸出為 `<route>/index.html`（例如 `out/about/index.html`、`out/games/grid-hanoi/index.html`），解決 `out/<route>/` 資料夾（存放 RSC payload）與 `out/<route>.html` 同名在 Firebase Hosting 上的靜態目錄解析衝突，同時保護 `/play/grid-hanoi/index.html` 與 `/play/moonshore/index.html` 的相對資源路徑。

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### B. [firebase.json](file:///d:/GameDev/ULSOME_Website/firebase.json)
配置 Firebase Hosting 靜態根目錄為 `out`，並針對 `_next/static` 設定長效快取：

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "/_next/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### C. [.firebaserc](file:///d:/GameDev/ULSOME_Website/.firebaserc)
綁定預設的 Firebase Project ID：

```json
{
  "projects": {
    "default": "ulsome-website"
  }
}
```

---

## 2. 部署介面與腳本 (CLI & CI/CD Interfaces)

### A. [package.json](file:///d:/GameDev/ULSOME_Website/package.json) Scripts
新增本機部署與預覽指令：
- `"deploy:firebase": "npm run build && npx firebase-tools deploy --only hosting"`
- `"serve:firebase": "npm run build && npx firebase-tools serve --only hosting"`

### B. GitHub Actions Workflow ([.github/workflows/firebase-deploy.yml](file:///d:/GameDev/ULSOME_Website/.github/workflows/firebase-deploy.yml))
- 觸發條件：`push` 至 `main` 或 `master` 分支，以及 `workflow_dispatch` 手動觸發。
- 建置步驟：安裝 Node.js 22 -> `npm ci` -> `npm run build`。
- 部署步驟：透過 `FirebaseExtended/action-hosting-deploy@v0` 搭配 `FIREBASE_SERVICE_ACCOUNT` Secret 與專案 ID 發布至 `live` channel。

---

## 3. 測試項目與驗證清單 (QA Checklist)

- [x] **1. 靜態匯出結構驗證 (`npm run build`)**：
  - 確認 `out/index.html`、`out/about/index.html`、`out/games/index.html`、`out/games/grid-hanoi/index.html` 皆正常生成且無編譯錯誤。
- [x] **2. 子專案遊戲路徑完整性**：
  - 確認 `out/play/grid-hanoi/index.html` 與 `out/play/moonshore/index.html` 及其 `.wasm`/`.pck`/`.js` 檔案完整輸出。
- [x] **3. Firebase CLI 與設定檔檢查**：
  - 確認 `firebase.json`、`.firebaserc`、`.gitignore`（忽略 `.firebase/` 與 `firebase-debug.log*`）與 `.github/workflows/firebase-deploy.yml` 語法正確。
