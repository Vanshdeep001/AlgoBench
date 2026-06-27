import React, { useState, useEffect } from 'react';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';
import { Mail, Clock, Send } from 'lucide-react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        // Simulate sending
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSent(false), 4000);
        }, 1500);
    };

    return (
        <div className="min-h-screen text-[#EDEDED] font-sans overflow-x-hidden relative" style={{ backgroundColor: '#0B0B0E' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}></div>
            </div>

            <SharedNavbar flat={true} />

            <div className="container mx-auto px-6 max-w-[1000px] py-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-5 space-y-12">
                        <div>
                            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-[0.25em] block mb-3">INQUIRIES</span>
                            <h1 className="text-4xl md:text-5xl font-creative font-bold tracking-tighter leading-none mb-6">
                                CONTACT <br />
                                <span className="text-slate-500">SUPPORT.</span>
                            </h1>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Have questions about premium memberships, payment integration, billing, or enterprise options? Send us a message and our support team will assist you.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-sm text-[#D4AF37]">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Support Email</h4>
                                    <a href="mailto:codeonalgobench@gmail.com" className="text-sm font-mono text-white hover:text-[#D4AF37] transition-colors">
                                        codeonalgobench@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-sm text-[#D4AF37]">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Response Turnaround</h4>
                                    <p className="text-xs text-white font-sans">
                                        Typically within 24 to 48 hours.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="border border-white/[0.04] bg-[#07080a]/40 p-8 rounded-sm shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all text-white font-sans"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all text-white font-sans"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all text-white font-sans"
                                        placeholder="Payment issue, account status, etc."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all text-white font-sans h-32 resize-none"
                                        placeholder="Write your message here..."
                                        required
                                    />
                                </div>

                                {sent && (
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono uppercase tracking-widest rounded-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        MESSAGE TRANSMITTED SUCCESSFULLY.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 disabled:opacity-50 text-[#D4AF37] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 py-3.5 rounded-sm font-heading font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    <Send size={14} />
                                    {sending ? 'TRANSMITTING...' : 'SEND MESSAGE'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default ContactUs;
