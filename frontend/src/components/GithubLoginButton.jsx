import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { githubLogin } from '../authSlice';
import { useState } from 'react';

function GithubLoginButton({ className = '' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [githubLoading, setGithubLoading] = useState(false);

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      const result = await dispatch(githubLogin());
      if (githubLogin.fulfilled.match(result)) {
        navigate('/problems');
      }
    } catch (err) {
      console.error('GitHub Sign-In failed:', err);
    } finally {
      setGithubLoading(false);
    }
  };

  const isLoading = loading || githubLoading;

  return (
    <button
      type="button"
      onClick={handleGithubSignIn}
      disabled={isLoading}
      className={`group relative w-full border border-white/10 bg-white/[0.03] py-4 overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {/* Hover fill effect */}
      <div className="absolute inset-0 w-0 bg-white transition-all duration-500 group-hover:w-full opacity-5"></div>

      <div className="relative flex items-center justify-center gap-3">
        {/* GitHub Octocat logo SVG */}
        {!isLoading && (
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        )}

        <span className="text-[11px] font-creative font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors whitespace-nowrap">
          {isLoading ? 'Connecting...' : 'GitHub'}
        </span>
      </div>
    </button>
  );
}

export default GithubLoginButton;
