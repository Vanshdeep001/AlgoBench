import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Zap, Calendar, Award } from 'lucide-react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';
import HeroStrip from '../components/profile/HeroStrip';
import SubmissionHeatmap from '../components/profile/SubmissionHeatmap';
import RadialMeters from '../components/profile/RadialMeters';
import Insights from '../components/profile/Insights';
import RecentTable from '../components/profile/RecentActivityTable';
import '../styles/profile-redesign.css';
import axiosClient from '../utils/axiosClient';

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [heroStats, setHeroStats] = useState(null);
  const [statsCounts, setStatsCounts] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Artificial delay to match the "technical loading" feel
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchProfileData = async () => {
      try {
        const [statsRes, subsRes] = await Promise.all([
          axiosClient.get('/user/me/stats'),
          axiosClient.get('/user/me/submissions')
        ]);

        if (!mounted) return;

        const statsData = statsRes.data || {};
        const subsData = subsRes.data || {};

        // convert counts to percentages for radial meters
        const total = statsData.totalSolved || 0;
        const counts = total ? {
          easy: Math.round((statsData.easy / total) * 100),
          medium: Math.round((statsData.medium / total) * 100),
          hard: Math.round((statsData.hard / total) * 100)
        } : { easy: 0, medium: 0, hard: 0 };

        setStatsCounts(counts);
        setHeroStats({
          totalSolved: statsData.totalSolved || 0,
          streak: subsData.heatmap?.maxStreak || 0,
          acceptanceRate: '—',
          rank: '—'
        });

        setSubmissions(subsData.submissions || []);
        setHeatmapData(subsData.heatmap || null);
        setInsights({ ...(subsData.insights || {}), heatmap: subsData.heatmap || null });
      } catch (err) {
        // keep UI resilient — console for debugging
        // eslint-disable-next-line no-console
        console.error('Failed to load profile data', err);
      }
    };
    fetchProfileData();
    return () => { mounted = false; };
  }, [user]);

  if (!user || loading) return (
    <div className="profile-root flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
    </div>
  );
 
  return (
    <div className="profile-root">
      <div className="noise-overlay"></div>
      <SharedNavbar />

      <div className="profile-container">
        <HeroStrip 
          stats={heroStats || { totalSolved: 0, streak: 0, acceptanceRate: '0%', rank: '---' }} 
          counts={statsCounts} 
        />

        <div className="section-blueprint">
          <div className="section-head">
            <div className="section-icon"><Zap size={18} /></div>
            <h3 className="section-title">Submission Archive</h3>
          </div>
          <SubmissionHeatmap heatmapData={heatmapData} />
        </div>

        <div className="blueprint-grid">
          <div className="blueprint-col">
            <div className="section-head">
              <div className="section-icon"><Calendar size={18} /></div>
              <h3 className="section-title">Transmission Logs</h3>
            </div>
            <RecentTable submissions={submissions} />
            
            {/* Mobile-only Solve Metrics Progress Radial Charts */}
            {statsCounts && (
              <div className="flex lg:hidden flex-col items-center justify-center mt-8 pt-8 border-t border-white/[0.05] select-none">
                <div className="section-head w-full justify-center">
                  <div className="section-icon"><Award size={18} /></div>
                  <h3 className="section-title">Solve Metrics</h3>
                </div>
                <RadialMeters counts={statsCounts} flat={true} />
              </div>
            )}
          </div>

          <div className="blueprint-col">
            <div className="section-head">
              <div className="section-icon"><Zap size={18} /></div>
              <h3 className="section-title">Core Insights</h3>
            </div>
            <Insights data={insights} />
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Profile;
