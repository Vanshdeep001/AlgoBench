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
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare size={24} />
                    Discussion
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#9A9A9A]">Sort:</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-black/30 border border-[#D4AF37]/20 text-[#EDEDED] text-sm focus:outline-none focus:border-[#D4AF37]/50"
                    >
                        <option value="newest">Newest</option>
                        <option value="top">Top</option>
                        <option value="comments">Most commented</option>
                    </select>
                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                color: '#D4AF37',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                            }}
                        >
                            <Plus size={18} />
                            New post
                        </button>
                    )}
                </div>
            </div>

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
                <>
                    {loading && (
                        <div className="flex items-center gap-2 text-[#9A9A9A] py-4">
                            <span className="loading loading-spinner loading-sm" />
                            Loading discussions...
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    {!loading && (
                        <div className="space-y-3">
                            {posts.length === 0 ? (
                                <p className="text-[#9A9A9A] py-6">
                                    No discussions yet.
                                    {isAuthenticated && ' Be the first to start one!'}
                                </p>
                            ) : (
                                posts.map((post) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        problemId={problemId}
                                        isAuthenticated={isAuthenticated}
                                        onSelectPost={setSelectedPost}
                                        onDelete={handleDeletePost}
                                        canDelete={canDeletePost(post)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </>
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
