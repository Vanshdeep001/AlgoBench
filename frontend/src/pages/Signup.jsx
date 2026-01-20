import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { Code, Menu, X, ChevronRight } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen font-sans text-[#EDEDED] selection:bg-[#D4AF37]/30" style={{ backgroundColor: '#0B0B0E' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px] animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }}></div>
        <div className="absolute top-[40%] right-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full blur-[80px] md:blur-[128px] animate-pulse delay-1000" style={{ backgroundColor: 'rgba(184, 150, 46, 0.06)' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
        <div className="container mx-auto px-4">
          <div className={`mx-auto max-w-5xl rounded-full backdrop-blur-md transition-all duration-300`} style={{ border: `1px solid rgba(255,255,255,${scrolled ? '0.1' : '0.08'})`, backgroundColor: scrolled ? 'rgba(11, 11, 14, 0.8)' : 'transparent', boxShadow: scrolled ? '0 10px 40px -10px rgba(212, 175, 55, 0.1)' : 'none', padding: scrolled ? '0.75rem 1.5rem' : '0.5rem 1rem' }}>
            <div className="flex items-center justify-between">
              <NavLink to="/" className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#0B0B0E', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Code className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>
                <span className="text-lg md:text-xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  AlgoBench
                </span>
              </NavLink>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#9A9A9A' }}>
                <a href="/#problems" className="hover:text-white transition-colors">Problems</a>
                <a href="/#interview" className="hover:text-white transition-colors">Interview</a>
                <a href="/#contests" className="hover:text-white transition-colors">Contests</a>
                <a href="/#visualizer" className="hover:text-white transition-colors">Visualizer</a>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <NavLink to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
                  Login
                </NavLink>
                <NavLink to="/signup" className="group relative px-5 py-2 rounded-full bg-white text-sm font-bold overflow-hidden transition-all hover:scale-105 active:scale-95" style={{ color: '#0B0B0E' }}>
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: 'linear-gradient(to right, #D4AF37, #B8962E, #D4AF37)' }}></div>
                  <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-1">
                    Get Started <ChevronRight className="w-3 h-3" />
                  </span>
                </NavLink>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 backdrop-blur-xl md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} style={{ backgroundColor: 'rgba(11, 11, 14, 0.95)' }}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
          <a href="/#problems" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Problems</a>
          <a href="/#interview" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Interview</a>
          <a href="/#contests" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Contests</a>
          <a href="/#visualizer" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Visualizer</a>
          <div className="w-16 h-px my-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Login</NavLink>
          <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} className="px-8 py-4 rounded-full text-white font-bold text-lg transition-colors w-full text-center max-w-xs" style={{ backgroundColor: '#D4AF37' }}>
            Get Started
          </NavLink>
        </div>
      </div>

      {/* Signup Form */}
      <div className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 flex items-center justify-center min-h-screen">
        <div className="relative z-10 w-full max-w-md">
          <div
            className="relative rounded-3xl overflow-hidden p-8 md:p-10 transition-all duration-700 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(212, 175, 55, 0.1)'
            }}
          >
            {/* Card glow effect */}
            <div className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(184, 150, 46, 0.02) 100%)' }}></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-2 bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #D4AF37, #B8962E)' }}>
                Create Account
              </h2>
              <p className="text-center mb-8 font-mono text-sm" style={{ color: '#9A9A9A' }}>Start your coding journey today</p>

              {error && (
                <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#EDEDED' }}>First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'rgba(11, 11, 14, 0.6)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      focusRingColor: '#D4AF37'
                    }}
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <span className="text-sm mt-1 block" style={{ color: '#FCA5A5' }}>{errors.firstName.message}</span>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#EDEDED' }}>Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'rgba(11, 11, 14, 0.6)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      focusRingColor: '#D4AF37'
                    }}
                    {...register('emailId')}
                  />
                  {errors.emailId && (
                    <span className="text-sm mt-1 block" style={{ color: '#FCA5A5' }}>{errors.emailId.message}</span>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#EDEDED' }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'rgba(11, 11, 14, 0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        focusRingColor: '#D4AF37'
                      }}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 transition-colors"
                      style={{ color: '#9A9A9A' }}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-sm mt-1 block" style={{ color: '#FCA5A5' }}>{errors.password.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 40px -10px rgba(212, 175, 55, 0.5)' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing Up...
                    </>
                  ) : 'Sign Up'}
                </button>
              </form>

              <div className="text-center mt-6">
                <span className="text-sm font-mono" style={{ color: '#9A9A9A' }}>
                  Already have an account?{' '}
                  <NavLink to="/login" className="font-semibold transition-colors" style={{ color: '#D4AF37' }}>
                    Login
                  </NavLink>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;