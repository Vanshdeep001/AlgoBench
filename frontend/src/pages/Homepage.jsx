import { useEffect, useMemo, useState, useRef } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser, subscribeUser } from '../authSlice';
import { ExternalLink, Lock, Crown, X, ChevronDown } from 'lucide-react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';
import { DSA_PATTERNS } from '../data/dsaPatterns';
import '../styles/homepage-redesign.css';

const PAGE_SIZE = 500;

const ALLOWED_TOPICS = [
  { display: 'Arrays', value: 'Array' },
  { display: 'String', value: 'String' },
  { display: 'Binary Search', value: 'Binary Search' },
  { display: 'Linked List', value: 'Linked List' },
  { display: 'Stack', value: 'Stack' },
  { display: 'Queue', value: 'Queue' },
  { display: 'Tree', value: 'Tree' },
  { display: 'Graph', value: 'Graph' },
  { display: 'DP', value: 'Dynamic Programming' }
];

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    topic: 'all',
    status: 'all',
    type: 'solvable',
    company: 'all',
    pattern: 'all',
  });
  const [sortBy, setSortBy] = useState('default');
  const [selectedProblemCompanies, setSelectedProblemCompanies] = useState(null);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  const [isPatternDropdownOpen, setIsPatternDropdownOpen] = useState(false);
  const patternDropdownRef = useRef(null);

  // Fetch the company list once (for the dropdown)
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await axiosClient.get('/problem/companies');
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
      if (patternDropdownRef.current && !patternDropdownRef.current.contains(event.target)) {
        setIsPatternDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch problems. Company is filtered server-side (companies arrays aren't sent
  // to the client); everything else is filtered client-side below.
   useEffect(() => {
    const fetchProblems = async () => {
      setLoadingList(true);
      try {
        const params = {};
        if (filters.company !== 'all') params.company = filters.company;
        console.log('fetchProblems calling API with params:', params);
        const { data } = await axiosClient.get('/problem/getAllProblem', { params });
        console.log('fetchProblems received data length:', data?.length);
        setProblems(data || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setProblems([]);
      } finally {
        setLoadingList(false);
      }
    };
    fetchProblems();
  }, [filters.company]);

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data || []);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };
    if (user) fetchSolvedProblems();
  }, [user]);

  // Reset pagination whenever filters/search/sortBy change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, searchQuery, sortBy]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const handleSubscribe = async () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    try {
      // Step 1: Create a Razorpay Order on the backend
      const { data } = await axiosClient.post('/payment/create-order');
      const { orderId, keyId, amount, currency } = data;

      // Step 2: Open Razorpay checkout options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'AlgoBench',
        description: 'Premium Subscription Upgrade',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Step 3: Verify signature and update premium status
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

  const solvableSlugs = useMemo(() => {
    const set = new Set();
    problems.forEach((p) => {
      if (p.problemType !== 'catalog' && p.slug) {
        set.add(p.slug);
      }
    });
    return set;
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    console.log('--- PATTERN FILTER DIAGNOSIS ---');
    console.log('Current selected pattern filter:', filters.pattern);
    console.log('Total problems array length:', problems.length);
    if (problems.length > 0) {
      console.log('First 5 problems in state:', JSON.stringify(problems.slice(0, 5).map(p => ({ title: p.title, slug: p.slug }))));
    }
    console.log('Selected pattern slugs list:', JSON.stringify(DSA_PATTERNS[filters.pattern]));

    return problems.filter((problem) => {
      const isCatalog = problem.problemType === 'catalog';
      if (isCatalog && problem.slug && solvableSlugs.has(problem.slug)) {
        return false;
      }

      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;

      let topicMatch = false;
      if (filters.topic === 'all') {
        topicMatch = true;
      } else {
        const problemTopics = problem.topics || [];
        if (filters.topic === 'Tree') {
          topicMatch = problemTopics.includes('Tree') ||
            problemTopics.includes('Binary Tree') ||
            problemTopics.includes('Binary Search Tree');
        } else if (filters.topic === 'Graph') {
          topicMatch = problemTopics.includes('Graph') ||
            problemTopics.includes('Depth-First Search') ||
            problemTopics.includes('Breadth-First Search');
        } else {
          topicMatch = problemTopics.includes(filters.topic);
        }
      }

      let typeMatch = false;
      if (filters.status === 'catalog') {
        typeMatch = isCatalog;
      } else if (filters.company !== 'all' || filters.pattern !== 'all') {
        typeMatch = true;
      } else {
        typeMatch =
          filters.type === 'all' ||
          (filters.type === 'solvable' && !isCatalog) ||
          (filters.type === 'catalog' && isCatalog);
      }

      let statusMatch = false;
      if (filters.status === 'all') {
        statusMatch = true;
      } else if (filters.status === 'solved') {
        statusMatch = solvedProblems.some((sp) => sp._id === problem._id);
      } else if (filters.status === 'catalog') {
        statusMatch = isCatalog;
      }

      let patternMatch = true;
      if (filters.pattern !== 'all') {
        const patternSlugs = DSA_PATTERNS[filters.pattern] || [];
        const slugLower = (problem.slug || '').toLowerCase();
        patternMatch = patternSlugs.includes(slugLower);
      }

      const searchMatch = problem.title.toLowerCase().includes(q);
      return difficultyMatch && topicMatch && typeMatch && statusMatch && searchMatch && patternMatch;
    });
  }, [problems, filters, searchQuery, solvedProblems]);

  const sortedAndFilteredProblems = useMemo(() => {
    let result = [...filteredProblems];
    if (sortBy === 'companies') {
      result.sort((a, b) => {
        const countA = a.companyCount || a.companies?.length || 0;
        const countB = b.companyCount || b.companies?.length || 0;
        return countB - countA;
      });
    }
    return result;
  }, [filteredProblems, sortBy]);

  const visibleProblems = sortedAndFilteredProblems.slice(0, visibleCount);

  const stats = {
    totalSolved: solvedProblems.length,
    totalProblems: problems.filter(p => p.problemType !== 'catalog' || !p.slug || !solvableSlugs.has(p.slug)).length,
    matching: sortedAndFilteredProblems.length,
  };

  return (
    <div className="hp-root">
      <div className="hp-hud-bg"></div>
      <SharedNavbar />

      <div className="hp-container">
        {/* Header Section */}
        <header className="hp-header">
          <h1 className="hp-title">
            <span>Practice</span>
            <span>& Progress</span>
          </h1>
          <p className="hp-description">
            Browse {stats.totalProblems.toLocaleString()} problems from the company-wise interview archive.
            Filter by company, topic and difficulty to isolate the exact set you want to drill.
          </p>
        </header>

        {/* Data Stream */}
        <div className="hp-data-stream">
          <div className="hp-stream-item">
            <span className="hp-stream-label">SOLVED</span>
            <span className="hp-stream-value">{stats.totalSolved}</span>
          </div>
          <div className="hp-stream-item">
            <span className="hp-stream-label">IN VIEW</span>
            <span className="hp-stream-value">{stats.matching.toLocaleString()}</span>
          </div>
          <div className="hp-stream-item">
            <span className="hp-stream-label">ARCHIVE</span>
            <span className="hp-stream-value">{stats.totalProblems.toLocaleString()}</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="hp-archive-controls">
          <div className="hp-search-container">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hp-search-input"
            />
          </div>

          <div className="hp-filter-bar">
            <select
              className="hp-filter-select"
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
            >
              <option value="all">All Topics</option>
              {ALLOWED_TOPICS.map((t) => (
                <option key={t.value} value={t.value}>{t.display}</option>
              ))}
            </select>

            <select
              className="hp-filter-select"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="hp-filter-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="catalog">Catalog</option>
            </select>

            {user?.isPremium ? (
              <div className="hp-premium-hud-bar">
                <div className="hp-hud-badge">
                  <Crown size={12} style={{ color: '#D4AF37' }} />
                </div>

                <div className="hp-hud-control">
                  <select
                    className="hp-hud-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Default Sort</option>
                    <option value="companies">Most Companies</option>
                  </select>
                </div>

                <div className="hp-hud-divider"></div>

                <div className="hp-hud-control" ref={companyDropdownRef}>
                  <button
                    type="button"
                    className="hp-hud-btn"
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  >
                    <span>{filters.company === 'all' ? 'Companies' : filters.company}</span>
                    <ChevronDown size={12} style={{ opacity: 0.7 }} />
                  </button>
                  {isCompanyDropdownOpen && (
                    <div className="hp-custom-dropdown-menu">
                      <div
                        className="hp-custom-dropdown-item"
                        onClick={() => {
                          setFilters({ ...filters, company: 'all' });
                          setIsCompanyDropdownOpen(false);
                        }}
                      >
                        Companies
                      </div>
                      {companies.map((c) => (
                        <div
                          key={c}
                          className="hp-custom-dropdown-item"
                          onClick={() => {
                            setFilters({ ...filters, company: c });
                            setIsCompanyDropdownOpen(false);
                          }}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hp-hud-divider"></div>

                <div className="hp-hud-control" ref={patternDropdownRef}>
                  <button
                    type="button"
                    className="hp-hud-btn"
                    onClick={() => setIsPatternDropdownOpen(!isPatternDropdownOpen)}
                  >
                    <span>{filters.pattern === 'all' ? 'Patterns' : filters.pattern}</span>
                    <ChevronDown size={12} style={{ opacity: 0.7 }} />
                  </button>
                  {isPatternDropdownOpen && (
                    <div className="hp-custom-dropdown-menu hp-patterns-dropdown-menu">
                      <div
                        className="hp-custom-dropdown-item"
                        onClick={() => {
                          setFilters({ ...filters, pattern: 'all' });
                          setIsPatternDropdownOpen(false);
                        }}
                      >
                        All Patterns
                      </div>
                      {Object.keys(DSA_PATTERNS).map((pat) => (
                        <div
                          key={pat}
                          className="hp-custom-dropdown-item"
                          onClick={() => {
                            setFilters({ ...filters, pattern: pat });
                            setIsPatternDropdownOpen(false);
                          }}
                        >
                          {pat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button className="hp-filter-select hp-subscription-btn hp-right-align" onClick={() => setShowPremiumModal(true)}>
                Subscription <Crown size={12} style={{ color: '#D4AF37' }} />
              </button>
            )}
          </div>
        </div>

        {/* Problems List (Archive Style) */}
        <div className="hp-archive-list-wrapper">
          <div className="hp-archive-list">
          {loadingList ? (
            <div className="text-center py-24 border-t border-white/5 font-mono text-zinc-600 uppercase tracking-widest text-xs">
              Loading archive...
            </div>
          ) : sortedAndFilteredProblems.length === 0 ? (
            <div className="text-center py-24 border-t border-white/5 font-mono text-zinc-600 uppercase tracking-widest text-xs">
              No problems match your query
            </div>
          ) : (
            <>
              {visibleProblems.map((problem, index) => {
                const isCatalog = problem.problemType === 'catalog';
                const solved = solvedProblems.some((sp) => sp._id === problem._id);
                const rowInner = (
                  <>
                    <span className="hp-row-index">{(index + 1).toString().padStart(3, '0')}</span>
                    <span className="hp-row-title">
                      {problem.title.toUpperCase()}
                      {problem.leetcodeLink && (
                        <span
                          role="button"
                          className="hp-row-leetcode-link"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(problem.leetcodeLink, '_blank', 'noopener,noreferrer');
                          }}
                          title="Solve on LeetCode"
                          style={{ cursor: 'pointer' }}
                        >
                          <ExternalLink size={11} style={{ display: 'inline', verticalAlign: '-1px' }} />
                        </span>
                      )}
                    </span>
                    <span className={`hp-row-difficulty hp-difficulty-${(problem.difficulty || '').toLowerCase()}`}>
                      {problem.difficulty.toUpperCase()}
                    </span>
                    <div className="hp-row-tag">{problem.tags}</div>
                    <span className="hp-row-stat">
                      <button
                        className="hp-row-companies-tab"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (user?.isPremium) {
                            setSelectedProblemCompanies({
                              title: problem.title,
                              companies: problem.companies || []
                            });
                          } else {
                            setShowPremiumModal(true);
                          }
                        }}
                      >
                        {problem.companyCount || problem.companies?.length || 0} CO
                      </button>
                    </span>
                    <span className="hp-row-stat">{problem.acceptanceRate ?? 0}% ACC</span>
                    {isCatalog ? (
                      <span className="hp-row-badge hp-badge-catalog">
                        LEETCODE <ExternalLink size={11} style={{ display: 'inline', verticalAlign: '-1px' }} />
                      </span>
                    ) : (
                      <div className="hp-row-status">
                        <div className={`hp-status-puck ${solved ? 'solved' : ''}`}></div>
                      </div>
                    )}
                  </>
                );

                if (isCatalog) {
                  return (
                    <a
                      href={problem.leetcodeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={problem._id}
                      className="hp-archive-row"
                    >
                      {rowInner}
                    </a>
                  );
                }

                return (
                  <NavLink to={`/problem/${problem._id}`} key={problem._id} className="hp-archive-row">
                    {rowInner}
                  </NavLink>
                );
              })}

              {visibleCount < sortedAndFilteredProblems.length && (
                <button
                  className="hp-load-more"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  Load more ({sortedAndFilteredProblems.length - visibleCount} remaining)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>

      {/* Premium Subscription Modal */}
      {showPremiumModal && (
        <div className="hp-premium-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="hp-premium-modal hp-premium-split-layout" onClick={(e) => e.stopPropagation()}>
            <button className="hp-premium-close" onClick={() => setShowPremiumModal(false)}>
              <X size={18} />
            </button>

            {/* Left Console Panel */}
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

      {/* Companies List Modal */}
      {selectedProblemCompanies && (
        <div className="hp-premium-overlay" onClick={() => setSelectedProblemCompanies(null)}>
          <div className="hp-premium-modal hp-premium-companies-modal" onClick={(e) => e.stopPropagation()}>
            <button className="hp-premium-close hp-premium-companies-close" onClick={() => setSelectedProblemCompanies(null)} title="Close">
              <X size={18} />
            </button>

            <h2 className="hp-premium-title-cyber">
              {selectedProblemCompanies.title.toUpperCase()}
            </h2>
            
            <p className="hp-premium-prompt-cyber">
              ASKED IN <span className="hp-premium-prompt-glow-cyber">{selectedProblemCompanies.companies.length}</span> TECHNICAL INTERVIEWS AT THE FOLLOWING COMPANIES:
            </p>

            <div className="hp-companies-cyber-container custom-scroll">
              {selectedProblemCompanies.companies.length === 0 ? (
                <div className="hp-no-companies-cyber">
                  NO COMPANY DETAILS AVAILABLE
                </div>
              ) : (
                <div className="hp-companies-cyber-grid">
                  {selectedProblemCompanies.companies.map((c, index) => (
                    <div key={index} className="hp-company-cyber-box">
                      <span className="hp-company-cyber-name">
                        {c.name.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>
        </div>
      )}
      <PublicFooter />
    </div>
  );
}

export default Homepage;
