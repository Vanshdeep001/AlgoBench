import { useState } from 'react';
import ControlPanel from './ControlPanel';
import CodePanel from './CodePanel';
import VisualizationCanvas from '../canvas/VisualizationCanvas';
import '../styles/visualizer.css';
import '../styles/graphs.css';
import '../styles/trees.css';
import '../styles/dp.css';
import '../styles/backtracking.css';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentCategory = categories[selectedCategory];

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const isSplitView = (algo) => {
    return ['graph', 'tree', 'backtracking', 'math'].includes(algo?.visualizationType);
  };

  return (
    <div className={`visualizer-container-new ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`visualizer-sidebar-new ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header-new">
          <h2 className="sidebar-title-new">Algorithms</h2>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
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
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Hero Visualization Area */}
        <div className={`visualization-hero ${isSplitView(selectedAlgorithm) ? 'graph-split-view' : ''}`}>
          {/* Visualization Canvas - Left Side for split view algos */}
          <div className={isSplitView(selectedAlgorithm) ? 'graph-canvas-container' : 'full-canvas-container'}>
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

          {/* Explanation Card - Right Side */}
          {isSplitView(selectedAlgorithm) && (
            <div className="graph-explanation-card">
              <div className="explanation-card-header">
                <h3>Algorithm Steps</h3>
              </div>
              <div className="explanation-card-content">
                {explanation || 'Click play to begin visualization.'}
              </div>
            </div>
          )}
        </div>

        {/* Step Explanation - Hidden for split view algos */}
        {!isSplitView(selectedAlgorithm) && (
          <div className="explanation-section">
            <div className="explanation-content-new">
              {explanation}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VisualizerLayout;
