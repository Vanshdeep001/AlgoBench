export const bubbleSort = async function* (array, target, delay) {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  yield {
    type: 'init',
    explanation: `🔄 Starting Bubble Sort: We'll compare pairs of numbers and swap them if they're in the wrong order. Larger numbers "bubble up" to the end.`,
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
      explanation: `Round ${i + 1} of ${n - 1}: Finding the ${i === 0 ? 'largest' : i === 1 ? '2nd largest' : `${i + 1}th largest`} number...`,
      array: [...arr],
      comparisons,
      swaps,
      line: 4
    };
    await delay();

    let swappedThisRound = false;

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;

      yield {
        type: 'compare',
        comparingIndices: [j, j + 1],
        explanation: `Comparing: Is ${arr[j]} greater than ${arr[j + 1]}?`,
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
        swappedThisRound = true;

        yield {
          type: 'swap',
          swappedIndices: [j, j + 1],
          explanation: `Yes! Swapping ${arr[j]} and ${arr[j + 1]} to put them in order.`,
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
          explanation: `No swap needed. ${arr[j]} ≤ ${arr[j + 1]}, already in order.`,
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
      sortedIndices: Array.from({ length: i + 1 }, (_, idx) => n - idx - 1),
      explanation: `✓ Position ${n - i - 1} is now sorted! ${arr[n - i - 1]} is in its final place.`,
      array: [...arr],
      comparisons,
      swaps,
      line: 13
    };
    await delay();

    // Early termination if no swaps occurred
    if (!swappedThisRound) {
      // First, show all elements as sorted
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

      // Then show completion message
      yield {
        type: 'complete',
        explanation: `✅ Bubble Sort Complete! Array is sorted. Made ${swaps} swap${swaps !== 1 ? 's' : ''} and ${comparisons} comparison${comparisons !== 1 ? 's' : ''}.`,
        array: [...arr],
        comparisons,
        swaps,
        sortedIndices: Array.from({ length: n }, (_, i) => i),
        line: 15
      };
      return { array: arr, comparisons, swaps };
    }
  }

  // Show all elements as sorted before completion
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
    explanation: `✅ Bubble Sort Complete! Array is sorted. Made ${swaps} swap${swaps !== 1 ? 's' : ''} and ${comparisons} comparison${comparisons !== 1 ? 's' : ''}.`,
    array: [...arr],
    comparisons,
    swaps,
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    line: 15
  };

  return { array: arr, comparisons, swaps };
};
