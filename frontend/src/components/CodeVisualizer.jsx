import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { analyzeCode } from '../utils/codeAnalyzer';
import { detectErrors } from '../utils/errorDetector';
import ErrorVisualizationMinimal from './ErrorVisualizationMinimal';
import {
  Code2, GitBranch, Layers, Activity, ChevronDown, ChevronRight,
  Repeat, ArrowRight, Variable, Braces, CornerDownRight
} from 'lucide-react';

// Custom Complexity Icon
const ComplexityIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L20 6.5V17.5L12 22L4 17.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12L8 14.5M12 12L16 14.5M12 12V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Animated Loader Component
const AnimatedLoader = () => (
  <style>{`
    @keyframes pulse-dots {
      0%, 20% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
    .dot { display: inline-block; width: 6px; height: 6px; background: #EDEDED; border-radius: 50%; margin: 0 3px; animation: pulse-dots 1.4s infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
  `}</style>
);

// ─── Metrics Card ────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, accent }) {
  return (
    <div className="viz-metric-card">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: accent || 'var(--text-secondary)' }}>{icon}</span>
        <span className="viz-metric-label">{label}</span>
      </div>
      <span className="viz-metric-value">{value}</span>
    </div>
  );
}

// ─── Complexity Badge ────────────────────────────────────────────────────────
function ComplexityBadge({ complexity }) {
  if (!complexity) return null;
  let color = '#4ade80'; // green
  if (complexity.includes('n²') || complexity.includes('2ⁿ')) color = '#f87171';
  else if (complexity.includes('n')) color = '#fbbf24';

  return (
    <span
      className="viz-badge"
      style={{ color, borderColor: color + '33', background: color + '12' }}
    >
      {complexity}
    </span>
  );
}

// ─── Call Graph (SVG) ────────────────────────────────────────────────────────
function CallGraph({ analysis, highlightFn, onNodeClick }) {
  const svgRef = useRef(null);

  const { nodes, edges, width, height } = useMemo(() => {
    const fns = analysis.functions;
    if (fns.length === 0) return { nodes: [], edges: [], width: 300, height: 100 };

    // Build adjacency from callGraph — only include edges where both sides are user-defined functions
    const fnNames = new Set(fns.map((f) => f.name));
    const filteredEdges = analysis.callGraph.filter(
      (e) => fnNames.has(e.caller) && fnNames.has(e.callee) && e.caller !== e.callee
    );

    // Also include self-recursive calls
    const recursiveEdges = analysis.callGraph.filter(
      (e) => fnNames.has(e.caller) && e.caller === e.callee
    );

    // Simple layered layout: functions with no inbound edges go to layer 0
    const inboundCount = {};
    fns.forEach((f) => (inboundCount[f.name] = 0));
    filteredEdges.forEach((e) => {
      if (inboundCount[e.callee] !== undefined) inboundCount[e.callee]++;
    });

    // BFS to assign layers
    const layers = {};
    const queue = fns.filter((f) => inboundCount[f.name] === 0).map((f) => f.name);
    if (queue.length === 0 && fns.length > 0) queue.push(fns[0].name);
    queue.forEach((n) => (layers[n] = 0));

    const visited = new Set(queue);
    let qi = 0;
    while (qi < queue.length) {
      const curr = queue[qi++];
      const currLayer = layers[curr];
      filteredEdges
        .filter((e) => e.caller === curr)
        .forEach((e) => {
          if (!visited.has(e.callee)) {
            visited.add(e.callee);
            layers[e.callee] = currLayer + 1;
            queue.push(e.callee);
          }
        });
    }
    // Assign unvisited fns
    fns.forEach((f) => {
      if (layers[f.name] === undefined) layers[f.name] = 0;
    });

    // Group by layer
    const layerGroups = {};
    Object.entries(layers).forEach(([name, layer]) => {
      if (!layerGroups[layer]) layerGroups[layer] = [];
      layerGroups[layer].push(name);
    });

    const NODE_W = 160;
    const NODE_H = 52;
    const H_GAP = 40;
    const V_GAP = 70;

    const layerKeys = Object.keys(layerGroups)
      .map(Number)
      .sort((a, b) => a - b);
    const maxPerLayer = Math.max(...layerKeys.map((k) => layerGroups[k].length));

    const totalW = Math.max(maxPerLayer * (NODE_W + H_GAP) - H_GAP + 60, 300);
    const totalH = Math.max(layerKeys.length * (NODE_H + V_GAP) - V_GAP + 60, 120);

    const nodePositions = {};
    layerKeys.forEach((layer) => {
      const group = layerGroups[layer];
      const rowW = group.length * (NODE_W + H_GAP) - H_GAP;
      const startX = (totalW - rowW) / 2;
      group.forEach((name, i) => {
        nodePositions[name] = {
          x: startX + i * (NODE_W + H_GAP),
          y: 30 + layer * (NODE_H + V_GAP),
          w: NODE_W,
          h: NODE_H,
        };
      });
    });

    const nodesOut = fns
      .filter((f) => nodePositions[f.name])
      .map((f) => ({
        ...f,
        ...nodePositions[f.name],
      }));

    const edgesOut = filteredEdges
      .filter((e) => nodePositions[e.caller] && nodePositions[e.callee])
      .map((e) => {
        const from = nodePositions[e.caller];
        const to = nodePositions[e.callee];
        return {
          ...e,
          x1: from.x + from.w / 2,
          y1: from.y + from.h,
          x2: to.x + to.w / 2,
          y2: to.y,
        };
      });

    // Self-recursive edges
    const selfEdges = recursiveEdges
      .filter((e) => nodePositions[e.caller])
      .reduce((acc, e) => {
        // Deduplicate by caller
        if (!acc.find((a) => a.caller === e.caller)) acc.push(e);
        return acc;
      }, [])
      .map((e) => {
        const pos = nodePositions[e.caller];
        return { ...e, cx: pos.x + pos.w + 18, cy: pos.y + pos.h / 2, isSelf: true };
      });

    return {
      nodes: nodesOut,
      edges: [...edgesOut, ...selfEdges],
      width: totalW,
      height: totalH,
    };
  }, [analysis]);

  if (nodes.length === 0) return null;

  return (
    <div className="viz-callgraph-container">
      <h3 className="viz-section-title">
        <GitBranch size={14} />
        Call Graph
      </h3>
      <div className="viz-callgraph-scroll">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="viz-callgraph-svg"
          style={{ width: '100%', height: Math.min(height, 400) }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(212,175,55,0.6)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e, i) =>
            e.isSelf ? (
              <g key={`self-${i}`}>
                <path
                  d={`M ${e.cx - 18} ${e.cy - 10} C ${e.cx + 14} ${e.cy - 30}, ${e.cx + 14} ${e.cy + 30}, ${e.cx - 18} ${e.cy + 10}`}
                  fill="none"
                  stroke="rgba(248,113,113,0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={e.cx + 16}
                  y={e.cy + 3}
                  fill="rgba(248,113,113,0.6)"
                  fontSize="8"
                  fontFamily="var(--font-display)"
                >
                  recursive
                </text>
              </g>
            ) : (
              <g key={`edge-${i}`}>
                <line
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke="rgba(212,175,55,0.3)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHighlighted = highlightFn === node.name;
            return (
              <g
                key={node.name}
                onClick={() => onNodeClick?.(node.name)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx={4}
                  fill={isHighlighted ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)'}
                  stroke={isHighlighted ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isHighlighted ? 1.5 : 1}
                />
                <text
                  x={node.x + node.w / 2}
                  y={node.y + 22}
                  textAnchor="middle"
                  fill={isHighlighted ? '#D4AF37' : '#E8EDF2'}
                  fontSize="12"
                  fontFamily="'Unbounded', sans-serif"
                  fontWeight="700"
                >
                  {node.name.length > 16 ? node.name.slice(0, 14) + '…' : node.name}
                </text>
                <text
                  x={node.x + node.w / 2}
                  y={node.y + 40}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  ({node.params.join(', ')})
                  {node.complexity ? ` · ${node.complexity}` : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Function Detail Card ────────────────────────────────────────────────────
function FunctionCard({ fn, analysis, isExpanded, onToggle, cardRef }) {
  const fnVars = analysis.variables.filter((v) => v.scope === fn.name);
  const fnLoops = analysis.controlFlow.filter(
    (c) => c.parentFn === fn.name && c.type === 'loop'
  );
  const fnConds = analysis.controlFlow.filter(
    (c) => c.parentFn === fn.name && c.type === 'conditional'
  );
  const fnCalls = analysis.callGraph.filter((c) => c.caller === fn.name);

  return (
    <div className="viz-fn-card" ref={cardRef}>
      <button
        className="viz-fn-card-header"
        onClick={onToggle}
        type="button"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Code2 size={14} className="flex-shrink-0" style={{ color: '#D4AF37' }} />
          <span className="viz-fn-name">{fn.name}</span>
          <span className="viz-fn-params">
            ({fn.params.join(', ')})
          </span>
          <ComplexityBadge complexity={fn.complexity} />
        </div>
        <div className="flex items-center gap-3">
          <span className="viz-fn-lines">
            L{fn.startLine}–{fn.endLine}
          </span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div className="viz-fn-card-body">
          {/* Variables */}
          {fnVars.length > 0 && (
            <div className="viz-fn-section">
              <h5 className="viz-fn-section-title">
                <Variable size={12} />
                Variables ({fnVars.length})
              </h5>
              <div className="viz-tag-row">
                {fnVars.map((v, i) => (
                  <span key={i} className="viz-tag viz-tag-var">
                    <span className="viz-tag-kind">{v.kind}</span>
                    {v.name}
                    <span className="viz-tag-line">L{v.line}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Control Flow */}
          {(fnLoops.length > 0 || fnConds.length > 0) && (
            <div className="viz-fn-section">
              <h5 className="viz-fn-section-title">
                <Repeat size={12} />
                Control Flow
              </h5>
              <div className="viz-tag-row">
                {fnLoops.map((l, i) => (
                  <span key={`loop-${i}`} className="viz-tag viz-tag-loop">
                    {l.kind}
                    <span className="viz-tag-line">L{l.line}</span>
                  </span>
                ))}
                {fnConds.map((c, i) => (
                  <span key={`cond-${i}`} className="viz-tag viz-tag-cond">
                    {c.kind}
                    {c.hasElse ? ' / else' : ''}
                    <span className="viz-tag-line">L{c.line}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Calls */}
          {fnCalls.length > 0 && (
            <div className="viz-fn-section">
              <h5 className="viz-fn-section-title">
                <CornerDownRight size={12} />
                Calls Made
              </h5>
              <div className="viz-tag-row">
                {[...new Set(fnCalls.map((c) => c.callee))].map((callee, i) => (
                  <span key={i} className="viz-tag viz-tag-call">
                    <ArrowRight size={10} />
                    {callee}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fnVars.length === 0 && fnLoops.length === 0 && fnConds.length === 0 && fnCalls.length === 0 && (
            <p className="viz-empty-detail">No variables, control flow, or calls detected.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function CodeVisualizer({ code, language }) {
  const [analysis, setAnalysis] = useState(null);
  const [errors, setErrors] = useState([]);
  const [highlightFn, setHighlightFn] = useState(null);
  const [expandedFns, setExpandedFns] = useState(new Set());
  const cardRefs = useRef({});

  // Debounced analysis and error detection
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code && code.trim()) {
        // Run error detection first
        const detectedErrors = detectErrors(code, language);
        setErrors(detectedErrors);

        // Then run code analysis
        const result = analyzeCode(code, language);
        setAnalysis(result);
      } else {
        setErrors([]);
        setAnalysis(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [code, language]);

  const toggleFn = useCallback((name) => {
    setExpandedFns((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((name) => {
    setExpandedFns((prev) => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
    // Scroll to the card
    setTimeout(() => {
      cardRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  // ─── Check for critical/error level issues ───────────────────────────────────
  const hasBlockingErrors = errors.some(e => e.severity === 'critical' || e.severity === 'error');

  // Empty state
  if (!code || !code.trim()) {
    return (
      <div className="tab-content-fade">
        <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 100px)', paddingTop: '-100px' }}>
          <AnimatedLoader />
          <h3
            className="uppercase text-[#E8EDF2]"
            style={{ fontFamily: 'Unbounded', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '20px' }}
          >
            Write Code to Visualize <span className="dot"></span><span className="dot"></span><span className="dot"></span>
          </h3>
        </div>
      </div>
    );
  }

  // ─── Show errors if there are critical/error level issues ──────────────────────
  if (hasBlockingErrors) {
    return (
      <div className="tab-content-fade">
        <ErrorVisualizationMinimal errors={errors} />
      </div>
    );
  }

  // Show warnings and info if no blocking errors
  if (!analysis) {
    return (
      <div className="tab-content-fade">
        <h1 className="editorial-header-creative">Visualize</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3
            className="uppercase text-[#E8EDF2]"
            style={{ fontFamily: 'Unbounded', fontWeight: 900, letterSpacing: '-0.04em', fontSize: '36px' }}
          >
            Analyzing Code...
          </h3>
        </div>
      </div>
    );
  }

  const m = analysis.metrics;
  const hasFunctions = analysis.functions.length > 0;

  // No parseable structure
  if (!hasFunctions && analysis.variables.length === 0 && analysis.controlFlow.length === 0) {
    return (
      <div className="tab-content-fade">
        <h1 className="editorial-header-creative">Visualize</h1>

        {/* Metrics even with no functions */}
        <div className="viz-premium-dashboard">
          {/* Left Side: Code Composition */}
          <div className="viz-dashboard-col">
            <h3 className="viz-dashboard-title">Code Composition</h3>
            <div className="viz-dashboard-stat">
              <div className="viz-stat-icon-wrapper text-[#D4AF37]"><Layers size={14} /></div>
              <div className="viz-stat-info">
                <span className="viz-stat-label">Source Lines</span>
                <span className="viz-stat-value">{m.totalLines} lines</span>
              </div>
            </div>
            <div className="viz-dashboard-stat">
              <div className="viz-stat-icon-wrapper text-[#C6A85E]"><Variable size={14} /></div>
              <div className="viz-stat-info">
                <span className="viz-stat-label">Declared Variables</span>
                <span className="viz-stat-value">{m.variableCount} variables</span>
              </div>
            </div>
            <div className="viz-dashboard-stat">
              <div className="viz-stat-icon-wrapper text-zinc-500"><Code2 size={14} /></div>
              <div className="viz-stat-info">
                <span className="viz-stat-label">Subroutines / Functions</span>
                <span className="viz-stat-value">0 functions</span>
              </div>
            </div>
          </div>

          {/* Right Side: Complexity & Branching */}
          <div className="viz-dashboard-col">
            <h3 className="viz-dashboard-title">Complexity &amp; Flow</h3>
            <div className="viz-dashboard-stat">
              <div className="viz-stat-icon-wrapper text-[#FFA500]"><ComplexityIcon size={14} /></div>
              <div className="viz-stat-info">
                <span className="viz-stat-label">Cyclomatic Complexity</span>
                <span className="viz-stat-value">{m.cyclomaticComplexity} (Low)</span>
              </div>
            </div>
            <div className="viz-dashboard-stat">
              <div className="viz-stat-icon-wrapper text-zinc-500"><Repeat size={14} /></div>
              <div className="viz-stat-info">
                <span className="viz-stat-label">Control Flow Loops</span>
                <span className="viz-stat-value">0 loops</span>
              </div>
            </div>
            <div className="viz-dashboard-stat">
              <div className="viz-stat-icon-wrapper text-zinc-400"><GitBranch size={14} /></div>
              <div className="viz-stat-info">
                <span className="viz-stat-label">Decision Branches</span>
                <span className="viz-stat-value">0 branches</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Code2 size={28} className="text-[#9A9A9A] mb-3 opacity-60" />
          <p className="text-[11px] text-[#9A9A9A] max-w-sm leading-relaxed">
            No function structures detected yet. Add functions, loops, or conditionals to see a detailed visualization.
          </p>
        </div>
      </div>
    );
  }

  // Global variables (not inside any function)
  const globalVars = analysis.variables.filter((v) => v.scope === '__global__');

  // ─── Non-blocking errors (warnings/info) ─────────────────────────────────────
  const nonBlockingErrors = errors.filter(e => e.severity === 'warning' || e.severity === 'info');

  return (
    <div className="tab-content-fade">
      <h1 className="editorial-header-creative">Visualize</h1>

      {/* Show warnings banner if any non-blocking errors */}
      {nonBlockingErrors.length > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(255, 165, 0, 0.08)',
          border: '1px solid rgba(255, 165, 0, 0.2)',
          borderRadius: '10px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={18} style={{ color: '#ffa500', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#EDEDED' }}>
              {nonBlockingErrors.length} suggestion{nonBlockingErrors.length !== 1 ? 's' : ''} to improve your code
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#909099' }}>
              These don't prevent execution, but they may improve performance or style.
            </p>
          </div>
        </div>
      )}

      {/* ── Metrics Summary ── */}
      <div className="viz-premium-dashboard">
        {/* Left Side: Code Composition */}
        <div className="viz-dashboard-col">
          <h3 className="viz-dashboard-title">Code Composition</h3>
          <div className="viz-dashboard-stat">
            <div className="viz-stat-icon-wrapper text-[#D4AF37]"><Layers size={14} /></div>
            <div className="viz-stat-info">
              <span className="viz-stat-label">Source Lines</span>
              <span className="viz-stat-value">{m.totalLines} lines</span>
            </div>
          </div>
          <div className="viz-dashboard-stat">
            <div className="viz-stat-icon-wrapper text-[#C6A85E]"><Variable size={14} /></div>
            <div className="viz-stat-info">
              <span className="viz-stat-label">Declared Variables</span>
              <span className="viz-stat-value">{m.variableCount} variables</span>
            </div>
          </div>
          <div className="viz-dashboard-stat">
            <div className="viz-stat-icon-wrapper text-zinc-500"><Code2 size={14} /></div>
            <div className="viz-stat-info">
              <span className="viz-stat-label">Subroutines / Functions</span>
              <span className="viz-stat-value">{m.functionCount || 0} functions</span>
            </div>
          </div>
        </div>

        {/* Right Side: Complexity & Branching */}
        <div className="viz-dashboard-col">
          <h3 className="viz-dashboard-title">Complexity &amp; Flow</h3>
          <div className="viz-dashboard-stat">
            <div className="viz-stat-icon-wrapper text-[#FFA500]"><ComplexityIcon size={14} /></div>
            <div className="viz-stat-info">
              <span className="viz-stat-label">Cyclomatic Complexity</span>
              <span className="viz-stat-value">
                {m.cyclomaticComplexity} {m.cyclomaticComplexity > 10 ? '(High)' : m.cyclomaticComplexity > 5 ? '(Medium)' : '(Low)'}
              </span>
            </div>
          </div>
          <div className="viz-dashboard-stat">
            <div className="viz-stat-icon-wrapper text-zinc-500"><Repeat size={14} /></div>
            <div className="viz-stat-info">
              <span className="viz-stat-label">Control Flow Loops</span>
              <span className="viz-stat-value">{m.loops} loop{m.loops !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="viz-dashboard-stat">
            <div className="viz-stat-icon-wrapper text-zinc-400"><GitBranch size={14} /></div>
            <div className="viz-stat-info">
              <span className="viz-stat-label">Decision Branches</span>
              <span className="viz-stat-value">{m.conditionals} branch{m.conditionals !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Call Graph ──────────────────────────────────────────────── */}
      {hasFunctions && (
        <CallGraph
          analysis={analysis}
          highlightFn={highlightFn}
          onNodeClick={handleNodeClick}
        />
      )}

      {/* ── Global Variables ───────────────────────────────────────── */}
      {globalVars.length > 0 && (
        <div className="viz-global-vars">
          <h3 className="viz-section-title">
            <Variable size={14} />
            Global Scope
          </h3>
          <div className="viz-tag-row">
            {globalVars.map((v, i) => (
              <span key={i} className="viz-tag viz-tag-var">
                <span className="viz-tag-kind">{v.kind}</span>
                {v.name}
                <span className="viz-tag-line">L{v.line}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Function Detail Cards ──────────────────────────────────── */}
      {hasFunctions && (
        <div className="viz-fn-list">
          <h3 className="viz-section-title">
            <Code2 size={14} />
            Function Breakdown
          </h3>
          {analysis.functions.map((fn) => (
            <FunctionCard
              key={fn.name + fn.startLine}
              fn={fn}
              analysis={analysis}
              isExpanded={expandedFns.has(fn.name)}
              onToggle={() => toggleFn(fn.name)}
              cardRef={(el) => (cardRefs.current[fn.name] = el)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
