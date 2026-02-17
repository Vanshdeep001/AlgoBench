export const generateArrayData = (inputData, arraySize) => {
  if (inputData && inputData.trim()) {
    // Parse comma-separated input
    const values = inputData
      .split(',')
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v));

    if (values.length > 0) {
      return values.map((value, index) => ({
        value,
        index
      }));
    }
  }

  // Generate random array
  const data = [];
  for (let i = 0; i < arraySize; i++) {
    data.push({
      value: Math.floor(Math.random() * 100) + 1,
      index: i
    });
  }

  return data;
};

export const generateTreeData = (size) => {
  // Placeholder for tree data generation
  return [];
};

export const generateGraphData = (numNodes = 6) => {
  // Generate nodes in a circular layout for 1000x700 viewBox
  const nodes = [];
  const edges = [];
  const radius = 220; // Increased radius for larger viewBox
  const centerX = 500; // Center X for 1000 width
  const centerY = 350; // Center Y for 700 height

  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2; // Start from top
    nodes.push({
      id: i,
      value: labels[i] || i.toString(),
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }

  // Generate edges - create a connected graph
  // Connect each node to 2-3 neighbors for interesting traversal
  const edgeSet = new Set();

  for (let i = 0; i < numNodes; i++) {
    // Connect to next node (circular)
    const next = (i + 1) % numNodes;
    const edgeKey = `${Math.min(i, next)}-${Math.max(i, next)}`;
    if (!edgeSet.has(edgeKey)) {
      edges.push({ source: i, target: next });
      edgeSet.add(edgeKey);
    }

    // Connect to node 2 positions away for some variety
    if (numNodes > 3) {
      const skip = (i + 2) % numNodes;
      const edgeKey2 = `${Math.min(i, skip)}-${Math.max(i, skip)}`;
      if (!edgeSet.has(edgeKey2) && Math.random() > 0.3) {
        edges.push({ source: i, target: skip });
        edgeSet.add(edgeKey2);
      }
    }
  }

  return { nodes, edges };
};

