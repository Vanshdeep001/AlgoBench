import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { MessageCircle, Trash2 } from 'lucide-react';
import axiosClient from '../../../utils/axiosClient';

export default function CommentList({
    postId,
    comments,
    loading,
    onAddComment,
    isAuthenticated,
    currentUserId,
    onDeleteComment,
}) {
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;
        setSubmitting(true);
        try {
            await onAddComment(newComment.trim());
            setNewComment('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await axiosClient.delete(`/community/comments/${commentId}`);
            onDeleteComment?.(commentId);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-4" style={{ color: '#9A9A9A' }}>
                <span className="loading loading-spinner loading-sm" style={{ color: '#D4AF37' }} />
                Loading comments...
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <h4 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                <MessageCircle size={20} style={{ color: '#D4AF37' }} />
                Comments ({comments?.length ?? 0})
            </h4>

            {isAuthenticated && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all placeholder:text-[#9A9A9A]"
                        style={{
                            backgroundColor: 'rgba(11, 11, 14, 0.6)',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            color: '#EDEDED'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="self-end px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:scale-[1.02]"
                        style={{
                            backgroundColor: 'rgba(212, 175, 55, 0.2)',
                            color: '#D4AF37',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            boxShadow: '0 0 20px -5px rgba(212, 175, 55, 0.3)'
                        }}
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {(comments || []).map((c) => {
                    const authorName = c.author
                        ? `${c.author.firstName || ''} ${c.author.lastName || ''}`.trim() || 'Anonymous'
                        : 'Anonymous';
                    const canDelete =
                        currentUserId &&
                        (c.authorId?._id === currentUserId || c.authorId === currentUserId);

                    return (
                        <div
                            key={c._id}
                            className="p-4 rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.6) 0%, rgba(15, 15, 20, 0.8) 100%)',
                                border: '1px solid rgba(212, 175, 55, 0.1)'
                            }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-mono mb-2" style={{ color: '#9A9A9A' }}>
                                        {authorName} · {new Date(c.createdAt).toLocaleString()}
                                    </div>
                                    <div className="text-sm" style={{ color: '#EDEDED' }}>
                                        <MarkdownRenderer content={c.content} />
                                    </div>
                                </div>
                                {canDelete && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(c._id)}
                                        className="p-1 text-[#9A9A9A] hover:text-red-400"
                                        aria-label="Delete comment"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {(!comments || comments.length === 0) && (
                    <p className="font-mono text-sm py-4" style={{ color: '#9A9A9A' }}>No comments yet.</p>
                )}
            </div>
        </div>
    );
}
