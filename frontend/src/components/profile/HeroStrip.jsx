import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Edit3, Github } from 'lucide-react';
import RadialMeters from './RadialMeters';

const HeroStrip = ({ stats, counts }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  return (
    <div className="id-card-hero animate-fade-in flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
      <div className="flex items-center gap-10 flex-1">
        <div className="id-avatar-container">
          <div className="id-avatar">
            {user.firstName[0]}
          </div>
          <div className="id-avatar-frame"></div>
        </div>

        <div className="id-info flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="id-name">{user.firstName} {user.lastName}</h1>
            {user.githubUsername && (
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all font-mono text-[10px] bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-sm cursor-pointer"
              >
                <Github size={11} />
                github.com/{user.githubUsername}
              </a>
            )}
          </div>

          <div className="flex items-center mt-3">
            <button
              onClick={() => navigate('/edit-profile')}
              className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-[#D4AF37] border border-yellow-500/20 px-3 py-1 rounded-sm font-mono text-[9.5px] uppercase tracking-widest transition-all cursor-pointer"
            >
              <Edit3 size={11} /> Edit Profile
            </button>
          </div>

          <div className="id-stats-grid">
            <div className="id-stat-box">
              <span className="id-stat-value">{stats.totalSolved}</span>
              <span className="id-stat-label">SOLVED</span>
            </div>
            <div className="id-stat-box">
              <span className="id-stat-value">{stats.streak}d</span>
              <span className="id-stat-label">STREAK</span>
            </div>
            <div className="id-stat-box">
              <span className="id-stat-value">{stats.acceptanceRate}</span>
              <span className="id-stat-label">SUCCESS</span>
            </div>
            <div className="id-stat-box">
              <span className="id-stat-value">{stats.rank || '---'}</span>
              <span className="id-stat-label">RANK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Area: Efficiency Radial Meters */}
      {counts && (
        <div className="hidden lg:flex items-center justify-center pl-10 border-l border-white/[0.04] self-stretch py-2 select-none">
          <RadialMeters counts={counts} flat={true} />
        </div>
      )}

    </div>
  );
};

export default HeroStrip;
