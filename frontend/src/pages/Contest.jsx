import { useParams, Navigate } from 'react-router';
import ContestDetails from '../features/contests/pages/ContestDetails';
import ContestArena from '../features/contests/pages/ContestArena';
import ContestLeaderboard from '../features/contests/pages/ContestLeaderboard';

export default function Contest() {
  const { contestId } = useParams();
  const path = window.location.pathname;

  if (path.includes('/arena')) return <ContestArena />;
  if (path.includes('/leaderboard')) return <ContestLeaderboard />;
  if (path.includes('/result')) return <Navigate to={`/contests/${contestId}`} replace />;
  return <ContestDetails />;
}
