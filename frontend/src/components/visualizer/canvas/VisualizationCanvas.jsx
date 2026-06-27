import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ArrayView from './ArrayView';
import TreeView from './TreeView';
import GraphView from './GraphView';
import DPTableView from './DPTableView';
import BacktrackingView from './BacktrackingView';
import MathView from './MathView';
import { useAnimator } from '../hooks/useAnimator';

const VisualizationCanvas = forwardRef((
  {
    selectedAlgorithm,
    inputData,
    target,
    arraySize,
    isPlaying,
    speed,
    onStepChange,
    onStatsChange,
    onExplanationChange,
    onLineHighlight,
    onProgressChange
  },
  ref
) => {
  const canvasRef = useRef(null);
  const {
    data,
    currentState,
    isAnimating,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    stepForward
  } = useAnimator(selectedAlgorithm, inputData, target, arraySize, speed);

  // Expose reset and stepForward to parent via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      pauseAnimation();
      resetAnimation();
    },
    stepForward: () => {
      stepForward();
    }
  }));

  useEffect(() => {
    if (isPlaying && !isAnimating) {
      // Don't restart if already completed
      if (currentState.isComplete) {
        // Dispatch stop event just in case
        const stopEvent = new CustomEvent('stopPlayback');
        window.dispatchEvent(stopEvent);
        return;
      }

      startAnimation({
        onStepChange,
        onStatsChange,
        onExplanationChange,
        onLineHighlight,
        onProgressChange
      });
    } else if (!isPlaying && isAnimating) {
      pauseAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isAnimating, currentState.isComplete]);

  useEffect(() => {
    resetAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithm, inputData, arraySize]);

  // CRITICAL FIX: Stop playing when animation completes
  useEffect(() => {
    if (currentState.isComplete && isPlaying) {
      // Dispatch event to parent to stop playback
      const stopEvent = new CustomEvent('stopPlayback');
      window.dispatchEvent(stopEvent);
    }
  }, [currentState.isComplete, isPlaying]);

  if (!selectedAlgorithm) {
    return (
      <div className="array-view-new empty">
        <div className="empty-message-new">
          <svg className="inline-loader-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5" />
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 14.7614 3.11929 17.2614 4.92893 19.0711" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Select an algorithm to begin visualization.
        </div>
      </div>
    );
  }

  const renderVisualization = () => {
    switch (selectedAlgorithm.visualizationType) {
      case 'array':
        return (
          <ArrayView
            data={data}
            currentState={currentState}
            target={target}
            onElementClick={(index) => {
              // Handle element click for explanation
              const element = data[index];
              onExplanationChange(`Element at index ${index}: ${element.value}. ${currentState.explanation || ''}`);
            }}
          />
        );
      case 'tree':
        return (
          <TreeView
            data={data}
            currentState={currentState}
            onNodeClick={(node) => {
              onExplanationChange(`Node: ${node.value}. ${currentState.explanation || ''}`);
            }}
          />
        );
      case 'graph':
        return (
          <GraphView
            data={data}
            currentState={currentState}
            onNodeClick={(node) => {
              onExplanationChange(`Node: ${node.value}. ${currentState.explanation || ''}`);
            }}
          />
        );
      case 'dp':
        return (
          <DPTableView
            data={data}
            currentState={currentState}
            onElementClick={(cell) => {
              onExplanationChange(`Cell [${cell.r || cell.i}]: ${cell.val}. ${currentState.explanation || ''}`);
            }}
          />
        );
      case 'backtracking':
        return (
          <BacktrackingView
            data={data}
            currentState={currentState}
          />
        );
      case 'math':
        return (
          <MathView
            data={data}
            currentState={currentState}
          />
        );
      default:
        return (
          <ArrayView
            data={data}
            currentState={currentState}
            target={target}
            onElementClick={(index) => {
              const element = data[index];
              onExplanationChange(`Element at index ${index}: ${element.value}. ${currentState.explanation || ''}`);
            }}
          />
        );
    }
  };

  return (
    <div className="visualization-canvas-new" ref={canvasRef}>
      {renderVisualization()}
    </div>
  );
})

export default VisualizationCanvas;
