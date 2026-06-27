import React, { useEffect } from 'react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';

const RefundPolicy = () => {
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

            <div className="container mx-auto px-6 max-w-[850px] py-20 relative z-10">
                <div className="space-y-12">
                    {/* Header */}
                    <div className="border-b border-white/5 pb-8">
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.25em] block mb-3">BILLING PROTOCOLS</span>
                        <h1 className="text-4xl md:text-5xl font-creative font-bold tracking-tighter leading-none mb-6">
                            REFUND & <br />
                            <span className="text-slate-500">CANCELLATION.</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">LAST UPDATED: JUNE 27, 2026</p>
                    </div>

                    {/* Policy Sections */}
                    <div className="space-y-8 text-slate-400 text-xs leading-relaxed font-sans">
                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">1. SUBSCRIPTION CANCELLATION</h3>
                            <p>
                                You are free to cancel your subscription at any time. When you trigger a cancellation, your account will remain on the Premium tier for the remaining duration of your current paid billing cycle (the "Active Interval"). 
                            </p>
                            <p>
                                Auto-renewals and recurring payments will cease immediately upon cancellation, and no future transactions will be generated. You can manage your cancellation preferences inside the billing section of your user profile settings.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">2. REFUND ELIGIBILITY</h3>
                            <p>
                                To protect platform integrity and secure operational computational resources, refunds are strictly limited and will only be initiated under the following specific circumstances:
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li><strong>Duplicate Payments:</strong> When a processing delay or multiple clicks generates multiple identical transaction charges for the same account subscription.</li>
                                <li><strong>Failed Activations:</strong> When the payment transaction is completed successfully via Razorpay but the user profile fails to unlock Premium features due to a platform-side API delay.</li>
                                <li><strong>Technical Failure:</strong> System-level outages during transaction handshakes that result in double-deductions without account updates.</li>
                            </ul>
                            <p>
                                Once a subscription has been successfully activated and accessed, no refunds will be issued for the remaining interval, unless required under applicable local statutes or Indian consumer regulations.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">3. REFUND PROCESSING TIMELINES</h3>
                            <p>
                                Once a valid refund request is received and verified by our billing department:
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li>The refund approval process is finalized within <strong>24 to 48 hours</strong>.</li>
                                <li>Approved refunds are credited back to the customer's original payment source (credit card, debit card, UPI link, or net banking account) through our payment gateway partner, Razorpay.</li>
                                <li>The refunded balance typically reflects in the customer's original payment method within <strong>5 to 7 business days</strong>, depending on bank clearing schedules and card-issuing policies.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">4. CLAIMS METHODOLOGY</h3>
                            <p>
                                To claim a refund for duplicate billing or failed activations, please draft a request containing your registration email, transaction ID, and date of payment, and forward it to our helpdesk at:
                            </p>
                            <p className="font-mono text-white">
                                AlgoBench Billing Support Team<br />
                                Email: codeonalgobench@gmail.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default RefundPolicy;
