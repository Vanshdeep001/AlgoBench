import { useContestTimer } from '../hooks/useContestTimer';
import { Clock } from 'lucide-react';

const style = {
  bg: '#0B0B0E',
  border: '1px solid rgba(212, 175, 55, 0.2)',
  gold: '#D4AF37',
  muted: '#9A9A9A',
};

export default function ContestTimer({ endTime, onExpire, compact }) {
  const { formatted, expired } = useContestTimer(endTime, onExpire);

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono font-bold"
        style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: style.border, color: expired ? '#ef4444' : style.gold }}
      >
        <Clock size={18} />
        <span>{formatted}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: style.border }}
    >
      <Clock size={22} style={{ color: style.gold }} />
      <div>
        <div className="text-xs uppercase tracking-wider" style={{ color: style.muted }}>Time remaining</div>
        <div className="font-mono text-xl font-bold" style={{ color: expired ? '#ef4444' : style.gold }}>
          {formatted}
        </div>
      </div>
    </div>
  );
}
