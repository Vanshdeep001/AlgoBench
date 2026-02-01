import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { Code, Trophy, Users, Zap, Brain, Target, ArrowRight, ChevronRight, Terminal, Sparkles, Menu, X, TrendingUp, BookOpen, BarChart3, CheckCircle2 } from 'lucide-react';
import LiveCodingEditor from '../components/LiveCodingEditor';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

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
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: '#0B0B0E', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Code className="w-5 h-5" style={{ color: '#D4AF37' }} />
                                </div>
                                <span className="text-lg md:text-xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                    AlgoBench
                                </span>
                            </div>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#9A9A9A' }}>
                                <a href="#problems" className="hover:text-white transition-colors">Problems</a>
                                <a href="#interview" className="hover:text-white transition-colors">Interview</a>
                                <a href="#contests" className="hover:text-white transition-colors">Contests</a>
                                <NavLink to="/visualizer" className="hover:text-white transition-colors">Visualizer</NavLink>
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
                    <a href="#problems" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Problems</a>
                    <a href="#interview" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Interview</a>
                    <a href="#contests" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Contests</a>
                    <NavLink to="/visualizer" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display font-bold text-slate-300 hover:text-white">Visualizer</NavLink>
                    <div className="w-16 h-px my-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                    <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Login</NavLink>
                    <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} className="px-8 py-4 rounded-full text-white font-bold text-lg transition-colors w-full text-center max-w-xs" style={{ backgroundColor: '#D4AF37' }}>
                        Get Started
                    </NavLink>
                </div>
            </div>


            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
                <div className="container mx-auto relative z-10">
                    {/* Two-column layout for desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">
                        {/* Left Column - Text Content */}
                        <div className="text-center lg:text-left lg:pl-12">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-8">
                                Build Real Algorithmic Skill. <br />
                                <span className="relative inline-block text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                                    <span className="absolute -inset-1 blur-2xl opacity-20" style={{ backgroundColor: '#D4AF37' }}></span>
                                    <span className="relative bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #D4AF37, #B8962E)' }}>
                                        One Problem at a Time.
                                    </span>
                                </span>
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12">
                                <NavLink
                                    to="/signup"
                                    className="w-full sm:w-auto h-12 px-8 rounded-full text-white font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                                    style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 40px -10px rgba(212, 175, 55, 0.5)' }}
                                >
                                    <Zap className="w-4 h-4" /> Start Practicing
                                </NavLink>
                                <button className="w-full sm:w-auto h-12 px-8 rounded-full text-slate-300 hover:text-white font-medium flex items-center justify-center gap-2 transition-all hover:-translate-y-1" style={{ backgroundColor: '#0B0B0E', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <Terminal className="w-4 h-4" /> Explore Problem Set
                                </button>
                            </div>

                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-[fade-in_1s_ease-out_1.2s_forwards]" style={{ color: '#9A9A9A' }}>
                                Solve curated DSA problems, track your performance, and understand why your solution works — not just whether it passes.
                            </p>

                            {/* Stats */}
                            <div id="stats" className="mt-20 pt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="text-center lg:text-left">
                                    <div className="text-3xl font-display font-bold text-white mb-1">600+</div>
                                    <div className="text-xs uppercase tracking-widest font-mono font-medium" style={{ color: '#9A9A9A' }}>Carefully Curated Problems</div>
                                </div>
                                <div className="text-center lg:text-left sm:border-l pt-8 sm:pt-0 border-t sm:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="text-3xl font-display font-bold text-white mb-1">Topic-wise</div>
                                    <div className="text-xs uppercase tracking-widest font-mono font-medium" style={{ color: '#9A9A9A' }}>&amp; Difficulty-wise</div>
                                </div>
                                <div className="text-center lg:text-left sm:border-l pt-8 sm:pt-0 border-t sm:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="text-3xl font-display font-bold text-white mb-1">Real</div>
                                    <div className="text-xs uppercase tracking-widest font-mono font-medium" style={{ color: '#9A9A9A' }}>Interview Patterns</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Live Coding Editor */}
                        <div className="hidden lg:block opacity-0 animate-[fade-in_1s_ease-out_0.6s_forwards]">
                            <LiveCodingEditor />
                        </div>
                    </div>

                    {/* Mobile Live Coding Editor - Below text on mobile/tablet */}
                    <div className="lg:hidden mt-16 opacity-0 animate-[fade-in_1s_ease-out_0.8s_forwards]">
                        <LiveCodingEditor />
                    </div>
                </div>
            </section>

            {/* Features Gri d */}
            <section id="features" className="py-24 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Why This Platform?</h2>
                        <p className="text-lg font-mono font-semibold" style={{ color: '#9A9A9A' }}>Most platforms tell you whether your code passes.<br />We focus on whether you actually improved.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                        <GlassCard
                            icon={<Target className="w-6 h-6" style={{ color: '#D4AF37' }} />}
                            title="Intentional Practice"
                            description="Problems grouped by concept, not randomness."
                            delay={0}
                        />
                        <GlassCard
                            icon={<BookOpen className="w-6 h-6" style={{ color: '#B8962E' }} />}
                            title="Solution Thinking, Not Just Code"
                            description="Editorials explain why an approach works and when to use it."
                            delay={100}
                        />
                        <GlassCard
                            icon={<BarChart3 className="w-6 h-6" style={{ color: '#D4AF37' }} />}
                            title="Performance Awareness"
                            description="Track time, memory, retries, and consistency."
                            delay={200}
                        />
                        <GlassCard
                            icon={<TrendingUp className="w-6 h-6" style={{ color: '#B8962E' }} />}
                            title="Built for Interview Reality"
                            description="Patterns you'll actually see — not trivia."
                            delay={300}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Sectio n */}
            <section id="how-it-works" className="py-24 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">From Practice to Confidence</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <StepCard
                            number="01"
                            title="Choose a topic or difficulty"
                            icon={<Target className="w-5 h-5" />}
                        />
                        <StepCard
                            number="02"
                            title="Solve problems with constraints in mind"
                            icon={<Code className="w-5 h-5" />}
                        />
                        <StepCard
                            number="03"
                            title="Compare approaches, not just outputs"
                            icon={<BarChart3 className="w-5 h-5" />}
                        />
                        <StepCard
                            number="04"
                            title="Track improvement over time"
                            icon={<TrendingUp className="w-5 h-5" />}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Sectio n */}
            <section className="py-24 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-24 text-center" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[150px] md:h-[300px] blur-[60px] md:blur-[100px] rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)' }}></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-6xl font-display font-bold text-white mb-6">Start Practicing Today.</h2>
                            <p className="text-lg md:text-xl font-mono mb-10 max-w-2xl mx-auto" style={{ color: '#9A9A9A' }}>
                                No distractions. No noise. Just problems that make you better.
                            </p>
                            <NavLink
                                to="/signup"
                                className="inline-flex h-12 md:h-14 px-8 items-center justify-center rounded-full text-white font-bold transition-all hover:scale-105 w-full sm:w-auto"
                                style={{ backgroundColor: '#D4AF37', boxShadow: '0 20px 60px -10px rgba(212, 175, 55, 0.3)' }}
                            >
                                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                            </NavLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* Foote r */}
            <footer className="py-12 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#0B0B0E', color: '#9A9A9A' }}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0B0B0E', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Code className="w-4 h-4" style={{ color: '#D4AF37' }} />
                            </div>
                            <span className="font-display font-bold text-slate-200">AlgoBench</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        </div>
                        <div className="text-center md:text-right">
                            &copy; {new Date().getFullYear()} AlgoBench Inc.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const GlassCard = ({ icon, title, description, delay }) => {
    return (
        <div
            className="group relative p-8 rounded-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.03] cursor-pointer overflow-hidden opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]"
            style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                animationDelay: `${delay}ms`,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
        >
            {/* Animated border glow */}
            <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 150, 46, 0.05) 100%)',
                    boxShadow: '0 0 40px rgba(212, 175, 55, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.05)'
                }}
            ></div>

            {/* Shimmer effect on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-3xl"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s infinite'
                }}
            ></div>

            {/* Subtle corner gradient */}
            <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ backgroundColor: '#D4AF37' }}
            ></div>

            <div className="relative z-10">
                {/* Icon container with enhanced styling */}
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 150, 46, 0.1) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)'
                    }}
                >
                    {/* Icon glow effect */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
                            filter: 'blur(10px)'
                        }}
                    ></div>
                    <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                        {icon}
                    </div>
                </div>

                {/* Title with gradient on hover */}
                <h3
                    className="text-xl font-display font-bold text-white mb-3 transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text"
                    style={{
                        backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                        WebkitBackgroundClip: 'text'
                    }}
                >
                    {title}
                </h3>

                {/* Description with smooth color transition */}
                <p
                    className="leading-relaxed font-mono text-sm transition-colors duration-500 group-hover:text-slate-300"
                    style={{ color: '#9A9A9A' }}
                >
                    {description}
                </p>
            </div>

            {/* Bottom border accent that animates */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-700"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
                }}
            ></div>
        </div>
    );
};

const StepCard = ({ number, title, icon }) => {
    return (
        <div
            className="group relative p-6 rounded-2xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.03] cursor-pointer overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
        >
            {/* Animated border glow */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 150, 46, 0.05) 100%)',
                    boxShadow: '0 0 40px rgba(212, 175, 55, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.05)'
                }}
            ></div>

            {/* Shimmer effect on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-2xl"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s infinite'
                }}
            ></div>

            {/* Subtle corner gradient */}
            <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ backgroundColor: '#D4AF37' }}
            ></div>

            <div className="flex items-start gap-4 relative z-10">
                {/* Icon container with enhanced styling */}
                <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 150, 46, 0.1) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#D4AF37',
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)'
                    }}
                >
                    {/* Icon glow effect */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
                            filter: 'blur(10px)'
                        }}
                    ></div>
                    <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                        {icon}
                    </div>
                </div>

                <div>
                    {/* Number with gradient on hover */}
                    <div
                        className="text-xs font-bold mb-2 transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text"
                        style={{
                            color: '#B8962E',
                            backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                            WebkitBackgroundClip: 'text'
                        }}
                    >
                        {number}
                    </div>

                    {/* Title with gradient on hover */}
                    <h3
                        className="text-base font-semibold text-white leading-snug transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text"
                        style={{
                            backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                            WebkitBackgroundClip: 'text'
                        }}
                    >
                        {title}
                    </h3>
                </div>
            </div>

            {/* Bottom border accent that animates */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-700"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
                }}
            ></div>
        </div>
    );
};

export default LandingPage;
