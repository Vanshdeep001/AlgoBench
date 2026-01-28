export const trackComplexity = (operations, inputSize) => {
  const stats = {
    comparisons: 0,
    swaps: 0,
    iterations: 0,
    recursiveCalls: 0
  };

  // Track operations
  if (operations.comparisons) stats.comparisons = operations.comparisons;
  if (operations.swaps) stats.swaps = operations.swaps;
  if (operations.iterations) stats.iterations = operations.iterations;
  if (operations.recursiveCalls) stats.recursiveCalls = operations.recursiveCalls;

  // Calculate theoretical complexity
  const timeComplexity = estimateTimeComplexity(stats, inputSize);
  const spaceComplexity = estimateSpaceComplexity(stats, inputSize);

  return {
    ...stats,
    timeComplexity,
    spaceComplexity
  };
};

const estimateTimeComplexity = (stats, inputSize) => {
  if (stats.comparisons === 0) return 'O(1)';
  
  const ratio = stats.comparisons / inputSize;
  
  if (ratio <= 1) return 'O(n)';
  if (ratio <= Math.log2(inputSize)) return 'O(log n)';
  if (ratio <= inputSize * Math.log2(inputSize)) return 'O(n log n)';
  return 'O(n²)';
};

const estimateSpaceComplexity = (stats, inputSize) => {
  if (stats.recursiveCalls > 0) {
    return 'O(log n)';
  }
  return 'O(1)';
};
