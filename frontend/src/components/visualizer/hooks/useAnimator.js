import { useState, useEffect, useRef, useCallback } from 'react';
import { generateArrayData, generateGraphData } from '../utils/generateData';
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
      let newData;

      // Generate appropriate data based on visualization type
      if (selectedAlgorithm.visualizationType === 'graph') {
        newData = generateGraphData(arraySize || 6);
      } else if (selectedAlgorithm.visualizationType === 'tree') {
        // For now, trees will use array data until we implement tree generation
        newData = generateArrayData(inputData, arraySize);
      } else if (selectedAlgorithm.visualizationType === 'backtracking' || selectedAlgorithm.visualizationType === 'math') {
        // Backtracking and math use array data for input
        newData = generateArrayData(inputData, arraySize);
      } else {
        // Default: array data for sorting, searching, dp
        newData = generateArrayData(inputData, arraySize);
      }

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

    // Prepare data for algorithm based on type
    let algorithmInput;
    let param2, param3;

    if (selectedAlgorithm.visualizationType === 'graph') {
      algorithmInput = data; // Pass graph object directly
      // For graph algorithms: inputData = start node, target = end node
      // Parse start node (could be letter like 'A' or number like '0')
      const startInput = inputData?.trim() || '0';
      const startNode = data.nodes?.find(n =>
        n.value?.toString() === startInput || n.id?.toString() === startInput
      );
      param2 = startNode ? startNode.id : 0; // startNodeId

      // Parse end node for Dijkstra
      if (target && selectedAlgorithm.name?.toLowerCase().includes('dijkstra')) {
        const endInput = target.trim();
        const endNode = data.nodes?.find(n =>
          n.value?.toString() === endInput || n.id?.toString() === endInput
        );
        param3 = endNode ? endNode.id : undefined; // endNodeId
      }
    } else {
      algorithmInput = data.map ? data.map(d => d.value) : data; // Pass array of values
      param2 = target; // For array algorithms, second param is target
    }

    const algorithmGenerator = selectedAlgorithm.algorithm(
      algorithmInput,
      param2,
      param3 || delay,
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

    // Generate appropriate data based on visualization type
    let newData;
    if (selectedAlgorithm?.visualizationType === 'graph') {
      newData = generateGraphData(arraySize || 6);
    } else {
      newData = generateArrayData(inputData, arraySize);
    }
    setData(newData);
  }, [selectedAlgorithm, inputData, arraySize]);

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
