/**
 * Generators for the `digitsMath` pattern: a single number/string transformed
 * step by step, with a running display, tracked panels, and optional chip cells.
 *
 * Step state shape consumed by DigitsMathView:
 *   { display, panels:[{label,value}], cells:[{label,status}], finished, ans }
 *   status ∈ {active, good, bad, crossed}
 */
import { chooseInt } from './_util';

const T = 'digitsMath';
const S = (desc, state) => ({ line: 1, desc, state });

export function reverseInteger(input) {
  let x = chooseInt(input, 123); if (!(Math.abs(x) <= 100000)) x = 123;
  const sign = x < 0 ? -1 : 1;
  let n = Math.abs(x), rev = 0;
  const steps = [S(`Reverse the digits of ${x}. Pop the last digit and append it to the result.`, { display: x, panels: [{ label: 'rev', value: 0 }] })];
  while (n > 0) {
    const d = n % 10; rev = rev * 10 + d; n = Math.floor(n / 10);
    steps.push(S(`Take digit ${d}: rev = rev*10 + ${d} = ${rev}. Remaining ${n}.`, { display: n, panels: [{ label: 'rev', value: sign * rev }] }));
  }
  const ans = sign * rev;
  const overflow = ans > 2147483647 || ans < -2147483648;
  steps.push(S(overflow ? 'Result overflows the 32-bit range → return 0.' : `Reversed integer = ${ans}.`, { display: overflow ? 0 : ans, panels: [{ label: 'rev', value: overflow ? 0 : ans }], finished: true, ans: String(overflow ? 0 : ans) }));
  return { type: T, input: {}, steps };
}

export function plusOne(input) {
  let digits = (input && input.nums) || [1, 2, 9];
  if (!Array.isArray(digits) || !digits.every((d) => d >= 0 && d <= 9) || digits.length > 9) digits = [1, 2, 9];
  digits = [...digits];
  const steps = [S('Add one to the number represented by the digit array, carrying from the right.', { display: digits.join(''), cells: digits.map((d) => ({ label: String(d) })), panels: [{ label: 'carry', value: 1 }] })];
  let carry = 1;
  for (let i = digits.length - 1; i >= 0 && carry; i--) {
    const sum = digits[i] + carry; const w = sum % 10; carry = Math.floor(sum / 10); digits[i] = w;
    steps.push(S(`Digit ${i}: ${sum} → write ${w}, carry ${carry}.`, { display: digits.join(''), cells: digits.map((d, j) => ({ label: String(d), status: j === i ? 'active' : undefined })), panels: [{ label: 'carry', value: carry }] }));
  }
  if (carry) digits.unshift(1);
  steps.push(S(`Result: ${digits.join('')}.`, { display: digits.join(''), cells: digits.map((d) => ({ label: String(d) })), panels: [], finished: true, ans: digits.join(' ') }));
  return { type: T, input: {}, steps };
}

export function addBinary(input) {
  const strs = (input && input.strings) || [];
  let a = strs[0] || '11', b = strs[1] || '1';
  if (!/^[01]+$/.test(a) || a.length > 12) a = '11';
  if (!/^[01]+$/.test(b) || b.length > 12) b = '1';
  let i = a.length - 1, j = b.length - 1, carry = 0, res = '';
  const steps = [S(`Add binary "${a}" + "${b}" bit by bit from the right.`, { display: `${a} + ${b}`, cells: [], panels: [{ label: 'carry', value: 0 }] })];
  while (i >= 0 || j >= 0 || carry) {
    const x = i >= 0 ? +a[i] : 0, y = j >= 0 ? +b[j] : 0;
    const sum = x + y + carry; res = (sum % 2) + res; carry = sum >> 1;
    steps.push(S(`${x} + ${y} + carry = ${sum} → bit ${sum % 2}, carry ${carry}.`, { display: res, cells: res.split('').map((c) => ({ label: c })), panels: [{ label: 'carry', value: carry }] }));
    i--; j--;
  }
  steps.push(S(`Sum = "${res}".`, { display: res, cells: res.split('').map((c) => ({ label: c })), panels: [], finished: true, ans: res }));
  return { type: T, input: {}, steps };
}

export function addDigits(input) {
  let n = chooseInt(input, 38); if (!(n >= 0 && n <= 100000)) n = 38;
  const seq = [n];
  const steps = [S(`Repeatedly sum the digits of ${n} until a single digit remains.`, { display: n, cells: seq.map((v) => ({ label: String(v) })) })];
  let cur = n;
  while (cur >= 10) {
    let s = 0, t = cur; while (t > 0) { s += t % 10; t = Math.floor(t / 10); }
    seq.push(s);
    steps.push(S(`Sum the digits of ${cur} → ${s}.`, { display: s, cells: seq.map((v, k) => ({ label: String(v), status: k === seq.length - 1 ? 'active' : undefined })) }));
    cur = s;
  }
  steps.push(S(`Single digit reached: ${cur}.`, { display: cur, cells: seq.map((v, k) => ({ label: String(v), status: k === seq.length - 1 ? 'good' : undefined })), finished: true, ans: String(cur) }));
  return { type: T, input: {}, steps };
}

export function happyNumber(input) {
  let n = chooseInt(input, 19); if (!(n >= 1 && n <= 1000)) n = 19;
  const seen = new Set(); const seq = [n];
  const steps = [S(`Replace ${n} with the sum of the squares of its digits; a happy number reaches 1.`, { display: n, cells: seq.map((v) => ({ label: String(v) })) })];
  let cur = n;
  while (cur !== 1 && !seen.has(cur)) {
    seen.add(cur);
    let s = 0, t = cur; while (t > 0) { const d = t % 10; s += d * d; t = Math.floor(t / 10); }
    seq.push(s);
    steps.push(S(`Sum of squares of the digits of ${cur} → ${s}.`, { display: s, cells: seq.map((v, k) => ({ label: String(v), status: k === seq.length - 1 ? 'active' : undefined })) }));
    cur = s;
  }
  const happy = cur === 1;
  steps.push(S(happy ? 'Reached 1 → happy number (true).' : 'Entered a cycle → not happy (false).', { display: cur, cells: seq.map((v) => ({ label: String(v), status: v === 1 ? 'good' : undefined })), finished: true, ans: happy ? 'true' : 'false' }));
  return { type: T, input: {}, steps };
}

function divideOut(input, base, def) {
  let n = chooseInt(input, def); if (!(n >= -1000 && n <= 100000)) n = def;
  const steps = [S(`Is ${n} a power of ${base}? Keep dividing by ${base} while it divides evenly.`, { display: n, panels: [] })];
  if (n <= 0) { steps.push(S(`${n} ≤ 0 → not a power of ${base} (false).`, { display: n, finished: true, ans: 'false' })); return { type: T, input: {}, steps }; }
  let cur = n;
  while (cur % base === 0) { cur /= base; steps.push(S(`Divide by ${base} → ${cur}.`, { display: cur, panels: [] })); }
  const ok = cur === 1;
  steps.push(S(ok ? `Reached 1 → power of ${base} (true).` : `Stuck at ${cur} → false.`, { display: cur, finished: true, ans: ok ? 'true' : 'false' }));
  return { type: T, input: {}, steps };
}

export function powerOfTwo(input) { return divideOut(input, 2, 16); }
export function powerOfThree(input) { return divideOut(input, 3, 27); }

export function uglyNumber(input) {
  let n = chooseInt(input, 6); if (!(n >= -100 && n <= 100000)) n = 6;
  const steps = [S(`An ugly number's only prime factors are 2, 3, 5. Divide them out of ${n}.`, { display: n, panels: [] })];
  if (n <= 0) { steps.push(S(`${n} ≤ 0 → not ugly (false).`, { display: n, finished: true, ans: 'false' })); return { type: T, input: {}, steps }; }
  let cur = n;
  for (const f of [2, 3, 5]) while (cur % f === 0) { cur /= f; steps.push(S(`Divide by ${f} → ${cur}.`, { display: cur, panels: [{ label: 'factor', value: f }] })); }
  const ok = cur === 1;
  steps.push(S(ok ? 'Reduced to 1 → ugly number (true).' : `Leftover factor ${cur} → not ugly (false).`, { display: cur, finished: true, ans: ok ? 'true' : 'false' }));
  return { type: T, input: {}, steps };
}

export function factorialTrailingZeroes(input) {
  let n = chooseInt(input, 25); if (!(n >= 0 && n <= 100000)) n = 25;
  let count = 0;
  const steps = [S(`Trailing zeroes of ${n}! equal the number of factors of 5: ⌊n/5⌋ + ⌊n/25⌋ + …`, { display: n, panels: [{ label: 'zeroes', value: 0 }] })];
  let p = 5;
  while (Math.floor(n / p) > 0) { const add = Math.floor(n / p); count += add; steps.push(S(`⌊${n}/${p}⌋ = ${add} → total ${count}.`, { display: p, panels: [{ label: 'zeroes', value: count }] })); p *= 5; }
  steps.push(S(`${n}! has ${count} trailing zero(s).`, { display: n, panels: [{ label: 'zeroes', value: count }], finished: true, ans: String(count) }));
  return { type: T, input: {}, steps };
}

export function numberOf1Bits(input) {
  let n = chooseInt(input, 11); if (!(n >= 0 && n <= 255)) n = 11;
  const bits = n.toString(2).split('');
  let count = 0;
  const cells = (upto, activeIdx) => bits.map((x, j) => ({ label: x, status: j === activeIdx ? (x === '1' ? 'good' : 'active') : (j < upto && x === '1' ? 'good' : undefined) }));
  const steps = [S(`Count the set bits of ${n} (binary ${n.toString(2)}).`, { display: n.toString(2), cells: bits.map((b) => ({ label: b })), panels: [{ label: 'ones', value: 0 }] })];
  bits.forEach((b, i) => { if (b === '1') count++; steps.push(S(`Bit ${i} = ${b}${b === '1' ? ' → +1' : ''}. ones = ${count}.`, { display: n.toString(2), cells: cells(i, i), panels: [{ label: 'ones', value: count }] })); });
  steps.push(S(`${n} has ${count} set bit(s).`, { display: n.toString(2), cells: bits.map((b) => ({ label: b, status: b === '1' ? 'good' : undefined })), panels: [{ label: 'ones', value: count }], finished: true, ans: String(count) }));
  return { type: T, input: {}, steps };
}

export function hammingDistance(input) {
  let x = 4, y = 1;
  const ints = (input && input.ints) || [];
  if (ints.length >= 2 && ints[0] >= 0 && ints[1] >= 0 && ints[0] <= 255 && ints[1] <= 255) { x = ints[0]; y = ints[1]; }
  const len = Math.max(x.toString(2).length, y.toString(2).length);
  const bx = x.toString(2).padStart(len, '0').split('');
  const by = y.toString(2).padStart(len, '0').split('');
  const label = `${bx.join('')} ⊕ ${by.join('')}`;
  let count = 0;
  const cells = (activeIdx) => bx.map((bb, j) => ({ label: `${bb}/${by[j]}`, status: j === activeIdx ? (bx[j] !== by[j] ? 'bad' : 'active') : (j < activeIdx && bx[j] !== by[j] ? 'bad' : undefined) }));
  const steps = [S(`Hamming distance = number of differing bits between ${x} (${bx.join('')}) and ${y} (${by.join('')}).`, { display: label, cells: bx.map((b, i) => ({ label: `${b}/${by[i]}` })), panels: [{ label: 'diff', value: 0 }] })];
  bx.forEach((b, i) => { const diff = b !== by[i]; if (diff) count++; steps.push(S(`Bit ${i}: ${b} vs ${by[i]} → ${diff ? 'differ (+1)' : 'same'}. diff = ${count}.`, { display: label, cells: cells(i), panels: [{ label: 'diff', value: count }] })); });
  steps.push(S(`Hamming distance = ${count}.`, { display: label, cells: bx.map((b, i) => ({ label: `${b}/${by[i]}`, status: b !== by[i] ? 'bad' : undefined })), panels: [{ label: 'diff', value: count }], finished: true, ans: String(count) }));
  return { type: T, input: {}, steps };
}

export function fizzBuzz(input) {
  let n = chooseInt(input, 5); if (!(n >= 1 && n <= 15)) n = 5;
  const out = [];
  const tag = (c) => (c === 'Fizz' || c === 'Buzz' || c === 'FizzBuzz');
  const steps = [S(`Print 1..${n}: multiples of 3 → Fizz, of 5 → Buzz, of both → FizzBuzz.`, { display: `1..${n}`, cells: [] })];
  for (let i = 1; i <= n; i++) {
    const v = i % 15 === 0 ? 'FizzBuzz' : i % 3 === 0 ? 'Fizz' : i % 5 === 0 ? 'Buzz' : String(i);
    out.push(v);
    steps.push(S(`${i} → ${v}.`, { display: String(i), cells: out.map((c, j) => ({ label: c, status: j === out.length - 1 ? 'active' : (tag(c) ? 'good' : undefined) })) }));
  }
  steps.push(S('Sequence complete.', { display: `1..${n}`, cells: out.map((c) => ({ label: c, status: tag(c) ? 'good' : undefined })), finished: true, ans: out.join(' ') }));
  return { type: T, input: {}, steps };
}

export function countPrimes(input) {
  let n = chooseInt(input, 10); if (!(n >= 2 && n <= 30)) n = 10;
  const sieve = new Array(n).fill(true); sieve[0] = false; if (n > 1) sieve[1] = false;
  const cell = () => { const c = []; for (let k = 2; k < n; k++) c.push({ label: String(k), status: sieve[k] ? 'good' : 'crossed' }); return c; };
  const steps = [S(`Count primes below ${n} with the Sieve of Eratosthenes — cross out each prime's multiples.`, { display: n, cells: cell(), panels: [] })];
  for (let p = 2; p * p < n; p++) if (sieve[p]) { for (let m = p * p; m < n; m += p) sieve[m] = false; steps.push(S(`Cross out multiples of ${p}.`, { display: p, cells: cell(), panels: [] })); }
  let count = 0; for (let k = 2; k < n; k++) if (sieve[k]) count++;
  steps.push(S(`Primes below ${n}: ${count}.`, { display: n, cells: cell(), panels: [{ label: 'primes', value: count }], finished: true, ans: String(count) }));
  return { type: T, input: {}, steps };
}

export function lengthOfLastWord(input) {
  let s = (input && input.str) || 'Hello World'; if (s.length > 20) s = 'Hello World';
  const words = s.trim().split(/\s+/).filter(Boolean);
  const last = words[words.length - 1] || '';
  const chars = s.split('');
  const startIdx = s.replace(/\s+$/, '').length - last.length;
  const steps = [S(`Find the last word of "${s}" and measure its length.`, { display: s, cells: chars.map((c) => ({ label: c === ' ' ? '␣' : c })) })];
  steps.push(S(`Last word is "${last}" (length ${last.length}).`, { display: last, cells: chars.map((c, i) => ({ label: c === ' ' ? '␣' : c, status: i >= startIdx && i < startIdx + last.length ? 'good' : undefined })), finished: true, ans: String(last.length) }));
  return { type: T, input: {}, steps };
}
