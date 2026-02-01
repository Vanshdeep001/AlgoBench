import { fibonacci } from './fibonacci.logic';
import { knapsack } from './knapsack.logic';

export const dpAlgorithms = [
    {
        id: 'fibonacci',
        name: 'Fibonacci Sequence',
        category: 'dp',
        algorithm: fibonacci,
        complexity: 'O(n)',
        description: 'Calculates the nth Fibonacci number using a 1D table.',
        code: `function fib(n) {
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  return dp[n];
}`,
        visualizationType: 'dp'
    },
    {
        id: 'knapsack',
        name: '0/1 Knapsack',
        category: 'dp',
        algorithm: knapsack,
        complexity: 'O(nW)',
        description: 'maximize value within capacity.',
        code: `function knapsack(W, wt, val, n) {
  let i, w;
  let K = new Array(n + 1);
  for (i = 0; i <= n; i++) {
    K[i] = new Array(W + 1);
    for (w = 0; w <= W; w++) {
      if (i == 0 || w == 0)
        K[i][w] = 0;
      else if (wt[i - 1] <= w)
        K[i][w] = Math.max(val[i - 1] + K[i - 1][w - wt[i - 1]], K[i - 1][w]);
      else
        K[i][w] = K[i - 1][w];
    }
  }
  return K[n][W];
}`,
        visualizationType: 'dp'
    }
];
