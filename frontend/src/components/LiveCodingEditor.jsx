import React, { useState, useEffect, useRef } from 'react';

const LiveCodingEditor = ({ showTestcases = true }) => {
    const [displayedCode, setDisplayedCode] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [isTestcaseOpen, setIsTestcaseOpen] = useState(true);
    const [isTestcaseMax, setIsTestcaseMax] = useState(false);
    const cursorRef = useRef(null);

    // C++ code to be typed
    const codeLines = [
        '#include <iostream>',
        '#include <vector>',
        '#include <string>',
        '#include <algorithm>',
        '#include <memory>',
        '#include <thread>',
        '#include <chrono>',
        '',
        'using namespace std;',
        '',
        'class AlgoBench {',
        'private:',
        '    vector<string> problems;',
        '    int solved;',
        '    ',
        'public:',
        '    AlgoBench() : solved(0) {}',
        '    ',
        '    void addProblem(string name) {',
        '        problems.push_back(name);',
        '    }',
        '};'
    ];

    const fullCode = codeLines.join('\n');

    useEffect(() => {
        if (!isTyping) return;

        if (currentIndex < fullCode.length) {
            // Random delay between 30-80ms for human-like typing
            const baseDelay = 30;
            const randomDelay = Math.random() * 50;

            // Add extra pause after newlines (line completion)
            const char = fullCode[currentIndex];
            const extraPause = char === '\n' ? 100 : 0;

            const timeout = setTimeout(() => {
                setDisplayedCode(fullCode.substring(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, baseDelay + randomDelay + extraPause);

            return () => clearTimeout(timeout);
        } else {
            // Pause at the end before restarting
            const timeout = setTimeout(() => {
                setDisplayedCode('');
                setCurrentIndex(0);
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, isTyping, fullCode]);

    // Apply syntax highlighting to a single line of code using React elements
    const highlightLine = (line) => {
        if (!line) return '\u00A0';

        let segments = [{ text: line, className: null }];

        // Pattern matching for syntax highlighting
        const patterns = [
            { regex: /(#include)/g, className: 'include' },
            { regex: /(<[^>]+>)/g, className: 'header' },
            { regex: /\b(class|private|public|using|namespace|void|return)\b/g, className: 'keyword' },
            { regex: /\b(int|string|vector|std)\b/g, className: 'type' },
            { regex: /"([^"]*)"/g, className: 'string' },
            { regex: /\b(\d+)\b/g, className: 'number' }
        ];

        // Apply each pattern
        patterns.forEach(({ regex, className }) => {
            let newSegments = [];
            segments.forEach(segment => {
                if (segment.className) {
                    // Already highlighted, keep as is
                    newSegments.push(segment);
                } else {
                    // Split by matches
                    let lastIndex = 0;
                    let match;
                    const text = segment.text;
                    regex.lastIndex = 0; // Reset regex

                    while ((match = regex.exec(text)) !== null) {
                        // Add text before match
                        if (match.index > lastIndex) {
                            newSegments.push({
                                text: text.substring(lastIndex, match.index),
                                className: null
                            });
                        }
                        // Add matched text with highlighting
                        newSegments.push({
                            text: match[0],
                            className: className
                        });
                        lastIndex = match.index + match[0].length;
                    }
                    // Add remaining text
                    if (lastIndex < text.length) {
                        newSegments.push({
                            text: text.substring(lastIndex),
                            className: null
                        });
                    }
                }
            });
            segments = newSegments.length > 0 ? newSegments : segments;
        });

        return segments.map((segment, idx) => {
            if (segment.className) {
                return <span key={idx} className={segment.className}>{segment.text}</span>;
            }
            return <span key={idx}>{segment.text}</span>;
        });
    };

    // Render the displayed code with syntax highlighting
    const renderCode = () => {
        const lines = displayedCode.split('\n');

        return lines.map((line, lineIndex) => {
            return (
                <div key={lineIndex} className="code-line">
                    <span className="line-number">{lineIndex + 1}</span>
                    <span className="line-content">
                        {highlightLine(line)}
                    </span>
                </div>
            );
        });
    };

    return (
        <div className="live-coding-container">
            <div className="editor-window">
                {/* macOS Window Header */}
                <div className="editor-header">
                    <div className="window-controls">
                        <div className="control-btn close"></div>
                        <div className="control-btn minimize"></div>
                        <div className="control-btn maximize"></div>
                    </div>
                    <div className="file-name">AlgoBench.cpp</div>
                    <div className="live-indicator">
                        <div className="live-dot"></div>
                        <span>Live Coding</span>
                    </div>
                </div>

                {/* Code Editor Area */}
                <div className="editor-content">
                    <div className="code-display">
                        {renderCode()}
                        <span className="cursor" ref={cursorRef}>|</span>
                    </div>
                </div>
                {/* Testcase panel (similar to LeetCode) */}
                {showTestcases && (
                    <div className={`testcase-panel ${isTestcaseOpen ? 'open' : 'closed'} ${isTestcaseMax ? 'max' : ''}`}>
                        <div className="testcase-header" onClick={() => setIsTestcaseOpen(v => !v)}>
                            <div className="testcase-title">Testcases</div>
                            <div className="testcase-controls">
                                <button
                                    className="tc-btn tc-toggle"
                                    aria-label={isTestcaseOpen ? 'Collapse testcases' : 'Expand testcases'}
                                >
                                    {isTestcaseOpen ? '▾' : '▸'}
                                </button>
                                <button
                                    className="tc-btn tc-max"
                                    onClick={(e) => { e.stopPropagation(); setIsTestcaseMax(v => !v); }}
                                    aria-label={isTestcaseMax ? 'Restore' : 'Maximize'}
                                >
                                    {isTestcaseMax ? '🗗' : '🗖'}
                                </button>
                            </div>
                        </div>
                        <div className="testcase-body" role="region" aria-hidden={!isTestcaseOpen}>
                            <div className="testcase-list">
                                <div className="tc-item"><strong>Input:</strong> 5\n1 2 3 4 5</div>
                                <div className="tc-item"><strong>Input:</strong> 3\n-1 0 1</div>
                                <div className="tc-item"><strong>Input:</strong> 4\n2 2 2 2</div>
                            </div>
                            <div className="testcase-actions">
                                <button className="run-btn">Run</button>
                                <button className="submit-btn">Submit</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .live-coding-container {
                    width: 100%;
                    max-width: 700px;
                    margin: 0 auto;
                }

                .editor-window {
                    background: #0b0b0f;
                    border-radius: 2px;
                    overflow: hidden;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    box-shadow: 
                        0 0 40px rgba(212, 175, 55, 0.15),
                        0 20px 60px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }

                .editor-window:hover {
                    border-color: rgba(212, 175, 55, 0.5);
                    box-shadow: 
                        0 0 60px rgba(212, 175, 55, 0.25),
                        0 20px 60px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                .editor-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(15, 15, 20, 0.8);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                }

                .window-controls {
                    display: flex;
                    gap: 8px;
                }

                .control-btn {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .control-btn.close {
                    background: #ff5f57;
                }

                .control-btn.minimize {
                    background: #febc2e;
                }

                .control-btn.maximize {
                    background: #28c840;
                }

                .control-btn:hover {
                    filter: brightness(1.2);
                    transform: scale(1.1);
                }

                .file-name {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    color: #9ca3af;
                    font-weight: 500;
                }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: #22c55e;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .live-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: pulse-dot 2s ease-in-out infinite;
                    box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
                }

                @keyframes pulse-dot {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(0.9);
                    }
                }

                .editor-content {
                    padding: 20px 0;
                    min-height: 400px;
                    max-height: 500px;
                    overflow-y: auto;
                    background: #0b0b0f;
                }

                /* Testcase panel styles */
                .testcase-panel {
                    border-top: 1px solid rgba(255,255,255,0.04);
                    background: linear-gradient(180deg, rgba(11,11,15,0.95), rgba(10,10,12,0.98));
                    transition: height 0.28s ease, max-height 0.28s ease;
                    overflow: hidden;
                }

                .testcase-panel.closed { height: 44px; }
                .testcase-panel.open { height: 140px; }
                .testcase-panel.open.max { height: 340px; }

                .testcase-header {
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    padding: 10px 16px;
                    cursor: pointer;
                }

                .testcase-title {
                    color: #e5e7eb;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    font-weight: 600;
                }

                .testcase-controls { display:flex; gap:8px; align-items:center; }
                .tc-btn {
                    background: transparent;
                    border: none;
                    color: #9ca3af;
                    font-size: 14px;
                    padding:6px;
                    cursor: pointer;
                }
                .tc-btn:hover { color: #fff; }

                .testcase-body {
                    padding: 10px 16px 18px 16px;
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    align-items: flex-start;
                }

                .testcase-list { flex:1; overflow:auto; max-height:220px; }
                .tc-item {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.03);
                    color: #e5e7eb;
                    padding: 10px;
                    margin-bottom: 8px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    white-space: pre-wrap;
                    border-radius: 6px;
                }

                .testcase-actions {
                    width: 140px;
                    display:flex;
                    flex-direction:column;
                    gap:8px;
                }
                .run-btn, .submit-btn {
                    padding:10px 12px;
                    border-radius:8px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                }
                .run-btn { background: rgba(99,102,241,0.12); color: #c7d2fe; }
                .submit-btn { background: linear-gradient(90deg,#f59e0b,#db2777); color: white; }
                .run-btn:hover { filter:brightness(1.05); }
                .submit-btn:hover { filter:brightness(1.05); }

                .code-display {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #e5e7eb;
                }

                .code-line {
                    display: flex;
                    padding: 0 20px;
                    position: relative;
                }

                .line-number {
                    display: inline-block;
                    width: 40px;
                    text-align: right;
                    margin-right: 20px;
                    color: #4b5563;
                    user-select: none;
                    flex-shrink: 0;
                }

                .line-content {
                    flex: 1;
                    white-space: pre;
                }

                /* Syntax Highlighting */
                .code-line :global(.include) {
                    color: #a78bfa;
                    font-weight: 600;
                }

                .code-line :global(.header) {
                    color: #c4b5fd;
                }

                .code-line :global(.keyword) {
                    color: #22d3ee;
                    font-weight: 600;
                }

                .code-line :global(.type) {
                    color: #60a5fa;
                }

                .code-line :global(.string) {
                    color: #86efac;
                }

                .code-line :global(.number) {
                    color: #fbbf24;
                }

                .cursor {
                    display: inline-block;
                    width: 2px;
                    height: 1.2em;
                    background: #D4AF37;
                    margin-left: 2px;
                    animation: blink-cursor 1s step-end infinite;
                    box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
                }

                @keyframes blink-cursor {
                    0%, 50% {
                        opacity: 1;
                    }
                    51%, 100% {
                        opacity: 0;
                    }
                }

                /* Scrollbar Styling - Hidden */
                .editor-content {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE and Edge */
                }

                .editor-content::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .live-coding-container {
                        max-width: 100%;
                    }

                    .editor-window {
                        border-radius: 2px;
                    }

                    .code-display {
                        font-size: 13px;
                    }

                    .editor-content {
                        min-height: 300px;
                        max-height: 400px;
                    }

                    .line-number {
                        width: 30px;
                        margin-right: 12px;
                    }

                    .file-name {
                        font-size: 11px;
                    }

                    .live-indicator {
                        font-size: 10px;
                    }
                }

                @media (max-width: 480px) {
                    .code-display {
                        font-size: 12px;
                    }

                    .editor-content {
                        min-height: 250px;
                        max-height: 350px;
                    }

                    .code-line {
                        padding: 0 12px;
                    }

                    .line-number {
                        width: 25px;
                        margin-right: 8px;
                    }
                }

                /* Reduced Motion Support */
                @media (prefers-reduced-motion: reduce) {
                    .cursor {
                        animation: none;
                        opacity: 1;
                    }

                    .live-dot {
                        animation: none;
                    }

                    .editor-window {
                        transition: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default LiveCodingEditor;
