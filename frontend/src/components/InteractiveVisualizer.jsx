import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Cpu, Layers, CheckCircle2 } from 'lucide-react';
import { detectErrors } from '../utils/errorDetector';
import axiosClient from '../utils/axiosClient';
import { canRunInBrowser, runJavaScriptLocally } from '../utils/browserExecutor';
import { deriveInput } from './visualizer-patterns/sampleInput';
import { buildPatternSimulation } from './visualizer-patterns/generators';
import { PatternView } from './visualizer-patterns/renderers';

const isBoilerplateCode = (codeText) => {
  if (!codeText) return true;
  const hasLoops = codeText.match(/(for|while|if|Map|map|set|stack|st\.)/i);
  const lines = codeText.split('\n').filter(l => {
    const t = l.trim();
    return t && !t.startsWith('//') && !t.startsWith('#') && !t.startsWith('using') && !t.startsWith('import') && !t.startsWith('package');
  });
  return !hasLoops || lines.length <= 4;
};

const detectLogicErrors = (title, codeText) => {
  if (!codeText) return null;
  const cleanTitle = title.toLowerCase().trim();

  if (cleanTitle === 'two sum') {
    const cppInsertIdx = codeText.indexOf('] = i');
    const cppFindIdx = codeText.indexOf('find(');
    if (cppInsertIdx !== -1 && cppFindIdx !== -1 && cppInsertIdx < cppFindIdx) {
      return {
        type: 'LogicError',
        line: codeText.substring(0, cppInsertIdx).split('\n').length,
        message: 'Value inserted into map before complement lookup',
        explanation: 'You are storing the current element in the map before looking up target - nums[i]. This will cause the algorithm to incorrectly match an element with itself if target = 2 * nums[i] (e.g., matching 3 with itself to make 6).',
        fix: 'Perform the map lookup (find/count/has) FIRST, and only insert the current element into the map if no match is found.'
      };
    }
  }

  if (cleanTitle === 'palindrome number' || cleanTitle === 'palindrome-number') {
    if (!codeText.match(/(x\s*<\s*0|x\s*<=\s*0|x\s*<|orig\s*<\s*0)/)) {
      return {
        type: 'LogicError',
        line: 1,
        message: 'Negative numbers not handled',
        explanation: 'Negative numbers (like -121) have a minus sign at the front, so they read as "121-" from right to left, meaning they are never palindromes. Your code is missing a check for x < 0.',
        fix: 'Add a check at the beginning of your function: if (x < 0) return false;'
      };
    }
    if (codeText.includes('while') && !codeText.match(/(x\s*\/=\s*10|x\s*=\s*x\s*\/\s*10)/)) {
      return {
        type: 'LogicError',
        line: codeText.substring(0, codeText.indexOf('while')).split('\n').length + 1,
        message: 'Infinite loop or missing division step',
        explanation: 'Inside the digit reversal loop, you must divide the number by 10 (x /= 10) in order to inspect the next digit and terminate the loop.',
        fix: "Add 'x /= 10;' inside your while loop."
      };
    }
  }

  if (cleanTitle === 'merge two sorted lists' || cleanTitle === 'merge-two-sorted-lists') {
    if (!codeText.match(/(curr\s*=\s*curr\s*->\s*next|curr\s*=\s*curr\.next|curr\s*=\s*curr->next)/)) {
      return {
        type: 'LogicError',
        line: 1,
        message: 'Merged list pointer not advanced',
        explanation: 'You are appending nodes to the merged list, but you forget to move the cursor pointer forward. This will cause all elements to overwrite the same node or create an infinite loop.',
        fix: "Add 'curr = curr->next;' (or 'curr = curr.next;') after appending a node to the merged list."
      };
    }
  }

  if (cleanTitle === 'product of array except self') {
    if (codeText.match(/(pre\s*=\s*0|prefix\s*=\s*0)/)) {
      const idx = codeText.indexOf('pre = 0');
      return {
        type: 'LogicError',
        line: idx !== -1 ? codeText.substring(0, idx).split('\n').length : 1,
        message: 'Incorrect initial product accumulator',
        explanation: 'Accumulators for multiplication must be initialized to 1. Initializing to 0 will make all subsequent products 0.',
        fix: 'Initialize pre / prefix to 1.'
      };
    }
  }

  return null;
};

const outputsMatch = (actual, expected, title = '') => {
  if (!actual || !expected) return false;
  const a = actual.trim();
  const e = expected.trim();
  if (a === e) return true;

  const cleanTitle = title.toLowerCase().trim();

  if (cleanTitle === 'two sum') {
    const aNums = a.split(/\s+/).map(Number).sort((x,y) => x - y);
    const eNums = e.split(/\s+/).map(Number).sort((x,y) => x - y);
    if (aNums.length === eNums.length && aNums.every((val, idx) => val === eNums[idx] && !isNaN(val))) {
      return true;
    }

    try {
      const aArr = JSON.parse(a);
      const eArr = JSON.parse(e);
      if (Array.isArray(aArr) && Array.isArray(eArr)) {
        const aSorted = [...aArr].sort((x,y) => x - y);
        const eSorted = [...eArr].sort((x,y) => x - y);
        return aSorted.length === eSorted.length && aSorted.every((val, idx) => val === eSorted[idx]);
      }
    } catch (_) {}
  }

  return false;
};

// Per-type accent: a single status dot with a soft static glow. Everything else
// stays monochrome so the card reads calm and premium (no multi-color noise,
// no animation). Class strings are written in full for Tailwind's scanner.
const ERROR_TONES = {
  red: { dot: 'bg-rose-500', label: 'text-rose-300', halo: 'bg-rose-500/5', caret: 'text-rose-400' },
  amber: { dot: 'bg-amber-400', label: 'text-amber-300', halo: 'bg-amber-500/5', caret: 'text-amber-300' },
};

function ErrorCard({ tone = 'red', label, subtitle, message, explanation, codeLine, codeLineNo, caretCol, caretHint, extra, fix, onTrace }) {
  const t = ERROR_TONES[tone] || ERROR_TONES.red;
  const caretIndent = codeLine != null ? (caretCol != null ? caretCol : codeLine.replace(/\s+$/, '').length) : 0;
  return (
    <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[300px]" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="group relative w-full max-w-[400px] overflow-hidden rounded-sm border border-white/[0.06] hover:border-white/15 bg-gradient-to-b from-[#0F1217] to-[#07080b] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] px-8 py-8 transition-all duration-500">
        {/* soft accent halo */}
        <div className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full blur-[60px] ${t.halo}`} />

        {/* top header row */}
        <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.04] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${t.dot}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300" style={{ fontFamily: 'var(--font-display)' }}>{label}</span>
          </div>
          {subtitle && (
            <span className="text-[9.5px] uppercase tracking-[0.1em] font-mono text-zinc-500">
              {subtitle}
            </span>
          )}
        </div>

        {/* message */}
        <h3 className="relative text-[16px] leading-[1.35] text-zinc-50 font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          {message}
        </h3>

        {explanation && <p className="relative mt-2.5 text-[12px] leading-relaxed text-zinc-400">{explanation}</p>}

        {/* code frame */}
        {codeLine != null && (
          <div className="relative mt-4 p-3 bg-black/25 border border-white/[0.04] text-[12px] leading-relaxed overflow-x-auto rounded-sm" style={{ fontFamily: 'var(--font-mono)' }}>
            <div className="flex">
              <span className="select-none w-6 shrink-0 text-left text-zinc-600 tabular-nums">{codeLineNo}</span>
              <span className="select-none px-2 text-zinc-700">│</span>
              <span className="text-zinc-200 whitespace-pre">{codeLine}</span>
            </div>
            {(caretCol != null || caretHint) && (
              <div className="flex">
                <span className="w-6 shrink-0" />
                <span className="select-none px-2 text-transparent">│</span>
                <span className="whitespace-pre">
                  {' '.repeat(caretIndent)}
                  <span className={`${t.caret} font-bold animate-pulse`}>^</span>
                  {caretHint && <span className={`ml-2 ${t.caret} text-[10px] uppercase tracking-wider font-semibold opacity-90`}>{caretHint}</span>}
                </span>
              </div>
            )}
          </div>
        )}

        {extra && <div className="relative mt-4">{extra}</div>}

        {/* suggested fix */}
        {fix && (
          <div className="relative mt-5 pt-4 border-t border-white/[0.04]">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#D4AF37]" style={{ fontFamily: 'var(--font-display)' }}>
              Suggested fix
            </div>
            <div className="mt-1.5 text-[12px] text-zinc-300 leading-relaxed font-mono">{fix}</div>
          </div>
        )}

        {/* action button */}
        {onTrace && (
          <button
            onClick={onTrace}
            className="group relative mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37] hover:text-[#FFE082] uppercase tracking-[0.12em] transition-colors duration-150 cursor-pointer"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span>Trace reference solution</span>
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

const InteractiveVisualizer = ({ problem, code, language, onStepChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [simMode, setSimMode] = useState('user');
  const [hasRunAttempted, setHasRunAttempted] = useState(false);
  const playTimeoutRef = useRef(null);

  useEffect(() => {
    setHasRunAttempted(false);
  }, [code]);

  const starterCode = useMemo(() => {
    if (!problem || !problem.startCode) return '';
    const langKey = language === 'JavaScript' ? 'JavaScript' : language === 'Java' ? 'Java' : 'C++';
    const sc = problem.startCode.find(s => s.language === langKey);
    return sc ? sc.initialCode : '';
  }, [problem, language]);

  const isBoilerplate = useMemo(() => {
    if (isBoilerplateCode(code)) return true;
    if (!starterCode) return false;
    
    const clean = (str) => {
      return str
        .replace(/\/\/.*$/gm, '') // remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
        .replace(/\s+/g, '') // remove all whitespaces/newlines
        .trim();
    };
    
    return clean(code) === clean(starterCode);
  }, [code, starterCode]);

  const syntaxErrors = useMemo(() => {
    if (simMode !== 'user') return [];
    return detectErrors(code, language.toLowerCase());
  }, [code, language, simMode]);

  const hasSyntaxError = syntaxErrors.length > 0;

  const logicError = useMemo(() => {
    if (simMode !== 'user' || hasSyntaxError) return null;
    return detectLogicErrors(problem.title, code);
  }, [code, problem, simMode, hasSyntaxError]);

  const [validation, setValidation] = useState({ isValid: true, actual: null, expected: null, error: null, checked: false, loading: false });

  useEffect(() => {
    if (simMode !== 'user' || isBoilerplate || hasSyntaxError) {
      setValidation({ isValid: true, actual: null, expected: null, error: null, checked: false, loading: false });
      return;
    }

    setValidation(prev => ({ ...prev, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const cases = problem.visibleTestCases || [];
        if (!cases.length) { setValidation({ isValid: true, checked: true, loading: false }); return; }

        // Run the user's code against EVERY visible test case. JavaScript runs in
        // the browser; C++/Java go through the backend run endpoint. Either way we
        // flag the first failing case so any incorrect logic surfaces a fix-it message.
        let results = [];
        let runError = null;
        if (canRunInBrowser(language)) {
          const local = await runJavaScriptLocally(code, cases);
          results = local.testCases || [];
          runError = local.error || null;
        } else {
          const response = await axiosClient.post(`/submission/run/${problem._id}`, { code, language });
          results = response.data.testCases || [];
          runError = response.data.error || null;
        }

        // No per-case results but an error → likely a compile/runtime failure.
        if (!results.length) {
          if (runError) {
            setValidation({ isValid: false, actual: 'N/A', expected: 'N/A', error: runError, checked: true, loading: false });
          } else {
            setValidation({ isValid: true, checked: true, loading: false });
          }
          return;
        }

        let firstFail = null;
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const expected = cases[i]?.output ?? '';
          const passedFlag = r.passed === true || r.status_id === 3;
          const ok = passedFlag || outputsMatch(r.stdout, expected, problem.title);
          if (!ok) {
            firstFail = { actual: r.stdout?.trim() || 'N/A', expected: String(expected).trim(), caseNum: i + 1, total: results.length };
            break;
          }
        }

        if (firstFail) {
          setValidation({ isValid: false, ...firstFail, error: runError, checked: true, loading: false });
        } else {
          setValidation({ isValid: true, actual: null, expected: null, error: null, checked: true, loading: false });
        }
      } catch (err) {
        console.error('Validation failed:', err);
        setValidation({ isValid: true, checked: true, loading: false }); // Graceful fallback
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [code, language, simMode, problem, hasSyntaxError]);

  const hasValidationError = !validation.isValid && validation.checked;

  // The static logic-error heuristic assumes a specific algorithm, so it could
  // misfire on an unconventional-but-correct approach. Only surface it once the
  // code has actually FAILED a test case — never on a solution that passes.
  const hasLogicError = !!logicError && hasValidationError;

  useEffect(() => {
    if (hasSyntaxError || hasLogicError || hasValidationError) {
      setIsPlaying(false);
    }
  }, [hasSyntaxError, hasLogicError, hasValidationError]);

  const getReferenceSolutionCode = () => {
    if (!problem) return '';
    const sol = problem.referenceSolution?.find(s => s.language === (language === 'JavaScript' ? 'JavaScript' : language === 'Java' ? 'Java' : 'C++'));
    return sol?.completeCode || '';
  };

  // Generate Simulation steps based on problem type and user's actual code lines
  const simulation = useMemo(() => {
    if (!problem || !code) return null;
    const activeCode = simMode === 'reference' ? getReferenceSolutionCode() : code;
    const title = problem.title.toLowerCase().trim();
    const lines = activeCode.split('\n');

    // Identify important executable lines in the user's actual code
    const executableLines = [];
    lines.forEach((lineText, idx) => {
      const trimmed = lineText.trim();
      if (
        trimmed && 
        !trimmed.startsWith('//') && 
        !trimmed.startsWith('/*') && 
        !trimmed.startsWith('*') && 
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('using') &&
        !trimmed.startsWith('import') &&
        !trimmed.startsWith('package') &&
        trimmed !== '{' && 
        trimmed !== '}'
      ) {
        executableLines.push({ lineNum: idx + 1, text: trimmed });
      }
    });

    const steps = [];

    if (title === 'two sum') {
      const nums = [2, 7, 11, 15];
      const target = 9;

      const mapInitLine = executableLines.find(l => l.text.match(/(map|new Map|Map|hash|unordered_map|HashMap|dict|\{\})/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(for|while)/i))?.lineNum || 3;
      const compLine = executableLines.find(l => l.text.match(/(complement|target\s*-\s*|diff)/i))?.lineNum || 4;
      const checkLine = executableLines.find(l => l.text.match(/(has|find|count|contains|get|in|\[)/i))?.lineNum || 5;
      const returnLine = executableLines.find(l => l.text.match(/(return|\[|\]|\{)/i))?.lineNum || 6;
      const setLine = executableLines.find(l => l.text.match(/(set|put|insert|push|\[.*\]\s*=)/i))?.lineNum || 8;

      steps.push({ line: mapInitLine, desc: 'Initialize hash map structure to store encountered values and their indices.', state: { map: {}, i: -1, complement: null, activeIdx: -1 } });
      
      // Step i = 0 (value 2)
      steps.push({ line: loopLine, desc: 'Loop start: Inspecting element at index i = 0 (value 2).', state: { map: {}, i: 0, complement: null, activeIdx: 0 } });
      steps.push({ line: compLine, desc: 'Calculate complement value: target (9) - current (2) = 7.', state: { map: {}, i: 0, complement: 7, activeIdx: 0 } });
      steps.push({ line: checkLine, desc: 'Check map memory: does key 7 exist? No.', state: { map: {}, i: 0, complement: 7, activeIdx: 0 } });
      steps.push({ line: setLine, desc: 'Store current value 2 with its index 0 in the map memory.', state: { map: { '2': 0 }, i: 0, complement: 7, activeIdx: -1 } });
      
      // Step i = 1 (value 7)
      steps.push({ line: loopLine, desc: 'Loop continue: Inspecting element at index i = 1 (value 7).', state: { map: { '2': 0 }, i: 1, complement: null, activeIdx: 1 } });
      steps.push({ line: compLine, desc: 'Calculate complement value: target (9) - current (7) = 2.', state: { map: { '2': 0 }, i: 1, complement: 2, activeIdx: 1 } });
      steps.push({ line: checkLine, desc: 'Check map memory: does key 2 exist? YES! Found key 2 at index 0.', state: { map: { '2': 0 }, i: 1, complement: 2, activeIdx: 1, matchIdx: 0 } });
      steps.push({ line: returnLine, desc: 'Return the indices of the complement pair: [0, 1].', state: { map: { '2': 0 }, i: 1, complement: 2, activeIdx: 1, matchIdx: 0, finished: true, ans: '[0, 1]' } });

      return { type: 'two-sum', input: { nums, target }, steps };
    } 
    
    if (title === 'maximum subarray') {
      const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
      
      const initLine = executableLines.find(l => l.text.match(/(curr|max_so_far|max_ending|max_current|maxSum|ans)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(for|while)/i))?.lineNum || 3;
      const calcLine = executableLines.find(l => l.text.match(/(curr|max_ending|max_current|max|Math\.max|\+)/i))?.lineNum || 4;
      const updateLine = executableLines.find(l => l.text.match(/(global|max_so_far|ans|Math\.max)/i))?.lineNum || 5;
      const returnLine = executableLines.find(l => l.text.match(/return/i))?.lineNum || 6;
      
      steps.push({ line: initLine, desc: 'Initialize subarray max trackers with the first element: -2.', state: { i: 0, curr: -2, global: -2, startIdx: 0, activeIdx: 0 } });
      
      let curr = -2;
      let global = -2;
      let startIdx = 0;
      
      for (let i = 1; i < nums.length; i++) {
        steps.push({ line: loopLine, desc: `Move pointer to index ${i} (value ${nums[i]}).`, state: { i, curr, global, startIdx, activeIdx: i } });
        
        const newCurr = Math.max(nums[i], curr + nums[i]);
        if (newCurr === nums[i]) {
          startIdx = i;
        }
        curr = newCurr;
        steps.push({ line: calcLine, desc: `Decide whether to add ${nums[i]} to current sum or start a new subarray. New current sum = ${curr}.`, state: { i, curr, global, startIdx, activeIdx: i } });
        
        const newGlobal = Math.max(global, curr);
        const updated = newGlobal > global;
        global = newGlobal;
        steps.push({ line: updateLine, desc: updated ? `Subarray sum ${global} is greater than previous global max. Update global max!` : `Global max remains unchanged: ${global}.`, state: { i, curr, global, startIdx, activeIdx: -1 } });
      }
      steps.push({ line: returnLine, desc: `Traversal finished. Return the global maximum subarray sum: ${global}.`, state: { i: nums.length - 1, curr, global, startIdx, finished: true, ans: global } });

      return { type: 'max-subarray', input: { nums }, steps };
    }
    
    if (title === 'palindrome number' || title === 'palindrome-number') {
      const sVal = '12321';
      const origVal = 12321;
      
      // Parse multiplier and divisor from code text dynamically
      const mulMatch = code.match(/(?:rev|reverse)\s*\*\s*(\d+)/i) || code.match(/(?:rev|reverse)\s*=\s*(?:rev|reverse)\s*\*\s*(\d+)/i);
      const mul = mulMatch ? parseInt(mulMatch[1], 10) : 10;
      
      const divMatch = code.match(/x\s*\/=\s*(\d+)/i) || code.match(/x\s*=\s*x\s*\/\s*(\d+)/i) || code.match(/temp\s*\/=\s*(\d+)/i);
      const div = divMatch ? parseInt(divMatch[1], 10) : 10;
      
      const initLine = executableLines.find(l => l.text.match(/(orig|rev|temp|left|right|x\s*=)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(while|for)/i))?.lineNum || 3;
      const calcLine = executableLines.find(l => l.text.match(/(rev\s*\*|x\s*%\s*10)/i))?.lineNum || 4;
      const divLine = executableLines.find(l => l.text.match(/(x\s*\/=|x\s*=\s*x\s*\/)/i))?.lineNum || 5;
      const checkLine = executableLines.find(l => l.text.match(/(orig|==)/i))?.lineNum || 6;
      
      steps.push({ line: initLine, desc: `Initialize original tracker = 12321 and reverse value = 0.`, state: { orig: origVal, temp: origVal, rev: 0, leftIdx: 0, rightIdx: 4 } });
      
      let temp = origVal;
      let rev = 0;
      let leftIdx = 0;
      let rightIdx = 4;
      
      while (temp > 0 && steps.length < 15) {
        const digit = temp % 10;
        const prevRev = rev;
        rev = rev * mul + digit;
        const prevTemp = temp;
        temp = Math.floor(temp / div);
        
        steps.push({ 
          line: loopLine, 
          desc: `Compare digits: index ${leftIdx} (${sVal[leftIdx]}) and index ${rightIdx} (${sVal[rightIdx]}).`, 
          state: { orig: origVal, temp: prevTemp, rev: prevRev, leftIdx, rightIdx, compare: true } 
        });
        
        steps.push({ 
          line: calcLine, 
          desc: `Reversed accumulator update: rev = ${prevRev} * ${mul} + ${digit} = ${rev}.`, 
          state: { orig: origVal, temp: prevTemp, rev, leftIdx, rightIdx, match: (sVal[leftIdx] === sVal[rightIdx]) } 
        });
        
        leftIdx++;
        rightIdx--;
        
        steps.push({ 
          line: divLine, 
          desc: `Divide variable by ${div} (becomes ${temp}). Shift left = ${leftIdx}, right = ${rightIdx}.`, 
          state: { orig: origVal, temp, rev, leftIdx, rightIdx } 
        });
      }
      
      const isCorrect = (origVal === rev);
      steps.push({ 
        line: checkLine, 
        desc: isCorrect 
          ? `All digits matched. original (${origVal}) == reverse (${rev}) -> return true.` 
          : `Logic failure: original (${origVal}) != reversed (${rev}) -> return false.`, 
        state: { orig: origVal, temp, rev, leftIdx, rightIdx, finished: true, ans: isCorrect ? 'true' : 'false', hasMismatch: !isCorrect } 
      });

      return { type: 'palindrome', input: { x: sVal }, steps };
    }

    if (title === 'merge two sorted lists' || title === 'merge-two-sorted-lists') {
      const list1 = [1, 2, 4];
      const list2 = [1, 3, 4];
      
      const initLine = executableLines.find(l => l.text.match(/(merged|dummy|head|curr)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(while|list1|list2)/i))?.lineNum || 3;
      const compLine = executableLines.find(l => l.text.match(/(<|<=|val)/i))?.lineNum || 4;
      const appendLine = executableLines.find(l => l.text.match(/(next|curr)/i))?.lineNum || 5;
      const returnLine = executableLines.find(l => l.text.match(/(return|dummy)/i))?.lineNum || 10;
      
      steps.push({ line: initLine, desc: 'Initialize dummy merged list head and pointers for List 1 and List 2.', state: { p1: 0, p2: 0, merged: [] } });
      
      // Step 1
      steps.push({ line: loopLine, desc: 'Loop: compare active list nodes. List1[0] = 1, List2[0] = 1.', state: { p1: 0, p2: 0, merged: [] } });
      steps.push({ line: compLine, desc: 'Compare node values: 1 <= 1. Select List 1 node.', state: { p1: 0, p2: 0, merged: [], activeNode: 'list1' } });
      steps.push({ line: appendLine, desc: 'Append value 1 from List 1. Move List 1 pointer forward.', state: { p1: 1, p2: 0, merged: [1] } });
      
      // Step 2
      steps.push({ line: loopLine, desc: 'Loop: compare nodes. List1[1] = 2, List2[0] = 1.', state: { p1: 1, p2: 0, merged: [1] } });
      steps.push({ line: compLine, desc: 'Compare node values: 2 > 1. Select List 2 node.', state: { p1: 1, p2: 0, merged: [1], activeNode: 'list2' } });
      steps.push({ line: appendLine, desc: 'Append value 1 from List 2. Move List 2 pointer forward.', state: { p1: 1, p2: 1, merged: [1, 1] } });
      
      // Step 3
      steps.push({ line: loopLine, desc: 'Loop: compare nodes. List1[1] = 2, List2[1] = 3.', state: { p1: 1, p2: 1, merged: [1, 1] } });
      steps.push({ line: compLine, desc: 'Compare node values: 2 <= 3. Select List 1 node.', state: { p1: 1, p2: 1, merged: [1, 1], activeNode: 'list1' } });
      steps.push({ line: appendLine, desc: 'Append value 2 from List 1. Move List 1 pointer forward.', state: { p1: 2, p2: 1, merged: [1, 1, 2] } });
      
      // Step 4
      steps.push({ line: loopLine, desc: 'Loop: compare nodes. List1[2] = 4, List2[1] = 3.', state: { p1: 2, p2: 1, merged: [1, 1, 2] } });
      steps.push({ line: compLine, desc: 'Compare node values: 4 > 3. Select List 2 node.', state: { p1: 2, p2: 1, merged: [1, 1, 2], activeNode: 'list2' } });
      steps.push({ line: appendLine, desc: 'Append value 3 from List 2. Move List 2 pointer forward.', state: { p1: 2, p2: 2, merged: [1, 1, 2, 3] } });
      
      // Step 5
      steps.push({ line: loopLine, desc: 'Loop: compare nodes. List1[2] = 4, List2[2] = 4.', state: { p1: 2, p2: 2, merged: [1, 1, 2, 3] } });
      steps.push({ line: compLine, desc: 'Compare node values: 4 <= 4. Select List 1 node.', state: { p1: 2, p2: 2, merged: [1, 1, 2, 3], activeNode: 'list1' } });
      steps.push({ line: appendLine, desc: 'Append value 4 from List 1. List 1 is now fully traversed.', state: { p1: 3, p2: 2, merged: [1, 1, 2, 3, 4] } });
      
      // Step 6
      steps.push({ line: loopLine, desc: 'List 1 is empty. Append all remaining elements from List 2.', state: { p1: 3, p2: 2, merged: [1, 1, 2, 3, 4] } });
      steps.push({ line: appendLine, desc: 'Append value 4 from List 2. Both lists complete.', state: { p1: 3, p2: 3, merged: [1, 1, 2, 3, 4, 4] } });
      steps.push({ line: returnLine, desc: 'Done merging sorted lists. Return merged list head: 1 -> 1 -> 2 -> 3 -> 4 -> 4.', state: { p1: 3, p2: 3, merged: [1, 1, 2, 3, 4, 4], finished: true, ans: '1 1 2 3 4 4 -1' } });

      return { type: 'merge-lists', input: { list1, list2 }, steps };
    }

    if (title === 'product of array except self') {
      const nums = [1, 2, 3, 4];
      
      const initLine = executableLines.find(l => l.text.match(/(vector|res|ans|output|n\s*=)/i))?.lineNum || 2;
      const prefixLine = executableLines.find(l => l.text.match(/(pre|prefix|res\[i\]\s*=)/i))?.lineNum || 4;
      const suffixLine = executableLines.find(l => l.text.match(/(suf|suffix|res\[i\]\s*\*)/i))?.lineNum || 6;
      const returnLine = executableLines.find(l => l.text.match(/return/i))?.lineNum || 8;
      
      steps.push({ line: initLine, desc: 'Initialize result array with 1s: [1, 1, 1, 1].', state: { i: -1, nums, prefix: [1, 1, 1, 1], suffix: [1, 1, 1, 1], result: [1, 1, 1, 1], phase: 'init' } });
      
      // Prefix loop
      steps.push({ line: prefixLine, desc: 'Loop 1: prefix calculation for index 0. prefixValue = 1.', state: { i: 0, nums, prefix: [1, 1, 1, 1], suffix: [1, 1, 1, 1], result: [1, 1, 1, 1], phase: 'prefix' } });
      steps.push({ line: prefixLine, desc: 'prefix for index 1. prefixValue = 1 * nums[0] (1) = 1.', state: { i: 1, nums, prefix: [1, 1, 1, 1], suffix: [1, 1, 1, 1], result: [1, 1, 1, 1], phase: 'prefix' } });
      steps.push({ line: prefixLine, desc: 'prefix for index 2. prefixValue = 1 * nums[1] (2) = 2.', state: { i: 2, nums, prefix: [1, 1, 2, 1], suffix: [1, 1, 1, 1], result: [1, 1, 2, 1], phase: 'prefix' } });
      steps.push({ line: prefixLine, desc: 'prefix for index 3. prefixValue = 2 * nums[2] (3) = 6.', state: { i: 3, nums, prefix: [1, 1, 2, 6], suffix: [1, 1, 1, 1], result: [1, 1, 2, 6], phase: 'prefix' } });
      
      // Suffix loop
      steps.push({ line: suffixLine, desc: 'Loop 2: suffix calculation for index 3. suffixValue = 1. result[3] = 6 * 1 = 6.', state: { i: 3, nums, prefix: [1, 1, 2, 6], suffix: [1, 1, 1, 1], result: [1, 1, 2, 6], phase: 'suffix' } });
      steps.push({ line: suffixLine, desc: 'suffix for index 2. suffixValue = 1 * nums[3] (4) = 4. result[2] = 2 * 4 = 8.', state: { i: 2, nums, prefix: [1, 1, 2, 6], suffix: [1, 1, 4, 1], result: [1, 1, 8, 6], phase: 'suffix' } });
      steps.push({ line: suffixLine, desc: 'suffix for index 1. suffixValue = 4 * nums[2] (3) = 12. result[1] = 1 * 12 = 12.', state: { i: 1, nums, prefix: [1, 1, 2, 6], suffix: [1, 12, 4, 1], result: [1, 12, 8, 6], phase: 'suffix' } });
      steps.push({ line: suffixLine, desc: 'suffix for index 0. suffixValue = 12 * nums[1] (2) = 24. result[0] = 1 * 24 = 24.', state: { i: 0, nums, prefix: [1, 1, 2, 6], suffix: [24, 12, 4, 1], result: [24, 12, 8, 6], phase: 'suffix' } });
      
      steps.push({ line: returnLine, desc: 'Done calculating array products. Return final result: [24, 12, 8, 6].', state: { i: -1, nums, prefix: [1, 1, 2, 6], suffix: [24, 12, 4, 1], result: [24, 12, 8, 6], finished: true, ans: '24 12 8 6' } });

      return { type: 'product-except-self', input: { nums }, steps };
    }

    if (title === 'valid parentheses') {
      const s = '()[]{}';
      
      const stackInitLine = executableLines.find(l => l.text.match(/(stack|st|vector|list|deque|new)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(for|while|length|size)/i))?.lineNum || 3;
      const pushLine = executableLines.find(l => l.text.match(/(push|insert|add|\(|\[|\{)/i))?.lineNum || 4;
      const checkLine = executableLines.find(l => l.text.match(/(pop|top|empty|peek|match|\)|\]|\})/i))?.lineNum || 5;
      const popLine = executableLines.find(l => l.text.match(/(pop|top|erase)/i))?.lineNum || 6;
      const returnLine = executableLines.find(l => l.text.match(/return/i))?.lineNum || 9;
      
      steps.push({ line: stackInitLine, desc: 'Initialize an empty stack to track opening parentheses brackets.', state: { i: -1, stack: [], activeChar: '' } });
      
      let stack = [];
      for (let i = 0; i < s.length; i++) {
        const char = s[i];
        steps.push({ line: loopLine, desc: `Process index ${i}: inspect character '${char}'.`, state: { i, stack: [...stack], activeChar: char } });
        
        if (char === '(' || char === '[' || char === '{') {
          stack.push(char);
          steps.push({ line: pushLine, desc: `Opening bracket '${char}'. Push it onto the stack memory.`, state: { i, stack: [...stack], activeChar: char } });
        } else {
          const top = stack[stack.length - 1];
          steps.push({ line: checkLine, desc: `Closing bracket '${char}'. Check if it matches the top of the stack: '${top}'.`, state: { i, stack: [...stack], activeChar: char } });
          stack.pop();
          steps.push({ line: popLine, desc: `Match confirmed. Pop the corresponding opening bracket '${top}' from the stack.`, state: { i, stack: [...stack], activeChar: char } });
        }
      }
      steps.push({ line: returnLine, desc: 'Loop finished. Check if stack is empty. Yes, all matching pairs closed -> return true.', state: { i: s.length - 1, stack: [...stack], activeChar: '', finished: true, ans: 'true' } });

      return { type: 'valid-parentheses', input: { s }, steps };
    }

    if (title === 'best time to buy and sell stock') {
      const prices = [7, 1, 5, 3, 6, 4];
      
      const initLine = executableLines.find(l => l.text.match(/(min|profit|buy|sell|ans)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(for|while|length|size)/i))?.lineNum || 3;
      const minLine = executableLines.find(l => l.text.match(/(min|prices|i|Math\.min)/i))?.lineNum || 4;
      const profitLine = executableLines.find(l => l.text.match(/(profit|max|ans|Math\.max)/i))?.lineNum || 5;
      const returnLine = executableLines.find(l => l.text.match(/return/i))?.lineNum || 6;
      
      steps.push({ line: initLine, desc: 'Initialize min_price to first day price ($7) and max_profit to $0.', state: { i: 0, min: 7, profit: 0, buyIdx: 0, activeIdx: 0 } });
      
      let min = 7;
      let profit = 0;
      let buyIdx = 0;
      let sellIdx = -1;
      
      for (let i = 1; i < prices.length; i++) {
        steps.push({ line: loopLine, desc: `Day ${i}: Inspect current stock price of $${prices[i]}.`, state: { i, min, profit, buyIdx, sellIdx, activeIdx: i } });
        
        const prevMin = min;
        min = Math.min(min, prices[i]);
        const updatedMin = min < prevMin;
        if (updatedMin) {
          buyIdx = i;
        }
        steps.push({ line: minLine, desc: updatedMin ? `Found new lower price of $${min}. Update buy candidate day.` : `Current price $${prices[i]} is higher than lowest seen price $${min}. Keep lowest buy day.`, state: { i, min, profit, buyIdx, sellIdx, activeIdx: i } });
        
        const currentProfit = prices[i] - min;
        const prevProfit = profit;
        profit = Math.max(profit, currentProfit);
        const updatedProfit = profit > prevProfit;
        if (updatedProfit) {
          sellIdx = i;
        }
        steps.push({ line: profitLine, desc: updatedProfit ? `Selling on Day ${i} yields a new maximum profit margin: $${profit}.` : `Selling on Day ${i} yields a profit of $${currentProfit}, which is not higher than $${profit}.`, state: { i, min, profit, buyIdx, sellIdx, activeIdx: i } });
      }
      steps.push({ line: returnLine, desc: `End of tracking period. Return the maximum profit achieved: $${profit}.`, state: { i: prices.length - 1, min, profit, buyIdx, sellIdx, finished: true, ans: profit } });

      return { type: 'sell-stock', input: { prices }, steps };
    }

    if (title === 'contains duplicate') {
      const nums = [1, 2, 3, 1];
      
      const setInitLine = executableLines.find(l => l.text.match(/(set|seen|unordered_set|HashSet|new)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(for|while|length|size)/i))?.lineNum || 3;
      const checkLine = executableLines.find(l => l.text.match(/(has|find|count|contains|get|in)/i))?.lineNum || 4;
      const returnLine1 = executableLines.find(l => l.text.match(/(return\s+true)/i))?.lineNum || 5;
      const addLine = executableLines.find(l => l.text.match(/(add|insert|push)/i))?.lineNum || 7;
      const returnLine2 = executableLines.find(l => l.text.match(/(return\s+false)/i))?.lineNum || 9;
      
      steps.push({ line: setInitLine, desc: 'Initialize an empty Hash Set to keep track of unique values encountered.', state: { i: -1, set: [], activeIdx: -1 } });
      
      let set = [];
      for (let i = 0; i < nums.length; i++) {
        steps.push({ line: loopLine, desc: `Loop iteration: inspect element at index ${i} (value ${nums[i]}).`, state: { i, set: [...set], activeIdx: i } });
        
        const num = nums[i];
        steps.push({ line: checkLine, desc: `Check if visited Set contains the value ${num}.`, state: { i, set: [...set], activeIdx: i } });
        
        if (set.includes(num)) {
          steps.push({ line: returnLine1, desc: `Duplicate value ${num} is already present in set. Return true!`, state: { i, set: [...set], activeIdx: i, duplicateFound: true } });
          steps.push({ line: returnLine1, desc: `Duplicate found. Stop execution.`, state: { i, set: [...set], activeIdx: i, duplicateFound: true, finished: true, ans: 'true' } });
          return { type: 'contains-duplicate', input: { nums }, steps };
        } else {
          set.push(num);
          steps.push({ line: addLine, desc: `Add value ${num} to the visited Set memory.`, state: { i, set: [...set], activeIdx: -1 } });
        }
      }
      steps.push({ line: returnLine2, desc: 'No duplicates found. Return false.', state: { i: nums.length - 1, set: [...set], finished: true, ans: 'false' } });

      return { type: 'contains-duplicate', input: { nums }, steps };
    }

    if (title === 'container with most water') {
      const height = [1, 8, 6, 2, 5, 4, 8, 3, 7];
      
      const initLine = executableLines.find(l => l.text.match(/(left|right|max|area|ans)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(while|for)/i))?.lineNum || 3;
      const areaLine = executableLines.find(l => l.text.match(/(area|min|Math\.min|std::min|\*)/i))?.lineNum || 4;
      const maxLine = executableLines.find(l => l.text.match(/(max|Math\.max|std::max|ans)/i))?.lineNum || 5;
      const compareLine = executableLines.find(l => l.text.match(/(if|height\[)/i))?.lineNum || 6;
      const moveLeftLine = executableLines.find(l => l.text.match(/(left\+\+|l\+\+|\+)/i))?.lineNum || 7;
      const moveRightLine = executableLines.find(l => l.text.match(/(right--|r--|-)/i))?.lineNum || 9;
      const returnLine = executableLines.find(l => l.text.match(/return/i))?.lineNum || 12;
      
      steps.push({ line: initLine, desc: 'Initialize two pointers: left at 0, right at 8. Set maxArea to 0.', state: { left: 0, right: 8, maxArea: 0, currArea: 0 } });
      
      // Step 1: compare indices 0 and 8
      steps.push({ line: loopLine, desc: 'Loop: compare pointer positions (left < right). left = 0, right = 8.', state: { left: 0, right: 8, maxArea: 0, currArea: 0 } });
      steps.push({ line: areaLine, desc: 'Calculate current water container area: min(1, 7) * (8 - 0) = 8.', state: { left: 0, right: 8, maxArea: 0, currArea: 8, showWater: true } });
      steps.push({ line: maxLine, desc: 'Update maxArea: max(0, 8) = 8.', state: { left: 0, right: 8, maxArea: 8, currArea: 8, showWater: true } });
      steps.push({ line: compareLine, desc: 'Compare heights: height[left] (1) < height[right] (7). Move left pointer.', state: { left: 0, right: 8, maxArea: 8, currArea: 8, showWater: true } });
      steps.push({ line: moveLeftLine, desc: 'Increment left pointer: left = 1.', state: { left: 1, right: 8, maxArea: 8, currArea: 8 } });
      
      // Step 2: compare indices 1 and 8
      steps.push({ line: loopLine, desc: 'Loop: left = 1, right = 8.', state: { left: 1, right: 8, maxArea: 8, currArea: 8 } });
      steps.push({ line: areaLine, desc: 'Calculate current area: min(8, 7) * (8 - 1) = 49.', state: { left: 1, right: 8, maxArea: 8, currArea: 49, showWater: true } });
      steps.push({ line: maxLine, desc: 'Update maxArea: max(8, 49) = 49.', state: { left: 1, right: 8, maxArea: 49, currArea: 49, showWater: true } });
      steps.push({ line: compareLine, desc: 'Compare heights: height[left] (8) >= height[right] (7). Move right pointer.', state: { left: 1, right: 8, maxArea: 49, currArea: 49, showWater: true } });
      steps.push({ line: moveRightLine, desc: 'Decrement right pointer: right = 7.', state: { left: 1, right: 7, maxArea: 49, currArea: 49 } });
      
      // Step 3: compare indices 1 and 7
      steps.push({ line: loopLine, desc: 'Loop: left = 1, right = 7.', state: { left: 1, right: 7, maxArea: 49, currArea: 49 } });
      steps.push({ line: areaLine, desc: 'Calculate current area: min(8, 3) * (7 - 1) = 18.', state: { left: 1, right: 7, maxArea: 49, currArea: 18, showWater: true } });
      steps.push({ line: maxLine, desc: 'maxArea remains 49.', state: { left: 1, right: 7, maxArea: 49, currArea: 18, showWater: true } });
      steps.push({ line: compareLine, desc: 'Compare heights: height[left] (8) >= height[right] (3). Move right pointer.', state: { left: 1, right: 7, maxArea: 49, currArea: 18, showWater: true } });
      steps.push({ line: moveRightLine, desc: 'Decrement right pointer: right = 6.', state: { left: 1, right: 6, maxArea: 49, currArea: 18 } });
      
      // Step 4: compare indices 1 and 6
      steps.push({ line: loopLine, desc: 'Loop: left = 1, right = 6.', state: { left: 1, right: 6, maxArea: 49, currArea: 18 } });
      steps.push({ line: areaLine, desc: 'Calculate current area: min(8, 8) * (6 - 1) = 40.', state: { left: 1, right: 6, maxArea: 49, currArea: 40, showWater: true } });
      steps.push({ line: maxLine, desc: 'maxArea remains 49.', state: { left: 1, right: 6, maxArea: 49, currArea: 40, showWater: true } });
      steps.push({ line: returnLine, desc: 'Pointers search continues... Eventually return maximum area found: 49.', state: { left: 1, right: 6, maxArea: 49, currArea: 40, finished: true, ans: 49 } });

      return { type: 'most-water', input: { height }, steps };
    }
    
    // Pattern-based visualization for the many problems without a bespoke branch
    // above. Animates the canonical algorithm on a sample input.
    const patternSim = buildPatternSimulation(problem.title, deriveInput(problem), activeCode);
    if (patternSim) return patternSim;

    // Fallback parser based on executable lines of user's code
    executableLines.forEach((el) => {
      steps.push({
        line: el.lineNum,
        desc: `Step logic executing: "${el.text}"`,
        state: { stepName: 'Simulating', val: el.text }
      });
    });
    steps.push({
      line: executableLines[executableLines.length - 1]?.lineNum || 1,
      desc: 'Simulation finished.',
      state: { stepName: 'Completed', finished: true, ans: 'Success' }
    });
    
    return {
      type: 'generic',
      input: { text: 'N/A' },
      steps
    };
  }, [problem, code, simMode]);

  const inputData = useMemo(() => {
    if (!problem) return [];
    const testCase = problem.visibleTestCases?.[0]?.input || '';
    if (!testCase.trim()) return [];
    
    const lines = testCase.trim().split('\n');
    let dataLine = lines[0];
    if (lines.length > 1) {
      const line0 = lines[0].trim();
      const line1 = lines[1].trim();
      if (!isNaN(Number(line0)) && line1.split(/\s+/).length > 1) {
        dataLine = line1;
      }
    }
    
    const tokens = dataLine.split(/\s+/).filter(Boolean);
    return tokens.slice(0, 10);
  }, [problem]);

  const activeStepData = useMemo(() => {
    if (!simulation) return null;
    return simulation.steps[currentStep];
  }, [simulation, currentStep]);

  // Notify parent for error-line highlighting only. The step-by-step animation no
  // longer highlights editor lines, since it visualizes the algorithm rather than
  // tracing the user's exact code.
  useEffect(() => {
    if (onStepChange) {
      if (simMode === 'user' && hasSyntaxError && hasRunAttempted) {
        onStepChange(syntaxErrors[0].line);
      } else if (simMode === 'user' && hasLogicError && hasRunAttempted) {
        onStepChange(logicError.line);
      } else {
        onStepChange(0);
      }
    }
  }, [activeStepData, onStepChange, simMode, hasSyntaxError, syntaxErrors, hasLogicError, logicError, hasValidationError, hasRunAttempted]);

  useEffect(() => {
    return () => {
      if (onStepChange) {
        onStepChange(0);
      }
    };
  }, [onStepChange]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying && simulation) {
      const delay = Math.max(200, 2000 - (speed * 18)); // scale speed slider (1-100) to ms delay
      playTimeoutRef.current = setTimeout(() => {
        if (currentStep < simulation.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => clearTimeout(playTimeoutRef.current);
  }, [isPlaying, currentStep, simulation, speed]);

  const handlePlayPause = () => {
    if (simMode === 'user' && (hasSyntaxError || hasLogicError || hasValidationError)) {
      setHasRunAttempted(true);
      setIsPlaying(false);
      return;
    }
    if (currentStep === (simulation?.steps.length || 0) - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    if (simMode === 'user' && (hasSyntaxError || hasLogicError || hasValidationError)) {
      setHasRunAttempted(true);
      setIsPlaying(false);
      return;
    }
    if (simulation && currentStep < simulation.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setHasRunAttempted(false);
  };

  if (!simulation) return null;

  return (
    <div className="flex flex-col h-full bg-[#05070A] min-h-0 relative select-none">
      {/* Visualizer Mode Toggler */}
      <div className="flex justify-center border-b border-white/[0.04] bg-[#070B11]/80 p-2 gap-1 select-none">
        <button 
          onClick={() => {
            setSimMode('user');
            setCurrentStep(0);
          }}
          className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            simMode === 'user'
              ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] font-bold'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          Your Code
        </button>
        <button 
          onClick={() => {
            setSimMode('reference');
            setCurrentStep(0);
          }}
          className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            simMode === 'reference'
              ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] font-bold'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          Optimal Reference
        </button>
      </div>

      {simMode === 'user' && hasSyntaxError && hasRunAttempted ? (
        <ErrorCard
          tone="red"
          label="Syntax error"
          subtitle={`line ${syntaxErrors[0].line} · ${language.toLowerCase()}`}
          message={syntaxErrors[0].message}
          explanation={syntaxErrors[0].explanation}
          codeLine={syntaxErrors[0].code}
          codeLineNo={syntaxErrors[0].line}
          caretCol={syntaxErrors[0].column}
          caretHint={syntaxErrors[0].type === 'MissingSemicolon' ? "expected ';'" : undefined}
          fix={syntaxErrors[0].fix}
          onTrace={() => { setSimMode('reference'); setCurrentStep(0); }}
        />
      ) : simMode === 'user' && hasLogicError && hasRunAttempted ? (
        <ErrorCard
          tone="amber"
          label="Logic bug"
          subtitle={`line ${logicError.line}`}
          message={logicError.message}
          explanation={logicError.explanation}
          fix={logicError.fix}
          onTrace={() => { setSimMode('reference'); setCurrentStep(0); }}
        />
      ) : simMode === 'user' && hasValidationError && hasRunAttempted ? (
        <ErrorCard
          tone="red"
          label="Wrong answer"
          subtitle={validation.caseNum ? `test ${validation.caseNum}/${validation.total}` : 'validation'}
          message="Your solution returns the wrong result."
          extra={(
            <div className="flex flex-col gap-2.5" style={{ fontFamily: 'var(--font-mono)' }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 shrink-0">Expected</span>
                <span className="text-[13px] text-emerald-300/90 truncate">{validation.expected}</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 shrink-0">Received</span>
                <span className="text-[13px] text-rose-300/90 truncate">{validation.actual}</span>
              </div>
              {validation.error && (
                <div className="mt-1 text-[11px] text-zinc-500 max-h-24 overflow-y-auto whitespace-pre-wrap">{validation.error}</div>
              )}
            </div>
          )}
          onTrace={() => { setSimMode('reference'); setCurrentStep(0); }}
        />
      ) : simMode === 'user' && isBoilerplate ? (
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[300px]" style={{ fontFamily: 'var(--font-body)' }}>
          <div className="group relative w-full max-w-[400px] overflow-hidden rounded-sm border border-white/[0.06] hover:border-[#D4AF37]/25 bg-gradient-to-b from-[#0F1217] to-[#07080b] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] hover:shadow-[0_24px_60px_-15px_rgba(212,175,55,0.04)] px-8 py-9 transition-all duration-500 ease-out">
            {/* soft gold halo */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-[#D4AF37]/8 blur-[50px]" />

            {/* Abstract Tracing Illustration */}
            <div className="relative w-full h-24 mb-6 flex items-center justify-center overflow-hidden rounded-sm bg-black/20 border border-white/[0.03]">
              {/* Grid background inside graphic */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px]" />
              
              <svg width="220" height="60" viewBox="0 0 220 60" className="relative z-10 overflow-visible">
                {/* Dotted paths */}
                <path d="M 20,30 L 70,30 L 120,30 L 170,30 L 200,30" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 70,30 L 120,15 L 170,30" fill="none" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Active trace connection path */}
                <path d="M 20,30 C 45,30 45,30 70,30" fill="none" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 70,30 C 95,30 95,15 120,15" fill="none" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
                
                {/* Definitions for gradient */}
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B732A" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                </defs>

                {/* Step 1 Node */}
                <circle cx="20" cy="30" r="3.5" fill="#D4AF37" />
                <circle cx="20" cy="30" r="7" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
                
                {/* Step 2 Node */}
                <circle cx="70" cy="30" r="3.5" fill="#D4AF37" />
                <circle cx="70" cy="30" r="7" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />

                {/* Step 3 Node (Active/Highlighted) */}
                <circle cx="120" cy="15" r="4.5" fill="#FFE55C" className="animate-pulse" />
                <circle cx="120" cy="15" r="9" fill="none" stroke="#FFE55C" strokeWidth="1" opacity="0.5" />

                {/* Step 4 Node (Pending) */}
                <circle cx="170" cy="30" r="3" fill="#0A0F16" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                
                {/* Target Node */}
                <polygon points="197,30 200,26 203,30 200,34" fill="#0A0F16" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
              </svg>
            </div>

            {/* editorial serif headline with an italic flourish */}
            <h3 className="relative mt-2 text-[26px] leading-[1.2] text-[#E8EDF2] font-semibold" style={{ fontFamily: '"Fraunces", serif' }}>
              Write some logic
              <br />
              <span className="text-[#C6A85E] italic font-medium">to trace.</span>
            </h3>

            <p className="relative mt-3.5 text-[12.5px] leading-relaxed text-zinc-400/90 max-w-[310px]">
              Add loops, conditionals, or variables in the editor to step through your own run — or preview the optimal solution.
            </p>

            <button
              onClick={() => { setSimMode('reference'); setCurrentStep(0); }}
              className="group relative mt-7 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37] hover:text-[#FFE082] uppercase tracking-[0.12em] transition-colors duration-150 cursor-pointer"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>Preview optimal solution</span>
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header instructions description */}
          <div className="p-4 border-b border-white/[0.04] bg-[#0A0F16]/50 flex items-start gap-3">
            <Layers className="text-[#D4AF37] mt-0.5 flex-shrink-0" size={14} />
            <div className="min-w-0">
              <h3 className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#D4AF37]" style={{ fontFamily: 'Unbounded' }}>
                Step {currentStep + 1} of {simulation.steps.length}
              </h3>
              <p className="text-[12px] text-zinc-300 mt-1 leading-relaxed">
                {activeStepData?.desc || 'Initializing visualizer...'}
              </p>
            </div>
          </div>

          {/* Graphics canvas space */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative min-h-[300px] interactive-viz-canvas">
            
            {/* 1) Two Sum Visualization */}
            {simulation.type === 'two-sum' && (
              <div className="w-full flex flex-col items-center gap-6">
                {/* Array display */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {simulation.input.nums.map((num, idx) => {
                    const isActive = activeStepData?.state.activeIdx === idx;
                    const isMatched = activeStepData?.state.matchIdx === idx;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className={`w-10 h-10 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 border ${
                            isMatched 
                              ? 'bg-[#4ade80]/10 border-[#4ade80] text-[#4ade80] scale-110 shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                              : isActive 
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] scale-105'
                                : 'bg-[#0A0F16] border-white/[0.05] text-[#E8EDF2]'
                          }`}
                        >
                          {num}
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600">idx {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Target badge */}
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider bg-white/[0.01] border border-white/[0.05] px-3 py-1">
                  <span>Target:</span>
                  <span className="text-[#D4AF37] font-bold">{simulation.input.target}</span>
                </div>

                {/* Map memory visualization */}
                <div className="w-full max-w-xs bg-[#0A0F16]/50 border border-white/[0.04] p-3">
                  <h4 className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-2 border-b border-white/[0.04] pb-1">
                    Hash Map (Value → Index)
                  </h4>
                  {Object.keys(activeStepData?.state.map || {}).length === 0 ? (
                    <p className="text-[10px] font-mono text-zinc-600 italic py-1">Map is empty.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {Object.entries(activeStepData?.state.map || {}).map(([key, val]) => (
                        <div key={key} className="flex flex-col border border-[#D4AF37]/10 bg-[#D4AF37]/2 p-1.5 rounded text-center">
                          <span className="text-[11px] font-bold text-[#E8EDF2] font-mono">{key}</span>
                          <span className="text-[8px] font-mono text-zinc-500">idx {val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2) Maximum Subarray (Kadane) Visualization */}
            {simulation.type === 'max-subarray' && (
              <div className="w-full flex flex-col items-center gap-6">
                {/* Array of bars */}
                <div className="flex items-end justify-center gap-1.5 h-[120px] w-full px-2 border-b border-white/[0.04] pb-1">
                  {simulation.input.nums.map((num, idx) => {
                    const startIdx = activeStepData?.state.startIdx ?? -1;
                    const iIdx = activeStepData?.state.i ?? -1;
                    const isInSubarray = idx >= startIdx && idx <= iIdx && activeStepData?.state.activeIdx !== -1;
                    const isActive = activeStepData?.state.activeIdx === idx;
                    
                    const barHeight = Math.max(20, Math.min(100, Math.abs(num) * 15));
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className={`w-7 flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-300 border ${
                            isActive 
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105'
                              : isInSubarray
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-600'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        >
                          {num}
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600">{idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Values dashboard */}
                <div className="flex items-center gap-4 bg-[#0A0F16] border border-white/[0.04] p-3 px-4 w-full max-w-xs justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Current Sum</span>
                    <span className="text-sm font-bold font-mono text-[#FFE082]">{activeStepData?.state.curr ?? 0}</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Max Sum</span>
                    <span className="text-sm font-bold font-mono text-[#D4AF37]">{activeStepData?.state.global ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3) Valid Parentheses Visualization */}
            {simulation.type === 'valid-parentheses' && (
              <div className="w-full max-w-xs flex flex-col items-center gap-6">
                {/* Input string tokens */}
                <div className="flex items-center gap-1.5">
                  {simulation.input.s.split('').map((char, idx) => {
                    const isActive = activeStepData?.state.i === idx;
                    const isProcessed = activeStepData?.state.i > idx;
                    return (
                      <div 
                        key={idx}
                        className={`w-8 h-8 border flex items-center justify-center font-mono text-sm font-bold transition-all duration-200 ${
                          isActive 
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105'
                            : isProcessed
                              ? 'opacity-30 border-white/[0.04]'
                              : 'bg-[#0A0F16] border-white/[0.04] text-[#E8EDF2]'
                        }`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>

                {/* Stack visual columns */}
                <div className="relative w-36 h-40 border-b-4 border-x-4 border-white/[0.08] bg-[#0A0F16]/10 flex flex-col-reverse items-center justify-start p-1.5 gap-1.5">
                  <div className="absolute top-1 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    LIFO Stack
                  </div>
                  {(activeStepData?.state.stack || []).length === 0 ? (
                    <div className="text-[9px] font-mono text-zinc-600 italic mb-4">Empty</div>
                  ) : (
                    activeStepData.state.stack.map((bracket, sIdx) => (
                      <div 
                        className="w-28 py-1.5 bg-[#D4AF37]/5 border border-[#D4AF37]/30 text-[#D4AF37] text-center font-mono font-bold text-sm transition-all duration-300"
                        key={sIdx}
                      >
                        {bracket}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4) Buy Sell Stock Visualization */}
            {simulation.type === 'sell-stock' && (
              <div className="w-full flex flex-col items-center gap-6">
                {/* Graph bars */}
                <div className="flex items-end justify-center gap-2 h-[120px] w-full px-2 border-b border-white/[0.04] pb-1">
                  {simulation.input.prices.map((price, idx) => {
                    const isBuy = activeStepData?.state.buyIdx === idx;
                    const isSell = activeStepData?.state.sellIdx === idx;
                    const isActive = activeStepData?.state.activeIdx === idx;
                    
                    const barHeight = Math.max(20, Math.min(100, price * 12));
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="h-4 flex items-center justify-center text-[7px] font-mono">
                          {isBuy && <span className="text-blue-300 font-bold">B</span>}
                          {isSell && <span className="text-[#4ade80] font-bold">S</span>}
                        </div>
                        <div 
                          className={`w-8 flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-300 border ${
                            isSell 
                              ? 'bg-[#4ade80]/15 border-[#4ade80] text-[#4ade80]'
                              : isBuy
                                ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                                : isActive
                                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                                  : 'bg-[#0A0F16] border-white/[0.04] text-zinc-600'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        >
                          ${price}
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600">Day {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Dashboard summary */}
                <div className="flex items-center gap-4 bg-[#0A0F16] border border-white/[0.04] p-3 px-4 w-full max-w-xs justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Min Price</span>
                    <span className="text-sm font-bold font-mono text-blue-300">${activeStepData?.state.min ?? 0}</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Max Profit</span>
                    <span className="text-sm font-bold font-mono text-[#4ade80]">${activeStepData?.state.profit ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5) Contains Duplicate Visualization */}
            {simulation.type === 'contains-duplicate' && (
              <div className="w-full flex flex-col items-center gap-6">
                {/* Array */}
                <div className="flex items-center gap-1.5">
                  {simulation.input.nums.map((num, idx) => {
                    const isActive = activeStepData?.state.activeIdx === idx;
                    const isDup = activeStepData?.state.duplicateFound && isActive;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className={`w-10 h-10 flex items-center justify-center font-mono text-sm font-bold transition-all duration-200 border ${
                            isDup 
                              ? 'bg-red-500/10 border-red-500 text-red-500 animate-shake scale-105'
                              : isActive
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105'
                                : 'bg-[#0A0F16] border-white/[0.04] text-[#E8EDF2]'
                          }`}
                        >
                          {num}
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600">idx {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Visited Set container */}
                <div className="w-full max-w-xs bg-[#0A0F16] border border-white/[0.04] p-3">
                  <h4 className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-2 border-b border-white/[0.04] pb-1">
                    Visited Set Memory
                  </h4>
                  {(activeStepData?.state.set || []).length === 0 ? (
                    <p className="text-[10px] font-mono text-zinc-600 italic py-1">Set is empty.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(activeStepData?.state.set || []).map((val) => (
                        <div className="px-2 py-1 bg-[#D4AF37]/5 border border-[#D4AF37]/30 text-[10px] font-bold text-[#E8EDF2] font-mono rounded" key={val}>
                          {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Palindrome Number Visualization */}
            {simulation.type === 'palindrome' && (
              <div className="w-full flex flex-col items-center gap-5">
                {/* Row of digits */}
                <div className="flex items-center justify-center gap-2">
                  {simulation.input.x.split('').map((char, idx) => {
                    const isLeft = activeStepData?.state.leftIdx === idx;
                    const isRight = activeStepData?.state.rightIdx === idx;
                    const isCompare = activeStepData?.state.compare && (isLeft || isRight);
                    const isMatch = activeStepData?.state.match && (isLeft || isRight);
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="h-4 flex items-center justify-center text-[8px] font-mono text-zinc-400">
                          {isLeft && <span className="text-amber-400 font-bold">L</span>}
                          {isRight && <span className="text-amber-400 font-bold">R</span>}
                        </div>
                        <div 
                          className={`w-10 h-10 flex items-center justify-center font-mono text-sm font-bold transition-all duration-200 border ${
                            isMatch
                              ? 'bg-green-500/10 border-green-500 text-green-400 scale-105 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                              : isCompare
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105'
                                : 'bg-[#0A0F16] border-white/[0.04] text-[#E8EDF2]'
                          }`}
                        >
                          {char}
                        </div>
                        <span className="text-[7px] font-mono text-zinc-600">idx {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Dashboard for tracking state variables */}
                <div className="flex items-center gap-4 bg-[#0A0F16] border border-white/[0.04] p-2.5 px-4 w-full max-w-xs justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Original</span>
                    <span className="text-xs font-bold font-mono text-zinc-300">{activeStepData?.state.orig}</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Reversed</span>
                    <span className="text-xs font-bold font-mono text-[#D4AF37]">{activeStepData?.state.rev}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Merge Two Sorted Lists Visualization */}
            {simulation.type === 'merge-lists' && (
              <div className="w-full flex flex-col items-center gap-4">
                {/* List 1 */}
                <div className="flex flex-col w-full max-w-xs">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 mb-1">List 1</span>
                  <div className="flex items-center gap-1">
                    {simulation.input.list1.map((val, idx) => {
                      const isActive = activeStepData?.state.p1 === idx;
                      const isProcessed = activeStepData?.state.p1 > idx;
                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <div className={`px-2.5 py-1 font-mono text-xs border ${
                            isActive
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold scale-105 shadow-[0_0_8px_rgba(212,175,85,0.25)]'
                              : isProcessed
                                ? 'opacity-20 border-white/[0.02]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                          }`}>
                            {val}
                          </div>
                          {idx < simulation.input.list1.length - 1 && <span className="text-zinc-600 text-[10px]">→</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* List 2 */}
                <div className="flex flex-col w-full max-w-xs">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 mb-1">List 2</span>
                  <div className="flex items-center gap-1">
                    {simulation.input.list2.map((val, idx) => {
                      const isActive = activeStepData?.state.p2 === idx;
                      const isProcessed = activeStepData?.state.p2 > idx;
                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <div className={`px-2.5 py-1 font-mono text-xs border ${
                            isActive
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold scale-105 shadow-[0_0_8px_rgba(212,175,85,0.25)]'
                              : isProcessed
                                ? 'opacity-20 border-white/[0.02]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                          }`}>
                            {val}
                          </div>
                          {idx < simulation.input.list2.length - 1 && <span className="text-zinc-600 text-[10px]">→</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Merged Output Link List */}
                <div className="w-full max-w-xs bg-[#04060A] border border-white/[0.04] p-2.5 mt-1">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#D4AF37] mb-1.5 block">
                    Merged List Path
                  </span>
                  {(activeStepData?.state.merged || []).length === 0 ? (
                    <span className="text-[10px] font-mono text-zinc-600 italic">No nodes merged yet.</span>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap text-zinc-300 font-mono text-xs">
                      {activeStepData.state.merged.map((val, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-green-400 font-bold">{val}</span>
                          {idx < activeStepData.state.merged.length - 1 && <span className="text-zinc-600">→</span>}
                        </div>
                      ))}
                      <span className="text-zinc-500 ml-1">→ -1</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product of Array Except Self Visualization */}
            {simulation.type === 'product-except-self' && (
              <div className="w-full flex flex-col items-center gap-3">
                {/* Input list */}
                <div className="flex flex-col w-full max-w-xs">
                  <span className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-500 mb-0.5">Input Array (nums)</span>
                  <div className="flex gap-1">
                    {simulation.input.nums.map((val, idx) => {
                      const isActive = activeStepData?.state.i === idx;
                      return (
                        <div className={`w-8 py-1 text-center font-mono text-xs border ${
                          isActive 
                            ? 'bg-amber-500/25 border-amber-500 text-amber-300 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                            : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                        }`} key={idx}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prefix Array */}
                <div className="flex flex-col w-full max-w-xs">
                  <span className="text-[7.5px] font-mono uppercase tracking-wider text-blue-400 mb-0.5">Prefix Products (from Left)</span>
                  <div className="flex gap-1">
                    {(activeStepData?.state.prefix || []).map((val, idx) => {
                      const isActive = activeStepData?.state.i === idx && activeStepData?.state.phase === 'prefix';
                      return (
                        <div className={`w-8 py-1 text-center font-mono text-xs border ${
                          isActive
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold scale-105 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                            : 'bg-[#0A0F16]/40 border-white/[0.02] text-zinc-500'
                        }`} key={idx}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suffix Array */}
                <div className="flex flex-col w-full max-w-xs">
                  <span className="text-[7.5px] font-mono uppercase tracking-wider text-purple-400 mb-0.5">Suffix Products (from Right)</span>
                  <div className="flex gap-1">
                    {(activeStepData?.state.suffix || []).map((val, idx) => {
                      const isActive = activeStepData?.state.i === idx && activeStepData?.state.phase === 'suffix';
                      return (
                        <div className={`w-8 py-1 text-center font-mono text-xs border ${
                          isActive
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold scale-105 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                            : 'bg-[#0A0F16]/40 border-white/[0.02] text-zinc-500'
                        }`} key={idx}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Product Output Array */}
                <div className="flex flex-col w-full max-w-xs border-t border-white/[0.04] pt-2 mt-1">
                  <span className="text-[7.5px] font-mono uppercase tracking-wider text-[#D4AF37] mb-0.5">Output Array (Result)</span>
                  <div className="flex gap-1">
                    {(activeStepData?.state.result || []).map((val, idx) => {
                      const isCurrentUpdate = activeStepData?.state.i === idx && activeStepData?.state.phase === 'suffix';
                      return (
                        <div className={`w-8 py-1 text-center font-mono text-xs border ${
                          isCurrentUpdate
                            ? 'bg-[#D4AF37]/25 border-[#D4AF37] text-[#D4AF37] font-bold scale-105 shadow-[0_0_8px_rgba(212,175,85,0.3)]'
                            : 'bg-[#0D1520] border-[#D4AF37]/10 text-zinc-300'
                        }`} key={idx}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6) Container With Most Water Simulation */}
            {simulation.type === 'most-water' && (
              <div className="w-full flex flex-col items-center gap-5">
                <div className="relative w-[300px] h-[140px] border-b border-white/[0.04] pb-1 mx-auto">
                  
                  {/* Dynamic Water Shading Overlay */}
                  {activeStepData?.state.showWater && (() => {
                    const left = activeStepData.state.left;
                    const right = activeStepData.state.right;
                    const minVal = Math.min(simulation.input.height[left], simulation.input.height[right]);
                    const waterHeight = Math.max(10, minVal * 12);
                    
                    const startPos = left * 34;
                    const containerWidth = (right - left) * 34 + 28;
                    
                    return (
                      <div 
                        className="absolute bg-blue-500/35 border-t border-blue-400/60 backdrop-blur-[1px] flex items-center justify-center font-mono text-[10px] text-blue-100 font-extrabold z-20 transition-all duration-300 shadow-[inset_0_0_12px_rgba(59,130,246,0.3)]"
                        style={{
                          left: `${startPos}px`,
                          width: `${containerWidth}px`,
                          height: `${waterHeight}px`,
                          bottom: '15px'
                        }}
                      >
                        Area: {activeStepData.state.currArea}
                      </div>
                    );
                  })()}

                  <div className="flex items-end gap-1.5 w-full h-full">
                    {simulation.input.height.map((h, idx) => {
                      const isLeft = activeStepData?.state.left === idx;
                      const isRight = activeStepData?.state.right === idx;
                      const barHeight = h * 12;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 z-10 w-[28px]">
                          <div className="h-4 flex items-center justify-center text-[8px] font-mono text-zinc-400">
                            {isLeft && <span className="text-amber-400 font-bold">L</span>}
                            {isRight && <span className="text-amber-400 font-bold">R</span>}
                          </div>
                          <div 
                            className={`w-7 flex items-center justify-center font-mono text-[9.5px] font-bold transition-all duration-300 border ${
                              isLeft || isRight
                                ? 'bg-amber-500/15 border-amber-500 text-amber-300 scale-105'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-500'
                            }`}
                            style={{ height: `${barHeight}px` }}
                          >
                            {h}
                          </div>
                          <span className="text-[7px] font-mono text-zinc-600">{idx}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#0A0F16] border border-white/[0.04] p-2.5 px-4 w-full max-w-xs justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Current Area</span>
                    <span className="text-sm font-bold font-mono text-blue-300">{activeStepData?.state.currArea ?? 0}</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Max Area Found</span>
                    <span className="text-sm font-bold font-mono text-[#D4AF37]">{activeStepData?.state.maxArea ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pattern-based visualizations (one renderer per pattern, shared across many problems) */}
            <PatternView simulation={simulation} step={activeStepData} currentStep={currentStep} />

            {/* 7) Generic Fallback Visualization */}
            {simulation.type === 'generic' && (
              <div className="w-full flex flex-col items-center gap-4">
                
                {/* Visual Data Ribbon parsed from test case inputs */}
                {inputData.length > 0 && (
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {inputData.map((val, idx) => {
                        const isActive = (currentStep % inputData.length) === idx;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <div 
                              className={`w-9 h-9 flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 border ${
                                isActive
                                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105 shadow-[0_0_8px_rgba(212,175,85,0.25)]'
                                  : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                              }`}
                            >
                              {val}
                            </div>
                            <span className="text-[7px] font-mono text-zinc-600">idx {idx}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pointer marker label */}
                    <div className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-wider animate-pulse">
                      ↑ Pointer at Index {currentStep % inputData.length}
                    </div>
                  </div>
                )}

                {/* Execution Console Terminal Logs */}
                <div className="w-full max-w-[320px] bg-[#04060A] border border-white/[0.06] p-3 font-mono text-[9.5px] text-[#A0AEC0] flex flex-col gap-1 h-32 overflow-y-auto">
                  <div className="text-[#D4AF37]/80 text-[8px] uppercase tracking-widest border-b border-white/[0.04] pb-1 mb-1 font-bold flex justify-between items-center">
                    <span>SIMULATION CONSOLE LOG</span>
                    <span className="animate-pulse">● LIVE</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {simulation.steps.slice(0, currentStep + 1).map((s, idx) => (
                      <div className={`leading-relaxed ${idx === currentStep ? 'text-[#D4AF37] font-bold' : 'text-zinc-500'}`} key={idx}>
                        <span className="text-[#D4AF37]/40 mr-1.5">&gt;</span>
                        {s.desc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Complete output alert overlay */}
            {activeStepData?.state.finished && (
              <div className="absolute inset-0 bg-[#06080C]/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
                {activeStepData.state.hasMismatch ? (
                  <>
                    <span className="w-12 h-12 rounded-full border border-red-500/35 bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse text-lg font-bold mb-2">✗</span>
                    <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-red-400" style={{ fontFamily: 'Unbounded' }}>
                      Execution Failed
                    </h3>
                    <span className="mt-3 px-4 py-1.5 font-mono text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 text-center max-w-xs">
                      Output ({activeStepData.state.ans}) does not match expected result. Check your mathematical operations!
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={32} className="text-[#4ade80] mb-2 animate-pulse" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#E8EDF2]" style={{ fontFamily: 'Unbounded' }}>
                      Execution Complete
                    </h3>
                    <span className="mt-3 px-4 py-1.5 font-mono text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                      Output: {activeStepData.state.ans}
                    </span>
                  </>
                )}
                <button 
                  onClick={handleReset} 
                  className="mt-4 px-3 py-1.5 border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white transition-colors font-mono text-[10px] uppercase cursor-pointer"
                >
                  Restart Simulation
                </button>
              </div>
            )}
          </div>

          {/* Bottom Animation Control Board */}
          <footer className="h-14 border-t border-white/[0.04] bg-[#0A0F16] flex items-center justify-between px-4 mt-auto interactive-viz-footer">
            {/* Speed slider */}
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">Speed</span>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-16 accent-[#D4AF37] bg-zinc-800 h-1 cursor-pointer rounded-lg"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={handleStepBackward} 
                disabled={currentStep === 0 || isPlaying}
                className="w-7 h-7 rounded border border-white/[0.04] hover:border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-20 cursor-pointer"
                title="Step Backward"
              >
                <RotateCcw size={11} className="transform rotate-180" />
              </button>
              
              <button 
                onClick={handlePlayPause}
                className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#FFE082] text-black font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause size={10} fill="black" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play size={10} fill="black" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleStepForward} 
                disabled={currentStep === simulation.steps.length - 1 || isPlaying}
                className="w-7 h-7 rounded border border-white/[0.04] hover:border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-20 cursor-pointer"
                title="Step Forward"
              >
                <SkipForward size={11} />
              </button>
            </div>

            {/* Reset */}
            <button 
              onClick={handleReset}
              className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={9} />
              <span>Reset</span>
            </button>
          </footer>
        </>
      )}
    </div>
  );
};

export default InteractiveVisualizer;
