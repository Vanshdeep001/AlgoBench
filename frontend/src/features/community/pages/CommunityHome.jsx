import { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import CommunityNav from '../components/CommunityNav';
import axiosClient from '../../../utils/axiosClient';
import { MessageSquare, Plus, Layers } from 'lucide-react';

export default function CommunityHome({ user, isAuthenticated, currentUserId }) {
    const [sort, setSort] = useState('newest');
    const [modalOpen, setModalOpen] = useState(false);

    const { posts, loading, error, refetch } = usePosts(null, sort);

    const handleCreatePost = async (payload) => {
        await axiosClient.post('/community/posts', payload);
        refetch();
        setModalOpen(false);
    };

    return (
        <div className="min-h-screen font-sans selection:bg-[#D4AF37]/30" style={{ backgroundColor: '#0B0B0E' }}>
            {/* Background Effects - match Homepage */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px] animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }} />
                <div className="absolute top-[40%] right-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full blur-[80px] md:blur-[128px] animate-pulse delay-1000" style={{ backgroundColor: 'rgba(184, 150, 46, 0.06)' }} />
                <div className="absolute bottom-[-10%] left-[20%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            </div>

            <CommunityNav user={user} />

            <div className="relative z-10 pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-12">
                        <p className="text-sm font-mono uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(212, 175, 55, 0.9)' }}>
                            Discussions
                        </p>
                        <h1 className="text-4xl md:text-6xl font-display font-bold mb-5 tracking-tight flex items-center gap-4">
                            <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(120deg, #FFFFFF 0%, #E8E0C8 40%, #D4AF37 100%)' }}>
                                Community
                            </span>
                            <span className="hidden sm:inline-flex p-2 rounded-xl" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                <MessageSquare className="w-8 h-8" style={{ color: 'rgba(212, 175, 55, 0.9)' }} />
                            </span>
                        </h1>
                        <p className="text-lg max-w-xl font-mono" style={{ color: '#9A9A9A' }}>
                            Discuss problems, share solutions, and learn together. Start a thread or join the conversation.
                        </p>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#9A9A9A' }}>Sort by</p>
                        <div className="flex flex-wrap items-center gap-4">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
                                style={{
                                    backgroundColor: 'rgba(20, 20, 25, 0.9)',
                                    border: '1px solid rgba(212, 175, 55, 0.15)',
                                    color: '#EDEDED',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                                    minWidth: '180px'
                                }}
                            >
                                <option value="newest">Newest first</option>
                                <option value="top">Top voted</option>
                                <option value="comments">Most commented</option>
                            </select>
                            {isAuthenticated && (
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02]"
                                    style={{
                                        backgroundColor: 'rgba(212, 175, 55, 0.15)',
                                        color: '#D4AF37',
                                        border: '1px solid rgba(212, 175, 55, 0.25)',
                                        boxShadow: '0 4px 20px -4px rgba(212, 175, 55, 0.2)'
                                    }}
                                >
                                    <Plus size={20} />
                                    New post
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Posts container */}
                    <div
                        className="rounded-2xl overflow-hidden relative"
                        style={{
                            background: 'linear-gradient(165deg, rgba(22, 22, 28, 0.98) 0%, rgba(15, 15, 20, 0.99) 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.12)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)'
                        }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.35), transparent)' }} />
                        {error && <p className="px-6 py-4 text-red-400 text-sm border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>{error}</p>}
                        {loading && (
                            <div className="flex items-center justify-center gap-3 py-20 text-[#9A9A9A] font-mono">
                                <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
                                <span>Loading posts...</span>
                            </div>
                        )}
                        {!loading && (
                            <div className="p-4 md:p-6 space-y-4">
                                {posts.length === 0 ? (
                                    <div className="text-center py-24 px-6">
                                        <div className="inline-flex p-4 rounded-2xl mb-5" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                                            <Layers className="w-14 h-14" style={{ color: '#9A9A9A' }} />
                                        </div>
                                        <p className="text-xl font-display font-semibold text-white/90 mb-2">No posts yet</p>
                                        <p className="text-sm font-mono max-w-sm mx-auto mb-6" style={{ color: '#9A9A9A' }}>Be the first to start a discussion and help others learn.</p>
                                        {isAuthenticated && (
                                            <button
                                                type="button"
                                                onClick={() => setModalOpen(true)}
                                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                                                style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                                            >
                                                <Plus size={18} />
                                                Create first post
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            isAuthenticated={isAuthenticated}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreatePostModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreatePost}
            />
        </div>
    );
}
