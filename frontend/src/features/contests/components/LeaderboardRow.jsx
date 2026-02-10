const style = { gold: '#D4AF37', muted: '#9A9A9A' };

export default function LeaderboardRow({ rank, username, score, endTime, isCurrentUser }) {
  const finishStr = endTime
    ? new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--';

  return (
    <tr
      className="border-b transition-colors"
      style={{
        borderColor: 'rgba(212, 175, 55, 0.08)',
        backgroundColor: isCurrentUser ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
      }}
    >
      <td className="px-4 py-3 font-mono font-bold" style={{ color: style.gold }}>
        {rank}
      </td>
      <td className="px-4 py-3 font-medium" style={{ color: isCurrentUser ? style.gold : '#EDEDED' }}>
        {username}
      </td>
      <td className="px-4 py-3 font-semibold" style={{ color: '#EDEDED' }}>
        {score}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: style.muted }}>
        {finishStr}
      </td>
    </tr>
  );
}
