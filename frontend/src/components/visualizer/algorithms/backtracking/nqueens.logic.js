export const nQueens = async function* (input, target, delay) {
    // Parse board size from input
    // Input can be "n: 8" or just "8"
    let n = 8; // Default

    if (input) {
        if (typeof input === 'number' && !isNaN(input) && input > 0) {
            n = Math.min(Math.max(parseInt(input), 4), 12); // Limit between 4 and 12
        } else if (typeof input === 'string' && input.trim()) {
            const inputStr = input.trim();
            if (inputStr.toLowerCase().startsWith('n:')) {
                const numStr = inputStr.substring(inputStr.indexOf(':') + 1).trim();
                const parsed = parseInt(numStr);
                if (!isNaN(parsed) && parsed > 0) {
                    n = Math.min(Math.max(parsed, 4), 12);
                }
            } else {
                const parsed = parseInt(inputStr);
                if (!isNaN(parsed) && parsed > 0) {
                    n = Math.min(Math.max(parsed, 4), 12);
                }
            }
        }
    }

    const board = Array(n).fill(null).map(() => Array(n).fill(0));
    let solutionFound = false;

    function isSafe(row, col) {
        for (let i = 0; i < col; i++) {
            if (board[row][i] === 1) return false;
        }
        for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] === 1) return false;
        }
        for (let i = row, j = col; i < n && j >= 0; i++, j--) {
            if (board[i][j] === 1) return false;
        }
        return true;
    }

    async function* solveNQueens(col) {
        if (col >= n) {
            solutionFound = true;
            yield {
                type: 'complete',
                board: board.map(row => [...row]),
                explanation: `✅ Solution found! All ${n} queens placed successfully.`,
                n
            };
            return true;
        }

        for (let row = 0; row < n; row++) {
            yield {
                type: 'trying',
                board: board.map(r => [...r]),
                explanation: `Trying to place queen at position (${row}, ${col})`,
                row,
                col,
                n
            };
            await delay();

            if (isSafe(row, col)) {
                board[row][col] = 1;

                yield {
                    type: 'placed',
                    board: board.map(r => [...r]),
                    explanation: `✓ Queen placed at (${row}, ${col}). Moving to column ${col + 1}.`,
                    row,
                    col,
                    n
                };
                await delay();

                const result = yield* solveNQueens(col + 1);
                if (result) return true;

                board[row][col] = 0;
                yield {
                    type: 'backtrack',
                    board: board.map(r => [...r]),
                    explanation: `↩️ Backtracking: Removing queen from (${row}, ${col})`,
                    row,
                    col,
                    n
                };
                await delay();
            } else {
                yield {
                    type: 'unsafe',
                    board: board.map(r => [...r]),
                    explanation: `✗ Position (${row}, ${col}) is not safe. Trying next row.`,
                    row,
                    col,
                    n
                };
                await delay();
            }
        }

        return false;
    }

    yield {
        type: 'init',
        board: board.map(row => [...row]),
        explanation: `Starting N-Queens problem for ${n}×${n} board`,
        n
    };
    await delay();

    yield* solveNQueens(0);

    if (!solutionFound) {
        yield {
            type: 'complete',
            board: board.map(row => [...row]),
            explanation: `No solution found for ${n}-Queens problem.`,
            n
        };
    }
};

