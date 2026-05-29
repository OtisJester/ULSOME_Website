# Tech Spec: 電子名片 (Digital Business Card)

## 1. 資料結構與字典檔設定 (Data Structure)
我們將在 [dictionary.ts](file:///d:/GameDev/ULSOME_Website/src/locales/dictionary.ts) 的 `about` 結構中新增 `website` 欄位，並將原本的聯絡資訊調整為只顯示個人網站。

### 修改定義：
```typescript
// src/locales/dictionary.ts
export const dictionary = {
    en: {
        about: {
            // ... 原有欄位
            contact_title: 'Website',
            website: 'https://otisjester.github.io/ULSOME_Website', // 預設個人網站
        }
    },
    zh: {
        about: {
            // ... 原有欄位
            contact_title: '官方網站',
            website: 'https://otisjester.github.io/ULSOME_Website',
        }
    }
}
```

---

## 2. 類別與組件介面 (Interfaces/API)
我們將在 `src/components/` 底下新增 [QRCodeGenerator.tsx](file:///d:/GameDev/ULSOME_Website/src/components/QRCodeGenerator.tsx)，用於生成 SVG 格式的二維碼，避免外部網路連線依賴，並支援 RWD 與自訂顏色。

### 依賴套件安裝：
我們需要安裝 `qrcode` 來在客戶端生成 QR Code 的二維矩陣。
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

### [QRCodeGenerator.tsx](file:///d:/GameDev/ULSOME_Website/src/components/QRCodeGenerator.tsx) 介面設計：
```typescript
interface QRCodeGeneratorProps {
  value: string;       // 二維碼編碼的網址
  size?: number;       // 二維碼寬高尺寸
  fgColor?: string;    // 前景色 (預設為 primary 金黃色)
  bgColor?: string;    // 背景色 (預設為透明)
}
```

### [about/page.tsx](file:///d:/GameDev/ULSOME_Website/src/app/about/page.tsx) 翻轉名片狀態：
我們將使用 `framer-motion` 建立狀態管理：
```typescript
type CardSide = 'front' | 'back';
```
在 React 組件內：
```typescript
const [cardSide, setCardSide] = useState<CardSide>('front');
const [isCopied, setIsCopied] = useState<boolean>(false);
```

---

## 3. 實作邏輯 (Implementation Details)

1.  **3D Tilt 效果**:
    使用 React `useMotionValue`, `useTransform` 監聽 `onMouseMove` 事件，動態計算滑鼠與卡片中心的距離，並映射至 X 軸與 Y 軸的 `rotate` 屬性。
2.  **Flip Y 翻牌效果**:
    使用 `framer-motion` 的 `animate` 動態切換 `rotateY` 屬性。正面為 `0` 度，背面為 `180` 度。
    當 `cardSide === 'back'` 時，正面內容透過 `backface-visibility: hidden` 隱藏，背面內容顯示。
3.  **聯絡資訊過濾**:
    修改 UI 渲染邏輯，移除 `email` 展示，全改為顯示 `website` 網址。網址右側附帶「複製網址」按鈕。
4.  **動態獲取當前網址**:
    QR Code 的內容若為靜態設定則容易失效，應在客戶端載入後（`useEffect`）動態取得 `window.location.href` 作為編碼內容，若無則 fallback 到 `t.about.website`。

---

## 4. 測試項目與驗證清單 (QA Checklist)

- [ ] **1. 多語言支援測試**:
  - 切換英文/中文，檢查「聯絡資訊」標題是否正確切換為 "Website" / "官方網站"。
- [ ] **2. 網址複製測試**:
  - 點擊「複製網址」按鈕，剪貼簿應成功存入當前網址。
  - 下方應正確顯示 HUD 樣式的提示訊息，並在 2 秒後自動消失。
- [ ] **3. QR Code 掃描驗證**:
  - 開啟名片背面，使用手機相機掃描 QR Code，應能正確識別出當前的個人檔案頁面網址。
- [ ] **4. 3D 傾斜與翻牌動效**:
  - 在 PC 端滑鼠懸停，卡片應有 3D 空間傾斜感。
  - 點擊翻牌按鈕，卡片應有流暢的 180 度翻轉過渡效果，且無破圖或背面文字鏡像反轉問題。
- [ ] **5. 行動端排版與觸控測試**:
  - 行動端視窗下，名片縮放正常，按鈕大小適合觸控，不會有文字溢出或超出邊界。
- [ ] **6. 控制台無錯誤訊息**:
  - 開啟開發者工具 (Console)，確認沒有任何 React/Next.js 警告或錯誤，且 `npm run build` 可正常通過。
