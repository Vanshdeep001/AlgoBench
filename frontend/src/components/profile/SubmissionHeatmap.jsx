import { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';

const SubmissionHeatmap = ({ heatmapData: propHeatmap }) => {
    const [loading, setLoading] = useState(!propHeatmap);
    const [error] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const heatmapData = propHeatmap || {
        totalSubmissions: 0,
        totalActiveDays: 0,
        maxStreak: 0,
        calendar: {}
    };

    // Loading transition placeholder
    useEffect(() => {
        if (propHeatmap) {
            setLoading(false);
            return;
        }
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [propHeatmap]);

    const getIntensityColor = (count) => {
        if (count === 0) return 'rgba(255, 255, 255, 0.03)';
        if (count <= 2) return 'rgba(212, 175, 55, 0.2)'; // Faint gold
        if (count <= 4) return 'rgba(212, 175, 55, 0.5)'; // Medium gold
        return 'var(--accent)'; // Solid gold
    };

    const getMonthDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(year, month, i);
            const dateStr = d.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                dateDisplay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                count: heatmapData?.calendar?.[dateStr] || 0
            });
        }
        return {
            days,
            monthName: date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            padding: firstDay.getDay()
        };
    };

    const nextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    if (loading) return (
        <div className="profile-card animate-pulse h-48"></div>
    );

    if (error || !heatmapData) return null;

    // Generate consecutive 3 months: selectedDate - 2 months, selectedDate - 1 month, selectedDate
    const m3 = getMonthDays(selectedDate);
    
    const d2 = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    const m2 = getMonthDays(d2);
    
    const d1 = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 2, 1);
    const m1 = getMonthDays(d1);

    const months = [m1, m2, m3];

    // Format range string for the header selector
    const startMonthStr = d1.toLocaleString('en-US', { month: 'short' });
    const endMonthStr = selectedDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const rangeName = `${startMonthStr} - ${endMonthStr}`;

    return (
        <div className="heatmap-refined-container w-full">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/[0.03] pb-6">
                 <div className="flex gap-8">
                     <div className="flex flex-col">
                         <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono leading-none mb-2">Submissions</span>
                         <span className="text-3xl font-bold text-white font-heading">{heatmapData.totalSubmissions}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono leading-none mb-2">Active Days</span>
                         <span className="text-3xl font-bold text-white font-heading">{heatmapData.totalActiveDays}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono leading-none mb-2">Max Streak</span>
                         <span className="text-3xl font-bold flex items-center gap-2 font-heading" style={{ color: 'var(--accent)' }}>
                             <Flame size={24} fill="var(--accent)" stroke="none" />
                             {heatmapData.maxStreak}
                         </span>
                     </div>
                 </div>
 
                 <div className="flex flex-wrap items-center gap-6 md:ml-auto w-full md:w-auto">
                     <div className="flex items-center gap-3 bg-white/[0.03] px-3.5 py-1.5 rounded-sm border border-white/[0.06]">
                         <button onClick={prevMonth} className="p-1 hover:text-white transition-colors cursor-pointer text-zinc-400">
                             <Clock size={14} className="rotate-180" />
                         </button>
                         <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-200 min-w-[130px] text-center font-bold">
                             {rangeName}
                         </span>
                         <button onClick={nextMonth} className="p-1 hover:text-white transition-colors cursor-pointer text-zinc-400">
                             <Clock size={14} />
                         </button>
                     </div>
 
                     <div className="flex gap-2 text-[10px] items-center font-mono opacity-65 uppercase tracking-widest">
                         <span className="text-zinc-500">Min</span>
                         <div className="flex gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                             <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212,175,55,0.1)' }}></div>
                             <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'rgba(212, 175, 55, 0.5)', border: '1px solid rgba(212,175,55,0.2)' }}></div>
                             <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'var(--accent)', border: '1px solid var(--accent)' }}></div>
                         </div>
                         <span className="text-zinc-500">Max</span>
                     </div>
                 </div>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                {months.map((m, mIdx) => (
                    <div key={mIdx} className="flex flex-col gap-4 p-5 border border-white/[0.03] bg-white/[0.01] rounded-sm">
                        {/* Month Header Title */}
                        <div className="text-[11px] font-bold font-mono tracking-widest text-[#D4AF37] uppercase text-center border-b border-white/[0.03] pb-2.5 mb-1">
                            {m.monthName}
                        </div>

                        <div className="grid grid-cols-7 gap-2 justify-items-center">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} className="text-[9px] text-center text-zinc-600 font-mono mb-1">{d}</div>
                            ))}
                            {/* Padding for first day of month */}
                            {Array.from({ length: m.padding }).map((_, i) => (
                                <div key={`pad-${i}`} className="w-8 h-8 rounded-sm"></div>
                            ))}
                            {m.days.map((day) => (
                                <div
                                    key={day.date}
                                    className="w-8 h-8 rounded-sm transition-all duration-200 hover:scale-105 relative group cursor-crosshair border border-white/5 flex items-center justify-center"
                                    style={{ backgroundColor: getIntensityColor(day.count) }}
                                >
                                    <span className="text-[10px] opacity-25 font-mono">{new Date(day.date).getDate()}</span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0A0A0F] text-[10px] text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 border border-white/5 shadow-2xl transition-all duration-300 scale-90 group-hover:scale-100">
                                        <div className="font-mono text-[11px] mb-1">
                                            <span style={{ color: 'var(--accent)' }}>{day.count}</span> SUBMISSIONS
                                        </div>
                                        <div className="text-zinc-500 uppercase tracking-tighter font-medium">{day.dateDisplay}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubmissionHeatmap;
