export const quickSort = async function* (array, target, delay) {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    yield {
        type: 'init',
        explanation: `🔄 Starting Quick Sort: We'll pick a pivot element, partition the array around it, and recursively sort the parts.`,
        array: [...arr],
        comparisons,
        swaps,
        line: 1
    };
    await delay();

    const partition = async function* (low, high) {
        const pivot = arr[high];
        let i = low - 1;

        yield {
            type: 'select-pivot',
            activeIndex: high,
            explanation: `Selected pivot: ${pivot} at position ${high}. Now partitioning...`,
            array: [...arr],
            comparisons,
            swaps,
            pivot,
            low,
            high,
            line: 3
        };
        await delay();

        for (let j = low; j < high; j++) {
            comparisons++;

            yield {
                type: 'compare',
                comparingIndices: [j, high],
                explanation: `Comparing ${arr[j]} with pivot ${pivot}. Is ${arr[j]} ≤ ${pivot}?`,
                array: [...arr],
                comparisons,
                swaps,
                pivot,
                low,
                high,
                line: 5
            };
            await delay();

            if (arr[j] <= pivot) {
                i++;

                if (i !== j) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    swaps++;

                    yield {
                        type: 'swap',
                        swappedIndices: [i, j],
                        explanation: `${arr[j]} ≤ ${pivot}, swapping it to the left partition.`,
                        array: [...arr],
                        comparisons,
                        swaps,
                        pivot,
                        low,
                        high,
                        line: 7
                    };
                    await delay();
                }
            }
        }

        // Place pivot in correct position
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        swaps++;

        yield {
            type: 'place-pivot',
            swappedIndices: [i + 1, high],
            explanation: `Placing pivot ${pivot} at its final position ${i + 1}.`,
            array: [...arr],
            comparisons,
            swaps,
            pivotIndex: i + 1,
            low,
            high,
            line: 9
        };
        await delay();

        return i + 1;
    };

    const sort = async function* (low, high) {
        if (low < high) {
            const pivotIndex = yield* partition(low, high);

            yield {
                type: 'partition-complete',
                explanation: `Partition complete! Elements ≤ ${arr[pivotIndex]} are on the left, elements > ${arr[pivotIndex]} are on the right.`,
                array: [...arr],
                comparisons,
                swaps,
                sortedIndices: [pivotIndex],
                line: 11
            };
            await delay();

            yield* sort(low, pivotIndex - 1);
            yield* sort(pivotIndex + 1, high);
        } else if (low === high) {
            yield {
                type: 'single-element',
                explanation: `Single element at position ${low} is already sorted.`,
                array: [...arr],
                comparisons,
                swaps,
                line: 13
            };
            await delay();
        }
    };

    yield* sort(0, arr.length - 1);

    yield {
        type: 'complete',
        explanation: `✅ Quick Sort Complete! Array is sorted. Made ${swaps} swap${swaps !== 1 ? 's' : ''} and ${comparisons} comparison${comparisons !== 1 ? 's' : ''}.`,
        array: [...arr],
        comparisons,
        swaps,
        sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
        line: 15
    };

    return { array: arr, comparisons, swaps };
};
