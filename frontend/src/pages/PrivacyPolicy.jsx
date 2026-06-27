import React, { useEffect } from 'react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';

const PrivacyPolicy = () => {
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
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.25em] block mb-3">LEGAL PROTOCOLS</span>
                        <h1 className="text-4xl md:text-5xl font-creative font-bold tracking-tighter leading-none mb-6">
                            PRIVACY <br />
                            <span className="text-slate-500">POLICY.</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">LAST UPDATED: JUNE 27, 2026</p>
                    </div>

                    {/* Policy Sections */}
                    <div className="space-y-8 text-slate-400 text-xs leading-relaxed font-sans">
                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">1. INTRODUCTION</h3>
                            <p>
                                AlgoBench ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy details our practices concerning data collection, storage, and processing when you register, visit, or purchase services from the AlgoBench website.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">2. INFORMATION COLLECTED</h3>
                            <p>
                                We collect information necessary to provide and secure our algorithmic evaluation services, including:
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li><strong>Account Information:</strong> First name, last name, email address, age, and profile credentials.</li>
                                <li><strong>Third-Party Authentications:</strong> When you register via Google Authentication or Firebase Authentication, we store your profile identifier, name, and email details as mapped by the authentication token.</li>
                                <li><strong>Submissions and Code Metrics:</strong> The code solutions you write, run, or submit are stored alongside performance diagnostics (compilation status, execution runtime, and memory overhead).</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">3. COOKIES & TRACKING TECHNOLOGIES</h3>
                            <p>
                                We utilize secure browser cookies and localStorage elements to persist login states, compiler configurations, and preferred coding languages. We do not use persistent tracking cookies for targeted advertisement profiling.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">4. PAYMENT INFORMATION (RAZORPAY)</h3>
                            <p>
                                All premium billing transitions are processed securely through **Razorpay Software Private Limited** (our payment gateway partner). AlgoBench does not collect, record, or store sensitive payment credentials (such as credit card numbers, CVV codes, net banking passwords, or UPI PINs). All financial card entries occur securely on Razorpay's PCI-DSS compliant interface. Razorpay provides us only with payment status receipts and transaction identifiers.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">5. DATA RETENTION</h3>
                            <p>
                                We retain account records, profile details, and code submission histories for as long as your account remains active on our platform. System log files and temporary trace files are regularly pruned in accordance with database optimization schedules.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">6. USER RIGHTS & DATA DELETION</h3>
                            <p>
                                Under data protection guidelines, you have the right to access, edit, or request complete removal of your personal information from our databases. 
                            </p>
                            <p>
                                To request total deletion of your profile history, database records, and active credentials, you can trigger the profile deletion setting from the account panel or contact us directly at <a href="mailto:codeonalgobench@gmail.com" className="text-[#D4AF37] hover:underline">codeonalgobench@gmail.com</a>. We process complete deletion requests within 3 to 7 business days.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">7. CHILDREN'S PRIVACY</h3>
                            <p>
                                AlgoBench is designed for students, developers, and professionals preparing for technical interviews. We do not knowingly compile or store data from children under the age of 13.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">8. POLICY UPDATES</h3>
                            <p>
                                We reserve the right to modify this Privacy Policy to reflect security improvements or operational adjustments. Any changes will be announced on this page with an updated timestamp.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-sm font-creative font-bold text-white uppercase tracking-wider">9. CONTACT PROTOCOL</h3>
                            <p>
                                For questions concerning this Privacy Policy, please contact us at:
                            </p>
                            <p className="font-mono text-white">
                                AlgoBench Support Team<br />
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

export default PrivacyPolicy;
