export const linearSearch = async function* (array, target, delay) {
  const targetNum = parseInt(target);
  let comparisons = 0;
  let foundIndex = -1;

  for (let i = 0; i < array.length; i++) {
    comparisons++;
    
    yield {
      type: 'compare',
      activeIndex: i,
      explanation: `Comparing element at index ${i} (${array[i]}) with target ${targetNum}`,
      comparisons,
      line: 3
    };
    
    await delay();

    if (array[i] === targetNum) {
      foundIndex = i;
      yield {
        type: 'found',
        foundIndex: i,
        explanation: `Found target ${targetNum} at index ${i}!`,
        comparisons,
        line: 5
      };
      await delay();
      return { foundIndex: i, comparisons };
    }

    yield {
      type: 'not-found',
      activeIndex: i,
      explanation: `Element ${array[i]} doesn't match. Moving to next element.`,
      comparisons,
      line: 7
    };
    
    await delay();
  }

  yield {
    type: 'not-found',
    explanation: `Target ${targetNum} not found in the array.`,
    comparisons,
    line: 10
  };

  return { foundIndex: -1, comparisons };
};
