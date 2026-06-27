import React, { useEffect } from 'react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';

const TermsConditions = () => {
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
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.25em] block mb-3">CONTRACTUAL TERMS</span>
                        <h1 className="text-4xl md:text-5xl font-creative font-bold tracking-tighter leading-none mb-6">
                            TERMS & <br />
                            <span className="text-slate-500">CONDITIONS.</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">LAST UPDATED: JUNE 27, 2026</p>
                    </div>

                    {/* Terms Sections */}
                    <div className="space-y-8 text-slate-400 text-xs leading-relaxed font-sans">
                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">1. ACCEPTANCE OF TERMS</h3>
                            <p>
                                By accessing, registering, or using the website and software services hosted on AlgoBench ("Service"), you agree to be bound by these Terms & Conditions. If you do not accept these terms, you must terminate your access to the Service immediately.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">2. USER ACCOUNTS & SECURITY</h3>
                            <p>
                                To access problem subsets, visualizers, and contests, you must create a personal account. You are solely responsible for maintaining the confidentiality of your credentials (including Google/Firebase Authentication tokens). You agree to notify us immediately of any unauthorized usage or breach of security.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">3. ACCEPTABLE USE & PLATFORM INTEGRITY</h3>
                            <p>
                                You agree not to abuse the interactive code compiler or attempt to access restricted server layers. Specifically, the following actions are strictly prohibited:
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li>Executing malicious shell scripts, fork bombs, or filesystem attacks inside the compiler sandbox.</li>
                                <li>Scraping problem sheets or downloading proprietary visualizer code.</li>
                                <li>Sharing premium credentials or access tokens with third parties.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">4. SUBSCRIPTIONS, PAYMENTS & PREMIUM ACCESS</h3>
                            <p>
                                We offer premium membership tiers billed on a monthly or annual cycle. 
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li><strong>Billing Transactions:</strong> All financial transactions are finalized securely through our third-party gateway, Razorpay. All fees are in Indian Rupees (INR) unless specified otherwise.</li>
                                <li><strong>Renewal Protocol:</strong> Subscriptions are billed automatically at the beginning of each billing interval. You can terminate recurring auto-debit configurations via your account panel at any time.</li>
                                <li><strong>Tax Liabilities:</strong> All purchases are inclusive of Goods and Services Tax (GST) as applicable under Indian tax statutes.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">5. INTELLECTUAL PROPERTY RIGHTS</h3>
                            <p>
                                The software architecture, active visualizer algorithms, layout design, branding, assets, and curated editorial explanations are the sole intellectual property of AlgoBench. You receive a limited, revocable, non-exclusive license to use the platform solely for educational and personal practice.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">6. LIMITATION OF LIABILITY</h3>
                            <p>
                                The service is provided on an "as is" and "as available" basis. AlgoBench does not warrant that compiler traces, live code executors, or AI roadmap helpers will be error-free or run without interruption. In no event shall AlgoBench be liable for direct, indirect, incidental, or consequential damages resulting from platform downtime or data loss.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">7. TERMINATION</h3>
                            <p>
                                We reserve the right to suspend or delete accounts that violate these Terms & Conditions or perform actions that disrupt the system. Accounts suspended for malicious code execution or sandbox evasion are not eligible for refunds.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">8. GOVERNING LAW & JURISDICTION</h3>
                            <p>
                                These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts located in Delhi, India.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">9. CONTACT PROTOCOL</h3>
                            <p>
                                For questions concerning these Terms & Conditions, please contact us at:
                            </p>
                            <p className="font-mono text-white">
                                AlgoBench Legal Department<br />
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

export default TermsConditions;
