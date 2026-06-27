import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, togglePremiumLocal } from '../authSlice';
import './UserDropdown.css';

const UserDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const storeUser = useSelector((state) => state.auth?.user);
    const effectiveUser = user || storeUser;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logoutUser());
        setIsOpen(false);
        navigate('/');
    };

    const handleTogglePremium = () => {
        dispatch(togglePremiumLocal());
    };

    const initials = effectiveUser?.firstName?.charAt(0).toUpperCase() || '?';
    const fullName = `${effectiveUser?.firstName || ''} ${effectiveUser?.lastName || ''}`.trim();

    return (
        <div className="ud-root" ref={dropdownRef}>
            {/* ── Trigger Button ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`ud-trigger ${isOpen ? 'open' : ''}`}
                aria-label="Open user menu"
            >
                <div className="ud-avatar-wrap">
                    <div className="ud-avatar-square">
                        {initials}
                    </div>
                </div>

                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`ud-chevron ${isOpen ? 'rotated' : ''}`}>
                    <path d="M1 1l4 4 4-4" />
                </svg>
            </button>

            {/* ── Dropdown Panel ── */}
            {isOpen && (
                <div className="ud-panel">

                    {/* User Identity Section */}
                    <div className="ud-identity">
                        <div className="ud-panel-avatar-wrap">
                            <div className="ud-avatar-square panel-avatar-square">
                                {initials}
                            </div>
                        </div>
                        <div className="ud-identity-info">
                            <p className="ud-identity-name">{fullName}</p>
                            <p className="ud-identity-email">{effectiveUser?.emailId}</p>
                            {effectiveUser && (
                                effectiveUser.role === 'admin' ? (
                                    <button 
                                        onClick={handleTogglePremium}
                                        className="text-[10px] mt-1.5 px-2 py-0.5 rounded font-mono border transition-all text-amber-500 border-amber-500/20 hover:bg-amber-500/10 cursor-pointer block w-fit"
                                        style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.2)' }}
                                    >
                                        PREMIUM: {effectiveUser?.isPremium ? 'ON ✦' : 'OFF 🔒'}
                                    </button>
                                ) : (
                                    <div 
                                        className="text-[10px] mt-1.5 px-2 py-0.5 rounded font-mono border text-amber-500 border-amber-500/20 block w-fit"
                                        style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.2)' }}
                                    >
                                        PREMIUM: {effectiveUser?.isPremium ? 'ON ✦' : 'OFF 🔒'}
                                    </div>
                                )
                            )}
                        </div>
                        {effectiveUser?.role === 'admin' && (
                            <span className="ud-role-badge">
                                ADMIN
                            </span>
                        )}
                    </div>

                    {/* Divider with label */}
                    <div className="ud-section-divider">
                        <span>NAVIGATION</span>
                    </div>

                    {/* Menu Items */}
                    <nav className="ud-nav">
                        <NavLink to="/profile" onClick={() => setIsOpen(false)} className="ud-item">
                            <div className="ud-item-icon">
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="8" cy="5" r="2.5" />
                                    <path d="M3 13.5c0-2.5 2-4.5 5-4.5s5 2 5 4.5" />
                                </svg>
                            </div>
                            <div className="ud-item-content">
                                <span className="ud-item-label">My Profile</span>
                                <span className="ud-item-desc">View your stats & submissions</span>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ud-item-arrow">
                                <path d="M4 2l4 4-4 4" />
                            </svg>
                        </NavLink>

                        <NavLink to="/problems" onClick={() => setIsOpen(false)} className="ud-item">
                            <div className="ud-item-icon">
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 4l-3 4 3 4M11 4l3 4-3 4M7.5 12l1-8" />
                                </svg>
                            </div>
                            <div className="ud-item-content">
                                <span className="ud-item-label">Problems</span>
                                <span className="ud-item-desc">Browse challenges</span>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ud-item-arrow">
                                <path d="M4 2l4 4-4 4" />
                            </svg>
                        </NavLink>

                        <NavLink to="/visualizer" onClick={() => setIsOpen(false)} className="ud-item">
                            <div className="ud-item-icon">
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="4" cy="12" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="8" cy="4" r="1.5" />
                                    <path d="M5.2 10.8l2-5.6M10.8 10.8l-2-5.6M5.5 12h5" />
                                </svg>
                            </div>
                            <div className="ud-item-content">
                                <span className="ud-item-label">Visualizer</span>
                                <span className="ud-item-desc">Algorithm animations</span>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ud-item-arrow">
                                <path d="M4 2l4 4-4 4" />
                            </svg>
                        </NavLink>

                        {effectiveUser?.role === 'admin' && (
                            <NavLink to="/admin" onClick={() => setIsOpen(false)} className="ud-item admin">
                                <div className="ud-item-icon">
                                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="4" y="4" width="8" height="8" rx="1.5" />
                                        <path d="M8 1v3M8 12v3M1 8h3M12 8h3M6 4V2.5M10 4V2.5M6 12v1.5M10 12v1.5" />
                                    </svg>
                                </div>
                                <div className="ud-item-content">
                                    <span className="ud-item-label">Admin Panel</span>
                                    <span className="ud-item-desc">Manage the platform</span>
                                </div>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ud-item-arrow">
                                    <path d="M4 2l4 4-4 4" />
                                </svg>
                            </NavLink>
                        )}
                    </nav>

                    {/* Logout */}
                    <div className="ud-footer">
                        <button onClick={handleLogout} className="ud-logout">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 3H3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h7M15 8H6M12 5l3 3-3 3" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
