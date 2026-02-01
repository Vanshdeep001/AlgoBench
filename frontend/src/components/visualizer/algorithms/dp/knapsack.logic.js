export const knapsack = async function* (input, target, delay) {
    // Input format expected: "weights: 2,3,4; values: 3,4,5; capacity: 5"
    // Or just defaults

    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 6];
    const capacity = 5;
    const n = weights.length;

    // Initialize table (n+1) x (capacity+1)
    const table = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));

    const headers = Array.from({ length: capacity + 1 }, (_, i) => `${i}`);
    const rowLabels = ['-', ...weights.map((w, i) => `Item ${i + 1} (w:${w}, v:${values[i]})`)];

    yield {
        type: 'init',
        explanation: `🔄 Starting 0/1 Knapsack. Capacity: ${capacity}. Items: ${n}. Building table of size ${n + 1}x${capacity + 1}.`,
        table: JSON.parse(JSON.stringify(table)),
        headers,
        rowLabels,
        comparisons: 0,
        line: 1
    };
    await delay();

    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            const currentWeight = weights[i - 1];
            const currentValue = values[i - 1];

            yield {
                type: 'check',
                explanation: `Checking Item ${i} (w:${currentWeight}, v:${currentValue}) for capacity ${w}.`,
                table: JSON.parse(JSON.stringify(table)),
                headers,
                rowLabels,
                activeCells: [`${i}-${w}`],
                comparisons: i * capacity + w,
                line: 3
            };
            await delay();

            if (currentWeight <= w) {
                // Can include
                const valWithout = table[i - 1][w];
                const valWith = currentValue + table[i - 1][w - currentWeight];

                yield {
                    type: 'compare',
                    explanation: `Can include item. Max of (Exclude: ${valWithout}, Include: ${currentValue} + ${table[i - 1][w - currentWeight]})`,
                    table: JSON.parse(JSON.stringify(table)),
                    headers,
                    rowLabels,
                    activeCells: [`${i}-${w}`],
                    compareCells: [`${i - 1}-${w}`, `${i - 1}-${w - currentWeight}`],
                    comparisons: i * capacity + w,
                    line: 4
                };
                await delay();

                table[i][w] = Math.max(valWithout, valWith);
            } else {
                // Cannot include
                table[i][w] = table[i - 1][w];
                yield {
                    type: 'skip',
                    explanation: `Item too heavy (${currentWeight} > ${w}). Copying value from above: ${table[i - 1][w]}.`,
                    table: JSON.parse(JSON.stringify(table)),
                    headers,
                    rowLabels,
                    activeCells: [`${i}-${w}`],
                    compareCells: [`${i - 1}-${w}`],
                    comparisons: i * capacity + w,
                    line: 5
                };
                await delay();
            }

            yield {
                type: 'update',
                explanation: `Table[${i}][${w}] = ${table[i][w]}.`,
                table: JSON.parse(JSON.stringify(table)),
                headers,
                rowLabels,
                activeCells: [`${i}-${w}`],
                comparisons: i * capacity + w,
                line: 6
            };
            await delay();
        }
    }

    // Backtrack to find items (optional visualization)

    yield {
        type: 'complete',
        explanation: `✅ Knapsack Complete! Max Value: ${table[n][capacity]}.`,
        table: JSON.parse(JSON.stringify(table)),
        headers,
        rowLabels,
        activeCells: [`${n}-${capacity}`],
        finalPath: [`${n}-${capacity}`],
        comparisons: n * capacity,
        isComplete: true,
        line: 10
    };
};
