# Tech Spec: 專案資料庫 (/games) 分類與卡片版面重構

## 1. 資料結構定義 (Configuration & Data Structures)

於 [dictionary.ts](file:///d:/GameDev/ULSOME_Website/src/locales/dictionary.ts) 擴充 `GameCategory` 與 `Game` 介面：

```ts
export type GameCategory = 'developing' | 'past' | 'prototype';

export interface Game {
    id: string;
    category: GameCategory;
    title: string;
    role: string;           // 負責職位/核心定位（如：關卡設計 / 遊戲設計）
    description: string;    // 顯示於 Steam Badge 下方的主要設計說明
    details?: string[];     // 顯示於 Steam Badge 下方的多段補充或條列重點（選填，方便撰寫長文）
    tags: string[];
    status: GameStatus;
    links: GameLink[];
    thumbnailGradient: string;
}
```

並於 `dictionary[locale].projects` 新增分類頁籤多語系字串：

```ts
categories: {
    developing: '正在開發', // EN: 'In Development'
    past: '過去參與',       // EN: 'Past Projects'
    prototype: 'Prototype', // EN: 'Prototypes'
},
contribution_label: 'DESIGN & CONTRIBUTION // 參與設計內容',
```

---

## 2. 組件介面與狀態邏輯 ([src/app/games/page.tsx](file:///d:/GameDev/ULSOME_Website/src/app/games/page.tsx))

### A. 分頁狀態管理
- 使用 `useState<GameCategory>('developing')`（或預設選取第一個分類）管理當前啟用的 Tab。
- 依據 `activeCategory` 過濾 `t.projects.games_list.filter(g => g.category === activeCategory)`。

### B. 卡片 DOM 結構（垂直三層佈局）
```tsx
<article className="group border border-white/10 bg-white/[0.03] hover:border-primary/40 transition-all duration-300 flex flex-col">
  {/* 1. Card Header: Title, Role Badge & Tags */}
  <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.02]">
    ...
  </div>

  {/* 2. Steam Widget / Visual Banner Area (Full Width) */}
  <div className="w-full bg-black/60 border-b border-white/10">
    {steamId ? (
      <div className="p-3 md:p-5">
        <iframe
          key={`${steamId}-${locale}`}
          src={`https://store.steampowered.com/widget/${steamId}/?l=${locale === 'zh' ? 'tchinese' : 'english'}`}
          className="w-full h-[190px]"
        />
      </div>
    ) : (
      /* Non-Steam visual banner */
    )}
  </div>

  {/* 3. Design & Contribution Details (Below Steam Badge) */}
  <div className="p-5 md:p-7 flex flex-col gap-4">
    <div className="text-[11px] text-primary/70 uppercase tracking-[0.2em]">
      {t.projects.contribution_label}
    </div>
    <p className="text-white/85 text-sm md:text-base leading-relaxed whitespace-pre-line">
      {game.description}
    </p>
    {game.details && game.details.length > 0 && (
      <ul className="flex flex-col gap-2 border-l-2 border-primary/30 pl-4 mt-1">
        {game.details.map((item, idx) => (
          <li key={idx} className="text-white/70 text-xs md:text-sm leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    )}
    {/* External / Internal Action Links (for non-Steam or additional links) */}
  </div>
</article>
```

---

## 3. 測試項目與驗證清單 (QA Checklist)

- [x] **1. Tab 切換與計數驗證**：
  - 確認「正在開發」、「過去參與」、「Prototype」三個 Tab 可正常切換，且顯示正確的專案數量。
- [x] **2. Steam Badge 下方設計詳情顯示**：
  - 確認 Steam Widget 以全寬顯示於卡片中段，而個人參與設計文字 (`description` 與 `details`) 完整呈現於 Steam Badge 正下方，支援多行與長文閱讀。
- [x] **3. 手機與 PC 響應式 (RWD) 驗證**：
  - 確認手機寬度（`375px`）下 Tab 按鈕不換行錯位、卡片內距適中、文字行高舒適；PC 寬度下版面大器穩重。
- [x] **4. 靜態編譯檢查 (`npm run build`)**：
  - 確認 TypeScript 型別與 Next.js 靜態匯出無任何錯誤。
