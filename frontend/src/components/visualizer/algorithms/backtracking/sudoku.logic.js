export const sudokuSolver = async function* (input, target, delay) {
    const n = 9;
    let board = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    // Difficulty presets
    const presets = {
        easy: [
            [0, 0, 0, 2, 6, 0, 7, 0, 1],
            [6, 8, 0, 0, 7, 0, 0, 9, 0],
            [1, 9, 0, 0, 0, 4, 5, 0, 0],
            [8, 2, 0, 1, 0, 0, 0, 4, 0],
            [0, 0, 4, 6, 0, 2, 9, 0, 0],
            [0, 5, 0, 0, 0, 3, 0, 2, 8],
            [0, 0, 9, 3, 0, 0, 0, 7, 4],
            [0, 4, 0, 0, 5, 0, 0, 3, 6],
            [7, 0, 3, 0, 1, 8, 0, 0, 0]
        ],
        medium: [
            [0, 2, 0, 6, 0, 8, 0, 0, 0],
            [5, 8, 0, 0, 0, 9, 7, 0, 0],
            [0, 0, 0, 0, 4, 0, 0, 0, 0],
            [3, 7, 0, 0, 0, 0, 5, 0, 0],
            [6, 0, 0, 0, 0, 0, 0, 0, 4],
            [0, 0, 8, 0, 0, 0, 0, 1, 3],
            [0, 0, 0, 0, 2, 0, 0, 0, 0],
            [0, 0, 9, 8, 0, 0, 0, 3, 6],
            [0, 0, 0, 3, 0, 6, 0, 9, 0]
        ],
        hard: [
            [0, 0, 0, 6, 0, 0, 4, 0, 0],
            [7, 0, 0, 0, 0, 3, 6, 0, 0],
            [0, 0, 0, 0, 9, 1, 0, 8, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 5, 0, 1, 8, 0, 0, 0, 3],
            [0, 0, 0, 3, 0, 6, 0, 4, 5],
            [0, 4, 0, 2, 0, 0, 0, 6, 0],
            [9, 0, 3, 0, 0, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0, 1, 0, 0]
        ]
    };

    if (input) {
        if (typeof input === 'string') {
            const lowerInput = input.toLowerCase().trim();
            if (lowerInput.includes('easy')) board = JSON.parse(JSON.stringify(presets.easy));
            else if (lowerInput.includes('medium')) board = JSON.parse(JSON.stringify(presets.medium));
            else if (lowerInput.includes('hard')) board = JSON.parse(JSON.stringify(presets.hard));
            else if (input.startsWith('[') && input.endsWith(']')) {
                try {
                    const parsed = JSON.parse(input);
                    if (Array.isArray(parsed) && parsed.length === 9) board = parsed;
                } catch (e) {
                    console.warn("Invalid custom board", e);
                }
            }
        }
    }

    // Helper to check validity
    function isValid(board, row, col, num) {
        for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
        for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;
        const startRow = row - (row % 3), startCol = col - (col % 3);
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (board[i + startRow][j + startCol] === num) return false;
        return true;
    }

    // Store original implementation for highlighting fixed cells
    // Using JSON parse/stringify to deep copy
    const initialCopy = JSON.parse(JSON.stringify(board));

    // Yield initial state
    yield {
        type: 'init',
        board: JSON.parse(JSON.stringify(board)),
        initialBoard: initialCopy,
        explanation: 'Starting Sudoku Solver.',
        state: 'start'
    };
    await delay();

    async function* solve(row, col) {
        // Base case: If we reached past the last cell
        if (row === 9) return true;

        // Calculate next coordinates
        const nextRow = col === 8 ? row + 1 : row;
        const nextCol = col === 8 ? 0 : col + 1;

        // Skip filled cells
        if (board[row][col] !== 0) {
            return yield* solve(nextRow, nextCol);
        }

        // Try numbers 1-9
        for (let num = 1; num <= 9; num++) {
            yield {
                board: JSON.parse(JSON.stringify(board)), // Deep copy for visualization
                initialBoard: initialCopy,
                explanation: `Trying ${num} at position (${row}, ${col})`,
                type: 'trying',
                row,
                col,
                num
            };
            // No delay here to speed it up significantly, or very short delay
            // await delay(); 

            if (isValid(board, row, col, num)) {
                board[row][col] = num;

                yield {
                    board: JSON.parse(JSON.stringify(board)),
                    initialBoard: initialCopy,
                    explanation: `Placed ${num} at (${row}, ${col})`,
                    type: 'placed',
                    row,
                    col,
                    num
                };
                await delay();

                if (yield* solve(nextRow, nextCol)) {
                    return true;
                }

                // Backtrack
                board[row][col] = 0;
                yield {
                    board: JSON.parse(JSON.stringify(board)),
                    initialBoard: initialCopy,
                    explanation: `↩️ Backtracking: Removing ${num} from (${row}, ${col})`,
                    type: 'backtrack',
                    row,
                    col
                };
                await delay();
            }
        }
        return false;
    }

    const solved = yield* solve(0, 0);

    if (solved) {
        yield {
            board: JSON.parse(JSON.stringify(board)),
            initialBoard: initialCopy,
            explanation: '✅ Sudoku solved successfully!',
            type: 'complete',
            state: 'complete'
        };
    } else {
        yield {
            board: JSON.parse(JSON.stringify(board)),
            initialBoard: initialCopy,
            explanation: '❌ No solution found.',
            type: 'no_solution',
            state: 'complete'
        };
    }
};
