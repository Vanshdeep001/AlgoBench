/**
 * Maps a problem title (normalized to lowercase/trimmed) to the generator that
 * builds its step-by-step simulation. Each generator returns the existing
 * simulation shape `{ type, input, steps }`, where `type` is the pattern id the
 * renderer switches on, and the last step carries `state.finished`/`state.ans`.
 *
 * Adding a new problem = write a generator in the matching pattern file and add
 * one line here. Titles not present here fall back to the legacy `generic` view.
 */
import * as ash from './arrayScanHash';
import * as tp from './twoPointers';
import * as bs from './barsScalarDP';
import * as bin from './binarySearch';
import * as dm from './digitsMath';
import * as ct from './conversionTable';
import * as dg from './dpGrid';
import * as sh from './sortHeap';
import * as gt from './gridTraversal';

const GEN_BY_TITLE = {
  // arrayScanHash
  'single number': ash.singleNumber,
  'single number ii': ash.singleNumberII,
  'majority element': ash.majorityElement,
  'missing number': ash.missingNumber,
  'intersection of two arrays': ash.intersectionOfTwoArrays,
  'find the duplicate number': ash.findDuplicateNumber,
  'set mismatch': ash.setMismatch,
  'third maximum number': ash.thirdMaximumNumber,
  'contains duplicate ii': ash.containsDuplicateII,
  'merge sorted array': ash.mergeSortedArray,
  'first unique character in a string': ash.firstUniqueCharacter,
  'valid anagram': ash.validAnagram,
  'ransom note': ash.ransomNote,
  'isomorphic strings': ash.isomorphicStrings,

  // twoPointers
  'valid palindrome': tp.validPalindrome,
  'reverse string': tp.reverseString,
  'move zeroes': tp.moveZeroes,
  'squares of a sorted array': tp.squaresOfSortedArray,
  'sort colors': tp.sortColors,
  'reverse words in a string': tp.reverseWordsInString,

  // barsScalarDP
  'best time to buy and sell stock ii': bs.bestTimeToBuyAndSellStockII,
  'maximum product subarray': bs.maximumProductSubarray,
  'house robber': bs.houseRobber,
  'house robber ii': bs.houseRobberII,
  'min cost climbing stairs': bs.minCostClimbingStairs,
  'climbing stairs': bs.climbingStairs,
  'fibonacci number': bs.fibonacciNumber,
  'counting bits': bs.countingBits,

  // binarySearch
  'binary search': bin.binarySearch,
  'search insert position': bin.searchInsertPosition,
  'search in rotated sorted array': bin.searchInRotatedSortedArray,
  'sqrt(x)': bin.sqrtX,

  // digitsMath
  'reverse integer': dm.reverseInteger,
  'plus one': dm.plusOne,
  'add binary': dm.addBinary,
  'add digits': dm.addDigits,
  'happy number': dm.happyNumber,
  'power of two': dm.powerOfTwo,
  'power of three': dm.powerOfThree,
  'ugly number': dm.uglyNumber,
  'factorial trailing zeroes': dm.factorialTrailingZeroes,
  'number of 1 bits': dm.numberOf1Bits,
  'hamming distance': dm.hammingDistance,
  'fizz buzz': dm.fizzBuzz,
  'count primes': dm.countPrimes,
  'length of last word': dm.lengthOfLastWord,

  // conversionTable
  'roman to integer': ct.romanToInteger,
  'integer to roman': ct.integerToRoman,
  'excel sheet column number': ct.excelSheetColumnNumber,
  'excel sheet column title': ct.excelSheetColumnTitle,

  // dpGrid
  'unique paths': dg.uniquePaths,
  'coin change': dg.coinChange,
  'longest increasing subsequence': dg.longestIncreasingSubsequence,
  "pascal's triangle": dg.pascalsTriangle,
  "pascal's triangle ii": dg.pascalsTriangleII,

  // sortHeap
  'kth largest element in an array': sh.kthLargestElement,

  // gridTraversal
  'number of islands': gt.numberOfIslands,
};

const norm = (t) => (t || '').toLowerCase().trim();

/** Whether a pattern visualization exists for this problem title. */
export const hasPattern = (title) => !!GEN_BY_TITLE[norm(title)];

/**
 * Build a pattern simulation, or return null if the title is unmapped or the
 * generator throws (so the caller can fall back to the generic view).
 */
export function buildPatternSimulation(title, input, code) {
  const gen = GEN_BY_TITLE[norm(title)];
  if (!gen) return null;
  try {
    const sim = gen(input || {}, code);
    return sim && sim.steps && sim.steps.length ? sim : null;
  } catch (e) {
    console.error('Pattern simulation failed for', title, e);
    return null;
  }
}
