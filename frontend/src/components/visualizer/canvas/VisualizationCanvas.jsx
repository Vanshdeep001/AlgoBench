import { useEffect, useRef } from 'react';
import ArrayView from './ArrayView';
import TreeView from './TreeView';
import GraphView from './GraphView';
import DPTableView from './DPTableView';
import { useAnimator } from '../hooks/useAnimator';

const VisualizationCanvas = ({
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
}) => {
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
  }, [selectedAlgorithm, inputData, target, arraySize]);

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
        <div className="empty-message-new">Select an algorithm to visualize</div>
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
};

export default VisualizationCanvas;
