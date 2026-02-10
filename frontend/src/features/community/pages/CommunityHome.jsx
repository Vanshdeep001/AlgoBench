import { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import CommunityNav from '../components/CommunityNav';
import axiosClient from '../../../utils/axiosClient';
import { MessageSquare, Plus, BookOpen } from 'lucide-react';

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
                    {/* Header - match Homepage style */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 flex items-center gap-3">
                            <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #FFFFFF, #D4AF37)' }}>
                                Community
                            </span>
                            <MessageSquare className="w-10 h-10" style={{ color: 'rgba(212, 175, 55, 0.8)' }} />
                        </h1>
                        <p className="text-lg font-mono" style={{ color: '#9A9A9A' }}>
                            Discuss problems, share solutions, and learn together
                        </p>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
                            style={{
                                backgroundColor: 'rgba(20, 20, 25, 0.8)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                color: '#EDEDED',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                                minWidth: '160px'
                            }}
                        >
                            <option value="newest">Newest</option>
                            <option value="top">Top voted</option>
                            <option value="comments">Most commented</option>
                        </select>
                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                    color: '#D4AF37',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    boxShadow: '0 0 20px -5px rgba(212, 175, 55, 0.3)'
                                }}
                            >
                                <Plus size={20} />
                                New post
                            </button>
                        )}
                    </div>

                    {/* Posts container - match Homepage card style */}
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        {error && <p className="px-6 py-4 text-red-400 text-sm border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>{error}</p>}
                        {loading && (
                            <div className="flex items-center justify-center gap-3 py-16 text-[#9A9A9A] font-mono">
                                <span className="loading loading-spinner loading-md" style={{ color: '#D4AF37' }} />
                                Loading posts...
                            </div>
                        )}
                        {!loading && (
                            <div className="p-4 md:p-6 space-y-4">
                                {posts.length === 0 ? (
                                    <div className="text-center py-16">
                                        <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#9A9A9A' }} />
                                        <p className="text-xl font-mono" style={{ color: '#9A9A9A' }}>No posts yet.</p>
                                        {isAuthenticated && <p className="text-sm font-mono mt-2" style={{ color: '#D4AF37' }}>Be the first to start a discussion!</p>}
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
