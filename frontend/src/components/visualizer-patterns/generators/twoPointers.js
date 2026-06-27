/**
 * Generators for the `twoPointers` pattern.
 *
 * Step state shape consumed by TwoPointersView:
 *   { left, right, mid, arr (current snapshot), result:[v|null], writeIdx,
 *     swapped, mismatch, finished, ans }
 * Renderer prefers state.arr (for mutating problems) and falls back to input.arr.
 */
import { chooseNums } from './_util';

const T = 'twoPointers';
const S = (desc, state) => ({ line: 1, desc, state });

export function validPalindrome(input) {
  let raw = (input && input.str) || 'racecar';
  let s = raw.toLowerCase().replace(/[^a-z0-9]/g, '') || 'racecar';
  if (s.length > 12) s = 'racecar';
  const arr = s.split('');
  const steps = [S('Two pointers start at both ends and move inward, comparing characters.', { left: 0, right: arr.length - 1 })];
  let l = 0, r = arr.length - 1, ok = true;
  while (l < r) {
    const same = arr[l] === arr[r];
    steps.push(S(`Compare '${arr[l]}' (L=${l}) and '${arr[r]}' (R=${r}): ${same ? 'match' : 'mismatch'}.`, { left: l, right: r, ...(same ? {} : { mismatch: true }) }));
    if (!same) { ok = false; break; }
    l++; r--;
  }
  steps.push(S(ok ? 'All pairs matched → palindrome (true).' : 'A pair differed → not a palindrome (false).', { left: l, right: r, finished: true, ans: ok ? 'true' : 'false' }));
  return { type: T, input: { arr, arrLabel: 's' }, steps };
}

export function reverseString(input) {
  const base = input && input.str && input.str.length <= 10 ? input.str : 'hello';
  let arr = base.split('');
  const steps = [S('Swap the characters at the two pointers, then move them inward.', { left: 0, right: arr.length - 1, arr: [...arr] })];
  let l = 0, r = arr.length - 1;
  while (l < r) {
    [arr[l], arr[r]] = [arr[r], arr[l]];
    steps.push(S(`Swap positions ${l} and ${r}.`, { left: l, right: r, arr: [...arr], swapped: true }));
    l++; r--;
  }
  steps.push(S(`Reversed: "${arr.join('')}".`, { left: l, right: r, arr: [...arr], finished: true, ans: arr.join(' ') }));
  return { type: T, input: { arr: base.split(''), arrLabel: 's' }, steps };
}

export function moveZeroes(input) {
  const orig = chooseNums(input, [0, 1, 0, 3, 12]);
  let arr = [...orig];
  const steps = [S('A write pointer marks where the next non-zero goes; a read pointer scans the array.', { left: 0, right: -1, arr: [...arr] })];
  let w = 0;
  for (let r = 0; r < arr.length; r++) {
    if (arr[r] !== 0) {
      [arr[w], arr[r]] = [arr[r], arr[w]];
      steps.push(S(`Read ${r} is non-zero (${arr[w]}) → place it at write ${w}.`, { left: w, right: r, arr: [...arr], swapped: true }));
      w++;
    } else {
      steps.push(S(`Read ${r} is zero → skip, leave write at ${w}.`, { left: w, right: r, arr: [...arr] }));
    }
  }
  steps.push(S(`All zeroes pushed to the end: [${arr.join(', ')}].`, { left: w, right: arr.length - 1, arr: [...arr], finished: true, ans: arr.join(' ') }));
  return { type: T, input: { arr: orig, arrLabel: 'nums' }, steps };
}

export function squaresOfSortedArray(input) {
  const arr = chooseNums(input, [-4, -1, 0, 3, 10]);
  const n = arr.length;
  const res = new Array(n).fill(null);
  const steps = [S('The largest square sits at one of the ends. Fill the result from the back using two pointers.', { left: 0, right: n - 1, result: [...res] })];
  let l = 0, r = n - 1, p = n - 1;
  while (l <= r) {
    const ls = arr[l] * arr[l], rs = arr[r] * arr[r];
    if (rs >= ls) { res[p] = rs; steps.push(S(`(${arr[r]})² = ${rs} ≥ (${arr[l]})² = ${ls} → place ${rs} at result[${p}].`, { left: l, right: r, result: [...res], writeIdx: p })); r--; }
    else { res[p] = ls; steps.push(S(`(${arr[l]})² = ${ls} > (${arr[r]})² = ${rs} → place ${ls} at result[${p}].`, { left: l, right: r, result: [...res], writeIdx: p })); l++; }
    p--;
  }
  steps.push(S(`Sorted squares: [${res.join(', ')}].`, { left: l, right: r, result: [...res], finished: true, ans: res.join(' ') }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function sortColors(input) {
  const orig = chooseNums(input, [2, 0, 2, 1, 1, 0]);
  let arr = [...orig];
  const steps = [S('Dutch national flag: a low boundary for 0s, a high boundary for 2s, and a scanning mid pointer.', { left: 0, right: arr.length - 1, mid: 0, arr: [...arr] })];
  let lo = 0, mid = 0, hi = arr.length - 1;
  while (mid <= hi) {
    if (arr[mid] === 0) { [arr[lo], arr[mid]] = [arr[mid], arr[lo]]; steps.push(S(`mid=${mid} is 0 → swap into the low region (${lo}).`, { left: lo, mid, right: hi, arr: [...arr], swapped: true })); lo++; mid++; }
    else if (arr[mid] === 2) { [arr[mid], arr[hi]] = [arr[hi], arr[mid]]; steps.push(S(`mid=${mid} is 2 → swap into the high region (${hi}).`, { left: lo, mid, right: hi, arr: [...arr], swapped: true })); hi--; }
    else { steps.push(S(`mid=${mid} is 1 → already in place, advance mid.`, { left: lo, mid, right: hi, arr: [...arr] })); mid++; }
  }
  steps.push(S(`Colors sorted: [${arr.join(', ')}].`, { left: lo, mid, right: hi, arr: [...arr], finished: true, ans: arr.join(' ') }));
  return { type: T, input: { arr: orig, arrLabel: 'nums' }, steps };
}

export function reverseWordsInString(input) {
  const raw = (input && input.str) || 'the sky is blue';
  let words = raw.trim().split(/\s+/).filter(Boolean);
  if (words.length > 6 || words.length < 1) words = ['the', 'sky', 'is', 'blue'];
  let arr = [...words];
  const steps = [S('Split into words, then reverse their order with two pointers.', { left: 0, right: arr.length - 1, arr: [...arr] })];
  let l = 0, r = arr.length - 1;
  while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; steps.push(S(`Swap word ${l} and word ${r}.`, { left: l, right: r, arr: [...arr], swapped: true })); l++; r--; }
  steps.push(S(`Reversed: "${arr.join(' ')}".`, { left: l, right: r, arr: [...arr], finished: true, ans: arr.join(' ') }));
  return { type: T, input: { arr: [...words], arrLabel: 'words' }, steps };
}
