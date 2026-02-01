import { bubbleSort } from './bubbleSort.logic';
import { mergeSort } from './mergeSort.logic';
import { insertionSort } from './insertionSort.logic';
import { selectionSort } from './selectionSort.logic';
import { quickSort } from './quickSort.logic';

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
    description: 'Compare adjacent elements and swap if needed. Larger elements "bubble" to the end.'
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    visualizationType: 'array',
    complexity: 'O(n²)',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    algorithm: insertionSort,
    code: `function insertionSort(array) {
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = key;
  }
  return array;
}`,
    description: 'Build sorted array one element at a time by inserting each element in its correct position.'
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    visualizationType: 'array',
    complexity: 'O(n²)',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    algorithm: selectionSort,
    code: `function selectionSort(array) {
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    [array[i], array[minIndex]] = [array[minIndex], array[i]];
  }
  return array;
}`,
    description: 'Find the minimum element and place it at the beginning, then repeat for remaining elements.'
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
    description: 'Divide array into halves, sort them recursively, and merge sorted halves back together.'
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    visualizationType: 'array',
    complexity: 'O(n log n)',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    algorithm: quickSort,
    code: `function quickSort(array, low = 0, high = array.length - 1) {
  if (low < high) {
    const pivot = partition(array, low, high);
    quickSort(array, low, pivot - 1);
    quickSort(array, pivot + 1, high);
  }
  return array;
}

function partition(array, low, high) {
  const pivot = array[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (array[j] <= pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  return i + 1;
}`,
    description: 'Pick a pivot, partition array around it, and recursively sort the partitions.'
  }
];
