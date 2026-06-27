import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContestById, fetchMyAttempt, startContestAttempt, fetchLeaderboard } from '../contestsSlice';
import ContestTimer from '../components/ContestTimer';
import LeaderboardTable from '../components/LeaderboardTable';
import SharedNavbar from '../../../components/SharedNavbar';
import PublicFooter from '../../../components/PublicFooter';
import UserDropdown from '../../../components/UserDropdown';
import './ContestDetails.css';

const tabs = [
    {
        id: 'overview',
        label: 'Overview',
        icon: () => (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="12" height="12" rx="1.5" />
                <path d="M5 6h6M5 9h6" />
            </svg>
        ),
    },
    {
        id: 'problems',
        label: 'Problems',
        icon: () => (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4l-3 4 3 4M11 4l3 4-3 4M7.5 12l1-8" />
            </svg>
        ),
    },
    {
        id: 'leaderboard',
        label: 'Leaderboard',
        icon: () => (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11.5c-1.5 0-2.5-1-2.5-2.5V7c0-.5.5-1 1-1h1.5M12 11.5c1.5 0 2.5-1 2.5-2.5V7c0-.5-.5-1-1-1H12M8 12V14.5M5.5 14.5h5M8 1.5c2.5 0 4 1.5 4 4v4c0 1.5-1.5 2.5-4 2.5s-4-1-4-4v-4c0-2.5 1.5-4 4-4z" />
            </svg>
        ),
    },
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

    const myRank = leaderboard?.find((r) => String(r.userId) === String(user?._id));
    const rank = myRank?.rank ?? '-';
    const score = attempt?.score ?? myRank?.score ?? 0;

    useEffect(() => {
        if (!contestId) return;
        dispatch(fetchContestById(contestId));
        dispatch(fetchMyAttempt(contestId)).catch(() => {});
    }, [contestId, dispatch]);

    useEffect(() => {
        if (!contestId || !attempt) return;
        if (attempt.status === 'submitted' || attempt.status === 'expired') {
            dispatch(fetchLeaderboard(contestId));
        }
    }, [contestId, attempt?.status, dispatch]);

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
            <div className="cd-loading-screen">
                <p className="text-slate-500 font-mono">CONTEST NOT FOUND</p>
            </div>
        );
    }

    const startTime = contest?.startTime ? new Date(contest.startTime) : null;
    const endTime = contest?.endTime || (startTime && contest?.duration ? new Date(startTime.getTime() + contest.duration * 60 * 1000) : null);

    return (
        <div className="cd-root">
            {/* Background Effects */}
            <div className="cd-glow-1" />
            <div className="cd-noise" />

            <SharedNavbar />

            <div className="cd-container">
                {loading && !contest && (
                    <div className="flex justify-center py-24">
                        <div className="cd-spinner" />
                    </div>
                )}

                {contest && (
                    <>
                        <div className="cd-header">
                            <div className="cd-header-left">
                                <h1 className="cd-title">{contest.title}</h1>
                            </div>
                            <div className="cd-header-right">
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
                                        className="cd-btn start"
                                    >
                                        {starting ? (
                                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M3 2l10 6-10 6V2z" />
                                            </svg>
                                        )}
                                        <span>Start Contest</span>
                                    </button>
                                )}
                                {hasAttempt && attempt?.status === 'running' && (
                                    <Link
                                        to={`/contests/${contestId}/arena?attempt=${attempt._id}`}
                                        className="cd-btn enter"
                                    >
                                        Enter Arena
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Telemetry Stream */}
                        <div className="cd-data-stream">
                            <div className="cd-stream-item">
                                <span className="cd-stream-label">STATUS</span>
                                <span className={`cd-stream-value status-${contest.status}`}>{contest.status.toUpperCase()}</span>
                            </div>
                            <div className="cd-stream-item">
                                <span className="cd-stream-label">START TIME</span>
                                <span className="cd-stream-value">{startTime ? startTime.toLocaleString() : 'N/A'}</span>
                            </div>
                            <div className="cd-stream-item">
                                <span className="cd-stream-label">DURATION</span>
                                <span className="cd-stream-value">{contest.duration} MIN</span>
                            </div>
                            <div className="cd-stream-item">
                                <span className="cd-stream-label">PROBLEMS</span>
                                <span className="cd-stream-value">{contest.problems?.length || 0}</span>
                            </div>
                            {hasAttempt && (attempt?.status === 'submitted' || attempt?.status === 'expired') && (
                                <>
                                    <div className="cd-stream-item">
                                        <span className="cd-stream-label">YOUR RANK</span>
                                        <span className="cd-stream-value">{rank}</span>
                                    </div>
                                    <div className="cd-stream-item">
                                        <span className="cd-stream-label">YOUR SCORE</span>
                                        <span className="cd-stream-value">{score}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {startError && <p className="text-xs font-mono text-red-400 mb-4">{startError}</p>}
                        {error && <p className="text-xs font-mono text-red-400 mb-4">{error}</p>}

                        <div className="cd-tabs-deck">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`cd-tab-trigger ${activeTab === id ? 'active' : ''}`}
                                >
                                    <Icon />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="cd-content-area">
                            {activeTab === 'overview' && (
                                <div>
                                    {contest.description && (
                                        <p className="cd-overview-text">{contest.description}</p>
                                    )}
                                    <div className="cd-specs-grid">
                                        <div className="cd-spec-card">
                                            <span className="cd-spec-title">SCORING PROTOCOL</span>
                                            <p className="cd-spec-desc">First accepted run yields full score (100 pts per problem). No penalty points are assessed for wrong submittals.</p>
                                        </div>
                                        <div className="cd-spec-card">
                                            <span className="cd-spec-title">ARENA ACCESS</span>
                                            <p className="cd-spec-desc">Once started, the countdown is continuous and cannot be paused. Ensure a stable connection before uplinking.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'problems' && (
                                <ul className="cd-prob-list">
                                    {contest.problems?.map((p, i) => (
                                        <li key={p._id} className="cd-prob-item">
                                            <span className="cd-prob-number">{String(i + 1).padStart(2, '0')}</span>
                                            <span className="cd-prob-title">{p.title}</span>
                                            <span className={`cd-prob-difficulty ${p.difficulty?.toLowerCase() || 'easy'}`}>{p.difficulty || 'Easy'}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {activeTab === 'leaderboard' && (
                                <LeaderboardTable leaderboard={leaderboard} currentUserId={user?._id} />
                            )}
                        </div>
                    </>
                )}
            </div>
            <PublicFooter />
        </div>
    );
}
