import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { Code, Search, Trophy, TrendingUp, Target, CheckCircle2, Menu, X, Zap, BookOpen, BarChart3 } from 'lucide-react';
import UserDropdown from '../components/UserDropdown';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || solvedProblems.some(sp => sp._id === problem._id);
    const searchMatch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const stats = {
    totalSolved: solvedProblems.length,
    totalProblems: problems.length,
    accuracy: problems.length > 0 ? Math.round((solvedProblems.length / problems.length) * 100) : 0
  };

  return (
    <div className="min-h-screen font-sans text-[#EDEDED] selection:bg-[#D4AF37]/30" style={{ backgroundColor: '#0B0B0E' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px] animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }}></div>
        <div className="absolute top-[40%] right-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full blur-[80px] md:blur-[128px] animate-pulse delay-1000" style={{ backgroundColor: 'rgba(184, 150, 46, 0.06)' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
        <div className="container mx-auto px-4">
          <div className={`mx-auto max-w-7xl rounded-full backdrop-blur-md transition-all duration-300`} style={{ border: `1px solid rgba(255,255,255,${scrolled ? '0.1' : '0.08'})`, backgroundColor: scrolled ? 'rgba(11, 11, 14, 0.8)' : 'transparent', boxShadow: scrolled ? '0 10px 40px -10px rgba(212, 175, 55, 0.1)' : 'none', padding: scrolled ? '0.75rem 1.5rem' : '0.5rem 1rem' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#0B0B0E', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Code className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>
                <span className="text-lg md:text-xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  AlgoBench
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#9A9A9A' }}>
                <NavLink to="/problems" className="text-white transition-colors">Problems</NavLink>
                <NavLink to="/visualizer" className="hover:text-white transition-colors">Visualizer</NavLink>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <UserDropdown user={user} />
              </div>

              {/* Mobile Menu Toggle */}
              <button className="md:hidden p-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 backdrop-blur-xl md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} style={{ backgroundColor: 'rgba(11, 11, 14, 0.95)' }}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
          <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-white">Problems</NavLink>
          <NavLink to="/visualizer" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Visualizer</NavLink>
          <div className="w-16 h-px my-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-xl font-medium text-slate-300 hover:text-white">Logout</button>
          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Admin</NavLink>}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #FFFFFF, #D4AF37)' }}>
                Practice Problems
              </span>
            </h1>
            <p className="text-lg font-mono" style={{ color: '#9A9A9A' }}>
              Master algorithms one problem at a time
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard icon={<Trophy className="w-6 h-6" style={{ color: '#D4AF37' }} />} label="Problems Solved" value={`${stats.totalSolved}/${stats.totalProblems}`} />
            <StatsCard icon={<Target className="w-6 h-6" style={{ color: '#B8962E' }} />} label="Completion Rate" value={`${stats.accuracy}%`} />
            <StatsCard icon={<TrendingUp className="w-6 h-6" style={{ color: '#D4AF37' }} />} label="Keep Going!" value="🔥" />
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9A9A9A' }} />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 font-mono"
                style={{
                  backgroundColor: 'rgba(20, 20, 25, 0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <select
                className="px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 hover:border-[#D4AF37]"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{
                  backgroundColor: 'rgba(20, 20, 25, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#EDEDED',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  minWidth: '160px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                }}
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved</option>
              </select>

              {/* Difficulty Filter */}
              <select
                className="px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 hover:border-[#D4AF37]"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                style={{
                  backgroundColor: 'rgba(20, 20, 25, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#EDEDED',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  minWidth: '180px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                }}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Tag Filter */}
              <select
                className="px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 hover:border-[#D4AF37]"
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                style={{
                  backgroundColor: 'rgba(20, 20, 25, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#EDEDED',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  minWidth: '160px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                }}
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
            </div>
          </div>

          {/* Problems Table */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            {filteredProblems.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#9A9A9A' }} />
                <p className="text-xl font-mono" style={{ color: '#9A9A9A' }}>No problems found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <th className="text-left px-6 py-4 text-sm font-mono font-semibold" style={{ color: '#9A9A9A' }}>Title</th>
                      <th className="text-left px-6 py-4 text-sm font-mono font-semibold" style={{ color: '#9A9A9A' }}>Difficulty</th>
                      <th className="text-left px-6 py-4 text-sm font-mono font-semibold" style={{ color: '#9A9A9A' }}>Tag</th>
                      <th className="text-left px-6 py-4 text-sm font-mono font-semibold" style={{ color: '#9A9A9A' }}>Acceptance</th>
                      <th className="text-left px-6 py-4 text-sm font-mono font-semibold" style={{ color: '#9A9A9A' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((problem, index) => (
                      <ProblemRow
                        key={problem._id}
                        problem={problem}
                        isSolved={solvedProblems.some(sp => sp._id === problem._id)}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatsCard = ({ icon, label, value }) => {
  return (
    <div
      className="group relative p-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 150, 46, 0.05) 100%)',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)'
        }}
      ></div>

      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-mono mb-1" style={{ color: '#9A9A9A' }}>{label}</div>
          <div className="text-2xl font-display font-bold text-white">{value}</div>
        </div>
      </div>
    </div>
  );
};

const ProblemRow = ({ problem, isSolved, index }) => {
  return (
    <tr
      className="border-b transition-colors duration-200"
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
    >
      {/* Title */}
      <td className="px-6 py-4">
        <NavLink
          to={`/problem/${problem._id}`}
          className="text-base font-display font-semibold text-white hover:text-[#D4AF37] transition-colors"
        >
          {problem.title}
        </NavLink>
      </td>

      {/* Difficulty */}
      <td className="px-6 py-4">
        <span className={`text-base font-display font-semibold ${getDifficultyStyle(problem.difficulty)}`}>
          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
        </span>
      </td>

      {/* Tag */}
      <td className="px-6 py-4">
        <span className="text-base font-display font-semibold text-white">
          {problem.tags.charAt(0).toUpperCase() + problem.tags.slice(1)}
        </span>
      </td>

      {/* Acceptance Rate */}
      <td className="px-6 py-4">
        <span className="text-base font-display font-semibold text-white">
          {problem.acceptanceRate || 0.0}%
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        {isSolved && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
            <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Solved</span>
          </div>
        )}
      </td>
    </tr>
  );
};

const getDifficultyStyle = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-[#22c55e]';
    case 'medium':
      return 'text-[#f59e0b]';
    case 'hard':
      return 'text-[#ef4444]';
    default:
      return 'text-slate-400';
  }
};

const getDifficultyBgStyle = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'rgba(34, 197, 94, 0.15)';
    case 'medium':
      return 'rgba(245, 158, 11, 0.15)';
    case 'hard':
      return 'rgba(239, 68, 68, 0.15)';
    default:
      return 'rgba(148, 163, 184, 0.15)';
  }
};

const getDifficultyBorderStyle = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'rgba(34, 197, 94, 0.3)';
    case 'medium':
      return 'rgba(245, 158, 11, 0.3)';
    case 'hard':
      return 'rgba(239, 68, 68, 0.3)';
    default:
      return 'rgba(148, 163, 184, 0.3)';
  }
};

export default Homepage;