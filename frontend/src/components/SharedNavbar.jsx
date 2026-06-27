import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../authSlice';
import UserDropdown from './UserDropdown';

const SharedNavbar = ({ flat = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const getNavLinkClass = ({ isActive }) =>
    `transition-all duration-300 hover:text-[#D4AF37] relative ${
      isActive
        ? 'text-[#D4AF37]'
        : 'text-[#9A9A9A]'
    }`;

  const renderNavLinks = () => (
    <div className="hidden md:flex items-center gap-10 text-[11px] font-navbar font-bold uppercase tracking-[0.1em]">
      <NavLink to="/problems" className={getNavLinkClass}>Problems</NavLink>
      <NavLink to="/contests" className={getNavLinkClass}>Contests</NavLink>
      <NavLink to="/community" className={getNavLinkClass}>Community</NavLink>
      <NavLink to="/visualizer" className={getNavLinkClass}>Visualizer</NavLink>
    </div>
  );

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return <UserDropdown />;
    }
    return (
      <div className="hidden md:flex items-center gap-4">
        <NavLink
          to="/login"
          className="relative text-[10.5px] font-navbar font-extrabold uppercase tracking-[0.15em] text-[#9A9A9A] hover:text-[#D4AF37] transition-all duration-300 px-4 py-2 group cursor-pointer"
        >
          Login
          <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
        </NavLink>
        <NavLink
          to="/signup"
          className="px-5 py-2.5 rounded-sm bg-[#D4AF37] border border-[#D4AF37] text-[10.5px] font-navbar font-extrabold uppercase tracking-[0.15em] text-[#0b0b0e] hover:bg-transparent hover:text-[#D4AF37] transition-all duration-300 cursor-pointer"
        >
          Enroll Now
        </NavLink>
      </div>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${flat ? 'py-2 border-b border-white/[0.03] bg-[#09090C]/90 backdrop-blur-md' : (scrolled ? 'py-4' : 'py-6')}`}>
        <div className={flat ? "w-full px-8" : "container mx-auto px-4"}>
          {flat ? (
            <div className="flex items-center justify-between">
              <NavLink to="/" className="flex items-center gap-2.5">
                <img src="/algobench_logo_2_no_text.png?v=4" alt="AlgoBench" className="w-[28px] h-[28px] object-contain" />
                <span className="text-lg md:text-xl font-logo font-bold tracking-[0.12em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AlgoBench</span>
              </NavLink>

              {renderNavLinks()}

              <div className="flex items-center gap-4">
                {renderAuthButtons()}
                <button className="md:hidden p-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl rounded-full backdrop-blur-md transition-all duration-300" style={{ border: `1px solid rgba(255,255,255,${scrolled ? '0.1' : '0.08'})`, backgroundColor: scrolled ? 'rgba(11, 11, 14, 0.8)' : 'transparent', boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.25)' : 'none', padding: scrolled ? '0.75rem 1.5rem' : '0.5rem 1rem' }}>
              <div className="flex items-center justify-between">
                <NavLink to="/" className="flex items-center gap-2.5">
                  <img src="/algobench_logo_2_no_text.png?v=4" alt="AlgoBench" className="w-[28px] h-[28px] object-contain" />
                  <span className="text-lg md:text-xl font-logo font-bold tracking-[0.12em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AlgoBench</span>
                </NavLink>

                {renderNavLinks()}

                <div className="flex items-center gap-4">
                  {renderAuthButtons()}
                  <button className="md:hidden p-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 backdrop-blur-2xl md:hidden transition-all duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: 'rgba(11, 11, 14, 0.98)' }}>
        <div className="flex flex-col items-start justify-center h-full gap-10 p-12">
          <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">Problems</NavLink>
          <NavLink to="/contests" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-navbar font-bold tracking-tight text-slate-300 hover:text-[#D4AF37] transition-colors">Contests</NavLink>
          <NavLink to="/community" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-navbar font-bold tracking-tight text-slate-300 hover:text-[#D4AF37] transition-colors">Community</NavLink>
          <NavLink to="/visualizer" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-navbar font-bold tracking-tight text-slate-300 hover:text-[#D4AF37] transition-colors">Visualizer</NavLink>
          <div className="w-full h-px bg-white/10 my-4"></div>
          {isAuthenticated ? (
            <div className="flex flex-col gap-6 w-full text-left">
              <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">My Profile</NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">Admin Panel</NavLink>
              )}
              <button onClick={handleLogout} className="text-3xl font-navbar font-bold tracking-tight text-red-500 hover:text-red-400 transition-colors text-left cursor-pointer">Sign Out</button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-navbar font-bold uppercase tracking-widest text-slate-400">Login</NavLink>
              <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-xl font-navbar font-bold uppercase tracking-widest text-[#D4AF37]">Enroll Now</NavLink>
            </div>
          )}
        </div>
      </div>

      {/* spacer so page content doesn't jump */}
      <div className="shrink-0" style={{ height: flat ? 48 : (scrolled ? 80 : 96) }} />
    </>
  );
};

export default SharedNavbar;
