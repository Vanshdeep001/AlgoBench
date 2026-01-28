export const mergeSort = async function* (array, target, delay) {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  yield {
    type: 'init',
    explanation: `Starting merge sort on array of size ${arr.length}`,
    array: [...arr],
    comparisons,
    swaps,
    line: 2
  };
  await delay();

  const merge = async function* (left, right, startIndex) {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      comparisons++;
      
      yield {
        type: 'merge-compare',
        comparingIndices: [startIndex + leftIndex, startIndex + left.length + rightIndex],
        explanation: `Comparing ${left[leftIndex]} and ${right[rightIndex]}`,
        array: [...arr],
        comparisons,
        swaps,
        line: 6
      };
      await delay();

      if (left[leftIndex] < right[rightIndex]) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
      swaps++;
    }

    while (leftIndex < left.length) {
      result.push(left[leftIndex]);
      leftIndex++;
    }

    while (rightIndex < right.length) {
      result.push(right[rightIndex]);
      rightIndex++;
    }

    return result;
  };

  const sort = async function* (arr, start = 0) {
    if (arr.length <= 1) {
      return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    yield {
      type: 'split',
      explanation: `Splitting array at index ${mid}`,
      array: [...arr],
      comparisons,
      swaps,
      line: 3
    };
    await delay();

    const sortedLeft = yield* sort(left, start);
    const sortedRight = yield* sort(right, start + mid);

    const merged = yield* merge(sortedLeft, sortedRight, start);
    
    // Update the main array
    for (let i = 0; i < merged.length; i++) {
      arr[start + i] = merged[i];
    }

    return merged;
  };

  yield* sort(arr);

  yield {
    type: 'complete',
    explanation: 'Array is now sorted!',
    array: [...arr],
    comparisons,
    swaps,
    sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    line: 15
  };

  return { array: arr, comparisons, swaps };
};
