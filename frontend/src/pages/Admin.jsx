import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, RefreshCw, Zap, Video, Trophy } from 'lucide-react';
import { NavLink } from 'react-router';
import SharedNavbar from '../components/SharedNavbar';
import Sidebar from '../components/admin/Sidebar';
import ProfileHeader from '../components/admin/ProfileHeader';
import Heatmap from '../components/admin/Heatmap';
import ProblemBreakdown from '../components/admin/ProblemBreakdown';
import RecentActivityTable from '../components/admin/RecentActivityTable';
import '../styles/admin.css';

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/10',
      route: '/admin/delete'
    },
    {
      id: 'contests',
      title: 'Manage Contests',
      description: 'Create contests, add problems, set schedule and publish',
      icon: Trophy,
      color: 'btn-primary',
      bgColor: 'bg-primary/10',
      route: '/admin/contests'
    }
  ];

  return (
    <div className="admin-root">
      <SharedNavbar />
      {/* TEMP: visual marker to confirm redesigned Admin is rendered */}
      <div style={{ width: '100%', background: 'linear-gradient(90deg, rgba(79,70,229,0.12), rgba(79,70,229,0.06))', color: 'var(--accent)', textAlign:'center', padding:'6px 0', fontWeight:700 }}>
        ADMIN REDESIGN ACTIVE — Indigo Theme
      </div>
      <main style={{ paddingTop: 20 }}>
        <div className="admin-container">
          <Sidebar />
          <div className="admin-main">
            <ProfileHeader stats={{ totalSolved: 0, totalSubmissions: 0, acceptanceRate: '0%' }} />

            <div className="activity-row">
              <div style={{ flex: 1 }}>
                <Heatmap weeks={26} rows={7} />
              </div>
              <div>
                <ProblemBreakdown />
              </div>
            </div>

            <RecentActivityTable />

            {/* Admin actions - keep existing option links in a compact row */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:12 }}>
              {adminOptions.map(opt => (
                <NavLink key={opt.id} to={opt.route} className="sidebar-item" style={{ borderLeft:'none', borderRadius:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <opt.icon size={16} /> <span style={{ fontWeight:700 }}>{opt.title}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;