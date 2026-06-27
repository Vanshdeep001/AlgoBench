import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, Cpu, Layers, CheckCircle2, AlertCircle, Variable, Repeat, GitBranch } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

// Custom Complexity Icon
const ComplexityIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L20 6.5V17.5L12 22L4 17.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12L8 14.5M12 12L16 14.5M12 12V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProblemVisualizer = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(60); // ms per step multiplier
  const playTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(res.data);
        
        // Load saved code from localStorage
        const savedCode = localStorage.getItem(`visualizer_code_${problemId}`);
        const savedLang = localStorage.getItem(`visualizer_lang_${problemId}`);
        
        if (savedCode) {
          setCode(savedCode);
        } else {
          // Fallback code
          const jsStart = res.data.startCode?.find(c => c.language.toLowerCase() === 'javascript');
          setCode(jsStart ? jsStart.initialCode : '// No code available');
        }
        
        if (savedLang) {
          setLanguage(savedLang);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching problem details:', err);
        setLoading(false);
      }
    };
    
    fetchProblem();
  }, [problemId]);

  // Generate Simulation steps based on problem type and user's actual code lines
  const simulation = useMemo(() => {
    if (!problem || !code) return null;
    const title = problem.title.toLowerCase().trim();
    const lines = code.split('\n');

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
      const x = 12321;
      const sVal = '12321';
      
      const initLine = executableLines.find(l => l.text.match(/(orig|rev|temp|left|right|x\s*=)/i))?.lineNum || 2;
      const loopLine = executableLines.find(l => l.text.match(/(while|for)/i))?.lineNum || 3;
      const calcLine = executableLines.find(l => l.text.match(/(rev\s*\*|x\s*%\s*10)/i))?.lineNum || 4;
      const divLine = executableLines.find(l => l.text.match(/(x\s*\/=|x\s*=\s*x\s*\/)/i))?.lineNum || 5;
      const checkLine = executableLines.find(l => l.text.match(/(orig|==)/i))?.lineNum || 6;
      
      steps.push({ line: initLine, desc: 'Initialize original value tracker = 12321 and reverse value = 0.', state: { orig: 12321, temp: 12321, rev: 0, leftIdx: 0, rightIdx: 4 } });
      
      // We will simulate digits matching left/right pointer comparisons to make it highly visual
      steps.push({ line: loopLine, desc: 'Compare outer digits: index 0 (1) and index 4 (1).', state: { orig: 12321, temp: 12321, rev: 0, leftIdx: 0, rightIdx: 4, compare: true } });
      steps.push({ line: calcLine, desc: 'Outer digits match! Move pointers inward.', state: { orig: 12321, temp: 1232, rev: 1, leftIdx: 0, rightIdx: 4, match: true } });
      
      steps.push({ line: divLine, desc: 'Update pointers: left index becomes 1, right index becomes 3.', state: { orig: 12321, temp: 1232, rev: 1, leftIdx: 1, rightIdx: 3 } });
      steps.push({ line: loopLine, desc: 'Compare next digits: index 1 (2) and index 3 (2).', state: { orig: 12321, temp: 123, rev: 12, leftIdx: 1, rightIdx: 3, compare: true } });
      steps.push({ line: calcLine, desc: 'Inner digits match! Move pointers inward.', state: { orig: 12321, temp: 12, rev: 123, leftIdx: 1, rightIdx: 3, match: true } });
      
      steps.push({ line: divLine, desc: 'Update pointers: left index becomes 2, right index becomes 2.', state: { orig: 12321, temp: 12, rev: 123, leftIdx: 2, rightIdx: 2 } });
      steps.push({ line: loopLine, desc: 'Pointers meet at center index 2 (value 3). Done checking.', state: { orig: 12321, temp: 1, rev: 1232, leftIdx: 2, rightIdx: 2, compare: true } });
      steps.push({ line: checkLine, desc: 'All digits matched. original == reverse -> return true.', state: { orig: 12321, temp: 0, rev: 12321, leftIdx: 2, rightIdx: 2, finished: true, ans: 'true' } });

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
  }, [problem, code]);

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

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying && simulation) {
      const delay = Math.max(200, 2000 - (speed * 18)); // scale speed slider (1-100) to ms delay
      playTimeoutRef.current = setTimeout(() => {
        if (currentStep < simulation.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false); // Stop when finished
        }
      }, delay);
    }
    return () => clearTimeout(playTimeoutRef.current);
  }, [isPlaying, currentStep, simulation, speed]);

  const handlePlayPause = () => {
    if (currentStep === (simulation?.steps.length || 0) - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080C] flex flex-col items-center justify-center text-white">
        <span className="loading loading-spinner loading-lg text-[#D4AF37]"></span>
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mt-4">Loading visualizer core...</span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#06080C] flex flex-col items-center justify-center text-white p-4">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h2 className="text-base font-bold uppercase tracking-wider mb-2">Problem not found</h2>
        <button onClick={() => navigate('/problems')} className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-mono uppercase">Back to Catalog</button>
      </div>
    );
  }

  // Split user code to render line numbers and highlight active execution line
  const codeLines = code.split('\n');

  return (
    <div className="min-h-screen bg-[#06080C] flex flex-col text-white font-sans">
      {/* Visualizer Navbar */}
      <header className="h-14 border-b border-white/[0.04] bg-[#0A0F16] flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.close()} 
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>CLOSE</span>
          </button>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#D4AF37]" />
            <h1 className="text-xs font-heading font-bold uppercase tracking-wider" style={{ fontFamily: 'Unbounded' }}>
              Logic Debugger &amp; Visualizer
            </h1>
          </div>
          <span className="text-zinc-600">·</span>
          <span className="text-xs text-zinc-400 font-medium">{problem.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5">
            PRO VISUALIZER
          </span>
        </div>
      </header>

      {/* Main Work Area split */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-y-auto lg:overflow-hidden">
        {/* Left Side: Code block panel */}
        <div className="w-full lg:w-[45%] border-b lg:border-b-0 lg:border-r border-white/[0.04] bg-[#080B10] flex flex-col min-h-[220px] lg:min-h-0 lg:h-full shrink-0">
          <div className="h-10 border-b border-white/[0.04] bg-[#0A0F16] px-4 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Reference Solution ({language})
            </span>
            <span className="text-[10px] font-mono text-zinc-600">Line Highlight Mode</span>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed select-none">
            {codeLines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isActive = activeStepData && activeStepData.line === lineNum;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start transition-colors duration-150 ${
                    isActive ? 'bg-[#D4AF37]/10 border-l-2 border-[#D4AF37]' : 'border-l-2 border-transparent'
                  }`}
                  style={{ minHeight: '22px' }}
                >
                  <span className="w-10 text-right pr-4 text-zinc-600 font-bold select-none text-[11px]">{lineNum}</span>
                  <pre className={`flex-1 m-0 bg-transparent text-[#E8EDF2] overflow-x-auto ${
                    isActive ? 'text-[#FFE082] font-semibold' : ''
                  }`}>
                    <code>{lineText}</code>
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Graphic Execution Visualizer Canvas */}
        <div className="flex-1 bg-[#05070A] flex flex-col min-h-[400px] lg:min-h-0">
          {/* Header instructions description */}
          <div className="p-5 border-b border-white/[0.04] bg-[#0A0F16]/50 flex items-start gap-3">
            <Layers className="text-[#D4AF37] mt-0.5" size={16} />
            <div>
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#D4AF37]" style={{ fontFamily: 'Unbounded' }}>
                Step {currentStep + 1} of {simulation?.steps.length || 0}
              </h3>
              <p className="text-[12.5px] text-zinc-300 mt-1 leading-relaxed">
                {activeStepData?.desc || 'Initializing visualizer...'}
              </p>
            </div>
          </div>

          {/* Graphics canvas space */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-start lg:justify-center relative min-h-[320px]">
            
            {/* 1) Two Sum Visualization */}
            {simulation?.type === 'two-sum' && (
              <div className="w-full max-w-xl flex flex-col items-center gap-8">
                {/* Array display */}
                <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto w-full pb-2">
                  {simulation.input.nums.map((num, idx) => {
                    const isActive = activeStepData?.state.activeIdx === idx;
                    const isMatched = activeStepData?.state.matchIdx === idx;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div 
                          className={`w-14 h-14 flex items-center justify-center font-mono text-base font-bold transition-all duration-300 border ${
                            isMatched 
                              ? 'bg-[#4ade80]/10 border-[#4ade80] text-[#4ade80] scale-110 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                              : isActive 
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] scale-105'
                                : 'bg-[#0A0F16] border-white/[0.05] text-[#E8EDF2]'
                          }`}
                        >
                          {num}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600">idx {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Target badge */}
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider bg-white/[0.02] border border-white/[0.05] px-4 py-2">
                  <span>Target:</span>
                  <span className="text-[#D4AF37] font-bold">{simulation.input.target}</span>
                </div>

                {/* Map memory visualization */}
                <div className="w-full max-w-md bg-[#0A0F16] border border-white/[0.04] p-5">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3 border-b border-white/[0.04] pb-2">
                    Hash Map Memory (Value → Index)
                  </h4>
                  {Object.keys(activeStepData?.state.map || {}).length === 0 ? (
                    <p className="text-[11px] font-mono text-zinc-600 italic py-2">Map is currently empty.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(activeStepData?.state.map || {}).map(([key, val]) => (
                        <div key={key} className="flex flex-col border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-2 rounded text-center">
                          <span className="text-xs font-bold text-[#E8EDF2] font-mono">{key}</span>
                          <span className="text-[9px] font-mono text-zinc-500 mt-1">idx {val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2) Maximum Subarray (Kadane) Visualization */}
            {simulation?.type === 'max-subarray' && (
              <div className="w-full max-w-2xl flex flex-col items-center gap-8">
                {/* Array of bars */}
                <div className="flex items-end justify-center gap-2.5 h-[160px] w-full px-4 border-b border-white/[0.04] pb-2">
                  {simulation.input.nums.map((num, idx) => {
                    const startIdx = activeStepData?.state.startIdx ?? -1;
                    const iIdx = activeStepData?.state.i ?? -1;
                    const isInSubarray = idx >= startIdx && idx <= iIdx && activeStepData?.state.activeIdx !== -1;
                    const isActive = activeStepData?.state.activeIdx === idx;
                    
                    // Normalize bar height
                    const barHeight = Math.max(30, Math.min(130, Math.abs(num) * 20));
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        {/* Bar element */}
                        <div 
                          className={`w-10 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 border ${
                            isActive 
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105'
                              : isInSubarray
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-500'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        >
                          {num}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600">idx {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Values dashboard */}
                <div className="flex items-center gap-8 bg-[#0A0F16] border border-white/[0.04] p-4 px-6 w-full max-w-md justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Current Sum</span>
                    <span className="text-lg font-bold font-mono mt-1 text-[#FFE082]">
                      {activeStepData?.state.curr ?? 0}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Global Max Sum</span>
                    <span className="text-lg font-bold font-mono mt-1 text-[#D4AF37]">
                      {activeStepData?.state.global ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3) Valid Parentheses Visualization */}
            {simulation?.type === 'valid-parentheses' && (
              <div className="w-full max-w-md flex flex-col items-center gap-8">
                {/* Input string tokens */}
                <div className="flex items-center gap-2.5">
                  {simulation.input.s.split('').map((char, idx) => {
                    const isActive = activeStepData?.state.i === idx;
                    const isProcessed = activeStepData?.state.i > idx;
                    return (
                      <div 
                        key={idx}
                        className={`w-10 h-10 border flex items-center justify-center font-mono text-base font-bold transition-all duration-200 ${
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
                <div className="relative w-48 h-56 border-b-4 border-x-4 border-white/[0.08] bg-[#0A0F16]/20 flex flex-col-reverse items-center justify-start p-2 gap-2">
                  <div className="absolute top-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest select-none">
                    LIFO Stack Frame
                  </div>
                  {(activeStepData?.state.stack || []).length === 0 ? (
                    <div className="text-[10px] font-mono text-zinc-600 italic mb-6">Stack is empty</div>
                  ) : (
                    activeStepData.state.stack.map((bracket, sIdx) => (
                      <div 
                        key={sIdx}
                        className="w-36 py-2.5 bg-[#D4AF37]/5 border border-[#D4AF37]/30 text-[#D4AF37] text-center font-mono font-bold text-base transition-all duration-300"
                      >
                        {bracket}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4) Buy Sell Stock Visualization */}
            {simulation?.type === 'sell-stock' && (
              <div className="w-full max-w-xl flex flex-col items-center gap-8">
                {/* Graph bars */}
                <div className="flex items-end justify-start lg:justify-center gap-3 h-[160px] w-full px-4 border-b border-white/[0.04] pb-2 overflow-x-auto">
                  {simulation.input.prices.map((price, idx) => {
                    const isBuy = activeStepData?.state.buyIdx === idx;
                    const isSell = activeStepData?.state.sellIdx === idx;
                    const isActive = activeStepData?.state.activeIdx === idx;
                    
                    const barHeight = Math.max(30, Math.min(130, price * 18));
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        {/* Tags */}
                        <div className="h-5 flex items-center justify-center">
                          {isBuy && <span className="text-[8px] font-mono bg-blue-500/20 text-blue-300 px-1 py-0.5">BUY</span>}
                          {isSell && <span className="text-[8px] font-mono bg-[#4ade80]/20 text-[#4ade80] px-1 py-0.5">SELL</span>}
                        </div>
                        {/* Bar */}
                        <div 
                          className={`w-12 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 border ${
                            isSell 
                              ? 'bg-[#4ade80]/15 border-[#4ade80] text-[#4ade80] scale-105'
                              : isBuy
                                ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                                : isActive
                                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                                  : 'bg-[#0A0F16] border-white/[0.04] text-zinc-500'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        >
                          ${price}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600">Day {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Dashboard summary */}
                <div className="flex items-center gap-8 bg-[#0A0F16] border border-white/[0.04] p-4 px-6 w-full max-w-md justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Min Price Bought</span>
                    <span className="text-lg font-bold font-mono mt-1 text-blue-300">
                      ${activeStepData?.state.min ?? 0}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Max Profit Margin</span>
                    <span className="text-lg font-bold font-mono mt-1 text-[#4ade80]">
                      ${activeStepData?.state.profit ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5) Contains Duplicate Visualization */}
            {simulation?.type === 'contains-duplicate' && (
              <div className="w-full max-w-md flex flex-col items-center gap-8">
                {/* Array */}
                <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto w-full pb-2">
                  {simulation.input.nums.map((num, idx) => {
                    const isActive = activeStepData?.state.activeIdx === idx;
                    const isDup = activeStepData?.state.duplicateFound && isActive;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div 
                          className={`w-14 h-14 flex items-center justify-center font-mono text-base font-bold transition-all duration-200 border ${
                            isDup 
                              ? 'bg-red-500/10 border-red-500 text-red-500 scale-105'
                              : isActive
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105'
                                : 'bg-[#0A0F16] border-white/[0.04] text-[#E8EDF2]'
                          }`}
                        >
                          {num}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600">idx {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Visited Set container */}
                <div className="w-full max-w-xs bg-[#0A0F16] border border-white/[0.04] p-5">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3 border-b border-white/[0.04] pb-2">
                    Visited Set Memory (Unique Values)
                  </h4>
                  {(activeStepData?.state.set || []).length === 0 ? (
                    <p className="text-[11px] font-mono text-zinc-600 italic py-1">Set is empty.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(activeStepData?.state.set || []).map((val) => (
                        <div key={val} className="px-3 py-1.5 bg-[#D4AF37]/5 border border-[#D4AF37]/30 text-xs font-bold text-[#E8EDF2] font-mono rounded">
                          {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Palindrome Number Visualization */}
            {simulation?.type === 'palindrome' && (
              <div className="w-full flex flex-col items-center gap-6">
                {/* Row of digits */}
                <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto w-full pb-2">
                  {simulation.input.x.split('').map((char, idx) => {
                    const isLeft = activeStepData?.state.leftIdx === idx;
                    const isRight = activeStepData?.state.rightIdx === idx;
                    const isCompare = activeStepData?.state.compare && (isLeft || isRight);
                    const isMatch = activeStepData?.state.match && (isLeft || isRight);
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className="h-5 flex items-center justify-center text-xs font-mono text-zinc-400">
                          {isLeft && <span className="text-amber-400 font-bold">L</span>}
                          {isRight && <span className="text-amber-400 font-bold">R</span>}
                        </div>
                        <div 
                          className={`w-14 h-14 flex items-center justify-center font-mono text-lg font-bold transition-all duration-200 border ${
                            isMatch
                              ? 'bg-green-500/10 border-green-500 text-green-400 scale-105 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                              : isCompare
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105 shadow-[0_0_10px_rgba(212,175,85,0.25)]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-[#E8EDF2]'
                          }`}
                        >
                          {char}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600">idx {idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Dashboard for tracking state variables */}
                <div className="flex items-center gap-8 bg-[#0A0F16] border border-white/[0.04] p-4 px-6 w-full max-w-md justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Original x</span>
                    <span className="text-sm font-bold font-mono text-zinc-300">{activeStepData?.state.orig}</span>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Reversed (rev)</span>
                    <span className="text-sm font-bold font-mono text-[#D4AF37]">{activeStepData?.state.rev}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Merge Two Sorted Lists Visualization */}
            {simulation?.type === 'merge-lists' && (
              <div className="w-full flex flex-col items-center gap-6">
                {/* List 1 */}
                <div className="flex flex-col w-full max-w-md">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Linked List 1</span>
                  <div className="flex items-center justify-start lg:justify-center gap-1.5 overflow-x-auto w-full pb-2">
                    {simulation.input.list1.map((val, idx) => {
                      const isActive = activeStepData?.state.p1 === idx;
                      const isProcessed = activeStepData?.state.p1 > idx;
                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className={`px-4 py-2 font-mono text-sm border ${
                            isActive
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold scale-105 shadow-[0_0_10px_rgba(212,175,85,0.3)]'
                              : isProcessed
                                ? 'opacity-20 border-white/[0.02]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                          }`}>
                            {val}
                          </div>
                          {idx < simulation.input.list1.length - 1 && <span className="text-zinc-600 text-xs">→</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* List 2 */}
                <div className="flex flex-col w-full max-w-md">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Linked List 2</span>
                  <div className="flex items-center justify-start lg:justify-center gap-1.5 overflow-x-auto w-full pb-2">
                    {simulation.input.list2.map((val, idx) => {
                      const isActive = activeStepData?.state.p2 === idx;
                      const isProcessed = activeStepData?.state.p2 > idx;
                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className={`px-4 py-2 font-mono text-sm border ${
                            isActive
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold scale-105 shadow-[0_0_10px_rgba(212,175,85,0.3)]'
                              : isProcessed
                                ? 'opacity-20 border-white/[0.02]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                          }`}>
                            {val}
                          </div>
                          {idx < simulation.input.list2.length - 1 && <span className="text-zinc-600 text-xs">→</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Merged Output Link List */}
                <div className="w-full max-w-md bg-[#04060A] border border-white/[0.04] p-4 mt-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 block font-bold">
                    Merged Output Linked List Path
                  </span>
                  {(activeStepData?.state.merged || []).length === 0 ? (
                    <span className="text-xs font-mono text-zinc-600 italic">No nodes merged yet. Dummy head pointer active.</span>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap text-zinc-200 font-mono text-sm">
                      {activeStepData.state.merged.map((val, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-green-400 font-bold">{val}</span>
                          {idx < activeStepData.state.merged.length - 1 && <span className="text-zinc-600">→</span>}
                        </div>
                      ))}
                      <span className="text-zinc-500 ml-1.5">→ -1 (NULL)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product of Array Except Self Visualization */}
            {simulation?.type === 'product-except-self' && (
              <div className="w-full flex flex-col items-center gap-4">
                {/* Input list */}
                <div className="flex flex-col w-full max-w-md">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Input Array (nums)</span>
                  <div className="flex gap-2 overflow-x-auto w-full pb-2">
                    {simulation.input.nums.map((val, idx) => {
                      const isActive = activeStepData?.state.i === idx;
                      return (
                        <div key={idx} className={`w-12 py-2 text-center font-mono text-sm border ${
                          isActive 
                            ? 'bg-amber-500/25 border-amber-500 text-amber-300 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                            : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                        }`}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prefix Array */}
                <div className="flex flex-col w-full max-w-md">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-blue-400 mb-1">Prefix Products (left-to-right pass)</span>
                  <div className="flex gap-2 overflow-x-auto w-full pb-2">
                    {(activeStepData?.state.prefix || []).map((val, idx) => {
                      const isActive = activeStepData?.state.i === idx && activeStepData?.state.phase === 'prefix';
                      return (
                        <div key={idx} className={`w-12 py-2 text-center font-mono text-sm border ${
                          isActive
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold scale-105 shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                            : 'bg-[#0A0F16]/40 border-white/[0.02] text-zinc-500'
                        }`}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suffix Array */}
                <div className="flex flex-col w-full max-w-md">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-purple-400 mb-1">Suffix Products (right-to-left pass)</span>
                  <div className="flex gap-2 overflow-x-auto w-full pb-2">
                    {(activeStepData?.state.suffix || []).map((val, idx) => {
                      const isActive = activeStepData?.state.i === idx && activeStepData?.state.phase === 'suffix';
                      return (
                        <div key={idx} className={`w-12 py-2 text-center font-mono text-sm border ${
                          isActive
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold scale-105 shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                            : 'bg-[#0A0F16]/40 border-white/[0.02] text-zinc-500'
                        }`}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Product Output Array */}
                <div className="flex flex-col w-full max-w-md border-t border-white/[0.04] pt-3 mt-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#D4AF37] mb-1">Output Array (Result)</span>
                  <div className="flex gap-2 overflow-x-auto w-full pb-2">
                    {(activeStepData?.state.result || []).map((val, idx) => {
                      const isCurrentUpdate = activeStepData?.state.i === idx && activeStepData?.state.phase === 'suffix';
                      return (
                        <div key={idx} className={`w-12 py-2 text-center font-mono text-sm border ${
                          isCurrentUpdate
                            ? 'bg-[#D4AF37]/25 border-[#D4AF37] text-[#D4AF37] font-bold scale-105 shadow-[0_0_10px_rgba(212,175,85,0.35)]'
                            : 'bg-[#0D1520] border-[#D4AF37]/10 text-zinc-300'
                        }`}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6) Container With Most Water Visualization */}
            {simulation?.type === 'most-water' && (
              <div className="w-full flex flex-col items-center gap-8 overflow-x-auto pb-4">
                <div className="relative w-[496px] h-[180px] border-b border-white/[0.04] pb-2 mx-auto shrink-0">
                  
                  {/* Dynamic Water Shading Overlay */}
                  {activeStepData?.state.showWater && (() => {
                    const left = activeStepData.state.left;
                    const right = activeStepData.state.right;
                    const minVal = Math.min(simulation.input.height[left], simulation.input.height[right]);
                    const waterHeight = Math.max(15, minVal * 15);
                    
                    // Calculate position offsets: bar is w-12 (48px) plus gap-2 (8px) -> 56px total.
                    const startPos = left * 56;
                    const containerWidth = (right - left) * 56 + 48;
                    
                    return (
                      <div 
                        className="absolute bg-blue-500/25 border-t border-blue-400/50 flex items-center justify-center font-mono text-xs text-blue-200/80 font-bold z-10 transition-all duration-300 shadow-[inset_0_4px_12px_rgba(59,130,246,0.3)]"
                        style={{
                          left: `${startPos}px`,
                          width: `${containerWidth}px`,
                          height: `${waterHeight}px`,
                          bottom: '22px' // aligned above the bottom day labels
                        }}
                      >
                        Area: {activeStepData.state.currArea}
                      </div>
                    );
                  })()}

                  <div className="flex items-end gap-2 w-full h-full">
                    {simulation.input.height.map((h, idx) => {
                      const isLeft = activeStepData?.state.left === idx;
                      const isRight = activeStepData?.state.right === idx;
                      const barHeight = h * 15;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 z-20 w-[48px]">
                          <div className="h-5 flex items-center justify-center text-xs font-mono text-zinc-400">
                            {isLeft && <span className="text-amber-400 font-bold">L</span>}
                            {isRight && <span className="text-amber-400 font-bold">R</span>}
                          </div>
                          <div 
                            className={`w-12 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 border ${
                              isLeft || isRight
                                ? 'bg-amber-500/15 border-amber-500 text-amber-300 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'bg-[#0A0F16] border-white/[0.04] text-zinc-500'
                            }`}
                            style={{ height: `${barHeight}px` }}
                          >
                            {h}
                          </div>
                          <span className="text-[9px] font-mono text-zinc-600">{idx}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-8 bg-[#0A0F16] border border-white/[0.04] p-4 px-6 w-full max-w-md justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Current Area</span>
                    <span className="text-lg font-bold font-mono text-blue-300">{activeStepData?.state.currArea ?? 0}</span>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Max Area Found</span>
                    <span className="text-lg font-bold font-mono text-[#D4AF37]">{activeStepData?.state.maxArea ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7) Generic Fallback Visualization */}
            {simulation?.type === 'generic' && (
              <div className="w-full flex flex-col items-center gap-6">
                
                {/* Visual Data Ribbon parsed from test case inputs */}
                {inputData.length > 0 && (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {inputData.map((val, idx) => {
                        const isActive = (currentStep % inputData.length) === idx;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5">
                            <div 
                              className={`w-12 h-12 flex items-center justify-center font-mono text-sm font-bold transition-all duration-200 border ${
                                isActive
                                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] scale-105 shadow-[0_0_10px_rgba(212,175,85,0.3)]'
                                  : 'bg-[#0A0F16] border-white/[0.04] text-zinc-400'
                              }`}
                            >
                              {val}
                            </div>
                            <span className="text-[8px] font-mono text-zinc-600">idx {idx}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pointer marker label */}
                    <div className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-wider animate-pulse mt-1">
                      ↑ Pointer at Index {currentStep % inputData.length}
                    </div>
                  </div>
                )}

                {/* Execution Console Terminal Logs */}
                <div className="w-full max-w-md bg-[#04060A] border border-white/[0.06] p-4 font-mono text-xs text-[#A0AEC0] flex flex-col gap-2 h-44 overflow-y-auto shadow-2xl">
                  <div className="text-[#D4AF37]/80 text-[9px] uppercase tracking-widest border-b border-white/[0.04] pb-1.5 mb-1.5 font-bold flex justify-between items-center">
                    <span>SIMULATION CONSOLE LOG</span>
                    <span className="animate-pulse text-[#4ade80]">● LIVE</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {simulation.steps.slice(0, currentStep + 1).map((s, idx) => (
                      <div key={idx} className={`leading-relaxed ${idx === currentStep ? 'text-[#D4AF37] font-bold' : 'text-zinc-500'}`}>
                        <span className="text-[#D4AF37]/40 mr-2">&gt;</span>
                        [Line {s.line}] {s.desc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Complete output alert overlay */}
            {activeStepData?.state.finished && (
              <div className="absolute inset-0 bg-[#06080C]/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                <CheckCircle2 size={40} className="text-[#4ade80] mb-3 animate-pulse" />
                <h3 className="text-base font-heading font-bold uppercase tracking-wider text-[#E8EDF2]" style={{ fontFamily: 'Unbounded' }}>
                  Execution Complete
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs text-center">
                  The algorithm has terminated successfully and outputted:
                </p>
                <span className="mt-4 px-5 py-2 font-mono text-sm font-bold text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                  {activeStepData.state.ans}
                </span>
                <button 
                  onClick={handleReset} 
                  className="mt-6 px-4 py-2 border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white transition-colors font-mono text-xs uppercase"
                >
                  Restart Simulation
                </button>
              </div>
            )}
          </div>

          {/* Bottom Animation Control Board */}
          <footer className="h-auto border-t border-white/[0.04] bg-[#0A0F16] flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 sm:py-0 gap-4">
            {/* Speed slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Speed</span>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-24 accent-[#D4AF37] bg-zinc-800 h-1 cursor-pointer rounded-lg"
              />
              <span className="text-[10px] font-mono text-zinc-400 w-8">{speed}%</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handleStepBackward} 
                disabled={currentStep === 0 || isPlaying}
                className="w-8 h-8 rounded border border-white/[0.04] hover:border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-20 cursor-pointer"
                title="Step Backward"
              >
                <RotateCcw size={13} className="transform rotate-180" />
              </button>
              
              <button 
                onClick={handlePlayPause}
                className="px-6 py-2 bg-[#D4AF37] hover:bg-[#FFE082] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause size={12} fill="black" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play size={12} fill="black" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleStepForward} 
                disabled={currentStep === (simulation?.steps.length || 0) - 1 || isPlaying}
                className="w-8 h-8 rounded border border-white/[0.04] hover:border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-20 cursor-pointer"
                title="Step Forward"
              >
                <SkipForward size={13} />
              </button>
            </div>

            {/* Restart/Reset */}
            <div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset View</span>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ProblemVisualizer;
