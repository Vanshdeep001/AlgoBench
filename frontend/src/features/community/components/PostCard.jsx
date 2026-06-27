import { Link, useNavigate } from 'react-router';
import MarkdownRenderer from './MarkdownRenderer';
import { useVote } from '../hooks/useVote';
import { MessageCircle, Calendar, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

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
    const navigate = useNavigate();

    const authorName = post.author
        ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Anonymous'
        : 'Anonymous';

    const initials = authorName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'A';

    const avatarGradient = getAvatarGradient(authorName);
    const postTag = getPostTag(post.title, post.content);

    const handleCardClick = (e) => {
        // Prevent clicking whole card from firing if clicking link/button inside
        if (
            e.target.closest('a') ||
            e.target.closest('button') ||
            showBody
        ) {
            return;
        }

        if (typeof onSelectPost === 'function') {
            onSelectPost(post);
        } else if (post._id) {
            navigate(`/community/posts/${post._id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group rounded-none transition-all duration-300 border border-white/5 relative ${
                !showBody && (typeof onSelectPost === 'function' || post._id)
                    ? 'cursor-pointer hover:bg-white/[0.01]'
                    : ''
            }`}
            style={{
                background: 'linear-gradient(135deg, rgba(16, 16, 21, 0.8) 0%, rgba(10, 10, 12, 0.95) 100%)',
            }}
        >
            {/* Classy left-edge highlight strip on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#D4AF37] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center pointer-events-none" />

            <div className="p-6 md:p-8 space-y-4">
                
                {/* TOP ROW: Metadata & Category */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-[9px] font-bold text-white shadow-sm shadow-black/25`}>
                            {initials}
                        </div>
                        <span className="font-semibold text-slate-300 font-sans">{authorName}</span>
                        <span className="text-slate-600 font-sans">•</span>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Calendar size={11} className="text-[#D4AF37]/50" />
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-slate-600 font-sans">•</span>
                        <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${postTag.color}`}>
                            {postTag.name}
                        </span>
                    </div>
                </div>

                {/* MIDDLE ROW: Title & Summary */}
                <div className="space-y-2">
                    <h3 className="font-creative font-bold text-base text-white tracking-tight leading-snug group-hover:text-[#D4AF37] transition-colors duration-300">
                        {typeof onSelectPost === 'function' ? (
                            <button
                                type="button"
                                onClick={() => onSelectPost(post)}
                                className="text-left hover:text-[#D4AF37] transition-colors focus:outline-none"
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

                    {showBody ? (
                        <div className="mt-4 text-sm leading-relaxed border-t border-white/5 pt-4 text-slate-300 font-sans">
                            <MarkdownRenderer content={post.content} />
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-sans">
                            {post.content ? post.content.replace(/[#*`_\[\]]/g, '') : 'No description provided.'}
                        </p>
                    )}
                </div>

                {/* BOTTOM ROW: Dynamic Actions Toolbar */}
                {!showBody && (
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        {/* Vote Controls & Reply widget */}
                        <div className="flex items-center gap-4">
                            {/* Sleek Horizontal Voter */}
                            <div className="flex items-center bg-white/[0.02] border border-white/5 p-1 gap-1">
                                {isAuthenticated ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => vote(1)}
                                            disabled={loading}
                                            className={`p-1 transition-colors hover:text-[#D4AF37] ${userVote === 1 ? 'text-[#D4AF37]' : 'text-slate-500'}`}
                                            aria-label="Upvote"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <span className="text-xs font-mono font-bold text-slate-300 px-1.5 select-none">{votes}</span>
                                        <button
                                            type="button"
                                            onClick={() => vote(-1)}
                                            disabled={loading}
                                            className={`p-1 transition-colors hover:text-[#D4AF37] ${userVote === -1 ? 'text-[#D4AF37]' : 'text-slate-500'}`}
                                            aria-label="Downvote"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5">
                                        <span className="text-[10px] uppercase font-mono text-slate-500">Votes:</span>
                                        <span className="text-xs font-mono font-bold text-[#D4AF37]">{votes}</span>
                                    </div>
                                )}
                            </div>

                            {/* Reply Counter button */}
                            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-white/5 px-2.5 py-1.5">
                                <MessageCircle size={14} className="text-[#D4AF37]" />
                                <span>{post.commentCount ?? 0} Comments</span>
                            </div>
                        </div>

                        {/* Slide-out action indicator */}
                        <div className="flex items-center gap-3">
                            {canDelete && onDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(post._id)}
                                    className="text-[10px] font-mono uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1.5 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                                >
                                    Delete
                                </button>
                            )}

                            <div className="text-xs text-[#D4AF37] font-semibold flex items-center gap-0.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <span className="font-mono text-[10px] uppercase tracking-wider">Open Thread</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
