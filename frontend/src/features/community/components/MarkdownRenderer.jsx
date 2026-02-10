import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const proseClass =
    'prose prose-invert prose-sm max-w-none text-[#EDEDED] prose-headings:text-white prose-p:text-[#EDEDED] prose-li:text-[#EDEDED] prose-strong:text-white';

export default function MarkdownRenderer({ content, className = '' }) {
    if (!content) return null;
    return (
        <div className={`${proseClass} ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ href, children, ...props }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#D4AF37] hover:text-[#E5C04A] underline underline-offset-2 transition-colors"
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    code: ({ node, inline, className: codeClassName, children, ...props }) =>
                        inline ? (
                            <code
                                className="px-1.5 py-0.5 rounded bg-white/10 text-[#D4AF37] font-mono text-sm"
                                {...props}
                            >
                                {children}
                            </code>
                        ) : (
                            <code
                                className="block p-3 rounded bg-black/30 text-[#EDEDED] overflow-x-auto text-sm font-mono border border-white/10"
                                {...props}
                            >
                                {children}
                            </code>
                        ),
                    pre: ({ children }) => <pre className="my-2 p-0 bg-transparent overflow-x-auto">{children}</pre>,
                    blockquote: ({ children, ...props }) => (
                        <blockquote
                            className="border-l-4 border-[#D4AF37]/50 pl-4 my-3 italic text-[#9A9A9A]"
                            {...props}
                        >
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
