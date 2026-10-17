// Data-Driven Level Definitions for Chrono Echo (960x540 Logical Canvas)
// Improvements over The Company of Myself:
// 1. 10-second countdown displayed directly on the Goal Door
// 2. Rewind freezes past self into a solid 4-way obstacle & foothold (Manual [E] OR Auto-Rewind on Death!)
// 3. Deadly Spikes & Raycast Lasers (which solid Echoes can block!)

window.CHRONO_LEVELS = [
  {
    id: 1,
    code: "SEC-01",
    title: {
      zh: "踏過昨日之我",
      en: "Step on the Past"
    },
    hint: {
      zh: "高台下方佈滿致命尖刺！直接跳入刺區觸發「死亡自動回溯」（或在半空按 [E] 手動回溯），讓上一輪的自己定格成安全踏板，在門上 10 秒倒數結束前過關！",
      en: "Deadly spikes guard the ledge! Jump into the spikes to trigger Auto-Rewind (or press [E] in mid-air), freezing your past self as a stepping stone!"
    },
    maxEchoes: 1,
    timeLimit: 10.0,
    spawn: { x: 110, y: 402 },
    goal: { x: 770, y: 232, w: 52, h: 68 },
    platforms: [
      { x: 0, y: 440, w: 960, h: 100 },
      { x: 0, y: 0, w: 30, h: 540 },
      { x: 930, y: 0, w: 30, h: 540 },
      { x: 580, y: 300, w: 350, h: 140 }
    ],
    spikes: [
      { x: 430, y: 424, w: 150, h: 16, dir: "up" }
    ],
    lasers: [],
    plates: [],
    gates: []
  },
  {
    id: 2,
    code: "SEC-02",
    title: {
      zh: "肉身擋光",
      en: "Shadow of the Past"
    },
    hint: {
      zh: "雷射壕溝阻斷了通往高台的路！第 1 輪跳過砲塔落入雷射光束中，觸發「死亡自動回溯」將自己定格在壕溝內擋住死光；第 2 輪踩在定格的自己頭上跳上高台！",
      en: "A laser trench blocks the high ledge! On Run 1, jump over the turret into the laser to Auto-Rewind & freeze as a shield; on Run 2, step on your frozen self to reach the ledge!"
    },
    maxEchoes: 1,
    timeLimit: 10.0,
    spawn: { x: 90, y: 402 },
    goal: { x: 780, y: 237, w: 52, h: 68 },
    platforms: [
      { x: 0, y: 440, w: 960, h: 100 },
      { x: 0, y: 0, w: 30, h: 540 },
      { x: 930, y: 0, w: 30, h: 540 },
      { x: 260, y: 400, w: 28, h: 40 },     // Laser turret pedestal (safe spawn on left at x=90)
      { x: 470, y: 305, w: 460, h: 135 }     // Right high ledge (135px high — requires stepping on Echo in trench!)
    ],
    spikes: [],
    lasers: [
      {
        id: "l1",
        x: 288,
        y: 418,
        dir: "right",
        thickness: 8,
        maxLength: 200
      }
    ],
    plates: [],
    gates: []
  },
  {
    id: 3,
    code: "SEC-03",
    title: {
      zh: "刺海浮橋",
      en: "Bridge Over Spikes"
    },
    hint: {
      zh: "超長尖刺深淵（可使用 2 次回溯）！直接跳入刺海觸發「死亡自動回溯」（或按 [E] 半空定格），連續兩輪用定格的自己鋪出跨越刺海的浮橋！",
      en: "Wide spike chasm (2 Rewinds)! Jump into the spikes to Auto-Rewind (or press [E] in mid-air), using two frozen echoes as stepping stones across the pit!"
    },
    maxEchoes: 2,
    timeLimit: 10.0,
    spawn: { x: 90, y: 342 },
    goal: { x: 810, y: 312, w: 52, h: 68 },
    platforms: [
      { x: 0, y: 0, w: 30, h: 540 },
      { x: 930, y: 0, w: 30, h: 540 },
      { x: 30, y: 380, w: 240, h: 160 },    // Left cliff ends at x=270
      { x: 630, y: 380, w: 300, h: 160 },   // Right cliff starts at x=630 (360px spike pit)
      { x: 30, y: 470, w: 900, h: 70 }
    ],
    spikes: [
      { x: 270, y: 454, w: 360, h: 16, dir: "up" }
    ],
    lasers: [],
    plates: [],
    gates: []
  },
  {
    id: 4,
    code: "SEC-04",
    title: {
      zh: "天頂死光與守門人",
      en: "Sky Laser & Gatekeeper"
    },
    hint: {
      zh: "左側壓板正上方有垂直死光！第 1 輪跳過地刺直接撞上壓板處的死光，觸發「死亡自動回溯」將自己永久定格在壓板上開門；第 2 輪向右衝向終點！",
      en: "A vertical laser guards the pressure plate! Jump over the left spikes into the laser on the plate to Auto-Rewind & freeze yourself on the plate, holding the gate open for Run 2!"
    },
    maxEchoes: 1,
    timeLimit: 10.0,
    spawn: { x: 400, y: 402 },
    goal: { x: 820, y: 372, w: 52, h: 68 },
    platforms: [
      { x: 0, y: 440, w: 960, h: 100 },
      { x: 0, y: 0, w: 30, h: 540 },
      { x: 930, y: 0, w: 30, h: 540 },
      { x: 115, y: 80, w: 120, h: 24 },     // Ceiling turret mount
      { x: 650, y: 160, w: 32, h: 150 }     // Gate top housing
    ],
    spikes: [
      { x: 260, y: 424, w: 90, h: 16, dir: "up" },
      { x: 510, y: 424, w: 90, h: 16, dir: "up" }
    ],
    lasers: [
      { id: "l1", x: 175, y: 104, dir: "down", thickness: 8, maxLength: 340 }
    ],
    plates: [
      { id: "p1", x: 130, y: 432, w: 92, h: 8, color: "#00d2c4" }
    ],
    gates: [
      { id: "g1", x: 654, y: 310, w: 24, h: 130, plateIds: ["p1"], color: "#00d2c4" }
    ]
  },
  {
    id: 5,
    code: "SEC-05",
    title: {
      zh: "雙層光盾人梯",
      en: "Shielded Ascension"
    },
    hint: {
      zh: "高塔頂端有死光掃射（2 次回溯）！第 1 輪跳入塔前刺區定格為第 1 階踏板；第 2 輪踩踏板跳上高塔，跳過砲塔落入光束觸發自動回溯擋光；第 3 輪翻越自己抵達終點！",
      en: "A laser sweeps the tower top (2 Rewinds)! 1) Freeze on the spikes in front of the tower. 2) Climb up and jump over the turret into the beam to Auto-Rewind & block it. 3) Vault over yourself to the goal!"
    },
    maxEchoes: 2,
    timeLimit: 10.0,
    spawn: { x: 110, y: 422 },
    goal: { x: 845, y: 192, w: 52, h: 68 },
    platforms: [
      { x: 0, y: 460, w: 960, h: 80 },
      { x: 0, y: 0, w: 30, h: 540 },
      { x: 930, y: 0, w: 30, h: 540 },
      { x: 540, y: 320, w: 390, h: 140 },   // 140px high tower (reachable by stepping on Echo 1 in spikes!)
      { x: 590, y: 282, w: 26, h: 38 },     // Upper turret mount on tower, shooting RIGHT
      { x: 750, y: 260, w: 180, h: 60 }     // Goal upper step on tower
    ],
    spikes: [
      { x: 390, y: 444, w: 150, h: 16, dir: "up" }
    ],
    lasers: [
      {
        id: "l1",
        x: 616,
        y: 298,
        dir: "right",
        thickness: 8,
        maxLength: 140
      }
    ],
    plates: [],
    gates: []
  },
  {
    id: 6,
    code: "SEC-06",
    title: {
      zh: "10秒極限同步",
      en: "Grand Synchronization"
    },
    hint: {
      zh: "終極考驗（3 次回溯）：① 第 1 輪在壓板按 [E] 定格開門 ② 第 2 輪跳入尖刺坑自動回溯造橋 ③ 第 3 輪跳上高台落入砲口右側死光擋住雷射 ④ 第 4 輪全速突破！",
      en: "Final Test (3 Rewinds): 1) Press [E] on the plate to hold the gate. 2) Jump into the spike pit to Auto-Rewind a bridge. 3) Hop over the altar turret into the laser to block it. 4) Sprint to the goal!"
    },
    maxEchoes: 3,
    timeLimit: 10.0,
    spawn: { x: 65, y: 402 },
    goal: { x: 855, y: 262, w: 52, h: 68 },
    platforms: [
      { x: 0, y: 440, w: 360, h: 100 },     // Left section
      { x: 520, y: 440, w: 410, h: 100 },   // Right section (160px spike gap between 360..520)
      { x: 360, y: 480, w: 160, h: 60 },    // Spike pit bottom
      { x: 0, y: 0, w: 30, h: 540 },
      { x: 930, y: 0, w: 30, h: 540 },
      { x: 280, y: 170, w: 28, h: 140 },    // Gate housing
      { x: 640, y: 330, w: 290, h: 110 },   // Final high altar (110px high, reachable in 1 jump!)
      { x: 675, y: 292, w: 24, h: 38 }      // Laser turret on altar, shooting RIGHT
    ],
    spikes: [
      { x: 360, y: 464, w: 160, h: 16, dir: "up" }
    ],
    lasers: [
      {
        id: "l1",
        x: 699,
        y: 308,
        dir: "right",
        thickness: 8,
        maxLength: 231
      }
    ],
    plates: [
      { id: "p1", x: 165, y: 432, w: 66, h: 8, color: "#00d2c4" }
    ],
    gates: [
      { id: "g1", x: 282, y: 310, w: 24, h: 130, plateIds: ["p1"], color: "#00d2c4" }
    ]
  }
];
