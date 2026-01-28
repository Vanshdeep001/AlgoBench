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

export const generateGraphData = (nodes, edges) => {
  // Placeholder for graph data generation
  return { nodes: [], edges: [] };
};
