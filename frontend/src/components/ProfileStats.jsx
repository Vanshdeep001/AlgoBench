import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { Code, CheckCircle, TrendingUp } from 'lucide-react';

const ProfileStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosClient.get('/user/me/stats');
            setStats(response.data);

            console.log('User stats loaded:', response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.response?.data?.message || 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6" style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            }}>
                <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }}></div>
                    <span style={{ color: '#D4AF37' }}>Loading stats...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6" style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            }}>
                <p style={{ color: '#EF4444' }}>⚠️ {error}</p>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const difficultyData = [
        {
            label: 'Easy',
            count: stats.easy,
            color: '#10B981', // Green
            bgColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 0.3)'
        },
        {
            label: 'Medium',
            count: stats.medium,
            color: '#F59E0B', // Orange
            bgColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 0.3)'
        },
        {
            label: 'Hard',
            count: stats.hard,
            color: '#EF4444', // Red
            bgColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)'
        }
    ];

    return (
        <div className="space-y-4">
            {/* Total Solved Card */}
            <div
                className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(212, 175, 55, 0.1)'
                }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={24} style={{ color: '#D4AF37' }} />
                            <h3 className="text-lg font-semibold" style={{ color: '#EDEDED' }}>
                                Total Solved
                            </h3>
                        </div>
                        <p className="text-5xl font-bold" style={{ color: '#D4AF37' }}>
                            {stats.totalSolved}
                        </p>
                        <p className="text-sm mt-2" style={{ color: '#9A9A9A' }}>
                            Problems completed
                        </p>
                    </div>
                    <div className="p-4 rounded-full" style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}>
                        <TrendingUp size={40} style={{ color: '#D4AF37' }} />
                    </div>
                </div>
            </div>

            {/* Difficulty Breakdown */}
            <div
                className="p-6 rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Code size={20} style={{ color: '#D4AF37' }} />
                    <h3 className="text-lg font-semibold" style={{ color: '#EDEDED' }}>
                        By Difficulty
                    </h3>
                </div>

                <div className="space-y-3">
                    {difficultyData.map((item) => (
                        <div
                            key={item.label}
                            className="p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                            style={{
                                backgroundColor: item.bgColor,
                                border: `1px solid ${item.borderColor}`
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="font-semibold" style={{ color: '#EDEDED' }}>
                                        {item.label}
                                    </span>
                                </div>
                                <span className="text-2xl font-bold" style={{ color: item.color }}>
                                    {item.count}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            {stats.totalSolved > 0 && (
                                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(item.count / stats.totalSolved) * 100}%`,
                                            backgroundColor: item.color
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileStats;
