export default function LeaderboardRow({ rank, username, score, endTime, isCurrentUser }) {
    const finishStr = endTime
        ? new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '--';

    return (
        <tr
            className="transition-colors"
            style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: isCurrentUser ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
            }}
        >
            <td className="px-4 py-3" style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '12px', fontWeight: '700', color: '#D4AF37' }}>
                {String(rank).padStart(2, '0')}
            </td>
            <td className="px-4 py-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: '700', color: isCurrentUser ? '#D4AF37' : '#EDEDED' }}>
                {username}
            </td>
            <td className="px-4 py-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '700', color: '#EDEDED' }}>
                {score}
            </td>
            <td className="px-4 py-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                {finishStr}
            </td>
        </tr>
    );
}
