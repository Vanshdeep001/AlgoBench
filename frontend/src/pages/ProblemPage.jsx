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
import { Code, Play, Send, CheckCircle, XCircle, Clock, Database } from 'lucide-react';

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
  const [activeRightTab, setActiveRightTab] = useState('code');
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

  // Update code when language changes
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

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');

    } catch (error) {
      console.error('Error running code:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Run failed. Compiler may be unavailable.';
      setRunResult({
        success: false,
        error: msg,
        testCases: []
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');

    } catch (error) {
      console.error('Error submitting code:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Submission failed.';
      setSubmitResult({ accepted: false, error: msg, passedTestCases: 0, totalTestCases: 0 });
      setLoading(false);
      setActiveRightTab('result');
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
    <div className="min-h-screen max-h-screen flex overflow-hidden" style={{ backgroundColor: '#0B0B0E' }}>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(212, 175, 55, 0.1)' }}>
        {/* Left Tabs */}
        <div className="flex gap-1 px-4 py-3" style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          {['description', 'editorial', 'solutions', 'submissions', 'discussion', 'chatAI'].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: activeLeftTab === tab ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeLeftTab === tab ? '#D4AF37' : '#9A9A9A',
                border: activeLeftTab === tab ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent'
              }}
              onClick={() => setActiveLeftTab(tab)}
              onMouseEnter={(e) => {
                if (activeLeftTab !== tab) {
                  e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                  e.target.style.color = '#D4AF37';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftTab !== tab) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9A9A9A';
                }
              }}
            >
              {tab === 'chatAI' ? 'Chat AI' : tab === 'discussion' ? 'Discussion' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#0B0B0E' }}>
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-display font-bold text-white">{problem.title}</h1>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: getDifficultyBg(problem.difficulty),
                        border: `1px solid ${getDifficultyBorder(problem.difficulty)}`,
                        color: getDifficultyColor(problem.difficulty)
                      }}
                    >
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa'
                      }}
                    >
                      {problem.tags}
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#EDEDED' }}>
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-white">Examples:</h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.1)'
                          }}
                        >
                          <h4 className="font-semibold mb-2 text-[#D4AF37]">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm font-mono" style={{ color: '#EDEDED' }}>
                            <div><strong style={{ color: '#9A9A9A' }}>Input:</strong> {example.input}</div>
                            <div><strong style={{ color: '#9A9A9A' }}>Output:</strong> {example.output}</div>
                            <div><strong style={{ color: '#9A9A9A' }}>Explanation:</strong> {example.explanation}</div>
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

              {activeLeftTab === 'chatAI' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4 text-white">CHAT with AI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col overflow-hidden">
        {/* Right Tabs */}
        <div className="flex gap-1 px-4 py-3" style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          {['code', 'testcase', 'result'].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: activeRightTab === tab ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeRightTab === tab ? '#D4AF37' : '#9A9A9A',
                border: activeRightTab === tab ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent'
              }}
              onClick={() => setActiveRightTab(tab)}
              onMouseEnter={(e) => {
                if (activeRightTab !== tab) {
                  e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                  e.target.style.color = '#D4AF37';
                }
              }}
              onMouseLeave={(e) => {
                if (activeRightTab !== tab) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9A9A9A';
                }
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeRightTab === 'code' && (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Language Selector */}
              <div
                className="flex justify-between items-center p-4"
                style={{
                  borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                  backgroundColor: 'rgba(15, 15, 20, 0.5)'
                }}
              >
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                      style={{
                        backgroundColor: selectedLanguage === lang ? 'rgba(212, 175, 55, 0.2)' : 'rgba(20, 20, 25, 0.8)',
                        color: selectedLanguage === lang ? '#D4AF37' : '#EDEDED',
                        border: selectedLanguage === lang ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(212, 175, 55, 0.1)'
                      }}
                      onClick={() => handleLanguageChange(lang)}
                      onMouseEnter={(e) => {
                        if (selectedLanguage !== lang) {
                          e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedLanguage !== lang) {
                          e.target.style.backgroundColor = 'rgba(20, 20, 25, 0.8)';
                        }
                      }}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
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
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div
                className="p-4 flex justify-between"
                style={{
                  borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                  background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)'
                }}
              >
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: 'rgba(20, 20, 25, 0.8)',
                      color: '#9A9A9A',
                      border: '1px solid rgba(212, 175, 55, 0.1)'
                    }}
                    onClick={() => setActiveRightTab('testcase')}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                      e.target.style.color = '#D4AF37';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(20, 20, 25, 0.8)';
                      e.target.style.color = '#9A9A9A';
                    }}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: 'rgba(20, 20, 25, 0.8)',
                      color: '#EDEDED',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                    onClick={handleRun}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                        e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(20, 20, 25, 0.8)';
                      e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run
                      </>
                    )}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.2)',
                      color: '#D4AF37',
                      border: '1px solid rgba(212, 175, 55, 0.4)'
                    }}
                    onClick={handleSubmitCode}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
                        e.target.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: '#0B0B0E' }}>
              <h3 className="font-semibold mb-4 text-white">Test Results</h3>
              {runResult ? (
                <div
                  className="mb-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: runResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: runResult.success ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <div>
                    {runResult.success ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <h4 className="font-bold text-lg" style={{ color: '#22c55e' }}>All test cases passed!</h4>
                        </div>
                        <div className="flex gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" style={{ color: '#9A9A9A' }} />
                            <p className="text-sm" style={{ color: '#EDEDED' }}>Runtime: {runResult.runtime + " sec"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" style={{ color: '#9A9A9A' }} />
                            <p className="text-sm" style={{ color: '#EDEDED' }}>Memory: {runResult.memory + " KB"}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {(runResult.testCases || []).map((tc, i) => (
                            <div
                              key={i}
                              className="p-3 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                              }}
                            >
                              <div className="font-mono" style={{ color: '#EDEDED' }}>
                                <div><strong style={{ color: '#9A9A9A' }}>Input:</strong> {tc.stdin}</div>
                                <div><strong style={{ color: '#9A9A9A' }}>Expected:</strong> {tc.expected_output}</div>
                                <div><strong style={{ color: '#9A9A9A' }}>Output:</strong> {tc.stdout}</div>
                                <div style={{ color: '#22c55e' }}>
                                  ✓ Passed
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                          <h4 className="font-bold text-lg" style={{ color: '#ef4444' }}>Error</h4>
                        </div>
                        <div className="mt-4 space-y-2">
                          {(runResult.testCases || []).map((tc, i) => (
                            <div
                              key={i}
                              className="p-3 rounded text-xs"
                              style={{
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                border: `1px solid ${tc.status_id == 3 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                              }}
                            >
                              <div className="font-mono" style={{ color: '#EDEDED' }}>
                                <div><strong style={{ color: '#9A9A9A' }}>Input:</strong> {tc.stdin}</div>
                                <div><strong style={{ color: '#9A9A9A' }}>Expected:</strong> {tc.expected_output}</div>
                                <div><strong style={{ color: '#9A9A9A' }}>Output:</strong> {tc.stdout}</div>
                                <div style={{ color: tc.status_id == 3 ? '#22c55e' : '#ef4444' }}>
                                  {tc.status_id == 3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[#9A9A9A]">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: '#0B0B0E' }}>
              <h3 className="font-semibold mb-4 text-white">Submission Result</h3>
              {submitResult ? (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: submitResult.accepted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: submitResult.accepted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-6 h-6" style={{ color: '#22c55e' }} />
                          <h4 className="font-bold text-lg" style={{ color: '#22c55e' }}>🎉 Accepted</h4>
                        </div>
                        <div className="mt-4 space-y-2" style={{ color: '#EDEDED' }}>
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + "KB"} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <XCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
                          <h4 className="font-bold text-lg" style={{ color: '#ef4444' }}>❌ {submitResult.error}</h4>
                        </div>
                        <div className="mt-4 space-y-2" style={{ color: '#EDEDED' }}>
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[#9A9A9A]">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;