import { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useComments } from '../hooks/useComments';
import PostCard from '../components/PostCard';
import CommentList from '../components/CommentList';
import CreatePostModal from '../components/CreatePostModal';
import MarkdownRenderer from '../components/MarkdownRenderer';
import axiosClient from '../../../utils/axiosClient';
import { MessageSquare, Plus } from 'lucide-react';

export default function ProblemDiscussion({ problemId, problemTitle, isAuthenticated, currentUserId }) {
    const [sort, setSort] = useState('newest');
    const [selectedPost, setSelectedPost] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { posts, loading, error, refetch } = usePosts(problemId, sort);
    const { comments, loading: commentsLoading, refetch: refetchComments, addComment } = useComments(
        selectedPost?._id
    );

    const handleCreatePost = async (payload) => {
        await axiosClient.post('/community/posts', { ...payload, problemId });
        refetch();
        setModalOpen(false);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        await axiosClient.delete(`/community/posts/${postId}`);
        if (selectedPost?._id === postId) setSelectedPost(null);
        refetch();
    };

    const canDeletePost = (post) =>
        isAuthenticated &&
        currentUserId &&
        (post.authorId?._id === currentUserId || post.authorId === currentUserId);

    return (
        <div className="tab-content-fade">
            <h1 className="editorial-header-creative mb-8" style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, textTransform: 'none', letterSpacing: '-0.01em' }}>Problem Discussion</h1>

            {selectedPost ? (
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => setSelectedPost(null)}
                        className="text-sm text-[#D4AF37] hover:underline"
                    >
                        ← Back to list
                    </button>
                    <PostCard
                        post={selectedPost}
                        showBody
                        problemId={problemId}
                        isAuthenticated={isAuthenticated}
                        onDelete={handleDeletePost}
                        canDelete={canDeletePost(selectedPost)}
                    />
                    <CommentList
                        postId={selectedPost._id}
                        comments={comments}
                        loading={commentsLoading}
                        onAddComment={addComment}
                        isAuthenticated={isAuthenticated}
                        currentUserId={currentUserId}
                        onDeleteComment={() => refetchComments()}
                    />
                </div>
            ) : (
                <div className="discussion-card-container animate-fade-in">
                    <div className="discussion-card-header flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-white font-heading">Sort by:</span>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="editorial-select"
                            >
                                <option value="newest">NEWEST</option>
                                <option value="top">TOP</option>
                                <option value="comments">MOST COMMENTED</option>
                            </select>
                        </div>
                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                className="editorial-btn-premium"
                            >
                                <Plus size={16} />
                                Start Discussion
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {loading && (
                            <div className="flex items-center gap-2 text-[#9A9A9A] py-4">
                                <span className="loading loading-spinner loading-sm" />
                                Loading discussions...
                            </div>
                        )}
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        {!loading && (
                            <>
                                {posts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <MessageSquare size={32} className="text-[#D4AF37] mb-4 opacity-80" />
                                        <h3 className="text-base font-heading uppercase text-[#E8EDF2] mb-2" style={{ fontFamily: 'Unbounded', fontWeight: 900, letterSpacing: '-0.04em' }}>
                                            No Discussions Yet
                                        </h3>
                                        <p className="text-[11px] text-[#9A9A9A] max-w-sm leading-relaxed">
                                            Be the first to share your thoughts, ask a question, or explain your approach to help the community!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <PostCard
                                                key={post._id}
                                                post={post}
                                                problemId={problemId}
                                                isAuthenticated={isAuthenticated}
                                                onSelectPost={setSelectedPost}
                                                onDelete={handleDeletePost}
                                                canDelete={canDeletePost(post)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <CreatePostModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreatePost}
                problemId={problemId}
                problemTitle={problemTitle}
            />
        </div>
    );
}
