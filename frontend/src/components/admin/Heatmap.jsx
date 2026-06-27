import React from 'react';

const Heatmap = ({ weeks = 10, rows = 7, data = [] }) => {
  // create small grid, fallback random-ish
  const cells = Array.from({ length: weeks * rows }).map((_, i) => {
    const v = data[i] ?? 0;
    const level = v > 5 ? 3 : v > 2 ? 2 : v > 0 ? 1 : 0;
    return { i, level };
  });

  return (
    <div>
      <div style={{ color:'var(--text-muted)', fontWeight:700, marginBottom:8 }}>Submission Activity</div>
      <div className="heatmap-panel">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, color:'var(--text-muted)' }}>
          <div>Total Submissions</div>
          <div>Less → More</div>
        </div>
        <div className="heatmap-grid" role="grid" aria-hidden>
          {cells.map(c => (
            <div key={c.i} className={`heatmap-cell ${c.level ? 'level-'+c.level:''}`}>
              <div className="inner" />
              <div className="tooltip">{c.level} submissions</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;

