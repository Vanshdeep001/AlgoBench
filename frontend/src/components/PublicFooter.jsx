import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Github, Linkedin } from 'lucide-react';

const PublicFooter = () => {
    const navigate = useNavigate();

    const handleScroll = (elementId) => {
        if (window.location.pathname === '/') {
            const el = document.getElementById(elementId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate(`/#${elementId}`);
            // Wait for navigation then scroll
            setTimeout(() => {
                const el = document.getElementById(elementId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    return (
        <footer className="py-20 border-t border-white/5 relative z-10 bg-[#0B0B0E] text-[#EDEDED] font-sans selection:bg-[#D4AF37]/30">
            <div className="container mx-auto px-6 max-w-[1400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2.5">
                            <img src="/algobench_logo_2_no_text.png?v=4" alt="AlgoBench" className="w-[20px] h-[20px] object-contain" />
                            <span className="text-xl font-logo font-bold tracking-[0.03em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AlgoBench</span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                            A premium preparation platform for software engineers who prioritize depth, optimal complexity analysis, and architectural precision.
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center gap-4 text-slate-500">
                            <a href="https://github.com/Vanshdeep001" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Github size={18} />
                            </a>
                            <a href="https://www.linkedin.com/in/vanshdeep-srivastav-aa6749310/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Company</h4>
                        <ul className="space-y-4 text-xs text-slate-500">
                            <li><NavLink to="/about" className="hover:text-white transition-colors">About Us</NavLink></li>
                            <li><NavLink to="/contact" className="hover:text-white transition-colors">Contact Us</NavLink></li>
                        </ul>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Product</h4>
                        <ul className="space-y-4 text-xs text-slate-500">
                            <li>
                                <button onClick={() => handleScroll('features')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                                    Features
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleScroll('pricing')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                                    Pricing
                                </button>
                            </li>
                            <li><NavLink to="/faq" className="hover:text-white transition-colors">FAQ</NavLink></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Legal</h4>
                        <ul className="space-y-4 text-xs text-slate-500">
                            <li><NavLink to="/privacy" className="hover:text-white transition-colors">Privacy Policy</NavLink></li>
                            <li><NavLink to="/terms" className="hover:text-white transition-colors">Terms & Conditions</NavLink></li>
                            <li><NavLink to="/refund" className="hover:text-white transition-colors">Refund & Cancellation</NavLink></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-mono text-slate-600 tracking-wider">
                        © 2026 ALGOBENCH. ALL RIGHTS RESERVED.
                    </div>
                    <div className="text-[10px] font-mono text-slate-600">
                        SUPPORT: <a href="mailto:codeonalgobench@gmail.com" className="text-slate-600 hover:text-white transition-colors">codeonalgobench@gmail.com</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
