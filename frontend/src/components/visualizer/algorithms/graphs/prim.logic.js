export const prim = async function* (graphData, startNodeId = 0, delay) {
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

    const mstSet = new Set();
    const pq = [{ id: startNodeId, weight: 0, parent: -1 }]; // Priority Queue: {id, weight, parent}
    const key = {}; // Min weight to connect to MST
    const parent = {}; // MST structure

    nodes.forEach(n => key[n.id] = Infinity);
    key[startNodeId] = 0;

    const mstEdges = [];
    let comparisons = 0;
    let totalMSTWeight = 0;

    yield {
        type: 'init',
        explanation: `🔄 Starting Prim's Algorithm from Node ${startNodeId}. Growing Minimum Spanning Tree (MST) one node at a time.`,
        activeNodes: [startNodeId],
        visitedNodes: [], // In MST context, visited usually means 'in MST'
        comparisons,
        line: 1
    };
    await delay();

    while (pq.length > 0) {
        // Extract min
        pq.sort((a, b) => a.weight - b.weight);
        const { id: u, weight: w, parent: p } = pq.shift();

        if (mstSet.has(u)) continue;

        mstSet.add(u);
        totalMSTWeight += w;

        if (p !== -1) {
            mstEdges.push(`${Math.min(p, u)}-${Math.max(p, u)}`);
            // Also add reverse for visual consistency if needed, but our CSS handles ID matching usually
            mstEdges.push(`${p}-${u}`);
            mstEdges.push(`${u}-${p}`);
        }

        yield {
            type: 'visit',
            explanation: `Adding Node ${u} to MST (Cost: ${w}). Total MST Weight: ${totalMSTWeight}.`,
            activeNodes: [u],
            visitedNodes: Array.from(mstSet),
            pathEdges: [...mstEdges], // Highlight MST edges
            comparisons,
            currentNode: u,
            line: 3
        };
        await delay();

        const neighbors = adj[u] || [];
        for (const neighbor of neighbors) {
            const v = neighbor.target;
            const weight = neighbor.weight;

            if (!mstSet.has(v)) {
                comparisons++;
                yield {
                    type: 'check-neighbor',
                    explanation: `Checking neighbor Node ${v} (Weight: ${weight}). Current best key: ${key[v] === Infinity ? '∞' : key[v]}.`,
                    activeNodes: [u, v],
                    activeEdges: [`${u}-${v}`, `${v}-${u}`],
                    visitedNodes: Array.from(mstSet),
                    pathEdges: [...mstEdges],
                    comparisons,
                    currentNode: u,
                    line: 5
                };
                await delay();

                if (weight < key[v]) {
                    key[v] = weight;
                    parent[v] = u;
                    pq.push({ id: v, weight: weight, parent: u });

                    yield {
                        type: 'update',
                        explanation: `Found cheaper way to connect Node ${v}! Updating key to ${weight}.`,
                        activeNodes: [v],
                        visitedNodes: Array.from(mstSet),
                        pathEdges: [...mstEdges],
                        comparisons,
                        line: 7
                    };
                    await delay();
                }
            }
        }
    }

    yield {
        type: 'complete',
        explanation: `✅ Prim's Complete! MST formed with Total Weight: ${totalMSTWeight}.`,
        visitedNodes: Array.from(mstSet),
        pathEdges: [...mstEdges],
        comparisons,
        isComplete: true,
        line: 10
    };
};
