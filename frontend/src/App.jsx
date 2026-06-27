import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect, lazy, Suspense } from "react";

// Lazy-loaded page components
const LandingPage = lazy(() => import("./pages/landingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Homepage = lazy(() => import("./pages/Homepage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const ProblemVisualizer = lazy(() => import("./pages/ProblemVisualizer"));
const DSAVisualizer = lazy(() => import("./components/visualizer"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Contests = lazy(() => import("./pages/Contests"));
const Contest = lazy(() => import("./pages/Contest"));
const CommunityHome = lazy(() => import("./features/community/pages/CommunityHome"));
const PostDetailPage = lazy(() => import("./features/community/pages/PostDetailPage"));

// Admin pages
const Admin = lazy(() => import("./pages/Admin"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const AdminDelete = lazy(() => import("./components/AdminDelete"));
const AdminContests = lazy(() => import("./components/AdminContests"));

// Legals / Payments compliance
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled"));

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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-[#9A9A9A] font-mono text-xs tracking-widest uppercase">Loading Module...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/problems" element={isAuthenticated ? <Homepage></Homepage> : <Navigate to="/login" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/edit-profile" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/admin/contests" element={isAuthenticated && user?.role === 'admin' ? <AdminContests /> : <Navigate to="/" />} />
        <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
        <Route path="/problem/:problemId/visualize" element={<ProblemVisualizer />}></Route>
        <Route path="/community" element={<CommunityHome user={user} isAuthenticated={!!isAuthenticated} currentUserId={user?._id} />} />
        <Route path="/community/posts/:postId" element={<PostDetailPage user={user} isAuthenticated={!!isAuthenticated} currentUserId={user?._id} />} />
        <Route path="/contests" element={isAuthenticated ? <Contests /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId/arena" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId/leaderboard" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId/result" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/contests/:contestId" element={isAuthenticated ? <Contest /> : <Navigate to="/login" />} />
        <Route path="/visualizer" element={<DSAVisualizer />}></Route>

        {/* Razorpay Compliance Routes */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />

      </Routes>
    </Suspense>
  )
}

export default App;