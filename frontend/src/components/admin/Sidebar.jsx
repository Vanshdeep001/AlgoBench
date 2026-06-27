import React from 'react';
import { NavLink } from 'react-router';
import { Grid, FileText, Users, BarChart2, Settings } from 'lucide-react';

const items = [
  { to: '/admin', label: 'Overview', icon: Grid },
  { to: '/admin/submissions', label: 'Submissions', icon: FileText },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/problems', label: 'Problems', icon: FileText },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="admin-sidebar">
      <nav aria-label="Admin">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop:12 }}>
        <details style={{ color: 'var(--text-muted)' }}>
          <summary style={{ cursor:'pointer', fontWeight:700, marginBottom:8 }}>Difficulty Filter</summary>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
            <label style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Easy</span> <span style={{ color:'var(--success)', fontWeight:800 }}>•</span>
            </label>
            <label style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Medium</span> <span style={{ color:'var(--warning)', fontWeight:800 }}>•</span>
            </label>
            <label style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Hard</span> <span style={{ color:'var(--danger)', fontWeight:800 }}>•</span>
            </label>
          </div>
        </details>
      </div>
    </aside>
  );
};

export default Sidebar;

