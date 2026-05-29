# Tech Spec: 策略與六角格視覺重構 (Tactical Strategy & Hex-Grid)

## 1. 資料結構與變數設定 (Configurations)

### A. 全域變數更新
在 [globals.css](file:///d:/GameDev/ULSOME_Website/src/app/globals.css) 中更新 CSS 變數定義，將原本的金黃色調替換為戰術冷青色/冰藍色：
```css
:root {
  --background: #080a0f;
  --foreground: #e2e8f0;
  
  --primary: #00d2c4;
  --secondary: #475569;
  --accent: #38bdf8;
  
  --glass: rgba(8, 10, 15, 0.75);
  --glass-border: rgba(0, 210, 196, 0.2);
  
  --grid-color: rgba(0, 210, 196, 0.04);
}
```

### B. 背景六角網格圖樣更新
將 `bg-hex-pattern` 的背景 SVG 更新為對應的冷青色 `stroke="%2300d2c4"`。

---

## 2. 類別與組件介面 (Interfaces/Components)

### A. 融合 U-L 的 SVG Logo 設計
我們將在首頁的 Logo 位置引入一個純 SVG 圖形，其線條路徑為：
```xml
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-primary">
  <!-- Left stem, curve, up to right stem (forming U) -->
  <path d="M32 30 V60 C32 70, 48 70, 48 60 V30" />
  <!-- Right stem continuing down and turning right (forming L) -->
  <path d="M48 30 V70 H68" />
</svg>
```

---

## 3. 實作細節與修改範圍 (Implementation Scope)

### A. [globals.css](file:///d:/GameDev/ULSOME_Website/src/app/globals.css)
*   更換變數色彩定義（金黃變冷青）。
*   修改 `.text-gold` 與 `.border-gold` 中的色彩屬性為 `var(--primary)` 確保向下相容性。
*   修改 `bg-hex-pattern` 的 background-image SVG 代碼。

### B. [page.tsx](file:///d:/GameDev/ULSOME_Website/src/app/page.tsx) (首頁)
*   更換 Logo 區塊代碼，改用我們設計的 `U-L` 融合幾何 SVG。
*   調整按鈕樣式，確保外框發光顏色 (`rgba(0, 210, 196, ...)`), hover 背景過渡符合冷青色調。
*   調整背景旋轉六角形 SVG 的線條顏色（將原來的黃金色改為 `stroke="currentColor"` 以便自動繼承冷青色）。

### C. [about/page.tsx](file:///d:/GameDev/ULSOME_Website/src/app/about/page.tsx) (名片頁)
*   確認 `QRCodeGenerator` 收到的色彩已更新為冷青色。
*   將名片背面的掃描發光線顏色及陰影改為青色：`shadow-[0_0_8px_#00d2c4]`。
*   確保所有邊角裝飾、狀態標記與發光效果與全域的 `--primary` 完美連動。

### D. [QRCodeGenerator.tsx](file:///d:/GameDev/ULSOME_Website/src/components/QRCodeGenerator.tsx)
*   更新預設前景色為 `#00d2c4`。

---

## 4. 測試項目與驗證清單 (QA Checklist)

- [ ] **1. 全站色彩轉換檢查**：
  *   打開本機網頁，確保首頁、About 名片頁不再殘留任何黃金/黃銅色（`#cda45e`）元素，所有主要邊框與高亮文字應呈現戰術青色（`#00d2c4`）與冰藍色。
- [ ] **2. U-L 融合 Logo 渲染**：
  *   檢查首頁 Logo，確認 SVG 是否完美繪製出 U 與 L 融合成一體且筆劃圓滑無錯位。
- [ ] **3. 背景六邊形網格**：
  *   確認背景的 Hex Grid 圖案有正常顯示，且色彩飽和度低，不影響內文的文字對比度與易讀性。
- [ ] **4. QR Code 生成色調**：
  *   翻轉名片至背面，二維碼的實體色點應由金黃色成功轉為戰術冷青色，並在掃描時能被手機正常識別。
- [ ] **5. 控制台無編譯警告**：
  *   執行 `npm run build` 確認全部頁面及 Markdown 部落格靜態打包皆為綠色成功狀態。
