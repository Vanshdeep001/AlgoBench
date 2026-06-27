/**
 * Helpers for picking sample data from the parsed input bag, with safe fallbacks
 * to a curated default so visuals are always clean and the computed answer is
 * always correct.
 */
export const chooseNums = (input, def, max = 9) => {
  const a = input && input.nums;
  if (Array.isArray(a) && a.length >= 2 && a.length <= max + 3) return a.slice(0, max);
  return def;
};

export const chooseInt = (input, def) => {
  const v = input && input.firstInt;
  return typeof v === 'number' && Number.isFinite(v) ? v : def;
};

export const chooseStr = (input, def, max = 14) => {
  const s = input && input.str;
  return s && s.length <= max ? s : def;
};

export const chooseStrings = (input, defA, defB, max = 14) => {
  const s = (input && input.strings) || [];
  const a = s[0] && s[0].length <= max ? s[0] : defA;
  const b = s[1] && s[1].length <= max ? s[1] : defB;
  return [a, b];
};

export const chooseArrays = (input, defA, defB, max = 8) => {
  const arrs = ((input && input.numsArrays) || []).filter((a) => a.length > 1);
  if (arrs.length >= 2) return [arrs[0].slice(0, max), arrs[1].slice(0, max)];
  return [defA, defB];
};

// Standard step pusher. `line` is best-effort (1) since pattern mode animates the
// canonical algorithm rather than tracing the user's exact source lines.
export const mkStep = (desc, state) => ({ line: 1, desc, state });
