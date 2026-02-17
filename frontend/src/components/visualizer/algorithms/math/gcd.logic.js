export const euclideanGCD = async function* (input, target, delay) {
    // Parse a and b from input
    // Input can be "a: 48; b: 18" or array [48, 18]
    let a = 48;
    let b = 18;

    if (input) {
        if (Array.isArray(input) && input.length >= 2) {
            a = parseInt(input[0]) || 48;
            b = parseInt(input[1]) || 18;
        } else if (typeof input === 'string' && input.trim()) {
            const parts = input.split(';').map(p => p.trim());
            for (const part of parts) {
                if (part.toLowerCase().startsWith('a:')) {
                    const numStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsed = parseInt(numStr);
                    if (!isNaN(parsed) && parsed > 0) a = parsed;
                } else if (part.toLowerCase().startsWith('b:')) {
                    const numStr = part.substring(part.indexOf(':') + 1).trim();
                    const parsed = parseInt(numStr);
                    if (!isNaN(parsed) && parsed > 0) b = parsed;
                }
            }
        }
    }

    let num1 = Math.max(a, b);
    let num2 = Math.min(a, b);

    yield {
        type: 'init',
        a: num1,
        b: num2,
        explanation: `Finding GCD of ${num1} and ${num2} using Euclidean Algorithm`
    };
    await delay();

    while (num2 !== 0) {
        const remainder = num1 % num2;

        yield {
            type: 'computing',
            a: num1,
            b: num2,
            remainder,
            explanation: `${num1} = ${num2} × ${Math.floor(num1 / num2)} + ${remainder}`
        };
        await delay();

        num1 = num2;
        num2 = remainder;
    }

    const gcd = num1;
    const lcm = (a * b) / gcd;

    yield {
        type: 'complete',
        gcd,
        lcm,
        explanation: `✅ GCD(${a}, ${b}) = ${gcd}, LCM(${a}, ${b}) = ${lcm}`
    };
};
