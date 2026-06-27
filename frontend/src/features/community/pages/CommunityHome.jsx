import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { usePosts, usePost } from '../hooks/usePosts';
import { useComments } from '../hooks/useComments';
import { useVote } from '../hooks/useVote';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import SharedNavbar from '../../../components/SharedNavbar';
import PublicFooter from '../../../components/PublicFooter';
import MarkdownRenderer from '../components/MarkdownRenderer';
import axiosClient from '../../../utils/axiosClient';
import {
    MessageSquare,
    MessageCircle,
    Plus,
    Layers,
    Search,
    Clock,
    Flame,
    BookOpen,
    HelpCircle,
    Trophy,
    TrendingUp,
    Code2,
    Calendar,
    ChevronUp,
    ChevronDown,
    Trash2
} from 'lucide-react';

// Generates a uniform premium dark avatar background
const getAvatarGradient = () => {
    return 'from-zinc-800 to-zinc-900 border border-white/10';
};

// Generates a clean monochrome category tag with gold highlight only for editorials
const getPostTag = (title = '', content = '') => {
    const text = `${title} ${content}`.toLowerCase();
    if (text.includes('editorial') || text.includes('walkthrough')) {
        return { name: 'Editorial', color: 'text-[#D4AF37]' };
    }
    if (text.includes('solution') || text.includes('bfs') || text.includes('dfs') || text.includes('dp') || text.includes('greedy') || text.includes('algorithm') || text.includes('code')) {
        return { name: 'Solution', color: 'text-slate-400' };
    }
    if (text.includes('bug') || text.includes('help') || text.includes('error') || text.includes('issue') || text.includes('tle') || text.includes('rte') || text.includes('wa') || text.includes('failing')) {
        return { name: 'Bug / Help', color: 'text-slate-400' };
    }
    if (text.includes('contest') || text.includes('round') || text.includes('competition') || text.includes('weekly')) {
        return { name: 'Contest', color: 'text-slate-400' };
    }
    return { name: 'General', color: 'text-slate-500' };
};

export default function CommunityHome({ user, isAuthenticated, currentUserId }) {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [sort, setSort] = useState('newest');
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [selectedPost, setSelectedPost] = useState(null);

    const { posts, loading, error, refetch } = usePosts(null, sort);
    const { post: urlPost } = usePost(postId);

    // Comments and votes for the selected post
    const { comments, loading: commentsLoading, refetch: refetchComments, addComment } = useComments(selectedPost?._id);
    const { votes, userVote, vote, loading: voteLoading } = useVote(selectedPost?._id, selectedPost?.votes ?? 0);

    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Auto-select first post or route-specified post
    useEffect(() => {
        if (postId) {
            if (posts.length > 0) {
                const found = posts.find((p) => p._id === postId);
                if (found) {
                    setSelectedPost(found);
                    return;
                }
            }
            if (urlPost) {
                setSelectedPost(urlPost);
            }
        } else if (posts.length > 0 && !selectedPost) {
            setSelectedPost(posts[0]);
        }
    }, [postId, posts, urlPost]);

    const handleCreatePost = async (payload) => {
        const res = await axiosClient.post('/community/posts', payload);
        refetch();
        setModalOpen(false);
        if (res.data?.post?._id) {
            navigate(`/community/posts/${res.data.post._id}`);
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        await axiosClient.delete(`/community/posts/${id}`);
        setSelectedPost(null);
        refetch();
        navigate('/community');
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated || !selectedPost) return;
        setSubmittingComment(true);
        try {
            await addComment(newComment.trim());
            setNewComment('');
            refetchComments();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await axiosClient.delete(`/community/comments/${commentId}`);
            refetchComments();
        } catch (err) {
            console.error(err);
        }
    };

    // Client-side filtering logic based on title & body content keywords
    const getFilteredPosts = () => {
        let filtered = posts;

        // 1. Search Query Filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    (post.content && post.content.toLowerCase().includes(query))
            );
        }

        // 2. Category Tag Filter
        if (category !== 'all') {
            filtered = filtered.filter((post) => {
                const text = `${post.title} ${post.content || ''}`.toLowerCase();
                if (category === 'editorials') {
                    return text.includes('editorial') || text.includes('walkthrough');
                }
                if (category === 'solutions') {
                    return (
                        text.includes('solution') ||
                        text.includes('bfs') ||
                        text.includes('dfs') ||
                        text.includes('dp') ||
                        text.includes('greedy') ||
                        text.includes('algorithm') ||
                        text.includes('code')
                    );
                }
                if (category === 'help') {
                    return (
                        text.includes('bug') ||
                        text.includes('help') ||
                        text.includes('error') ||
                        text.includes('issue') ||
                        text.includes('tle') ||
                        text.includes('rte') ||
                        text.includes('wa') ||
                        text.includes('failing')
                    );
                }
                if (category === 'contests') {
                    return (
                        text.includes('contest') ||
                        text.includes('round') ||
                        text.includes('competition') ||
                        text.includes('weekly')
                    );
                }
                return true;
            });
        }

        return filtered;
    };

    // Count matching posts for Category buttons (dynamically reactive to Search query)
    const getCategoryCount = (catId) => {
        let list = posts;

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    (post.content && post.content.toLowerCase().includes(query))
            );
        }

        if (catId === 'all') return list.length;

        return list.filter((post) => {
            const text = `${post.title} ${post.content || ''}`.toLowerCase();
            if (catId === 'editorials') {
                return text.includes('editorial') || text.includes('walkthrough');
            }
            if (catId === 'solutions') {
                return (
                    text.includes('solution') ||
                    text.includes('bfs') ||
                    text.includes('dfs') ||
                    text.includes('dp') ||
                    text.includes('greedy') ||
                    text.includes('algorithm') ||
                    text.includes('code')
                );
            }
            if (catId === 'help') {
                return (
                    text.includes('bug') ||
                    text.includes('help') ||
                    text.includes('error') ||
                    text.includes('issue') ||
                    text.includes('tle') ||
                    text.includes('rte') ||
                    text.includes('wa') ||
                    text.includes('failing')
                );
            }
            if (catId === 'contests') {
                return (
                    text.includes('contest') ||
                    text.includes('round') ||
                    text.includes('competition') ||
                    text.includes('weekly')
                );
            }
            return false;
        }).length;
    };

    const filteredPosts = getFilteredPosts();

    const selectedPostAuthorName = selectedPost?.author
        ? `${selectedPost.author.firstName || ''} ${selectedPost.author.lastName || ''}`.trim() || 'Anonymous'
        : 'Anonymous';

    const selectedPostInitials = selectedPostAuthorName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'A';

    const selectedPostAvatarGradient = getAvatarGradient(selectedPostAuthorName);
    const selectedPostTag = selectedPost ? getPostTag(selectedPost.title, selectedPost.content) : null;

    const canDeletePost = (p) =>
        p &&
        isAuthenticated &&
        currentUserId &&
        (p.authorId?._id === currentUserId || p.authorId === currentUserId);

    return (
        <div className="min-h-screen font-sans text-[#EDEDED] overflow-x-hidden selection:bg-[#D4AF37]/30 relative" style={{ backgroundColor: '#0B0B0E' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[80px] md:blur-[128px]" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}></div>
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <SharedNavbar />

            <div className="relative z-10 pt-24 pb-20 px-6 max-w-[1550px] mx-auto text-left">
                
                <div className="mb-10 max-w-4xl border-b border-white/5 pb-6">
                    <h1 className="font-creative text-[clamp(2.5rem,6vw,4rem)] font-black tracking-[-0.05em] leading-[0.9] uppercase text-white mb-8">
                        COMMUNITY DISCUSSIONS
                    </h1>
                </div>

                {/* Dashboard Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT PANE: Search, Filters, and Feed (width 5/12) */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Unified Search & Actions Bar */}
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    placeholder="Search discussions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#121217]/85 text-[#EDEDED] pl-11 pr-4 py-3 rounded-none border border-white/5 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-mono text-xs placeholder-slate-500"
                                />
                                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors" />
                            </div>

                            {isAuthenticated && (
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-none font-creative text-[10px] font-bold uppercase tracking-widest transition-all border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer"
                                >
                                    <Plus size={14} />
                                    New
                                </button>
                            )}
                        </div>

                        {/* Simplified Dropdown Filters Row */}
                        <div className="flex items-center justify-between gap-4 border-y border-white/5 py-4">
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500">
                                <span>Filter:</span>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="bg-[#121217]/90 border border-white/5 text-[#EDEDED] px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]/50 cursor-pointer font-mono text-xs"
                                >
                                    <option value="all">All Threads ({getCategoryCount('all')})</option>
                                    <option value="solutions">Solutions ({getCategoryCount('solutions')})</option>
                                    <option value="editorials">Editorials ({getCategoryCount('editorials')})</option>
                                    <option value="help">Bug / Help ({getCategoryCount('help')})</option>
                                    <option value="contests">Contests ({getCategoryCount('contests')})</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500">
                                <span>Sort:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="bg-[#121217]/90 border border-white/5 text-[#EDEDED] px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]/50 cursor-pointer font-mono text-xs"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="top">Top Voted</option>
                                    <option value="comments">Most Replies</option>
                                </select>
                            </div>
                        </div>

                        {/* List of Posts */}
                        <div className="space-y-3.5 max-h-[650px] overflow-y-auto pr-1">
                            {loading && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((n) => (
                                        <div
                                            key={n}
                                            className="p-5 rounded-none border border-white/5 bg-[#121217]/50 animate-pulse space-y-3"
                                        >
                                            <div className="w-1/3 h-3 bg-white/10 rounded" />
                                            <div className="w-2/3 h-5 bg-white/10 rounded" />
                                            <div className="w-full h-3 bg-white/10 rounded" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && filteredPosts.length === 0 && (
                                <div className="p-8 text-center border border-dashed border-white/5 bg-[#121217]/10 font-mono text-xs text-slate-500">
                                    No threads match the filter constraints.
                                </div>
                            )}

                            {!loading && filteredPosts.map((postItem) => (
                                <PostCard
                                    key={postItem._id}
                                    post={postItem}
                                    isAuthenticated={isAuthenticated}
                                    onSelectPost={(p) => {
                                        setSelectedPost(p);
                                        navigate(`/community/posts/${p._id}`);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANE: Selected Thread Reader & Comments (width 7/12) */}
                    <div className="lg:col-span-7 lg:sticky lg:top-28">
                        {selectedPost ? (
                            <div className="space-y-6 lg:pl-8 lg:border-l lg:border-white/5">
                                {/* CARD 1: Selected Thread Reader */}
                                <div
                                    className="p-6 md:p-8 border border-white/5 space-y-6"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(16, 16, 21, 0.8) 0%, rgba(10, 10, 12, 0.95) 100%)',
                                    }}
                                >
                                    {/* Category and Date Row */}
                                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-white shadow-sm`}>
                                                {selectedPostInitials}
                                            </div>
                                            <span className="font-semibold text-slate-300 font-sans">{selectedPostAuthorName}</span>
                                            <span className="text-slate-600 font-sans">•</span>
                                            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                                                <Calendar size={11} className="text-[#D4AF37]/50" />
                                                {new Date(selectedPost.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${selectedPostTag?.color}`}>
                                            {selectedPostTag?.name}
                                        </span>
                                    </div>

                                    {/* Title & Content */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl md:text-2xl font-creative font-bold tracking-tight text-white leading-snug">
                                            {selectedPost.title}
                                        </h2>
                                        <div className="text-slate-300 text-sm md:text-base leading-relaxed font-sans prose prose-invert max-w-none pt-2 border-t border-white/5">
                                            <MarkdownRenderer content={selectedPost.content} />
                                        </div>
                                    </div>

                                    {/* Toolbar Row */}
                                    <div className="flex items-center justify-between border-t border-white/5 pt-4 my-2">
                                        <div className="flex items-center bg-white/[0.02] border border-white/5 p-1 gap-1">
                                            {isAuthenticated ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => vote(1)}
                                                        disabled={voteLoading}
                                                        className={`p-1 transition-colors hover:text-[#D4AF37] ${userVote === 1 ? 'text-[#D4AF37]' : 'text-slate-500'}`}
                                                    >
                                                        <ChevronUp size={18} />
                                                    </button>
                                                    <span className="text-xs font-mono font-bold text-slate-300 px-2 select-none">{votes}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => vote(-1)}
                                                        disabled={voteLoading}
                                                        className={`p-1 transition-colors hover:text-[#D4AF37] ${userVote === -1 ? 'text-[#D4AF37]' : 'text-slate-500'}`}
                                                    >
                                                        <ChevronDown size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-0.5">
                                                    <span className="text-[10px] uppercase font-mono text-slate-500">Votes:</span>
                                                    <span className="text-xs font-mono font-bold text-[#D4AF37]">{votes}</span>
                                                </div>
                                            )}
                                        </div>

                                        {canDeletePost(selectedPost) && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePost(selectedPost._id)}
                                                className="text-[10px] font-mono uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                                            >
                                                Delete Post
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* CARD 2: Discussion Section */}
                                <div
                                    className="p-6 md:p-8 border border-white/5 space-y-6"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(16, 16, 21, 0.8) 0%, rgba(10, 10, 12, 0.95) 100%)',
                                    }}
                                >
                                    <h3 className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold flex items-center gap-2">
                                        <MessageCircle size={14} className="text-[#D4AF37]" />
                                        Discussion ({comments?.length ?? 0})
                                    </h3>

                                    {/* Input Form */}
                                    {isAuthenticated ? (
                                        <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add your input..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-[#121217]/50 text-[#EDEDED] text-sm resize-y focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 border border-white/5 placeholder:text-slate-500 font-sans"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim() || submittingComment}
                                                className="self-end px-5 py-2 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] cursor-pointer"
                                            >
                                                {submittingComment ? 'Posting...' : 'Post Comment'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="p-3 bg-white/[0.01] border border-white/5 text-center text-[10px] font-mono text-slate-500">
                                            Please <Link to="/login" className="text-[#D4AF37] hover:underline">login</Link> to participate in discussions.
                                        </div>
                                    )}

                                    {/* Comments Stream */}
                                    {commentsLoading ? (
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono py-4">
                                            <span className="loading loading-spinner loading-xs" />
                                            Loading comments...
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                            {(comments || []).map((c) => {
                                                const commentAuthorName = c.author
                                                    ? `${c.author.firstName || ''} ${c.author.lastName || ''}`.trim() || 'Anonymous'
                                                    : 'Anonymous';
                                                const commentInitials = commentAuthorName
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .slice(0, 2)
                                                    .join('')
                                                    .toUpperCase() || 'A';
                                                const canDeleteComment =
                                                    currentUserId &&
                                                    (c.authorId?._id === currentUserId || c.authorId === currentUserId);

                                                return (
                                                    <div key={c._id} className="border-b border-white/5 pb-4 last:border-b-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                                                                    {commentInitials}
                                                                </div>
                                                                <div>
                                                                    <span className="text-[11px] font-semibold text-slate-300">{commentAuthorName}</span>
                                                                    <span className="text-slate-600 text-xs mx-1">•</span>
                                                                    <span className="text-[9px] text-slate-500 font-mono">
                                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {canDeleteComment && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteComment(c._id)}
                                                                    className="text-[9px] font-mono text-slate-500 hover:text-rose-400 uppercase tracking-wider transition-colors cursor-pointer"
                                                                >
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-300 font-sans pl-7 leading-relaxed">
                                                            <MarkdownRenderer content={c.content} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {(!comments || comments.length === 0) && (
                                                <p className="font-mono text-[10px] text-slate-500 py-6 text-center border border-dashed border-white/5">
                                                    No thoughts shared yet on this thread.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed border-white/5 bg-[#121217]/10 h-[500px]">
                                <MessageSquare className="w-10 h-10 text-slate-500 mb-4" />
                                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#EDEDED]">No Thread Selected</h3>
                                <p className="text-xs text-slate-500 max-w-xs mt-2">
                                    Select a thread from the list on the left to view the editorial breakdown and join the discussion.
                                </p>
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
            <PublicFooter />
        </div>
    );
}
