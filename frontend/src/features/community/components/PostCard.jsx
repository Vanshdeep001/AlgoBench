import { Link } from 'react-router';
import MarkdownRenderer from './MarkdownRenderer';
import VoteControls from './VoteControls';
import { useVote } from '../hooks/useVote';
import { MessageCircle, Calendar } from 'lucide-react';

export default function PostCard({
    post,
    showBody = false,
    problemId,
    isAuthenticated,
    onDelete,
    canDelete,
    onSelectPost,
}) {
    const { votes, userVote, vote, loading } = useVote(post._id, post.votes);

    const authorName = post.author
        ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Anonymous'
        : 'Anonymous';

    return (
        <div
            className="rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#D4AF37]/25"
            style={{
                border: '1px solid rgba(212, 175, 55, 0.15)',
                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
        >
            <div className="flex gap-4 p-5">
                {isAuthenticated ? (
                    <VoteControls
                        votes={votes}
                        userVote={userVote}
                        onVote={vote}
                        loading={loading}
                        disabled={false}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-0.5 min-w-[2.5rem] pt-1">
                        <span className="text-sm font-semibold text-[#EDEDED]">{votes}</span>
                        <span className="text-xs text-[#9A9A9A]">votes</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-lg text-white">
                            {typeof onSelectPost === 'function' ? (
                                <button
                                    type="button"
                                    onClick={() => onSelectPost(post)}
                                    className="text-left hover:text-[#D4AF37] transition-colors"
                                >
                                    {post.title}
                                </button>
                            ) : (
                                <Link
                                    to={`/community/posts/${post._id}`}
                                    className="hover:text-[#D4AF37] transition-colors"
                                >
                                    {post.title}
                                </Link>
                            )}
                        </h3>
                        {canDelete && onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(post._id)}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm font-mono" style={{ color: '#9A9A9A' }}>
                        <span>{authorName}</span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MessageCircle size={14} />
                            {post.commentCount ?? 0} comments
                        </span>
                    </div>
                    {showBody && (
                        <div className="mt-3 text-sm">
                            <MarkdownRenderer content={post.content} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
