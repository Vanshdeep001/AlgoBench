import { useState } from 'react';
import { X } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, onSubmit, problemId, problemTitle }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({ title: title.trim(), content: content.trim(), problemId: problemId || undefined });
            setTitle('');
            setContent('');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 10000 }} onClick={onClose}>
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[4px] flex flex-col"
                style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.99) 0%, rgba(15, 15, 20, 1.0) 100%)',
                    border: 'none',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <h2 className="text-sm font-heading font-black text-white uppercase tracking-tight" style={{ fontFamily: 'Unbounded', fontWeight: 900, letterSpacing: '-0.04em' }}>
                        {problemId ? `New discussion${problemTitle ? ` · ${problemTitle}` : ''}` : 'New post'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-none transition-colors font-mono"
                        style={{ color: '#9A9A9A' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#EDEDED'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A9A'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden p-6 gap-5">
                    <div>
                        <label className="block text-[10px] font-heading uppercase tracking-wider mb-1 text-slate-400">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title"
                            maxLength={200}
                            className="w-full py-3 focus:outline-none transition-all font-sans text-sm placeholder:text-[#9A9A9A]"
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '0',
                                color: '#EDEDED'
                            }}
                            onFocus={(e) => e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.25)'}
                            onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)'}
                        />
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-[10px] font-heading uppercase tracking-wider mb-1 text-slate-400">
                            Content (Markdown supported)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your post content... You can use **bold**, *italic*, `code`, lists, etc."
                            rows={12}
                            className="w-full flex-1 min-h-[200px] py-3 resize-y font-sans text-sm focus:outline-none transition-all placeholder:text-[#9A9A9A]"
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '0',
                                color: '#EDEDED'
                            }}
                        />
                    </div>
                    {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-[4px] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            style={{ color: '#9A9A9A' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-[4px] font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 hover:bg-white/10 cursor-pointer"
                            style={{
                                backgroundColor: 'transparent',
                                color: '#FFFFFF',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                            }}
                        >
                            {submitting ? 'Posting...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
