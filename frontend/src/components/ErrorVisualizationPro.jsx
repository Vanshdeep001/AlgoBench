import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import '../styles/error-visualization-pro.css';

// ═══════════════════════════════════════════════════════════════════════════════
//  Professional Error Visualization Component
//  Beautiful, interactive error display with visual simulations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Professional Error Visualization with Interactive Problem Simulation
 */

function BraceVisualization({ errors }) {
  const braceError = errors.find(e => e.type.includes('Brace'));
  if (!braceError) return null;

  const braces = [];
  const code = braceError.code || '';

  // Count opening and closing braces to show structure
  let depth = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') {
      braces.push({ char: '{', depth: depth++, pos: i });
    } else if (code[i] === '}') {
      braces.push({ char: '}', depth: --depth, pos: i });
    }
  }

  return (
    <div className="error-viz-section">
      <h3 className="error-viz-title">
        <Zap size={16} />
        Brace Structure Visualization
      </h3>

      <div className="brace-structure">
        {[...Array(Math.max(depth + 1, 3))].map((_, level) => (
          <div key={level} className="brace-level">
            <span className="brace-level-label">Level {level}</span>
            <div className="brace-level-content">
              {braces
                .filter(b => b.depth === level)
                .map((b, i) => (
                  <div
                    key={i}
                    className={`brace-item brace-${b.char} ${
                      b.char === '}' ? 'closing' : 'opening'
                    } ${depth > 0 && b.char === '{' ? 'unmatched' : ''}`}
                  >
                    <span className="brace-char">{b.char}</span>
                    {b.char === '{' && depth > 0 && (
                      <span className="brace-warning">⚠️ Unmatched</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="brace-analysis">
        <div className="analysis-row">
          <span>Opening Braces:</span>
          <strong>{braces.filter(b => b.char === '{').length}</strong>
        </div>
        <div className="analysis-row">
          <span>Closing Braces:</span>
          <strong>{braces.filter(b => b.char === '}').length}</strong>
        </div>
        <div className="analysis-row status-missing">
          <span>Missing:</span>
          <strong>{Math.abs(depth)} closing brace{Math.abs(depth) !== 1 ? 's' : ''}</strong>
        </div>
      </div>
    </div>
  );
}

function SemicolonVisualization({ error }) {
  if (error.type !== 'MissingSemicolon') return null;

  const codeLine = error.code;
  const lastChar = codeLine.trim().slice(-1);

  return (
    <div className="error-viz-section">
      <h3 className="error-viz-title">
        <Zap size={16} />
        Statement Termination Issue
      </h3>

      <div className="statement-viz">
        <div className="statement-before">
          <span className="statement-label">Your Code:</span>
          <div className="code-line-viz">
            <code>{codeLine}</code>
            <span className="missing-indicator">← Missing ;</span>
          </div>
        </div>

        <div className="transformation-arrow">
          <ArrowRight size={24} />
        </div>

        <div className="statement-after">
          <span className="statement-label">Should Be:</span>
          <div className="code-line-viz correct">
            <code>{codeLine};</code>
            <span className="correct-indicator">✓ Complete</span>
          </div>
        </div>
      </div>

      <div className="statement-explanation">
        <p>
          In C++, every statement must end with a semicolon <code>;</code> to signal the compiler
          that the statement is complete. Without it, the compiler gets confused about where one
          statement ends and the next begins.
        </p>
      </div>
    </div>
  );
}

function SyntaxTreeVisualization({ error }) {
  if (!error) return null;

  return (
    <div className="error-viz-section">
      <h3 className="error-viz-title">
        <Zap size={16} />
        What Went Wrong
      </h3>

      <div className="error-flow">
        <div className="flow-step error-step">
          <div className="flow-step-number">1</div>
          <div className="flow-step-content">
            <h4>Parser Started</h4>
            <p>Compiler began analyzing your code</p>
          </div>
        </div>

        <div className="flow-connector">
          <div className="connector-line"></div>
        </div>

        <div className="flow-step error-step">
          <div className="flow-step-number">2</div>
          <div className="flow-step-content">
            <h4>Found Opening {error.type.includes('Missing') ? '{' : '}'}</h4>
            <p>Started parsing code block</p>
          </div>
        </div>

        <div className="flow-connector">
          <div className="connector-line"></div>
        </div>

        <div className="flow-step error-step critical">
          <div className="flow-step-number">3</div>
          <div className="flow-step-content">
            <h4>❌ Problem Found</h4>
            <p>{error.message}</p>
          </div>
        </div>

        <div className="flow-connector">
          <div className="connector-line"></div>
        </div>

        <div className="flow-step solution-step">
          <div className="flow-step-number">✓</div>
          <div className="flow-step-content">
            <h4>How to Solve</h4>
            <p>{error.fix}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeLineHighlight({ error }) {
  if (!error.code) return null;

  const lines = error.code.split('\n');
  const problemChar = error.type.includes('Missing') ? '❌' : '⚠️';

  return (
    <div className="error-viz-section">
      <h3 className="error-viz-title">
        <AlertTriangle size={16} />
        Problematic Line
      </h3>

      <div className="code-highlight">
        <div className="line-number">L{error.line}</div>
        <div className="line-content">
          <code>{error.code}</code>
        </div>
        <div className="line-indicator">
          <span className="indicator-icon">{problemChar}</span>
          <span className="indicator-text">{error.message}</span>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ error, isExpanded, onToggle }) {
  const getSeverityEmoji = (severity) => {
    const map = {
      critical: '🔴',
      error: '🔴',
      warning: '🟡',
      info: '🔵'
    };
    return map[severity] || '❓';
  };

  return (
    <div className={`error-card-pro ${error.severity}`}>
      <button
        className="error-card-pro-header"
        onClick={onToggle}
        type="button"
      >
        <div className="header-left">
          <span className="severity-emoji">{getSeverityEmoji(error.severity)}</span>
          <div className="header-text">
            <h3>{error.message}</h3>
            <p className="error-type">{error.type}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="line-badge">Line {error.line}</span>
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </div>
      </button>

      {isExpanded && (
        <div className="error-card-pro-body">
          {/* Code Line Highlight */}
          <CodeLineHighlight error={error} />

          {/* Explanation */}
          <div className="error-viz-section">
            <h3 className="error-viz-title">
              <AlertTriangle size={16} />
              Why This Happens
            </h3>
            <p className="explanation-text">{error.explanation}</p>
          </div>

          {/* Visual Simulations */}
          <BraceVisualization errors={[error]} />
          <SemicolonVisualization error={error} />
          <SyntaxTreeVisualization error={error} />

          {/* Fix Suggestion */}
          <div className="error-viz-section fix-section">
            <h3 className="error-viz-title">
              <Zap size={16} />
              How to Fix
            </h3>
            <div className="fix-box">
              <p className="fix-text">{error.fix}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ErrorVisualizationPro({ errors }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const hasBlockingErrors = errors.some(
    e => e.severity === 'critical' || e.severity === 'error'
  );

  if (!errors || errors.length === 0) {
    return (
      <div className="error-viz-pro-empty">
        <div className="empty-content">
          <div className="empty-icon">✨</div>
          <h2>No Issues Found!</h2>
          <p>Your code looks perfect. Ready to execute!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="error-visualization-pro">
      {/* Header */}
      <div className="error-header-pro">
        <div className="header-icon">⚠️</div>
        <div className="header-content">
          <h1>CODE ISSUES DETECTED</h1>
          <p>
            Found <strong>{errors.length}</strong> issue{errors.length !== 1 ? 's' : ''} that need
            attention
          </p>
        </div>
        <div className="error-count-badge">
          <span className="count">{errors.length}</span>
          <span className="label">ISSUES</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item critical">
          <span className="status-icon">🔴</span>
          <span className="status-text">
            {errors.filter(e => e.severity === 'critical').length} Critical
          </span>
        </div>
        <div className="status-item error">
          <span className="status-icon">🔴</span>
          <span className="status-text">
            {errors.filter(e => e.severity === 'error').length} Errors
          </span>
        </div>
        <div className="status-item warning">
          <span className="status-icon">🟡</span>
          <span className="status-text">
            {errors.filter(e => e.severity === 'warning').length} Warnings
          </span>
        </div>
      </div>

      {/* Error Cards */}
      <div className="error-cards-container">
        {errors.map((error, idx) => (
          <ErrorCard
            key={`${error.line}-${error.type}`}
            error={error}
            isExpanded={idx === expandedIndex}
            onToggle={() => setExpandedIndex(idx === expandedIndex ? -1 : idx)}
          />
        ))}
      </div>

      {/* Action Footer */}
      <div className="error-action-footer">
        <div className="footer-icon">🔧</div>
        <div className="footer-content">
          <h3>Fix the issues above to continue</h3>
          <p>Make the suggested changes and your code will be ready to execute</p>
        </div>
      </div>
    </div>
  );
}
