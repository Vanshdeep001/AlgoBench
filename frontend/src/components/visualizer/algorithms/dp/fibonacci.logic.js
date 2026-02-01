export const fibonacci = async function* (nInput, target, delay) {
    // Input: n (number to calculate fib for)
    // Default to 6 if not valid
    const n = (nInput && !isNaN(nInput) && nInput > 0) ? Math.min(parseInt(nInput), 20) : 6;

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
