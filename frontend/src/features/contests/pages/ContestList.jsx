import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContests } from '../contestsSlice';
import { Trophy, Clock, Calendar, ChevronRight, Code } from 'lucide-react';
import UserDropdown from '../../../components/UserDropdown';

const style = {
  bg: '#0B0B0E',
  gold: '#D4AF37',
  muted: '#9A9A9A',
  border: '1px solid rgba(212, 175, 55, 0.1)',
};

function StatusBadge({ status }) {
  const map = {
    upcoming: { label: 'UPCOMING', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    live: { label: 'LIVE', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
    finished: { label: 'ENDED', color: '#9A9A9A', bg: 'rgba(148, 163, 184, 0.15)' },
  };
  const s = map[status] || map.finished;
  return (
    <span
      className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
      style={{ color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}40` }}
    >
      {s.label}
    </span>
  );
}

export default function ContestList() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.contests);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchContests());
  }, [dispatch]);

  const upcoming = list.filter((c) => c.status === 'upcoming');
  const live = list.filter((c) => c.status === 'live');
  const finished = list.filter((c) => c.status === 'finished');

  const sections = [
    { key: 'live', title: 'Live', contests: live },
    { key: 'upcoming', title: 'Upcoming', contests: upcoming },
    { key: 'finished', title: 'Finished', contests: finished },
  ];

  return (
    <div className="min-h-screen font-sans text-[#EDEDED]" style={{ backgroundColor: style.bg }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px] animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
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
            <NavLink to="/problems" className="text-sm font-medium hover:text-[#D4AF37] transition-colors" style={{ color: style.muted }}>Problems</NavLink>
            <NavLink to="/contests" className="text-sm font-semibold" style={{ color: style.gold }}>Contests</NavLink>
            <NavLink to="/community" className="text-sm font-medium hover:text-[#D4AF37] transition-colors" style={{ color: style.muted }}>Community</NavLink>
          </div>
          <UserDropdown user={user} />
        </div>
      </nav>

      <div className="relative z-10 pt-12 pb-20 px-4 container mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2" style={{ backgroundImage: 'linear-gradient(to right, #FFFFFF, #D4AF37)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Coding Contests
          </h1>
          <p className="font-mono text-sm" style={{ color: style.muted }}>Compete in timed contests with a live leaderboard</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-10">
            {sections.map(({ key, title, contests }) => (
              <section key={key}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: style.gold }}>
                  {key === 'live' && <Trophy size={20} />}
                  {key === 'upcoming' && <Clock size={20} />}
                  {key === 'finished' && <Calendar size={20} />}
                  {title}
                </h2>
                {contests.length === 0 ? (
                  <p className="text-sm py-4" style={{ color: style.muted }}>No contests in this section.</p>
                ) : (
                  <ul className="space-y-4">
                    {contests.map((c) => (
                      <li key={c._id}>
                        <Link
                          to={`/contests/${c._id}`}
                          className="block rounded-xl p-5 transition-all hover:border-[#D4AF37]/30"
                          style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: style.border }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-2">
                                <h3 className="text-lg font-semibold text-white truncate">{c.title}</h3>
                                <StatusBadge status={c.status} />
                              </div>
                              {c.description && (
                                <p className="text-sm mb-2 line-clamp-2" style={{ color: style.muted }}>{c.description}</p>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs font-mono" style={{ color: style.muted }}>
                                <span>Start: {new Date(c.startTime).toLocaleString()}</span>
                                <span>Duration: {c.duration} min</span>
                                <span>{c.problems?.length || 0} problems</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: style.gold }} />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
