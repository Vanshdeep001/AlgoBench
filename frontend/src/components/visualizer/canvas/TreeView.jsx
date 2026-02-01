import { useRef, useEffect, useState } from 'react';

const TreeView = ({ data, currentState, onNodeClick }) => {
  const svgRef = useRef(null);

  // Helper to flatten tree for rendering active/visited states
  // We assume currentState.root is the source of truth during animation
  // If not animating, we might use data as root
  const rootParams = currentState?.root || (data && data.root ? data.root : null);

  // If no tree structure yet, maybe show input array waiting to be inserted?
  // Or if we are in insertion mode, root might be null initially.

  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Recursive render helper
  const renderTree = (node, level = 0, offset = 0) => {
    if (!node) return null;

    // Node styling
    let nodeClass = 'tree-node';
    if (currentState?.activeNodes?.includes(node.id)) nodeClass += ' active';
    if (currentState?.visitedNodes?.includes(node.id)) nodeClass += ' visited';
    if (currentState?.currentNode === node.id) nodeClass += ' active';
    if (currentState?.targetNode === node.id) nodeClass += ' target';
    if (currentState?.pathNodes?.includes(node.id)) nodeClass += ' path';

    // Check if new node (just inserted)
    if (currentState?.newNode === node.id) nodeClass += ' new-node';

    return (
      <g key={node.id}>
        {/* Links to children */}
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            className="tree-link"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            className="tree-link"
          />
        )}

        {/* Render Children Recursively first so lines are behind? No, SVG order painters algo. */}
        {renderTree(node.left, level + 1)}
        {renderTree(node.right, level + 1)}

        {/* Node Circle */}
        <g
          transform={`translate(${node.x},${node.y})`}
          onClick={() => onNodeClick && onNodeClick(node)}
          className={nodeClass} // Class on group? Or circle.
        >
          <circle r="22" className={nodeClass} />
          <text dy=".35em" textAnchor="middle" className="node-text">{node.value}</text>

          {/* Height/Balance Factor Label for AVL */}
          {node.height !== undefined && (
            <text dy="-30" textAnchor="middle" fill="#9ca3af" fontSize="10">h:{node.height}</text>
          )}
        </g>
      </g>
    );
  };

  return (
    <div className="tree-view-container">
      {rootParams ? (
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="tree-svg"
        >
          {renderTree(rootParams)}
        </svg>
      ) : (
        <div className="empty-tree-message">
          <div className="tree-placeholder-icon">🌱</div>
          <div>Tree is empty. Enter data to build logic.</div>
        </div>
      )}
    </div>
  );
};

export default TreeView;
