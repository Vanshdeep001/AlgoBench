import { Link } from 'react-router';
import { CheckCircle, Circle } from 'lucide-react';

const style = {
  border: '1px solid rgba(212, 175, 55, 0.1)',
  gold: '#D4AF37',
  muted: '#9A9A9A',
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

function getDifficultyColor(d) {
  if (!d) return style.muted;
  switch (d.toLowerCase()) {
    case 'easy': return style.easy;
    case 'medium': return style.medium;
    case 'hard': return style.hard;
    default: return style.muted;
  }
}

export default function ProblemNavigator({ problems, contestId, attemptId, currentProblemId, problemStatus }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#0B0B0E' }}>
      <div
        className="px-4 py-3 border-b font-semibold text-sm"
        style={{ borderColor: 'rgba(212, 175, 55, 0.1)', color: style.gold }}
      >
        Problems
      </div>
      <ul className="flex-1 overflow-y-auto py-2">
        {problems?.map((p, index) => {
          const isActive = p._id === currentProblemId;
          const solved = problemStatus?.[p._id];
          const href = attemptId
            ? `/contests/${contestId}/arena?attempt=${attemptId}&problem=${p._id}`
            : `/contests/${contestId}?problem=${p._id}`;
          return (
            <li key={p._id}>
              <Link
                to={href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: isActive ? style.gold : '#EDEDED',
                  borderLeft: isActive ? `3px solid ${style.gold}` : '3px solid transparent',
                }}
              >
                <span className="flex-shrink-0 w-6 text-center font-mono" style={{ color: style.muted }}>
                  {index + 1}
                </span>
                {solved ? (
                  <CheckCircle size={18} style={{ color: style.gold }} />
                ) : (
                  <Circle size={18} style={{ color: style.muted }} />
                )}
                <span className="truncate flex-1">{p.title}</span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ color: getDifficultyColor(p.difficulty), backgroundColor: `${getDifficultyColor(p.difficulty)}20` }}
                >
                  {p.difficulty}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
