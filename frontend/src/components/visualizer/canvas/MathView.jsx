import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MathView = ({ data, currentState }) => {
    if (!currentState || !currentState.type) {
        return (
            <div className="math-view-container">
                <div className="empty-message-new">Select a math algorithm to visualize</div>
            </div>
        );
    }

    const { type, array, n, current, marking, a, b, remainder, gcd, lcm, base, exponent, result, binary, memo } = currentState;
    const isComplete = type === 'complete' || currentState.isComplete;

    // Sieve of Eratosthenes visualization
    if (array && n) {
        return (
            <div className="math-view-container">
                <div className="sieve-grid-container">
                    <motion.div
                        className="sieve-grid"
                        layout
                    >
                        {array.map((isPrime, index) => {
                            if (index === 0 || index === 1) return null;

                            let status = 'default';
                            if (!isPrime) status = 'composite';
                            if (index === current) status = 'current';
                            if (index === marking) status = 'marking';
                            if (isPrime && type === 'complete') status = 'prime';

                            return (
                                <motion.div
                                    key={index}
                                    className={`sieve-number ${status}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        backgroundColor: status === 'prime' ? 'rgba(16, 185, 129, 0.3)' :
                                            status === 'composite' ? 'rgba(239, 68, 68, 0.1)' :
                                                status === 'current' ? 'rgba(59, 130, 246, 0.5)' :
                                                    status === 'marking' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(30, 30, 36, 0.6)'
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {index}
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                className="math-success-overlay"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                            >
                                <span className="math-success-icon">✓</span>
                                <span className="math-success-text">Sieve Complete: Found {array.filter((x, i) => i > 1 && x).length} Primes</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // GCD/LCM visualization
    if (a !== undefined && b !== undefined) {
        return (
            <div className="math-view-container">
                <div className="gcd-container">
                    <motion.div
                        className="gcd-visual-row"
                        layout
                    >
                        <motion.div
                            className="gcd-number-box"
                            key={`a-${a}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            {a}
                        </motion.div>
                        <span className="gcd-operation">÷</span>
                        <motion.div
                            className="gcd-number-box"
                            key={`b-${b}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            {b}
                        </motion.div>
                        {remainder !== undefined && (
                            <>
                                <span className="gcd-operation">=</span>
                                <span className="gcd-operation" style={{ fontSize: '16px' }}>rem</span>
                                <motion.div
                                    className="gcd-number-box"
                                    key={`rem-${remainder}`}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                >
                                    {remainder}
                                </motion.div>
                            </>
                        )}
                    </motion.div>

                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                className="math-success-overlay"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <div className="math-success-icon">✓</div>
                                <div style={{ textAlign: 'center' }}>
                                    <div className="math-success-title">Calculation Complete</div>
                                    <div className="math-success-result">
                                        GCD = {gcd} | LCM = {lcm}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Fast Exponentiation visualization
    if (base !== undefined && exponent !== undefined) {
        return (
            <div className="math-view-container">
                <div className="exponent-container">
                    <div className="exponent-main-display">
                        <span className="base-number">{base}</span>
                        <span className="exponent-number">{exponent}</span>
                    </div>

                    {binary && (
                        <motion.div
                            className="binary-display"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {binary.split('').map((bit, i) => (
                                <motion.span
                                    key={i}
                                    className={`binary-bit ${i === binary.length - 1 ? 'active' : ''}`}
                                    animate={{
                                        color: i === binary.length - 1 ? '#FACC15' : '#64748B',
                                        scale: i === binary.length - 1 ? 1.2 : 1
                                    }}
                                >
                                    {bit}
                                </motion.span>
                            ))}
                        </motion.div>
                    )}

                    {result !== undefined && (
                        <motion.div
                            className="exponent-result-box"
                            key={`res-${result}`}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Current Result: {result}
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                className="math-success-overlay"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                <span className="math-success-icon">✓</span>
                                <span className="math-success-text">{base}^{exponent} = {result}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Factorial Memoization visualization
    if (currentState.memo || currentState.n) {
        // We'll treat 'n' as the current recursive step if provided
        const currentN = currentState.n;

        return (
            <div className="math-view-container">
                <div className="factorial-container">
                    <div className="factorial-stack">
                        <AnimatePresence>
                            {/* Assuming 'n' changes as we go deeper, we can visualize stack slightly differently
                                For now, let's visualize the current 'n' as the top of stack
                             */}
                            {/* Since we don't have the full stack history in state, we simulate it or just show current step clearly */}
                            <motion.div
                                key={currentN}
                                className={`stack-frame ${currentState.type === 'stored' || currentState.type === 'memoized' ? 'returning' : ''}`}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                            >
                                <span>Function Call: factorial({currentN})</span>
                                {currentState.result !== undefined && <span>Return: {currentState.result}</span>}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="memo-table">
                        <AnimatePresence>
                            {memo && Object.entries(memo).map(([k, v]) => (
                                <motion.div
                                    key={k}
                                    className="memo-entry"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    {k}! = {v}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                className="math-success-overlay"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                <span className="math-success-icon">✓</span>
                                <span className="math-success-text">{currentN}! = {currentState.result}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Default processing state
    return (
        <div className="math-view-container">
            <div className="empty-message-new">Processing...</div>
        </div>
    );
};

export default MathView;
