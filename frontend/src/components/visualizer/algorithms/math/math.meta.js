
import { euclideanGCD } from './gcd.logic';
import { fastExponentiation } from './exponentiation.logic';
import { factorialMemo } from './factorial.logic';

export const mathAlgorithms = [

  {
    id: 'gcd',
    name: 'GCD & LCM (Euclidean)',
    category: 'math',
    algorithm: euclideanGCD,
    complexity: 'O(log min(a,b))',
    description: 'Find Greatest Common Divisor and Least Common Multiple using Euclidean algorithm.',
    code: `function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}`,
    visualizationType: 'math'
  },
  {
    id: 'exponentiation',
    name: 'Fast Exponentiation',
    category: 'math',
    algorithm: fastExponentiation,
    complexity: 'O(log n)',
    description: 'Compute base^exponent efficiently using binary method.',
    code: `function power(base, exp) {
  let result = 1;
  let b = base;
  
  while (exp > 0) {
    if (exp % 2 === 1) {
      result *= b;
    }
    b *= b;
    exp = Math.floor(exp / 2);
  }
  return result;
}`,
    visualizationType: 'math'
  },
  {
    id: 'factorial',
    name: 'Factorial (Memoized)',
    category: 'math',
    algorithm: factorialMemo,
    complexity: 'O(n)',
    description: 'Calculate factorial with memoization for optimization.',
    code: `const memo = {};
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  if (memo[n]) return memo[n];
  
  memo[n] = n * factorial(n - 1);
  return memo[n];
}`,
    visualizationType: 'math'
  }
];
