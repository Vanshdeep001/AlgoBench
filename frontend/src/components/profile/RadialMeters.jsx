import React from 'react';

const Radial = ({ label, value, color, gradient, flat }) => {
  const pct = Math.max(0, Math.min(100, value));
  const stroke = 6;
  const size = 90;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  return (
    <div className={flat ? "text-center" : "styled-meter"}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} style={{ filter: `drop-shadow(0 0 10px ${color}22)` }}>
          <defs>
            <linearGradient id={`g-${label}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
          <g transform={`translate(${size / 2},${size / 2})`}>
            <circle r={radius} stroke="rgba(255, 255, 255, 0.03)" strokeWidth={stroke} fill="none" />
            <circle
              r={radius}
              stroke={`url(#g-${label})`}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeLinecap="round"
              transform="rotate(-90)"
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          </g>
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '14px',
          color: color
        }}>
          {value}%
        </div>
      </div>
      <div className="meter-label" style={{ fontSize: '9px', marginTop: '12px' }}>{label}</div>
    </div>
  );
};

const RadialMeters = ({ counts, flat }) => {
  const safeCounts = counts || { easy: 60, medium: 30, hard: 10 };
  return (
    <div className="radial-card-group">
      <Radial label="Easy" value={safeCounts.easy} color="#4ade80" gradient={['#4ade80', '#22c55e']} flat={flat} />
      <Radial label="Medium" value={safeCounts.medium} color="#fbbf24" gradient={['#fbbf24', '#f59e0b']} flat={flat} />
      <Radial label="Hard" value={safeCounts.hard} color="#f87171" gradient={['#f87171', '#ef4444']} flat={flat} />
    </div>
  );
};

export default RadialMeters;
