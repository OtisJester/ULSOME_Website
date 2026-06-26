---
title: 紀錄
date: 2026-06-21
excerpt: Godot 建立web build 中文字的問題
tags:
  - Meta
  - WebDev
  - Personal
coverImage: /images/blog/hello-world.jpg
---
canvas layer無法獲得動態的中文字
已試過但無效（都治標）

字型覆蓋率（zh_hant 其實已涵蓋全部用字）、.import 參數（antialiasing / hinting / subpixel）、MSDF、runtime 預渲染（TextServer）、frame-0 warmup（draw_char）、預烘焙 glyph 進 .res、多執行緒 build（thread_support + COOP/COEP，即使 crossOriginIsolated=true 仍方框）。

→ 全部證實是 CanvasLayer 畫布層級的引擎限制，content/專案端無解。

決策（維持結案）

Web 僅作快速 gameplay 測試，正式發行走 Steam 桌面版（渲染器不同、中文完全正常）。故接受 web 中文限制，中文 UI 一律在桌面版驗證。不為 testing-only 的目標做「全 UI 移出 CanvasLayer」的大重構。

唯一保留的正解：essence 符號 ✦(U+2726) → ★(U+2605)（✦ 本就不在字型內，★ 內建跨平台可靠）。

尚未走過、評估後不投入的路徑

- ① BitmapFont（.fnt + texture page）：靜態 glyph 貼圖、不走 runtime atlas，理論上最可能繞過（成本中）
- ② 關鍵中文 UI 從 CanvasLayer 移到 root viewport Control（實測 root 正常 → 確定有效，但全移是重構）
- ③ Godot 版本升級；④ WebGPU 後端（4.6 web 不成熟）


