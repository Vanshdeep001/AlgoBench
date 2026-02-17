export const subsetSum = async function* (input, target, delay) {
    // Parse array and target from input
    // Input format: "array: 3,5,2,7; target: 10" or use defaults
    let arr = [3, 5, 2, 7];
    let targetSum = 10;

    if (input && typeof input === 'string' && input.trim()) {
        try {
            const parts = input.split(';').map(p => p.trim());
            for (const part of parts) {
                if (part.toLowerCase().startsWith('array:') || part.toLowerCase().startsWith('arr:')) {
                    const arrStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsedArr = arrStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);
                    if (parsedArr.length > 0) arr = parsedArr;
                } else if (part.toLowerCase().startsWith('target:') || part.toLowerCase().startsWith('sum:')) {
                    const targetStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsed = parseInt(targetStr);
                    if (!isNaN(parsed) && parsed > 0) targetSum = parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to parse subset sum input, using defaults:', e);
        }
    }

    // Also check if target parameter is provided
    if (target && !isNaN(parseInt(target))) {
        targetSum = parseInt(target);
    }

    const n = arr.length;
    let solutionFound = false;

    async function* findSubsets(index, currentSum, subset) {
        yield {
            arr: [...arr],
            subset: [...subset],
            currentSum,
            target: targetSum,
            explanation: `Current subset: [${subset.join(', ')}], Sum: ${currentSum}`,
            state: 'exploring',
            index
        };
        await delay();

        if (currentSum === targetSum) {
            solutionFound = true;
            yield {
                arr: [...arr],
                subset: [...subset],
                currentSum,
                target: targetSum,
                explanation: `✅ Found solution! Subset [${subset.join(', ')}] sums to ${targetSum}`,
                state: 'found',
                index
            };
            await delay();
            return true;
        }

        if (index >= n || currentSum > targetSum) {
            return false;
        }

        // Include current element
        subset.push(arr[index]);
        const includeResult = yield* findSubsets(index + 1, currentSum + arr[index], subset);
        if (includeResult) {
            return true;
        }

        // Backtrack - exclude current element
        subset.pop();
        yield {
            arr: [...arr],
            subset: [...subset],
            currentSum,
            target: targetSum,
            explanation: `↩️ Backtracking: Removing ${arr[index]} from subset`,
            state: 'backtrack',
            index
        };
        await delay();

        // Exclude current element
        const excludeResult = yield* findSubsets(index + 1, currentSum, subset);
        if (excludeResult) {
            return true;
        }

        return false;
    }

    yield {
        type: 'init',
        arr: [...arr],
        subset: [],
        currentSum: 0,
        target: targetSum,
        explanation: `🔄 Starting Subset Sum. Array: [${arr.join(', ')}], Target: ${targetSum}`,
        state: 'init'
    };
    await delay();

    yield* findSubsets(0, 0, []);

    if (!solutionFound) {
        yield {
            type: 'complete',
            arr: [...arr],
            subset: [],
            currentSum: 0,
            target: targetSum,
            explanation: `❌ No subset found that sums to ${targetSum}`,
            state: 'no_solution'
        };
    }
};
