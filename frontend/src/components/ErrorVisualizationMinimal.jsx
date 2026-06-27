import React, { useState } from 'react';
import '../styles/error-visualization-minimal.css';

/**
 * Minimal, Classy Error Visualization
 * Premium through simplicity and restraint
 */

// Custom SVG Icons
const AlertIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="22" r="1.5" fill="currentColor"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11 16L14.5 19.5L22 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ErrorItem({ error, isExpanded, onToggle }) {
  return (
    <div className={`error-item ${isExpanded ? 'expanded' : ''} severity-${error.severity}`}>
      {/* Header - Always visible */}
      <button className="error-header" onClick={onToggle} type="button">
        <div className="error-location">
          <span className="line-number">Line {error.line}</span>
          <span className="error-type">{error.type}</span>
        </div>
        <div className="error-message">{error.message}</div>
        <div className="chevron">{isExpanded ? '▲' : '▼'}</div>
      </button>

      {/* Body - Shown when expanded */}
      {isExpanded && (
        <div className="error-body">
          {/* Code snippet */}
          {error.code && (
            <div className="code-section">
              <div className="code-label">Line {error.line}</div>
              <pre className="code-snippet"><code>{error.code}</code></pre>
            </div>
          )}

          {/* Problem */}
          <div className="problem-section">
            <div className="section-label">Problem</div>
            <p className="problem-text">{error.explanation}</p>
          </div>

          {/* Solution */}
          <div className="solution-section">
            <div className="section-label">Solution</div>
            <p className="solution-text">{error.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ErrorVisualizationMinimal({ errors }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!errors || errors.length === 0) {
    return (
      <div className="error-minimal-empty">
        <div className="empty-icon-large">
          <CheckIcon />
        </div>
        <div className="empty-message">Ready to Execute</div>
        <div className="empty-subtitle">No issues detected</div>
      </div>
    );
  }

  const criticalErrors = errors.filter(e => e.severity === 'critical' || e.severity === 'error');
  const hasBlockingErrors = criticalErrors.length > 0;

  return (
    <div className="error-visualization-minimal">
      {/* Header */}
      <div className="minimal-header">
        <div className="header-title">
          <div className="icon-wrapper">
            {hasBlockingErrors ? <AlertIcon /> : <CheckIcon />}
          </div>
          <span className="title-text">
            {hasBlockingErrors ? 'Issues Found' : 'Ready to Execute'}
          </span>
        </div>
        <div className="header-count">{errors.length}</div>
      </div>

      {/* Errors List */}
      <div className="errors-list">
        {errors.map((error, idx) => (
          <ErrorItem
            key={`${error.line}-${error.type}`}
            error={error}
            isExpanded={idx === expandedIndex}
            onToggle={() => setExpandedIndex(idx === expandedIndex ? -1 : idx)}
          />
        ))}
      </div>

      {/* Footer Message */}
      <div className="minimal-footer">
        <span className="footer-text">
          {hasBlockingErrors
            ? 'Fix the issues above to run your code'
            : 'Your code can run but has suggestions'}
        </span>
      </div>
    </div>
  );
}
