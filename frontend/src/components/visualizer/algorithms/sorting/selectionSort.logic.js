export const selectionSort = async function* (array, target, delay) {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;

    yield {
        type: 'init',
        explanation: `🔄 Starting Selection Sort: We'll find the smallest element and move it to the front, then repeat for the rest.`,
        array: [...arr],
        comparisons,
        swaps,
        line: 1
    };
    await delay();

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;

        yield {
            type: 'start-round',
            activeIndex: i,
            explanation: `Round ${i + 1}: Finding the smallest element in positions ${i} to ${n - 1}...`,
            array: [...arr],
            comparisons,
            swaps,
            sortedIndices: Array.from({ length: i }, (_, idx) => idx),
            line: 3
        };
        await delay();

        // Find minimum element in unsorted portion
        for (let j = i + 1; j < n; j++) {
            comparisons++;

            yield {
                type: 'compare',
                comparingIndices: [minIndex, j],
                explanation: `Comparing: Is ${arr[j]} smaller than current minimum ${arr[minIndex]}?`,
                array: [...arr],
                comparisons,
                swaps,
                minIndex,
                line: 5
            };
            await delay();

            if (arr[j] < arr[minIndex]) {
                minIndex = j;

                yield {
                    type: 'new-min',
                    activeIndex: minIndex,
                    explanation: `Found new minimum! ${arr[minIndex]} at position ${minIndex}.`,
                    array: [...arr],
                    comparisons,
                    swaps,
                    minIndex,
                    line: 7
                };
                await delay();
            }
        }

        // Swap if needed
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            swaps++;

            yield {
                type: 'swap',
                swappedIndices: [i, minIndex],
                explanation: `Swapping ${arr[minIndex]} (at position ${minIndex}) with ${arr[i]} (at position ${i}).`,
                array: [...arr],
                comparisons,
                swaps,
                line: 9
            };
            await delay();
        }

        yield {
            type: 'sorted-element',
            sortedIndex: i,
            explanation: `✓ Position ${i} is now sorted! ${arr[i]} is in its final place.`,
            array: [...arr],
            comparisons,
            swaps,
            sortedIndices: Array.from({ length: i + 1 }, (_, idx) => idx),
            line: 11
        };
        await delay();
    }

    yield {
        type: 'complete',
        explanation: `✅ Selection Sort Complete! Array is sorted. Made ${swaps} swap${swaps !== 1 ? 's' : ''} and ${comparisons} comparison${comparisons !== 1 ? 's' : ''}.`,
        array: [...arr],
        comparisons,
        swaps,
        sortedIndices: Array.from({ length: n }, (_, i) => i),
        line: 13
    };

    return { array: arr, comparisons, swaps };
};
