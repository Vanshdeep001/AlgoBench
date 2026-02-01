import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import ProfileStats from '../components/ProfileStats';
import SubmissionHeatmap from '../components/profile/SubmissionHeatmap';
import AcceptancePanel from '../components/profile/AcceptancePanel';
import { User, Mail, Calendar, Award, Code, TrendingUp, Clock } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const Profile = () => {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchRecentSubmissions();
    }, [user, navigate]);

    const fetchRecentSubmissions = async () => {
        try {
            setLoading(true);
            // This endpoint would need to be created in backend
            // For now, we'll just set empty array
            setRecentSubmissions([]);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0B0B0E' }}>
            {/* Header */}
            <div
                className="border-b"
                style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                    borderColor: 'rgba(212, 175, 55, 0.1)'
                }}
            >
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                color: '#0B0B0E',
                                boxShadow: '0 10px 40px rgba(212, 175, 55, 0.3)'
                            }}
                        >
                            {user.firstName?.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2" style={{ color: '#EDEDED' }}>
                                {user.firstName} {user.lastName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#9A9A9A' }}>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>{user.emailId}</span>
                                </div>
                                {user.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Joined {formatDate(user.createdAt)}</span>
                                    </div>
                                )}
                                {user.role === 'admin' && (
                                    <div
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                            color: '#D4AF37',
                                            border: '1px solid rgba(212, 175, 55, 0.3)'
                                        }}
                                    >
                                        <Award size={12} className="inline mr-1" />
                                        ADMIN
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileStats />
                        <AcceptancePanel />
                    </div>

                    {/* Right Column - Activity & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Heatmap */}
                        <SubmissionHeatmap />

                        {/* Recent Activity */}
                        <div
                            className="p-6 rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={20} style={{ color: '#D4AF37' }} />
                                <h2 className="text-xl font-bold" style={{ color: '#EDEDED' }}>
                                    Recent Activity
                                </h2>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-2"
                                        style={{
                                            borderColor: '#D4AF37',
                                            borderTopColor: 'transparent'
                                        }}
                                    ></div>
                                </div>
                            ) : recentSubmissions.length > 0 ? (
                                <div className="space-y-3">
                                    {recentSubmissions.map((submission, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg"
                                            style={{
                                                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                                                border: '1px solid rgba(212, 175, 55, 0.1)'
                                            }}
                                        >
                                            {/* Submission details would go here */}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Code size={48} className="mx-auto mb-4" style={{ color: '#9A9A9A' }} />
                                    <p style={{ color: '#9A9A9A' }}>
                                        No recent submissions yet. Start solving problems!
                                    </p>
                                    <button
                                        onClick={() => navigate('/problems')}
                                        className="mt-4 px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                                        style={{
                                            backgroundColor: 'rgba(212, 175, 55, 0.15)',
                                            color: '#D4AF37',
                                            border: '1px solid rgba(212, 175, 55, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.25)';
                                            e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        Browse Problems
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Account Information */}
                        <div
                            className="p-6 rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <User size={20} style={{ color: '#D4AF37' }} />
                                <h2 className="text-xl font-bold" style={{ color: '#EDEDED' }}>
                                    Account Information
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
                                    <span style={{ color: '#9A9A9A' }}>Full Name</span>
                                    <span className="font-semibold" style={{ color: '#EDEDED' }}>
                                        {user.firstName} {user.lastName}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
                                    <span style={{ color: '#9A9A9A' }}>Email</span>
                                    <span className="font-semibold" style={{ color: '#EDEDED' }}>
                                        {user.emailId}
                                    </span>
                                </div>

                                {user.age && (
                                    <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
                                        <span style={{ color: '#9A9A9A' }}>Age</span>
                                        <span className="font-semibold" style={{ color: '#EDEDED' }}>
                                            {user.age}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
                                    <span style={{ color: '#9A9A9A' }}>Role</span>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: user.role === 'admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                                            color: user.role === 'admin' ? '#D4AF37' : '#9A9A9A',
                                            border: `1px solid ${user.role === 'admin' ? 'rgba(212, 175, 55, 0.3)' : 'rgba(100, 100, 100, 0.3)'}`
                                        }}
                                    >
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: '#9A9A9A' }}>Member Since</span>
                                    <span className="font-semibold" style={{ color: '#EDEDED' }}>
                                        {formatDate(user.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
