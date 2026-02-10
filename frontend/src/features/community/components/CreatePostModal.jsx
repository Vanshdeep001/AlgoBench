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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={onClose}>
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
                style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.98) 0%, rgba(15, 15, 20, 0.99) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                    <h2 className="text-xl font-display font-semibold text-white">
                        {problemId ? `New discussion${problemTitle ? ` · ${problemTitle}` : ''}` : 'New post'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl transition-colors font-mono"
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
                        <label className="block text-sm font-mono font-medium mb-2" style={{ color: '#9A9A9A' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title"
                            maxLength={200}
                            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all placeholder:text-[#9A9A9A]"
                            style={{
                                backgroundColor: 'rgba(11, 11, 14, 0.6)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                color: '#EDEDED'
                            }}
                        />
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-mono font-medium mb-2" style={{ color: '#9A9A9A' }}>
                            Content (Markdown supported)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your post content... You can use **bold**, *italic*, `code`, lists, etc."
                            rows={12}
                            className="w-full flex-1 min-h-[200px] px-4 py-3 rounded-xl resize-y font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all placeholder:text-[#9A9A9A]"
                            style={{
                                backgroundColor: 'rgba(11, 11, 14, 0.6)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                color: '#EDEDED'
                            }}
                        />
                    </div>
                    {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-mono transition-colors"
                            style={{ color: '#9A9A9A' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 hover:scale-[1.02]"
                            style={{
                                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                color: '#D4AF37',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                boxShadow: '0 0 20px -5px rgba(212, 175, 55, 0.3)'
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
