(() => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const LEVELS = window.CHRONO_LEVELS || [];
  const FPS = 60;
  const DT = 1 / FPS;

  // Player & Echo Dimensions & Physics Constants
  const ACTOR_W = 28;
  const ACTOR_H = 38;
  const MOVE_SPEED = 4.6;
  const GRAVITY = 0.58;
  const JUMP_VEL = -11.2;
  const MAX_FALL = 13.5;

  const ECHO_COLORS = ["#38bdf8", "#f59e0b", "#a855f7"];

  // State
  let lang = "zh";
  let currentLevelIdx = 0;
  let clearedLevels = new Set();

  let currentFrame = 0;
  let maxFrames = 600;
  let state = "playing"; // "playing" | "won" | "timeout" | "dead"
  let failReason = "";

  // Recordings of past loops in current level
  let echoRecordings = [];
  // Current loop recording buffer
  let activeTrace = [];
  // Visual feedback when Auto-Rewind or Manual Rewind triggers
  let rewindEffect = null;

  // Active player entity
  let player = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 1
  };

  // Input state
  const keys = {
    left: false,
    right: false,
    jumpPressed: false,
    jumpJustPressed: false
  };

  // DOM Elements
  const elStage = document.getElementById("val-stage");
  const elTimer = document.getElementById("val-timer");
  const elEchoSlots = document.getElementById("val-echo-slots");
  const elHint = document.getElementById("ui-hint");
  const elPills = document.getElementById("level-pills");
  const elLangBtn = document.getElementById("btn-lang");

  function getLevel() {
    return LEVELS[currentLevelIdx];
  }

  function loadLevel(idx, preserveEchoes = false) {
    currentLevelIdx = (idx + LEVELS.length) % LEVELS.length;
    const lvl = getLevel();
    maxFrames = Math.round((lvl.timeLimit || 10.0) * FPS);
    currentFrame = 0;
    state = "playing";
    failReason = "";
    activeTrace = [];

    if (!preserveEchoes) {
      echoRecordings = [];
      rewindEffect = null;
    }

    player.x = lvl.spawn.x;
    player.y = lvl.spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.facing = 1;

    updateHUD();
    renderLevelPills();
  }

  function triggerRewind(customBannerZh, customBannerEn) {
    const lvl = getLevel();
    if (state === "won") return false;

    if (echoRecordings.length >= lvl.maxEchoes || activeTrace.length < 1) {
      return false;
    }

    let traceToSave = activeTrace.slice();
    // If this is the 1st Echo, trim initial standing-still time at spawn (when player was reading hints)
    // so Echo #1 starts moving promptly on Run 2 without wasting the 10s timer!
    if (echoRecordings.length === 0 && traceToSave.length > 10) {
      let firstMoveIdx = 0;
      const sx = lvl.spawn.x;
      const sy = lvl.spawn.y;
      while (
        firstMoveIdx < traceToSave.length - 1 &&
        Math.abs(traceToSave[firstMoveIdx].x - sx) < 0.5 &&
        Math.abs(traceToSave[firstMoveIdx].y - sy) < 0.5 &&
        traceToSave[firstMoveIdx].vx === 0
      ) {
        firstMoveIdx++;
      }
      if (firstMoveIdx > 6) {
        traceToSave = traceToSave.slice(firstMoveIdx - 6);
      }
    }

    const lastFrame = traceToSave[traceToSave.length - 1];
    echoRecordings.push({
      id: echoRecordings.length + 1,
      frames: traceToSave,
      anchorFrame: { ...lastFrame }
    });

    rewindEffect = {
      x: lastFrame.x + ACTOR_W / 2,
      y: lastFrame.y - 14,
      anchorX: lastFrame.x,
      anchorY: lastFrame.y,
      textZh: customBannerZh || "⏪ 手動回溯：過去自我已定格！",
      textEn: customBannerEn || "⏪ REWIND: ECHO ANCHORED!",
      framesLeft: 85
    };

    loadLevel(currentLevelIdx, true);
    return true;
  }

  function resetLevelFull() {
    loadLevel(currentLevelIdx, false);
  }

  // Get an Echo's state at a given frame index
  function getEchoStateAt(recording, frameIdx) {
    if (frameIdx < recording.frames.length) {
      const f = recording.frames[frameIdx];
      const prev = frameIdx > 0 ? recording.frames[frameIdx - 1] : f;
      return {
        id: recording.id,
        x: f.x,
        y: f.y,
        w: ACTOR_W,
        h: ACTOR_H,
        dx: f.x - prev.x,
        dy: f.y - prev.y,
        anchored: false
      };
    }
    return {
      id: recording.id,
      x: recording.anchorFrame.x,
      y: recording.anchorFrame.y,
      w: ACTOR_W,
      h: ACTOR_H,
      dx: 0,
      dy: 0,
      anchored: true
    };
  }

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function getDepressedPlates(lvl, echoStates) {
    const depressed = new Set();
    const actors = [
      { x: player.x, y: player.y, w: ACTOR_W, h: ACTOR_H },
      ...echoStates
    ];

    for (const plate of lvl.plates || []) {
      const triggerZone = {
        x: plate.x + 2,
        y: plate.y - 6,
        w: plate.w - 4,
        h: plate.h + 8
      };
      for (const act of actors) {
        if (rectsOverlap(act, triggerZone)) {
          depressed.add(plate.id);
          break;
        }
      }
    }
    return depressed;
  }

  function isGateOpen(gate, depressedSet) {
    return gate.plateIds.every((pid) => depressedSet.has(pid));
  }

  function getLaserStatus(laser, frame) {
    const warmupFrames = Math.round((laser.warmup || 0) * FPS);
    if (frame < warmupFrames) {
      return {
        active: false,
        remainSec: (warmupFrames - frame) / FPS
      };
    }
    if (laser.onDuration && laser.offDuration) {
      const onFrames = Math.round(laser.onDuration * FPS);
      const offFrames = Math.round(laser.offDuration * FPS);
      const cycle = onFrames + offFrames;
      const pos = (frame - warmupFrames) % cycle;
      if (pos < onFrames) {
        return {
          active: true,
          remainSec: (onFrames - pos) / FPS
        };
      }
      return {
        active: false,
        remainSec: (cycle - pos) / FPS
      };
    }
    return { active: true, remainSec: 0 };
  }

  // Compute active laser beam rectangle after occlusion by platforms, closed gates, and Echoes!
  function computeLaserBeam(laser, blockers) {
    const thick = laser.thickness || 8;
    const maxLen = laser.maxLength || 960;

    if (laser.dir === "left") {
      let minX = Math.max(0, laser.x - maxLen);
      const beamY = laser.y - thick / 2;
      for (const b of blockers) {
        if (b.y < beamY + thick && b.y + b.h > beamY && b.x + b.w <= laser.x + 2) {
          if (b.x + b.w > minX) {
            minX = b.x + b.w;
          }
        }
      }
      return { x: minX, y: beamY, w: Math.max(0, laser.x - minX), h: thick, hitX: minX, hitY: laser.y };
    }

    if (laser.dir === "right") {
      let maxX = Math.min(960, laser.x + maxLen);
      const beamY = laser.y - thick / 2;
      for (const b of blockers) {
        if (b.y < beamY + thick && b.y + b.h > beamY && b.x >= laser.x - 2) {
          if (b.x < maxX) {
            maxX = b.x;
          }
        }
      }
      return { x: laser.x, y: beamY, w: Math.max(0, maxX - laser.x), h: thick, hitX: maxX, hitY: laser.y };
    }

    if (laser.dir === "down") {
      let maxY = Math.min(540, laser.y + maxLen);
      const beamX = laser.x - thick / 2;
      for (const b of blockers) {
        if (b.x < beamX + thick && b.x + b.w > beamX && b.y >= laser.y - 2) {
          if (b.y < maxY) {
            maxY = b.y;
          }
        }
      }
      return { x: beamX, y: laser.y, w: thick, h: Math.max(0, maxY - laser.y), hitX: laser.x, hitY: maxY };
    }

    // up
    let minY = Math.max(0, laser.y - maxLen);
    const beamX = laser.x - thick / 2;
    for (const b of blockers) {
      if (b.x < beamX + thick && b.x + b.w > beamX && b.y + b.h <= laser.y + 2) {
        if (b.y + b.h > minY) {
          minY = b.y + b.h;
        }
      }
    }
    return { x: beamX, y: minY, w: thick, h: Math.max(0, laser.y - minY), hitX: laser.x, hitY: minY };
  }

  function stepPhysics() {
    if (state !== "playing") return;

    const lvl = getLevel();
    const echoStates = echoRecordings.map((rec) =>
      getEchoStateAt(rec, currentFrame)
    );
    const depressedPlates = getDepressedPlates(lvl, echoStates);

    // Build active 4-way solid colliders:
    // Platforms + Closed Gates + ANCHORED (Frozen) Echoes (Solid Obstacle & Foothold!)
    const solids = [...lvl.platforms];
    for (const gate of lvl.gates || []) {
      if (!isGateOpen(gate, depressedPlates)) {
        solids.push(gate);
      }
    }
    for (const echo of echoStates) {
      if (echo.anchored) {
        // Only add as horizontal/4-way obstacle if not currently overlapping player from the exact rewind frame
        solids.push({ x: echo.x, y: echo.y, w: ACTOR_W, h: ACTOR_H, isEcho: true });
      }
    }

    // 1. Horizontal input
    if (keys.left && !keys.right) {
      player.vx = -MOVE_SPEED;
      player.facing = -1;
    } else if (keys.right && !keys.left) {
      player.vx = MOVE_SPEED;
      player.facing = 1;
    } else {
      player.vx = 0;
    }

    // 2. Jump input
    if (keys.jumpJustPressed && player.grounded) {
      player.vy = JUMP_VEL;
      player.grounded = false;
    }
    keys.jumpJustPressed = false;

    // 3. Apply Gravity
    player.vy = Math.min(player.vy + GRAVITY, MAX_FALL);

    const prevY = player.y;
    const prevBottom = prevY + ACTOR_H;

    // 4. Move Horizontally & resolve solid collisions (including Anchored Echo obstacles!)
    player.x += player.vx;
    for (const s of solids) {
      if (
        rectsOverlap(
          { x: player.x, y: player.y, w: ACTOR_W, h: ACTOR_H },
          s
        )
      ) {
        if (player.vx > 0) {
          player.x = s.x - ACTOR_W;
        } else if (player.vx < 0) {
          player.x = s.x + s.w;
        }
      }
    }

    // 5. Move Vertically & resolve solid collisions
    player.y += player.vy;
    player.grounded = false;

    for (const s of solids) {
      if (
        rectsOverlap(
          { x: player.x, y: player.y, w: ACTOR_W, h: ACTOR_H },
          s
        )
      ) {
        if (player.vy > 0 && prevBottom <= s.y + 12) {
          player.y = s.y - ACTOR_H;
          player.vy = 0;
          player.grounded = true;
        } else if (player.vy < 0 && prevY >= s.y + s.h - 12) {
          player.y = s.y + s.h;
          player.vy = 0;
        }
      }
    }

    // 6. Also allow stepping on top of Replaying (moving) Echoes
    if (player.vy >= 0) {
      for (const echo of echoStates) {
        if (echo.anchored) continue; // Already handled by 4-way solids above
        const horizontalOverlap =
          player.x + ACTOR_W > echo.x + 3 &&
          player.x < echo.x + ACTOR_W - 3;

        if (
          horizontalOverlap &&
          prevBottom <= echo.y + 10 &&
          player.y + ACTOR_H >= echo.y
        ) {
          player.y = echo.y - ACTOR_H;
          player.vy = 0;
          player.grounded = true;
          if (echo.dx !== 0) {
            player.x += echo.dx;
          }
        }
      }
    }

    // 7. Record current frame
    activeTrace.push({
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      grounded: player.grounded
    });

    const playerBox = { x: player.x + 3, y: player.y + 3, w: ACTOR_W - 6, h: ACTOR_H - 5 };

    // 8. Check Spike Traps (Auto-Rewind on Death if Rewind charges remain!)
    for (const sp of lvl.spikes || []) {
      const spikeHitbox = { x: sp.x + 4, y: sp.y + 4, w: sp.w - 8, h: sp.h - 4 };
      if (rectsOverlap(playerBox, spikeHitbox)) {
        if (echoRecordings.length < lvl.maxEchoes) {
          if (!sp.dir || sp.dir === "up") {
            player.y = sp.y + sp.h - ACTOR_H;
            activeTrace[activeTrace.length - 1] = {
              x: player.x,
              y: player.y,
              vx: 0,
              vy: 0,
              grounded: true
            };
          }
          triggerRewind(
            "⚡ 死亡自動回溯：自己已定格為尖刺踏板！",
            "⚡ AUTO-REWIND: FROZEN ON SPIKES AS STEP!"
          );
          return;
        }
        state = "dead";
        failReason =
          lang === "zh"
            ? "回溯次數已耗盡並觸發尖刺 // NO REWINDS LEFT"
            : "ELIMINATED BY SPIKES (0 REWINDS LEFT)";
        updateHUD();
        return;
      }
    }

    // 9. Check Raycast Laser Traps (Blocked by Platforms, Closed Gates, and Echoes!)
    const laserBlockers = [
      ...lvl.platforms,
      ...(lvl.gates || []).filter((g) => !isGateOpen(g, depressedPlates)),
      ...echoStates
    ];
    for (const ls of lvl.lasers || []) {
      const lsStatus = getLaserStatus(ls, currentFrame);
      if (!lsStatus.active) continue;
      const beam = computeLaserBeam(ls, laserBlockers);
      if (rectsOverlap(playerBox, beam)) {
        if (echoRecordings.length < lvl.maxEchoes) {
          // If hit by a horizontal laser near a platform floor, settle Echo onto the platform
          // so its torso squarely blocks the beam and forms a clean grounded stepping stone!
          if (ls.dir === "left" || ls.dir === "right") {
            for (const s of lvl.platforms) {
              if (player.x + ACTOR_W > s.x && player.x < s.x + s.w) {
                const standY = s.y - ACTOR_H;
                if (
                  standY >= player.y - 6 &&
                  standY - player.y <= 36 &&
                  standY <= ls.y &&
                  standY + ACTOR_H >= ls.y
                ) {
                  player.y = standY;
                  break;
                }
              }
            }
          } else if (ls.dir === "down") {
            for (const s of lvl.platforms) {
              if (
                player.x + ACTOR_W > s.x &&
                player.x < s.x + s.w &&
                s.y >= player.y &&
                s.y - (player.y + ACTOR_H) <= 36
              ) {
                player.y = s.y - ACTOR_H;
                break;
              }
            }
          }
          activeTrace[activeTrace.length - 1] = {
            x: player.x,
            y: player.y,
            vx: 0,
            vy: 0,
            grounded: true
          };
          triggerRewind(
            "⚡ 死亡自動回溯：自己已定格擋住死光！",
            "⚡ AUTO-REWIND: FROZEN AS LASER SHIELD!"
          );
          return;
        }
        state = "dead";
        failReason =
          lang === "zh"
            ? "回溯次數已耗盡並遭死光擊中 // NO REWINDS LEFT"
            : "ELIMINATED BY LASER (0 REWINDS LEFT)";
        updateHUD();
        return;
      }
    }

    // 10. Check Goal Door Reached
    if (
      rectsOverlap(
        { x: player.x, y: player.y, w: ACTOR_W, h: ACTOR_H },
        lvl.goal
      )
    ) {
      state = "won";
      clearedLevels.add(lvl.id);
      renderLevelPills();
      updateHUD();
      return;
    }

    // 11. Advance 10-Second Timer
    currentFrame++;
    if (currentFrame >= maxFrames) {
      state = "timeout";
      failReason = lang === "zh" ? "10秒時限已到，目標門已關閉 // DOOR LOCKED" : "10s EXPIRED — GOAL DOOR LOCKED";
    }

    updateHUD();
  }

  function updateHUD() {
    const lvl = getLevel();
    const remainSec = Math.max(0, (maxFrames - currentFrame) / FPS);
    elStage.textContent = `${lvl.code} · ${lvl.title[lang]}`;
    elTimer.textContent = `${remainSec.toFixed(2)}s`;
    if (remainSec <= 3.0) {
      elTimer.classList.add("warning");
    } else {
      elTimer.classList.remove("warning");
    }

    const used = echoRecordings.length;
    let slotsHtml = "";
    for (let i = 0; i < lvl.maxEchoes; i++) {
      const isUsed = i < used;
      slotsHtml += `<span class="echo-dot ${isUsed ? "used" : ""}" title="Echo Slot"></span>`;
    }
    elEchoSlots.innerHTML = slotsHtml;

    elHint.textContent = lvl.hint[lang];
  }

  function renderLevelPills() {
    elPills.innerHTML = LEVELS.map((lvl, idx) => {
      const active = idx === currentLevelIdx ? "active" : "";
      const cleared = clearedLevels.has(lvl.id) ? "cleared" : "";
      return `<button type="button" class="level-pill ${active} ${cleared}" data-idx="${idx}">0${lvl.id}</button>`;
    }).join("");

    elPills.querySelectorAll(".level-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-idx"));
        loadLevel(idx, false);
      });
    });
  }

  function drawSpikes(sp) {
    const toothW = 14;
    const count = Math.max(1, Math.floor(sp.w / toothW));
    const actualToothW = sp.w / count;

    ctx.fillStyle = "#f43f5e";
    ctx.strokeStyle = "#fda4af";
    ctx.lineWidth = 1;

    for (let i = 0; i < count; i++) {
      const sx = sp.x + i * actualToothW;
      ctx.beginPath();
      ctx.moveTo(sx, sp.y + sp.h);
      ctx.lineTo(sx + actualToothW / 2, sp.y);
      ctx.lineTo(sx + actualToothW, sp.y + sp.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawGoalDoorWithTimer(g, remainSec, ratio) {
    const isUrgent = remainSec <= 3.0;
    const isClosed = remainSec <= 0;
    const doorColor = isClosed ? "#64748b" : isUrgent ? "#f43f5e" : "#00d2c4";

    // Outer Door Frame
    ctx.fillStyle = "#0b1018";
    ctx.fillRect(g.x - 4, g.y - 4, g.w + 8, g.h + 4);
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(g.x - 4, g.y - 4, g.w + 8, g.h + 4);

    // Inner Portal Energy / Shutter
    if (!isClosed) {
      const pulse = 0.65 + 0.35 * Math.sin(performance.now() * 0.008);
      ctx.fillStyle = isUrgent
        ? `rgba(244, 63, 94, ${0.28 * pulse})`
        : `rgba(0, 210, 196, ${0.24 * pulse})`;
      ctx.fillRect(g.x, g.y, g.w, g.h);

      // Depleting vertical energy bars on both sides of the door
      const fillH = Math.round(g.h * ratio);
      ctx.fillStyle = doorColor;
      ctx.fillRect(g.x, g.y + (g.h - fillH), 4, fillH);
      ctx.fillRect(g.x + g.w - 4, g.y + (g.h - fillH), 4, fillH);
    } else {
      // Closed blast door
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(g.x, g.y, g.w, g.h);
    }

    // Countdown Timer Digital Display Panel Mounted Directly Above Goal Door!
    const badgeW = 78;
    const badgeH = 28;
    const badgeX = g.x + g.w / 2 - badgeW / 2;
    const badgeY = g.y - badgeH - 10;

    ctx.fillStyle = "#080b11";
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    // Progress bar along bottom of timer badge
    ctx.fillStyle = doorColor;
    ctx.fillRect(badgeX + 2, badgeY + badgeH - 4, (badgeW - 4) * ratio, 2.5);

    // Big Digital Countdown Text on Door
    ctx.fillStyle = isUrgent ? "#fda4af" : "#ffffff";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${remainSec.toFixed(1)}s`, g.x + g.w / 2, badgeY + 18);
  }

  function drawScene() {
    const lvl = getLevel();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Tactical Grid Background
    ctx.strokeStyle = "rgba(0, 210, 196, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const echoStates = echoRecordings.map((rec) =>
      getEchoStateAt(rec, currentFrame)
    );
    const depressedPlates = getDepressedPlates(lvl, echoStates);

    // 2. Draw Platforms
    for (const p of lvl.platforms) {
      ctx.fillStyle = "#111722";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "rgba(0, 210, 196, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);

      ctx.fillStyle = "rgba(0, 210, 196, 0.5)";
      ctx.fillRect(p.x, p.y, p.w, 3);
    }

    // 3. Draw Spikes
    for (const sp of lvl.spikes || []) {
      drawSpikes(sp);
    }

    // 4. Draw Pressure Plates
    for (const plate of lvl.plates || []) {
      const active = depressedPlates.has(plate.id);
      ctx.fillStyle = active ? plate.color : "rgba(255,255,255,0.28)";
      const drawY = active ? plate.y + 4 : plate.y;
      const drawH = active ? plate.h - 4 : plate.h;
      ctx.fillRect(plate.x, drawY, plate.w, drawH);

      ctx.font = "bold 10px monospace";
      ctx.fillStyle = plate.color;
      ctx.textAlign = "center";
      ctx.fillText(
        active ? "UNLOCKED" : "PLATE",
        plate.x + plate.w / 2,
        plate.y - 6
      );
    }

    // 5. Draw Gates
    for (const gate of lvl.gates || []) {
      const open = isGateOpen(gate, depressedPlates);
      if (open) {
        ctx.strokeStyle = gate.color;
        ctx.setLineDash([4, 6]);
        ctx.strokeRect(gate.x, gate.y, gate.w, gate.h);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = "rgba(0, 210, 196, 0.18)";
        ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
        ctx.strokeStyle = gate.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(gate.x, gate.y, gate.w, gate.h);
        ctx.fillStyle = gate.color;
        ctx.fillRect(gate.x + gate.w / 2 - 2, gate.y, 4, gate.h);
      }
    }

    // 6. Draw Raycast Lasers (Blocked by Solid Echoes!)
    const laserBlockers = [
      ...lvl.platforms,
      ...(lvl.gates || []).filter((g) => !isGateOpen(g, depressedPlates)),
      ...echoStates
    ];
    for (const ls of lvl.lasers || []) {
      const beam = computeLaserBeam(ls, laserBlockers);
      // Outer laser glow
      ctx.fillStyle = "rgba(244, 63, 94, 0.32)";
      ctx.fillRect(beam.x - 2, beam.y - 2, beam.w + 4, beam.h + 4);
      // Core laser beam
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(beam.x, beam.y, beam.w, beam.h);
      ctx.fillStyle = "#ffe4e6";
      ctx.fillRect(
        beam.x + (ls.dir === "up" || ls.dir === "down" ? 2 : 0),
        beam.y + (ls.dir === "left" || ls.dir === "right" ? 2 : 0),
        ls.dir === "up" || ls.dir === "down" ? beam.w - 4 : beam.w,
        ls.dir === "left" || ls.dir === "right" ? beam.h - 4 : beam.h
      );

      // Impact spark at hit point
      ctx.fillStyle = "#fda4af";
      ctx.beginPath();
      ctx.arc(beam.hitX, beam.hitY, 5 + Math.sin(performance.now() * 0.03) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Draw Spawn Marker
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(lvl.spawn.x, lvl.spawn.y, ACTOR_W, ACTOR_H);
    ctx.setLineDash([]);

    // 8. Draw Goal Door with Mounted 10s Countdown Timer
    const remainSec = Math.max(0, (maxFrames - currentFrame) / FPS);
    const remainRatio = Math.max(0, Math.min(1, (maxFrames - currentFrame) / maxFrames));
    drawGoalDoorWithTimer(lvl.goal, remainSec, remainRatio);

    // 9. Draw Echo Trajectory Paths & Echo Actors
    echoRecordings.forEach((rec, idx) => {
      const color = ECHO_COLORS[idx % ECHO_COLORS.length];
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < rec.frames.length; i += 3) {
        const pt = rec.frames[i];
        const cx = pt.x + ACTOR_W / 2;
        const cy = pt.y + ACTOR_H / 2;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      const est = echoStates[idx];
      if (est.anchored) {
        // Solidified Obstacle & Foothold Appearance
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(est.x, est.y, ACTOR_W, ACTOR_H);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(est.x, est.y, ACTOR_W, ACTOR_H);

        // Diagonal armor hatch lines to show it's a solid block
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(est.x + 4, est.y + ACTOR_H - 4);
        ctx.lineTo(est.x + ACTOR_W - 4, est.y + 4);
        ctx.stroke();
      } else {
        // Draw destination Anchor Silhouette so player sees where this Echo will freeze
        const af = rec.anchorFrame;
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(af.x, af.y, ACTOR_W, ACTOR_H);
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Replaying Ghost Appearance
        ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
        ctx.fillRect(est.x, est.y, ACTOR_W, ACTOR_H);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(est.x, est.y, ACTOR_W, ACTOR_H);
        ctx.setLineDash([]);
      }

      // Top foothold bar
      ctx.fillStyle = color;
      ctx.fillRect(est.x - 2, est.y - 2, ACTOR_W + 4, 4);

      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        est.anchored ? `SOLID #${rec.id}` : `ECHO #${rec.id}`,
        est.x + ACTOR_W / 2,
        est.y - 7
      );
    });

    // 10. Draw Active Player
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x, player.y, ACTOR_W, ACTOR_H);
    ctx.strokeStyle = "#00d2c4";
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, ACTOR_W, ACTOR_H);

    ctx.fillStyle = "#080a0f";
    const eyeX = player.facing > 0 ? player.x + 15 : player.x + 4;
    ctx.fillRect(eyeX, player.y + 8, 9, 6);

    ctx.fillStyle = "#00d2c4";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("YOU", player.x + ACTOR_W / 2, player.y - 7);

    // 10.5 Draw Auto-Rewind / Manual Rewind Notification Banner & Pulse Ring
    if (rewindEffect && rewindEffect.framesLeft > 0) {
      const alpha = Math.min(1, rewindEffect.framesLeft / 25);
      const progress = 1 - rewindEffect.framesLeft / 85;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Shockwave ring at the frozen Echo spot
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        rewindEffect.anchorX + ACTOR_W / 2,
        rewindEffect.anchorY + ACTOR_H / 2,
        18 + progress * 36,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Top notification toast
      const bannerW = 380;
      const bannerH = 30;
      const bx = (canvas.width - bannerW) / 2;
      const by = 18;
      ctx.fillStyle = "rgba(13, 17, 24, 0.92)";
      ctx.fillRect(bx, by, bannerW, bannerH);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bannerW, bannerH);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        lang === "zh" ? rewindEffect.textZh : rewindEffect.textEn,
        canvas.width / 2,
        by + 20
      );
      ctx.restore();
      rewindEffect.framesLeft--;
    }

    // 11. Modal Banner for Win / Timeout / Trap Death
    if (state !== "playing") {
      ctx.fillStyle = "rgba(8, 10, 15, 0.84)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = state === "won" ? "#00d2c4" : "#f43f5e";
      ctx.lineWidth = 2;
      ctx.strokeRect(210, 170, 540, 200);
      ctx.fillStyle = "#0d1118";
      ctx.fillRect(210, 170, 540, 200);

      ctx.textAlign = "center";
      ctx.fillStyle = state === "won" ? "#00d2c4" : "#f43f5e";
      ctx.font = "bold 25px monospace";

      if (state === "won") {
        const isLast = currentLevelIdx === LEVELS.length - 1;
        ctx.fillText(
          lang === "zh" ? "STAGE SYNCHRONIZED // 關卡突破" : "STAGE SYNCHRONIZED",
          480,
          230
        );
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "14px monospace";
        const usedSec = (currentFrame / FPS).toFixed(2);
        ctx.fillText(
          lang === "zh"
            ? `本輪耗時 ${usedSec}s · 使用回溯 ${echoRecordings.length}/${lvl.maxEchoes} 次`
            : `Cleared in ${usedSec}s · Echoes used: ${echoRecordings.length}/${lvl.maxEchoes}`,
          480,
          272
        );
        ctx.fillStyle = "#00d2c4";
        ctx.font = "bold 15px monospace";
        ctx.fillText(
          isLast
            ? lang === "zh"
              ? "🎉 恭喜全破！按 [Space / Enter] 或點擊畫面重新挑戰"
              : "🎉 ALL STAGES CLEARED! Press [Space / Click] to Replay"
            : lang === "zh"
              ? "按 [Space / Enter] 或點擊畫面進入下一關 →"
              : "Press [Space / Enter] or Click for Next Stage →",
          480,
          325
        );
      } else {
        ctx.fillText(
          failReason || (lang === "zh" ? "TIMELINE COLLAPSED // 失敗" : "TIMELINE COLLAPSED"),
          480,
          228
        );
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "14px monospace";
        ctx.fillText(
          lang === "zh"
            ? "按 [Space / 點擊畫面] 保留既有幻影重試本輪，或按 [R] 完全重置本關"
            : "Press [Space / Click] to retry loop (keep echoes), or [R] to full reset",
          480,
          285
        );
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 13px monospace";
        ctx.fillText(
          lang === "zh"
            ? "提示：有回溯次數時觸發陷阱會自動回溯定格；次數耗盡則需按 [R] 重新規劃！"
            : "Tip: Hitting a trap with Rewinds left auto-freezes your echo; press [R] to reset all!",
          480,
          330
        );
      }
    }
  }

  function advanceOrRetryOnModal() {
    if (state === "won") {
      loadLevel((currentLevelIdx + 1) % LEVELS.length, false);
    } else {
      // Retry current loop while keeping already-recorded echoes!
      loadLevel(currentLevelIdx, true);
    }
  }

  window.addEventListener("keydown", (e) => {
    const code = e.code;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(code)) {
      e.preventDefault();
    }

    if (state !== "playing") {
      if (code === "Space" || code === "Enter") {
        advanceOrRetryOnModal();
        return;
      }
      if (code === "KeyR") {
        resetLevelFull();
        return;
      }
    }

    if (code === "KeyA" || code === "ArrowLeft") keys.left = true;
    if (code === "KeyD" || code === "ArrowRight") keys.right = true;
    if (code === "KeyW" || code === "ArrowUp" || code === "Space") {
      if (!keys.jumpPressed) {
        keys.jumpJustPressed = true;
      }
      keys.jumpPressed = true;
    }
    if (code === "KeyE" || code === "ShiftLeft" || code === "ShiftRight" || code === "KeyK") {
      triggerRewind();
    }
    if (code === "KeyR") {
      resetLevelFull();
    }
  });

  window.addEventListener("keyup", (e) => {
    const code = e.code;
    if (code === "KeyA" || code === "ArrowLeft") keys.left = false;
    if (code === "KeyD" || code === "ArrowRight") keys.right = false;
    if (code === "KeyW" || code === "ArrowUp" || code === "Space") {
      keys.jumpPressed = false;
    }
  });

  canvas.addEventListener("click", () => {
    if (state !== "playing") {
      advanceOrRetryOnModal();
    }
  });

  function bindHoldButton(btnId, keyName) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const start = (e) => {
      e.preventDefault();
      keys[keyName] = true;
      btn.classList.add("pressed");
    };
    const end = (e) => {
      e.preventDefault();
      keys[keyName] = false;
      btn.classList.remove("pressed");
    };
    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointerleave", end);
    btn.addEventListener("pointercancel", end);
  }

  bindHoldButton("btn-left", "left");
  bindHoldButton("btn-right", "right");

  const btnJump = document.getElementById("btn-jump");
  btnJump.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state !== "playing") {
      advanceOrRetryOnModal();
      return;
    }
    keys.jumpJustPressed = true;
    keys.jumpPressed = true;
    btnJump.classList.add("pressed");
  });
  const endJump = (e) => {
    e.preventDefault();
    keys.jumpPressed = false;
    btnJump.classList.remove("pressed");
  };
  btnJump.addEventListener("pointerup", endJump);
  btnJump.addEventListener("pointerleave", endJump);

  document.getElementById("btn-rewind").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    triggerRewind();
  });

  document.getElementById("btn-reset").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    resetLevelFull();
  });

  elLangBtn.addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    updateHUD();
  });

  let lastTime = performance.now();
  let accumulator = 0;

  function loop(now) {
    const delta = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    accumulator += delta;

    while (accumulator >= DT) {
      stepPhysics();
      accumulator -= DT;
    }

    drawScene();
    requestAnimationFrame(loop);
  }

  loadLevel(0, false);
  requestAnimationFrame(loop);
})();
