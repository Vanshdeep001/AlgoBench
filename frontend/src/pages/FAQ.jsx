import React, { useState, useEffect } from 'react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqData = [
        {
            q: "What is AlgoBench Premium?",
            a: "AlgoBench Premium is our comprehensive membership plan designed to help developers prepare for top-tier technical interviews. It unlocks unlimited DSA challenges, interactive code trace visualizers, premium contest entries, curated company roadmaps, and priority AI performance analysis."
        },
        {
            q: "How do subscriptions work?",
            a: "We offer a Premium membership plan billed monthly at ₹99/month. Your payment is processed securely via Razorpay, and access is unlocked instantly. Subscriptions renew automatically at the start of each billing cycle unless cancelled."
        },
        {
            q: "Can I cancel my subscription anytime?",
            a: "Yes! You can cancel your subscription at any time directly through your user profile account settings. Once cancelled, you will retain full premium access for the remaining duration of your current paid billing period, and no further renewals will occur."
        },
        {
            q: "Are my payments secure?",
            a: "Absolutely. All transactions are routed securely through Razorpay, our PCI-DSS compliant payment gateway partner. AlgoBench never stores, processes, or sees your credit card credentials, CVV, or bank login details."
        },
        {
            q: "How do I request a refund?",
            a: "Refunds are processed in accordance with our Refund & Cancellation Policy, primarily covering double-deductions, duplicate payments, or database-side activation failures. To request assistance, please write to our helpdesk at codeonalgobench@gmail.com with your receipt details."
        },
        {
            q: "What payment methods are supported?",
            a: "Through Razorpay, we support all major credit and debit cards (Visa, MasterCard, RuPay), Net Banking (SBI, HDFC, ICICI, etc.), UPI (Google Pay, PhonePe, Paytm), and popular digital wallets."
        },
        {
            q: "How do I contact support?",
            a: "You can send us an email at codeonalgobench@gmail.com or submit an inquiry using our online form on the Contact Us page. We typically respond within 24 to 48 hours."
        }
    ];

    const toggleIndex = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.25em] block mb-3">FAQ HELPDESK</span>
                        <h1 className="text-4xl md:text-5xl font-creative font-bold tracking-tighter leading-none mb-6">
                            FREQUENTLY <br />
                            <span className="text-slate-500">ASKED QUESTIONS.</span>
                        </h1>
                        <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                            Find clear, quick answers to general questions about AlgoBench Premium, billing intervals, payments, and account status.
                        </p>
                    </div>

                    {/* FAQ Accordion List */}
                    <div className="space-y-4">
                        {faqData.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div key={index} className="border border-white/[0.04] bg-[#07080a]/30 rounded-sm overflow-hidden transition-all duration-300">
                                    <button
                                        onClick={() => toggleIndex(index)}
                                        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-white/[0.01] transition-colors focus:outline-none cursor-pointer"
                                    >
                                        <span className="text-xs font-creative font-bold uppercase tracking-wider text-white">
                                            {item.q}
                                        </span>
                                        <span className="text-[#D4AF37] ml-4">
                                            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                                        </span>
                                    </button>
                                    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 border-t border-white/[0.02]' : 'max-h-0'}`}>
                                        <div className="p-6 text-xs text-slate-400 leading-relaxed font-sans">
                                            {item.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default FAQ;
