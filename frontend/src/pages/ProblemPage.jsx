import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import ProblemDiscussion from '../features/community/pages/ProblemDiscussion';
import { Play, Send, CheckCircle, XCircle, ChevronDown, MessageSquare, Sparkles } from 'lucide-react';
import '../styles/problem-page-fixes.css';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('testcase');
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setActiveRightTab('testcase');

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

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setActiveRightTab('result');

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
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
    <div className="min-h-screen max-h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-editorial)' }}>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col overflow-hidden left-panel-border">
        {/* Left Tabs */}
        <div className="tab-header-fixed gap-1">
          {['description', 'editorial', 'solutions', 'submissions', 'discussion'].map((tab) => (
            <button
              key={tab}
              className={`panel-tab ${activeLeftTab === tab ? 'active' : ''}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab === 'discussion' ? 'Discussion' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-8 problem-page-container">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="tab-content-fade">
                  <div className="flex items-center gap-6 mb-8">
                    <h1 className="problem-title m-0">{problem.title}</h1>
                    <div className="flex gap-3">
                      <div
                        className="difficulty-badge"
                        style={{
                          border: `1px solid ${getDifficultyColor(problem.difficulty)}`,
                          color: getDifficultyColor(problem.difficulty)
                        }}
                      >
                        {problem.difficulty}
                      </div>
                      <div className="tag-badge">
                        {problem.tags}
                      </div>
                    </div>
                  </div>

                  <div className="description-content">
                    <p className="mb-4">
                      Write a program that <strong className="text-[#D4AF37]">reads from stdin</strong>:
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                      <li>First line: <strong className="text-white">integer n</strong> (array size)</li>
                      <li>Second line: <strong className="text-white">n space-separated integers</strong></li>
                      <li>Third line: <strong className="text-white">integer target</strong></li>
                    </ul>
                    <p className="mb-8">
                      Print the <strong className="text-[#D4AF37]">0-based index</strong> of target in the array, or <strong className="text-red-400">-1</strong> if not found.
                    </p>

                    <h3 className="section-heading mt-8">Constraints</h3>
                    <div className="bg-white/5 p-4 rounded border border-white/5 font-mono text-sm mb-8">
                      <ul className="space-y-1">
                        <li>• 1 &lt;= n &lt;= 10<sup>5</sup></li>
                        <li>• -10<sup>9</sup> &lt;= array values and target &lt;= 10<sup>9</sup></li>
                      </ul>
                    </div>
                  </div>

                  <div className="editorial-divider"></div>

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
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4 text-white">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div
                        key={index}
                        className="rounded-lg overflow-hidden"
                        style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}
                      >
                        <div
                          className="px-4 py-3"
                          style={{
                            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                            borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
                          }}
                        >
                          <h3 className="font-semibold text-[#D4AF37]">{problem?.title} - {solution?.language}</h3>
                        </div>
                        <div className="p-4" style={{ backgroundColor: 'rgba(15, 15, 20, 0.5)' }}>
                          <pre
                            className="p-4 rounded text-sm overflow-x-auto"
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: '#EDEDED',
                              border: '1px solid rgba(212, 175, 55, 0.1)'
                            }}
                          >
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-[#9A9A9A]">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">My Submissions</h2>
                  <div className="text-[#9A9A9A]">
                    <SubmissionHistory problemId={problemId} />
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

              <></>
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className={`right-panel-fixed ${isEditorFullscreen ? 'fullscreen' : 'w-1/2'} flex overflow-hidden`}>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor Section */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ borderBottom: '1px solid var(--border-editorial)' }}>
            {/* Language Selector + Fullscreen Toggle */}
            <div
              className="justify-between items-center tab-header-fixed"
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

              <div className="flex gap-2">
                <button
                  className={`editor-fullscreen-btn ${isChatOpen ? 'active' : ''}`}
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  title="AI Chat"
                  style={{
                    borderColor: isChatOpen ? 'var(--accent-gold)' : 'var(--border-editorial)',
                    color: isChatOpen ? 'var(--accent-gold)' : 'var(--text-secondary)'
                  }}
                >
                  <Sparkles size={18} />
                </button>

                <button
                  className="editor-fullscreen-btn"
                  onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                  title={isEditorFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isEditorFullscreen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                  )}
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

          {/* Console-Style Bottom Panel */}
          <div className={`console-panel ${isConsoleMinimized ? 'minimized' : ''}`} style={{ height: isConsoleMinimized ? '48px' : '40vh' }}>
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
                {runResult ? (
                  <>
                    {runResult.success ? (
                      <div className="result-flat">
                        <div className="result-flat-header">
                          <CheckCircle className="result-flat-icon success" size={24} />
                          <h4 className="result-flat-title success">All test cases passed!</h4>
                        </div>
                        <div className="result-flat-stats">
                          <div className="result-flat-stat">
                            <div className="result-flat-stat-label">Runtime</div>
                            <div className="result-flat-stat-value">{runResult.runtime} sec</div>
                          </div>
                          <div className="result-flat-stat">
                            <div className="result-flat-stat-label">Memory</div>
                            <div className="result-flat-stat-value">{runResult.memory} KB</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="result-flat">
                        <div className="result-flat-header">
                          <XCircle className="result-flat-icon error" size={24} />
                          <h4 className="result-flat-title error">Test Failed</h4>
                        </div>
                      </div>
                    )}

                    {(runResult.testCases || []).map((tc, i) => (
                      <div key={i} className="testcase-flat">
                        <div className="testcase-flat-header">
                          <div className="testcase-flat-title">Test Case {i + 1}</div>
                          <div className={`testcase-flat-status ${tc.status_id === 3 ? 'passed' : 'failed'}`}>
                            {tc.status_id === 3 ? (
                              <>
                                <CheckCircle size={14} />
                                Passed
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                Failed
                              </>
                            )}
                          </div>
                        </div>
                        <div className="testcase-flat-body">
                          <div className="testcase-flat-row">
                            <span className="testcase-flat-label">Input:</span>
                            <span className="testcase-flat-value">{tc.stdin}</span>
                          </div>
                          <div className="testcase-flat-row">
                            <span className="testcase-flat-label">Expected:</span>
                            <span className="testcase-flat-value">{tc.expected_output}</span>
                          </div>
                          <div className="testcase-flat-row">
                            <span className="testcase-flat-label">Output:</span>
                            <span className="testcase-flat-value">{tc.stdout}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="console-empty flex items-center justify-center h-full">
                    <div className="console-empty-text center-unique">
                      Click <span style={{ color: 'var(--accent-gold)' }}>"Run"</span> to test your code with the example test cases.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="console-content">
                {submitResult ? (
                  <div className="result-flat">
                    <div className="result-flat-header">
                      {submitResult.accepted ? (
                        <CheckCircle className="result-flat-icon success" size={24} />
                      ) : (
                        <XCircle className="result-flat-icon error" size={24} />
                      )}
                      <h4 className={`result-flat-title ${submitResult.accepted ? 'success' : 'error'}`}>
                        {submitResult.accepted ? 'Accepted' : (submitResult.error || 'Wrong Answer')}
                      </h4>
                    </div>
                    <div className="result-flat-stats">
                      <div className="result-flat-stat">
                        <div className="result-flat-stat-label">Test Cases</div>
                        <div className="result-flat-stat-value">
                          {submitResult.passedTestCases}/{submitResult.totalTestCases}
                        </div>
                      </div>
                      {submitResult.accepted && (
                        <>
                          <div className="result-flat-stat">
                            <div className="result-flat-stat-label">Runtime</div>
                            <div className="result-flat-stat-value">{submitResult.runtime} sec</div>
                          </div>
                          <div className="result-flat-stat">
                            <div className="result-flat-stat-label">Memory</div>
                            <div className="result-flat-stat-value">{submitResult.memory} KB</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="console-empty flex items-center justify-center h-full">
                    <div className="console-empty-text center-unique">
                      Click <span style={{ color: 'var(--accent-champagne)' }}>"Submit"</span> to submit your solution for evaluation.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Console Action Buttons */}
            <div className="console-actions">
              <button
                className="console-btn console-btn-run"
                onClick={handleRun}
                disabled={loading}
              >
                {loading && activeRightTab === 'testcase' ? (
                  <>
                    <div className="console-spinner"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run
                  </>
                )}
              </button>
              <button
                className="console-btn console-btn-submit"
                onClick={handleSubmitCode}
                disabled={loading}
              >
                {loading && activeRightTab === 'result' ? (
                  <>
                    <div className="console-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit
                  </>
                )}
              </button>
            </div>
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
      </div>
    </div>
  );
};

export default ProblemPage;
