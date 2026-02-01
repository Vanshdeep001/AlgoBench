export const bfs = async function* (graphData, startNodeId = 0, delay) {
    // If graphData is array (adjacency matrix/list), convert to helpful structure
    // For now assuming graphData matches the visual structure { nodes, edges }
    // or is an adjacency list.

    // Let's assume input is the visual graph object { nodes, edges }
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    // Build adjacency list for easier traversal
    const adj = {};
    nodes.forEach(node => {
        adj[node.id] = [];
    });

    edges.forEach(edge => {
        if (adj[edge.source]) adj[edge.source].push(edge.target);
        // Assuming undirected for visualizer simplicity unless specified
        if (adj[edge.target]) adj[edge.target].push(edge.source);
    });

    const queue = [startNodeId];
    const visited = new Set();
    const visitedOrder = [];
    const distances = {};

    nodes.forEach(n => distances[n.id] = Infinity);
    distances[startNodeId] = 0;
    visited.add(startNodeId);

    let comparisons = 0; // tracking edges visited

    yield {
        type: 'init',
        explanation: `🔄 Starting Breadth-First Search (BFS) from Node ${nodes.find(n => n.id === startNodeId)?.value || startNodeId}. BFS explores neighbors layer by layer.`,
        activeNodes: [startNodeId],
        visitedNodes: [startNodeId],
        queue: [...queue],
        distances: { ...distances },
        comparisons,
        line: 1
    };
    await delay();

    while (queue.length > 0) {
        constcurrentNodeId = queue.shift();
        visitedOrder.push(currentNodeId);

        yield {
            type: 'visit',
            explanation: `Visiting Node ${nodes.find(n => n.id === currentNodeId)?.value || currentNodeId}. Checking its neighbors...`,
            activeNodes: [currentNodeId],
            visitedNodes: Array.from(visited),
            pathNodes: visitedOrder,
            queue: [...queue],
            distances: { ...distances },
            comparisons,
            currentNode: currentNodeId,
            line: 3
        };
        await delay();

        const neighbors = adj[currentNodeId] || [];
        for (const neighborId of neighbors) {
            const edgeId_fwd = `${currentNodeId}-${neighborId}`;
            const edgeId_rev = `${neighborId}-${currentNodeId}`;

            yield {
                type: 'check-neighbor',
                explanation: `Checking neighbor Node ${nodes.find(n => n.id === neighborId)?.value || neighborId}.`,
                activeNodes: [currentNodeId, neighborId],
                activeEdges: [edgeId_fwd, edgeId_rev],
                visitedNodes: Array.from(visited),
                pathNodes: visitedOrder,
                queue: [...queue],
                distances: { ...distances },
                comparisons,
                currentNode: currentNodeId,
                line: 5
            };
            await delay();

            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push(neighborId);
                distances[neighborId] = distances[currentNodeId] + 1;
                comparisons++;

                yield {
                    type: 'enqueue',
                    explanation: `Node ${nodes.find(n => n.id === neighborId)?.value || neighborId} has not been visited. Adding to queue (Distance: ${distances[neighborId]}).`,
                    activeNodes: [neighborId],
                    visitedNodes: Array.from(visited),
                    pathNodes: visitedOrder,
                    queue: [...queue],
                    distances: { ...distances },
                    comparisons,
                    line: 6
                };
                await delay();
            } else {
                comparisons++;
                yield {
                    type: 'skip',
                    explanation: `Node ${nodes.find(n => n.id === neighborId)?.value || neighborId} already visited. Skipping.`,
                    activeNodes: [neighborId],
                    visitedNodes: Array.from(visited),
                    pathNodes: visitedOrder,
                    queue: [...queue],
                    distances: { ...distances },
                    comparisons,
                    line: 7
                };
                await delay();
            }
        }
    }

    yield {
        type: 'complete',
        explanation: `✅ BFS Complete! Visited ${visited.size} nodes.`,
        visitedNodes: Array.from(visited),
        pathNodes: visitedOrder,
        distances: { ...distances },
        comparisons,
        isComplete: true,
        line: 10
    };
};
