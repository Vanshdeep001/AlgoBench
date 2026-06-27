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
  setSidebarCollapsed,
  onReset,
  onStep
}) => {
  const handlePlayPause = () => {
    if (!selectedAlgorithm) return;
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (onReset) onReset();
  };

  const handleStep = () => {
    if (!selectedAlgorithm) return;
    if (onStep) onStep();
  };

  const hasInputs = !isPlaying && selectedAlgorithm && ['array', 'graph', 'tree', 'dp', 'backtracking', 'math'].includes(selectedAlgorithm.visualizationType);

  return (
    <div className="control-card-new">
      <div className="control-card-content">

        {/* Algorithm Identity */}
        <div className="control-identity">
          {selectedAlgorithm ? (
            <>
              <span className="control-identity-name">{selectedAlgorithm.name}</span>
              <span className="control-identity-meta">
                <span className="control-identity-badge">{selectedAlgorithm.visualizationType}</span>
                {selectedAlgorithm.complexity && (
                  <span className="control-identity-complexity">{selectedAlgorithm.complexity}</span>
                )}
              </span>
            </>
          ) : (
            <span className="control-identity-name dim">Playground</span>
          )}
        </div>

        {hasInputs && <div className="control-divider" />}

        {/* Array Size Input - Only for array algorithms */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'array' && (
          <div className="control-inputs">
            <div className="control-input-inline">
              <label className="control-label-inline">Array Size :</label>
              <input
                type="number"
                className="control-input-new"
                style={{ width: '60px' }}
                min="5"
                max="100"
                value={arraySize}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 2 && val <= 100) {
                     setArraySize(val);
                  } else if (e.target.value === '') {
                     setArraySize('');
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 2) setArraySize(5);
                  if (val > 100) setArraySize(100);
                }}
                disabled={isPlaying}
              />
            </div>

            {selectedAlgorithm?.name?.toLowerCase().includes('search') && (
              <>
                <div className="control-input-divider" />
                <div className="control-input-inline">
                  <label className="control-label-inline">Target :</label>
                  <input
                    type="number"
                    className="control-input-new"
                    style={{ width: '70px' }}
                    placeholder="e.g., 42"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={isPlaying}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Graph-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'graph' && (
          <div className="control-inputs">
            <div className="control-input-inline">
              <label className="control-label-inline">Start Node :</label>
              <input
                type="text"
                className="control-input-new"
                style={{ width: '80px' }}
                placeholder="e.g., A"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                disabled={isPlaying}
              />
            </div>

            {selectedAlgorithm?.name?.toLowerCase().includes('dijkstra') && (
              <>
                <div className="control-input-divider" />
                <div className="control-input-inline">
                  <label className="control-label-inline">End Node :</label>
                  <input
                    type="text"
                    className="control-input-new"
                    style={{ width: '80px' }}
                    placeholder="e.g., F"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={isPlaying}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Tree-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'tree' && (
          <div className="control-inputs">
            <div className="control-input-inline">
              <label className="control-label-inline">Values :</label>
              <input
                type="text"
                className="control-input-new"
                style={{ width: '160px' }}
                placeholder="e.g., 50,30,70"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                disabled={isPlaying}
              />
            </div>

            {(selectedAlgorithm?.name?.toLowerCase().includes('search') ||
              selectedAlgorithm?.name?.toLowerCase().includes('delete')) && (
                <>
                  <div className="control-input-divider" />
                  <div className="control-input-inline">
                    <label className="control-label-inline">Target :</label>
                    <input
                      type="text"
                      className="control-input-new"
                      style={{ width: '60px' }}
                      placeholder="e.g., 30"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      disabled={isPlaying}
                    />
                  </div>
                </>
              )}
          </div>
        )}

        {/* DP-specific inputs */}
        {!isPlaying && selectedAlgorithm?.visualizationType === 'dp' && (
          <div className="control-inputs">
            {selectedAlgorithm?.id === 'fibonacci' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Value :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '100px' }}
                  placeholder="e.g., 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'knapsack' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Items & Capacity :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '260px' }}
                  placeholder="weights: 2,3; capacity: 5"
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
              <div className="control-input-inline">
                <label className="control-label-inline">Grid Size :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '80px' }}
                  placeholder="e.g., 8"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'subsetsum' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Values & Target :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '220px' }}
                  placeholder="array: 3,5,2; target: 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'ratmaze' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Maze Size :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '100px' }}
                  placeholder="e.g., 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'sudoku' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Board State :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '200px' }}
                  placeholder="difficulty: hard"
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
              <div className="control-input-inline">
                <label className="control-label-inline">Value :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '80px' }}
                  placeholder="e.g., 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'gcd' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Numbers :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '120px' }}
                  placeholder="a: 48; b: 18"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'sieve' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Limit :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '80px' }}
                  placeholder="e.g., 50"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}

            {selectedAlgorithm?.id === 'exponentiation' && (
              <div className="control-input-inline">
                <label className="control-label-inline">Base & Exponent :</label>
                <input
                  type="text"
                  className="control-input-new"
                  style={{ width: '180px' }}
                  placeholder="base: 2; exponent: 10"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  disabled={isPlaying}
                />
              </div>
            )}
          </div>
        )}

        {/* Right cluster: speed + transport */}
        <div className="control-right">
          {/* Speed Control */}
          <div className="control-speed">
            <span className="control-speed-label">Speed</span>
            <input
              type="range"
              className="speed-slider-new"
              min="10"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              style={{
                background: `linear-gradient(90deg, #F4D03F 0%, #D4AF37 ${((speed - 10) / 90) * 100}%, rgba(255,255,255,0.08) ${((speed - 10) / 90) * 100}%)`,
              }}
            />
            <span className="speed-value-new">{speed}%</span>
          </div>

          <div className="control-divider" />

          {/* Playback Controls */}
          <div className="control-buttons">
            <button
              className="control-btn-new secondary"
              onClick={handleReset}
              disabled={!selectedAlgorithm}
              title="Reset"
            >
              <RotateCcw size={15} />
            </button>
            <button
              className="control-btn-new secondary"
              onClick={handleStep}
              disabled={!selectedAlgorithm || isPlaying}
              title="Step Forward"
            >
              <StepForward size={15} />
            </button>
            <button
              className="control-btn-new primary"
              onClick={handlePlayPause}
              disabled={!selectedAlgorithm}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
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
