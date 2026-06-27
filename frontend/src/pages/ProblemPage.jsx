import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, Link } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from "../utils/axiosClient"
import { canRunInBrowser, runJavaScriptLocally } from "../utils/browserExecutor"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import ProblemDiscussion from '../features/community/pages/ProblemDiscussion';
import InteractiveVisualizer from '../components/InteractiveVisualizer';
import { Play, Send, CheckCircle, XCircle, ChevronDown, MessageSquare, Sparkles, Video, ChevronRight, Cpu, Layers, PanelLeftClose, PanelLeftOpen, Check, AlertCircle, ChevronLeft, FileText, Lock, X, Crown, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeUser } from '../authSlice';
import PublicFooter from '../components/PublicFooter';
import '../styles/problem-page-fixes.css';
import '../styles/homepage-redesign.css';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

// Minimal LeetCode-style starter code. This judge reads stdin / checks stdout,
// so we keep a single input-read line plus a placeholder instead of the verbose
// per-problem scaffolding stored in the DB.
const BOILERPLATE = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
    }
}`,
  javascript: `const input = require('fs').readFileSync(0, 'utf-8').trim();
// Write your code here`,
};

const getBoilerplate = (language) => BOILERPLATE[language] ?? '';

// Format runtime/memory cleanly (avoid floating-point noise like 0.0090000001s)
const fmtTime = (t) => `${(Number(t) || 0).toFixed(3)}s`;
const fmtMem = (m) => `${Math.round(Number(m) || 0)} KB`;

// Turn a plain-text problem statement into structured, premium JSX:
// - short lines ending in ':' become gold section labels
// - "- " / "•" lines become a bulleted list
// - everything else becomes paragraphs (consecutive lines merged)
function renderDescription(text, title) {
  if (!text) return null;
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: 'p', text: para.join(' ') }); para = []; } };
  const flushList = () => { if (list.length) { blocks.push({ type: 'ul', items: [...list] }); list = []; } };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (/^[-•]\s+/.test(line)) { flushPara(); list.push(line.replace(/^[-•]\s+/, '')); continue; }
    
    const isLabel = (/:$/.test(line) || (/^\*\*([^*]+):\*\*$/.test(line))) && line.length <= 44;
    if (isLabel) {
      flushPara();
      flushList();
      const cleanLabel = line.replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/:$/, '');
      blocks.push({ type: 'label', text: cleanLabel });
      continue;
    }
    
    flushList();
    para.push(line);
  }
  flushPara(); flushList();

  // Drop a leading paragraph that just repeats the title (catalog descriptions).
  if (blocks[0]?.type === 'p' && title && blocks[0].text.trim() === title.trim()) blocks.shift();

  const linkify = (s) => {
    if (!s) return null;
    const regex = /(https?:\/\/\S+)|\*\*([^*]+)\*\*|`([^`]+)`/g;
    const parts = s.split(regex);
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === undefined || part === '') continue;
      
      const type = i % 4;
      if (type === 0) {
        result.push(<span key={i}>{part}</span>);
      } else if (type === 1) {
        result.push(
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="desc-link">
            {part}
          </a>
        );
      } else if (type === 2) {
        const isFormatHeader = /^(Input|Output|Constraints|Note|Example|Explanation)\s*Format?:?$/i.test(part.trim());
        if (isFormatHeader) {
          result.push(
            <span 
              key={i} 
              className="desc-format-header block text-[11px] font-heading font-bold tracking-widest text-[#D4AF37] uppercase mt-6 mb-2" 
              style={{ fontFamily: 'Unbounded', display: 'block' }}
            >
              {part}
            </span>
          );
        } else {
          result.push(
            <strong key={i} className="desc-bold text-[#D4AF37] font-semibold">
              {part}
            </strong>
          );
        }
      } else if (type === 3) {
        result.push(
          <code key={i} className="desc-code-inline px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] font-mono text-[12.5px] text-[#fbbf24]">
            {part}
          </code>
        );
      }
    }
    return result;
  };

  return blocks.map((b, i) => {
    if (b.type === 'label') return <h4 key={i} className="desc-label">{b.text}</h4>;
    if (b.type === 'ul') return <ul key={i} className="desc-list">{b.items.map((it, j) => <li key={j}>{linkify(it)}</li>)}</ul>;
    return <div key={i} className="desc-para">{linkify(b.text)}</div>;
  });
}

const getEditorialContent = (problem) => {
  const title = (problem?.title || '').toLowerCase().trim();
  const tags = (problem?.tags || '').toLowerCase();
  
  if (title === 'two sum') {
    return {
      approachTitle: 'Hash Map Lookup',
      approachText: 'Instead of checking every pair with O(N^2) complexity, we store values we have seen in a hash map mapping each value to its index. For each element x, we check if target - x exists in our map. This trades O(N) space for O(N) time complexity.',
      complexityText: 'Time Complexity: O(N) since we perform a single pass through the array. Space Complexity: O(N) to store the elements in the hash map.',
      noteText: 'Be sure to check if the complement index is not equal to the current element index to avoid using the same element twice.'
    };
  }
  
  if (title === 'maximum subarray') {
    return {
      approachTitle: "Kadane's Algorithm",
      approachText: "The optimal strategy is Kadane's Algorithm. We maintain two variables: current_max (the maximum sum ending at the current position) and max_so_far (the global maximum sum). For each element, we decide whether to add it to the current subarray or start a new subarray from this element: current_max = Math.max(x, current_max + x).",
      complexityText: 'Time Complexity: O(N) because we iterate through the array exactly once. Space Complexity: O(1) since we only use a constant amount of extra memory.',
      noteText: 'Initialize both current_max and max_so_far with the first element of the array to handle negative number arrays correctly.'
    };
  }

  if (title === 'valid parentheses') {
    return {
      approachTitle: 'Stack-based Matching',
      approachText: 'We use a stack to keep track of the opening brackets. When we encounter an opening bracket (, [, or {, we push it onto the stack. When we encounter a closing bracket, we check if the stack is empty or if the top of the stack matches the corresponding opening bracket type. If it matches, we pop it; otherwise, the string is invalid.',
      complexityText: 'Time Complexity: O(N) since we process each character in the string exactly once. Space Complexity: O(N) in the worst case if all characters are opening brackets.',
      noteText: 'After processing the entire string, the stack must be empty for the brackets to be fully valid and matched.'
    };
  }

  if (title === 'best time to buy and sell stock') {
    return {
      approachTitle: 'Single Pass Dynamic Programming',
      approachText: 'We can solve this in a single pass. We keep track of the minimum price seen so far (min_price) and the maximum profit we can get if we sell on the current day. For each day, we update min_price and calculate the current profit. The global maximum profit is updated accordingly.',
      complexityText: 'Time Complexity: O(N) as we iterate through the prices array once. Space Complexity: O(1) because we only store two numeric values.',
      noteText: 'Initialize min_price to infinity and max_profit to 0. We can only sell stock on a later day than we bought it.'
    };
  }

  if (title === 'contains duplicate') {
    return {
      approachTitle: 'Hash Set Lookup',
      approachText: 'We initialize an auxiliary hash set. We iterate through the array and check if the current number is already in the set. If it is, we return true (duplicate found). Otherwise, we insert the number into the set. If the loop finishes without finding any duplicate, we return false.',
      complexityText: 'Time Complexity: O(N) on average because hash set search and insert operations take O(1) time. Space Complexity: O(N) to store the distinct elements in the set.',
      noteText: 'An alternative approach is sorting the array in O(N log N) time and checking if any adjacent elements are equal, which trades CPU cycles for O(1) auxiliary space.'
    };
  }

  if (tags.includes('dp') || tags.includes('dynamic')) {
    return {
      approachTitle: 'Dynamic Programming (Tabulation/Memoization)',
      approachText: 'The optimal approach uses Dynamic Programming. We identify the overlapping subproblems and define a state definition dp[i] representing the solution up to index i. We establish a state transition formula to compute dp[i] from previously computed values, avoiding redundant computations.',
      complexityText: 'Time Complexity: O(N) to O(N^2) depending on the number of subproblems and transitions. Space Complexity: O(N) to store the DP table.',
      noteText: 'Clearly define your base cases (e.g. dp[0], dp[1]) to bootstrap the bottom-up iteration safely.'
    };
  }

  if (tags.includes('stack')) {
    return {
      approachTitle: 'Monotonic Stack / LIFO Traversal',
      approachText: 'We utilize a Last-In-First-Out (LIFO) stack structure. We push elements or indices onto the stack to resolve them later. This is particularly useful for finding the next greater element or verifying correct nesting structures.',
      complexityText: 'Time Complexity: O(N) because each element is pushed and popped from the stack at most once. Space Complexity: O(N) to store the stack frames.',
      noteText: 'Using ArrayDeque in Java or raw Arrays in JavaScript is faster than the legacy java.util.Stack class.'
    };
  }

  if (tags.includes('hash') || tags.includes('map') || tags.includes('set')) {
    return {
      approachTitle: 'Hash-based Tracking',
      approachText: 'We utilize a hash table (Map/Set) to achieve O(1) average time complexity for insertions and lookups. We traverse the elements and store indices, frequencies, or visits to instantly verify conditions for subsequent elements.',
      complexityText: 'Time Complexity: O(N) linear time since we perform O(1) average hash queries per element. Space Complexity: O(N) auxiliary space to store the key-value pairs.',
      noteText: 'Check for hash collisions or load factors if performance degrades in highly repetitive datasets.'
    };
  }

  if (tags.includes('linkedlist') || tags.includes('linked-list')) {
    return {
      approachTitle: 'Pointer Manipulation & Dummy Nodes',
      approachText: 'We solve the problem using two-pointer techniques (e.g., fast/slow pointers to detect cycles or find midpoints) or standard node re-linking. Introducing a dummy head node simplifies handling edge cases where the head of the list changes.',
      complexityText: 'Time Complexity: O(N) linear scan of the nodes. Space Complexity: O(1) auxiliary space as we only re-link existing nodes in place.',
      noteText: 'Always watch out for null-pointer references (e.g., trying to access node.next when node is null).'
    };
  }

  if (tags.includes('binarysearch') || tags.includes('binary-search') || tags.includes('search')) {
    return {
      approachTitle: 'Binary Search (Divide & Conquer)',
      approachText: 'We leverage the sorted nature of the search space. We maintain low and high pointers, calculate the midpoint, and discard half of the search space in each iteration, achieving sub-linear complexity.',
      complexityText: 'Time Complexity: O(log N) logarithmic lookup scale. Space Complexity: O(1) constant auxiliary space for iterative search loops.',
      noteText: 'Use low + (high - low) / 2 for midpoint calculation to prevent integer overflow in fixed-width numeric types.'
    };
  }

  return {
    approachTitle: 'Optimized Linear / Iterative Scan',
    approachText: 'The optimal strategy leverages a linear scan. We maintain accumulators or state markers to solve the problem in a single pass, avoiding nested loops (O(N^2)) and keeping execution time to a minimum.',
    complexityText: 'Time Complexity: O(N) linear time. Space Complexity: O(1) auxiliary space.',
    noteText: 'Verify boundaries, empty array inputs, and single element edge cases to ensure code robustness.'
  };
};

const getDetailedDryRunText = (problem) => {
  const title = (problem?.title || '').toLowerCase().trim();
  const tags = (problem?.tags || '').toLowerCase();
  
  if (title === 'two sum') {
    return "Let's walk through the solution with the array [2, 7, 11, 15] and target 9. We start scanning the numbers from left to right: first we look at 2. The complement we need to find is 9 - 2 = 7. Since we haven't seen 7 yet, we save 2 with its position 0 in our memory. Next, we move to 7. The complement we need is 9 - 7 = 2. Since 2 is already saved in our memory, we found our pair! We immediately return the positions [0, 1].";
  }
  
  if (title === 'maximum subarray') {
    return "Let's walk through Kadane's algorithm with prices/numbers [-2, 1, -3, 4, -1, 2, 1, -5, 4]. We maintain a running sum (current_max) and a global maximum (max_so_far). Starting at -2, both are -2. Moving to 1, since starting fresh at 1 is better than extending -2 + 1 = -1, our running sum resets to 1 (global max becomes 1). For -3, the running sum drops to -2. For 4, the running sum resets to 4 (global max becomes 4). Moving to -1, it becomes 3. For 2, it grows to 5. For 1, it grows to 6 (global max becomes 6). After checking all numbers, the maximum contiguous sum found is 6.";
  }

  if (title === 'valid parentheses') {
    return "Let's trace the matching logic using string ()[]{}. We read the brackets one by one: first we see '(', which is an opening bracket, so we place it on our stack. Next, we see ')', which is a closing bracket; since the top of the stack has '(', they match, and we pop it off. The stack is empty. Then we see '[', we push it. We see ']', it matches '[', we pop it. We see '{', we push it. We see '}', it matches '{', we pop it. At the end, our stack is completely empty, which confirms all brackets were correctly opened and closed.";
  }

  if (title === 'best time to buy and sell stock') {
    return "Let's dry run the stock profit tracker with prices [7, 1, 5, 3, 6, 4]. We track the lowest price seen so far (min_price) and the best profit. We initialize the lowest price to 7 and profit to 0. Next, we see 1; since 1 is lower than 7, we update our lowest price to 1. Next we see 5; selling today gives 5 - 1 = 4 profit, which becomes our best profit. Next we see 3; profit today is 2, which is less than 4. Next we see 6; selling today gives 6 - 1 = 5 profit, which becomes our new best profit. Finally we see 4; profit is 3. The maximum profit we can make is 5.";
  }

  if (title === 'contains duplicate') {
    return "Let's trace the duplicate check with array [1, 2, 3, 1]. We keep a set of numbers we have seen. First we see 1; not in set, so we add it. Next we see 2; not in set, so we add it. Next we see 3; not in set, so we add it. Finally we see 1 again; since 1 is already in our set, we immediately stop and return true because a duplicate has been found.";
  }

  const firstCase = problem?.visibleTestCases?.[0];
  const sampleIn = firstCase ? firstCase.input : 'N/A';
  const sampleOut = firstCase ? firstCase.output : 'N/A';
  
  if (tags.includes('linked')) {
    return `Let's dry run the solution with sample input: "${sampleIn.replace(/\n/g, ' | ')}". We initialize pointer variables and cross-link node paths. We iterate through the list node-by-node. Once we reach the end null boundary, we return the reordered head node, matching the verified output: "${sampleOut}".`;
  }

  if (tags.includes('search')) {
    return `Let's trace the binary search using sample input: "${sampleIn.replace(/\n/g, ' | ')}". We set our boundary indices low = 0 and high = N - 1. We compute the midpoint, compare the middle value with our target, and discard half of the array space accordingly. We repeat this cycle until the target is found, returning the matching index: "${sampleOut}".`;
  }

  return `Let's dry run the solution using the sample input: "${sampleIn.replace(/\n/g, ' | ')}". We read the input variables, initialize our local state parameters, and run the main iteration loops. We evaluate the conditions step-by-step and produce the verified output: "${sampleOut}".`;
};

const ProblemPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('testcase');
  const [notes, setNotes] = useState('');
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [descCollapsed, setDescCollapsed] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  let { problemId } = useParams();
  const [copiedStates, setCopiedStates] = useState({});

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedStates((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const { handleSubmit } = useForm();

  const handleSubscribe = async () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    try {
      const { data } = await axiosClient.post('/payment/create-order');
      const { orderId, keyId, amount, currency } = data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'AlgoBench',
        description: 'Premium Subscription Upgrade',
        order_id: orderId,
        handler: async (response) => {
          try {
            await dispatch(subscribeUser({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })).unwrap();
            setShowPremiumModal(false);
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert(err.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user ? user.firstName : '',
          email: user ? user.emailId : '',
        },
        theme: {
          color: '#D4AF37',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Order creation failed:', error);
      alert(error.response?.data?.message || error.message || 'Failed to initialize payment');
    }
  };

  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const [consoleHeight, setConsoleHeight] = useState(350); // default height in pixels
  const [isConsoleDragging, setIsConsoleDragging] = useState(false);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
  };

  const handleConsoleMouseDown = (e) => {
    e.preventDefault();
    setIsConsoleDragging(true);
  };

  const handleConsoleTouchStart = (e) => {
    setIsConsoleDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const newWidthPx = clientX - containerRect.left;
      let newWidthPercent = (newWidthPx / containerRect.width) * 100;
      
      // Limit size between 20% and 80% to keep usable layout
      if (newWidthPercent < 20) newWidthPercent = 20;
      if (newWidthPercent > 80) newWidthPercent = 80;
      
      setLeftWidth(newWidthPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  useEffect(() => {
    if (!isConsoleDragging) return;

    const handleMouseMove = (e) => {
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      let newHeight = containerRect.bottom - clientY;
      const minHeight = 100;
      const maxHeight = containerRect.height * 0.8;

      if (newHeight < minHeight) newHeight = minHeight;
      if (newHeight > maxHeight) newHeight = maxHeight;

      setConsoleHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsConsoleDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isConsoleDragging]);

  useEffect(() => {
    if (isConsoleDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isConsoleDragging]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        setCode(getBoilerplate(selectedLanguage));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axiosClient.get(`/note/${problemId}`);
        setNotes(response.data.notes || '');
        if (response.data.updatedAt) {
          setLastSaved(new Date(response.data.updatedAt));
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      }
    };
    if (isAuthenticated) {
      fetchNote();
    }
  }, [problemId, isAuthenticated]);

  const saveNote = async (content) => {
    setSaveStatus('saving');
    try {
      const response = await axiosClient.put(`/note/${problemId}`, { notes: content });
      setSaveStatus('saved');
      setLastSaved(new Date(response.data.updatedAt));
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
    }
  };

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNote(newNotes);
    }, 1000);
  };

  useEffect(() => {
    if (problem) {
      setCode(getBoilerplate(selectedLanguage));
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const highlightEditorLine = (lineNumber) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

    if (lineNumber > 0) {
      const model = editor.getModel();
      if (model) {
        const lineCount = model.getLineCount();
        if (lineNumber > lineCount) return;
      }
      decorationsRef.current = editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(lineNumber, 1, lineNumber, 1),
            options: {
              isWholeLine: true,
              className: 'editor-active-simulation-line',
              marginClassName: 'editor-active-simulation-margin'
            }
          }
        ]
      );
      editor.revealLineInCenterIfOutsideViewport(lineNumber);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setActiveTestCaseTab(0);
    setActiveRightTab('testcase');

    // JavaScript runs directly in the browser (instant, no server cost).
    // Falls back to the server if the code needs a module we can't shim.
    if (canRunInBrowser(selectedLanguage) && problem?.visibleTestCases?.length) {
      try {
        const local = await runJavaScriptLocally(code, problem.visibleTestCases);
        if (!local.unsupported) {
          setRunResult(local);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Browser execution failed, falling back to server:', e);
      }
    }

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error running code:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Run failed. Compiler may be unavailable.';
      setRunResult({
        success: false,
        error: msg,
        testCases: []
      });
      setLoading(false);
    }
  };

  // Submissions are judged asynchronously: the backend responds with a pending
  // submissionId immediately and we poll until the worker stores the verdict.
  const pollSubmissionResult = async (submissionId) => {
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const { data } = await axiosClient.get(`/submission/status/${submissionId}`);
      if (data.status !== 'pending') return data;
    }
    throw new Error('Judging is taking longer than expected. Please check back shortly.');
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setActiveRightTab('result');

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      let data = response.data;
      if (data?.status === 'pending' && data.submissionId) {
        data = await pollSubmissionResult(data.submissionId);
      }
      setSubmitResult(data);
      setLoading(false);
    } catch (error) {
      console.error('Error submitting code:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Submission failed.';
      setSubmitResult({ accepted: false, error: msg, passedTestCases: 0, totalTestCases: 0 });
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#9A9A9A';
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'rgba(34, 197, 94, 0.15)';
      case 'medium': return 'rgba(245, 158, 11, 0.15)';
      case 'hard': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
    }
  };

  const getDifficultyBorder = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'rgba(34, 197, 94, 0.3)';
      case 'medium': return 'rgba(245, 158, 11, 0.3)';
      case 'hard': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(148, 163, 184, 0.3)';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#0B0B0E' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-[#9A9A9A] font-mono">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen max-h-screen flex overflow-hidden problem-page-main-layout" style={{ backgroundColor: 'var(--bg-editorial)' }}>
      {/* Left Panel */}
      <div 
        className={`flex flex-col overflow-hidden left-panel-border ${isDragging ? '' : 'transition-[width] duration-300 ease-in-out'}`}
        style={{ 
          width: descCollapsed ? '0%' : `${leftWidth}%`,
          flexShrink: 0
        }}
      >
        {/* Left Tabs */}
        <div className="tab-header-fixed flex items-center">
          <Link 
            to="/problems" 
            title="Back to Problems"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#9A9A9A] hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 border border-white/[0.04] bg-white/[0.02] flex-shrink-0"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </Link>
          <div className="h-4 w-px bg-white/[0.08] mx-2 flex-shrink-0" />
          <div className="tabs-scroll-container">
            {['description', 'editorial', 'solutions', 'notes', 'discussion', 'visualize'].map((tab) => (
              <button
                key={tab}
                className={`panel-tab ${activeLeftTab === tab ? 'active' : ''}`}
                onClick={() => setActiveLeftTab(tab)}
              >
                {tab === 'discussion' ? 'Discussion' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-8 problem-page-container">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="tab-content-fade">
                  <div className="problem-header">
                    <h1 className="problem-title">{problem.title}</h1>
                    <div className="problem-meta-row">
                      <span className="meta-difficulty" style={{ color: getDifficultyColor(problem.difficulty) }}>
                        {problem.difficulty}
                      </span>
                      {problem.leetcodeLink && (
                        <>
                          <span className="meta-sep">/</span>
                          <a
                            href={problem.leetcodeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open the original problem on LeetCode"
                            className="meta-leetcode"
                          >
                            LeetCode <ChevronRight size={14} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {problem.problemType === 'catalog' && problem.leetcodeLink && (
                    <a
                      href={problem.leetcodeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="catalog-banner"
                    >
                      <span className="catalog-banner-text">
                        Interview catalog problem — full statement &amp; test cases are on LeetCode.
                      </span>
                      <span className="catalog-banner-cta">
                        Solve on LeetCode <ChevronRight size={14} />
                      </span>
                    </a>
                  )}

                  <div className="desc-body">
                    {renderDescription(problem.description, problem.title)}
                  </div>

                  {problem.topics?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="section-heading">Topics</h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {problem.topics.map((t) => (
                          <span key={t} className="tag-badge">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {problem.companies?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="section-heading">Asked At</h3>
                      {user?.isPremium ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {problem.companies.slice(0, 30).map((c) => (
                            <span key={c.name} className="tag-badge">{c.name}</span>
                          ))}
                        </div>
                      ) : (
                        <div 
                          className="mt-3 p-4 rounded border border-zinc-800 bg-zinc-950/50 flex items-center justify-between cursor-pointer hover:border-amber-500/30 transition-all"
                          onClick={() => {
                            setShowPremiumModal(true);
                          }}
                          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                        >
                          <div className="flex items-center gap-2">
                            <Lock size={14} style={{ color: '#fbbf24' }} />
                            <span className="text-sm font-mono text-zinc-400 uppercase tracking-wider">Asked at {problem.companies.length} Companies</span>
                          </div>
                          <span className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: '#fbbf24' }}>Unlock</span>
                        </div>
                      )}
                    </div>
                  )}

                  {problem.visibleTestCases?.length > 0 && (
                  <>
                  <div className="editorial-divider mt-8"></div>

                  <div className="mt-8">
                    <h3 className="section-heading">Examples</h3>
                    <div className="space-y-6">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="example-card">
                          <h4 className="example-title">Example {index + 1}</h4>
                          <div className="example-body">
                            <div className="example-row">
                              <span className="example-label">Input</span>
                              <span>{example.stdin || example.input}</span>
                            </div>
                            <div className="example-row">
                              <span className="example-label">Output</span>
                              <span>{example.stdout || example.output}</span>
                            </div>
                            {example.explanation && (
                              <div className="example-row">
                                <span className="example-label">Explanation</span>
                                <span className="opacity-80">{example.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </>
                  )}
                </div>
              )}

              {activeLeftTab === 'editorial' && (() => {
                const ed = getEditorialContent(problem);
                return (
                  <div className="editorial-container tab-content-fade">
                    <h1 className="editorial-header-creative">Optimal Strategy</h1>

                    <div className="editorial-content-rich">
                      <h3 className="editorial-section-title">The Approach: {ed.approachTitle}</h3>
                      <p className="editorial-text-block">
                        {ed.approachText}
                      </p>

                      <h3 className="editorial-section-title">Algorithmic Complexity</h3>
                      <p className="editorial-text-block">
                        {ed.complexityText}
                      </p>

                      <h3 className="editorial-section-title">Implementation Note</h3>
                      <p className="editorial-text-block">
                        {ed.noteText}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {activeLeftTab === 'solutions' && (
                <div className="tab-content-fade">
                  <h1 className="editorial-header-creative">Expert Solutions</h1>
                  {user?.isPremium ? (
                    problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                      <div className="solution-card-editorial">
                        {problem.referenceSolution.map((solution, index) => (
                          <div key={index} className="solution-card-section">
                            <div className="solution-card-header">
                              <h3 className="solution-card-title">
                                {solution?.language} Implementation
                              </h3>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(solution?.completeCode, index)}
                                className="copy-solution-btn"
                              >
                                {copiedStates[index] ? (
                                  <>
                                    <Check size={11} style={{ color: '#D4AF37' }} />
                                    <span>COPIED!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={11} />
                                    <span>COPY CODE</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="p-0">
                              <pre className="p-6 bg-transparent text-[#E8EDF2] font-mono text-sm leading-relaxed m-0 solution-code-block">
                                <code>{solution?.completeCode}</code>
                              </pre>
                            </div>
                            <div className="px-6 pb-6 border-t border-white/[0.04] pt-6">
                              <h4 className="text-[11px] font-heading font-bold tracking-widest text-[#D4AF37] uppercase mb-3" style={{ fontFamily: 'Unbounded' }}>
                                Detailed Dry Run Walkthrough
                              </h4>
                              <p className="font-sans text-[13px] leading-relaxed text-zinc-400 m-0">
                                {getDetailedDryRunText(problem)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="editorial-text-block opacity-60">Solutions will be available after you solve the problem.</p>
                    )
                  ) : (
                    <div 
                      className="mt-6 p-8 rounded border text-center flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/30 transition-all duration-300"
                      onClick={() => setShowPremiumModal(true)}
                      style={{ 
                        backgroundColor: '#06080C',
                        borderColor: 'rgba(255,255,255,0.05)',
                        minHeight: '260px'
                      }}
                    >
                      <Lock size={32} style={{ color: '#D4AF37' }} className="mb-4" />
                      <h3 className="text-base font-heading font-bold uppercase text-[#E8EDF2] tracking-wider mb-2" style={{ fontFamily: 'Unbounded' }}>
                        Premium Feature Lock
                      </h3>
                      <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
                        Access to optimal expert implementations in multiple programming languages is restricted to AlgoBench Pro members.
                      </p>
                      <button 
                        type="button"
                        className="px-6 py-2.5 text-xs font-mono uppercase tracking-widest font-bold text-black bg-[#D4AF37] hover:bg-[#FFE082] transition-colors rounded-none"
                      >
                        Unlock Pro Access
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'notes' && (
                <div className="tab-content-fade flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="editorial-header-creative m-0">Personal Notes</h1>
                  </div>
                  <div className="flex-1 min-h-[450px] relative group flex flex-col">
                    <textarea
                      placeholder="Brainstorm your approach, jot down edge cases, or save key insights here..."
                      className="notes-textarea relative z-10 flex-1 w-full"
                      value={notes}
                      onChange={handleNotesChange}
                      id="personal-notes-area"
                      style={{ height: '100%', minHeight: '450px' }}
                    />
                    {!notes && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-[#0F141B]/98 border border-white/[0.04] rounded-[4px] text-center backdrop-blur-sm transition-all duration-300">
                        <FileText size={32} className="text-[#D4AF37] mb-4 opacity-80" />
                        <h3 className="text-lg font-heading uppercase text-[#E8EDF2] mb-3" style={{ fontFamily: 'Unbounded', fontWeight: 900, letterSpacing: '-0.04em' }}>
                          Brainstorm & Analyze
                        </h3>
                        <p className="text-[11px] text-[#9A9A9A] max-w-sm mb-6 leading-relaxed">
                          Your thoughts are private and auto-saved. Start writing directly or select a quick template below to jumpstart your approach:
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                          <button
                            type="button"
                            onClick={() => {
                              const tmpl = `## Approach & Pseudocode\n\n1. **Initialization:** ...\n2. **Iteration / Logic:** ...\n3. **Termination / Return:** ...`;
                              setNotes(tmpl);
                              saveNote(tmpl);
                              setTimeout(() => document.getElementById('personal-notes-area')?.focus(), 50);
                            }}
                            className="flex flex-col items-center justify-center p-4 rounded border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:border-[#D4AF37]/40 transition-all duration-250 cursor-pointer"
                          >
                            <Cpu size={16} className="text-[#D4AF37] mb-2" />
                            <span className="text-[10px] font-heading font-bold text-[#E8EDF2] uppercase tracking-wider">Approach</span>
                            <span className="text-[9px] text-[#9A9A9A] mt-1 text-center">Pseudocode outline</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const tmpl = `## Complexity Analysis\n\n- **Time Complexity:** O( ) — because...\n- **Space Complexity:** O( ) — because...`;
                              setNotes(tmpl);
                              saveNote(tmpl);
                              setTimeout(() => document.getElementById('personal-notes-area')?.focus(), 50);
                            }}
                            className="flex flex-col items-center justify-center p-4 rounded border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:border-[#D4AF37]/40 transition-all duration-250 cursor-pointer"
                          >
                            <Layers size={16} className="text-[#D4AF37] mb-2" />
                            <span className="text-[10px] font-heading font-bold text-[#E8EDF2] uppercase tracking-wider">Complexity</span>
                            <span className="text-[9px] text-[#9A9A9A] mt-1 text-center">Big O calculation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const tmpl = `## Edge Cases\n\n- [ ] Empty / Null inputs\n- [ ] Single element / Array size 1\n- [ ] Integer overflow / Large bounds\n- [ ] Duplicate or negative values`;
                              setNotes(tmpl);
                              saveNote(tmpl);
                              setTimeout(() => document.getElementById('personal-notes-area')?.focus(), 50);
                            }}
                            className="flex flex-col items-center justify-center p-4 rounded border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:border-[#D4AF37]/40 transition-all duration-250 cursor-pointer"
                          >
                            <CheckCircle size={16} className="text-[#D4AF37] mb-2" />
                            <span className="text-[10px] font-heading font-bold text-[#E8EDF2] uppercase tracking-wider">Edge Cases</span>
                            <span className="text-[9px] text-[#9A9A9A] mt-1 text-center">Validation list</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setNotes(' ');
                            setTimeout(() => document.getElementById('personal-notes-area')?.focus(), 50);
                          }}
                          className="mt-6 text-[9px] font-display uppercase tracking-widest text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
                        >
                          Or Start with a Blank Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'discussion' && (
                <ProblemDiscussion
                  problemId={problemId}
                  problemTitle={problem?.title}
                  isAuthenticated={!!isAuthenticated}
                  currentUserId={user?._id}
                />
              )}

              {activeLeftTab === 'visualize' && (
                <InteractiveVisualizer 
                  problem={problem} 
                  code={code} 
                  language={selectedLanguage} 
                  onStepChange={highlightEditorLine} 
                  onLoadReferenceSolution={(refCode) => setCode(refCode)} 
                />
              )}
              <></>
            </>
          )}
        </div>
      </div>

      {!descCollapsed && (
        <div
          className={`resizer-divider ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      )}

      {/* Right Panel */}
      <div 
        className={`right-panel-fixed flex overflow-hidden ${isDragging ? '' : 'transition-[width] duration-300 ease-in-out'}`}
        style={{ flex: 1 }}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor Section */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ borderBottom: '1px solid var(--border-editorial)' }}>
            {/* Language Selector + Fullscreen Toggle */}
            <div
              className="flex justify-between items-center tab-header-fixed"
              style={{ position: 'relative', zIndex: 100 }}
            >
              <div className="language-selector-container">
                <button
                  className="language-toggle-btn"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                >
                  <span className="text-[#D4AF37] font-mono mr-2">{"< / >"}</span>
                  {langMap[selectedLanguage]}
                  <ChevronDown className={`ml-2 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="language-dropdown">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        className={`language-option ${selectedLanguage === lang ? 'active' : ''}`}
                        onClick={() => {
                          handleLanguageChange(lang);
                          setIsLanguageDropdownOpen(false);
                        }}
                      >
                        {langMap[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Centered Run / Submit */}
              <div
                className="flex gap-2 items-center editor-header-controls-container"
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
              >
                <button
                  className="console-btn console-btn-run console-btn-compact"
                  onClick={handleRun}
                  disabled={loading || problem?.problemType === 'catalog'}
                  title={problem?.problemType === 'catalog' ? "Execution disabled for catalog problems" : ""}
                >
                  {loading && activeRightTab === 'testcase' ? (
                    <>
                      <div className="console-spinner"></div>
                      Running
                    </>
                  ) : (
                    <>
                      <Play size={13} />
                      Run
                    </>
                  )}
                </button>

                <button
                  className="console-btn console-btn-submit console-btn-compact"
                  onClick={handleSubmitCode}
                  disabled={loading || problem?.problemType === 'catalog'}
                  title={problem?.problemType === 'catalog' ? "Submission disabled for catalog problems" : ""}
                >
                  {loading && activeRightTab === 'result' ? (
                    <>
                      <div className="console-spinner"></div>
                      Submitting
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Submit
                    </>
                  )}
                </button>
              </div>

              {/* Right: AI + collapse toggle */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  title="AI Chat"
                  className={`flex items-center justify-center p-1.5 transition-colors cursor-pointer outline-none bg-transparent border-none ${
                    isChatOpen ? 'text-[#D4AF37]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3c0 4.97-4.03 9-9 9 4.97 0 9 4.03 9 9 0-4.97 4.03-9 9-9-4.97 0-9-4.03-9-9Z" fill="currentColor"/>
                    <path d="M20 3c0 1.66-1.34 3-3 3 1.66 0 3 1.34 3 3 0-1.66 1.34-3 3-3-1.66 0-3-1.34-3-3Z" fill="currentColor" opacity="0.6"/>
                  </svg>
                </button>

                <button
                  onClick={() => setDescCollapsed(!descCollapsed)}
                  title={descCollapsed ? 'Show description' : 'Hide description (widen editor)'}
                  className="flex items-center justify-center p-1.5 transition-colors cursor-pointer outline-none bg-transparent border-none text-white/60 hover:text-white"
                >
                  {descCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 flex overflow-hidden editor-wrapper-fixed">
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    overviewRulerBorder: false,
                    scrollbar: {
                      vertical: 'auto',
                      horizontal: 'auto',
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6,
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Console-Style Bottom Panel Resizer */}
          {!isConsoleMinimized && (
            <div
              className={`console-resizer-divider ${isConsoleDragging ? 'dragging' : ''}`}
              onMouseDown={handleConsoleMouseDown}
              onTouchStart={handleConsoleTouchStart}
            />
          )}

          {/* Console-Style Bottom Panel */}
          <div
            className={`console-panel ${isConsoleMinimized ? 'minimized' : ''}`}
            style={{
              height: isConsoleMinimized ? '36px' : `${consoleHeight}px`,
              transition: isConsoleDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="console-tabs">
              <div className="flex h-full">
                {['testcase', 'result'].map((tab) => (
                  <button
                    key={tab}
                    className={`panel-tab ${activeRightTab === tab ? 'active' : ''}`}
                    onClick={() => {
                      setActiveRightTab(tab);
                      if (isConsoleMinimized) setIsConsoleMinimized(false);
                    }}
                  >
                    {tab === 'testcase' ? 'Test Cases' : 'Result'}
                  </button>
                ))}
              </div>
              <button
                className="console-toggle-btn"
                onClick={() => setIsConsoleMinimized(!isConsoleMinimized)}
                title={isConsoleMinimized ? "Maximize" : "Minimize"}
              >
                {isConsoleMinimized ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                )}
              </button>
            </div>

            {activeRightTab === 'testcase' && (
              <div className="console-content">
                <AnimatePresence mode="wait">
                  {runResult ? (
                    <motion.div
                      key="run-result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="result-header-clean animate-fade-in">
                        <div>
                          <h4 className={runResult.success ? 'result-title-run-success' : 'result-title-run-error'}>
                            {runResult.success ? 'All test cases passed!' : 'Test Failed'}
                          </h4>
                          <p className="result-subtitle-mono">
                            {(runResult.success ? 'Execution Successful' : 'Verification Failed')
                              + (runResult.engine === 'browser' ? ' · In Browser' : '')}
                          </p>
                        </div>

                        {runResult.success && (
                          <div className="result-stats-row">
                            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                              <Cpu size={13} className="text-green-400/80" />
                              <span>Runtime: <strong className="text-white font-semibold">{fmtTime(runResult.runtime)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                              <Layers size={13} className="text-green-400/80" />
                              <span>Memory: <strong className="text-white font-semibold">{fmtMem(runResult.memory)}</strong></span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Premium Tabbed Case Selector */}
                      <div className="flex flex-wrap gap-2 pb-2 border-b border-white/[0.04]">
                        {(runResult.testCases || []).map((tc, idx) => {
                          const isPassed = tc.status_id === 3;
                          const isSelected = activeTestCaseTab === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveTestCaseTab(idx)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wide border cursor-pointer transition-all duration-300 ${
                                isSelected
                                  ? isPassed
                                    ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                                    : 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(248,113,113,0.15)]'
                                  : 'bg-transparent text-white/50 border-white/[0.06] hover:text-white/80 hover:border-white/10'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-green-400' : 'bg-red-400'} ${isSelected ? 'animate-pulse' : ''}`} />
                              Case {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active TestCase Details */}
                      {runResult.testCases && runResult.testCases[activeTestCaseTab] && (() => {
                        const tc = runResult.testCases[activeTestCaseTab];
                        const isPassed = tc.status_id === 3;
                        return (
                          <motion.div
                            key={activeTestCaseTab}
                            className="premium-testcase-container"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Input box */}
                              <div className="premium-terminal-box">
                                <div className="premium-terminal-header">
                                  <span className="premium-terminal-title">INPUT</span>
                                </div>
                                <pre className="premium-terminal-content">{tc.stdin || 'No input'}</pre>
                              </div>

                              {/* Expected Output box */}
                              <div className="premium-terminal-box">
                                <div className="premium-terminal-header">
                                  <span className="premium-terminal-title">EXPECTED</span>
                                </div>
                                <pre className="premium-terminal-content">{tc.expected_output}</pre>
                              </div>

                              {/* Actual Output box */}
                              <div className="premium-terminal-box md:col-span-2">
                                <div className={`premium-terminal-header ${isPassed ? 'success' : 'error'}`}>
                                  <span className="premium-terminal-title">YOUR OUTPUT</span>
                                  <span className={`premium-terminal-badge ${isPassed ? 'success' : 'error'}`}>
                                    {isPassed ? 'Matches expected output' : 'Mismatch detected'}
                                  </span>
                                </div>
                                <pre className={`premium-terminal-content font-semibold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                                  {tc.stdout || (tc.compile_output ? tc.compile_output : 'No output')}
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="run-empty"
                      className="console-empty flex items-center justify-center h-full w-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="console-empty-text center-unique" style={{ textAlign: 'center', width: '100%' }}>
                        Ready to <span style={{ color: 'var(--accent-gold)' }}>Execute</span>
                        <p className="text-[10px] mt-2 opacity-40 normal-case tracking-normal">Click Run to test against sample cases</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="console-content">
                <AnimatePresence mode="wait">
                  {submitResult ? (
                    <motion.div
                      key="submit-result"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, type: "spring", damping: 20 }}
                    >
                      <div className="result-header-clean animate-fade-in">
                        <div>
                          <h4 className={submitResult.accepted ? 'result-title-accepted' : 'result-title-run-error'}>
                            {submitResult.accepted ? 'Accepted' : (submitResult.error || 'Wrong Answer')}
                          </h4>
                          <p className="result-subtitle-mono">
                            Final Evaluation Complete
                          </p>
                        </div>

                        <div className="result-stats-row">
                          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            <span>Verification: <strong className="text-white font-semibold">{submitResult.passedTestCases}/{submitResult.totalTestCases} Passed</strong></span>
                          </div>
                          {submitResult.accepted && (
                            <>
                              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                                <Cpu size={13} className="text-[#D4AF37]" />
                                <span>Runtime: <strong className="text-white font-semibold">{fmtTime(submitResult.runtime)}</strong></span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                                <Layers size={13} className="text-[#D4AF37]" />
                                <span>Memory: <strong className="text-white font-semibold">{fmtMem(submitResult.memory)}</strong></span>
                              </div>
                            </>
                          )}
                        </div>

                        {submitResult.totalTestCases > 0 && (
                          <div className="mt-6">
                            <h5 className="text-[11px] font-display uppercase tracking-widest text-white/40 mb-3">Verification Details</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Array.from({ length: submitResult.totalTestCases }).map((_, idx) => {
                                const isCasePassed = idx < (submitResult.passedTestCases || 0);
                                return (
                                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                    {isCasePassed ? (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400 w-4 h-4 flex-shrink-0">
                                        <path d="M20 6L9 17l-5-5" />
                                      </svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-400 w-4 h-4 flex-shrink-0">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                      </svg>
                                    )}
                                    <div className="font-mono text-xs text-white/80">
                                      Test Case {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <span className={`ml-auto text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                                      isCasePassed ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                                    }`}>
                                      {isCasePassed ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit-empty"
                      className="console-empty flex items-center justify-center h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="console-empty-text center-unique">
                        Final <span style={{ color: 'var(--accent-champagne)' }}>Submission</span>
                        <p className="text-[10px] mt-2 opacity-40 normal-case tracking-normal">Submit for full evaluation on the terminal</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>
        </div>

        {isChatOpen && (
          <div className="chat-ai-pop-card tab-content-fade flex flex-col">
            <div className="chat-ai-pop-card-header">
              <h3 className="section-heading m-0" style={{ fontSize: '0.9rem' }}>Chat AI</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-[#9A9A9A] hover:text-white transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>
            <div className="chat-ai-pop-card-content">
              <ChatAi problem={problem}></ChatAi>
            </div>
          </div>
        )}

        {showPremiumModal && (
          <div className="hp-premium-overlay" onClick={() => setShowPremiumModal(false)}>
            <div className="hp-premium-modal hp-premium-split-layout" onClick={(e) => e.stopPropagation()}>
              <button className="hp-premium-close" onClick={() => setShowPremiumModal(false)}>
                <X size={18} />
              </button>

              <div className="hp-premium-console-panel">
                <div className="hp-premium-console-hero">
                  <div className="hp-premium-console-crown">
                    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 8L40 28H32V8Z" fill="url(#crownGoldLight)" />
                      <path d="M32 8L24 28H32V8Z" fill="url(#crownGoldDark)" />
                      <path d="M32 18L35 24H29L32 18Z" fill="#FFF" opacity="0.9" />
                      <path d="M32 28L20 22L24 36H32V28Z" fill="url(#crownGoldDark)" opacity="0.9" />
                      <path d="M32 28L44 22L40 36H32V28Z" fill="url(#crownGoldLight)" opacity="0.9" />
                      <path d="M22 36L12 24L18 42H22V36Z" fill="url(#crownGoldDark)" />
                      <path d="M42 36L52 24L46 42H42V36Z" fill="url(#crownGoldLight)" />
                      <path d="M16 46H48V49H16V46Z" fill="url(#crownGoldBase)" />
                      <path d="M20 51H44V53H20V51Z" fill="url(#crownGoldBase)" opacity="0.6" />
                      <circle cx="32" cy="5" r="2" fill="#FFF" />
                      <circle cx="12" cy="22" r="1.5" fill="#D4AF37" />
                      <circle cx="52" cy="22" r="1.5" fill="#D4AF37" />
                      <defs>
                        <linearGradient id="crownGoldLight" x1="32" y1="8" x2="52" y2="42" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#FFF5D6" />
                          <stop offset="50%" stopColor="#F3C63F" />
                          <stop offset="100%" stopColor="#C68F12" />
                        </linearGradient>
                        <linearGradient id="crownGoldDark" x1="32" y1="8" x2="12" y2="42" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#FFE082" />
                          <stop offset="50%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#936709" />
                        </linearGradient>
                        <linearGradient id="crownGoldBase" x1="32" y1="46" x2="32" y2="53" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#FFE082" />
                          <stop offset="100%" stopColor="#684603" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="hp-premium-price-group">
                    <span className="hp-premium-currency">₹</span>
                    <span className="hp-premium-price">49</span>
                    <span className="hp-premium-period">/mo</span>
                  </div>
                  <p className="hp-premium-price-label">ALL-INCLUSIVE PRO ACCESS</p>
                </div>

                <div className="hp-premium-system-specs">
                  <div className="hp-spec-row">
                    <span>TERMINAL ID</span>
                    <span>AB-908-SECURE</span>
                  </div>
                  <div className="hp-spec-row">
                    <span>DATA LATENCY</span>
                    <span>&lt; 14MS</span>
                  </div>
                  <div className="hp-spec-row">
                    <span>ENCRYPTION</span>
                    <span>AES-256-GCM</span>
                  </div>
                </div>

                <button className="hp-premium-cta" onClick={handleSubscribe}>
                  <svg width="15" height="15" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '2px' }}>
                    <path d="M10 38H38V41H10V38Z" fill="currentColor" />
                    <path d="M14 34H34V36H14V34Z" fill="currentColor" opacity="0.8" />
                    <path d="M14 34L11 18L21 28L17 30L14 34Z" fill="currentColor" />
                    <path d="M34 34L37 18L27 28L31 30L34 34Z" fill="currentColor" />
                    <path d="M18 30L24 10L30 30H18Z" fill="currentColor" />
                    <circle cx="24" cy="5" r="2" fill="currentColor" />
                  </svg>
                  SUBSCRIBE NOW
                </button>

                <p className="hp-premium-note">₹49 billed monthly. Cancel instantly at any time.</p>
              </div>

              {/* Right Features Panel */}
              <div className="hp-premium-features-panel">
                <h3 className="hp-features-panel-title">SYSTEM MODULES</h3>
                <p className="hp-features-panel-desc">ELEVATE YOUR PREPARATION WITH ELITE-GRADE ANALYTICS AND FILTERS</p>

                <div className="hp-premium-features">
                  <div className="hp-premium-feature">
                    <div className="hp-premium-feature-content">
                      <strong className="hp-premium-feature-title">COMPANY RECRUITMENT FILTERS</strong>
                      <span className="hp-premium-feature-desc">Study corporate hiring patterns. Unlock premium filter databases for Google, Meta, Netflix, Amazon, Apple, and 50+ tier-1 tech firms.</span>
                    </div>
                  </div>

                  <div className="hp-premium-feature">
                    <div className="hp-premium-feature-content">
                      <div className="hp-premium-feature-title-row">
                        <strong className="hp-premium-feature-title">FREQUENCY & RECENCY SHIELD</strong>
                        <span className="hp-premium-feat-badge">HOT</span>
                      </div>
                      <span className="hp-premium-feature-desc">Access dynamic problem occurrence frequency. Learn which specific interview problems are trending across companies right now.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;
