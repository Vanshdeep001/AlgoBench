/**
 * Generators for the `conversionTable` pattern: convert between a string and a
 * number using a symbol↔value mapping table, accumulating a running total/string.
 *
 * Step state shape consumed by ConversionTableView:
 *   { activeIdx, total, built, activeSym, finished, ans }
 * input: { tokens:[char], value, table:[{sym,val}], tableLabel, inputLabel }
 */
import { chooseInt } from './_util';

const T = 'conversionTable';
const S = (desc, state) => ({ line: 1, desc, state });

const ROMAN = [
  { sym: 'I', val: 1 }, { sym: 'V', val: 5 }, { sym: 'X', val: 10 }, { sym: 'L', val: 50 },
  { sym: 'C', val: 100 }, { sym: 'D', val: 500 }, { sym: 'M', val: 1000 },
];

export function romanToInteger(input) {
  let s = (input && input.str) || 'MCMXCIV';
  if (!/^[IVXLCDM]+$/.test(s) || s.length > 12) s = 'MCMXCIV';
  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const toks = s.split('');
  let total = 0;
  const steps = [S(`Convert roman numeral "${s}". Add each symbol, but subtract when a smaller one precedes a larger one.`, { activeIdx: -1, total: 0, built: '' })];
  for (let i = 0; i < toks.length; i++) {
    const cur = val[toks[i]], nxt = i + 1 < toks.length ? val[toks[i + 1]] : 0;
    if (cur < nxt) { total -= cur; steps.push(S(`'${toks[i]}'(${cur}) < next '${toks[i + 1]}'(${nxt}) → subtract ${cur}. Total ${total}.`, { activeIdx: i, total, activeSym: toks[i] })); }
    else { total += cur; steps.push(S(`'${toks[i]}'(${cur}) → add ${cur}. Total ${total}.`, { activeIdx: i, total, activeSym: toks[i] })); }
  }
  steps.push(S(`"${s}" = ${total}.`, { activeIdx: -1, total, finished: true, ans: String(total) }));
  return { type: T, input: { tokens: toks, table: ROMAN, tableLabel: 'Roman values', inputLabel: 's' }, steps };
}

export function integerToRoman(input) {
  let num = chooseInt(input, 58); if (!(num >= 1 && num <= 3999)) num = 58;
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let rem = num, built = '';
  const steps = [S(`Convert ${num} to roman by greedily subtracting the largest values.`, { activeIdx: -1, total: num, built: '' })];
  for (let k = 0; k < map.length; k++) {
    const [v, sym] = map[k];
    while (rem >= v) { rem -= v; built += sym; steps.push(S(`Subtract ${v} → append "${sym}". Remaining ${rem}, built "${built}".`, { activeIdx: k, total: rem, built, activeSym: sym })); }
  }
  steps.push(S(`${num} = "${built}".`, { activeIdx: -1, total: 0, built, finished: true, ans: built }));
  return { type: T, input: { tokens: [], value: num, table: map.map(([v, sym]) => ({ sym, val: v })), tableLabel: 'Value → symbol', inputLabel: 'num' }, steps };
}

export function excelSheetColumnNumber(input) {
  let s = (input && input.str) || 'AB';
  if (!/^[A-Z]+$/.test(s) || s.length > 6) s = 'AB';
  const toks = s.split('');
  let total = 0;
  const sample = [{ sym: 'A', val: 1 }, { sym: 'B', val: 2 }, { sym: 'C', val: 3 }, { sym: '…', val: '…' }, { sym: 'Z', val: 26 }];
  const steps = [S(`Treat "${s}" as base-26 (A=1 … Z=26): total = total*26 + value.`, { activeIdx: -1, total: 0, built: '' })];
  for (let i = 0; i < toks.length; i++) {
    const v = toks[i].charCodeAt(0) - 64;
    total = total * 26 + v;
    steps.push(S(`'${toks[i]}' = ${v}: total = total*26 + ${v} = ${total}.`, { activeIdx: i, total, activeSym: toks[i] }));
  }
  steps.push(S(`"${s}" = ${total}.`, { activeIdx: -1, total, finished: true, ans: String(total) }));
  return { type: T, input: { tokens: toks, table: sample, tableLabel: 'A=1 … Z=26', inputLabel: 'columnTitle' }, steps };
}

export function excelSheetColumnTitle(input) {
  let n = chooseInt(input, 28); if (!(n >= 1 && n <= 1000)) n = 28;
  let rem = n, built = '';
  const sample = [{ sym: 'A', val: 1 }, { sym: 'B', val: 2 }, { sym: 'Z', val: 26 }, { sym: 'AA', val: 27 }, { sym: 'AB', val: 28 }];
  const steps = [S(`Convert ${n} to an Excel column title (base-26 with no zero). Repeatedly take (n-1) mod 26.`, { activeIdx: -1, total: n, built: '' })];
  while (rem > 0) {
    const r = (rem - 1) % 26;
    const ch = String.fromCharCode(65 + r);
    built = ch + built;
    rem = Math.floor((rem - 1) / 26);
    steps.push(S(`Letter '${ch}' prepended; n becomes ${rem}, built "${built}".`, { activeIdx: -1, total: rem, built, activeSym: ch }));
  }
  steps.push(S(`${n} = "${built}".`, { activeIdx: -1, total: 0, built, finished: true, ans: built }));
  return { type: T, input: { tokens: [], value: n, table: sample, tableLabel: 'Examples', inputLabel: 'columnNumber' }, steps };
}
