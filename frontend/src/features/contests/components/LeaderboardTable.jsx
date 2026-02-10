import LeaderboardRow from './LeaderboardRow';

const style = { border: '1px solid rgba(212, 175, 55, 0.15)', gold: '#D4AF37', muted: '#9A9A9A' };

export default function LeaderboardTable({ leaderboard, currentUserId }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: style.border }}
    >
      <table className="w-full text-left">
        <thead>
          <tr style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', borderBottom: style.border }}>
            <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: style.muted }}>Rank</th>
            <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: style.muted }}>User</th>
            <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: style.muted }}>Score</th>
            <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: style.muted }}>Finish time</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard?.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center" style={{ color: style.muted }}>
                No entries yet.
              </td>
            </tr>
          )}
          {leaderboard?.map((row) => (
            <LeaderboardRow
              key={row.userId}
              rank={row.rank}
              username={row.username}
              score={row.score}
              endTime={row.endTime}
              isCurrentUser={currentUserId && String(row.userId) === String(currentUserId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
