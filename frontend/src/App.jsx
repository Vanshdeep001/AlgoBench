import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo"
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload"
import AdminContests from "./components/AdminContests"
import LandingPage from "./pages/landingPage"
import DSAVisualizer from "./components/visualizer"
import Profile from "./pages/Profile"
import CommunityHome from "./features/community/pages/CommunityHome"
import PostDetailPage from "./features/community/pages/PostDetailPage"
import Contests from "./pages/Contests"
import Contest from "./pages/Contest"

function App() {

  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/problems" element={isAuthenticated ? <Homepage></Homepage> : <Navigate to="/login" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
        <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
        <Route path="/admin/contests" element={isAuthenticated && user?.role === 'admin' ? <AdminContests /> : <Navigate to="/" />} />
        <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
        <Route path="/community" element={<CommunityHome user={user} isAuthenticated={!!isAuthenticated} currentUserId={user?._id} />} />
        <Route path="/community/posts/:postId" element={<PostDetailPage user={user} isAuthenticated={!!isAuthenticated} currentUserId={user?._id} />} />
        <Route path="/contests" element={isAuthenticated ? <Contests /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId/arena" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId/leaderboard" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId/result" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/visualizer" element={<DSAVisualizer />}></Route>

      </Routes>
    </>
  )
}

export default App;