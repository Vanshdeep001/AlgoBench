export const ratInMaze = async function* (input, target, delay) {
    // Parse input
    // Input format: "n: 5" (random 5x5) or "maze: [[1,0],[1,1]]"
    let n = 5;
    let maze = [];

    // Helper to generate a random solvable maze
    const generateMaze = (size) => {
        const newMaze = Array(size).fill(0).map(() => Array(size).fill(0));

        // Fill with random 0s (walls) and 1s (paths)
        // Bias towards 1s to make it solvable
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                newMaze[i][j] = Math.random() > 0.3 ? 1 : 0;
            }
        }

        // Ensure start and end are open
        newMaze[0][0] = 1;
        newMaze[size - 1][size - 1] = 1;

        // Ensure a guaranteed path exists (simpleDFS to carve a path if needed)
        // For simplicity, we'll just return this random maze and let the visualizer show if it's unsolvable
        // But to be nicer, let's ensure at least one simple path
        let x = 0, y = 0;
        while (x < size - 1 || y < size - 1) {
            newMaze[x][y] = 1;
            if (x < size - 1 && y < size - 1) {
                if (Math.random() > 0.5) x++; else y++;
            } else if (x < size - 1) {
                x++;
            } else {
                y++;
            }
        }
        newMaze[size - 1][size - 1] = 1;

        return newMaze;
    };

    if (input) {
        if (typeof input === 'number' && !isNaN(input) && input > 0) {
            n = Math.min(Math.max(parseInt(input), 4), 10);
            maze = generateMaze(n);
        } else if (typeof input === 'string' && input.trim()) {
            const inputStr = input.trim();
            if (inputStr.toLowerCase().startsWith('n:') || inputStr.toLowerCase().startsWith('size:')) {
                const numStr = inputStr.substring(inputStr.indexOf(':') + 1).trim();
                const parsed = parseInt(numStr);
                if (!isNaN(parsed) && parsed > 0) {
                    n = Math.min(Math.max(parsed, 4), 10);
                    maze = generateMaze(n);
                }
            } else if (inputStr.startsWith('[') && inputStr.endsWith(']')) {
                try {
                    // Try parsing as JSON maze array
                    // Need to be careful with JSON.parse on flexible input
                    const parsedMaze = JSON.parse(inputStr);
                    if (Array.isArray(parsedMaze) && Array.isArray(parsedMaze[0])) {
                        maze = parsedMaze;
                        n = maze.length;
                    }
                } catch (e) {
                    console.warn("Failed to parse maze input", e);
                }
            }
        }
    }

    if (maze.length === 0) {
        maze = generateMaze(n);
    }

    // Ensure dimensions match
    n = maze.length;

    const solution = Array(n).fill(null).map(() => Array(n).fill(0));

    // Yield initial state
    yield {
        type: 'init',
        maze: maze.map(row => [...row]),
        solution: solution.map(row => [...row]),
        explanation: `Starting Rat in Maze. Grid Size: ${n}x${n}`,
        state: 'start'
    };
    await delay();

    function isSafe(x, y) {
        return x >= 0 && x < n && y >= 0 && y < n && maze[x][y] === 1 && solution[x][y] === 0;
    }

    async function* solveMaze(x, y) {
        if (x === n - 1 && y === n - 1) {
            solution[x][y] = 1;
            yield {
                maze: maze.map(row => [...row]),
                solution: solution.map(row => [...row]),
                explanation: '✅ Destination reached! Path found.',
                state: 'complete',
                x,
                y
            };
            return true;
        }

        if (isSafe(x, y)) {
            solution[x][y] = 1;

            yield {
                maze: maze.map(row => [...row]),
                solution: solution.map(row => [...row]),
                explanation: `Moving to position (${x}, ${y})`,
                state: 'exploring',
                x,
                y
            };
            await delay();

            // Move right
            const rightResult = yield* solveMaze(x, y + 1);
            if (rightResult) return true;

            // Move down
            const downResult = yield* solveMaze(x + 1, y);
            if (downResult) return true;

            // Backtrack
            solution[x][y] = 0;
            yield {
                maze: maze.map(row => [...row]),
                solution: solution.map(row => [...row]),
                explanation: `↩️ Backtracking from (${x}, ${y})`,
                state: 'backtrack',
                x,
                y
            };
            await delay();

            return false;
        }

        return false;
    }

    const found = yield* solveMaze(0, 0);

    if (!found) {
        yield {
            maze: maze.map(row => [...row]),
            solution: solution.map(row => [...row]),
            explanation: '❌ No path found to destination.',
            state: 'no_solution'
        };
    }
};
