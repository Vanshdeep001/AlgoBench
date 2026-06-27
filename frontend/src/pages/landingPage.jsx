import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
import LiveCodingEditor from '../components/LiveCodingEditor';
import PublicFooter from '../components/PublicFooter';

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

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const scrollToPricing = () => {
        const el = document.getElementById('pricing');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen font-sans text-[#EDEDED] selection:bg-[#D4AF37]/30 overflow-x-hidden" style={{ backgroundColor: '#0B0B0E' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}></div>
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0 py-6'}`}>
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <img src="/algobench_logo_2_no_text.png?v=4" alt="AlgoBench" className="w-[28px] h-[28px] object-contain" />
                            <span className="text-lg md:text-xl font-logo font-bold tracking-[0.03em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AlgoBench</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-10 text-[11px] font-navbar font-bold uppercase tracking-[0.1em]" style={{ color: '#9A9A9A' }}>
                            <NavLink to="/problems" className="hover:text-[#D4AF37] transition-all duration-300">Problems</NavLink>
                            <NavLink to="/community" className="hover:text-[#D4AF37] transition-all duration-300">Community</NavLink>
                            <NavLink to="/contests" className="hover:text-[#D4AF37] transition-all duration-300">Contests</NavLink>
                            <NavLink to="/visualizer" className="hover:text-[#D4AF37] transition-all duration-300">Visualizer</NavLink>
                            <button onClick={scrollToPricing} className="hover:text-[#D4AF37] transition-all duration-300 uppercase cursor-pointer focus:outline-none">Pricing</button>
                        </div>

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

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-slate-300 hover:text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 backdrop-blur-2xl md:hidden transition-all duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: 'rgba(11, 11, 14, 0.98)' }}>
                <div className="flex flex-col items-start justify-center h-full gap-8 p-12">
                    <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">Problems</NavLink>
                    <NavLink to="/community" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">Community</NavLink>
                    <NavLink to="/contests" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">Contests</NavLink>
                    <NavLink to="/visualizer" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">Visualizer</NavLink>
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            scrollToPricing();
                        }}
                        className="text-4xl font-navbar font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors text-left focus:outline-none cursor-pointer uppercase"
                    >
                        Pricing
                    </button>
                    <div className="w-full h-px bg-white/10 my-2"></div>
                    <div className="flex flex-col gap-6 w-full">
                        <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-navbar font-bold uppercase tracking-widest text-slate-400">Login</NavLink>
                        <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-xl font-navbar font-bold uppercase tracking-widest text-[#D4AF37]">Enroll Now</NavLink>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start max-w-[1400px] mx-auto">
                        {/* Left Content */}
                        <div className="lg:col-span-12 xl:col-span-7">
                            <div className="mb-8 overflow-hidden">
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-creative font-bold tracking-tighter leading-[0.9] mb-12 animate-[fade-in-up_1s_ease-out_0.2s_forwards] opacity-0">
                                MASTER THE <br />
                                <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>ALGORITHM</span> <br />
                                <span className="text-[#D4AF37]">CRAFT.</span>
                            </h1>

                            <p className="text-lg md:text-xl font-sans text-slate-400 max-w-xl leading-relaxed mb-12 animate-[fade-in-up_1s_ease-out_0.4s_forwards] opacity-0">
                                A premium environment designed for engineers who prioritize depth over speed. Solve complex problems with editorial precision.
                            </p>

                             <div className="flex flex-wrap gap-6 animate-[fade-in-up_1s_ease-out_0.6s_forwards] opacity-0">
                                <NavLink
                                    to="/signup"
                                    className="group relative inline-flex items-center gap-3.5 py-4 text-white text-[12px] font-navbar font-extrabold uppercase tracking-[0.25em] transition-all duration-300"
                                >
                                    {/* Terminal indicator */}
                                    <span className="text-[#D4AF37] font-mono text-lg transition-transform duration-300 group-hover:translate-x-1.5">
                                        &gt;
                                    </span>

                                    {/* Link text */}
                                    <span className="relative bg-gradient-to-r from-[#EDEDED] to-[#EDEDED] group-hover:from-white group-hover:to-[#D4AF37] bg-clip-text text-transparent transition-all duration-500 ease-out">
                                        Start Journey
                                    </span>

                                    {/* Animated sliding arrow */}
                                    <ArrowRight className="w-4 h-4 text-[#D4AF37] transition-all duration-300 transform group-hover:translate-x-2 group-hover:scale-110" />

                                    {/* Ultra-thin technical line indicator under the text */}
                                    <div className="absolute bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/50 to-transparent transition-all duration-500 group-hover:w-full"></div>
                                </NavLink>
                            </div>
                        </div>

                        {/* Right Content - Embedded Editor */}
                        <div className="lg:col-span-12 xl:col-span-5 hidden xl:block pl-8">
                            <div className="relative animate-[fade-in_1.5s_ease-out_0.8s_forwards] opacity-0 scale-95 origin-right">
                                <div className="absolute -inset-20 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>
                                <LiveCodingEditor showTestcases={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Split Section - Features */}
            <section id="features" className="py-32 border-t border-white/5 relative z-10 bg-[#0B0B0E]">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="text-center mb-32">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-creative font-bold leading-none uppercase">
                            ARCHITECTURE <br />
                            <span className="text-slate-500">OVER UTILITY.</span>
                        </h2>
                    </div>

                    <div className="space-y-0">
                        <EditorialFeature
                            index="01"
                            title="Intentional Strategy"
                            description="Problems grouped by concept, not randomness. Each problem set is a curated path toward mastery."
                        />
                        <EditorialFeature
                            index="02"
                            title="Editorial Depth"
                            description="Detailed walkthroughs that explain not just the 'how', but the 'why' behind every optimal approach."
                        />
                        <EditorialFeature
                            index="03"
                            title="Precision Analysis"
                            description="Advanced tracking for runtime, memory efficiency, and implementation consistency."
                        />
                        <EditorialFeature
                            index="04"
                            title="Live Code Simulation"
                            description="Interactive step-by-step memory, stack frame, and trace visualizer built inside the workspace."
                        />
                        <EditorialFeature
                            index="05"
                            title="Corporate Prep Sheets"
                            description="Curated preparation sheets and mock contests designed around actual corporate OA patterns."
                        />
                    </div>
                </div>
            </section>

            {/* Path Section - How it Works */}
            <section id="how-it-works" className="py-32 border-t border-white/5 relative z-10 overflow-hidden">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="text-center mb-32">
                        <h2 className="text-5xl md:text-8xl font-unique font-bold opacity-10 leading-none absolute left-0 right-0 -translate-y-1/2 pointer-events-none">
                            METHODOLOGY
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-creative font-bold relative z-10">THE DISCIPLINE.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1px bg-white/5 border border-white/5 overflow-hidden">
                        {[
                            { step: "Selection", text: "Identity core patterns through highly filtered problem sets." },
                            { step: "Execution", text: "Implement solutions under strict constraints and live feedback." },
                            { step: "Critique", text: "Compare implementation against expert editorial standards." },
                            { step: "Iteration", text: "Optimize logic until performance reaches the theoretical peak." }
                        ].map((item, i) => (
                            <div key={i} className="p-12 bg-[#0B0B0E] hover:bg-white/[0.02] transition-all duration-700">
                                <span className="block text-[10px] font-unique text-[#D4AF37] mb-6">STEP_{i + 1}</span>
                                <h4 className="text-2xl font-creative font-bold text-white mb-6 uppercase tracking-tighter">{item.step}</h4>
                                <p className="text-sm font-sans text-slate-500 leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 border-t border-white/5 relative z-10 bg-[#0B0B0E]">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.25em] block mb-4">MEMBERSHIPS</span>
                        <h2 className="text-4xl md:text-6xl font-creative font-bold leading-none mb-6">
                            SELECT YOUR <br />
                            <span className="text-slate-500">COMMITMENT.</span>
                        </h2>
                        <p className="text-slate-400 text-sm max-w-md mx-auto font-sans leading-relaxed">
                            Unlock full access to editorial walkthroughs, premium contests, and deep analysis.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                        {/* Free Plan */}
                        <div className="border border-white/[0.04] bg-[#07080a]/30 p-10 rounded-sm flex flex-col justify-between hover:border-white/10 transition-all duration-500 relative">
                            <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Basic Access</span>
                                <h3 className="text-2xl font-creative font-bold text-white mb-6 uppercase">Free Plan</h3>
                                <div className="mb-8">
                                    <span className="text-4xl font-creative font-bold text-white">₹0</span>
                                    <span className="text-xs text-slate-500 font-mono ml-2">/ FOREVER</span>
                                </div>
                                <ul className="space-y-4 mb-10 text-xs text-slate-400">
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Interactive Coding Workspace</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Code Compilation & Execution</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Interactive Algorithm Visualizer</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Code Execution Simulator</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Access to Standard DSA Problem Library</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Community Discussions</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Public Coding Contests</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Submission Heatmap</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="font-display font-medium text-zinc-200 tracking-wide text-[13px]">Basic Editorials</span>
                                    </li>
                                </ul>
                            </div>
                            <NavLink to="/signup" className="w-full text-center bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3.5 rounded-sm font-creative text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer">
                                Start Coding Free
                            </NavLink>
                        </div>

                        {/* Premium Plan */}
                        <div className="border-2 border-[#ff6b00]/70 bg-[#07080a]/60 p-10 rounded-sm flex flex-col justify-between hover:border-[#ff6b00]/90 transition-all duration-500 relative shadow-[0_0_40px_rgba(255,107,0,0.15)] md:scale-[1.03]">
                            <div>
                                <span className="text-[10px] font-mono text-[#ff6b00] uppercase tracking-widest block mb-2">Full Access</span>
                                <h3 className="text-2xl font-creative font-bold text-white mb-6 uppercase">Premium Plan</h3>
                                <div className="mb-8">
                                    <span className="text-4xl font-creative font-bold text-white">₹99</span>
                                </div>

                                <ul className="space-y-4 mb-10 text-xs text-slate-300">
                                    <li className="text-emerald-400 font-display font-semibold text-[10px] pb-2 border-b border-white/5 flex items-center gap-2 uppercase tracking-wider">
                                        Includes everything in the Free Plan PLUS:
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#ff6b00] font-bold mt-0.5">✓</span>
                                        <div>
                                            <span className="font-display font-bold text-zinc-100 tracking-wide text-[13px] block">Complete Company Sheets</span>
                                            <p className="font-sans text-[10.5px] text-slate-500 mt-1 leading-relaxed">Google, Amazon, Microsoft, Adobe, Atlassian, Uber, Oracle, Goldman Sachs, Flipkart, and more.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#ff6b00] font-bold mt-0.5">✓</span>
                                        <div>
                                            <span className="font-display font-bold text-zinc-100 tracking-wide text-[13px] block">Company-wise FAQs</span>
                                            <p className="font-sans text-[10.5px] text-slate-500 mt-1 leading-relaxed">Know which problems are asked most often by each company.</p>
                                        </div>
                                    </li>

                                    <li className="flex items-start gap-3">
                                        <span className="text-[#ff6b00] font-bold mt-0.5">✓</span>
                                        <div>
                                            <span className="font-display font-bold text-zinc-100 tracking-wide text-[13px] block">Solutions with Dry Run</span>
                                            <p className="font-sans text-[10.5px] text-slate-500 mt-1 leading-relaxed">Line-by-line visual dry runs and video explanations for complex patterns.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#ff6b00] font-bold mt-0.5">✓</span>
                                        <div>
                                            <span className="font-display font-bold text-zinc-100 tracking-wide text-[13px] block">Premium Company Pattern Contests</span>
                                            <p className="font-sans text-[10.5px] text-slate-500 mt-1 leading-relaxed">Experience mock contests designed around actual corporate OA patterns.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#ff6b00] font-bold mt-0.5">✓</span>
                                        <div>
                                            <span className="font-display font-bold text-zinc-100 tracking-wide text-[13px] block">Pattern-wise Prep Sheets</span>
                                            <p className="font-sans text-[10.5px] text-slate-500 mt-1 leading-relaxed">Targeted preparation sheets spanning 15 high-frequency algorithm patterns.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <NavLink to="/signup" className="w-full text-center bg-[#ff6b00] hover:bg-[#e05e00] text-black py-3.5 rounded-sm font-creative text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                                Upgrade Now
                            </NavLink>
                        </div>
                    </div>

                    {/* Pricing Disclosure Footer */}
                    <div className="mt-16 text-center max-w-2xl mx-auto">
                        <p className="text-[9.5px] font-mono text-slate-600 leading-relaxed">
                            Users may cancel subscriptions at any time. Please refer to the{' '}
                            <NavLink to="/refund" className="text-[#D4AF37] hover:underline">
                                Refund & Cancellation Policy
                            </NavLink>{' '}
                            for details on refund eligibility. Prices are inclusive of all applicable taxes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 relative z-10">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto border-t border-white/5 pt-20">
                        <h2 className="text-5xl md:text-8xl font-creative font-bold mb-12 tracking-tighter">
                            CODE WITH <br />
                            <span className="text-[#D4AF37]">INTENTION.</span>
                        </h2>

                        <div className="flex flex-col items-center gap-8">
                            <p className="text-xl text-slate-400 font-sans max-w-2xl mx-auto">
                                Join a community of engineers who build with precision.
                            </p>

                            <NavLink
                                to="/signup"
                                className="h-20 px-16 rounded-full bg-white text-black text-[12px] font-creative font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all duration-500 transform hover:scale-105"
                            >
                                Get Started Now
                            </NavLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reusable Public Footer */}
            <PublicFooter />

            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

const EditorialFeature = ({ index, title, description }) => {
    return (
        <div className="group border-b border-white/5 py-16 hover:bg-white/[0.01] transition-all duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-1">
                    <span className="text-2xl font-unique text-slate-700 group-hover:text-[#D4AF37] transition-colors">{index}</span>
                </div>
                <div className="lg:col-span-4">
                    <h3 className="text-3xl font-creative font-bold text-white tracking-tighter uppercase">{title}</h3>
                </div>
                <div className="lg:col-span-6">
                    <p className="text-slate-500 font-sans leading-relaxed max-w-xl group-hover:text-slate-300 transition-colors">
                        {description}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
