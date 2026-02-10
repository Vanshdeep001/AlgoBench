import { useParams } from 'react-router';
import ContestDetails from '../features/contests/pages/ContestDetails';
import ContestArena from '../features/contests/pages/ContestArena';
import ContestLeaderboard from '../features/contests/pages/ContestLeaderboard';
import ContestResult from '../features/contests/pages/ContestResult';

export default function Contest() {
  const { contestId } = useParams();
  const path = window.location.pathname;

  if (path.includes('/arena')) return <ContestArena />;
  if (path.includes('/leaderboard')) return <ContestLeaderboard />;
  if (path.includes('/result')) return <ContestResult />;
  return <ContestDetails />;
}
