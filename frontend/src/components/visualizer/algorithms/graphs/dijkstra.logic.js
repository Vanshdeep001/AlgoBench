export const dijkstra = async function* (graphData, startNodeId = 0, delay) {
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    // Build adjacency list with weights
    const adj = {};
    nodes.forEach(node => {
        adj[node.id] = [];
    });

    edges.forEach(edge => {
        const w = edge.weight !== undefined ? edge.weight : 1;
        if (adj[edge.source]) adj[edge.source].push({ target: edge.target, weight: w });
        if (adj[edge.target]) adj[edge.target].push({ target: edge.source, weight: w });
    });

    const distances = {};
    const prev = {};
    nodes.forEach(n => distances[n.id] = Infinity);
    distances[startNodeId] = 0;

    const pq = [{ id: startNodeId, dist: 0 }]; // Simple array as priority queue
    const visited = new Set();
    const visitedOrder = [];

    let comparisons = 0;

    yield {
        type: 'init',
        explanation: `🔄 Starting Dijkstra's Algorithm from Node ${startNodeId}. Finding shortest paths using edge weights. Initial distances: start=0, others=∞.`,
        activeNodes: [startNodeId],
        distances: { ...distances },
        comparisons,
        line: 1
    };
    await delay();

    while (pq.length > 0) {
        // Sort to simulate priority queue (extract min)
        pq.sort((a, b) => a.dist - b.dist);
        const { id: u, dist: d } = pq.shift(); // Remove min

        // Visualization: Current node processing
        yield {
            type: 'visit',
            explanation: `Picking Node ${u} with smallest distance ${d}. Marking as visited.`,
            activeNodes: [u],
            visitedNodes: Array.from(visited),
            distances: { ...distances },
            comparisons,
            currentNode: u,
            line: 3
        };
        await delay();

        if (d > distances[u]) continue; // Skip stale entries

        visited.add(u);
        visitedOrder.push(u);

        const neighbors = adj[u] || [];
        for (const neighbor of neighbors) {
            const v = neighbor.target;
            const weight = neighbor.weight;

            yield {
                type: 'check-neighbor',
                explanation: `Checking neighbor Node ${v} (Weight: ${weight}). Current dist to ${v} is ${distances[v] === Infinity ? '∞' : distances[v]}.`,
                activeNodes: [u, v],
                activeEdges: [`${u}-${v}`, `${v}-${u}`],
                visitedNodes: Array.from(visited),
                distances: { ...distances },
                comparisons,
                currentNode: u,
                line: 5
            };
            await delay();

            const newDist = distances[u] + weight;
            comparisons++; // comparison check can count as op

            if (newDist < distances[v]) {
                distances[v] = newDist;
                prev[v] = u;
                pq.push({ id: v, dist: newDist });

                yield {
                    type: 'update',
                    explanation: `Found shorter path to Node ${v}! New distance: ${distances[u]} + ${weight} = ${newDist}. Updating.`,
                    activeNodes: [v],
                    visitedNodes: Array.from(visited),
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
        explanation: `✅ Dijkstra Complete! Shortest paths calculated.`,
        visitedNodes: Array.from(visited),
        distances: { ...distances },
        comparisons,
        isComplete: true,
        line: 10
    };
};
