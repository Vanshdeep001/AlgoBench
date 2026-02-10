import { ChevronUp, ChevronDown } from 'lucide-react';

export default function VoteControls({ votes, userVote, onVote, loading, disabled }) {
    const upActive = userVote === 1;
    const downActive = userVote === -1;

    return (
        <div className="flex flex-col items-center gap-0.5 min-w-[2.5rem]">
            <button
                type="button"
                onClick={() => onVote(1)}
                disabled={disabled || loading}
                className={`p-1 rounded transition-colors ${
                    upActive
                        ? 'text-[#D4AF37] bg-[#D4AF37]/15'
                        : 'text-[#9A9A9A] hover:bg-white/5 hover:text-[#D4AF37]'
                } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Upvote"
            >
                <ChevronUp size={22} strokeWidth={2.5} />
            </button>
            <span className="text-sm font-semibold text-[#EDEDED] tabular-nums">{votes}</span>
            <button
                type="button"
                onClick={() => onVote(-1)}
                disabled={disabled || loading}
                className={`p-1 rounded transition-colors ${
                    downActive
                        ? 'text-[#D4AF37] bg-[#D4AF37]/15'
                        : 'text-[#9A9A9A] hover:bg-white/5 hover:text-[#D4AF37]'
                } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Downvote"
            >
                <ChevronDown size={22} strokeWidth={2.5} />
            </button>
        </div>
    );
}
