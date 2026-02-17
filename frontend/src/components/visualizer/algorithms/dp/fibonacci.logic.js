export const fibonacci = async function* (nInput, target, delay) {
    // Input: n (number to calculate fib for)
    // Can be a number, or string like "n: 10" or just "10"
    let n = 6; // Default

    if (nInput) {
        if (typeof nInput === 'number' && !isNaN(nInput) && nInput > 0) {
            n = Math.min(parseInt(nInput), 20);
        } else if (typeof nInput === 'string' && nInput.trim()) {
            const input = nInput.trim();
            // Try parsing "n: 10" format
            if (input.toLowerCase().startsWith('n:')) {
                const numStr = input.substring(input.indexOf(':') + 1).trim();
                const parsed = parseInt(numStr);
                if (!isNaN(parsed) && parsed > 0) {
                    n = Math.min(parsed, 20);
                }
            } else {
                // Try parsing as direct number
                const parsed = parseInt(input);
                if (!isNaN(parsed) && parsed > 0) {
                    n = Math.min(parsed, 20);
                }
            }
        }
    }

    // Create table data structure
    const table = new Array(n + 1).fill(null);
    const headers = ['Val'];
    const rowLabels = []; // 1D table doesn't need row labels in this view style usually

    // Initial state
    yield {
        type: 'init',
        explanation: `🔄 calculating Fibonacci(${n}) using Dynamic Programming (Tabulation). We'll build the table from bottom up.`,
        table: [...table],
        headers: [], // 1D array view doesn't need headers mostly
        comparisons: 0,
        line: 1
    };
    await delay();

    // Base cases
    if (n >= 0) {
        table[0] = 0;
        yield {
            type: 'set',
            explanation: `Base Case: Fib(0) = 0.`,
            table: [...table],
            activeCells: ['0'],
            targetCell: '0',
            comparisons: 0,
            line: 2
        };
        await delay();
    }

    if (n >= 1) {
        table[1] = 1;
        yield {
            type: 'set',
            explanation: `Base Case: Fib(1) = 1.`,
            table: [...table],
            activeCells: ['1'],
            targetCell: '1',
            comparisons: 0,
            line: 3
        };
        await delay();
    }

    // Loop
    for (let i = 2; i <= n; i++) {
        yield {
            type: 'calculate',
            explanation: `Calculating Fib(${i}) = Fib(${i - 1}) + Fib(${i - 2}).`,
            table: [...table],
            activeCells: [`${i}`], // Target
            compareCells: [`${i - 1}`, `${i - 2}`], // Dependencies
            comparisons: i,
            line: 4
        };
        await delay();

        table[i] = table[i - 1] + table[i - 2];

        yield {
            type: 'update',
            explanation: `Fib(${i}) = ${table[i - 1]} + ${table[i - 2]} = ${table[i]}.`,
            table: [...table],
            activeCells: [`${i}`],
            targetCell: `${i}`,
            comparisons: i,
            line: 5
        };
        await delay();
    }

    yield {
        type: 'complete',
        explanation: `✅ Calculation Complete! Fib(${n}) = ${table[n]}.`,
        table: [...table],
        activeCells: [],
        finalPath: [`${n}`], // Highlight result
        comparisons: n, // rough complexity metric
        isComplete: true,
        line: 10
    };
};
