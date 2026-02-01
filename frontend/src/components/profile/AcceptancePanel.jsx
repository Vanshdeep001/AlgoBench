import { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosClient';
import { Target, CheckCircle2 } from 'lucide-react';

const AcceptancePanel = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAcceptance = async () => {
            try {
                const response = await axiosClient.get('/user/me/acceptance');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch acceptance stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAcceptance();
    }, []);

    if (loading) return (
        <div className="animate-pulse h-32 rounded-xl bg-gray-800/30"></div>
    );

    if (!stats) return null;

    return (
        <div className="p-6 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="flex items-center gap-2 mb-4">
                <Target size={20} style={{ color: '#D4AF37' }} />
                <h3 className="text-lg font-bold" style={{ color: '#EDEDED' }}>
                    Acceptance Rate
                </h3>
            </div>

            <div className="flex items-center gap-6">
                {/* Visual Circle Percentage */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#D4AF37"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * stats.acceptanceRate) / 100}
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-bold text-white">
                            {stats.acceptanceRate}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Total Submissions</span>
                        <span className="text-2xl font-bold text-white">
                            {stats.totalSubmissions}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle2 size={14} />
                        <span>{stats.acceptedSubmissions} Accepted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptancePanel;
