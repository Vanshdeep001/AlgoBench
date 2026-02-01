export const binarySearch = async function* (array, target, delay) {
  const targetNum = parseInt(target);
  let comparisons = 0;
  let left = 0;
  let right = array.length - 1;

  // Check if array is sorted
  const isSorted = array.every((val, i, arr) => i === 0 || arr[i - 1] <= val);

  // If not sorted, sort it first with visual feedback
  let sortedArray = [...array];
  if (!isSorted) {
    yield {
      type: 'sorting-notice',
      explanation: `⚠️ Binary Search needs a sorted array. Let's sort it first...`,
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
          explanation: `Sorting: Comparing ${sortedArray[j]} and ${sortedArray[j + 1]}`,
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
            explanation: `Sorting: Swapping ${sortedArray[j + 1]} and ${sortedArray[j]}`,
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
      explanation: `✅ Array sorted! Now starting Binary Search for ${targetNum}...`,
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
    explanation: `🔍 Binary Search: Looking for ${targetNum}. We'll check the middle and eliminate half the array each time.`,
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
      explanation: `Finding middle position: (${left} + ${right}) ÷ 2 = ${mid}`,
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
      explanation: `Checking middle position ${mid}: Is ${sortedArray[mid]} equal to ${targetNum}?`,
      array: [...sortedArray],
      comparisons,
      line: 9
    };
    await delay();

    if (sortedArray[mid] === targetNum) {
      // Found the target - STOP immediately
      yield {
        type: 'found',
        foundIndex: mid,
        explanation: `✅ Success! Found ${targetNum} at position ${mid}. Binary search complete in ${comparisons} comparison${comparisons > 1 ? 's' : ''}.`,
        array: [...sortedArray],
        comparisons,
        line: 10
      };
      await delay();
      // Return immediately to stop the generator
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
        explanation: `${sortedArray[mid]} < ${targetNum}, so ${targetNum} must be in the right half. Searching positions ${left} to ${right}...`,
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
        explanation: `${sortedArray[mid]} > ${targetNum}, so ${targetNum} must be in the left half. Searching positions ${left} to ${right}...`,
        array: [...sortedArray],
        comparisons,
        line: 14
      };
    }

    await delay();
  }

  // Not found after eliminating all possibilities
  yield {
    type: 'complete-not-found',
    explanation: `❌ Search Complete: ${targetNum} is not in the array. Checked ${comparisons} position${comparisons > 1 ? 's' : ''}.`,
    array: [...sortedArray],
    comparisons,
    line: 17
  };

  return { foundIndex: -1, comparisons };
};
