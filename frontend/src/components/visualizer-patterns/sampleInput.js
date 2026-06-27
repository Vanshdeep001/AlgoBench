/**
 * Parse a problem's first visible test case into a loose, structured "bag" that
 * pattern generators can pull from. Generators always fall back to their own
 * curated sample if the parsed data is missing or unsuitable, so a clean visual
 * is guaranteed even when parsing fails.
 *
 * Generalizes the inline parser that used to live in InteractiveVisualizer.
 */
export function deriveInput(problem) {
  const raw = (problem?.visibleTestCases?.[0]?.input || '').trim();
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);

  const numsArrays = [];
  for (const l of lines) {
    const toks = l.split(/\s+/);
    if (toks.length && toks.every((t) => /^-?\d+$/.test(t))) {
      numsArrays.push(toks.map(Number));
    }
  }

  // Prefer a multi-element numeric line as "the array"; otherwise first numeric line.
  const nums = numsArrays.find((a) => a.length > 1) || numsArrays[0] || null;
  const ints = numsArrays.flat();
  const firstInt = ints.length ? ints[0] : null;

  const strings = lines.filter((l) => !/^-?\d+(\s+-?\d+)*$/.test(l));
  const str = strings[0] || null;

  return { raw, lines, numsArrays, nums, ints, firstInt, strings, str };
}
