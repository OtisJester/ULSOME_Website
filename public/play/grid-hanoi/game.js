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

// DOM 元素參考
const domBoard = document.getElementById('game-board');
const domMoveCount = document.getElementById('move-count');
const domOptimalCount = document.getElementById('optimal-count');
const domTargetsContainer = document.getElementById('targets-container');

// 輸入控制項
const inputWidth = document.getElementById('input-width');
const inputHeight = document.getElementById('input-height');
const inputDisks = document.getElementById('input-disks');
const inputTowers = document.getElementById('input-towers');
const inputWrap = document.getElementById('input-wrap');
const inputDifficulty = document.getElementById('input-difficulty');

// 數值顯示
const valWidth = document.getElementById('val-width');
const valHeight = document.getElementById('val-height');
const valDisks = document.getElementById('val-disks');
const valTowers = document.getElementById('val-towers');
const valDifficulty = document.getElementById('val-difficulty');
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

// 開始全新一局
function startNewGame() {
    gridWidth = parseInt(inputWidth.value);
    gridHeight = parseInt(inputHeight.value);
    diskCount = parseInt(inputDisks.value);
    towersCount = parseInt(inputTowers.value);
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

    // 生成隨機有解的關卡
    generateSolvablePuzzle();
    
    // 保存初始狀態用於重置
    initialBoard = cloneBoardState(board);

    // 計算最佳解法步數
    calculateOptimalMoves();

    // 繪製棋盤
    renderBoard();
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
    board = cloneBoardState(initialBoard);
    moveCount = 0;
    domMoveCount.textContent = moveCount;
    history = [];
    selectedCell = null;
    validMoves = [];
    updateUndoButtonState();
    renderBoard();
}

// 悔步
function undoMove() {
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

/**
 * 取得給定格子在當前棋盤狀態下的所有合法移動目標
 */
function getValidMovesForCell(x, y, currentBoard = board) {
    const stack = currentBoard[y][x];
    if (!stack || stack.length === 0) return [];

    const topDisk = stack[stack.length - 1]; // 取得最上層圓盤
    const topDiskSize = getDiskSize(topDisk);
    const moves = [];

    // 四個移動方向
    const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }, // 左
        { dx: 1, dy: 0 }   // 右
    ];

    for (const dir of directions) {
        // 1. 檢查相鄰第一格
        let nx1 = x + dir.dx;
        let ny1 = y + dir.dy;

        if (wrapAround) {
            nx1 = (nx1 + gridWidth) % gridWidth;
            ny1 = (ny1 + gridHeight) % gridHeight;
        } else {
            // 越界檢查
            if (nx1 < 0 || nx1 >= gridWidth || ny1 < 0 || ny1 >= gridHeight) {
                continue;
            }
        }

        // 防護：如果邊界相通導致移動到自身格，則跳過
        if (nx1 === x && ny1 === y) {
            continue;
        }

        const stack1 = currentBoard[ny1][nx1];

        // 情況 A：相鄰第一格是空的 ➔ 可行（一般移動）
        if (stack1.length === 0) {
            moves.push({ x: nx1, y: ny1 });
            continue;
        }

        const topDisk1 = stack1[stack1.length - 1];
        const topDisk1Size = getDiskSize(topDisk1);

        // 情況 B：相鄰第一格的頂層圓盤尺寸比當前圓盤大 ➔ 可行（一般移動，疊上去）
        if (topDisk1Size > topDiskSize) {
            moves.push({ x: nx1, y: ny1 });
            continue;
        }

        // 情況 C：相鄰第一格的頂層圓盤比當前小 ➔ 無法降落。檢查空間躍遷（跳格）
        // 只有在相鄰格是小盤子（高層塔）的情況下，才能跳過它
        if (topDisk1 < topDisk) {
            const nx2 = x + dir.dx * 2;
            const ny2 = y + dir.dy * 2;

            // 躍遷落點越界檢查
            if (nx2 < 0 || nx2 >= gridWidth || ny2 < 0 || ny2 >= gridHeight) {
                continue;
            }

            const stack2 = currentBoard[ny2][nx2];

            // 落點是空的 ➔ 可行（跳躍移動）
            if (stack2.length === 0) {
                moves.push({ x: nx2, y: ny2 });
                continue;
            }

            const topDisk2 = stack2[stack2.length - 1];

            // 落點頂層圓盤比當前圓盤大 ➔ 可行（跳躍移動，疊上去）
            if (topDisk2 > topDisk) {
                moves.push({ x: nx2, y: ny2 });
            }
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

                // 計算該格子頂層圓盤的所有合法移動
                const destinations = getValidMovesForCell(x, y, board);
                for (const dest of destinations) {
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
    document.getElementById('victory-moves').textContent = moveCount;
    document.getElementById('victory-optimal').textContent = optimalMoves;
    
    // 延遲一點點顯示，讓最後一個圓盤的移動動畫跑完
    setTimeout(() => {
        showModal(modalVictory);
    }, 400);
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
            const disk = board[selectedCell.y][selectedCell.x].pop();
            board[y][x].push(disk);

            // 更新步數
            moveCount++;
            domMoveCount.textContent = moveCount;

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
