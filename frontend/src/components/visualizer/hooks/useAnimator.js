import { useState, useEffect, useRef, useCallback } from 'react';
import { generateArrayData } from '../utils/generateData';
import { createDelay } from '../utils/delay';

export const useAnimator = (selectedAlgorithm, inputData, target, arraySize, speed) => {
  const [data, setData] = useState([]);
  const [currentState, setCurrentState] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const generatorRef = useRef(null);
  const isAnimatingRef = useRef(false);

  // Initialize data when inputs change
  useEffect(() => {
    if (selectedAlgorithm) {
      const newData = generateArrayData(inputData, arraySize);
      setData(newData);
      setCurrentState({});
      setIsAnimating(false);
      isAnimatingRef.current = false;
      if (generatorRef.current) {
        generatorRef.current = null;
      }
    }
  }, [selectedAlgorithm, inputData, arraySize]);

  const delay = useCallback(() => {
    return createDelay(speed);
  }, [speed]);

  const startAnimation = useCallback((callbacks) => {
    if (!selectedAlgorithm || !selectedAlgorithm.algorithm) return;

    setIsAnimating(true);
    isAnimatingRef.current = true;

    const algorithmGenerator = selectedAlgorithm.algorithm(
      data.map(d => d.value),
      target,
      delay
    );

    generatorRef.current = algorithmGenerator;

    const runAnimation = async () => {
      try {
        let step = 0;
        let done = false;

        while (!done && isAnimatingRef.current) {
          const result = await algorithmGenerator.next();
          done = result.done;

          if (!done && result.value) {
            step++;
            const state = result.value;

            // Check if this is a completion state
            const isCompletionState = state.type === 'found' ||
              state.type === 'complete' ||
              state.type === 'complete-not-found';

            // Update data if array changed
            if (state.array) {
              setData(state.array.map((value, index) => ({
                value,
                index
              })));
            }

            // Update current state
            const newState = {
              ...state,
              activeIndices: state.activeIndex !== undefined ? [state.activeIndex] : state.activeIndices,
              comparingIndices: state.comparingIndices || [],
              swappedIndices: state.swappedIndices || [],
              foundIndex: state.foundIndex,
              sortedIndices: state.sortedIndices || [],
              eliminatedIndices: state.eliminatedIndices || [],
              eliminatedRange: state.eliminatedRange || null,
              left: state.left,
              right: state.right,
              mid: state.mid,
              pointer: state.activeIndex !== undefined ? state.activeIndex : state.mid,
              pointerLabel: state.pointerLabel || 'Current',
              isComplete: isCompletionState
            };

            setCurrentState(newState);

            // Call callbacks
            if (callbacks.onStepChange) callbacks.onStepChange(step);
            if (callbacks.onExplanationChange) callbacks.onExplanationChange(state.explanation || '');
            if (callbacks.onLineHighlight) callbacks.onLineHighlight(state.line || null);
            if (callbacks.onStatsChange) {
              callbacks.onStatsChange({
                comparisons: state.comparisons || 0,
                swaps: state.swaps || 0,
                timeComplexity: selectedAlgorithm.timeComplexity || 'O(1)',
                spaceComplexity: selectedAlgorithm.spaceComplexity || 'O(1)'
              });
            }
            if (callbacks.onProgressChange) {
              // Calculate progress (simplified)
              const progress = isCompletionState ? 100 : Math.min((step / (data.length * 2)) * 100, 100);
              callbacks.onProgressChange(progress);
            }

            // If this is a completion state, stop the animation AFTER displaying the state
            if (isCompletionState) {
              // Wait a bit to show the completion state before stopping
              await new Promise(resolve => setTimeout(resolve, 500));
              setIsAnimating(false);
              isAnimatingRef.current = false;
              if (callbacks.onProgressChange) callbacks.onProgressChange(100);
              break; // Exit the loop after showing completion
            }
          }

          if (done) {
            setIsAnimating(false);
            isAnimatingRef.current = false;
            if (callbacks.onProgressChange) callbacks.onProgressChange(100);
          }
        }
      } catch (error) {
        console.error('Animation error:', error);
        setIsAnimating(false);
        isAnimatingRef.current = false;
      }
    };

    animationRef.current = runAnimation();
    runAnimation();
  }, [selectedAlgorithm, data, target, delay]);

  const pauseAnimation = useCallback(() => {
    setIsAnimating(false);
    isAnimatingRef.current = false;
  }, []);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    isAnimatingRef.current = false;
    if (generatorRef.current) {
      generatorRef.current = null;
    }
    setCurrentState({});
    const newData = generateArrayData(inputData, arraySize);
    setData(newData);
  }, [inputData, arraySize]);

  const stepForward = useCallback(() => {
    // Step forward implementation
    if (generatorRef.current) {
      generatorRef.current.next();
    }
  }, []);

  return {
    data,
    currentState,
    isAnimating,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    stepForward
  };
};
