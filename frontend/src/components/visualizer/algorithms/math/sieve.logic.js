export const sieveOfEratosthenes = async function* (input, target, delay) {
    // Parse n from input
    // Input can be "n: 50" or just "50"
    let n = 50; // Default

    if (input) {
        if (typeof input === 'number' && !isNaN(input) && input > 1) {
            n = Math.min(parseInt(input), 200);
        } else if (typeof input === 'string' && input.trim()) {
            const inputStr = input.trim();
            if (inputStr.toLowerCase().startsWith('n:') || inputStr.toLowerCase().startsWith('limit:')) {
                const numStr = inputStr.substring(inputStr.indexOf(':') + 1).trim();
                const parsed = parseInt(numStr);
                if (!isNaN(parsed) && parsed > 1) {
                    n = Math.min(parsed, 200);
                }
            } else {
                const parsed = parseInt(inputStr);
                if (!isNaN(parsed) && parsed > 1) {
                    n = Math.min(parsed, 200);
                }
            }
        }
    }

    const isPrime = Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    yield {
        type: 'init',
        array: [...isPrime],
        explanation: `Starting Sieve of Eratosthenes to find all primes up to ${n}`,
        n
    };
    await delay();

    for (let p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            yield {
                type: 'prime_found',
                array: [...isPrime],
                explanation: `${p} is prime. Marking all multiples of ${p} as composite.`,
                current: p,
                n
            };
            await delay();

            for (let i = p * p; i <= n; i += p) {
                if (isPrime[i]) {
                    isPrime[i] = false;
                    yield {
                        type: 'marking',
                        array: [...isPrime],
                        explanation: `Marking ${i} as composite (multiple of ${p})`,
                        current: p,
                        marking: i,
                        n
                    };
                    await delay();
                }
            }
        }
    }

    const primes = [];
    for (let i = 2; i <= n; i++) {
        if (isPrime[i]) primes.push(i);
    }

    yield {
        type: 'complete',
        array: [...isPrime],
        primes,
        explanation: `✅ Found ${primes.length} prime numbers: ${primes.slice(0, 10).join(', ')}${primes.length > 10 ? '...' : ''}`,
        n
    };
};
