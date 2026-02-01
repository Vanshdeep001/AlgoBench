import { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosClient';
import { Calendar, Flame, Zap } from 'lucide-react';

const SubmissionHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHeatmap();
    }, []);

    const fetchHeatmap = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/user/me/heatmap');
            setHeatmapData(response.data);
        } catch (err) {
            console.error('Error fetching heatmap:', err);
            setError('Failed to load activity');
        } finally {
            setLoading(false);
        }
    };

    const getIntensityColor = (count) => {
        if (count === 0) return 'rgba(255, 255, 255, 0.05)';
        if (count <= 2) return 'rgba(16, 185, 129, 0.4)';  // Light green
        if (count <= 4) return 'rgba(16, 185, 129, 0.7)';  // Medium green
        return '#10B981';                                   // Strong green
    };

    const generateCalendarGrid = () => {
        // We need 365 days mostly, but arranged by weeks
        // GitHub style: 7 rows (days), ~53 cols
        const days = [];
        const today = new Date();
        // Start 365 days ago
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 365);

        // Adjust start date to be a Sunday to align grid properly if needed,
        // or just list 365 days. GitHub usually starts from 1 year ago.

        for (let i = 0; i < 365; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            days.push({
                date: dateStr,
                count: heatmapData?.calendar[dateStr] || 0,
                dayOfWeek: d.getDay() // 0 = Sunday
            });
        }
        return days;
    };

    if (loading) return (
        <div className="animate-pulse h-48 rounded-xl bg-gray-800/30"></div>
    );

    if (error || !heatmapData) return null;

    const gridDays = generateCalendarGrid();

    return (
        <div className="p-6 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold" style={{ color: '#EDEDED' }}>
                    Submission Activity
                </h3>
                <div className="flex gap-2 text-xs" style={{ color: '#9A9A9A' }}>
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255, 255, 255, 0.05)' }}></div>
                        <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(16, 185, 129, 0.4)' }}></div>
                        <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(16, 185, 129, 0.7)' }}></div>
                        <div className="w-3 h-3 rounded-sm" style={{ background: '#10B981' }}></div>
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-8 mb-6">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Total Submissions</span>
                    <span className="text-xl font-bold text-white">{heatmapData.totalSubmissions}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Active Days</span>
                    <span className="text-xl font-bold text-white">{heatmapData.totalActiveDays}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Max Streak</span>
                    <span className="text-xl font-bold flex items-center gap-1" style={{ color: '#D4AF37' }}>
                        <Flame size={18} />
                        {heatmapData.maxStreak}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div
                    className="flex flex-wrap flex-col content-start gap-1"
                    style={{ height: '120px', width: 'max-content' }} // 7 days * (12px + 4px gap) roughly
                >
                    {gridDays.map((day) => (
                        <div
                            key={day.date}
                            className="w-3 h-3 rounded-sm cursor-pointer transition-colors duration-200"
                            style={{ backgroundColor: getIntensityColor(day.count) }}
                            title={`${day.date}: ${day.count} submissions`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubmissionHeatmap;
