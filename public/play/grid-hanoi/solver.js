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

function getValidMovesForCell(x, y, currentBoard, wrapAround) {
    const stack = currentBoard[y][x];
    if (!stack || stack.length === 0) return [];

    const topDisk = stack[stack.length - 1];
    const topDiskSize = getDiskSize(topDisk);
    const moves = [];

    const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];

    for (const dir of directions) {
        let nx1 = x + dir.dx;
        let ny1 = y + dir.dy;

        if (wrapAround) {
            nx1 = (nx1 + gridWidth) % gridWidth;
            ny1 = (ny1 + gridHeight) % gridHeight;
        } else {
            if (nx1 < 0 || nx1 >= gridWidth || ny1 < 0 || ny1 >= gridHeight) {
                continue;
            }
        }

        // 防護：移動不能回到原點
        if (nx1 === x && ny1 === y) {
            continue;
        }

        const stack1 = currentBoard[ny1][nx1];

        if (stack1.length === 0) {
            moves.push({ x: nx1, y: ny1 });
            continue;
        }

        const topDisk1 = stack1[stack1.length - 1];
        const topDisk1Size = getDiskSize(topDisk1);

        if (topDisk1Size > topDiskSize) {
            moves.push({ x: nx1, y: ny1 });
            continue;
        }

        if (topDisk1Size < topDiskSize) {
            let nx2 = x + dir.dx * 2;
            let ny2 = y + dir.dy * 2;

            if (wrapAround) {
                nx2 = (nx2 + gridWidth) % gridWidth;
                ny2 = (ny2 + gridHeight) % gridHeight;
            } else {
                if (nx2 < 0 || nx2 >= gridWidth || ny2 < 0 || ny2 >= gridHeight) {
                    continue;
                }
            }

            if (nx2 === x && ny2 === y) {
                continue;
            }

            const stack2 = currentBoard[ny2][nx2];

            if (stack2.length === 0) {
                moves.push({ x: nx2, y: ny2 });
                continue;
            }

            const topDisk2 = stack2[stack2.length - 1];
            const topDisk2Size = getDiskSize(topDisk2);

            if (topDisk2Size > topDiskSize) {
                moves.push({ x: nx2, y: ny2 });
            }
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

                const validDests = getValidMovesForCell(x, y, currentBoard, wrapAround);
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
