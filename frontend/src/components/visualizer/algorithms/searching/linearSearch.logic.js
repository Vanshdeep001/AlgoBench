export const linearSearch = async function* (array, target, delay) {
  const targetNum = parseInt(target);
  let comparisons = 0;

  // Initial state
  yield {
    type: 'init',
    explanation: `🔍 Starting Linear Search: Looking for ${targetNum} in the array. We'll check each element one by one from left to right.`,
    comparisons,
    line: 1
  };
  await delay();

  for (let i = 0; i < array.length; i++) {
    comparisons++;

    yield {
      type: 'compare',
      activeIndex: i,
      explanation: `Checking position ${i}: Is ${array[i]} equal to ${targetNum}?`,
      comparisons,
      line: 3
    };

    await delay();

    if (array[i] === targetNum) {
      // Element found - show success and STOP
      yield {
        type: 'found',
        foundIndex: i,
        explanation: `✅ Success! Found ${targetNum} at position ${i}. Search complete in ${comparisons} comparison${comparisons > 1 ? 's' : ''}.`,
        comparisons,
        line: 5
      };
      await delay();
      // Return immediately to stop the generator
      return { foundIndex: i, comparisons };
    }

    yield {
      type: 'not-match',
      activeIndex: i,
      explanation: `${array[i]} ≠ ${targetNum}. Moving to the next position...`,
      comparisons,
      line: 7
    };

    await delay();
  }

  // Element not found after checking all positions
  yield {
    type: 'complete-not-found',
    explanation: `❌ Search Complete: ${targetNum} is not in the array. Checked all ${array.length} elements.`,
    comparisons,
    line: 10
  };

  return { foundIndex: -1, comparisons };
};
