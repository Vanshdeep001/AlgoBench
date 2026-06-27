/**
 * Generators for the `binarySearch` pattern.
 *
 * Step state shape consumed by BinarySearchView:
 *   { lo, mid, hi, foundIdx, numeric, x, finished, ans }
 * input: { arr (sorted; omit for numeric range search), target, arrLabel, numeric, x }
 */
import { chooseNums, chooseInt } from './_util';

const T = 'binarySearch';
const S = (desc, state) => ({ line: 1, desc, state });

export function binarySearch(input) {
  const arr = chooseNums(input, [-1, 0, 3, 5, 9, 12]).slice().sort((a, b) => a - b);
  const target = arr.includes(9) ? 9 : arr[Math.floor(arr.length / 2)];
  const steps = [S(`Search for ${target} in the sorted array.`, { lo: 0, mid: -1, hi: arr.length - 1 })];
  let lo = 0, hi = arr.length - 1, found = -1, mid = -1;
  while (lo <= hi) {
    mid = (lo + hi) >> 1;
    steps.push(S(`lo=${lo}, hi=${hi}: mid=${mid} → ${arr[mid]}.`, { lo, mid, hi }));
    if (arr[mid] === target) { found = mid; steps.push(S(`${arr[mid]} == ${target} → found at index ${mid}.`, { lo, mid, hi, foundIdx: mid, finished: true, ans: String(mid) })); break; }
    if (arr[mid] < target) { steps.push(S(`${arr[mid]} < ${target} → discard the left half.`, { lo, mid, hi })); lo = mid + 1; }
    else { steps.push(S(`${arr[mid]} > ${target} → discard the right half.`, { lo, mid, hi })); hi = mid - 1; }
  }
  if (found === -1) steps.push(S(`${target} not present → return -1.`, { lo, mid: -1, hi, finished: true, ans: '-1' }));
  return { type: T, input: { arr, target, arrLabel: 'nums' }, steps };
}

export function searchInsertPosition(input) {
  const arr = chooseNums(input, [1, 3, 5, 6]).slice().sort((a, b) => a - b);
  const target = 5;
  const steps = [S(`Find where ${target} belongs to keep the array sorted.`, { lo: 0, mid: -1, hi: arr.length - 1 })];
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    steps.push(S(`lo=${lo}, hi=${hi}: mid=${mid} → ${arr[mid]}.`, { lo, mid, hi }));
    if (arr[mid] === target) { steps.push(S(`Found ${target} at index ${mid}.`, { lo, mid, hi, foundIdx: mid, finished: true, ans: String(mid) })); return { type: T, input: { arr, target, arrLabel: 'nums' }, steps }; }
    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  steps.push(S(`Insert position is ${lo}.`, { lo, mid: -1, hi, foundIdx: lo, finished: true, ans: String(lo) }));
  return { type: T, input: { arr, target, arrLabel: 'nums' }, steps };
}

export function searchInRotatedSortedArray(input) {
  const arr = chooseNums(input, [4, 5, 6, 7, 0, 1, 2]);
  const target = arr.includes(0) ? 0 : arr[arr.length - 1];
  const steps = [S(`Search for ${target} in a rotated sorted array — at each step one half is sorted.`, { lo: 0, mid: -1, hi: arr.length - 1 })];
  let lo = 0, hi = arr.length - 1, found = -1, mid = -1;
  while (lo <= hi) {
    mid = (lo + hi) >> 1;
    steps.push(S(`lo=${lo}, hi=${hi}: mid=${mid} → ${arr[mid]}.`, { lo, mid, hi }));
    if (arr[mid] === target) { found = mid; steps.push(S(`${arr[mid]} == ${target} → found at index ${mid}.`, { lo, mid, hi, foundIdx: mid, finished: true, ans: String(mid) })); break; }
    if (arr[lo] <= arr[mid]) {
      if (arr[lo] <= target && target < arr[mid]) { steps.push(S(`Left half [${lo}..${mid}] is sorted and holds ${target} → search left.`, { lo, mid, hi })); hi = mid - 1; }
      else { steps.push(S(`Left half sorted but ${target} not inside → search right.`, { lo, mid, hi })); lo = mid + 1; }
    } else {
      if (arr[mid] < target && target <= arr[hi]) { steps.push(S(`Right half [${mid}..${hi}] is sorted and holds ${target} → search right.`, { lo, mid, hi })); lo = mid + 1; }
      else { steps.push(S(`Right half sorted but ${target} not inside → search left.`, { lo, mid, hi })); hi = mid - 1; }
    }
  }
  if (found === -1) steps.push(S(`${target} not present → return -1.`, { lo, mid: -1, hi, finished: true, ans: '-1' }));
  return { type: T, input: { arr, target, arrLabel: 'nums (rotated)' }, steps };
}

export function sqrtX(input) {
  let x = chooseInt(input, 8); if (!(x >= 0 && x <= 1000)) x = 8;
  const steps = [S(`Integer square root of ${x} via binary search on 1..${x}.`, { lo: 1, mid: -1, hi: x, numeric: true, x })];
  if (x < 2) { steps.push(S(`${x} < 2 → answer is ${x}.`, { lo: 0, mid: x, hi: x, numeric: true, x, finished: true, ans: String(x) })); return { type: T, input: { numeric: true, x }, steps }; }
  let lo = 1, hi = x, ans = 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const sq = mid * mid;
    steps.push(S(`lo=${lo}, hi=${hi}: mid=${mid}, mid² = ${sq}.`, { lo, mid, hi, numeric: true, x }));
    if (sq === x) { steps.push(S(`${mid}² = ${x} exactly → ${mid}.`, { lo, mid, hi, numeric: true, x, finished: true, ans: String(mid) })); return { type: T, input: { numeric: true, x }, steps }; }
    if (sq < x) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  steps.push(S(`Largest m with m² ≤ ${x} is ${ans}.`, { lo, mid: ans, hi, numeric: true, x, finished: true, ans: String(ans) }));
  return { type: T, input: { numeric: true, x }, steps };
}
