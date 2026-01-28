export const bubbleSort = async function* (array, target, delay) {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  yield {
    type: 'init',
    explanation: `Starting bubble sort on array of size ${n}`,
    array: [...arr],
    comparisons,
    swaps,
    line: 2
  };
  await delay();

  for (let i = 0; i < n - 1; i++) {
    yield {
      type: 'outer-loop',
      outerIndex: i,
      explanation: `Outer loop iteration ${i + 1}: Processing elements`,
      array: [...arr],
      comparisons,
      swaps,
      line: 4
    };
    await delay();

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      
      yield {
        type: 'compare',
        comparingIndices: [j, j + 1],
        explanation: `Comparing ${arr[j]} and ${arr[j + 1]}`,
        array: [...arr],
        comparisons,
        swaps,
        line: 6
      };
      await delay();

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;

        yield {
          type: 'swap',
          swappedIndices: [j, j + 1],
          explanation: `${arr[j + 1]} > ${arr[j]}, swapping them`,
          array: [...arr],
          comparisons,
          swaps,
          line: 8
        };
        await delay();
      } else {
        yield {
          type: 'no-swap',
          comparingIndices: [j, j + 1],
          explanation: `${arr[j]} <= ${arr[j + 1]}, no swap needed`,
          array: [...arr],
          comparisons,
          swaps,
          line: 10
        };
        await delay();
      }
    }

    yield {
      type: 'sorted-element',
      sortedIndex: n - i - 1,
      explanation: `Element at position ${n - i - 1} is now in its correct position`,
      array: [...arr],
      comparisons,
      swaps,
      line: 13
    };
    await delay();
  }

  yield {
    type: 'complete',
    explanation: 'Array is now sorted!',
    array: [...arr],
    comparisons,
    swaps,
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    line: 15
  };

  return { array: arr, comparisons, swaps };
};
