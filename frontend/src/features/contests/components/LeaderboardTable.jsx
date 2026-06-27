import LeaderboardRow from './LeaderboardRow';

export default function LeaderboardTable({ leaderboard, currentUserId }) {
    return (
        <div
            className="overflow-hidden"
            style={{ 
                backgroundColor: 'rgba(14, 14, 16, 0.98)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0'
            }}
        >
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rank</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">User</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Finish time</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard?.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-mono text-xs">
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
