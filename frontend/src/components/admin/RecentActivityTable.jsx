import React from 'react';

const RecentActivityTable = ({ rows = [] }) => {
  const data = rows.length ? rows : [
    { title: 'Two Sum', difficulty: 'Easy', status: 'Accepted', runtime: '12ms', date: '2026-02-10' },
    { title: 'Graph Paths', difficulty: 'Hard', status: 'Wrong Answer', runtime: '—', date: '2026-02-09' },
    { title: 'Median of Two Arrays', difficulty: 'Medium', status: 'Accepted', runtime: '45ms', date: '2026-02-08' },
  ];
  return (
    <div className="recent-panel">
      <h3 style={{ margin:0, marginBottom:12, color:'var(--text-primary)' }}>Recent Activity</h3>
      <table className="recent-table" role="table">
        <thead>
          <tr>
            <th>Problem Name</th>
            <th>Difficulty</th>
            <th>Status</th>
            <th>Runtime</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td style={{ color:'var(--text-primary)', fontWeight:700 }}>{r.title}</td>
              <td style={{ color:'var(--text-muted)' }}>{r.difficulty}</td>
              <td style={{ color: r.status === 'Accepted' ? 'var(--success)' : 'var(--text-muted)' }}>{r.status}</td>
              <td style={{ color:'var(--text-muted)' }}>{r.runtime}</td>
              <td style={{ color:'var(--text-muted)' }}>{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivityTable;

