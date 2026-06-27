import React from 'react';

const RecentTable = ({ submissions = [] }) => {
  // If no submissions provided, show a small placeholder list
  const data = submissions.length ? submissions : [
    { title: 'Array Rotation', difficulty: 'easy', status: 'Accepted', runtime: '12ms', date: 'Feb 20' },
    { title: 'Reverse Link', difficulty: 'medium', status: 'Accepted', runtime: '45ms', date: 'Feb 19' },
    { title: 'Two Sum II', difficulty: 'easy', status: 'Accepted', runtime: '28ms', date: 'Feb 18' },
    { title: 'Graph Node', difficulty: 'hard', status: 'SYN_ERR', runtime: '---', date: 'Feb 15' },
  ];

  const getDifficultyColor = (d) => {
    const cleanD = String(d || 'easy').toLowerCase();
    if (cleanD === 'easy') return '#4ade80';
    if (cleanD === 'medium') return '#fbbf24';
    if (cleanD === 'hard') return '#f87171';
    return '#8a8a93';
  };

  const formatRuntime = (rt) => {
    if (rt === null || rt === undefined || rt === '---') return '---';
    // Clean string formatting if "ms" is already appended
    const cleanRt = String(rt).replace('ms', '').trim();
    const num = parseFloat(cleanRt);
    if (isNaN(num)) return rt;
    return num < 1 ? `${num.toFixed(3)} ms` : `${num.toFixed(1)} ms`;
  };

  return (
    <div className="w-full flex flex-col divide-y divide-white/[0.03]" style={{ fontFamily: 'var(--font-mono)' }}>
      {data.map((r, i) => {
        const dateStr = r.timestamp 
          ? new Date(r.timestamp).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' }) 
          : r.date;
        const statusAccepted = String(r.status).toLowerCase() === 'accepted' || r.status === 'Accepted';
        const diffColor = getDifficultyColor(r.difficulty);
        
        return (
          <React.Fragment key={r.id || i}>
            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-[100px_1fr_90px_75px_70px] gap-4 items-center py-3 hover:bg-white/[0.01] transition-colors duration-150">
              {/* Timestamp */}
              <span className="text-[11px] text-[#D4AF37]/90 font-bold tracking-tight">
                [{String(dateStr).toUpperCase()}]
              </span>
              
              {/* Operation & Title */}
              <div className="flex items-center min-w-0 text-[11px]">
                <span className="text-zinc-200 font-medium truncate" title={r.title}>
                  {String(r.title || '').toUpperCase()}
                </span>
              </div>
              
              {/* Difficulty Label */}
              <span 
                className="inline-flex items-center justify-center text-[9px] font-bold tracking-wider uppercase text-center shrink-0 w-20"
                style={{ color: diffColor }}
              >
                {r.difficulty || 'unk'}
              </span>
              
              {/* Status Label */}
              <span 
                className={`inline-flex items-center justify-center text-[9px] font-bold tracking-wider text-center shrink-0 w-16 ${
                  statusAccepted ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {statusAccepted ? 'NODE OK' : 'SYN ERR'}
              </span>
              
              {/* Runtime */}
              <span className="text-[10.5px] text-zinc-500 text-right font-medium shrink-0">
                {formatRuntime(r.runtime)}
              </span>
            </div>

            {/* Mobile/Tablet View */}
            <div className="flex md:hidden flex-col gap-1.5 py-3 hover:bg-white/[0.01] transition-colors duration-150">
              {/* Row 1: Date & Runtime */}
              <div className="flex justify-between items-center w-full">
                <span className="text-[11px] text-[#D4AF37]/90 font-bold tracking-tight">
                  [{String(dateStr).toUpperCase()}]
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {formatRuntime(r.runtime)}
                </span>
              </div>

              {/* Row 2: Title & Badges */}
              <div className="flex justify-between items-center w-full gap-2 mt-0.5">
                <span className="text-zinc-200 font-medium truncate text-[11px] flex-1 text-left" title={r.title}>
                  {String(r.title || '').toUpperCase()}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <span 
                    className="text-[9px] font-bold tracking-wider uppercase text-right"
                    style={{ color: diffColor }}
                  >
                    {r.difficulty || 'unk'}
                  </span>
                  <span 
                    className={`text-[9px] font-bold tracking-wider text-right ${
                      statusAccepted ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {statusAccepted ? 'NODE OK' : 'SYN ERR'}
                  </span>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default RecentTable;
