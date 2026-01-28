import { bubbleSort } from './bubbleSort.logic';
import { mergeSort } from './mergeSort.logic';

export const sortAlgorithms = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    visualizationType: 'array',
    complexity: 'O(n²)',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    algorithm: bubbleSort,
    code: `function bubbleSort(array) {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }
  return array;
}`,
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    visualizationType: 'array',
    complexity: 'O(n log n)',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    algorithm: mergeSort,
    code: `function mergeSort(array) {
  if (array.length <= 1) return array;
  
  const mid = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, mid));
  const right = mergeSort(array.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
    description: 'Divides the array into halves, sorts them, and merges them back together.'
  }
];
