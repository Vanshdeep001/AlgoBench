export const mergeSort = async function* (array, target, delay) {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  yield {
    type: 'init',
    explanation: `🔄 Starting Merge Sort: We'll recursively divide the array into halves until we have single elements, then merge them back in sorted order.`,
    array: [...arr],
    comparisons,
    swaps,
    line: 1
  };
  await delay();

  // Helper function to handle the recursive sorting
  const sort = async function* (start, end) {
    if (start >= end) {
      return;
    }

    const mid = Math.floor((start + end) / 2);

    // Visualize the split/divide step
    yield {
      type: 'split',
      explanation: `Dividing: Working on range [${start}-${end}]. Splitting into left [${start}-${mid}] and right [${mid + 1}-${end}].`,
      array: [...arr],
      comparisons,
      swaps,
      activeIndices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
      mid,
      line: 3
    };
    await delay();

    // Recursively sort left half
    yield* sort(start, mid);

    // Recursively sort right half
    yield* sort(mid + 1, end);

    // Merge the sorted halves
    yield* merge(start, mid, end);
  };

  // Helper function to merge two sorted subarrays
  const merge = async function* (start, mid, end) {
    // Visualize the merge start
    yield {
      type: 'merge-start',
      explanation: `Merging: Combining sorted sub-arrays [${start}-${mid}] and [${mid + 1}-${end}].`,
      array: [...arr],
      comparisons,
      swaps,
      activeIndices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
      line: 5
    };
    await delay();

    const leftArr = arr.slice(start, mid + 1);
    const rightArr = arr.slice(mid + 1, end + 1);

    let i = 0, j = 0, k = start;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;

      // Calculate original indices for visualization
      const realIdx1 = start + i;     // Currently approximate, as data moved
      const realIdx2 = mid + 1 + j;

      yield {
        type: 'compare',
        comparingIndices: [k, mid + 1 + j], // Visual approximation
        explanation: `Comparing: Is ${leftArr[i]} (limit left) < ${rightArr[j]} (limit right)?`,
        array: [...arr],
        comparisons,
        swaps,
        activeIndices: [k], // Highlight where we are placing the next element
        line: 7
      };
      await delay();

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];

        yield {
          type: 'overwrite',
          explanation: `Placing ${leftArr[i]} at position ${k}.`,
          array: [...arr],
          comparisons,
          swaps,
          swappedIndices: [k],
          line: 8
        };
        await delay();
        i++;
      } else {
        arr[k] = rightArr[j];

        yield {
          type: 'overwrite',
          explanation: `Placing ${rightArr[j]} at position ${k}.`,
          array: [...arr],
          comparisons,
          swaps,
          swappedIndices: [k],
          line: 9
        };
        await delay();
        j++;
      }
      k++;
      swaps++; // Counting writes as "swaps/operations"
    }

    // Copy remaining elements
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      yield {
        type: 'overwrite',
        explanation: `Copying remaining element ${leftArr[i]} to position ${k}.`,
        array: [...arr],
        comparisons,
        swaps,
        swappedIndices: [k],
        line: 11
      };
      await delay();
      i++;
      k++;
      swaps++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      yield {
        type: 'overwrite',
        explanation: `Copying remaining element ${rightArr[j]} to position ${k}.`,
        array: [...arr],
        comparisons,
        swaps,
        swappedIndices: [k],
        line: 12
      };
      await delay();
      j++;
      k++;
      swaps++;
    }

    // Show the locally "sorted" portion in purple
    yield {
      type: 'sub-sorted',
      explanation: `Merged range [${start}-${end}] is now sorted.`,
      array: [...arr],
      comparisons,
      swaps,
      sortedIndices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
      line: 13
    };
    await delay();
  };

  // Start the sort process
  yield* sort(0, n - 1);

  // Final "All Sorted" state (Green)
  yield {
    type: 'all-sorted',
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    explanation: `All elements are now in their correct positions!`,
    array: [...arr],
    comparisons,
    swaps,
    line: 14
  };
  await delay();

  yield {
    type: 'complete',
    explanation: `✅ Merge Sort Complete! Array is sorted. Made ${comparisons} comparison${comparisons !== 1 ? 's' : ''}.`,
    array: [...arr],
    comparisons,
    swaps,
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    line: 15
  };

  return { array: arr, comparisons, swaps };
};
