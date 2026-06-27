import React, { useEffect } from 'react';
import { NavLink } from 'react-router';
import { ShieldCheck, ArrowRight, Play } from 'lucide-react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';

const PaymentSuccess = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen text-[#EDEDED] font-sans overflow-x-hidden relative flex flex-col justify-between" style={{ backgroundColor: '#0B0B0E' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}></div>
            </div>

            <SharedNavbar flat={true} />

            <div className="container mx-auto px-6 max-w-[600px] py-20 relative z-10 flex-1 flex flex-col justify-center items-center text-center">
                <div className="border border-white/[0.04] bg-[#07080a]/40 p-10 rounded-sm shadow-2xl space-y-8 w-full animate-fade-in">
                    {/* Success Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-400">
                        <ShieldCheck size={36} />
                    </div>

                    <div className="space-y-3">
                        <span className="text-[10px] font-mono text-green-400 uppercase tracking-[0.25em] block">TRANSACTION APPROVED</span>
                        <h1 className="text-3xl font-creative font-bold text-white uppercase tracking-tight">Payment Successful</h1>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto font-sans">
                            Your Premium Membership has been activated successfully. Thank you for choosing AlgoBench.
                        </p>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <NavLink
                            to="/problems"
                            className="flex-1 bg-[#D4AF37] hover:bg-[#B8962E] text-black py-3 px-6 rounded-sm font-creative text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                        >
                            <Play size={12} fill="currentColor" />
                            Start Practicing
                        </NavLink>
                        <NavLink
                            to="/profile"
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-6 rounded-sm font-creative text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Go to Dashboard
                            <ArrowRight size={12} />
                        </NavLink>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default PaymentSuccess;
