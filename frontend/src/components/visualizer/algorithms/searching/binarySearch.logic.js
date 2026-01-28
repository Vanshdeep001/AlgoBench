export const binarySearch = async function* (array, target, delay) {
  const targetNum = parseInt(target);
  let comparisons = 0;
  let left = 0;
  let right = array.length - 1;
  let foundIndex = -1;

  // Check if array is sorted
  const isSorted = array.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  
  // If not sorted, sort it first with visual feedback
  let sortedArray = [...array];
  if (!isSorted) {
    yield {
      type: 'sorting-notice',
      explanation: 'Array must be sorted for binary search. Sorting array...',
      array: [...sortedArray],
      comparisons,
      line: 1
    };
    await delay();
    await delay(); // Extra delay for clarity

    // Simple bubble sort for visualization
    for (let i = 0; i < sortedArray.length - 1; i++) {
      for (let j = 0; j < sortedArray.length - i - 1; j++) {
        yield {
          type: 'sort-compare',
          comparingIndices: [j, j + 1],
          explanation: `Comparing ${sortedArray[j]} and ${sortedArray[j + 1]} for sorting`,
          array: [...sortedArray],
          comparisons,
          line: 2
        };
        await delay();

        if (sortedArray[j] > sortedArray[j + 1]) {
          [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
          yield {
            type: 'sort-swap',
            swappedIndices: [j, j + 1],
            explanation: `Swapping ${sortedArray[j + 1]} and ${sortedArray[j]}`,
            array: [...sortedArray],
            comparisons,
            line: 3
          };
          await delay();
        }
      }
    }

    yield {
      type: 'sorted',
      explanation: 'Array is now sorted. Starting binary search...',
      array: [...sortedArray],
      sortedIndices: Array.from({ length: sortedArray.length }, (_, i) => i),
      comparisons,
      line: 4
    };
    await delay();
    await delay(); // Extra delay before search starts
  }

  yield {
    type: 'init',
    explanation: `Starting binary search for ${targetNum} in sorted array.`,
    left,
    right,
    array: [...sortedArray],
    comparisons,
    line: 6
  };
  await delay();

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    yield {
      type: 'calculate-mid',
      left,
      right,
      mid,
      explanation: `Calculating middle index: (${left} + ${right}) / 2 = ${mid}`,
      array: [...sortedArray],
      comparisons,
      line: 8
    };
    await delay();

    yield {
      type: 'compare',
      activeIndex: mid,
      left,
      right,
      mid,
      explanation: `Comparing element at index ${mid} (${sortedArray[mid]}) with target ${targetNum}`,
      array: [...sortedArray],
      comparisons,
      line: 9
    };
    await delay();

    if (sortedArray[mid] === targetNum) {
      foundIndex = mid;
      yield {
        type: 'found',
        foundIndex: mid,
        explanation: `Found target ${targetNum} at index ${mid}!`,
        array: [...sortedArray],
        comparisons,
        line: 10
      };
      await delay();
      return { foundIndex: mid, comparisons };
    }

    if (sortedArray[mid] < targetNum) {
      // Eliminate left half
      const eliminatedIndices = Array.from({ length: mid + 1 }, (_, i) => i);
      left = mid + 1;
      yield {
        type: 'move-right',
        left,
        right,
        mid,
        eliminatedIndices,
        eliminatedRange: [0, mid],
        explanation: `${sortedArray[mid]} < ${targetNum}, searching in right half (indices ${left} to ${right})`,
        array: [...sortedArray],
        comparisons,
        line: 12
      };
    } else {
      // Eliminate right half
      const eliminatedIndices = Array.from({ length: sortedArray.length - mid }, (_, i) => mid + i);
      right = mid - 1;
      yield {
        type: 'move-left',
        left,
        right,
        mid,
        eliminatedIndices,
        eliminatedRange: [mid, sortedArray.length - 1],
        explanation: `${sortedArray[mid]} > ${targetNum}, searching in left half (indices ${left} to ${right})`,
        array: [...sortedArray],
        comparisons,
        line: 14
      };
    }
    
    await delay();
  }

  yield {
    type: 'not-found',
    explanation: `Target ${targetNum} not found in the array.`,
    array: [...sortedArray],
    comparisons,
    line: 17
  };

  return { foundIndex: -1, comparisons };
};
