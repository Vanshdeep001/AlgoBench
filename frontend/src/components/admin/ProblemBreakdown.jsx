import React from 'react';

const ProgressRow = ({ label, value, total, color }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="progress-row">
      <div className="progress-label">{label}</div>
      <div className="progress-bar" aria-hidden>
        <div className="fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
      <div className="progress-count">{value}</div>
    </div>
  );
};

const ProblemBreakdown = ({ counts = { easy: 24, medium: 12, hard: 3 } }) => {
  const total = counts.easy + counts.medium + counts.hard || 1;
  return (
    <div className="breakdown-panel">
      <h3 style={{ margin:0, marginBottom:12, color:'var(--text-primary)' }}>Problem Breakdown</h3>
      <ProgressRow label="Easy" value={counts.easy} total={total} />
      <ProgressRow label="Medium" value={counts.medium} total={total} />
      <ProgressRow label="Hard" value={counts.hard} total={total} />
      <div style={{ marginTop:12, color:'var(--text-muted)' }}>Acceptance rate per difficulty (hover for details)</div>
    </div>
  );
};

export default ProblemBreakdown;

