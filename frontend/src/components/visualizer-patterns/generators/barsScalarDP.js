/**
 * Generators for the `barsScalarDP` pattern: a bar chart of source values plus
 * tracked scalar(s) and/or a 1D DP row that fills in.
 *
 * Step state shape consumed by BarsScalarView:
 *   { activeIdx, rangeStart, scalars:[{label,value}], dpRow:[v|null], dpActive,
 *     finished, ans }
 * input: { arr (bars; may be []), arrLabel, dpLabel, unit }
 */
import { chooseNums, chooseInt } from './_util';

const T = 'barsScalarDP';
const S = (desc, state) => ({ line: 1, desc, state });

export function bestTimeToBuyAndSellStockII(input) {
  const arr = chooseNums(input, [7, 1, 5, 3, 6, 4]);
  let profit = 0;
  const sc = () => [{ label: 'Profit', value: profit }];
  const steps = [S('Capture every upward move: add the gain whenever today > yesterday.', { activeIdx: 0, scalars: sc() })];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[i - 1]) { profit += arr[i] - arr[i - 1]; steps.push(S(`Day ${i}: ${arr[i]} > ${arr[i - 1]} → add ${arr[i] - arr[i - 1]} (profit ${profit}).`, { activeIdx: i, rangeStart: i - 1, scalars: sc() })); }
    else steps.push(S(`Day ${i}: ${arr[i]} ≤ ${arr[i - 1]} → no gain.`, { activeIdx: i, scalars: sc() }));
  }
  steps.push(S(`Total profit = ${profit}.`, { activeIdx: -1, scalars: sc(), finished: true, ans: String(profit) }));
  return { type: T, input: { arr, arrLabel: 'prices', unit: '$' }, steps };
}

export function maximumProductSubarray(input) {
  const arr = chooseNums(input, [2, 3, -2, 4]);
  let maxP = arr[0], minP = arr[0], best = arr[0];
  const sc = () => [{ label: 'max', value: maxP }, { label: 'min', value: minP }, { label: 'best', value: best }];
  const steps = [S('Track the largest and smallest running products (a negative number can flip them).', { activeIdx: 0, scalars: sc() })];
  for (let i = 1; i < arr.length; i++) {
    const v = arr[i];
    const cand = [v, maxP * v, minP * v];
    maxP = Math.max(...cand); minP = Math.min(...cand); best = Math.max(best, maxP);
    steps.push(S(`Index ${i} (${v}): max=${maxP}, min=${minP}, best=${best}.`, { activeIdx: i, scalars: sc() }));
  }
  steps.push(S(`Maximum product subarray = ${best}.`, { activeIdx: -1, scalars: sc(), finished: true, ans: String(best) }));
  return { type: T, input: { arr, arrLabel: 'nums' }, steps };
}

export function houseRobber(input) {
  const arr = chooseNums(input, [2, 7, 9, 3, 1]);
  const n = arr.length;
  const dp = new Array(n).fill(null);
  const steps = [S('dp[i] = most money robbing houses up to i, never robbing two adjacent houses.', { activeIdx: -1, dpRow: [...dp], scalars: [] })];
  for (let i = 0; i < n; i++) {
    const skip = i > 0 ? dp[i - 1] : 0;
    const rob = arr[i] + (i > 1 ? dp[i - 2] : 0);
    dp[i] = Math.max(skip, rob);
    steps.push(S(`House ${i}: max(skip ${skip}, rob ${rob}) = ${dp[i]}.`, { activeIdx: i, dpRow: [...dp], dpActive: i, scalars: [{ label: 'best', value: dp[i] }] }));
  }
  steps.push(S(`Maximum money = ${dp[n - 1]}.`, { activeIdx: -1, dpRow: [...dp], scalars: [{ label: 'best', value: dp[n - 1] }], finished: true, ans: String(dp[n - 1]) }));
  return { type: T, input: { arr, arrLabel: 'houses', unit: '$' }, steps };
}

export function houseRobberII(input) {
  const arr = chooseNums(input, [2, 3, 2]);
  const n = arr.length;
  const steps = [S('Houses form a circle, so house 0 and house n-1 can never both be robbed. Try two ranges.', { activeIdx: -1, scalars: [] })];
  if (n === 1) {
    steps.push(S(`Only one house → rob it for ${arr[0]}.`, { activeIdx: 0, scalars: [{ label: 'best', value: arr[0] }], finished: true, ans: String(arr[0]) }));
    return { type: T, input: { arr, arrLabel: 'houses', unit: '$' }, steps };
  }
  const robLinear = (lo, hi, tag) => {
    let prev = 0, cur = 0;
    for (let i = lo; i <= hi; i++) {
      const t = Math.max(cur, prev + arr[i]); prev = cur; cur = t;
      steps.push(S(`${tag}: consider house ${i} → running best ${cur}.`, { activeIdx: i, rangeStart: lo, scalars: [{ label: tag, value: cur }] }));
    }
    return cur;
  };
  const a = robLinear(0, n - 2, 'exclude last');
  const b = robLinear(1, n - 1, 'exclude first');
  const best = Math.max(a, b);
  steps.push(S(`Best of the two ranges = max(${a}, ${b}) = ${best}.`, { activeIdx: -1, scalars: [{ label: 'best', value: best }], finished: true, ans: String(best) }));
  return { type: T, input: { arr, arrLabel: 'houses', unit: '$' }, steps };
}

export function minCostClimbingStairs(input) {
  const arr = chooseNums(input, [10, 15, 20]);
  const n = arr.length;
  const dp = new Array(n + 1).fill(null); dp[0] = 0; dp[1] = 0;
  const steps = [S('dp[i] = min cost to reach step i. You may start at step 0 or 1 for free.', { activeIdx: -1, dpRow: [...dp], scalars: [] })];
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.min(dp[i - 1] + arr[i - 1], dp[i - 2] + arr[i - 2]);
    steps.push(S(`Reach ${i}: min(${dp[i - 1]}+${arr[i - 1]}, ${dp[i - 2]}+${arr[i - 2]}) = ${dp[i]}.`, { activeIdx: Math.min(i - 1, n - 1), dpRow: [...dp], dpActive: i, scalars: [{ label: 'cost', value: dp[i] }] }));
  }
  steps.push(S(`Minimum cost to reach the top = ${dp[n]}.`, { activeIdx: -1, dpRow: [...dp], scalars: [{ label: 'cost', value: dp[n] }], finished: true, ans: String(dp[n]) }));
  return { type: T, input: { arr, arrLabel: 'cost' }, steps };
}

export function climbingStairs(input) {
  let n = chooseInt(input, 5); if (!(n >= 1 && n <= 12)) n = 5;
  const dp = new Array(n + 1).fill(null); dp[0] = 1; if (n >= 1) dp[1] = 1;
  const steps = [S(`Ways to reach step i = ways(i-1) + ways(i-2). Climbing ${n} stairs.`, { activeIdx: -1, dpRow: [...dp], scalars: [] })];
  for (let i = 2; i <= n; i++) { dp[i] = dp[i - 1] + dp[i - 2]; steps.push(S(`Step ${i}: ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]} ways.`, { dpRow: [...dp], dpActive: i, scalars: [{ label: 'ways', value: dp[i] }] })); }
  steps.push(S(`Total distinct ways = ${dp[n]}.`, { dpRow: [...dp], scalars: [{ label: 'ways', value: dp[n] }], finished: true, ans: String(dp[n]) }));
  return { type: T, input: { arr: [], dpLabel: 'ways[i]' }, steps };
}

export function fibonacciNumber(input) {
  let n = chooseInt(input, 7); if (!(n >= 0 && n <= 15)) n = 7;
  const dp = new Array(Math.max(2, n + 1)).fill(null); dp[0] = 0; dp[1] = 1;
  const view = () => dp.slice(0, n + 1);
  const steps = [S(`F(i) = F(i-1) + F(i-2). Computing F(${n}).`, { dpRow: view(), scalars: [] })];
  for (let i = 2; i <= n; i++) { dp[i] = dp[i - 1] + dp[i - 2]; steps.push(S(`F(${i}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`, { dpRow: view(), dpActive: i, scalars: [{ label: `F(${i})`, value: dp[i] }] })); }
  steps.push(S(`F(${n}) = ${dp[n]}.`, { dpRow: view(), scalars: [{ label: `F(${n})`, value: dp[n] }], finished: true, ans: String(dp[n]) }));
  return { type: T, input: { arr: [], dpLabel: 'F(i)' }, steps };
}

export function countingBits(input) {
  let n = chooseInt(input, 5); if (!(n >= 1 && n <= 12)) n = 5;
  const dp = new Array(n + 1).fill(null); dp[0] = 0;
  const steps = [S('dp[i] = dp[i >> 1] + (i & 1): the bits of i equal the bits of i/2 plus its last bit.', { dpRow: [...dp], scalars: [] })];
  for (let i = 1; i <= n; i++) { dp[i] = dp[i >> 1] + (i & 1); steps.push(S(`${i} (binary ${i.toString(2)}): dp[${i >> 1}] + ${i & 1} = ${dp[i]}.`, { dpRow: [...dp], dpActive: i, scalars: [{ label: 'bits', value: dp[i] }] })); }
  steps.push(S(`Bit counts: [${dp.join(', ')}].`, { dpRow: [...dp], scalars: [], finished: true, ans: dp.join(' ') }));
  return { type: T, input: { arr: [], dpLabel: 'bits[i]' }, steps };
}
