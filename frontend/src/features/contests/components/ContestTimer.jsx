import { useContestTimer } from '../hooks/useContestTimer';

export default function ContestTimer({ endTime, onExpire, compact }) {
    const { formatted, expired } = useContestTimer(endTime, onExpire);

    if (compact) {
        return (
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-none font-mono font-bold text-xs uppercase tracking-wider"
                style={{ 
                    backgroundColor: 'rgba(14, 14, 16, 0.98)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                    color: expired ? '#ef4444' : '#D4AF37',
                    borderRadius: '0'
                }}
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="6.5" />
                    <path d="M8 4.5V8.5h2.5" />
                </svg>
                <span>{formatted}</span>
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ 
                backgroundColor: 'rgba(14, 14, 16, 0.98)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0'
            }}
        >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 4.5V8.5h2.5" />
            </svg>
            <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Time remaining</div>
                <div className="font-mono text-lg font-bold" style={{ color: expired ? '#ef4444' : '#D4AF37' }}>
                    {formatted}
                </div>
            </div>
        </div>
    );
}
