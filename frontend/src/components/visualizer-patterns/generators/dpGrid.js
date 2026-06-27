/**
 * Generators for the `dpGrid` pattern: a 1D/2D/ragged table that fills cell by cell.
 *
 * Step state shape consumed by DPGridView:
 *   { grid:[[v|null]], r, c, rowLabels, colLabels, finished, ans }
 */
import { chooseNums, chooseInt } from './_util';

const T = 'dpGrid';
const S = (desc, state) => ({ line: 1, desc, state });

export function uniquePaths(input) {
  let m = 3, n = 3;
  const ints = (input && input.ints) || [];
  if (ints.length >= 2 && ints[0] >= 1 && ints[0] <= 6 && ints[1] >= 1 && ints[1] <= 6) { m = ints[0]; n = ints[1]; }
  const g = Array.from({ length: m }, () => new Array(n).fill(null));
  const snap = () => g.map((r) => [...r]);
  const steps = [S(`Count paths in a ${m}×${n} grid moving only right or down. Each cell = cell above + cell left.`, { grid: snap(), r: -1, c: -1 })];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    g[i][j] = (i === 0 || j === 0) ? 1 : g[i - 1][j] + g[i][j - 1];
    steps.push(S(i === 0 || j === 0 ? `Edge cell (${i},${j}) = 1.` : `(${i},${j}) = ${g[i - 1][j]} + ${g[i][j - 1]} = ${g[i][j]}.`, { grid: snap(), r: i, c: j }));
  }
  steps.push(S(`Paths to the bottom-right = ${g[m - 1][n - 1]}.`, { grid: snap(), r: m - 1, c: n - 1, finished: true, ans: String(g[m - 1][n - 1]) }));
  return { type: T, input: {}, steps };
}

export function coinChange() {
  const coins = [1, 2, 5];
  const amount = 11;
  const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0;
  const snap = () => [dp.map((v) => (v === Infinity ? null : v))];
  const labels = dp.map((_, i) => i);
  const steps = [S(`Fewest coins from {${coins.join(', ')}} to make ${amount}. dp[a] = 1 + min over coins of dp[a-coin].`, { grid: snap(), r: 0, c: 0, colLabels: labels, rowLabels: ['dp'] })];
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    steps.push(S(dp[a] === Infinity ? `Amount ${a}: not reachable yet.` : `dp[${a}] = ${dp[a]} coin(s).`, { grid: snap(), r: 0, c: a, colLabels: labels, rowLabels: ['dp'] }));
  }
  const ans = dp[amount] === Infinity ? -1 : dp[amount];
  steps.push(S(`Minimum coins to make ${amount} = ${ans}.`, { grid: snap(), r: 0, c: amount, colLabels: labels, rowLabels: ['dp'], finished: true, ans: String(ans) }));
  return { type: T, input: {}, steps };
}

export function longestIncreasingSubsequence(input) {
  const nums = chooseNums(input, [10, 9, 2, 5, 3, 7]);
  const n = nums.length;
  const dp = new Array(n).fill(null);
  const snap = () => [[...nums], [...dp]];
  const steps = [S('dp[i] = longest increasing subsequence ending at i; compare each i with all earlier j.', { grid: snap(), r: 1, c: -1, rowLabels: ['nums', 'dp'] })];
  for (let i = 0; i < n; i++) {
    dp[i] = 1;
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    steps.push(S(`i=${i} (${nums[i]}): longest ending here = ${dp[i]}.`, { grid: snap(), r: 1, c: i, rowLabels: ['nums', 'dp'] }));
  }
  const ans = Math.max(...dp);
  steps.push(S(`Longest increasing subsequence length = ${ans}.`, { grid: snap(), r: 1, c: dp.indexOf(ans), rowLabels: ['nums', 'dp'], finished: true, ans: String(ans) }));
  return { type: T, input: {}, steps };
}

export function pascalsTriangle(input) {
  let rows = chooseInt(input, 5); if (!(rows >= 1 && rows <= 6)) rows = 5;
  const tri = [];
  const snap = () => tri.map((r) => [...r]);
  const steps = [S(`Build Pascal's triangle with ${rows} rows. Each interior value = sum of the two values above it.`, { grid: [], r: -1, c: -1, triangle: true })];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j <= i; j++) row.push((j === 0 || j === i) ? 1 : tri[i - 1][j - 1] + tri[i - 1][j]);
    tri.push(row);
    steps.push(S(`Row ${i}: [${row.join(', ')}].`, { grid: snap(), r: i, c: i, triangle: true }));
  }
  steps.push(S('Triangle complete.', { grid: snap(), r: rows - 1, c: -1, triangle: true, finished: true, ans: tri.map((r) => r.join(' ')).join(' | ') }));
  return { type: T, input: {}, steps };
}

export function pascalsTriangleII(input) {
  let idx = chooseInt(input, 3); if (!(idx >= 0 && idx <= 6)) idx = 3;
  let row = [1];
  const steps = [S(`Compute row ${idx} of Pascal's triangle in place, updating from the right.`, { grid: [[...row]], r: 0, c: 0 })];
  for (let i = 1; i <= idx; i++) {
    row.push(1);
    for (let j = row.length - 2; j > 0; j--) row[j] = row[j] + row[j - 1];
    steps.push(S(`After building row ${i}: [${row.join(', ')}].`, { grid: [[...row]], r: 0, c: row.length - 1 }));
  }
  steps.push(S(`Row ${idx} = [${row.join(', ')}].`, { grid: [[...row]], r: 0, c: -1, finished: true, ans: row.join(' ') }));
  return { type: T, input: {}, steps };
}
