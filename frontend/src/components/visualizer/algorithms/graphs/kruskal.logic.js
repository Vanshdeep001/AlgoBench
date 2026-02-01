export const kruskal = async function* (graphData, startNodeId, delay) {
    const nodes = graphData.nodes;
    const edges = [...graphData.edges]; // Copy edges
    // Sort edges by weight
    edges.sort((a, b) => (a.weight || 1) - (b.weight || 1));

    const parent = {};
    nodes.forEach(n => parent[n.id] = n.id);

    function find(i) {
        if (parent[i] === i) return i;
        return find(parent[i]);
    }

    function union(i, j) {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) {
            parent[rootI] = rootJ;
            return true;
        }
        return false;
    }

    const mstEdges = [];
    let comparisons = 0;
    let totalMSTWeight = 0;
    let edgesCount = 0;
    const visitedNodes = new Set(); // For coloring nodes in MST

    yield {
        type: 'init',
        explanation: `🔄 Starting Kruskal's Algorithm. Sorted all ${edges.length} edges by weight. Will pick smallest edge if it doesn't form a cycle.`,
        visitedNodes: [],
        comparisons,
        line: 1
    };
    await delay();

    for (const edge of edges) {
        const u = edge.source;
        const v = edge.target;
        const w = edge.weight || 1;

        comparisons++;

        yield {
            type: 'check-edge',
            explanation: `Checking edge ${u}-${v} (Weight: ${w}). Do ${u} and ${v} belong to different sets?`,
            activeNodes: [u, v],
            activeEdges: [`${u}-${v}`], // Highlight checking edge
            pathEdges: [...mstEdges],  // Keep MST edges detailed
            visitedNodes: Array.from(visitedNodes),
            comparisons,
            line: 3
        };
        await delay();

        const rootU = find(u);
        const rootV = find(v);

        if (rootU !== rootV) {
            union(u, v);
            mstEdges.push(`${u}-${v}`);
            mstEdges.push(`${v}-${u}`);
            totalMSTWeight += w;
            visitedNodes.add(u);
            visitedNodes.add(v);
            edgesCount++;

            yield {
                type: 'add-edge',
                explanation: `Yes! Adding edge ${u}-${v} to MST. Total Weight: ${totalMSTWeight}.`,
                activeNodes: [u, v],
                pathEdges: [...mstEdges],
                visitedNodes: Array.from(visitedNodes),
                comparisons,
                line: 5
            };
            await delay();
        } else {
            yield {
                type: 'skip-edge',
                explanation: `No. ${u} and ${v} are already connected. Adding this edge would form a cycle. Skipping.`,
                activeNodes: [u, v],
                pathEdges: [...mstEdges],
                visitedNodes: Array.from(visitedNodes),
                comparisons,
                line: 6
            };
            await delay();
        }
    }

    yield {
        type: 'complete',
        explanation: `✅ Kruskal's Complete! MST formed with Total Weight: ${totalMSTWeight}.`,
        visitedNodes: Array.from(visitedNodes),
        pathEdges: [...mstEdges],
        comparisons,
        isComplete: true,
        line: 10
    };
};
