import { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContestById, fetchLeaderboard } from '../contestsSlice';
import LeaderboardTable from '../components/LeaderboardTable';
import { Trophy } from 'lucide-react';
import UserDropdown from '../../../components/UserDropdown';

const style = { bg: '#0B0B0E', gold: '#D4AF37', muted: '#9A9A9A', border: '1px solid rgba(212, 175, 55, 0.1)' };

export default function ContestLeaderboard() {
  const { contestId } = useParams();
  const dispatch = useDispatch();
  const { current: contest, leaderboard, loading } = useSelector((state) => state.contests);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!contestId) return;
    dispatch(fetchContestById(contestId));
    dispatch(fetchLeaderboard(contestId));
    const interval = setInterval(() => dispatch(fetchLeaderboard(contestId)), 15000);
    return () => clearInterval(interval);
  }, [contestId, dispatch]);

  return (
    <div className="min-h-screen font-sans text-[#EDEDED]" style={{ backgroundColor: style.bg }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[80px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.06)' }} />
      </div>

      <nav className="relative z-50 border-b py-4" style={{ borderColor: 'rgba(212, 175, 55, 0.1)', backgroundColor: 'rgba(11, 11, 14, 0.9)' }}>
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/problems" className="flex items-center gap-2.5">
              <img src="/algobench_logo_2_no_text.png?v=4" alt="AlgoBench" className="w-[18px] h-[18px] object-contain" />
              <span className="text-lg md:text-xl font-logo font-bold tracking-[0.03em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AlgoBench</span>
            </Link>
            <Link to={`/contests/${contestId}`} className="text-sm font-medium hover:text-[#D4AF37] transition-colors" style={{ color: style.muted }}>
              ← Back to contest
            </Link>
          </div>
          <UserDropdown user={user} />
        </div>
      </nav>

      <div className="relative z-10 pt-8 pb-20 px-4 container mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-6 pl-4 border-l-2" style={{ borderColor: style.gold }}>
          <Trophy size={28} style={{ color: style.gold }} />
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Leaderboard {contest?.title && `· ${contest.title}`}
            </h1>
            <p className="text-sm font-mono" style={{ color: style.muted }}>Updates every 15 seconds</p>
          </div>
        </div>

        {loading && !leaderboard?.length && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
        )}

        <LeaderboardTable leaderboard={leaderboard} currentUserId={user?._id} />
      </div>
    </div>
  );
}
