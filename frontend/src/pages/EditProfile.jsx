import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { User, Save, ArrowLeft, Mail, ShieldAlert } from 'lucide-react';
import { updateUser } from '../authSlice';
import SharedNavbar from '../components/SharedNavbar';
import PublicFooter from '../components/PublicFooter';
import '../styles/profile-redesign.css';

const EditProfile = () => {
    const { user, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        age: user?.age || '',
        githubUsername: user?.githubUsername || '',
        preferredLanguage: localStorage.getItem('pref_lang') || 'cpp'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        // Save local preferences
        localStorage.setItem('pref_lang', formData.preferredLanguage);

        const result = await dispatch(updateUser({
            firstName: formData.firstName,
            lastName: formData.lastName,
            age: formData.age,
            githubUsername: formData.githubUsername
        }));
        setLoading(false);

        if (updateUser.fulfilled.match(result)) {
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 1500);
        }
    };

    if (!user) return null;

    return (
        <div className="profile-root">
            <div className="noise-overlay"></div>
            <SharedNavbar />

            <div className="profile-container" style={{ maxWidth: '800px', paddingTop: '40px' }}>
                <form onSubmit={handleSubmit} className="border border-white/[0.04] bg-[#07080a]/40 p-8 rounded-sm shadow-2xl animate-fade-in space-y-6">
                    {/* Header Bar with Back Action, Title & Sleek Save Button */}
                    <div className="flex justify-between items-center w-full pb-4 border-b border-white/[0.03]">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="flex items-center justify-center p-1.5 rounded-sm hover:bg-white/5 border border-white/[0.05] hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                title="Back to Profile"
                            >
                                <ArrowLeft size={13} />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="section-icon"><User size={15} className="text-zinc-500" /></div>
                                <h3 className="uppercase tracking-[0.2em] text-[11px] font-heading text-zinc-200">Edit Profile</h3>
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 disabled:opacity-50 text-[#D4AF37] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 px-4 py-1.5 rounded-sm font-heading font-bold uppercase tracking-widest text-[9.5px] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Save size={12} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    {/* Row 1: Names */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">First Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all font-body text-white"
                                    placeholder="First Name"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">Last Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all font-body text-white"
                                    placeholder="Last Name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Age, Github & Preferred Language */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">Age</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    name="age"
                                    value={formData.age}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^[0-9]+$/.test(val)) {
                                            handleChange(e);
                                        }
                                    }}
                                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all font-body text-white"
                                    placeholder="Your Age"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">GitHub Username</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="githubUsername"
                                    value={formData.githubUsername}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 focus:bg-[#07080a]/20 outline-none transition-all font-body text-white"
                                    placeholder="e.g. octocat"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono ml-1">Preferred Language</label>
                            <select
                                name="preferredLanguage"
                                value={formData.preferredLanguage}
                                onChange={handleChange}
                                className="w-full bg-[#07080a] border border-white/[0.05] rounded-sm px-4 py-3 text-sm focus:border-[#D4AF37]/50 outline-none transition-all font-body text-zinc-300 cursor-pointer"
                            >
                                <option value="cpp">C++ (GCC 20)</option>
                                <option value="java">Java (JDK 17)</option>
                                <option value="python">Python 3.10</option>
                                <option value="javascript">JavaScript (Node.js)</option>
                            </select>
                        </div>
                    </div>

                    {/* Readonly profile status info */}
                    <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-sm space-y-3">
                        <div className="flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-2">
                                <Mail size={13} className="text-zinc-500" />
                                <span className="text-[9.5px] font-mono uppercase tracking-widest">Email (Immutable)</span>
                            </div>
                            <span className="text-[10px] font-mono">{user.emailId}</span>
                        </div>
                        <div className="flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={13} className="text-zinc-500" />
                                <span className="text-[9.5px] font-mono uppercase tracking-widest">Role</span>
                            </div>
                            <span className="text-[10px] font-mono uppercase">{user.role || 'user'}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest rounded-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Error: {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono uppercase tracking-widest rounded-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            PROFILE UPDATED. REDIRECTING...
                        </div>
                    )}
                </form>
            </div>
            <PublicFooter />
        </div>
    );
};

export default EditProfile;
