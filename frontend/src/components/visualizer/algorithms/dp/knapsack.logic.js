export const knapsack = async function* (input, target, delay) {
    // Input format expected: "weights: 2,3,4; values: 3,4,5; capacity: 5"
    // Or just defaults

    let weights = [2, 3, 4, 5];
    let values = [3, 4, 5, 6];
    let capacity = 5;

    // Parse user input
    if (input && typeof input === 'string' && input.trim()) {
        try {
            const parts = input.split(';').map(p => p.trim());
            for (const part of parts) {
                if (part.toLowerCase().startsWith('weights:')) {
                    const weightStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsedWeights = weightStr.split(',').map(w => parseInt(w.trim())).filter(w => !isNaN(w) && w > 0);
                    if (parsedWeights.length > 0) weights = parsedWeights;
                } else if (part.toLowerCase().startsWith('values:') || part.toLowerCase().startsWith('profits:')) {
                    const valueStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsedValues = valueStr.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v) && v > 0);
                    if (parsedValues.length > 0) values = parsedValues;
                } else if (part.toLowerCase().startsWith('capacity:')) {
                    const capStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsedCap = parseInt(capStr);
                    if (!isNaN(parsedCap) && parsedCap > 0) capacity = parsedCap;
                }
            }

            // Ensure weights and values have same length
            const minLen = Math.min(weights.length, values.length);
            weights = weights.slice(0, minLen);
            values = values.slice(0, minLen);
        } catch (e) {
            // Use defaults on parse error
            console.warn('Failed to parse knapsack input, using defaults:', e);
        }
    }

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
