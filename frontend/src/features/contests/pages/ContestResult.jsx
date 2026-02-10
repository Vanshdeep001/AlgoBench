import { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContestById, fetchMyAttempt, fetchLeaderboard } from '../contestsSlice';
import { Trophy, Award, Clock, Code } from 'lucide-react';
import UserDropdown from '../../../components/UserDropdown';

const style = { bg: '#0B0B0E', gold: '#D4AF37', muted: '#9A9A9A', border: '1px solid rgba(212, 175, 55, 0.1)' };

export default function ContestResult() {
  const { contestId } = useParams();
  const dispatch = useDispatch();
  const { current: contest, attempt, leaderboard } = useSelector((state) => state.contests);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!contestId) return;
    dispatch(fetchContestById(contestId));
    dispatch(fetchMyAttempt(contestId)).catch(() => {});
    dispatch(fetchLeaderboard(contestId));
  }, [contestId, dispatch]);

  const myRank = leaderboard?.find((r) => String(r.userId) === String(user?._id));
  const rank = myRank?.rank ?? '-';
  const score = attempt?.score ?? myRank?.score ?? 0;
  const endTime = attempt?.endTime ?? myRank?.endTime;

  return (
    <div className="min-h-screen font-sans text-[#EDEDED]" style={{ backgroundColor: style.bg }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[80px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.06)' }} />
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
            <Link to={`/contests/${contestId}`} className="text-sm font-medium hover:text-[#D4AF37] transition-colors" style={{ color: style.muted }}>← Back to contest</Link>
          </div>
          <UserDropdown user={user} />
        </div>
      </nav>

      <div className="relative z-10 pt-12 pb-20 px-4 container mx-auto max-w-2xl">
        <h1 className="text-2xl font-display font-bold text-white mb-2">{contest?.title} — Result</h1>
        <p className="text-sm font-mono mb-10" style={{ color: style.muted }}>Your contest attempt summary</p>

        <div
          className="rounded-2xl p-8 mb-8"
          style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: style.border }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <Award size={32} style={{ color: style.gold }} />
              </div>
              <div className="text-3xl font-bold text-white">{rank}</div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: style.muted }}>Rank</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Trophy size={32} style={{ color: style.gold }} />
              </div>
              <div className="text-3xl font-bold text-white">{score}</div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: style.muted }}>Score</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Clock size={32} style={{ color: style.gold }} />
              </div>
              <div className="text-lg font-mono text-white">
                {endTime ? new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--'}
              </div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: style.muted }}>Finish time</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            to={`/contests/${contestId}/leaderboard`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', border: style.border, color: style.gold }}
          >
            <Trophy size={20} />
            View full leaderboard
          </Link>
          <Link
            to={`/contests/${contestId}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: style.border, color: '#EDEDED' }}
          >
            Contest overview
          </Link>
        </div>
      </div>
    </div>
  );
}
