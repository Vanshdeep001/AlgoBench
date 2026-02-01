import { useState } from 'react';
import ControlPanel from './ControlPanel';
import CodePanel from './CodePanel';
import VisualizationCanvas from '../canvas/VisualizationCanvas';
import '../styles/visualizer.css';
import '../styles/graphs.css';
import '../styles/trees.css';
import '../styles/dp.css';
import { ChevronDown, ChevronRight, Code2, Clock } from 'lucide-react';

const VisualizerLayout = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedAlgorithm,
  onAlgorithmSelect,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  inputData,
  setInputData,
  target,
  setTarget,
  arraySize,
  setArraySize
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stats, setStats] = useState({
    comparisons: 0,
    swaps: 0,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)'
  });
  const [explanation, setExplanation] = useState('Select an algorithm to begin visualization.');
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [progress, setProgress] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [codeVisible, setCodeVisible] = useState(false);
  const [complexityVisible, setComplexityVisible] = useState(false);

  const currentCategory = categories[selectedCategory];

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  return (
    <div className="visualizer-container-new">
      {/* Left Sidebar */}
      <aside className="visualizer-sidebar-new">
        <div className="sidebar-header-new">
          <h2 className="sidebar-title-new">Algorithms</h2>
        </div>
        <nav className="sidebar-nav">
          {Object.entries(categories).map(([key, category]) => {
            const isExpanded = expandedCategories[key] || selectedCategory === key;
            const isActive = selectedCategory === key;

            return (
              <div key={key} className="category-group">
                <button
                  className={`category-button ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedCategory !== key) {
                      setSelectedCategory(key);
                      setExpandedCategories(prev => ({ ...prev, [key]: true }));
                    } else {
                      toggleCategory(key);
                    }
                  }}
                >
                  <span className="category-icon-new">{category.icon}</span>
                  <span className="category-name-new">{category.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="category-chevron" size={16} />
                  ) : (
                    <ChevronRight className="category-chevron" size={16} />
                  )}
                </button>
                {isExpanded && (
                  <div className="algorithm-list-new">
                    {category.algorithms.map((algo) => (
                      <button
                        key={algo.id}
                        className={`algorithm-item-new ${selectedAlgorithm?.id === algo.id ? 'selected' : ''}`}
                        onClick={() => onAlgorithmSelect(algo)}
                      >
                        <span className="algorithm-name-new">{algo.name}</span>
                        <span className="algorithm-complexity-new">{algo.complexity}</span>
                      </button>
                    ))}
                    {category.algorithms.length === 0 && (
                      <div className="algorithm-placeholder-new">Coming soon...</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="visualizer-main-new">
        {/* Top Control Card */}
        <ControlPanel
          selectedAlgorithm={selectedAlgorithm}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          speed={speed}
          setSpeed={setSpeed}
          inputData={inputData}
          setInputData={setInputData}
          target={target}
          setTarget={setTarget}
          arraySize={arraySize}
          setArraySize={setArraySize}
          progress={progress}
        />

        {/* Hero Visualization Area */}
        <div className="visualization-hero">
          <VisualizationCanvas
            selectedAlgorithm={selectedAlgorithm}
            inputData={inputData}
            target={target}
            arraySize={arraySize}
            isPlaying={isPlaying}
            speed={speed}
            onStepChange={setCurrentStep}
            onStatsChange={setStats}
            onExplanationChange={setExplanation}
            onLineHighlight={setHighlightedLine}
            onProgressChange={setProgress}
          />
        </div>

        {/* Step Explanation */}
        <div className="explanation-section">
          <div className="explanation-content-new">
            {explanation}
          </div>
        </div>

        {/* Code and Complexity Toggle Buttons */}
        <div className="code-toggle-section">
          <button
            className="code-toggle-btn"
            onClick={() => {
              setCodeVisible(!codeVisible);
              if (!codeVisible) setComplexityVisible(false);
            }}
          >
            <Code2 size={16} />
            {codeVisible ? 'Hide Code' : 'Show Code'}
          </button>
          <button
            className="complexity-toggle-btn"
            onClick={() => {
              setComplexityVisible(!complexityVisible);
              if (!complexityVisible) setCodeVisible(false);
            }}
          >
            <Clock size={16} />
            {complexityVisible ? 'Hide Complexity' : 'Time & Space Complexity'}
          </button>
        </div>

        {/* Code Panel - Collapsible */}
        {codeVisible && (
          <CodePanel
            selectedAlgorithm={selectedAlgorithm}
            highlightedLine={highlightedLine}
            onClose={() => setCodeVisible(false)}
          />
        )}

        {/* Complexity Panel - Collapsible */}
        {complexityVisible && (
          <div className="complexity-panel-new">
            <div className="complexity-content-new">
              <div className="complexity-item-new">
                <div className="complexity-label-new">Time Complexity</div>
                <div className="complexity-value-new">{stats.timeComplexity}</div>
              </div>
              <div className="complexity-item-new">
                <div className="complexity-label-new">Space Complexity</div>
                <div className="complexity-value-new">{stats.spaceComplexity}</div>
              </div>
              <div className="complexity-item-new">
                <div className="complexity-label-new">Comparisons</div>
                <div className="complexity-value-new">{stats.comparisons}</div>
              </div>
              <div className="complexity-item-new">
                <div className="complexity-label-new">Swaps</div>
                <div className="complexity-value-new">{stats.swaps}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VisualizerLayout;
