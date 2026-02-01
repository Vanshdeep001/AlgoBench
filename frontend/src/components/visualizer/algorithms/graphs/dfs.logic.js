export const dfs = async function* (graphData, startNodeId = 0, delay) {
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    // Build adjacency list
    const adj = {};
    nodes.forEach(node => {
        adj[node.id] = [];
    });

    edges.forEach(edge => {
        if (adj[edge.source]) adj[edge.source].push(edge.target);
        if (adj[edge.target]) adj[edge.target].push(edge.source);
    });

    const visited = new Set();
    const visitedOrder = [];
    const stack = []; // For visualization purposes to show 'current path'
    let comparisons = 0;

    // Helper recursive DFS function
    const dfsRecursive = async function* (currentNodeId) {
        visited.add(currentNodeId);
        visitedOrder.push(currentNodeId);
        stack.push(currentNodeId); // Add to recursion stack path

        yield {
            type: 'visit',
            explanation: `Visiting Node ${nodes.find(n => n.id === currentNodeId)?.value || currentNodeId}.`,
            activeNodes: [currentNodeId],
            visitedNodes: Array.from(visited),
            pathNodes: [...stack], // Highlighting current recursion stack as path
            comparisons,
            currentNode: currentNodeId,
            line: 3
        };
        await delay();

        const neighbors = adj[currentNodeId] || [];
        for (const neighborId of neighbors) {
            comparisons++;

            yield {
                type: 'check-neighbor',
                explanation: `Checking neighbor Node ${nodes.find(n => n.id === neighborId)?.value || neighborId}.`,
                activeNodes: [currentNodeId, neighborId],
                activeEdges: [`${currentNodeId}-${neighborId}`, `${neighborId}-${currentNodeId}`],
                visitedNodes: Array.from(visited),
                pathNodes: [...stack],
                comparisons,
                currentNode: currentNodeId,
                line: 5
            };
            await delay();

            if (!visited.has(neighborId)) {
                yield {
                    type: 'recurse',
                    explanation: `Node ${neighborId} not visited. Recursively calling DFS on it.`,
                    activeNodes: [neighborId],
                    visitedNodes: Array.from(visited),
                    pathNodes: [...stack, neighborId],
                    comparisons,
                    line: 6
                };
                await delay();

                yield* dfsRecursive(neighborId);

                // Backtracking step visualization
                yield {
                    type: 'backtrack',
                    explanation: `Backtracking to Node ${nodes.find(n => n.id === currentNodeId)?.value || currentNodeId}.`,
                    activeNodes: [currentNodeId],
                    visitedNodes: Array.from(visited),
                    pathNodes: [...stack],
                    comparisons,
                    currentNode: currentNodeId,
                    line: 8
                };
                await delay();
            }
        }

        stack.pop(); // Remove from recursion stack path
    };

    yield {
        type: 'init',
        explanation: `🔄 Starting Depth-First Search (DFS) from Node ${nodes.find(n => n.id === startNodeId)?.value || startNodeId}. DFS goes as deep as possible before backtracking.`,
        activeNodes: [startNodeId],
        visitedNodes: [],
        comparisons,
        line: 1
    };
    await delay();

    yield* dfsRecursive(startNodeId);

    yield {
        type: 'complete',
        explanation: `✅ DFS Complete! Visited ${visited.size} nodes.`,
        visitedNodes: Array.from(visited),
        pathNodes: visitedOrder, // Show full traversal order at end? Or just visited set.
        comparisons,
        isComplete: true,
        line: 10
    };
};
