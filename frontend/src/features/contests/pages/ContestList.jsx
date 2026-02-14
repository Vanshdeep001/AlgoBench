import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContests } from '../contestsSlice';
import { Trophy, Clock, Calendar, ChevronRight, Code, Menu, X } from 'lucide-react';
import UserDropdown from '../../../components/UserDropdown';

const style = {
  bg: '#0B0B0E',
  gold: '#D4AF37',
  muted: '#9A9A9A',
  border: '1px solid rgba(212, 175, 55, 0.12)',
};

function StatusBadge({ status }) {
  const map = {
    upcoming: { label: 'Upcoming', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
    live: { label: 'Live', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
    finished: { label: 'Ended', color: '#9A9A9A', bg: 'rgba(148, 163, 184, 0.12)' },
  };
  const s = map[status] || map.finished;
  return (
    <span
      className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider"
      style={{ color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}50` }}
    >
      {s.label}
    </span>
  );
}

export default function ContestList() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.contests);
  const { user } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchContests());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const upcoming = list.filter((c) => c.status === 'upcoming');
  const live = list.filter((c) => c.status === 'live');
  const finished = list.filter((c) => c.status === 'finished');

  const sections = [
    { key: 'live', title: 'Live now', icon: Trophy, contests: live },
    { key: 'upcoming', title: 'Upcoming', icon: Clock, contests: upcoming },
    { key: 'finished', title: 'Finished', icon: Calendar, contests: finished },
  ];

  return (
    <div className="min-h-screen font-sans text-[#EDEDED] selection:bg-[#D4AF37]/30" style={{ backgroundColor: style.bg }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px] animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }} />
        <div className="absolute top-[40%] right-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full blur-[80px] md:blur-[128px] animate-pulse" style={{ backgroundColor: 'rgba(184, 150, 46, 0.06)' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* Navbar - pill style to match Homepage */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
        <div className="container mx-auto px-4">
          <div
            className="mx-auto max-w-7xl rounded-full backdrop-blur-md transition-all duration-300"
            style={{
              border: `1px solid rgba(255,255,255,${scrolled ? '0.1' : '0.08'})`,
              backgroundColor: scrolled ? 'rgba(11, 11, 14, 0.8)' : 'transparent',
              boxShadow: scrolled ? '0 10px 40px -10px rgba(212, 175, 55, 0.1)' : 'none',
              padding: scrolled ? '0.75rem 1.5rem' : '0.5rem 1rem',
            }}
          >
            <div className="flex items-center justify-between">
              <Link to="/problems" className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: style.bg, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Code className="w-5 h-5" style={{ color: style.gold }} />
                </div>
                <span className="text-lg md:text-xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AlgoBench</span>
              </Link>
              <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: style.muted }}>
                <NavLink to="/problems" className="hover:text-white transition-colors">Problems</NavLink>
                <NavLink to="/contests" className="text-white transition-colors">Contests</NavLink>
                <NavLink to="/community" className="hover:text-white transition-colors">Community</NavLink>
                <NavLink to="/visualizer" className="hover:text-white transition-colors">Visualizer</NavLink>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <UserDropdown user={user} />
              </div>
              <button className="md:hidden p-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 backdrop-blur-xl md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} style={{ backgroundColor: 'rgba(11, 11, 14, 0.95)' }}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
          <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Problems</NavLink>
          <NavLink to="/contests" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-white">Contests</NavLink>
          <NavLink to="/community" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Community</NavLink>
          <NavLink to="/visualizer" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Visualizer</NavLink>
          <div className="w-16 h-px my-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <UserDropdown user={user} />
        </div>
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 container mx-auto max-w-4xl">
        <div className="mb-14">
          <p className="text-sm font-mono uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(212, 175, 55, 0.9)' }}>
            Compete
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-5 tracking-tight">
            <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(120deg, #FFFFFF 0%, #E8E0C8 40%, #D4AF37 100%)' }}>
              Coding Contests
            </span>
          </h1>
          <p className="text-lg max-w-xl font-mono" style={{ color: style.muted }}>
            Compete in timed contests with a live leaderboard. Join live rounds or review past contests.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
            <span className="text-sm font-mono" style={{ color: style.muted }}>Loading contests...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-12">
            {sections.map(({ key, title, icon: Icon, contests }) => (
              <section key={key}>
                <h2 className="text-sm font-mono uppercase tracking-wider mb-5 flex items-center gap-3" style={{ color: style.gold }}>
                  <span className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    <Icon size={18} />
                  </span>
                  {title}
                </h2>
                {contests.length === 0 ? (
                  <div className="rounded-2xl py-12 px-6 text-center" style={{ backgroundColor: 'rgba(20, 20, 25, 0.6)', border: style.border }}>
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: style.muted }} />
                    <p className="text-sm font-mono" style={{ color: style.muted }}>No contests in this section.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {contests.map((c) => (
                      <li key={c._id}>
                        <Link
                          to={`/contests/${c._id}`}
                          className="group block rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(145deg, rgba(24, 24, 30, 0.95) 0%, rgba(18, 18, 24, 0.98) 100%)',
                            border: style.border,
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.02)',
                          }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent)' }} />
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-2">
                                <h3 className="text-lg font-display font-semibold text-white group-hover:text-[#D4AF37] transition-colors truncate">{c.title}</h3>
                                <StatusBadge status={c.status} />
                              </div>
                              {c.description && (
                                <p className="text-sm mb-4 line-clamp-2 font-mono" style={{ color: style.muted }}>{c.description}</p>
                              )}
                              <div className="flex flex-wrap gap-5 text-xs font-mono" style={{ color: style.muted }}>
                                <span>Start: {new Date(c.startTime).toLocaleString()}</span>
                                <span>Duration: {c.duration} min</span>
                                <span>{c.problems?.length || 0} problems</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" style={{ color: style.gold }} />
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
