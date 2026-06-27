import React, { useEffect } from 'react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen text-[#EDEDED] font-sans overflow-x-hidden relative" style={{ backgroundColor: '#0B0B0E' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}></div>
            </div>

            <SharedNavbar flat={true} />

            <div className="container mx-auto px-6 max-w-[900px] py-20 relative z-10">
                <div className="space-y-16">
                    {/* Header */}
                    <div className="border-b border-white/5 pb-8">
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.25em] block mb-3">OUR ORIGIN</span>
                        <h1 className="text-4xl md:text-6xl font-creative font-bold tracking-tighter leading-none mb-6">
                            ABOUT <br />
                            <span className="text-slate-500">ALGOBENCH.</span>
                        </h1>
                        <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                            We build premium environments for software engineers who prioritize depth, optimal complexity, and clean code architecture.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block">MISSION</span>
                            <h3 className="text-xl font-creative font-bold uppercase text-white">Mastery Over Rote Learning</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                Our mission is to move software engineers away from repetitive memorization. We provide visual trace graphs, optimal complexity analysis, and strict compiler constraints that challenge you to understand the underlying principles of algorithmic systems.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block">VISION</span>
                            <h3 className="text-xl font-creative font-bold uppercase text-white">The Engineering Benchmark</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                We envision a world where technical assessments measure creative problem-solving and architectural intuition. AlgoBench serves as the platform where top engineering candidates refine their skills to meet the highest industry standards.
                            </p>
                        </div>
                    </div>

                    {/* Why we exist */}
                    <div className="p-8 border border-white/[0.04] bg-[#07080a]/30 rounded-sm space-y-4">
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block">OUR COMMITMENT</span>
                        <h3 className="text-lg font-creative font-bold text-white uppercase">Technical Interview Preparation</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            Preparing for technical interviews at world-class companies requires more than just submitting code. It demands writing clean implementations, selecting the most optimal space-time trade-offs, and debug-level clarity. AlgoBench is specifically optimized to help candidates prepare for tier-1 technical interviews with custom-designed visualizers, curated roadmap sheets, and community review systems.
                        </p>
                    </div>

                    {/* Future Roadmap */}
                    <div className="space-y-6">
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block">DEVELOPMENT ROADMAP</span>
                        <div className="space-y-6 border-l border-white/5 pl-6 ml-2">
                            <div className="relative">
                                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#D4AF37] border border-[#0B0B0E]" />
                                <h4 className="text-sm font-creative font-bold text-white uppercase">Q3 2026: Multi-language Code Visualizer</h4>
                                <p className="text-xs text-slate-500 mt-1 font-sans">Expand the active trace visualizer to support full stack frame introspection for Python, C++, and Java concurrently.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-[#0B0B0E]" />
                                <h4 className="text-sm font-creative font-bold text-slate-400 uppercase">Q4 2026: AI Mock Interview Panels</h4>
                                <p className="text-xs text-slate-500 mt-1 font-sans">Introduce real-time audio/editor interactive AI interviewers that grade implementation choices and code structure during active coding.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-[#0B0B0E]" />
                                <h4 className="text-sm font-creative font-bold text-slate-400 uppercase">Q1 2027: Enterprise Screening Integration</h4>
                                <p className="text-xs text-slate-500 mt-1 font-sans">Deploy automated, high-integrity technical screening rooms for premium enterprise partners.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default AboutUs;
