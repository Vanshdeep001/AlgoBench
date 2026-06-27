import React, { useState, useCallback } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle,
  Lightbulb,
  Code2,
  Zap,
} from 'lucide-react';
import '../styles/error-visualization.css';

const SEVERITY_CONFIG = {
  critical: {
    color: '#ff4757',
    bgColor: 'rgba(255, 71, 87, 0.08)',
    borderColor: 'rgba(255, 71, 87, 0.2)',
    icon: AlertCircle,
    label: 'Critical Error',
  },
  error: {
    color: '#ff6b6b',
    bgColor: 'rgba(255, 107, 107, 0.08)',
    borderColor: 'rgba(255, 107, 107, 0.2)',
    icon: AlertCircle,
    label: 'Error',
  },
  warning: {
    color: '#ffa500',
    bgColor: 'rgba(255, 165, 0, 0.08)',
    borderColor: 'rgba(255, 165, 0, 0.2)',
    icon: AlertTriangle,
    label: 'Warning',
  },
  info: {
    color: '#00d9ff',
    bgColor: 'rgba(0, 217, 255, 0.08)',
    borderColor: 'rgba(0, 217, 255, 0.2)',
    icon: Info,
    label: 'Info',
  },
};

const CATEGORY_EMOJI = {
  syntax: '🔴',
  logic: '🟡',
  performance: '⚡',
  style: '✨',
  security: '🔒',
};

/**
 * Individual error card with expandable details
 */
function ErrorCard({ error, isExpanded, onToggle }) {
  const [copied, setCopied] = useState(false);
  const config = SEVERITY_CONFIG[error.severity];
  const Icon = config.icon;

  const handleCopy = useCallback(() => {
    const text = `Line ${error.line}: ${error.message}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [error]);

  return (
    <div
      className="error-card"
      style={{
        borderColor: config.borderColor,
        backgroundColor: config.bgColor,
      }}
    >
      {/* Header - clickable to expand */}
      <button
        className="error-card-header"
        onClick={onToggle}
        type="button"
      >
        <div className="error-card-header-left">
          <Icon size={18} style={{ color: config.color, flexShrink: 0 }} />
          <div className="error-card-header-text">
            <div className="error-type">
              <span className="error-badge" style={{ color: config.color }}>
                {CATEGORY_EMOJI[error.category]} {error.type}
              </span>
              <span className="error-line">L{error.line}</span>
            </div>
            <div className="error-message">{error.message}</div>
          </div>
        </div>
        <div className="error-card-actions">
          <button
            className="error-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            type="button"
            title="Copy error"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="error-card-body">
          {/* Code snippet */}
          {error.code && (
            <div className="error-code-section">
              <h4 className="error-section-title">
                <Code2 size={14} />
                Code
              </h4>
              <pre className="error-code-block">
                <code>{error.code}</code>
              </pre>
            </div>
          )}

          {/* Explanation */}
          {error.explanation && (
            <div className="error-explanation-section">
              <h4 className="error-section-title">
                <AlertCircle size={14} />
                What's happening?
              </h4>
              <p className="error-explanation-text">{error.explanation}</p>
            </div>
          )}

          {/* Fix suggestion */}
          {error.fix && (
            <div className="error-fix-section">
              <h4 className="error-section-title">
                <Lightbulb size={14} />
                How to fix
              </h4>
              <div className="error-fix-suggestion">{error.fix}</div>
            </div>
          )}

          {/* Additional context */}
          {error.context && (
            <div className="error-context-section">
              <h4 className="error-section-title">
                <Info size={14} />
                Additional Info
              </h4>
              <p className="error-context-text">{error.context}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Error summary statistics
 */
function ErrorSummary({ errors }) {
  const bySeverity = {
    critical: errors.filter(e => e.severity === 'critical').length,
    error: errors.filter(e => e.severity === 'error').length,
    warning: errors.filter(e => e.severity === 'warning').length,
    info: errors.filter(e => e.severity === 'info').length,
  };

  return (
    <div className="error-summary">
      <div className="error-summary-content">
        <div className="error-summary-text">
          <h3 className="error-summary-title">
            {bySeverity.critical > 0 || bySeverity.error > 0
              ? '🚨 Code Issues Detected'
              : '⚠️ Code Review'}
          </h3>
          <p className="error-summary-desc">
            {bySeverity.critical + bySeverity.error === 0
              ? 'Your code looks good, but has some suggestions.'
              : `Found ${bySeverity.critical + bySeverity.error} issue${bySeverity.critical + bySeverity.error !== 1 ? 's' : ''} that need attention.`}
          </p>
        </div>

        <div className="error-summary-stats">
          {bySeverity.critical > 0 && (
            <div className="error-stat critical">
              <span className="error-stat-count">{bySeverity.critical}</span>
              <span className="error-stat-label">Critical</span>
            </div>
          )}
          {bySeverity.error > 0 && (
            <div className="error-stat error">
              <span className="error-stat-count">{bySeverity.error}</span>
              <span className="error-stat-label">Errors</span>
            </div>
          )}
          {bySeverity.warning > 0 && (
            <div className="error-stat warning">
              <span className="error-stat-count">{bySeverity.warning}</span>
              <span className="error-stat-label">Warnings</span>
            </div>
          )}
          {bySeverity.info > 0 && (
            <div className="error-stat info">
              <span className="error-stat-count">{bySeverity.info}</span>
              <span className="error-stat-label">Info</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main Error Visualization Component
 */
export default function ErrorVisualization({ errors }) {
  const [expandedErrors, setExpandedErrors] = React.useState(new Set());

  const toggleError = useCallback((index) => {
    setExpandedErrors(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Auto-expand first critical/error
  React.useEffect(() => {
    if (errors.length > 0 && expandedErrors.size === 0) {
      const firstImportantIndex = errors.findIndex(
        e => e.severity === 'critical' || e.severity === 'error'
      );
      if (firstImportantIndex >= 0) {
        setExpandedErrors(new Set([firstImportantIndex]));
      }
    }
  }, [errors, expandedErrors]);

  if (!errors || errors.length === 0) {
    return (
      <div className="error-visualization error-visualization-empty">
        <div className="error-empty-state">
          <CheckCircle size={48} className="error-empty-icon" />
          <h3 className="error-empty-title">Code looks great!</h3>
          <p className="error-empty-desc">No issues detected. Your code is ready to run.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="error-visualization">
      {/* Summary Statistics */}
      <ErrorSummary errors={errors} />

      {/* Error List */}
      <div className="error-list">
        {errors.map((error, idx) => (
          <ErrorCard
            key={`${error.line}-${error.type}-${idx}`}
            error={error}
            isExpanded={expandedErrors.has(idx)}
            onToggle={() => toggleError(idx)}
          />
        ))}
      </div>

      {/* Action Footer */}
      <div className="error-footer">
        <div className="error-footer-content">
          <div className="error-footer-icon">
            <Zap size={16} />
          </div>
          <div className="error-footer-text">
            <p>Fix errors to enable code execution and visualization.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
