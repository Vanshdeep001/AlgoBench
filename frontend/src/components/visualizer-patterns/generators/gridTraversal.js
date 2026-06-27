/**
 * Generator for the `gridTraversal` pattern: flood-fill / BFS-DFS over a 2D grid
 * (e.g. Number of Islands).
 *
 * Step state shape consumed by GridTraversalView:
 *   { cells:[[{label,status}]], count, finished, ans }
 *   status ∈ {water, land, visited, current}
 */
const T = 'gridTraversal';
const S = (desc, state) => ({ line: 1, desc, state });

export function numberOfIslands() {
  const grid = [
    ['1', '1', '0', '0', '0'],
    ['1', '1', '0', '0', '0'],
    ['0', '0', '1', '0', '0'],
    ['0', '0', '0', '1', '1'],
  ];
  const R = grid.length, C = grid[0].length;
  const visited = Array.from({ length: R }, () => new Array(C).fill(false));
  const snap = (cr, cc) => grid.map((row, r) => row.map((v, c) => {
    let status = 'water';
    if (v === '1') status = visited[r][c] ? 'visited' : 'land';
    if (r === cr && c === cc) status = 'current';
    return { label: v, status };
  }));

  let count = 0;
  const steps = [S('Scan every cell. Each unvisited land cell starts a new island; flood-fill its connected neighbors.', { cells: snap(-1, -1), count: 0 })];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (grid[r][c] === '1' && !visited[r][c]) {
      count++;
      visited[r][c] = true;
      const stack = [[r, c]];
      steps.push(S(`Found new land at (${r},${c}) → island #${count}. Flood-fill it.`, { cells: snap(r, c), count }));
      while (stack.length) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === '1' && !visited[nr][nc]) {
            visited[nr][nc] = true;
            stack.push([nr, nc]);
            steps.push(S(`Visit connected land at (${nr},${nc}).`, { cells: snap(nr, nc), count }));
          }
        }
      }
    }
  }
  steps.push(S(`Total islands = ${count}.`, { cells: snap(-1, -1), count, finished: true, ans: String(count) }));
  return { type: T, input: {}, steps };
}
