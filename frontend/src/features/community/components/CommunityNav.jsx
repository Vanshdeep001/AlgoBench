import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { Code, Menu, X } from 'lucide-react';
import UserDropdown from '../../../components/UserDropdown';

export default function CommunityNav({ user }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    }, [mobileMenuOpen]);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
                <div className="container mx-auto px-4">
                    <div
                        className="mx-auto max-w-7xl rounded-full backdrop-blur-md transition-all duration-300"
                        style={{
                            border: `1px solid rgba(255,255,255,${scrolled ? '0.1' : '0.08'})`,
                            backgroundColor: scrolled ? 'rgba(11, 11, 14, 0.8)' : 'transparent',
                            boxShadow: scrolled ? '0 10px 40px -10px rgba(212, 175, 55, 0.1)' : 'none',
                            padding: scrolled ? '0.75rem 1.5rem' : '0.5rem 1rem'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <NavLink to="/problems" className="flex items-center gap-2">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: '#0B0B0E', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Code className="w-5 h-5" style={{ color: '#D4AF37' }} />
                                </div>
                                <span className="text-lg md:text-xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                    AlgoBench
                                </span>
                            </NavLink>

                            <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#9A9A9A' }}>
                                <NavLink to="/problems" className="hover:text-white transition-colors">Problems</NavLink>
                                <NavLink to="/community" className="text-white transition-colors">Community</NavLink>
                                <NavLink to="/visualizer" className="hover:text-white transition-colors">Visualizer</NavLink>
                            </div>

                            <div className="hidden md:flex items-center gap-3">
                                {user ? <UserDropdown user={user} /> : (
                                    <>
                                        <NavLink to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2">Login</NavLink>
                                        <NavLink to="/signup" className="px-4 py-2 rounded-full text-sm font-bold transition-colors" style={{ backgroundColor: '#D4AF37', color: '#0B0B0E' }}>Get Started</NavLink>
                                    </>
                                )}
                            </div>

                            <button className="md:hidden p-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={`fixed inset-0 z-40 backdrop-blur-xl md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} style={{ backgroundColor: 'rgba(11, 11, 14, 0.95)' }}>
                <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
                    <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Problems</NavLink>
                    <NavLink to="/community" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-white">Community</NavLink>
                    <NavLink to="/visualizer" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Visualizer</NavLink>
                    <div className="w-16 h-px my-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    {user ? (
                        <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Dashboard</NavLink>
                    ) : (
                        <>
                            <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Login</NavLink>
                            <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} className="px-8 py-4 rounded-full text-white font-bold" style={{ backgroundColor: '#D4AF37' }}>Get Started</NavLink>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
