# Tech Spec: 《時空殘響 Chrono Echo》10 秒回溯、實體障礙與陷阱系統

## 1. 資料結構定義 (Data Structures & Configurations)

於 [levels.js](file:///d:/GameDev/ULSOME_Website/public/play/chrono-echo/levels.js) 擴充尖刺 (`spikes`) 與雷射發射器 (`lasers`) 資料結構：

```ts
interface SpikeStrip {
    x: number;
    y: number;
    w: number;
    h: number;
    dir?: 'up' | 'down' | 'left' | 'right'; // 尖刺朝向，預設 'up'
}

interface LaserEmitter {
    id: string;
    x: number;              // 發射口起點 X
    y: number;              // 發射口起點 Y
    dir: 'left' | 'right' | 'up' | 'down';
    thickness?: number;     // 光束寬度，預設 8px
    maxLength?: number;     // 最大射程，預設 960px
}

interface LevelConfig {
    id: number;
    code: string;
    title: { zh: string; en: string };
    hint: { zh: string; en: string };
    maxEchoes: number;
    timeLimit: number;      // 10.0 秒
    spawn: { x: number; y: number };
    goal: Rect;
    platforms: Rect[];
    spikes: SpikeStrip[];   // 致命尖刺陷阱
    lasers: LaserEmitter[]; // 可被實體幻影/閘門阻擋的雷射發射器
    plates: PressurePlate[];
    gates: Gate[];
}
```

---

## 2. 物理與陷阱判定接口 ([game.js](file:///d:/GameDev/ULSOME_Website/public/play/chrono-echo/game.js))

### A. 定格幻影 = 完整實體剛體 (`Anchored Echo as Solid Obstacle`)
- 當幻影處於 `anchored === true`（已到達上一輪按下回溯的瞬間並定住）時：
  - 將該幻影的碰撞矩形 `{ x: echo.x, y: echo.y, w: ACTOR_W, h: ACTOR_H }` 直接加入本幀的 **`solids`（四向實體碰撞陣列）**！
  - **效果**：
    1. **立足點**：玩家跳到其上方時會自然落在其頂部 (`y = echo.y - ACTOR_H, grounded = true`)。
    2. **實體障礙物**：玩家從左/右側撞上定格幻影時會被水平阻擋 (`x = echo.x - ACTOR_W` 或 `echo.x + ACTOR_W`)；從下方頂撞時頭頂也會被擋住。
- 當幻影尚在 `anchored === false`（重播移動中）時：
  - 保留單向頂部踩踏與水平慣性帶動，側面不阻擋本尊，避免起點重疊卡死。

### B. 雷射光束即時遮擋計算 (`computeLaserBeamRect(laser, blockers)`)
- **遮擋物集合 (`blockers`)**：包含所有 `platforms`、當前關閉的 `gates`，以及場上所有的 `echoStates`（特別是已定格的實體幻影）。
- 針對每道雷射 `laser`，依其方向 (`right` / `left` / `down` / `up`) 計算起點至最近一個 `blocker` 交點處的矩形 `beamRect`：
  - 若定格幻影位於雷射路徑上，雷射光束會在幻影表面終止並繪製火花粒子特效，幻影後方即成為安全無傷區！
  - 若本尊 (`player`) 與截斷後的 `beamRect` 發生重疊，則立即觸發失敗 (`state = "dead"`, 顯示 `ELIMINATED BY TRAP // 觸發致命陷阱`)。

### C. 尖刺碰撞判定 (`Spikes Collision`)
- 對每個 `spike` 採用稍微內縮 `3px` 的寬容碰撞框（Forgiving Hitbox），當本尊與尖刺重疊時觸發失敗；而定格在尖刺上方或其中的幻影則不受影響，可安全作為墊腳石。

---

## 3. 測試項目與驗證清單 (QA Checklist)

- [x] **1. 定格幻影四向剛體碰撞驗證**：
  - 確認幻影定格後，側面會阻擋玩家通行（成為真正的障礙物），頂部可穩定站立跳躍。
- [x] **2. 雷射光束遮擋與致命判定驗證**：
  - 確認雷射打中玩家會立即判定失敗；當幻影定格於雷射路徑上時，光束確實被幻影截斷，玩家可安全通過幻影後方。
- [x] **3. 尖刺陷阱與空中踏板驗證**：
  - 確認觸碰尖刺會判定失敗，且可在尖刺上方半空定格幻影作為安全立足點跨過刺區。
- [x] **4. 6 個改良版關卡全數可通關與 `npm run build` 驗證**：
  - 確認所有關卡幾何高度與 10 秒時限合理，且靜態建置與部署無誤。
