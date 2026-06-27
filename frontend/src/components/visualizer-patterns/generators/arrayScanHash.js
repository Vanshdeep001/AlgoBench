/**
 * Generators for the `arrayScanHash` pattern: scan an array/string while building
 * a hash set / map / counter shown in a side panel.
 *
 * Step state shape consumed by ArrayScanHashView:
 *   { activeIdx, active2Idx, store:[{label,sub,status}], storeLabel,
 *     result:[{label}], matchIdx, finished, ans }
 */
import { chooseNums, chooseStr, chooseStrings, chooseArrays } from './_util';

const T = 'arrayScanHash';
const S = (desc, state) => ({ line: 1, desc, state });

export function singleNumber(input) {
  const arr = chooseNums(input, [4, 1, 2, 1, 2]);
  const set = new Map();
  const chips = () => [...set.keys()].map((k) => ({ label: String(k) }));
  const steps = [S('Use a set: add a number the first time you see it, remove it the second time. The lone number is left behind.', { activeIdx: -1, store: [], storeLabel: 'Seen once' })];
  arr.forEach((v, i) => {
    if (set.has(v)) set.delete(v); else set.set(v, true);
    steps.push(S(set.has(v) ? `Index ${i}: ${v} added to the set.` : `Index ${i}: ${v} seen again → removed (it pairs up).`, { activeIdx: i, store: chips(), storeLabel: 'Seen once' }));
  });
  const ans = [...set.keys()][0];
  steps.push(S(`Only ${ans} remains in the set — that is the single number.`, { activeIdx: arr.indexOf(ans), store: chips(), storeLabel: 'Seen once', matchIdx: arr.indexOf(ans), finished: true, ans: String(ans) }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function singleNumberII(input) {
  const arr = chooseNums(input, [2, 2, 3, 2]);
  const cnt = new Map();
  const chips = () => [...cnt.entries()].map(([k, v]) => ({ label: String(k), sub: `×${v}`, status: v % 3 !== 0 && v > 0 ? 'good' : undefined }));
  const steps = [S('Count how many times each value appears. Every value repeats 3× except one.', { activeIdx: -1, store: [], storeLabel: 'Counts' })];
  arr.forEach((v, i) => { cnt.set(v, (cnt.get(v) || 0) + 1); steps.push(S(`Index ${i}: count of ${v} is now ${cnt.get(v)}.`, { activeIdx: i, store: chips(), storeLabel: 'Counts' })); });
  let ans; for (const [k, v] of cnt) if (v % 3 !== 0) ans = k;
  steps.push(S(`${ans} appears a number of times not divisible by 3 → the unique number.`, { activeIdx: arr.indexOf(ans), store: chips(), storeLabel: 'Counts', matchIdx: arr.indexOf(ans), finished: true, ans: String(ans) }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function majorityElement(input) {
  const arr = chooseNums(input, [2, 2, 1, 1, 2]);
  let cand = null, count = 0;
  const chips = () => [{ label: 'candidate', sub: cand === null ? '—' : String(cand) }, { label: 'count', sub: String(count) }];
  const steps = [S("Boyer-Moore voting: keep a candidate and a counter.", { activeIdx: -1, store: chips(), storeLabel: 'Vote' })];
  arr.forEach((v, i) => {
    if (count === 0) { cand = v; count = 1; } else if (v === cand) count++; else count--;
    steps.push(S(`Index ${i} (${v}): ${v === cand ? 'supports' : 'opposes'} candidate ${cand}. count = ${count}.`, { activeIdx: i, store: chips(), storeLabel: 'Vote' }));
  });
  steps.push(S(`Candidate ${cand} survives — the majority element.`, { activeIdx: -1, store: chips(), storeLabel: 'Vote', finished: true, ans: String(cand) }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function missingNumber(input) {
  const arr = chooseNums(input, [3, 0, 1]);
  const n = arr.length;
  const set = new Set();
  const chips = () => [...set].sort((a, b) => a - b).map((x) => ({ label: String(x) }));
  const steps = [S(`Numbers should cover 0..${n}. Record which appear, then find the gap.`, { activeIdx: -1, store: [], storeLabel: 'Seen' })];
  arr.forEach((v, i) => { set.add(v); steps.push(S(`Index ${i}: mark ${v} as present.`, { activeIdx: i, store: chips(), storeLabel: 'Seen' })); });
  let ans = n; for (let k = 0; k <= n; k++) if (!set.has(k)) { ans = k; break; }
  steps.push(S(`${ans} never appeared → it is the missing number.`, { activeIdx: -1, store: chips(), storeLabel: 'Seen', finished: true, ans: String(ans) }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function intersectionOfTwoArrays(input) {
  const [a, b] = chooseArrays(input, [1, 2, 2, 1], [2, 2]);
  const set = new Set(a), seen = new Set(), res = [];
  const setChips = () => [...new Set(a)].map((x) => ({ label: String(x) }));
  const resChips = () => res.map((x) => ({ label: String(x) }));
  const steps = [S('Put the first array into a set, then scan the second array for matches.', { activeIdx: -1, active2Idx: -1, store: setChips(), storeLabel: 'Set(nums1)', result: [] })];
  b.forEach((v, j) => {
    const hit = set.has(v) && !seen.has(v);
    if (hit) { seen.add(v); res.push(v); }
    steps.push(S(`nums2[${j}] = ${v}: ${set.has(v) ? (hit ? 'in set → add to result' : 'already collected') : 'not in set'}.`, { activeIdx: -1, active2Idx: j, store: setChips(), storeLabel: 'Set(nums1)', result: resChips() }));
  });
  steps.push(S(`Intersection complete: [${res.join(', ')}].`, { activeIdx: -1, active2Idx: -1, store: setChips(), storeLabel: 'Set(nums1)', result: resChips(), finished: true, ans: res.join(' ') }));
  return { type: T, input: { arr: a, arr2: b, arrLabel: 'nums1', arr2Label: 'nums2' }, steps };
}

export function findDuplicateNumber(input) {
  const arr = chooseNums(input, [1, 3, 4, 2, 2]);
  const set = new Set();
  const chips = () => [...set].map((x) => ({ label: String(x) }));
  const steps = [S('Scan the array; the first value already in the set is the duplicate.', { activeIdx: -1, store: [], storeLabel: 'Seen' })];
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (set.has(v)) { steps.push(S(`Index ${i}: ${v} is already in the set → duplicate found!`, { activeIdx: i, store: chips(), storeLabel: 'Seen', matchIdx: i, finished: true, ans: String(v) })); break; }
    set.add(v);
    steps.push(S(`Index ${i}: ${v} is new, add it.`, { activeIdx: i, store: chips(), storeLabel: 'Seen' }));
  }
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function setMismatch(input) {
  const arr = chooseNums(input, [1, 2, 2, 4]);
  const n = arr.length;
  const cnt = new Map();
  const chips = () => [...cnt.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => ({ label: String(k), sub: `×${v}`, status: v === 2 ? 'bad' : undefined }));
  const steps = [S(`Count occurrences. One value appears twice (the duplicate); one value in 1..${n} is missing.`, { activeIdx: -1, store: [], storeLabel: 'Counts' })];
  arr.forEach((v, i) => { cnt.set(v, (cnt.get(v) || 0) + 1); steps.push(S(`Index ${i}: count of ${v} → ${cnt.get(v)}.`, { activeIdx: i, store: chips(), storeLabel: 'Counts' })); });
  let dup, miss; for (const [k, v] of cnt) if (v === 2) dup = k; for (let k = 1; k <= n; k++) if (!cnt.has(k)) miss = k;
  steps.push(S(`${dup} appears twice and ${miss} is missing → [${dup}, ${miss}].`, { activeIdx: -1, store: chips(), storeLabel: 'Counts', finished: true, ans: `${dup} ${miss}` }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function thirdMaximumNumber(input) {
  const arr = chooseNums(input, [2, 2, 3, 1]);
  let top = [];
  const chips = () => top.map((x, i) => ({ label: String(x), sub: ['1st', '2nd', '3rd'][i] }));
  const steps = [S('Track the three largest distinct values.', { activeIdx: -1, store: [], storeLabel: 'Top 3 distinct' })];
  arr.forEach((v, i) => {
    if (!top.includes(v)) { top.push(v); top.sort((a, b) => b - a); top = top.slice(0, 3); }
    steps.push(S(`Index ${i} (${v}): top set is now [${top.join(', ')}].`, { activeIdx: i, store: chips(), storeLabel: 'Top 3 distinct' }));
  });
  const ans = top.length === 3 ? top[2] : top[0];
  steps.push(S(top.length === 3 ? `Third distinct maximum is ${ans}.` : `Fewer than 3 distinct values → return the maximum ${ans}.`, { activeIdx: -1, store: chips(), storeLabel: 'Top 3 distinct', finished: true, ans: String(ans) }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function containsDuplicateII(input) {
  const arr = chooseNums(input, [1, 2, 3, 1]);
  const k = 3;
  const last = new Map();
  const chips = () => [...last.entries()].map(([key, v]) => ({ label: String(key), sub: `i=${v}` }));
  const steps = [S(`Map each value to its latest index. A repeat within distance k = ${k} means true.`, { activeIdx: -1, store: [], storeLabel: 'value → index' })];
  let done = false;
  for (let i = 0; i < arr.length && !done; i++) {
    const v = arr[i];
    if (last.has(v) && i - last.get(v) <= k) { done = true; steps.push(S(`${v} seen at ${last.get(v)} and ${i}; gap ${i - last.get(v)} ≤ ${k} → true.`, { activeIdx: i, store: chips(), storeLabel: 'value → index', matchIdx: i, finished: true, ans: 'true' })); break; }
    last.set(v, i);
    steps.push(S(`Index ${i}: record ${v} → ${i}.`, { activeIdx: i, store: chips(), storeLabel: 'value → index' }));
  }
  if (!done) steps.push(S('No nearby duplicate found → false.', { activeIdx: -1, store: chips(), storeLabel: 'value → index', finished: true, ans: 'false' }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function firstUniqueCharacter(input) {
  const str = chooseStr(input, 'leetcode');
  const arr = str.split('');
  const cnt = new Map();
  arr.forEach((c) => cnt.set(c, (cnt.get(c) || 0) + 1));
  const chips = () => [...cnt.entries()].map(([k, v]) => ({ label: k, sub: `×${v}`, status: v === 1 ? 'good' : undefined }));
  const steps = [S('First pass: count every character.', { activeIdx: -1, store: chips(), storeLabel: 'Counts' })];
  let ans = -1;
  for (let i = 0; i < arr.length; i++) {
    if (cnt.get(arr[i]) === 1) { ans = i; steps.push(S(`Index ${i}: '${arr[i]}' has count 1 → first unique character.`, { activeIdx: i, store: chips(), storeLabel: 'Counts', matchIdx: i, finished: true, ans: String(i) })); break; }
    steps.push(S(`Index ${i}: '${arr[i]}' repeats, skip.`, { activeIdx: i, store: chips(), storeLabel: 'Counts' }));
  }
  if (ans === -1) steps.push(S('No unique character → return -1.', { activeIdx: -1, store: chips(), storeLabel: 'Counts', finished: true, ans: '-1' }));
  return { type: T, input: { arr, arrLabel: 's' }, steps };
}

export function validAnagram(input) {
  const [ss, tt] = chooseStrings(input, 'anagram', 'nagaram');
  const a = ss.split(''), b = tt.split('');
  const cnt = new Map();
  const chips = () => [...cnt.entries()].map(([k, v]) => ({ label: k, sub: String(v), status: v < 0 ? 'bad' : v > 0 ? 'good' : undefined }));
  const steps = [S('Add counts for s, subtract for t. If everything cancels to zero, they are anagrams.', { activeIdx: -1, store: [], storeLabel: 'Net counts' })];
  a.forEach((c, i) => { cnt.set(c, (cnt.get(c) || 0) + 1); steps.push(S(`s[${i}] = '${c}' → +1.`, { activeIdx: i, store: chips(), storeLabel: 'Net counts' })); });
  b.forEach((c, j) => { cnt.set(c, (cnt.get(c) || 0) - 1); steps.push(S(`t[${j}] = '${c}' → -1.`, { active2Idx: j, store: chips(), storeLabel: 'Net counts' })); });
  const ok = a.length === b.length && [...cnt.values()].every((v) => v === 0);
  steps.push(S(ok ? 'Every count is zero → valid anagram.' : 'Some count is non-zero → not an anagram.', { store: chips(), storeLabel: 'Net counts', finished: true, ans: ok ? 'true' : 'false' }));
  return { type: T, input: { arr: a, arr2: b, arrLabel: 's', arr2Label: 't' }, steps };
}

export function ransomNote(input) {
  const [note, mag] = chooseStrings(input, 'aa', 'aab');
  const cnt = new Map();
  mag.split('').forEach((c) => cnt.set(c, (cnt.get(c) || 0) + 1));
  const chips = () => [...cnt.entries()].map(([k, v]) => ({ label: k, sub: String(v), status: v < 0 ? 'bad' : undefined }));
  const a = note.split('');
  const steps = [S('Count letters available in the magazine, then spend them on the note.', { activeIdx: -1, store: chips(), storeLabel: 'Magazine letters' })];
  for (let i = 0; i < a.length; i++) {
    const c = a[i];
    cnt.set(c, (cnt.get(c) || 0) - 1);
    if (cnt.get(c) < 0) { steps.push(S(`note[${i}] = '${c}': not enough copies in the magazine → false.`, { activeIdx: i, store: chips(), storeLabel: 'Magazine letters', finished: true, ans: 'false' })); return { type: T, input: { arr: a, arrLabel: 'ransomNote' }, steps }; }
    steps.push(S(`note[${i}] = '${c}': use one (${cnt.get(c)} left).`, { activeIdx: i, store: chips(), storeLabel: 'Magazine letters' }));
  }
  steps.push(S('All letters were available → true.', { store: chips(), storeLabel: 'Magazine letters', finished: true, ans: 'true' }));
  return { type: T, input: { arr: a, arrLabel: 'ransomNote' }, steps };
}

export function mergeSortedArray(input) {
  const [a, b] = chooseArrays(input, [1, 2, 3], [2, 5, 6]);
  const A = [...a].sort((x, y) => x - y), B = [...b].sort((x, y) => x - y);
  let i = 0, j = 0;
  const res = [];
  const resChips = () => res.map((x) => ({ label: String(x) }));
  const steps = [S('Two pointers walk both sorted arrays, always taking the smaller front value.', { activeIdx: 0, active2Idx: 0, result: [] })];
  while (i < A.length && j < B.length) {
    if (A[i] <= B[j]) { res.push(A[i]); steps.push(S(`nums1[${i}]=${A[i]} ≤ nums2[${j}]=${B[j]} → take ${A[i]}.`, { activeIdx: i, active2Idx: j, result: resChips() })); i++; }
    else { res.push(B[j]); steps.push(S(`nums2[${j}]=${B[j]} < nums1[${i}]=${A[i]} → take ${B[j]}.`, { activeIdx: i, active2Idx: j, result: resChips() })); j++; }
  }
  while (i < A.length) { res.push(A[i]); steps.push(S(`Append remaining nums1[${i}]=${A[i]}.`, { activeIdx: i, active2Idx: -1, result: resChips() })); i++; }
  while (j < B.length) { res.push(B[j]); steps.push(S(`Append remaining nums2[${j}]=${B[j]}.`, { activeIdx: -1, active2Idx: j, result: resChips() })); j++; }
  steps.push(S(`Merged: [${res.join(', ')}].`, { activeIdx: -1, active2Idx: -1, result: resChips(), finished: true, ans: res.join(' ') }));
  return { type: T, input: { arr: A, arr2: B, arrLabel: 'nums1', arr2Label: 'nums2' }, steps };
}

export function isomorphicStrings(input) {
  const [s, t] = chooseStrings(input, 'egg', 'add');
  const a = s.split(''), b = t.split('');
  const map = new Map(), used = new Set();
  const chips = () => [...map.entries()].map(([k, v]) => ({ label: `${k} → ${v}` }));
  const steps = [S('Map each character of s to a character of t — consistently and one-to-one.', { activeIdx: -1, store: [], storeLabel: 'Mapping' })];
  let ok = true;
  for (let i = 0; i < a.length; i++) {
    const c = a[i], d = b[i];
    if (map.has(c)) { if (map.get(c) !== d) ok = false; }
    else if (used.has(d)) ok = false; else { map.set(c, d); used.add(d); }
    steps.push(S(ok ? `Index ${i}: '${c}' ↔ '${d}' is consistent.` : `Index ${i}: '${c}' ↔ '${d}' conflicts with an earlier mapping → false.`, { activeIdx: i, active2Idx: i, store: chips(), storeLabel: 'Mapping', ...(ok ? {} : { finished: true, ans: 'false' }) }));
    if (!ok) return { type: T, input: { arr: a, arr2: b, arrLabel: 's', arr2Label: 't' }, steps };
  }
  steps.push(S('All characters map consistently → true.', { store: chips(), storeLabel: 'Mapping', finished: true, ans: 'true' }));
  return { type: T, input: { arr: a, arr2: b, arrLabel: 's', arr2Label: 't' }, steps };
}
