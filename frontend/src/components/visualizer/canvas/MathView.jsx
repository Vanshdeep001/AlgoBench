import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── SIEVE OF ERATOSTHENES ───────────────────────────────────────────────────
const SieveView = ({ currentState }) => {
    const { array, current, marking, type } = currentState;
    if (!array) return null;
    const isComplete = type === 'complete' || currentState.isComplete;
    const primes = array.reduce((acc, isPrime, i) => { if (i > 1 && isPrime) acc.push(i); return acc; }, []);

    return (
        <div className="mv-sieve-wrapper">
            <div className="mv-sieve-header">
                <span className="mv-algo-label">Sieve of Eratosthenes</span>
                <AnimatePresence>
                    {isComplete && (
                        <motion.span className="mv-badge-prime"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            {primes.length} Primes Found
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Current prime being processed */}
            <AnimatePresence mode="wait">
                {current > 1 && !isComplete && (
                    <motion.div className="mv-sieve-focus"
                        key={current}
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        <span className="mv-sieve-focus-label">Eliminating multiples of</span>
                        <span className="mv-sieve-focus-num">{current}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Number Grid */}
            <div className="mv-sieve-grid">
                {array.map((isPrime, index) => {
                    if (index < 2) return null;
                    const isCurrent = index === current;
                    const isMarking = index === marking;
                    const status = isComplete && isPrime ? 'prime'
                        : isCurrent ? 'current'
                            : isMarking ? 'marking'
                                : !isPrime ? 'composite'
                                    : 'default';

                    return (
                        <motion.div
                            key={index}
                            className={`mv-sieve-cell mv-sieve-${status}`}
                            animate={{
                                scale: isCurrent ? 1.25 : isMarking ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            {index}
                            {isComplete && isPrime && <div className="mv-sieve-dot" />}
                        </motion.div>
                    );
                })}
            </div>

            {/* Prime ribbon at the bottom */}
            {primes.length > 0 && (
                <div className="mv-prime-ribbon">
                    <span className="mv-prime-ribbon-label">PRIMES</span>
                    <div className="mv-prime-ribbon-list">
                        {primes.slice(0, 30).map(p => (
                            <motion.span key={p} className="mv-prime-chip"
                                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                {p}
                            </motion.span>
                        ))}
                        {primes.length > 30 && <span className="mv-prime-chip">+{primes.length - 30}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── GCD / LCM ───────────────────────────────────────────────────────────────
const GcdView = ({ currentState }) => {
    const { a, b, remainder, gcd, lcm, type } = currentState;
    const isComplete = type === 'complete' || currentState.isComplete;
    const maxVal = Math.max(a || 1, b || 1, 1);
    const aWidth = Math.round(((a || 0) / maxVal) * 100);
    const bWidth = Math.round(((b || 0) / maxVal) * 100);

    return (
        <div className="mv-gcd-wrapper">
            <div className="mv-algo-label">Euclidean Algorithm — GCD / LCM</div>

            {/* Main number display */}
            <div className="mv-gcd-numbers">
                <motion.div className="mv-gcd-card mv-gcd-a"
                    key={`a-${a}`} layout
                    initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <span className="mv-gcd-badge">A</span>
                    <span className="mv-gcd-value">{a}</span>
                </motion.div>

                <div className="mv-gcd-op-zone">
                    <span className="mv-gcd-op">mod</span>
                    {remainder !== undefined && (
                        <motion.div className="mv-gcd-remainder"
                            key={`r-${remainder}`}
                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <span className="mv-gcd-rem-label">rem</span>
                            <span className={`mv-gcd-rem-value ${remainder === 0 ? 'zero' : ''}`}>{remainder}</span>
                        </motion.div>
                    )}
                </div>

                <motion.div className="mv-gcd-card mv-gcd-b"
                    key={`b-${b}`} layout
                    initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <span className="mv-gcd-badge">B</span>
                    <span className="mv-gcd-value">{b}</span>
                </motion.div>
            </div>

            {/* Bar visualization */}
            <div className="mv-gcd-bars">
                <div className="mv-gcd-bar-row">
                    <span className="mv-gcd-bar-label">A</span>
                    <div className="mv-gcd-bar-track">
                        <motion.div className="mv-gcd-bar mv-gcd-bar-a"
                            animate={{ width: `${aWidth}%` }} transition={{ duration: 0.4 }} />
                    </div>
                    <span className="mv-gcd-bar-val">{a}</span>
                </div>
                <div className="mv-gcd-bar-row">
                    <span className="mv-gcd-bar-label">B</span>
                    <div className="mv-gcd-bar-track">
                        <motion.div className="mv-gcd-bar mv-gcd-bar-b"
                            animate={{ width: `${bWidth}%` }} transition={{ duration: 0.4 }} />
                    </div>
                    <span className="mv-gcd-bar-val">{b}</span>
                </div>
            </div>

            {/* Result Panel */}
            <AnimatePresence>
                {isComplete && gcd !== undefined && (
                    <motion.div className="mv-result-panel"
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="mv-result-row">
                            <div className="mv-result-item">
                                <span className="mv-result-label">GCD</span>
                                <span className="mv-result-value">{gcd}</span>
                            </div>
                            <div className="mv-result-divider" />
                            <div className="mv-result-item">
                                <span className="mv-result-label">LCM</span>
                                <span className="mv-result-value">{lcm}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── FAST EXPONENTIATION ─────────────────────────────────────────────────────
const ExponentView = ({ currentState }) => {
    const { base, exponent, result, binary, type } = currentState;
    const isComplete = type === 'complete' || currentState.isComplete;
    const bits = binary ? binary.split('') : [];
    const originalBase = currentState.base;
    const originalExp = currentState.exponent;

    return (
        <div className="mv-exp-wrapper">
            <div className="mv-algo-label">Fast Exponentiation — Binary Method</div>

            {/* Power Expression Display */}
            <div className="mv-exp-hero">
                <motion.div className="mv-exp-expression" layout>
                    <span className="mv-exp-base">{originalBase ?? base}</span>
                    <span className="mv-exp-pow-symbol">^</span>
                    <span className="mv-exp-exp-num">{originalExp ?? exponent}</span>
                </motion.div>
            </div>

            {/* Binary Decomposition strip */}
            {bits.length > 0 && (
                <div className="mv-exp-binary-section">
                    <span className="mv-exp-binary-label">BINARY EXPONENT — {binary}</span>
                    <div className="mv-exp-bits">
                        {bits.map((bit, i) => {
                            const isActive = i === bits.length - 1;
                            return (
                                <motion.div
                                    key={`${binary}-${i}`}
                                    className={`mv-exp-bit ${bit === '1' ? 'one' : 'zero'} ${isActive ? 'active' : ''}`}
                                    animate={{ scale: isActive ? 1.3 : 1 }}
                                    transition={{ duration: 0.2 }}>
                                    {bit}
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="mv-exp-step-info">
                        <span className={`mv-exp-tag ${type === 'multiply' ? 'multiply' : type === 'square' ? 'square' : 'skip'}`}>
                            {type === 'multiply' ? '× MULTIPLY' : type === 'square' ? '² SQUARE' : '⟶ SKIP'}
                        </span>
                        <span className="mv-exp-cur-base">base = {base}</span>
                    </div>
                </div>
            )}

            {/* Running Result */}
            {result !== undefined && (
                <motion.div className="mv-exp-result-track"
                    key={result} layout
                    initial={{ scale: 0.9, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}>
                    <span className="mv-exp-result-label">CURRENT RESULT</span>
                    <motion.span className="mv-exp-result-value"
                        key={`res-${result}`}
                        initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        {result}
                    </motion.span>
                </motion.div>
            )}

            {/* Final answer */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div className="mv-result-panel"
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="mv-result-row">
                            <div className="mv-result-item">
                                <span className="mv-result-label">{originalBase}^{originalExp}</span>
                                <span className="mv-result-value mv-result-gold">{result}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── FACTORIAL WITH MEMOIZATION ──────────────────────────────────────────────
const FactorialView = ({ currentState }) => {
    const { n, result, memo, type } = currentState;
    const isComplete = type === 'complete' || currentState.isComplete;
    const memoEntries = memo ? Object.entries(memo) : [];
    const stackRef = useRef(null);

    const frameType = type === 'base' ? 'base'
        : type === 'memoized' ? 'memoized'
            : type === 'stored' ? 'stored'
                : type === 'computing' ? 'computing'
                    : 'init';

    const frameColors = {
        base: '#10B981',
        memoized: '#D4AF37',
        stored: '#6366F1',
        computing: '#3B82F6',
        init: '#64748B',
    };

    return (
        <div className="mv-fact-wrapper">
            <div className="mv-algo-label">Factorial — Memoized Recursion</div>

            <div className="mv-fact-layout">
                {/* Call Stack */}
                <div className="mv-fact-stack-zone">
                    <span className="mv-fact-zone-label">CALL STACK</span>
                    <div className="mv-fact-stack" ref={stackRef}>
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={`frame-${n}-${type}`}
                                className="mv-fact-frame"
                                style={{ borderColor: frameColors[frameType] }}
                                initial={{ x: -60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 60, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
                                <div className="mv-fact-frame-header" style={{ background: `${frameColors[frameType]}20` }}>
                                    <span className="mv-fact-fn">factorial</span>
                                    <span className="mv-fact-arg" style={{ color: frameColors[frameType] }}>({n})</span>
                                </div>
                                <div className="mv-fact-frame-body">
                                    {type === 'computing' && (
                                        <span className="mv-fact-expr">{n} × factorial({n - 1})</span>
                                    )}
                                    {(type === 'stored' || type === 'base' || type === 'memoized') && result !== undefined && (
                                        <span className="mv-fact-expr return">↩ {result}</span>
                                    )}
                                    {type === 'memoized' && (
                                        <span className="mv-fact-memo-hit">⚡ CACHE HIT</span>
                                    )}
                                </div>
                                <div className="mv-fact-frame-tag" style={{ background: frameColors[frameType] }}>
                                    {frameType.toUpperCase()}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Memo Table */}
                <div className="mv-fact-memo-zone">
                    <span className="mv-fact-zone-label">MEMO CACHE</span>
                    <div className="mv-fact-memo-table">
                        <div className="mv-fact-memo-header">
                            <span>n</span>
                            <span>n!</span>
                        </div>
                        <AnimatePresence>
                            {memoEntries.map(([k, v]) => (
                                <motion.div key={k} className="mv-fact-memo-row"
                                    initial={{ x: 20, opacity: 0, height: 0 }}
                                    animate={{ x: 0, opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}>
                                    <span className="mv-fact-memo-key">{k}</span>
                                    <span className="mv-fact-memo-val">{v}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Final result */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div className="mv-result-panel"
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="mv-result-row">
                            <div className="mv-result-item">
                                <span className="mv-result-label">{n}!</span>
                                <span className="mv-result-value mv-result-gold">{result}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── MAIN MATH VIEW ──────────────────────────────────────────────────────────
const MathView = ({ data, currentState }) => {
    if (!currentState || !currentState.type) {
        return (
            <div className="mv-empty">
                <div className="mv-empty-icon">∑</div>
                <div className="mv-empty-text">Select a math algorithm to visualize</div>
            </div>
        );
    }

    const { array, n, a, base, exponent } = currentState;

    if (array !== undefined && n !== undefined) return <SieveView currentState={currentState} />;
    if (a !== undefined || currentState.gcd !== undefined || currentState.lcm !== undefined) return <GcdView currentState={currentState} />;
    if (base !== undefined && exponent !== undefined) return <ExponentView currentState={currentState} />;
    if (n !== undefined || currentState.memo !== undefined) return <FactorialView currentState={currentState} />;

    return (
        <div className="mv-empty">
            <div className="mv-empty-icon">⟳</div>
            <div className="mv-empty-text">Processing...</div>
        </div>
    );
};

export default MathView;
