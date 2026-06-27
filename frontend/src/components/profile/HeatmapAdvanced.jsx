import React, { useEffect, useState } from 'react';
import axiosClient from '../../utils/axiosClient';

const getLevel = (count) => {
  if (!count || count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  return 3;
};

const HeatmapAdvanced = () => {
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/user/me/heatmap');
        if (!mounted) return;
        setHeatmap(res.data);
      } catch (err) {
        console.error('Heatmap fetch failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // build 26-week x 7-day grid (columns: weeks, rows: weekday) for bigger cells
  const buildGrid = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 182); // ~26 weeks (6 months)
    start.setHours(0, 0, 0, 0);

    const weeks = [];
    for (let w = 0; w < 26; w++) {
      for (let d = 0; d < 7; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + (w * 7) + d);
        const key = day.toISOString().split('T')[0];
        const count = heatmap?.calendar?.[key] ?? 0;
        weeks.push({ key, count, level: getLevel(count) });
      }
    }
    return weeks;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs font-mono text-muted uppercase tracking-widest">Initialising Uplink...</div>
        </div>
      </div>
    );
  }

  const cells = buildGrid();
  const total = heatmap?.totalSubmissions ?? 0;

  return (
    <div className="heatmap-container-refined">
      <div style={{ padding: '0 0 16px 0', color: 'var(--muted)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></div>
        TOTAL UPLINK SUBMISSIONS: <strong style={{ color: 'var(--accent)', fontSize: '16px' }}>{total}</strong>
      </div>

      {total === 0 ? (
        <div style={{ padding: '40px 0', color: 'var(--muted)', textAlign: 'center', fontSize: 14, fontFamily: 'var(--font-body)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          NO NEURAL ACTIVITY DETECTED AT THIS NODE
        </div>
      ) : (
        <div style={{ overflow: 'visible' }}>
          <div className="heatmap-grid" role="grid" aria-hidden>
            {cells.map((day, idx) => (
              <div
                key={`${day.key}-${idx}`}
                className={`heatmap-cell ${day.level ? 'l' + day.level : ''}`}
              >
                <div className="inner" />
                <div className="tooltip">
                  <strong style={{ color: 'var(--accent)' }}>{day.count}</strong> Pings // {day.key}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapAdvanced;

