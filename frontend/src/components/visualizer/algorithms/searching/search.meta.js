import { linearSearch } from './linearSearch.logic';
import { binarySearch } from './binarySearch.logic';

export const algorithms = [
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    visualizationType: 'array',
    complexity: 'O(n)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    algorithm: linearSearch,
    code: `function linearSearch(array, target) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === target) {
      return i;
    }
  }
  return -1;
}`,
    description: 'Searches for an element by checking each element sequentially.'
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    visualizationType: 'array',
    complexity: 'O(log n)',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    algorithm: binarySearch,
    code: `function binarySearch(array, target) {
  let left = 0;
  let right = array.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (array[mid] === target) {
      return mid;
    }
    if (array[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
    description: 'Efficiently searches a sorted array by repeatedly dividing the search space in half.'
  }
];
