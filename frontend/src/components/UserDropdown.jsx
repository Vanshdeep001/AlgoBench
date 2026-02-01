import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../authSlice';

const UserDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                    backgroundColor: isOpen ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    border: `1px solid ${isOpen ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: isOpen ? '#D4AF37' : '#EDEDED'
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                }}
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                        color: '#0B0B0E'
                    }}
                >
                    {user?.firstName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block font-semibold text-sm">
                    {user?.firstName}
                </span>
                <ChevronDown
                    size={16}
                    className="transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{
                        background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.98) 0%, rgba(15, 15, 20, 0.98) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1)'
                    }}
                >
                    {/* User Info Header */}
                    <div className="p-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                    color: '#0B0B0E'
                                }}
                            >
                                {user?.firstName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold" style={{ color: '#EDEDED' }}>
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs" style={{ color: '#9A9A9A' }}>
                                    {user?.emailId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        {/* Profile */}
                        <NavLink
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                            style={{ color: '#EDEDED' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                                e.currentTarget.style.color = '#D4AF37';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#EDEDED';
                            }}
                        >
                            <User size={18} />
                            <span className="font-medium">My Profile</span>
                        </NavLink>

                        {/* Admin Panel (if admin) */}
                        {user?.role === 'admin' && (
                            <NavLink
                                to="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                                style={{ color: '#EDEDED' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                                    e.currentTarget.style.color = '#D4AF37';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#EDEDED';
                                }}
                            >
                                <Shield size={18} />
                                <span className="font-medium">Admin Panel</span>
                            </NavLink>
                        )}

                        {/* Divider */}
                        <div className="my-2 h-px" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}></div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                            style={{ color: '#EF4444' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
