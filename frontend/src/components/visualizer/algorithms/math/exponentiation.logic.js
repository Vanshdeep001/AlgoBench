export const fastExponentiation = async function* (input, target, delay) {
    // Parse base and exponent from input
    // Input can be "base: 2; exponent: 10" or array [2, 10]
    let base = 2;
    let exponent = 10;

    if (input) {
        if (Array.isArray(input) && input.length >= 2) {
            base = parseInt(input[0]) || 2;
            exponent = parseInt(input[1]) || 10;
        } else if (typeof input === 'string' && input.trim()) {
            const parts = input.split(';').map(p => p.trim());
            for (const part of parts) {
                if (part.toLowerCase().startsWith('base:')) {
                    const numStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsed = parseInt(numStr);
                    if (!isNaN(parsed)) base = Math.min(Math.max(parsed, 1), 100);
                } else if (part.toLowerCase().startsWith('exponent:') || part.toLowerCase().startsWith('exp:')) {
                    const numStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsed = parseInt(numStr);
                    if (!isNaN(parsed)) exponent = Math.min(Math.max(parsed, 0), 30);
                }
            }
        }
    }

    let result = 1;
    let b = base;
    let exp = exponent;

    yield {
        type: 'init',
        base,
        exponent,
        result,
        explanation: `Computing ${base}^${exponent} using Fast Exponentiation (Binary Method)`
    };
    await delay();

    while (exp > 0) {
        const binary = exp.toString(2);

        if (exp % 2 === 1) {
            result *= b;
            yield {
                type: 'multiply',
                base: b,
                exponent: exp,
                result,
                binary,
                explanation: `Exponent ${exp} (${binary}) is odd. Multiply result by ${b}. Result = ${result}`
            };
            await delay();
        } else {
            yield {
                type: 'skip',
                base: b,
                exponent: exp,
                result,
                binary,
                explanation: `Exponent ${exp} (${binary}) is even. Skip multiplication.`
            };
            await delay();
        }

        b *= b;
        exp = Math.floor(exp / 2);

        if (exp > 0) {
            yield {
                type: 'square',
                base: b,
                exponent: exp,
                result,
                binary: exp.toString(2),
                explanation: `Square base to ${b}, halve exponent to ${exp}`
            };
            await delay();
        }
    }

    yield {
        type: 'complete',
        result,
        explanation: `✅ Final result: ${base}^${exponent} = ${result}`
    };
};
