import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import axiosClient from '../../../utils/axiosClient';
import { fetchContestById, fetchMyAttempt, fetchLeaderboard } from '../contestsSlice';
import { useContestTimer } from '../hooks/useContestTimer';
import { useContestSubmit } from '../hooks/useContestSubmit';
import ContestTimer from '../components/ContestTimer';
import ProblemNavigator from '../components/ProblemNavigator';
import SubmitPanel from '../components/SubmitPanel';
import { Code, Lock } from 'lucide-react';
import { clearSubmitResult, clearRunResult } from '../contestsSlice';

const langMap = { cpp: 'C++', java: 'Java', javascript: 'JavaScript' };
const style = { bg: '#0B0B0E', gold: '#D4AF37', muted: '#9A9A9A', border: '1px solid rgba(212, 175, 55, 0.1)' };

function getDifficultyColor(d) {
  if (!d) return '#9A9A9A';
  switch (d.toLowerCase()) {
    case 'easy': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'hard': return '#ef4444';
    default: return '#9A9A9A';
  }
}

export default function ContestArena() {
  const { contestId } = useParams();
  const [searchParams] = useSearchParams();
  const attemptIdFromUrl = searchParams.get('attempt');
  const problemIdFromUrl = searchParams.get('problem');

  const dispatch = useDispatch();
  const { current: contest, attempt } = useSelector((state) => state.contests);
  const { submitResult, runResult, loading, error } = useSelector((state) => state.contests);

  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [problemId, setProblemId] = useState(problemIdFromUrl || null);
  const editorRef = useRef(null);

  const { submit, run, submitResult: submitRes, runResult: runRes } = useContestSubmit(attemptIdFromUrl || attempt?._id, contestId);
  const displaySubmitResult = submitResult ?? submitRes;
  const displayRunResult = runResult ?? runRes;

  const { expired } = useContestTimer(attempt?.endTime);

  useEffect(() => {
    if (!contestId) return;
    dispatch(fetchContestById(contestId));
    dispatch(fetchMyAttempt(contestId)).catch(() => {});
  }, [contestId, dispatch]);

  const effectiveAttemptId = attemptIdFromUrl || attempt?._id;
  const isLocked = !attempt || attempt.status !== 'running' || expired;

  useEffect(() => {
    const ids = contest?.problems?.map((p) => p._id) || [];
    const first = ids[0];
    if (!problemId && first) setProblemId(first);
    if (problemIdFromUrl && ids.includes(problemIdFromUrl)) setProblemId(problemIdFromUrl);
  }, [contest?.problems, problemIdFromUrl]);

  useEffect(() => {
    if (!problemId) return;
    setProblemLoading(true);
    axiosClient
      .get(`/problem/problemById/${problemId}`)
      .then((res) => {
        setProblem(res.data);
        const lang = langMap[selectedLanguage];
        const start = res.data.startCode?.find((sc) => sc.language === lang);
        setCode(start?.initialCode || '');
      })
      .catch(() => setProblem(null))
      .finally(() => setProblemLoading(false));
  }, [problemId]);

  useEffect(() => {
    if (problem && selectedLanguage) {
      const start = problem.startCode?.find((sc) => sc.language === langMap[selectedLanguage]);
      if (start) setCode(start.initialCode || '');
    }
  }, [selectedLanguage, problem?._id]);

  useEffect(() => {
    dispatch(clearSubmitResult());
    dispatch(clearRunResult());
  }, [problemId, dispatch]);

  if (!contestId || !effectiveAttemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: style.bg }}>
        <p className="text-[#9A9A9A]">Invalid contest or attempt. <Link to="/contests" className="text-[#D4AF37]">Back to Contests</Link></p>
      </div>
    );
  }

  if (attempt && attempt.status !== 'running' && !expired) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: style.bg }}>
        <div className="text-center">
          <p className="text-[#EDEDED] mb-4">This attempt has ended.</p>
          <Link to={`/contests/${contestId}`} className="text-[#D4AF37] font-semibold">Back to Contest Overview</Link>
        </div>
      </div>
    );
  }

  const handleRun = () => {
    if (!problemId || !code || isLocked) return;
    run(problemId, code, selectedLanguage);
  };

  const handleSubmit = () => {
    if (!problemId || !code || isLocked) return;
    submit(problemId, code, selectedLanguage);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#EDEDED]" style={{ backgroundColor: style.bg }}>
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.15)', backgroundColor: 'rgba(11, 11, 14, 0.98)' }}>
        <div className="flex items-center gap-4">
          <Link to={`/contests/${contestId}`} className="flex items-center gap-2">
            <Code size={22} style={{ color: style.gold }} />
            <span className="font-display font-bold text-white">{contest?.title || 'Contest'}</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ContestTimer endTime={attempt?.endTime} onExpire={() => {}} />
          {isLocked && (
            <span className="flex items-center gap-2 text-sm text-red-400">
              <Lock size={16} /> Submissions locked
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-56 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(212, 175, 55, 0.1)', backgroundColor: 'rgba(15, 15, 20, 0.98)' }}>
          <ProblemNavigator
            problems={contest?.problems}
            contestId={contestId}
            attemptId={effectiveAttemptId}
            currentProblemId={problemId}
            problemStatus={{}}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
              {problemLoading && !problem && (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                </div>
              )}
              {problem && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-xl font-display font-bold text-white">{problem.title}</h1>
                    <span
                      className="px-2.5 py-1 rounded text-xs font-semibold"
                      style={{ color: getDifficultyColor(problem.difficulty), backgroundColor: `${getDifficultyColor(problem.difficulty)}20` }}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="prose max-w-none text-sm whitespace-pre-wrap mb-6" style={{ color: '#EDEDED' }}>
                    {problem.description}
                  </div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: style.gold }}>Examples</h3>
                  <div className="space-y-4 mb-6">
                    {problem.visibleTestCases?.map((ex, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: style.border }}
                      >
                        <div className="text-xs text-[#9A9A9A] mb-1">Input: {ex.input}</div>
                        <div className="text-xs text-[#9A9A9A]">Output: {ex.output}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-shrink-0 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.1)', backgroundColor: 'rgba(15, 15, 20, 0.98)' }}>
              <div className="h-64">
                <Editor
                  height="100%"
                  language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  onMount={(ed) => { editorRef.current = ed; }}
                  theme="vs-dark"
                  options={{
                    readOnly: isLocked,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
              <SubmitPanel
                language={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                onRun={handleRun}
                onSubmit={handleSubmit}
                loading={loading}
                runResult={displayRunResult}
                submitResult={displaySubmitResult}
                disabled={isLocked}
              />
            </div>
          </div>
        </main>
      </div>
      {error && <p className="text-sm text-red-400 px-4 py-2">{error}</p>}
    </div>
  );
}
