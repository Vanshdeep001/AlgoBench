import { Play, Pause, StepForward, RotateCcw, ChevronRight } from 'lucide-react';

const ControlPanel = ({
  selectedAlgorithm,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  inputData,
  setInputData,
  target,
  setTarget,
  arraySize,
  setArraySize,
  progress,
  sidebarCollapsed,
  setSidebarCollapsed
}) => {
  const handlePlayPause = () => {
    if (!selectedAlgorithm) return;
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    // Reset will be handled by parent
  };

  const handleStep = () => {
    if (!selectedAlgorithm) return;
    // Step logic handled by parent
  };

  return (
    <div className="control-card-new">
      <div className="control-card-content">
        {/* Sidebar Toggle Button - Only show when collapsed */}
        {sidebarCollapsed && (
          <button
            className="sidebar-toggle-in-panel"
            onClick={() => setSidebarCollapsed(false)}
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Array Size Input - Only for array algorithms */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'array' && (
          <div className="control-inputs">
            <div className="control-input-group">
              <label className="control-label">Array Size</label>
              <input
                type="number"
                className="control-input-new"
                min="5"
                max="50"
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value) || 10)}
                disabled={isPlaying}
              />
            </div>

            {selectedAlgorithm?.name?.toLowerCase().includes('search') && (
              <div className="control-input-group">
                <label className="control-label">Target</label>
                <input
                  type="number"
                  className="control-input-new"
                  placeholder="e.g., 42"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}
          </div>
        )}

        {/* Graph-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'graph' && (
          <div className="control-inputs">
            <div className="control-input-group">
              <label className="control-label">Start Node</label>
              <input
                type="text"
                className="control-input-new"
                placeholder="e.g., A or 0"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                disabled={isPlaying}
              />
            </div>

            {selectedAlgorithm?.name?.toLowerCase().includes('dijkstra') && (
              <div className="control-input-group">
                <label className="control-label">End Node</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="e.g., F or 5"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}
          </div>
        )}

        {/* Tree-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'tree' && (
          <div className="control-inputs">
            <div className="control-input-group">
              <label className="control-label">Values to Insert</label>
              <input
                type="text"
                className="control-input-new"
                placeholder="e.g., 50,30,70,20,40"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                disabled={isPlaying}
              />
            </div>

            {(selectedAlgorithm?.name?.toLowerCase().includes('search') ||
              selectedAlgorithm?.name?.toLowerCase().includes('delete')) && (
                <div className="control-input-group">
                  <label className="control-label">Target Value</label>
                  <input
                    type="text"
                    className="control-input-new"
                    placeholder="e.g., 30"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={isPlaying}
                  />
                </div>
              )}
          </div>
        )}

        {/* DP-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'dp' && (
          <div className="control-inputs">
            {selectedAlgorithm?.id === 'fibonacci' && (
              <div className="control-input-group">
                <label className="control-label">N Value</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="e.g., 10 or n: 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'knapsack' && (
              <div className="control-input-group">
                <label className="control-label">Knapsack Input</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="weights: 2,3,4; values: 3,4,5; capacity: 5"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}
          </div>
        )}

        {/* Backtracking-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'backtracking' && (
          <div className="control-inputs">
            {selectedAlgorithm?.id === 'nqueens' && (
              <div className="control-input-group">
                <label className="control-label">Board Size (N)</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="e.g., 8 or n: 8"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'subsetsum' && (
              <div className="control-input-group">
                <label className="control-label">Subset Sum Input</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="array: 3,5,2,7; target: 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'ratmaze' && (
              <div className="control-input-group">
                <label className="control-label">Maze Construction</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="n: 10 or custom maze"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'sudoku' && (
              <div className="control-input-group">
                <label className="control-label">Sudoku Board</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="difficulty: hard or custom board"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}
          </div>
        )}

        {/* Math-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'math' && (
          <div className="control-inputs">
            {selectedAlgorithm?.id === 'factorial' && (
              <div className="control-input-group">
                <label className="control-label">N Value</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="e.g., 10 or n: 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'gcd' && (
              <div className="control-input-group">
                <label className="control-label">GCD Input</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="a: 48; b: 18"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'sieve' && (
              <div className="control-input-group">
                <label className="control-label">Limit (N)</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="e.g., 50 or n: 50"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'exponentiation' && (
              <div className="control-input-group">
                <label className="control-label">Exponentiation Input</label>
                <input
                  type="text"
                  className="control-input-new"
                  placeholder="base: 2; exponent: 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}
          </div>
        )}

        {/* Speed Control */}
        <div className="control-speed">
          <label className="control-label">Speed</label>
          <div className="speed-control-new">
            <input
              type="range"
              className="speed-slider-new"
              min="10"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
            />
            <span className="speed-value-new">{speed}%</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="control-buttons">
          <button
            className="control-btn-new secondary"
            onClick={handleReset}
            disabled={!selectedAlgorithm}
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
          <button
            className="control-btn-new secondary"
            onClick={handleStep}
            disabled={!selectedAlgorithm || isPlaying}
            title="Step Forward"
          >
            <StepForward size={18} />
          </button>
          <button
            className="control-btn-new primary"
            onClick={handlePlayPause}
            disabled={!selectedAlgorithm}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-container-new">
          <div
            className="progress-bar-new"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
