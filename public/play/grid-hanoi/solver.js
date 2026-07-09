/**
 * 矩陣河內塔 - 背景計算 Worker (solver.js)
 * 負責在背景執行緒中執行 BFS 最短路徑求解，避免阻擋主執行緒 UI 渲染
 */

let gridWidth = 3;
let gridHeight = 3;

self.onmessage = function(e) {
    const { board, targetCells, diskCount, width, height, towersCount, wrapAround } = e.data;
    gridWidth = width;
    gridHeight = height;

    const optimal = solveMinimumMoves(board, targetCells, diskCount, towersCount, wrapAround);
    self.postMessage(optimal);
};

// ==========================================
// 圓盤輔助函數
// ==========================================

function getDiskSize(val) {
    return val % 100;
}

function getDiskGroup(val) {
    return Math.floor(val / 100);
}

function cloneBoardState(sourceBoard) {
    return sourceBoard.map(row => row.map(stack => [...stack]));
}

function serializeBoard(b) {
    return b.map(row => row.map(stack => stack.join(',')).join('|')).join(';');
}

function deserializeBoard(str) {
    return str.split(';').map(rowStr => 
        rowStr.split('|').map(stackStr => 
            stackStr ? stackStr.split(',').map(Number) : []
        )
    );
}

// ==========================================
// 合法移動判定 (同步 Wrap-Around 與多塔規則)
// ==========================================

// 取得座標 (cx, cy) 是哪個塔的終點格，回傳其群組編號 (1~3)；不是任何終點格則回傳 0
function getTargetOwnerGroup(cx, cy, targetCells) {
    for (let i = 0; i < targetCells.length; i++) {
        if (targetCells[i].x === cx && targetCells[i].y === cy) return i + 1;
    }
    return 0;
}

// 規則：圓盤可以移動到同一橫列或同一直行中的任意格子（不論距離、不論中間
// 格放了什麼），只要落點本身不違反大小限制。多塔時另外禁止落在「不屬於
// 自己」的終點格上，避免把大盤堆到對方終點造成永久卡死。
function getValidMovesForCell(x, y, currentBoard, targetCells, towersCount) {
    const stack = currentBoard[y][x];
    if (!stack || stack.length === 0) return [];

    const topDisk = stack[stack.length - 1];
    const topDiskSize = getDiskSize(topDisk);
    const moverGroup = getDiskGroup(topDisk);
    const moves = [];

    const isLegalLanding = (destStack, destX, destY) => {
        if (towersCount > 1) {
            const ownerGroup = getTargetOwnerGroup(destX, destY, targetCells);
            if (ownerGroup !== 0 && ownerGroup !== moverGroup) return false;
        }
        return destStack.length === 0 || getDiskSize(destStack[destStack.length - 1]) > topDiskSize;
    };

    for (let nx = 0; nx < gridWidth; nx++) {
        if (nx === x) continue;
        if (isLegalLanding(currentBoard[y][nx], nx, y)) {
            moves.push({ x: nx, y });
        }
    }

    for (let ny = 0; ny < gridHeight; ny++) {
        if (ny === y) continue;
        if (isLegalLanding(currentBoard[ny][x], x, ny)) {
            moves.push({ x, y: ny });
        }
    }

    return moves;
}

// ==========================================
// BFS 最短路徑求解器 (背景長運算版本 - 支援多塔與 Wrap-Around)
// ==========================================

function solveMinimumMoves(startBoard, targetCells, totalDisks, towersCount, wrapAround) {
    const startStr = serializeBoard(startBoard);
    
    // 1. 建立目標（勝利）狀態
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

    // 2. 初始化 BFS
    const queue = [{ state: startStr, steps: 0 }];
    const visited = new Set();
    visited.add(startStr);

    let queueIndex = 0;
    const startTime = performance.now();
    
    // 背景執行緒防護鎖：放寬到 5 秒超時，200 萬個狀態
    const TIME_LIMIT_MS = 5000; 
    const NODE_LIMIT = 2000000;  

    while (queueIndex < queue.length) {
        if (performance.now() - startTime > TIME_LIMIT_MS || queueIndex > NODE_LIMIT) {
            console.warn("Background Worker: BFS solver reached limit. Interrupted.");
            return -1;
        }

        const current = queue[queueIndex++];
        const currentBoard = deserializeBoard(current.state);

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const stack = currentBoard[y][x];
                if (stack.length === 0) continue;

                const validDests = getValidMovesForCell(x, y, currentBoard, targetCells, towersCount);
                for (const dest of validDests) {
                    const nextBoard = cloneBoardState(currentBoard);
                    const disk = nextBoard[y][x].pop();
                    nextBoard[dest.y][dest.x].push(disk);

                    const nextStr = serializeBoard(nextBoard);

                    if (nextStr === goalStr) {
                        return current.steps + 1;
                    }

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

    return -1;
}
