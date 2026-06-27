import React, { useEffect } from 'react';
import { NavLink } from 'react-router';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';

const PaymentCancelled = () => {
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
                    {/* Warning Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-500">
                        <AlertCircle size={36} />
                    </div>

                    <div className="space-y-3">
                        <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-[0.25em] block">TRANSACTION ABORTED</span>
                        <h1 className="text-3xl font-creative font-bold text-white uppercase tracking-tight">Payment Cancelled</h1>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto font-sans">
                            No worries! You can upgrade your account whenever you are ready. Your active data is completely safe.
                        </p>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <NavLink
                            to="/#pricing"
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-10 rounded-sm font-creative text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ArrowLeft size={12} />
                            Return to Pricing
                        </NavLink>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default PaymentCancelled;
