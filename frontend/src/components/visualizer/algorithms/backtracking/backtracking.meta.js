import { nQueens } from './nqueens.logic';
import { sudokuSolver } from './sudoku.logic';
import { ratInMaze } from './ratmaze.logic';
import { subsetSum } from './subsetsum.logic';

export const backtrackingAlgorithms = [
    {
        id: 'nqueens',
        name: 'N-Queens Problem',
        category: 'backtracking',
        algorithm: nQueens,
        complexity: 'O(N!)',
        description: 'Place N queens on an N×N chessboard so that no two queens attack each other.',
        code: `function solveNQueens(col) {
  if (col >= n) return true;
  
  for (let row = 0; row < n; row++) {
    if (isSafe(row, col)) {
      board[row][col] = 1;
      if (solveNQueens(col + 1)) return true;
      board[row][col] = 0; // Backtrack
    }
  }
  return false;
}`,
        visualizationType: 'backtracking'
    },
    {
        id: 'sudoku',
        name: 'Sudoku Solver',
        category: 'backtracking',
        algorithm: sudokuSolver,
        complexity: 'O(9^(n*n))',
        description: 'Solve a 9×9 Sudoku puzzle using backtracking.',
        code: `function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0; // Backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
}`,
        visualizationType: 'backtracking'
    },
    {
        id: 'ratmaze',
        name: 'Rat in a Maze',
        category: 'backtracking',
        algorithm: ratInMaze,
        complexity: 'O(2^(n^2))',
        description: 'Find a path from top-left to bottom-right in a maze.',
        code: `function solveMaze(x, y) {
  if (x === n-1 && y === n-1) {
    solution[x][y] = 1;
    return true;
  }
  
  if (isSafe(x, y)) {
    solution[x][y] = 1;
    if (solveMaze(x, y+1)) return true; // Right
    if (solveMaze(x+1, y)) return true; // Down
    solution[x][y] = 0; // Backtrack
  }
  return false;
}`,
        visualizationType: 'backtracking'
    },
    {
        id: 'subsetsum',
        name: 'Subset Sum',
        category: 'backtracking',
        algorithm: subsetSum,
        complexity: 'O(2^n)',
        description: 'Find a subset of numbers that sum to a target value.',
        code: `function findSubset(index, sum, subset) {
  if (sum === target) return true;
  if (index >= n || sum > target) return false;
  
  // Include current element
  subset.push(arr[index]);
  if (findSubset(index+1, sum+arr[index], subset)) 
    return true;
  
  // Backtrack - exclude element
  subset.pop();
  return findSubset(index+1, sum, subset);
}`,
        visualizationType: 'backtracking'
    }
];
