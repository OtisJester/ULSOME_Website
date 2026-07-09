/**
 * 矩陣河內塔：空間躍遷 (Grid Hanoi Puzzle)
 * 核心遊戲邏輯與渲染控制
 */

// 遊戲狀態變數
let gridWidth = 3;
let gridHeight = 3;
let diskCount = 3;
let shuffleSteps = 30;
let towersCount = 1; // 塔的數量 (1~3)
let wrapAround = false; // 邊界是否相通

let board = []; // 2D 陣列，儲存各格子的圓盤堆疊
let initialBoard = []; // 保存關卡初始狀態，用於重置
let targetCells = []; // 儲存多個目標堆疊格的座標 [{x, y}, ...]

let selectedCell = null; // 當前選取的格子 { x, y }
let validMoves = []; // 當前可行移動目標的座標陣列 [{x, y}, ...]
let moveCount = 0;
let history = []; // 用於悔步的歷史狀態棧
let optimalMoves = 0; // 當前關卡最佳步數
let solverWorker = null; // 背景計算的 Web Worker 實例

// 對局模式（VS AI）狀態
let gameMode = 'solo'; // 'solo' | 'match'
const PLAYER_GROUP = 1;
const AI_GROUP = 2;
let currentTurn = 'player'; // 'player' | 'ai'，僅對局模式使用
let pendingForced = { player: null, ai: null }; // 壓制義務：{ diskId, originCell } | null
let matchOver = false;
let aiThinkingTimeout = null;
let lastAiHeuristicMoveKey = null; // 用於避免 AI 備援策略時原地來回震盪
let lastAiScrambleMoveKey = null; // 用於避免 AI 打散階段原地來回震盪

// 對局模式：開局「打散階段」狀態
let matchPhase = 'battle'; // 'scramble' | 'battle'，僅對局模式使用
let scrambleBudget = { player: 0, ai: 0 }; // 雙方各自剩餘的打散步數額度（解除壓制義務不會消耗額度）

// DOM 元素參考
const domBoard = document.getElementById('game-board');
const domMoveCount = document.getElementById('move-count');
const domOptimalCount = document.getElementById('optimal-count');
const domOptimalStatBox = document.getElementById('optimal-stat-box');
const domTargetsContainer = document.getElementById('targets-container');

// 模式切換與對局狀態列
const btnModeSolo = document.getElementById('btn-mode-solo');
const btnModeMatch = document.getElementById('btn-mode-match');
const towersControlGroup = document.getElementById('towers-control-group');
const difficultyControlGroup = document.getElementById('difficulty-control-group');
const scrambleStepsControlGroup = document.getElementById('scramble-steps-control-group');
const matchStatusBar = document.getElementById('match-status-bar');
const matchTurnText = document.getElementById('match-turn-text');
const matchForcedBanner = document.getElementById('match-forced-banner');

// 輸入控制項
const inputWidth = document.getElementById('input-width');
const inputHeight = document.getElementById('input-height');
const inputDisks = document.getElementById('input-disks');
const inputTowers = document.getElementById('input-towers');
const inputWrap = document.getElementById('input-wrap');
const inputDifficulty = document.getElementById('input-difficulty');
const inputScrambleSteps = document.getElementById('input-scramble-steps');

// 數值顯示
const valWidth = document.getElementById('val-width');
const valHeight = document.getElementById('val-height');
const valDisks = document.getElementById('val-disks');
const valTowers = document.getElementById('val-towers');
const valDifficulty = document.getElementById('val-difficulty');
const valScrambleSteps = document.getElementById('val-scramble-steps');
const domTargetCoordsList = document.getElementById('target-coords-list');

// 按鈕與彈窗
const btnNewGame = document.getElementById('btn-new-game');
const btnUndo = document.getElementById('btn-undo');
const btnRestart = document.getElementById('btn-restart');
const btnHelp = document.getElementById('btn-help');
const modalHelp = document.getElementById('modal-help');
const modalVictory = document.getElementById('modal-victory');
const btnNextVictory = document.getElementById('btn-next-victory');

// ==========================================
// 初始化與事件綁定
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // 綁定輸入滑動條事件，同步顯示數值
    inputWidth.addEventListener('input', (e) => {
        valWidth.textContent = e.target.value;
        updateTargetPreview(parseInt(e.target.value), parseInt(inputHeight.value), parseInt(inputTowers.value));
    });
    inputHeight.addEventListener('input', (e) => {
        valHeight.textContent = e.target.value;
        updateTargetPreview(parseInt(inputWidth.value), parseInt(e.target.value), parseInt(inputTowers.value));
    });
    inputDisks.addEventListener('input', (e) => valDisks.textContent = e.target.value);
    inputTowers.addEventListener('input', (e) => {
        valTowers.textContent = e.target.value;
        updateTargetPreview(parseInt(inputWidth.value), parseInt(inputHeight.value), parseInt(e.target.value));
    });
    inputDifficulty.addEventListener('input', (e) => valDifficulty.textContent = e.target.value);
    inputScrambleSteps.addEventListener('input', (e) => valScrambleSteps.textContent = e.target.value);

    // 綁定模式切換按鈕
    btnModeSolo.addEventListener('click', () => switchGameMode('solo'));
    btnModeMatch.addEventListener('click', () => switchGameMode('match'));

    // 綁定控制按鈕
    btnNewGame.addEventListener('click', startNewGame);
    btnUndo.addEventListener('click', undoMove);
    btnRestart.addEventListener('click', restartLevel);
    btnHelp.addEventListener('click', () => showModal(modalHelp));
    btnNextVictory.addEventListener('click', () => {
        hideModal(modalVictory);
        startNewGame();
    });

    // 點擊彈窗關閉按鈕
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(modalHelp);
            hideModal(modalVictory);
        });
    });

    // 初始化第一局遊戲
    startNewGame();
    // 預設顯示說明彈窗，幫助新手理解規則
    showModal(modalHelp);
});

// 計算多個目標格位置
function calculateTargets(w, h, towers) {
    const targets = [];
    if (towers === 1) {
        targets.push({ x: Math.floor(w / 2), y: Math.floor(h / 2) });
    } else if (towers === 2) {
        targets.push({ x: 0, y: 0 });
        targets.push({ x: w - 1, y: h - 1 });
    } else {
        targets.push({ x: 0, y: 0 });
        targets.push({ x: w - 1, y: h - 1 });
        targets.push({ x: w - 1, y: 0 });
    }
    
    // 去重與邊界安全檢查
    const uniqueTargets = [];
    const visitedStr = new Set();
    for (const t of targets) {
        const key = `${t.x},${t.y}`;
        if (!visitedStr.has(key) && t.x >= 0 && t.x < w && t.y >= 0 && t.y < h) {
            visitedStr.add(key);
            uniqueTargets.push(t);
        }
    }
    
    // 如果因為棋盤過小導致角落重疊，則依序分配剩餘空格
    let scanX = 0;
    let scanY = 0;
    while (uniqueTargets.length < towers) {
        if (scanY >= h) break;
        const key = `${scanX},${scanY}`;
        if (!visitedStr.has(key)) {
            visitedStr.add(key);
            uniqueTargets.push({ x: scanX, y: scanY });
        }
        scanX++;
        if (scanX >= w) {
            scanX = 0;
            scanY++;
        }
    }
    return uniqueTargets;
}

// 更新目標提示預覽
function updateTargetPreview(w, h, towers) {
    const targets = calculateTargets(w, h, towers);
    domTargetCoordsList.innerHTML = targets.map((t, idx) => {
        const groupName = ['紅塔', '藍塔', '綠塔'][idx];
        const colorName = ['#ff69b4', '#00f2fe', '#39ff14'][idx];
        return `<div style="color: ${colorName}; font-weight: bold; font-size: 0.8rem; margin-top: 2px;">
            ${groupName}: ${getCellLabel(t.x, t.y)} (${t.x}, ${t.y})
        </div>`;
    }).join('');
}

// 顯示彈窗
function showModal(modal) {
    modal.classList.add('show');
}

// 隱藏彈窗
function hideModal(modal) {
    modal.classList.remove('show');
}

// 座標轉為字母標記 (例如 x=2, y=1 ➔ "C2")
function getCellLabel(x, y) {
    const letters = 'ABCDEFGH';
    return `${letters[x]}${y + 1}`;
}

// 深度複製棋盤狀態
function cloneBoardState(sourceBoard) {
    return sourceBoard.map(row => row.map(stack => [...stack]));
}

// ==========================================
// 核心遊戲邏輯
// ==========================================

// 切換遊戲模式（單人 / 對局）
function switchGameMode(mode) {
    gameMode = mode;
    btnModeSolo.classList.toggle('active', mode === 'solo');
    btnModeMatch.classList.toggle('active', mode === 'match');
    towersControlGroup.style.display = mode === 'match' ? 'none' : '';
    difficultyControlGroup.style.display = mode === 'match' ? 'none' : '';
    scrambleStepsControlGroup.style.display = mode === 'match' ? '' : 'none';
    matchStatusBar.style.display = mode === 'match' ? 'flex' : 'none';
    domOptimalStatBox.style.display = mode === 'match' ? 'none' : '';
    btnUndo.style.display = mode === 'match' ? 'none' : '';

    if (mode === 'match') {
        inputTowers.value = 2;
        valTowers.textContent = '2';
    }

    startNewGame();
}

// 開始全新一局
function startNewGame() {
    gridWidth = parseInt(inputWidth.value);
    gridHeight = parseInt(inputHeight.value);
    diskCount = parseInt(inputDisks.value);
    towersCount = gameMode === 'match' ? 2 : parseInt(inputTowers.value);
    wrapAround = inputWrap.checked;
    shuffleSteps = parseInt(inputDifficulty.value);

    // 計算多個目標格位置
    targetCells = calculateTargets(gridWidth, gridHeight, towersCount);

    // 顯示目標提示與側邊欄
    updateTargetPreview(gridWidth, gridHeight, towersCount);
    renderTargetsContainer();

    // 重置步數與歷史
    moveCount = 0;
    domMoveCount.textContent = moveCount;
    history = [];
    selectedCell = null;
    validMoves = [];
    updateUndoButtonState();

    // 重置對局模式狀態
    if (aiThinkingTimeout) {
        clearTimeout(aiThinkingTimeout);
        aiThinkingTimeout = null;
    }
    currentTurn = 'player';
    pendingForced = { player: null, ai: null };
    matchOver = false;
    lastAiHeuristicMoveKey = null;
    lastAiScrambleMoveKey = null;
    matchPhase = 'battle';

    if (gameMode === 'match') {
        // 對局模式：開局雙方河內塔都已完成，改由雙方互相打散對方的塔，而不是隨機生成
        board = buildFullySolvedBoard();
        initialBoard = cloneBoardState(board);
        domOptimalCount.textContent = '—';
        renderBoard();
        beginScramblePhase();
        return;
    }

    // 單人模式：生成隨機有解的關卡
    updateMatchStatusUI();
    generateSolvablePuzzle();

    // 保存初始狀態用於重置
    initialBoard = cloneBoardState(board);

    // 計算最佳解法步數
    calculateOptimalMoves();

    // 繪製棋盤
    renderBoard();
}

// 建立一個各塔都已在自己終點完成堆疊的棋盤（對局模式打散階段的起點）
function buildFullySolvedBoard() {
    const solved = [];
    for (let y = 0; y < gridHeight; y++) {
        const row = [];
        for (let x = 0; x < gridWidth; x++) {
            row.push([]);
        }
        solved.push(row);
    }
    for (let i = 0; i < towersCount; i++) {
        const target = targetCells[i];
        const groupOffset = (i + 1) * 100;
        const goalStack = [];
        for (let d = diskCount; d >= 1; d--) {
            goalStack.push(groupOffset + d);
        }
        solved[target.y][target.x] = goalStack;
    }
    return solved;
}

// 動態渲染頂部目標格容器
function renderTargetsContainer() {
    domTargetsContainer.innerHTML = targetCells.map((t, idx) => {
        const groupName = ['紅塔', '藍塔', '綠塔'][idx];
        const badgeClass = `target-badge-g${idx+1}`;
        return `<span class="target-badge ${badgeClass}">${groupName}: ${getCellLabel(t.x, t.y)}</span>`;
    }).join('');
}

// 重置當前關卡
function restartLevel() {
    // 對局模式的「重置」等同於重新開一局：雙方的塔重新回到完成狀態，並重新走一次打散階段
    if (gameMode === 'match') {
        startNewGame();
        return;
    }

    board = cloneBoardState(initialBoard);
    moveCount = 0;
    domMoveCount.textContent = moveCount;
    history = [];
    selectedCell = null;
    validMoves = [];
    updateUndoButtonState();
    renderBoard();
}

// 悔步（對局模式不支援悔步，回合制對戰重來請用「重置」）
function undoMove() {
    if (gameMode === 'match') return;
    if (history.length === 0) return;
    board = history.pop();
    moveCount = Math.max(0, moveCount - 1);
    domMoveCount.textContent = moveCount;
    selectedCell = null;
    validMoves = [];
    updateUndoButtonState();
    renderBoard();
}

function updateUndoButtonState() {
    btnUndo.disabled = history.length === 0;
}

// ==========================================
// 規則演算：合法移動檢測
// ==========================================

// 圓盤輔助函數：取得實際尺寸 (1~6)
function getDiskSize(val) {
    return val % 100;
}

// 圓盤輔助函數：取得塔組別 (1~3)
function getDiskGroup(val) {
    return Math.floor(val / 100);
}

// 取得座標 (cx, cy) 是哪個塔的終點格，回傳其群組編號 (1~3)；不是任何終點格則回傳 0
function getTargetOwnerGroup(cx, cy) {
    for (let i = 0; i < targetCells.length; i++) {
        if (targetCells[i].x === cx && targetCells[i].y === cy) return i + 1;
    }
    return 0;
}

/**
 * 取得給定格子在當前棋盤狀態下的所有合法移動目標
 *
 * 規則：圓盤可以移動到同一橫列或同一直行中的任意格子（不論距離、不論
 * 中間格放了什麼），只要落點本身不違反大小限制（落點是空格，或落點最
 * 上層圓盤比自己大）。wrap-around 選項在此規則下已無作用——因為整條
 * 橫列與直行原本就已經全部可達。
 *
 * 多塔規則：不能佔據「不屬於自己」的終點格——不論該格是空的還是比自己
 * 大，只要那格是別的塔的終點，就一律禁止落腳。這是為了讓雙塔／多塔對局
 * 不會出現「把自己的大盤堆到對方終點上，永久卡死對方」的漏洞。
 */
function getValidMovesForCell(x, y, currentBoard = board) {
    const stack = currentBoard[y][x];
    if (!stack || stack.length === 0) return [];

    const topDisk = stack[stack.length - 1]; // 取得最上層圓盤
    const topDiskSize = getDiskSize(topDisk);
    const moverGroup = getDiskGroup(topDisk);
    const moves = [];

    const isLegalLanding = (destStack, destX, destY) => {
        if (towersCount > 1) {
            const ownerGroup = getTargetOwnerGroup(destX, destY);
            if (ownerGroup !== 0 && ownerGroup !== moverGroup) return false;
        }
        return destStack.length === 0 || getDiskSize(destStack[destStack.length - 1]) > topDiskSize;
    };

    // 同一橫列（縱向不變，橫向任意格）
    for (let nx = 0; nx < gridWidth; nx++) {
        if (nx === x) continue;
        if (isLegalLanding(currentBoard[y][nx], nx, y)) {
            moves.push({ x: nx, y });
        }
    }

    // 同一直行（橫向不變，縱向任意格）
    for (let ny = 0; ny < gridHeight; ny++) {
        if (ny === y) continue;
        if (isLegalLanding(currentBoard[ny][x], x, ny)) {
            moves.push({ x, y: ny });
        }
    }

    return moves;
}

// ==========================================
// 逆推關卡生成器 (Retrograde Shuffler)
// ==========================================

function generateSolvablePuzzle() {
    // 1. 初始化空棋盤
    board = [];
    for (let y = 0; y < gridHeight; y++) {
        const row = [];
        for (let x = 0; x < gridWidth; x++) {
            row.push([]);
        }
        board.push(row);
    }

    // 2. 建立多塔完美終局狀態
    for (let i = 0; i < towersCount; i++) {
        const target = targetCells[i];
        const groupOffset = (i + 1) * 100;
        const goalStack = [];
        for (let d = diskCount; d >= 1; d--) {
            goalStack.push(groupOffset + d);
        }
        board[target.y][target.x] = goalStack;
    }

    // 3. 執行逆向倒帶 (Reverse Rewind)
    let lastMoveKey = null; // 用於避免無效的來回往復 (e.g. A->B->A)
    let actualSteps = 0;

    for (let step = 0; step < shuffleSteps; step++) {
        // 尋找當前所有可動的盤子及它們合法的反向移動目標
        const allPossibleMoves = [];

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const stack = board[y][x];
                if (stack.length === 0) continue;

                const moverGroup = getDiskGroup(stack[stack.length - 1]);

                // 計算該格子頂層圓盤的所有合法移動
                const destinations = getValidMovesForCell(x, y, board);
                for (const dest of destinations) {
                    // 對局模式生成起始盤面時，不允許洗出「壓制」狀態——落點若已有
                    // 別人顏色的圓盤就跳過，避免開局就出現一顆沒有人需要負責解除的
                    // 卡住圓盤（強制解除機制只會追蹤「玩家自己造成」的壓制，生成階段
                    // 洗出來的壓制永遠不會被強制解開）。
                    if (gameMode === 'match') {
                        const destStack = board[dest.y][dest.x];
                        if (destStack.length > 0 && getDiskGroup(destStack[destStack.length - 1]) !== moverGroup) {
                            continue;
                        }
                    }

                    const moveKey = `${x},${y}->${dest.x},${dest.y}`;
                    const reverseMoveKey = `${dest.x},${dest.y}->${x},${y}`;

                    allPossibleMoves.push({
                        from: { x, y },
                        to: dest,
                        key: moveKey,
                        revKey: reverseMoveKey
                    });
                }
            }
        }

        if (allPossibleMoves.length === 0) {
            break;
        }

        let filteredMoves = allPossibleMoves.filter(m => m.key !== lastMoveKey);
        if (filteredMoves.length === 0) {
            filteredMoves = allPossibleMoves;
        }

        const chosenMove = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
        
        const disk = board[chosenMove.from.y][chosenMove.from.x].pop();
        board[chosenMove.to.y][chosenMove.to.x].push(disk);

        lastMoveKey = chosenMove.revKey;
        actualSteps++;
    }

    console.log(`關卡生成完畢，實際逆向倒帶步數: ${actualSteps}`);
}

// ==========================================
// 勝利條件檢測
// ==========================================

function checkVictory() {
    // 1. 檢查除了目標格以外的格子是否全部清空
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            // 判斷是否為目標格之一
            const isTarget = targetCells.some(t => t.x === x && t.y === y);
            if (!isTarget && board[y][x].length > 0) return false;
        }
    }

    // 2. 檢查每個目標格的圓盤是否完全正確 (顏色與大小順序)
    for (let i = 0; i < towersCount; i++) {
        const target = targetCells[i];
        const stack = board[target.y][target.x];
        const groupOffset = (i + 1) * 100;

        if (stack.length !== diskCount) return false;

        // 檢查順序與顏色 (如 [103, 102, 101])
        for (let d = 0; d < diskCount; d++) {
            const expectedDisk = groupOffset + (diskCount - d);
            if (stack[d] !== expectedDisk) return false;
        }
    }

    // 通過所有檢查 ➔ 勝利！
    triggerVictory();
    return true;
}

function triggerVictory() {
    document.getElementById('victory-title').textContent = '完美重構！';
    document.getElementById('victory-message').textContent = '您成功在目標格完成了空間河內塔的重構！';
    document.getElementById('victory-stats').style.display = '';
    document.getElementById('victory-moves').textContent = moveCount;
    document.getElementById('victory-optimal').textContent = optimalMoves;

    // 延遲一點點顯示，讓最後一個圓盤的移動動畫跑完
    setTimeout(() => {
        showModal(modalVictory);
    }, 400);
}

// ==========================================
// 對局模式（VS AI）
// ==========================================

// 執行一次搬移的底層操作：把 (fromX,fromY) 頂端的盤子搬到 (toX,toY) 頂端
// 回傳搬移的盤子，以及搬移前目的地格的頂層盤子（用於判斷是否形成「壓制」）
function moveDiskRaw(fromX, fromY, toX, toY) {
    const destStackBefore = board[toY][toX];
    const destTopBefore = destStackBefore.length > 0 ? destStackBefore[destStackBefore.length - 1] : null;
    const disk = board[fromY][fromX].pop();
    board[toY][toX].push(disk);
    moveCount++;
    domMoveCount.textContent = moveCount;
    return { disk, destTopBefore };
}

// 尋找特定圓盤目前所在的座標
function findDiskPosition(diskId, currentBoard = board) {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (currentBoard[y][x].includes(diskId)) return { x, y };
        }
    }
    return null;
}

// 每步棋後都要呼叫：先解除「這一方（實際操作這步棋的人）」原本的壓制義務
// （不論這步棋動的是不是被強制的那顆盤，只要走了一步就代表原本的義務已經
// 處理過了），再判斷這步棋是否疊出了跨顏色的堆疊——如果是，重新登記一個新
// 的壓制義務，必須在該方自己的下一回合優先解除，否則到期會被強制處理。
//
// 注意：義務歸屬看「是誰操作了這步棋（side 參數，呼叫端傳入 currentTurn）」，
// 不是看「被移動的圓盤是什麼顏色」。在正式對局裡兩者永遠相同（每個人只能動
// 自己顏色的盤），差異只會出現在打散階段——打散階段操作的是對方顏色的盤，
// 若因此造成壓制，理應是「做出這個決定的人」負責解除，而不是「盤子恰好是
// 誰的顏色」，否則會變成被動一方替對手的操作背黑鍋。
function registerSuppressionIfAny(side, disk, destTopBefore, originCell) {
    pendingForced[side] = null;
    const moverGroup = getDiskGroup(disk);
    if (destTopBefore !== null && getDiskGroup(destTopBefore) !== moverGroup) {
        pendingForced[side] = { diskId: disk, originCell };
    }
}

// 壓制到期時，若被強制的盤真的無路可走，就自動彈回壓制前的原位
function resolveForcedBounceBack(side) {
    const forced = pendingForced[side];
    if (!forced) return;
    const pos = findDiskPosition(forced.diskId);
    if (!pos) {
        pendingForced[side] = null;
        return;
    }
    const origin = forced.originCell;
    const originStack = board[origin.y][origin.x];
    const originTop = originStack.length > 0 ? originStack[originStack.length - 1] : null;
    const canReturn = originStack.length === 0 ||
        (getDiskSize(originTop) > getDiskSize(forced.diskId) && !isProtectedForcedDisk(originTop));
    if (canReturn) {
        const disk = board[pos.y][pos.x].pop();
        board[origin.y][origin.x].push(disk);
        pendingForced[side] = null;
    }
    // 極端邊界情況：連原位都回不去，則維持懸置狀態，下回合再嘗試
}

// 若 side 背著壓制義務，但那顆盤現在完全無路可走，直接自動彈回原位解除。
// AI 自己會在決策時判斷要不要彈回，但玩家是被動等待輪到自己操作——如果
// 玩家的義務剛好完全無路可走，必須在等待玩家點擊之前就自動處理掉，否則
// 玩家會卡在一個連點擊都點不出合法目的地的死局裡。
function autoResolveIfStuck(side) {
    const forced = pendingForced[side];
    if (!forced) return;
    const pos = findDiskPosition(forced.diskId);
    if (!pos) {
        pendingForced[side] = null;
        return;
    }
    const dests = getMatchValidMoves(pos.x, pos.y);
    if (dests.length === 0) {
        resolveForcedBounceBack(side);
    }
}

// 判斷某個圓盤數值，是否正是目前某個「尚未解除的壓制義務」所追蹤的那顆盤
function isProtectedForcedDisk(diskValue) {
    return (pendingForced.player !== null && pendingForced.player.diskId === diskValue) ||
        (pendingForced.ai !== null && pendingForced.ai.diskId === diskValue);
}

// 對局模式（打散階段與正式對局）專用的合法移動查詢：在核心規則之外，
// 額外禁止把任何盤疊到「正被某個未解除壓制義務追蹤」的盤子上面——否則
// 那顆盤會被後續、與這個義務完全無關的一步棋意外埋住，導致義務永遠沒有
// 辦法真正解除（連原本追蹤的盤都選不到、點不到了）。
function getMatchValidMoves(x, y, currentBoard = board) {
    const dests = getValidMovesForCell(x, y, currentBoard);
    return dests.filter(d => {
        const destStack = currentBoard[d.y][d.x];
        if (destStack.length === 0) return true;
        return !isProtectedForcedDisk(destStack[destStack.length - 1]);
    });
}

// 檢查某一方是否已經把自己的河內塔在自己的終點格歸位完成
function checkMatchVictory(group) {
    const target = targetCells[group - 1];
    const stack = board[target.y][target.x];
    if (stack.length !== diskCount) return false;
    for (let d = 0; d < diskCount; d++) {
        const expected = group * 100 + (diskCount - d);
        if (stack[d] !== expected) return false;
    }
    return true;
}

// 更新對局狀態列 UI（回合指示、壓制警示、棋盤是否可操作）
function updateMatchStatusUI() {
    if (gameMode !== 'match') return;

    if (matchPhase === 'scramble') {
        matchStatusBar.classList.toggle('turn-player', currentTurn === 'player');
        matchStatusBar.classList.toggle('turn-ai', currentTurn === 'ai');

        const forced = pendingForced[currentTurn];
        const movesLeft = scrambleBudget[currentTurn];

        if (forced) {
            matchForcedBanner.textContent = currentTurn === 'player'
                ? '⚠ 你稍早的操作造成了壓制，這回合必須先解除！'
                : '';
            matchForcedBanner.style.display = currentTurn === 'player' ? 'inline-block' : 'none';
            matchTurnText.textContent = currentTurn === 'player'
                ? '打散階段：你稍早造成了壓制，必須先解除'
                : '打散階段：AI 正在解除稍早造成的壓制...';
        } else {
            matchForcedBanner.style.display = 'none';
            const targetLabel = getScrambleTargetGroup(currentTurn) === PLAYER_GROUP ? '你的' : 'AI 的';
            matchTurnText.textContent = currentTurn === 'player'
                ? `打散階段：換你打亂${targetLabel}河內塔（剩 ${movesLeft} 步）`
                : `打散階段：AI 正在打亂${targetLabel}河內塔...（剩 ${movesLeft} 步）`;
        }

        domBoard.classList.toggle('board-disabled', currentTurn !== 'player');
        return;
    }

    matchStatusBar.classList.toggle('turn-player', currentTurn === 'player');
    matchStatusBar.classList.toggle('turn-ai', currentTurn === 'ai');

    if (matchOver) {
        matchTurnText.textContent = '對局結束';
        matchForcedBanner.style.display = 'none';
        domBoard.classList.remove('board-disabled');
        return;
    }

    matchTurnText.textContent = currentTurn === 'player' ? '你的回合' : 'AI 思考中...';

    if (currentTurn === 'player' && pendingForced.player) {
        matchForcedBanner.textContent = '⚠ 你的圓盤正壓制著 AI，這回合必須先移動它！';
        matchForcedBanner.style.display = 'inline-block';
    } else {
        matchForcedBanner.style.display = 'none';
    }

    domBoard.classList.toggle('board-disabled', currentTurn !== 'player');
}

// ==========================================
// 打散階段（雙方互相打散對方的塔）
// ==========================================

// 圓盤顏色歸屬那一方時，打散階段該操作「對手」的哪個顏色
function getScrambleTargetGroup(side) {
    return side === 'player' ? AI_GROUP : PLAYER_GROUP;
}

// 開始打散階段：擲硬幣決定誰先，之後雙方逐步輪流各打散對方一步——跟正式
// 對局共用同一套「輪到你時，若背著壓制義務就必須先解除」的回合制規則。
function beginScramblePhase() {
    matchPhase = 'scramble';
    const steps = parseInt(inputScrambleSteps.value);
    scrambleBudget = { player: steps, ai: steps };
    currentTurn = Math.random() < 0.5 ? 'player' : 'ai';

    advanceScrambleIfIdle();
}

// 每完成一步行動（不論是解除壓制義務，還是正常打散）後呼叫：判斷輪到的
// 這一方現在有沒有事情要做——沒有的話就把回合交給對方，直到找到真的有事
// 可做的一方，或雙方都打散完畢、義務也都解除為止，這時就正式開戰。
// 檢查某個顏色目前在棋盤上是否還有任何一顆盤可以合法移動（不論移到哪）
function hasAnyMoveForGroup(group) {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const stack = board[y][x];
            if (stack.length === 0) continue;
            if (getDiskGroup(stack[stack.length - 1]) !== group) continue;
            if (getMatchValidMoves(x, y).length > 0) return true;
        }
    }
    return false;
}

function advanceScrambleIfIdle() {
    let guard = 0;
    while (guard++ < 20) {
        autoResolveIfStuck(currentTurn); // 若這一方的義務已經無路可走，先自動彈回，避免卡死

        const forced = pendingForced[currentTurn];
        if (forced) {
            // 連原位都回不去的極端情況：這回合真的無法解除，交給對方繼續，
            // 之後棋盤變化了，這顆盤或許就有路可走了。
            const pos = findDiskPosition(forced.diskId);
            const dests = pos ? getMatchValidMoves(pos.x, pos.y) : [];
            if (dests.length === 0) {
                currentTurn = currentTurn === 'player' ? 'ai' : 'player';
                continue;
            }
            break; // 有義務，且現在有路可走，正常等待這一方解除
        }

        if (scrambleBudget[currentTurn] > 0) {
            // 還有額度，但如果對方的塔現在完全無路可打散（極端邊界情況），
            // 這回合視同跳過（額度照樣扣掉），避免玩家卡在無棋可下的畫面。
            if (hasAnyMoveForGroup(getScrambleTargetGroup(currentTurn))) break;
            scrambleBudget[currentTurn]--;
            currentTurn = currentTurn === 'player' ? 'ai' : 'player';
            continue;
        }

        // 這一方在打散階段目前沒事可做
        if (scrambleBudget.player === 0 && scrambleBudget.ai === 0 &&
            pendingForced.player === null && pendingForced.ai === null) {
            startBattlePhase();
            return;
        }
        currentTurn = currentTurn === 'player' ? 'ai' : 'player';
    }

    updateMatchStatusUI();
    renderBoard();

    if (currentTurn === 'ai') {
        aiThinkingTimeout = setTimeout(aiScrambleStep, 500);
    }
}

// 打散階段真正結束，正式開戰：延續打散階段最後輪到的那一方，直接接上戰鬥回合制
function startBattlePhase() {
    matchPhase = 'battle';
    selectedCell = null;
    validMoves = [];
    advanceBattleTurn();
}

// 對局模式下，玩家在打散階段的點擊處理：若背著壓制義務，只能選被強制的那顆
// （自己顏色）；否則只能操作正在被打散的對手顏色的盤。
function handleScrambleCellClick(x, y) {
    if (currentTurn !== 'player') return;

    const forced = pendingForced.player;
    // 被壓制時，要移動的是「當初造成壓制的那顆盤」，顏色不一定是自己的（打散
    // 階段操作的本來就是對方顏色的盤，所以壓制到的也可能是任一顏色）；沒有義
    // 務時才是正常打散對手的塔（永遠是對方顏色）。
    const allowedGroup = forced ? getDiskGroup(forced.diskId) : getScrambleTargetGroup('player');

    if (!selectedCell) {
        const stack = board[y][x];
        if (stack.length === 0) return;
        const topDisk = stack[stack.length - 1];
        if (getDiskGroup(topDisk) !== allowedGroup) return;

        if (forced) {
            const forcedPos = findDiskPosition(forced.diskId);
            if (!forcedPos || forcedPos.x !== x || forcedPos.y !== y) return; // 壓制中，只能選被強制的那顆
        }

        selectedCell = { x, y };
        validMoves = getMatchValidMoves(x, y);
        renderBoard();
        return;
    }

    if (selectedCell.x === x && selectedCell.y === y) {
        selectedCell = null;
        validMoves = [];
        renderBoard();
        return;
    }

    const isMoveValid = validMoves.some(m => m.x === x && m.y === y);

    if (isMoveValid) {
        const { disk, destTopBefore } = moveDiskRaw(selectedCell.x, selectedCell.y, x, y);
        registerSuppressionIfAny('player', disk, destTopBefore, selectedCell);

        selectedCell = null;
        validMoves = [];

        if (!forced) {
            scrambleBudget.player--;
        }

        currentTurn = 'ai';
        advanceScrambleIfIdle();
    } else {
        const nextStack = board[y][x];
        if (nextStack.length > 0 && getDiskGroup(nextStack[nextStack.length - 1]) === allowedGroup &&
            (!forced || (findDiskPosition(forced.diskId) && findDiskPosition(forced.diskId).x === x && findDiskPosition(forced.diskId).y === y))) {
            selectedCell = { x, y };
            validMoves = getMatchValidMoves(x, y);
            renderBoard();
        } else {
            selectedCell = null;
            validMoves = [];
            renderBoard();
        }
    }
}

// 打散階段挑選一步棋（不論是要解除自己的壓制義務，還是正常打散對手的塔）：
// 優先選會對目標方造成壓制的招式，藉此製造對對手不利的處境。
// 從「targetGroup 已經完成歸位」的狀態開始，逆向 BFS 探索「只移動 targetGroup
// 的盤、其餘盤固定在目前位置」能到達的所有盤面，記錄每個盤面離目標狀態的步數。
// 用來評估打散階段的某個候選走法「執行後，對方最少要幾步才能復原」。
function buildRecoveryDistanceMap(targetGroup) {
    const target = targetCells[targetGroup - 1];
    const goalStack = [];
    for (let d = diskCount; d >= 1; d--) goalStack.push(targetGroup * 100 + d);

    const goalBoard = cloneBoardState(board);
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            goalBoard[y][x] = goalBoard[y][x].filter(v => getDiskGroup(v) !== targetGroup);
        }
    }
    goalBoard[target.y][target.x] = goalStack;

    const goalStr = serializeBoard(goalBoard);
    const distances = new Map();
    distances.set(goalStr, 0);

    const queue = [goalStr];
    let qi = 0;
    let maxDepthReached = 0;
    const startTime = performance.now();
    const TIME_LIMIT_MS = 400;
    const NODE_LIMIT = 20000;

    while (qi < queue.length) {
        if (performance.now() - startTime > TIME_LIMIT_MS || qi > NODE_LIMIT) break;

        const stateStr = queue[qi++];
        const dist = distances.get(stateStr);
        maxDepthReached = Math.max(maxDepthReached, dist);
        const stateBoard = deserializeBoard(stateStr);

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const stack = stateBoard[y][x];
                if (stack.length === 0) continue;
                const top = stack[stack.length - 1];
                if (getDiskGroup(top) !== targetGroup) continue;

                const dests = getMatchValidMoves(x, y, stateBoard);
                for (const d of dests) {
                    const nb = cloneBoardState(stateBoard);
                    const disk = nb[y][x].pop();
                    nb[d.y][d.x].push(disk);
                    const key = serializeBoard(nb);
                    if (!distances.has(key)) {
                        distances.set(key, dist + 1);
                        queue.push(key);
                    }
                }
            }
        }
    }

    return { distances, maxDepth: maxDepthReached };
}

// 打散階段挑選一步棋（不論是要解除自己的壓制義務，還是正常打散對手的塔）：
// 不以「有沒有造成壓制」為標準——壓制的義務現在算在操作者自己頭上，優先壓制
// 只會讓打散的一方自找麻煩，對「讓對方難以復原」這個打散的真正目的沒有幫助。
// 改為實際試算每個候選走法執行後，對方要用最少幾步才能把自己的塔歸位，挑選
// 讓這個步數最大的走法；多個走法同樣困難時，排除掉剛好是上一步反向動作的
// 選項，避免在兩格之間原地來回震盪。
function planScrambleMove(targetGroup) {
    const candidates = [];

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const stack = board[y][x];
            if (stack.length === 0) continue;
            const top = stack[stack.length - 1];
            if (getDiskGroup(top) !== targetGroup) continue;

            const dests = getMatchValidMoves(x, y);
            for (const d of dests) {
                candidates.push({
                    from: { x, y },
                    to: d,
                    key: `${x},${y}->${d.x},${d.y}`,
                    revKey: `${d.x},${d.y}->${x},${y}`,
                });
            }
        }
    }

    if (candidates.length === 0) return null;
    if (candidates.length === 1) {
        lastAiScrambleMoveKey = candidates[0].revKey;
        return candidates[0];
    }

    const { distances, maxDepth } = buildRecoveryDistanceMap(targetGroup);
    const unknownDistance = maxDepth + 1; // 搜尋預算內都找不到的盤面，視為比目前找到的都更難復原

    let bestDistance = -1;
    let bestCandidates = [];
    for (const c of candidates) {
        const nextBoard = cloneBoardState(board);
        const disk = nextBoard[c.from.y][c.from.x].pop();
        nextBoard[c.to.y][c.to.x].push(disk);
        const key = serializeBoard(nextBoard);
        const dist = distances.has(key) ? distances.get(key) : unknownDistance;

        if (dist > bestDistance) {
            bestDistance = dist;
            bestCandidates = [c];
        } else if (dist === bestDistance) {
            bestCandidates.push(c);
        }
    }

    let filtered = bestCandidates.filter(c => c.key !== lastAiScrambleMoveKey);
    if (filtered.length === 0) filtered = bestCandidates;

    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    lastAiScrambleMoveKey = chosen.revKey;
    return chosen;
}

// AI 在打散階段的一步行動：若背著壓制義務，優先解除；否則正常打散玩家的塔
function aiScrambleStep() {
    if (matchPhase !== 'scramble' || currentTurn !== 'ai') return;

    const forced = pendingForced.ai;

    if (forced) {
        const pos = findDiskPosition(forced.diskId);
        if (pos) {
            const dests = getMatchValidMoves(pos.x, pos.y);
            if (dests.length > 0) {
                const dest = pickAiDestination(dests);
                const { disk, destTopBefore } = moveDiskRaw(pos.x, pos.y, dest.x, dest.y);
                registerSuppressionIfAny('ai', disk, destTopBefore, pos);
            } else {
                resolveForcedBounceBack('ai');
            }
        } else {
            pendingForced.ai = null;
        }
    } else {
        const targetGroup = getScrambleTargetGroup('ai');
        const move = planScrambleMove(targetGroup);
        if (move) {
            const { disk, destTopBefore } = moveDiskRaw(move.from.x, move.from.y, move.to.x, move.to.y);
            registerSuppressionIfAny('ai', disk, destTopBefore, move.from);
        }
        scrambleBudget.ai--;
    }

    renderBoard();
    currentTurn = 'player';
    advanceScrambleIfIdle();
}

// 對局結束處理
function endMatch(winnerSide) {
    matchOver = true;
    if (aiThinkingTimeout) {
        clearTimeout(aiThinkingTimeout);
        aiThinkingTimeout = null;
    }
    selectedCell = null;
    validMoves = [];
    renderBoard();
    updateMatchStatusUI();

    const title = winnerSide === 'player' ? '你贏了！' : 'AI 獲勝';
    const message = winnerSide === 'player'
        ? '你搶先把自己的河內塔歸位了，恭喜擊敗 AI！'
        : 'AI 搶先完成了自己的河內塔，再試一次扳回一城！';

    document.getElementById('victory-title').textContent = title;
    document.getElementById('victory-message').textContent = message;
    document.getElementById('victory-stats').style.display = 'none';

    setTimeout(() => {
        showModal(modalVictory);
    }, 400);
}

// 對局模式下處理玩家點擊格子
function handleMatchCellClick(x, y) {
    if (matchOver || currentTurn !== 'player') return;

    const forced = pendingForced.player;

    if (!selectedCell) {
        const stack = board[y][x];
        if (stack.length === 0) return;
        const topDisk = stack[stack.length - 1];
        if (getDiskGroup(topDisk) !== PLAYER_GROUP) return; // 只能選自己的盤

        if (forced) {
            const forcedPos = findDiskPosition(forced.diskId);
            if (!forcedPos || forcedPos.x !== x || forcedPos.y !== y) return; // 壓制中，只能選被強制的那顆
        }

        selectedCell = { x, y };
        validMoves = getMatchValidMoves(x, y);
        renderBoard();
        return;
    }

    if (selectedCell.x === x && selectedCell.y === y) {
        selectedCell = null;
        validMoves = [];
        renderBoard();
        return;
    }

    const isMoveValid = validMoves.some(m => m.x === x && m.y === y);

    if (isMoveValid) {
        const { disk, destTopBefore } = moveDiskRaw(selectedCell.x, selectedCell.y, x, y);
        registerSuppressionIfAny('player', disk, destTopBefore, selectedCell);

        selectedCell = null;
        validMoves = [];
        renderBoard();

        if (checkMatchVictory(PLAYER_GROUP)) {
            endMatch('player');
            return;
        }

        currentTurn = 'ai';
        advanceBattleTurn();
    } else {
        const nextStack = board[y][x];
        if (nextStack.length > 0 && getDiskGroup(nextStack[nextStack.length - 1]) === PLAYER_GROUP) {
            if (forced) {
                const forcedPos = findDiskPosition(forced.diskId);
                if (!forcedPos || forcedPos.x !== x || forcedPos.y !== y) return; // 壓制中，不能切換選別的盤
            }
            selectedCell = { x, y };
            validMoves = getMatchValidMoves(x, y);
            renderBoard();
        } else {
            selectedCell = null;
            validMoves = [];
            renderBoard();
        }
    }
}

// 切換回合並確保下一位真的有事可做：若背著壓制義務，先確認能不能自動彈回；
// 若完全無棋可下（沒有義務、也沒有任何合法移動），就直接跳過，避免任何一方
// 卡在等待一個永遠點不出來（或 AI 永遠算不出來）的動作。
function advanceBattleTurn() {
    let guard = 0;
    while (guard++ < 20) {
        autoResolveIfStuck(currentTurn);

        const forced = pendingForced[currentTurn];
        if (forced) {
            // 連原位都回不去的極端情況：這回合真的無法解除，交給對方繼續
            const pos = findDiskPosition(forced.diskId);
            const dests = pos ? getMatchValidMoves(pos.x, pos.y) : [];
            if (dests.length === 0) {
                currentTurn = currentTurn === 'player' ? 'ai' : 'player';
                continue;
            }
            break;
        }

        const group = currentTurn === 'player' ? PLAYER_GROUP : AI_GROUP;
        if (hasAnyMoveForGroup(group)) break;

        currentTurn = currentTurn === 'player' ? 'ai' : 'player';
    }

    updateMatchStatusUI();
    renderBoard();

    // 如果玩家這回合被壓制，直接幫他選好那顆盤，方便直接點目的地
    if (currentTurn === 'player' && pendingForced.player) {
        const pos = findDiskPosition(pendingForced.player.diskId);
        if (pos) {
            selectedCell = pos;
            validMoves = getMatchValidMoves(pos.x, pos.y);
            renderBoard();
        }
    }

    if (currentTurn === 'ai') {
        aiThinkingTimeout = setTimeout(aiTakeTurn, 500);
    }
}

// AI 挑選目的地：優先選能直接完成自己終點的落點，否則隨機挑一個合法落點
function pickAiDestination(dests) {
    const aiTarget = targetCells[AI_GROUP - 1];
    const toOwnTarget = dests.find(d => d.x === aiTarget.x && d.y === aiTarget.y);
    if (toOwnTarget) return toOwnTarget;
    return dests[Math.floor(Math.random() * dests.length)];
}

// AI 的一個回合：優先處理到期的壓制義務，否則規劃一步棋
function aiTakeTurn() {
    if (matchOver) return;

    const forced = pendingForced.ai;

    if (forced) {
        const pos = findDiskPosition(forced.diskId);
        if (pos) {
            const dests = getMatchValidMoves(pos.x, pos.y);
            if (dests.length > 0) {
                const dest = pickAiDestination(dests);
                const { disk, destTopBefore } = moveDiskRaw(pos.x, pos.y, dest.x, dest.y);
                registerSuppressionIfAny('ai', disk, destTopBefore, pos);
            } else {
                resolveForcedBounceBack('ai');
            }
        } else {
            pendingForced.ai = null;
        }
    } else {
        const move = planAiMove();
        if (move) {
            const { disk, destTopBefore } = moveDiskRaw(move.from.x, move.from.y, move.to.x, move.to.y);
            registerSuppressionIfAny('ai', disk, destTopBefore, move.from);
        }
    }

    renderBoard();

    if (checkMatchVictory(AI_GROUP)) {
        endMatch('ai');
        return;
    }

    currentTurn = 'player';
    advanceBattleTurn();
}

// AI 規劃一步棋：用限時限量的 BFS 尋找「只移動自己顏色的盤」能到達自己終點的最短路徑，
// 找不到（超時或搜尋完畢仍無解）就退化成簡單貪心策略
function planAiMove() {
    const startStr = serializeBoard(board);
    const aiTarget = targetCells[AI_GROUP - 1];
    const goalStack = [];
    for (let d = diskCount; d >= 1; d--) goalStack.push(AI_GROUP * 100 + d);

    const isGoal = (b) => {
        const st = b[aiTarget.y][aiTarget.x];
        if (st.length !== diskCount) return false;
        for (let i = 0; i < diskCount; i++) {
            if (st[i] !== goalStack[i]) return false;
        }
        return true;
    };

    if (isGoal(board)) return null;

    const queue = [{ state: startStr, firstMove: null }];
    const visited = new Set([startStr]);
    let qi = 0;
    const startTime = performance.now();
    const TIME_LIMIT_MS = 400;
    const NODE_LIMIT = 80000;

    while (qi < queue.length) {
        if (performance.now() - startTime > TIME_LIMIT_MS || qi > NODE_LIMIT) break;

        const current = queue[qi++];
        const currentBoard = deserializeBoard(current.state);

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const stack = currentBoard[y][x];
                if (stack.length === 0) continue;
                const top = stack[stack.length - 1];
                if (getDiskGroup(top) !== AI_GROUP) continue; // AI 只能規劃自己顏色的盤

                const dests = getMatchValidMoves(x, y, currentBoard);
                for (const dest of dests) {
                    const nextBoard = cloneBoardState(currentBoard);
                    const disk = nextBoard[y][x].pop();
                    nextBoard[dest.y][dest.x].push(disk);

                    const stepInfo = current.firstMove || { from: { x, y }, to: dest };

                    if (isGoal(nextBoard)) {
                        return stepInfo;
                    }

                    const nextStr = serializeBoard(nextBoard);
                    if (!visited.has(nextStr)) {
                        visited.add(nextStr);
                        queue.push({ state: nextStr, firstMove: stepInfo });
                    }
                }
            }
        }
    }

    return planAiMoveHeuristic();
}

// 備援策略：BFS 沒能在預算內找到解時，用簡單貪心規則挑一步棋。
// 避免挑選「剛好是上一步反向動作」的選項，防止在兩格之間原地來回震盪、永遠沒有進展。
function planAiMoveHeuristic() {
    const aiTarget = targetCells[AI_GROUP - 1];
    const candidates = [];

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const stack = board[y][x];
            if (stack.length === 0) continue;
            const top = stack[stack.length - 1];
            if (getDiskGroup(top) !== AI_GROUP) continue;

            const dests = getMatchValidMoves(x, y);
            for (const d of dests) {
                candidates.push({
                    from: { x, y },
                    to: d,
                    size: getDiskSize(top),
                    key: `${x},${y}->${d.x},${d.y}`,
                    revKey: `${d.x},${d.y}->${x},${y}`,
                });
            }
        }
    }

    if (candidates.length === 0) return null;

    const toTarget = candidates.find(c => c.to.x === aiTarget.x && c.to.y === aiTarget.y);
    if (toTarget) {
        lastAiHeuristicMoveKey = toTarget.revKey;
        return toTarget;
    }

    // 排除掉「剛好是上一步反向動作」的選項（若排除後就沒得選，才允許照做）
    let filtered = candidates.filter(c => c.key !== lastAiHeuristicMoveKey);
    if (filtered.length === 0) filtered = candidates;

    // 在「移動最小的可動圓盤」這個原則下，同尺寸的選項之間隨機挑一個，
    // 避免完全決定性的走法在雙方都用同一套策略時形成無限循環。
    const minSize = Math.min(...filtered.map(c => c.size));
    const smallestTier = filtered.filter(c => c.size === minSize);
    const chosen = smallestTier[Math.floor(Math.random() * smallestTier.length)];
    lastAiHeuristicMoveKey = chosen.revKey;
    return chosen;
}

// ==========================================
// UI 渲染與點擊控制
// ==========================================

function renderBoard() {
    domBoard.innerHTML = '';
    
    // 動態設定 Grid 的列數與行數
    domBoard.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
    domBoard.style.gridTemplateRows = `repeat(${gridHeight}, 1fr)`;

    // 計算合適的格子尺寸，以適應棋盤區域
    const boardAreaWidth = document.querySelector('.board-wrapper').clientWidth - 50;
    const maxCellSize = Math.floor(boardAreaWidth / gridWidth) - 12;
    const cellSize = Math.min(Math.max(maxCellSize, 70), 150); // 格子大小限制在 70px ~ 150px 之間

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            
            // 格子黑白雙色棋盤分配 (二分圖著色)
            const isDark = (x + y) % 2 !== 0;
            cell.classList.add(isDark ? 'cell-dark' : 'cell-light');
            
            // 設定格子大小
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            // 標示多塔目標格
            const targetIdx = targetCells.findIndex(t => t.x === x && t.y === y);
            if (targetIdx !== -1) {
                cell.classList.add(`cell-target-g${targetIdx + 1}`);
            }

            // 標示座標 (例如 A1, B2)
            const coordLabel = document.createElement('span');
            coordLabel.className = 'cell-coord';
            coordLabel.textContent = getCellLabel(x, y);
            cell.appendChild(coordLabel);

            // 建立虛擬支柱 (Peg)
            const peg = document.createElement('div');
            peg.className = 'disk-peg-visual';
            cell.appendChild(peg);

            // 繪製該格子的所有圓盤
            const stack = board[y][x];
            stack.forEach((diskVal, index) => {
                const disk = document.createElement('div');
                const group = getDiskGroup(diskVal);
                const size = getDiskSize(diskVal);
                disk.className = `disk disk-g${group} disk-size-${size}`;
                disk.style.setProperty('--stack-index', index);
                disk.textContent = size; // 僅顯示圓盤尺寸
                cell.appendChild(disk);
            });

            // 如果該格是選定格，加上選取狀態
            if (selectedCell && selectedCell.x === x && selectedCell.y === y) {
                cell.classList.add('selected');
            }

            // 如果該格是合法移動目標格，加上高亮提示
            const isValidDest = validMoves.some(m => m.x === x && m.y === y);
            if (isValidDest) {
                cell.classList.add('highlight-valid');
            }

            // 綁定格子的點擊事件
            cell.addEventListener('click', () => handleCellClick(x, y));

            domBoard.appendChild(cell);
        }
    }
}

/**
 * 處理玩家點擊格子
 */
function handleCellClick(x, y) {
    if (gameMode === 'match') {
        if (matchPhase === 'scramble') {
            handleScrambleCellClick(x, y);
        } else {
            handleMatchCellClick(x, y);
        }
        return;
    }

    // 情況 1：尚未選取任何格子
    if (!selectedCell) {
        const stack = board[y][x];
        if (stack.length === 0) return; // 點擊空地無效

        // 選取該格，並計算其頂層圓盤的可行路徑
        selectedCell = { x, y };
        validMoves = getValidMovesForCell(x, y);
        renderBoard();
    }
    // 情況 2：已經選取了某個格子
    else {
        // 如果再次點擊原格子，取消選取
        if (selectedCell.x === x && selectedCell.y === y) {
            selectedCell = null;
            validMoves = [];
            renderBoard();
            return;
        }

        // 檢查玩家點擊的目標格是否是合法移動目標
        const isMoveValid = validMoves.some(m => m.x === x && m.y === y);

        if (isMoveValid) {
            // 保存目前棋盤狀態到歷史紀錄（悔步用）
            history.push(cloneBoardState(board));
            updateUndoButtonState();

            // 執行移動：從選取格的頂端移到目標格頂端
            moveDiskRaw(selectedCell.x, selectedCell.y, x, y);

            // 清理選取狀態
            selectedCell = null;
            validMoves = [];
            renderBoard();

            // 檢查是否獲勝
            checkVictory();
        }
        // 如果點擊的是另一個有圓盤的格子，直接切換選取對象
        else {
            const nextStack = board[y][x];
            if (nextStack.length > 0) {
                selectedCell = { x, y };
                validMoves = getValidMovesForCell(x, y);
                renderBoard();
            } else {
                // 點擊非法空地，取消選取
                selectedCell = null;
                validMoves = [];
                renderBoard();
            }
        }
    }
}

// ==========================================
// 最佳解法步數計算器 (BFS 最短路徑求解器)
// ==========================================

/**
 * 序列化當前棋盤狀態為字串，格式如: "||;|,5,4,3,2,1,|;||"
 */
function serializeBoard(b) {
    return b.map(row => row.map(stack => stack.join(',')).join('|')).join(';');
}

/**
 * 反序列化字串回棋盤狀態
 */
function deserializeBoard(str) {
    return str.split(';').map(rowStr => 
        rowStr.split('|').map(stackStr => 
            stackStr ? stackStr.split(',').map(Number) : []
        )
    );
}

/**
 * 非同步計算最佳步數，避免大型棋盤在生成時卡死 UI
 */
function calculateOptimalMoves() {
    domOptimalCount.textContent = '計算中...';

    // 1. 如果有舊的背景 Worker 在執行，先終止它以釋放資源
    if (solverWorker) {
        solverWorker.terminate();
        solverWorker = null;
    }
    
    // 2. 嘗試啟動 Web Worker 做背景多執行緒運算 (不阻塞 UI)
    try {
        solverWorker = new Worker('solver.js');
        
        solverWorker.onmessage = function(e) {
            const optimal = e.data;
            optimalMoves = optimal;
            if (optimal === -1) {
                domOptimalCount.textContent = '過於複雜';
            } else {
                domOptimalCount.textContent = optimal;
            }
            // 算完後釋放 Worker
            solverWorker.terminate();
            solverWorker = null;
        };

        solverWorker.onerror = function(err) {
            console.error("Web Worker 運算時發生錯誤:", err);
            fallbackToSyncSolver();
        };

        // 發送棋盤參數給背景執行緒開始運算
        solverWorker.postMessage({
            board: board,
            targetCells: targetCells,
            diskCount: diskCount,
            width: gridWidth,
            height: gridHeight,
            towersCount: towersCount,
            wrapAround: wrapAround
        });

    } catch (e) {
        // 3. 降級處理 (通常是 file:// 本地開網頁造成的同源跨域 CORS 阻擋)
        console.warn("無法初始化 Web Worker (可能是 file:// 協議限制)，將降級為本地同步背景計算。");
        fallbackToSyncSolver();
    }
}

/**
 * 降級方案：在主執行緒使用 setTimeout 進行受限的同步計算，避免 UI 鎖死
 */
function fallbackToSyncSolver() {
    setTimeout(() => {
        // 本地同步計算有嚴格的 250ms/40,000節點限制，防死鎖
        const optimal = solveMinimumMoves(board, targetCells, diskCount, 250, 40000);
        optimalMoves = optimal;
        if (optimal === -1) {
            domOptimalCount.textContent = '過於複雜';
        } else {
            domOptimalCount.textContent = optimal;
        }
    }, 30);
}

/**
 * 使用 BFS 尋找最少解題步數 (支援多塔與邊界相通)
 */
function solveMinimumMoves(startBoard, targetCells, totalDisks, timeLimit = 1000, nodeLimit = 250000) {
    const startStr = serializeBoard(startBoard);
    
    // 1. 建立目標（勝利）棋盤狀態
    const goalBoard = startBoard.map(row => row.map(() => []));
    for (let i = 0; i < towersCount; i++) {
        const target = targetCells[i];
        const groupOffset = (i + 1) * 100;
        const goalStack = [];
        for (let d = totalDisks; d >= 1; d--) {
            goalStack.push(groupOffset + d);
        }
        goalBoard[target.y][target.x] = goalStack;
    }
    const goalStr = serializeBoard(goalBoard);

    if (startStr === goalStr) return 0;

    // 2. 初始化 BFS 佇列與已訪問集
    const queue = [{ state: startStr, steps: 0 }];
    const visited = new Set();
    visited.add(startStr);

    let queueIndex = 0; // 用於避免陣列 shift() 的高複雜度拷貝效能損耗
    const startTime = performance.now();
    const TIME_LIMIT_MS = timeLimit; // 超時防卡死安全鎖
    const NODE_LIMIT = nodeLimit;  // 搜尋狀態數上限安全鎖

    while (queueIndex < queue.length) {
        // 安全鎖檢測
        if (performance.now() - startTime > TIME_LIMIT_MS || queueIndex > NODE_LIMIT) {
            console.warn("BFS 最短路徑求解超時或超過節點上限，已啟動安全保護中斷。");
            return -1; // 回傳 -1 表示無法在合理時間內算出（例如棋盤太大、層數太多且打散太深）
        }

        const current = queue[queueIndex++];
        const currentBoard = deserializeBoard(current.state);

        // 搜尋當前狀態下所有可以移動的格子
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const stack = currentBoard[y][x];
                if (stack.length === 0) continue;

                // 取得可行移動目的地
                const validDests = getValidMovesForCell(x, y, currentBoard);
                for (const dest of validDests) {
                    // 模擬一步移動
                    const nextBoard = cloneBoardState(currentBoard);
                    const disk = nextBoard[y][x].pop();
                    nextBoard[dest.y][dest.x].push(disk);

                    const nextStr = serializeBoard(nextBoard);

                    // 檢查是否達成目標
                    if (nextStr === goalStr) {
                        return current.steps + 1;
                    }

                    // 尚未探索過的狀態則加入佇列
                    if (!visited.has(nextStr)) {
                        visited.add(nextStr);
                        queue.push({
                            state: nextStr,
                            steps: current.steps + 1
                        });
                    }
                }
            }
        }
    }

    return -1; // 若完全無解
}
