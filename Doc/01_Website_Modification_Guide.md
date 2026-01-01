# 網站修改指南 (Website Modification Guide)

本文件說明如何修改與維護 ULSOME 形象網站。

## 1. 專案結構 (Project Structure)

本專案使用 **Next.js 15+ (App Router)** 架構，主要檔案位於 `src` 目錄下：

- `src/app/`: 頁面路由與佈局
  - `layout.tsx`: 全域佈局（包含導航、字體設定）
  - `page.tsx`: 首頁 (/)
  - `resume/page.tsx`: 履歷頁 (/resume)
  - `games/page.tsx`: 專案庫 (/games)
- `src/components/`: 共用元件 (如 `LanguageSwitcher.tsx`)
- `src/lib/`: 工具函式 (如 `i18n.tsx`)
- `src/locales/`: 多語言字典檔
  - `dictionary.ts`: **所有網頁文字內容皆在此修改**

---

## 2. 如何修改文字內容 (Modifying Text)

本網站採用由 `src/lib/i18n.tsx` 驅動的輕量化多語言系統。
**請勿直接在 `page.tsx` 中硬寫文字**，請統一修改 `dictionary.ts`。

### 修改步驟：
1. 開啟 `src/locales/dictionary.ts`。
2. 找到對應的語言區塊 (`en` 或 `zh`)。
3. 修改對應的 Key 值內容。

**範例：修改首頁標題**
```typescript
// src/locales/dictionary.ts
export const dictionary = {
    en: {
        home: {
            title: 'New Title Here', // 修改這裡
            // ...
        }
    },
    zh: {
        home: {
            title: '這裡輸入新標題', // 修改這裡
            // ...
        }
    }
};
```

---

## 3. 如何修改頁面樣式 (Modifying Styles)

本專案使用 **Tailwind CSS** 進行樣式設定。

- **全域樣式**：修改 `src/app/globals.css` (包含自定義動畫、字體變數)。
- **頁面樣式**：直接在元件的 `className` 中修改 Tailwind Class。

**常用自定義顏色 (定義於 `tailwind.config.ts` 或 `globals.css`)**：
- `text-primary`: 主要金色/黃色系強調色
- `bg-background`: 深色背景
- `text-foreground`: 主要文字顏色

---

## 4. 如何新增頁面 (Adding Pages)

在 `src/app/` 下建立新資料夾，並新增 `page.tsx`。

**步驟：**
1. 建立資料夾：`src/app/about`
2. 建立檔案：`src/app/about/page.tsx`
3. 寫入基本結構：

```tsx
"use client";
import { useLanguage } from "@/lib/i18n";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen p-8 text-white">
            <h1>{t.nav.home}</h1> {/* 範例：使用字典 */}
            <p>New Page Content</p>
        </div>
    );
}
```

---

## 5. 本機預覽 (Local Preview)

在修改後，請確保開發伺服器正在運行以查看變更。

**指令：**
```bash
npm run dev
```
啟動後打開瀏覽器訪問 `http://localhost:3000`。
若遇到端口佔用問題，可使用 `taskkill` 清除佔用進程或讓 Next.js 自動切換端口。
