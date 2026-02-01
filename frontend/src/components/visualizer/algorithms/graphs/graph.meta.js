import { bfs } from './bfs.logic';
import { dfs } from './dfs.logic';
import { dijkstra } from './dijkstra.logic';
import { prim } from './prim.logic';
import { kruskal } from './kruskal.logic';

export const graphAlgorithms = [
  {
    id: 'bfs',
    name: 'Breadth First Search',
    category: 'graphs',
    algorithm: bfs,
    complexity: 'O(V + E)',
    description: 'Explores a graph layer by layer, starting from a chosen node.',
    code: `function bfs(graph, start) {
  // ... (Code as before)
}`,
    visualizationType: 'graph'
  },
  {
    id: 'dfs',
    name: 'Depth First Search',
    category: 'graphs',
    algorithm: dfs,
    complexity: 'O(V + E)',
    description: 'Explores as far as possible along each branch before backtracking.',
    code: `function dfs(graph, node) {
  // ... (Code as before)
}`,
    visualizationType: 'graph'
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graphs',
    algorithm: dijkstra,
    complexity: 'O((V + E) log V)',
    description: 'Finds the shortest paths between nodes in a graph.',
    code: `function dijkstra(graph, start) {
  const dist = {};
  const pq = new PriorityQueue();
  
  // Init distances to Infinity
  for (let node in graph) dist[node] = Infinity;
  dist[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { node, cost } = pq.dequeue();
    
    if (cost > dist[node]) continue;

    for (let neighbor of graph[node]) {
      const newDist = dist[node] + neighbor.weight;
      if (newDist < dist[neighbor.node]) {
        dist[neighbor.node] = newDist;
        pq.enqueue(neighbor.node, newDist);
      }
    }
  }
}`,
    visualizationType: 'graph'
  },
  {
    id: 'prim',
    name: "Prim's Algorithm",
    category: 'graphs',
    algorithm: prim,
    complexity: 'O(E log V)',
    description: 'Builds MST by adding closest node.',
    code: `function prim(graph) {
  // Prim's logic
}`,
    visualizationType: 'graph'
  },
  {
    id: 'kruskal',
    name: "Kruskal's Algorithm",
    category: 'graphs',
    algorithm: kruskal,
    complexity: 'O(E log E)',
    description: 'Builds MST by adding smallest edges.',
    code: `function kruskal(graph) {
  // Kruskal's logic
}`,
    visualizationType: 'graph'
  }
];
