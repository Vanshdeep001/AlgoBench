/**
 * Generator for the `sortHeap` pattern: scan an array while maintaining a small
 * top-k heap shown in a side panel.
 *
 * Step state shape consumed by SortHeapView:
 *   { activeIdx, heap:[{label,status}], k, finished, ans }
 */
import { chooseNums } from './_util';

const T = 'sortHeap';
const S = (desc, state) => ({ line: 1, desc, state });

export function kthLargestElement(input) {
  const arr = chooseNums(input, [3, 2, 1, 5, 6, 4]);
  const k = 2;
  let heap = []; // k largest seen, ascending → heap[0] is the smallest of them
  const chips = () => heap.map((v, i) => ({ label: String(v), status: i === 0 ? 'active' : undefined }));
  const steps = [S(`Keep a min-heap of the ${k} largest values seen. Its smallest element is the ${k}th largest overall.`, { activeIdx: -1, heap: [], k })];
  arr.forEach((v, i) => {
    heap.push(v); heap.sort((a, b) => a - b); if (heap.length > k) heap.shift();
    steps.push(S(`See ${v} → heap of top ${k}: [${heap.join(', ')}].`, { activeIdx: i, heap: chips(), k }));
  });
  const ans = heap[0];
  steps.push(S(`The ${k}th largest element is ${ans}.`, { activeIdx: -1, heap: chips(), k, finished: true, ans: String(ans) }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}
