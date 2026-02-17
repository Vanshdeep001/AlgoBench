export const factorialMemo = async function* (input, target, delay) {
    // Parse n from input
    // Input can be "n: 10" or just "10" or an array [10]
    let n = 10; // Default

    if (input) {
        if (typeof input === 'number' && !isNaN(input) && input >= 0) {
            n = Math.min(parseInt(input), 20);
        } else if (Array.isArray(input) && input.length > 0) {
            n = Math.min(Math.max(parseInt(input[0]), 0), 20);
        } else if (typeof input === 'string' && input.trim()) {
            const inputStr = input.trim();
            if (inputStr.toLowerCase().startsWith('n:')) {
                const numStr = inputStr.substring(inputStr.indexOf(':') + 1).trim();
                const parsed = parseInt(numStr);
                if (!isNaN(parsed) && parsed >= 0) {
                    n = Math.min(parsed, 20);
                }
            } else {
                const parsed = parseInt(inputStr);
                if (!isNaN(parsed) && parsed >= 0) {
                    n = Math.min(parsed, 20);
                }
            }
        }
    }

    const memo = {};
    const steps = [];

    async function* factorial(num) {
        if (num === 0 || num === 1) {
            yield {
                type: 'base',
                n: num,
                result: 1,
                memo: { ...memo },
                explanation: `Base case: ${num}! = 1`
            };
            await delay();
            return 1;
        }

        if (memo[num]) {
            yield {
                type: 'memoized',
                n: num,
                result: memo[num],
                memo: { ...memo },
                explanation: `✓ Using memoized value: ${num}! = ${memo[num]}`
            };
            await delay();
            return memo[num];
        }

        yield {
            type: 'computing',
            n: num,
            memo: { ...memo },
            explanation: `Computing ${num}! = ${num} × ${num - 1}!`
        };
        await delay();

        const result = num * (yield* factorial(num - 1));
        memo[num] = result;

        yield {
            type: 'stored',
            n: num,
            result,
            memo: { ...memo },
            explanation: `Computed and memoized: ${num}! = ${result}`
        };
        await delay();

        return result;
    }

    yield {
        type: 'init',
        n,
        memo: {},
        explanation: `Computing ${n}! with memoization`
    };
    await delay();

    const result = yield* factorial(n);

    yield {
        type: 'complete',
        n,
        result,
        memo: { ...memo },
        explanation: `✅ Final result: ${n}! = ${result}`
    };
};
