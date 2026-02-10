import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContestById, fetchMyAttempt, startContestAttempt, fetchLeaderboard } from '../contestsSlice';
import ContestTimer from '../components/ContestTimer';
import LeaderboardTable from '../components/LeaderboardTable';
import { Trophy, ListChecks, LayoutList, Play, Loader2, Code } from 'lucide-react';
import UserDropdown from '../../../components/UserDropdown';

const style = { bg: '#0B0B0E', gold: '#D4AF37', muted: '#9A9A9A', border: '1px solid rgba(212, 175, 55, 0.1)' };

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutList },
  { id: 'problems', label: 'Problems', icon: ListChecks },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function ContestDetails() {
  const { contestId } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useDispatch();
  const { current: contest, attempt, leaderboard, loading, error } = useSelector((state) => state.contests);
  const { user } = useSelector((state) => state.auth);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  useEffect(() => {
    if (!contestId) return;
    dispatch(fetchContestById(contestId));
    dispatch(fetchMyAttempt(contestId)).catch(() => {});
  }, [contestId, dispatch]);

  useEffect(() => {
    if (!contestId || activeTab !== 'leaderboard') return;
    dispatch(fetchLeaderboard(contestId));
    const interval = setInterval(() => dispatch(fetchLeaderboard(contestId)), 15000);
    return () => clearInterval(interval);
  }, [contestId, activeTab, dispatch]);

  const canStart = contest?.status === 'live' && !attempt && !loading;
  const hasAttempt = attempt && (attempt.status === 'running' || attempt.status === 'submitted' || attempt.status === 'expired');

  const handleStart = async () => {
    if (!canStart || !contestId) return;
    setStartError(null);
    setStarting(true);
    try {
      const newAttempt = await dispatch(startContestAttempt(contestId)).unwrap();
      window.location.href = `/contests/${contestId}/arena?attempt=${newAttempt._id}`;
    } catch (e) {
      setStartError(e || 'Failed to start');
    } finally {
      setStarting(false);
    }
  };

  if (!contest && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: style.bg }}>
        <p className="text-[#9A9A9A]">Contest not found.</p>
      </div>
    );
  }

  const startTime = contest?.startTime ? new Date(contest.startTime) : null;
  const endTime = contest?.endTime || (startTime && contest?.duration ? new Date(startTime.getTime() + contest.duration * 60 * 1000) : null);

  return (
    <div className="min-h-screen font-sans text-[#EDEDED]" style={{ backgroundColor: style.bg }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[80px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.06)' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <nav className="relative z-50 border-b py-4" style={{ borderColor: 'rgba(212, 175, 55, 0.1)', backgroundColor: 'rgba(11, 11, 14, 0.9)' }}>
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/problems" className="flex items-center gap-2">
              <div className="p-2 rounded-xl" style={{ backgroundColor: style.bg, border: style.border }}>
                <Code className="w-5 h-5" style={{ color: style.gold }} />
              </div>
              <span className="text-lg font-display font-bold text-white">AlgoBench</span>
            </Link>
            <NavLink to="/contests" className="text-sm font-medium" style={{ color: style.gold }}>Contests</NavLink>
            <NavLink to="/problems" className="text-sm font-medium hover:text-[#D4AF37] transition-colors" style={{ color: style.muted }}>Problems</NavLink>
          </div>
          <UserDropdown user={user} />
        </div>
      </nav>

      <div className="relative z-10 pt-8 pb-20 px-4 container mx-auto max-w-5xl">
        {loading && !contest && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
        )}

        {contest && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{contest.title}</h1>
                <p className="text-sm font-mono" style={{ color: style.muted }}>
                  Starts {startTime?.toLocaleString()} · Duration {contest.duration} min
                </p>
              </div>
              <div className="flex items-center gap-3">
                {contest.status === 'live' && (
                  <ContestTimer endTime={endTime} compact />
                )}
                {contest.status === 'upcoming' && endTime && (
                  <ContestTimer endTime={startTime} compact />
                )}
                {canStart && (
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#22c55e' }}
                  >
                    {starting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                    Start Contest
                  </button>
                )}
                {hasAttempt && attempt?.status === 'running' && (
                  <Link
                    to={`/contests/${contestId}/arena?attempt=${attempt._id}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold"
                    style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', border: style.border, color: style.gold }}
                  >
                    Enter Arena
                  </Link>
                )}
                {hasAttempt && (attempt?.status === 'submitted' || attempt?.status === 'expired') && (
                  <Link
                    to={`/contests/${contestId}/result`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold"
                    style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', border: style.border, color: style.gold }}
                  >
                    View Result
                  </Link>
                )}
              </div>
            </div>

            {startError && <p className="text-sm text-red-400 mb-4">{startError}</p>}
            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

            <div className="flex gap-1 mb-6" style={{ borderBottom: style.border }}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px"
                  style={{
                    color: activeTab === id ? style.gold : style.muted,
                    borderColor: activeTab === id ? style.gold : 'transparent',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={18} />
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                {contest.description && (
                  <p className="whitespace-pre-wrap text-sm mb-6" style={{ color: '#EDEDED' }}>{contest.description}</p>
                )}
                <p className="text-sm" style={{ color: style.muted }}>
                  {contest.problems?.length || 0} problems · First accepted = full score (100 per problem). No penalty for wrong submissions.
                </p>
              </div>
            )}

            {activeTab === 'problems' && (
              <ul className="space-y-2">
                {contest.problems?.map((p, i) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between rounded-lg px-4 py-3"
                    style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: style.border }}
                  >
                    <span className="font-mono text-sm" style={{ color: style.muted }}>{i + 1}.</span>
                    <span className="flex-1 mx-4 text-white font-medium">{p.title}</span>
                    <span className="text-xs px-2 py-1 rounded" style={{ color: '#9A9A9A', backgroundColor: 'rgba(148,163,184,0.15)' }}>{p.difficulty}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardTable leaderboard={leaderboard} currentUserId={user?._id} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
