import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

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
  progress
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
    setIsPlaying(false);
    // Step will be handled by parent
  };

  return (
    <div className="control-card-new">
      <div className="control-card-content">
        {/* Input Section */}
        <div className="control-inputs">
          <div className="control-input-group">
            <label className="control-label">Array Size</label>
            <input
              type="number"
              className="control-input-new"
              min="5"
              max="20"
              value={arraySize}
              onChange={(e) => setArraySize(parseInt(e.target.value) || 10)}
              disabled={isPlaying}
            />
          </div>
          
          <div className="control-input-group">
            <label className="control-label">Input Data</label>
            <input
              type="text"
              className="control-input-new"
              placeholder="e.g., 5,3,8,1,9"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              disabled={isPlaying}
            />
          </div>
          
          {selectedAlgorithm?.category === 'searching' && (
            <div className="control-input-group">
              <label className="control-label">Target</label>
              <input
                type="text"
                className="control-input-new"
                placeholder="Search target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isPlaying}
              />
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
};

export default ControlPanel;
