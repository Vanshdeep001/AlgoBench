import { useParams, useNavigate } from 'react-router';
import { usePost } from '../hooks/usePosts';
import { useComments } from '../hooks/useComments';
import PostCard from '../components/PostCard';
import CommentList from '../components/CommentList';
import CommunityNav from '../components/CommunityNav';
import { ArrowLeft } from 'lucide-react';

export default function PostDetailPage({ user, isAuthenticated, currentUserId }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { post, loading, error } = usePost(postId);
    const { comments, loading: commentsLoading, refetch: refetchComments, addComment } =
        useComments(postId);

    const handleDeletePost = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        const axiosClient = (await import('../../../utils/axiosClient')).default;
        await axiosClient.delete(`/community/posts/${id}`);
        navigate('/community');
    };

    const canDelete = (p) =>
        p &&
        isAuthenticated &&
        currentUserId &&
        (p.authorId?._id === currentUserId || p.authorId === currentUserId);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans selection:bg-[#D4AF37]/30" style={{ backgroundColor: '#0B0B0E' }}>
                <span className="loading loading-spinner loading-lg" style={{ color: '#D4AF37' }} />
            </div>
        );
    }
    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-sans" style={{ backgroundColor: '#0B0B0E' }}>
                <p className="text-red-400 font-mono">{error || 'Post not found'}</p>
                <button
                    onClick={() => navigate('/community')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
                    style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                >
                    <ArrowLeft size={18} />
                    Back to Community
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans selection:bg-[#D4AF37]/30" style={{ backgroundColor: '#0B0B0E' }}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[128px] animate-pulse" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            </div>

            <CommunityNav user={user} />

            <div className="relative z-10 pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-3xl">
                    <button
                        type="button"
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-2 mb-6 text-sm font-mono transition-colors hover:text-[#D4AF37]"
                        style={{ color: '#9A9A9A' }}
                    >
                        <ArrowLeft size={18} />
                        Back to Community
                    </button>

                    <PostCard
                        post={post}
                        showBody
                        isAuthenticated={isAuthenticated}
                        onDelete={handleDeletePost}
                        canDelete={canDelete(post)}
                    />
                    <div
                        className="mt-6 rounded-2xl overflow-hidden p-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        <CommentList
                            postId={post._id}
                            comments={comments}
                            loading={commentsLoading}
                            onAddComment={addComment}
                            isAuthenticated={isAuthenticated}
                            currentUserId={currentUserId}
                            onDeleteComment={() => refetchComments()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
