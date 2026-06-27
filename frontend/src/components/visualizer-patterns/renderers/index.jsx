/**
 * PatternView renders the right view component for a pattern simulation. Returns
 * null for non-pattern simulation types (two-sum, generic, etc.) so the legacy
 * branches in InteractiveVisualizer stay in control of those.
 */
import {
  ArrayScanHashView, TwoPointersView, BarsScalarView, BinarySearchView,
  DigitsMathView, ConversionTableView, DPGridView, SortHeapView, GridTraversalView,
} from './views';

const VIEW_BY_TYPE = {
  arrayScanHash: ArrayScanHashView,
  twoPointers: TwoPointersView,
  barsScalarDP: BarsScalarView,
  binarySearch: BinarySearchView,
  digitsMath: DigitsMathView,
  conversionTable: ConversionTableView,
  dpGrid: DPGridView,
  sortHeap: SortHeapView,
  gridTraversal: GridTraversalView,
};

export function PatternView({ simulation, step, currentStep }) {
  if (!simulation) return null;
  const View = VIEW_BY_TYPE[simulation.type];
  if (!View) return null;
  return <View simulation={simulation} step={step} currentStep={currentStep} />;
}
