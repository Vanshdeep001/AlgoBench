import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { ChevronRight, ArrowRight } from 'lucide-react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import GithubLoginButton from '../components/GithubLoginButton';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate('/problems');
    }
  };

  return (
    <div className="min-h-screen font-sans text-[#EDEDED] flex flex-col xl:flex-row overflow-hidden" style={{ backgroundColor: '#0B0B0E' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Brand Header (Mobile Only) */}
      <div className="xl:hidden p-6 relative z-50 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <img src="/algobench_logo_2_no_text.png?v=4" alt="AlgoBench" className="w-[18px] h-[18px] object-contain" />
          <span className="text-xl font-logo font-bold tracking-[0.03em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AlgoBench
          </span>
        </NavLink>
        <NavLink to="/login" className="text-[10px] font-creative font-bold uppercase tracking-widest text-[#D4AF37]">Login</NavLink>
      </div>

      {/* Left Column - Typographic Brand Presence */}
      <div className="hidden xl:flex xl:w-1/2 relative z-10 flex-col justify-between p-20 border-r border-white/5">
        <div>
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/algobench_logo_2_no_text.png?v=4" alt="AlgoBench" className="w-[22px] h-[22px] object-contain" />
            <span className="text-2xl font-logo font-bold tracking-[0.03em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AlgoBench
            </span>
          </NavLink>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-[9rem] font-creative font-bold text-white/[0.02] tracking-tighter leading-none select-none">
            ORIGIN
          </div>
          <div className="relative">
            <h1 className="text-6xl font-creative font-bold tracking-tighter leading-[0.85] mb-8">
              START <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(212, 175, 55, 0.3)' }}>YOUR</span> <br />
              LEGACY.
            </h1>
            <p className="text-slate-500 font-sans max-w-sm leading-relaxed text-lg">
              Initialize your presence in the most focused algorithmic community. Precision starts here.
            </p>
          </div>
        </div>


      </div>

      {/* Right Column - Premium Form */}
      <div className="w-full xl:w-1/2 relative z-10 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-4xl font-creative font-bold tracking-tight text-white mb-2 uppercase">Sign Up</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-red-500/20 bg-red-500/5 text-red-100 text-sm font-sans flex items-center gap-3 animate-[fade-in_0.3s_ease-out]">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="group relative">
              <label className="text-[10px] font-creative font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors mb-2 block">
                Primary Designation (Name)
              </label>
              <input
                type="text"
                placeholder="FIRST NAME"
                className="w-full bg-transparent border-b border-white/10 py-3 font-sans text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-slate-800"
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="absolute -bottom-6 left-0 text-[10px] font-unique text-red-400 uppercase tracking-widest">{errors.firstName.message}</span>
              )}
            </div>

            <div className="group relative">
              <label className="text-[10px] font-creative font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors mb-2 block">
                Identification (Email)
              </label>
              <input
                type="email"
                placeholder="ENGINEER@ALGOBENCH.COM"
                className="w-full bg-transparent border-b border-white/10 py-3 font-sans text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-slate-800"
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="absolute -bottom-6 left-0 text-[10px] font-unique text-red-400 uppercase tracking-widest">{errors.emailId.message}</span>
              )}
            </div>

            <div className="group relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-creative font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors block">
                  Security Key (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-creative font-bold text-slate-700 hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className="w-full bg-transparent border-b border-white/10 py-3 font-sans text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-slate-800"
                {...register('password')}
              />
              {errors.password && (
                <span className="absolute -bottom-6 left-0 text-[10px] font-unique text-red-400 uppercase tracking-widest">{errors.password.message}</span>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="group relative w-full border border-white/10 bg-white/5 py-4 overflow-hidden transition-all hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 disabled:opacity-50"
                disabled={loading}
              >
                <div className="absolute inset-0 w-0 bg-[#D4AF37] transition-all duration-500 group-hover:w-full opacity-10"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <span className="text-[12px] font-creative font-bold uppercase tracking-[0.4em] text-white group-hover:text-[#D4AF37] transition-colors">
                    {loading ? 'Processing...' : 'Initialize Identity'}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4 text-[#D4AF37] transition-transform group-hover:translate-x-1" />}
                </div>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mt-5">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] font-creative font-bold text-slate-700 uppercase tracking-[0.3em]">
              Or
            </span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          {/* Social Sign-In */}
          <div className="mt-4 flex gap-3">
            <GoogleLoginButton className="flex-1" />
            <GithubLoginButton className="flex-1" />
          </div>

          <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-creative font-bold text-slate-600 uppercase tracking-widest">Already Registered?</span>
            <NavLink to="/login" className="group flex items-center gap-2 text-[10px] font-creative font-bold text-white hover:text-[#D4AF37] transition-colors uppercase tracking-widest">
              Access Portal
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </NavLink>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Signup;