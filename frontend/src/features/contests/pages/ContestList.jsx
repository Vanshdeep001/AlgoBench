import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContests } from '../contestsSlice';
import SharedNavbar from '../../../components/SharedNavbar';
import PublicFooter from '../../../components/PublicFooter';
import './ContestList.css';

function StatusBadge({ status }) {
    if (status === 'live') {
        return <span className="cl-badge live">Live Round</span>;
    }
    if (status === 'upcoming') {
        return <span className="cl-badge upcoming">Upcoming</span>;
    }
    return <span className="cl-badge finished">Finished</span>;
}

export default function ContestList() {
    const dispatch = useDispatch();
    const { list, loading } = useSelector((state) => state.contests);
    const [activeTab, setActiveTab] = useState('active'); // 'active' (live + upcoming) or 'archive' (finished)

    useEffect(() => {
        dispatch(fetchContests());
    }, [dispatch]);

    const upcoming = list.filter((c) => c.status === 'upcoming');
    const live = list.filter((c) => c.status === 'live');
    const finished = list.filter((c) => c.status === 'finished');

    return (
        <div className="cl-root">
            {/* Background Aesthetic Nodes */}
            <div className="cl-glow-1" />
            <div className="cl-glow-2" />
            <div className="cl-noise" />

            <SharedNavbar />

            {/* Main Content Arena */}
            <div className="cl-container">
                <div className="cl-header">
                    <h1 className="cl-title">Coding Contests</h1>
                    <p className="cl-subtitle">
                        Test your speed, accuracy, and engineering skills against our global developer pool in active, synchronized challenges.
                    </p>
                </div>

                {/* Dashboard Stats — Glassmorphism Pods */}
                <div className="cl-stats-strip">
                    <div className="cl-stat-pod">
                        <div className="cl-stat-ring">
                            <svg viewBox="0 0 40 40" className="cl-stat-ring-svg">
                                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                                <circle cx="20" cy="20" r="17" fill="none" stroke={live.length > 0 ? '#22c55e' : 'rgba(255,255,255,0.15)'} strokeWidth="2" strokeDasharray="107" strokeDashoffset={live.length > 0 ? '0' : '80'} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                            </svg>
                            <span className="cl-stat-ring-number">{live.length}</span>
                            {live.length > 0 && <span className="cl-stat-live-dot" />}
                        </div>
                        <div className="cl-stat-text">
                            <span className="cl-stat-label">Live</span>
                            <span className="cl-stat-sublabel">Rounds</span>
                        </div>
                    </div>

                    <div className="cl-stat-divider" />

                    <div className="cl-stat-pod">
                        <div className="cl-stat-ring">
                            <svg viewBox="0 0 40 40" className="cl-stat-ring-svg">
                                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                                <circle cx="20" cy="20" r="17" fill="none" stroke={upcoming.length > 0 ? '#D4AF37' : 'rgba(255,255,255,0.15)'} strokeWidth="2" strokeDasharray="107" strokeDashoffset={upcoming.length > 0 ? '20' : '80'} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                            </svg>
                            <span className="cl-stat-ring-number">{upcoming.length}</span>
                        </div>
                        <div className="cl-stat-text">
                            <span className="cl-stat-label">Upcoming</span>
                            <span className="cl-stat-sublabel">Rounds</span>
                        </div>
                    </div>

                    <div className="cl-stat-divider" />

                    <div className="cl-stat-pod">
                        <div className="cl-stat-ring">
                            <svg viewBox="0 0 40 40" className="cl-stat-ring-svg">
                                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="107" strokeDashoffset={finished.length > 0 ? '10' : '80'} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                            </svg>
                            <span className="cl-stat-ring-number">{finished.length}</span>
                        </div>
                        <div className="cl-stat-text">
                            <span className="cl-stat-label">Archived</span>
                            <span className="cl-stat-sublabel">Events</span>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher — Underlined Tabs Deck */}
                <div className="cl-tabs-deck">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`cl-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 17 10 11 4 5" />
                            <line x1="12" y1="19" x2="20" y2="19" />
                        </svg>
                        Active Arenas
                    </button>
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`cl-tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        League Archive
                    </button>
                </div>

                {loading ? (
                    <div className="cl-loader-wrap">
                        <div className="cl-loader-ring" />
                        <span className="cl-loader-text">Uplinking Data...</span>
                    </div>
                ) : (
                    <div className="cl-content-area">
                        {activeTab === 'active' ? (
                            <>
                                {/* Render Live Rounds */}
                                {live.length > 0 && (
                                    <div className="cl-section">
                                        <h2 className="cl-section-heading">
                                            <span className="cl-section-dot live" />
                                            Active Events
                                        </h2>
                                        <div className="cl-list">
                                            {live.map((c, index) => (
                                                <Link key={c._id} to={`/contests/${c._id}`} className="cl-card">
                                                    <span className="cl-card-index">{String(index + 1).padStart(3, '0')}</span>
                                                    <div className="cl-card-info">
                                                        <h3 className="cl-card-title">{c.title}</h3>
                                                        {c.description && <p className="cl-card-desc">{c.description}</p>}
                                                    </div>
                                                    <div className="cl-card-status">
                                                        <StatusBadge status={c.status} />
                                                    </div>
                                                    <div className="cl-card-meta">
                                                        <span>Duration: {c.duration} min</span>
                                                    </div>
                                                    <div className="cl-card-meta problems-count">
                                                        <span>Problems: {c.problems?.length || 0}</span>
                                                    </div>
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cl-card-arrow">
                                                        <path d="M6 3l5 5-5 5" />
                                                    </svg>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Render Upcoming Rounds */}
                                <div className="cl-section">
                                    <h2 className="cl-section-heading">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                            <circle cx="8" cy="8" r="6.5" />
                                            <path d="M8 4.5V8.5h2.5" />
                                        </svg>
                                        Upcoming Challenges
                                    </h2>
                                    {upcoming.length === 0 ? (
                                        <div className="cl-empty-row">
                                            <div className="cl-empty-left">
                                                <span className="cl-empty-indicator" />
                                                <div className="cl-empty-text-wrap">
                                                    <span className="cl-empty-primary">No upcoming challenges</span>
                                                    <span className="cl-empty-secondary">Check back soon for new scheduled events.</span>
                                                </div>
                                            </div>
                                            <div className="cl-empty-right">
                                                <div className="cl-empty-meta-item">
                                                    <span className="cl-empty-meta-label">STATUS</span>
                                                    <span className="cl-empty-meta-val">STANDBY</span>
                                                </div>
                                                <div className="cl-empty-meta-item">
                                                    <span className="cl-empty-meta-label">SYNC</span>
                                                    <span className="cl-empty-meta-val">READY</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="cl-list">
                                            {upcoming.map((c, index) => (
                                                <Link key={c._id} to={`/contests/${c._id}`} className="cl-card">
                                                    <span className="cl-card-index">{String(index + 1).padStart(3, '0')}</span>
                                                    <div className="cl-card-info">
                                                        <h3 className="cl-card-title">{c.title}</h3>
                                                        {c.description && <p className="cl-card-desc">{c.description}</p>}
                                                    </div>
                                                    <div className="cl-card-status">
                                                        <StatusBadge status={c.status} />
                                                    </div>
                                                    <div className="cl-card-meta">
                                                        <span>Start: {new Date(c.startTime).toLocaleString()}</span>
                                                    </div>
                                                    <div className="cl-card-meta problems-count">
                                                        <span>Duration: {c.duration} min</span>
                                                    </div>
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cl-card-arrow">
                                                        <path d="M6 3l5 5-5 5" />
                                                    </svg>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="cl-section">
                                <h2 className="cl-section-heading">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                        <rect x="2" y="3.5" width="12" height="11" rx="1.5" />
                                        <path d="M5 2v3M11 2v3M2 7h12" />
                                    </svg>
                                    League Archive
                                </h2>
                                {finished.length === 0 ? (
                                    <div className="cl-empty-row">
                                        <div className="cl-empty-left">
                                            <span className="cl-empty-indicator archive" />
                                            <div className="cl-empty-text-wrap">
                                                <span className="cl-empty-primary">No past events recorded</span>
                                                <span className="cl-empty-secondary">Completed contests will appear here in the historical archive.</span>
                                            </div>
                                        </div>
                                        <div className="cl-empty-right">
                                            <div className="cl-empty-meta-item">
                                                <span className="cl-empty-meta-label">RECORDS</span>
                                                <span className="cl-empty-meta-val">0</span>
                                            </div>
                                            <div className="cl-empty-meta-item">
                                                <span className="cl-empty-meta-label">SYNC</span>
                                                <span className="cl-empty-meta-val">READY</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="cl-list">
                                        {finished.map((c, index) => (
                                            <Link key={c._id} to={`/contests/${c._id}`} className="cl-card">
                                                <span className="cl-card-index">{String(index + 1).padStart(3, '0')}</span>
                                                <div className="cl-card-info">
                                                    <h3 className="cl-card-title">{c.title}</h3>
                                                    {c.description && <p className="cl-card-desc">{c.description}</p>}
                                                </div>
                                                <div className="cl-card-status">
                                                    <StatusBadge status={c.status} />
                                                </div>
                                                <div className="cl-card-meta">
                                                    <span>Ended: {new Date(c.endTime || c.startTime).toLocaleDateString()}</span>
                                                </div>
                                                <div className="cl-card-meta problems-count">
                                                    <span>Problems: {c.problems?.length || 0}</span>
                                                </div>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cl-card-arrow">
                                                    <path d="M6 3l5 5-5 5" />
                                                </svg>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <PublicFooter />
        </div>
    );
}
