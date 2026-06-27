import React from 'react';
import { useSelector } from 'react-redux';

const ProfileHeader = ({ stats }) => {
  const { user } = useSelector((s) => s.auth);
  return (
    <header className="admin-header">
      <div className="profile-left">
        <div className="avatar">{user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}</div>
        <div className="profile-meta">
          <div style={{ fontWeight:800, color:'var(--text-primary)' }}>{user?.username || user?.email || 'algouser'}</div>
          <div style={{ color:'var(--text-muted)', fontSize:13 }}>{user?.role?.toUpperCase() || 'ADMIN'} • Joined N/A</div>
        </div>
      </div>
      <div className="quick-stats">
        <div><span style={{ color:'var(--text-muted)', fontWeight:700 }}>Total Solved</span> <div style={{ fontWeight:800 }}>{stats?.totalSolved ?? 0}</div></div>
        <div><span style={{ color:'var(--text-muted)', fontWeight:700 }}>Submissions</span> <div style={{ fontWeight:800 }}>{stats?.totalSubmissions ?? 0}</div></div>
        <div><span style={{ color:'var(--text-muted)', fontWeight:700 }}>Accept Rate</span> <div style={{ fontWeight:800 }}>{stats?.acceptanceRate ?? '0%'}</div></div>
      </div>
    </header>
  );
};

export default ProfileHeader;

