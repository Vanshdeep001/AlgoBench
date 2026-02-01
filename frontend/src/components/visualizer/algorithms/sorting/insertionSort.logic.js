export const insertionSort = async function* (array, target, delay) {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;

    yield {
        type: 'init',
        explanation: `🔄 Starting Insertion Sort: We'll build a sorted portion one element at a time, inserting each new element in its correct position.`,
        array: [...arr],
        comparisons,
        swaps,
        sortedIndices: [0], // First element is considered sorted
        line: 1
    };
    await delay();

    // First element is already "sorted"
    for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;

        yield {
            type: 'select-key',
            activeIndex: i,
            explanation: `Selecting ${key} from position ${i}. Now finding where it belongs in the sorted portion (positions 0 to ${i - 1}).`,
            array: [...arr],
            comparisons,
            swaps,
            sortedIndices: Array.from({ length: i }, (_, idx) => idx),
            line: 3
        };
        await delay();

        // Shift elements to make room for key
        while (j >= 0 && arr[j] > key) {
            comparisons++;

            yield {
                type: 'compare',
                comparingIndices: [j, i],
                explanation: `Comparing: Is ${arr[j]} greater than ${key}? ${arr[j] > key ? 'Yes' : 'No'}`,
                array: [...arr],
                comparisons,
                swaps,
                line: 5
            };
            await delay();

            arr[j + 1] = arr[j];
            swaps++;

            yield {
                type: 'shift',
                swappedIndices: [j, j + 1],
                explanation: `Shifting ${arr[j]} one position to the right to make room.`,
                array: [...arr],
                comparisons,
                swaps,
                line: 7
            };
            await delay();

            j--;
        }

        // Final comparison if we didn't exit due to j < 0
        if (j >= 0) {
            comparisons++;
            yield {
                type: 'compare',
                comparingIndices: [j, i],
                explanation: `${arr[j]} ≤ ${key}, so we've found the correct position.`,
                array: [...arr],
                comparisons,
                swaps,
                line: 5
            };
            await delay();
        }

        arr[j + 1] = key;

        yield {
            type: 'insert',
            activeIndex: j + 1,
            explanation: `Inserting ${key} at position ${j + 1}. Positions 0 to ${i} are now sorted!`,
            array: [...arr],
            comparisons,
            swaps,
            sortedIndices: Array.from({ length: i + 1 }, (_, idx) => idx),
            line: 9
        };
        await delay();
    }

    yield {
        type: 'complete',
        explanation: `✅ Insertion Sort Complete! Array is sorted. Made ${swaps} shift${swaps !== 1 ? 's' : ''} and ${comparisons} comparison${comparisons !== 1 ? 's' : ''}.`,
        array: [...arr],
        comparisons,
        swaps,
        sortedIndices: Array.from({ length: n }, (_, i) => i),
        line: 11
    };

    return { array: arr, comparisons, swaps };
};
