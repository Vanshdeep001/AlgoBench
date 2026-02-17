import { useRef, useEffect, useState } from 'react';

const GraphView = ({ data, currentState, onNodeClick }) => {
  const svgRef = useRef(null);
  // Default graph structure if data is empty or not in graph format
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [draggingNode, setDraggingNode] = useState(null);

  // Initialize graph data
  useEffect(() => {
    if (data && data.nodes && data.edges) {
      // Data is already in graph format
      setGraphData(data);
    } else {
      // Fallback: Default sample graph for demonstration
      setGraphData({
        nodes: [
          { id: 0, value: 'A', x: 500, y: 100 },
          { id: 1, value: 'B', x: 250, y: 250 },
          { id: 2, value: 'C', x: 750, y: 250 },
          { id: 3, value: 'D', x: 250, y: 450 },
          { id: 4, value: 'E', x: 750, y: 450 },
          { id: 5, value: 'F', x: 500, y: 600 }
        ],
        edges: [
          { source: 0, target: 1 },
          { source: 0, target: 2 },
          { source: 1, target: 3 },
          { source: 2, target: 4 },
          { source: 3, target: 5 },
          { source: 4, target: 5 },
          { source: 1, target: 4 } // Cross edge
        ]
      });
    }
  }, [data]);

  // Handle Dragging
  const handleMouseDown = (e, nodeId) => {
    e.preventDefault();
    setDraggingNode(nodeId);
  };

  const handleMouseMove = (e) => {
    if (draggingNode !== null && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setGraphData(prev => ({
        ...prev,
        nodes: prev.nodes.map(node =>
          node.id === draggingNode ? { ...node, x, y } : node
        )
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  // Helper to check node states
  const getNodeClass = (nodeId) => {
    let classes = ['graph-node'];
    if (currentState?.activeNodes?.includes(nodeId) || currentState?.currentNode === nodeId) classes.push('active');
    if (currentState?.visitedNodes?.includes(nodeId)) classes.push('visited');
    if (currentState?.pathNodes?.includes(nodeId)) classes.push('path');
    if (currentState?.startNode === nodeId) classes.push('start');
    if (currentState?.targetNode === nodeId) classes.push('target');
    return classes.join(' ');
  };

  const getEdgeClass = (source, target) => {
    let classes = ['graph-edge'];
    // Logic to highlight edges based on traversal would go here
    // For now simple checking if both connected nodes are visited/path might be enough approximation
    // or exact edge tracking from logic
    const edgeId = `${source}-${target}`;
    if (currentState?.activeEdges?.includes(edgeId)) classes.push('active');
    if (currentState?.pathEdges?.includes(edgeId)) classes.push('path');
    return classes.join(' ');
  };

  return (
    <div className="graph-view-container">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="graph-svg"
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="43" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>

        {/* Edges */}
        {graphData.edges.map((edge, idx) => {
          const sourceNode = graphData.nodes.find(n => n.id === edge.source);
          const targetNode = graphData.nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          // Calculate midpoint for weight label
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;

          return (
            <g key={idx}>
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                className={getEdgeClass(edge.source, edge.target)}
                strokeWidth="2"
              />
              {/* Edge Weight Label */}
              {edge.weight !== undefined && (
                <g>
                  <circle cx={midX} cy={midY} r="8" fill="#1e1e24" />
                  <text
                    x={midX}
                    y={midY}
                    dy=".3em"
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="10"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {edge.weight}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {graphData.nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x},${node.y})`}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={() => onNodeClick && onNodeClick(node)}
            style={{ cursor: 'grab' }}
          >
            <circle
              r="35"
              className={getNodeClass(node.id)}
            />
            <text
              dy=".35em"
              textAnchor="middle"
              className="node-text"
            >
              {node.value}
            </text>

            {/* Distance label for Dijkstra/BFS levels */}
            {currentState?.distances && currentState.distances[node.id] !== undefined && (
              <text dy="-25" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold">
                d:{currentState.distances[node.id] === Infinity ? '∞' : currentState.distances[node.id]}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default GraphView;
