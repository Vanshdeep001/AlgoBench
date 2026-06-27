import { useState, useRef } from 'react';
import ControlPanel from './ControlPanel';
import CodePanel from './CodePanel';
import VisualizationCanvas from '../canvas/VisualizationCanvas';
import '../styles/visualizer.css';
import '../styles/graphs.css';
import '../styles/trees.css';
import '../styles/dp.css';
import '../styles/backtracking.css';
import '../styles/math.css';
import { ChevronDown, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';

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
  const canvasRef = useRef(null);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setExplanation('Select an algorithm to begin visualization.');
    setStats({ comparisons: 0, swaps: 0, timeComplexity: 'O(1)', spaceComplexity: 'O(1)' });
    setHighlightedLine(null);
    canvasRef.current?.reset();
  };

  const handleStep = () => {
    canvasRef.current?.stepForward();
  };

  const currentCategory = categories[selectedCategory];

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => {
      const currentVal = prev[categoryKey] !== undefined 
        ? prev[categoryKey] 
        : selectedCategory === categoryKey;
      return {
        ...prev,
        [categoryKey]: !currentVal
      };
    });
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
        </div>
        <nav className="sidebar-nav">
          {Object.entries(categories).map(([key, category]) => {
            const isExpanded = expandedCategories[key] !== undefined 
              ? expandedCategories[key] 
              : selectedCategory === key;
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
                        <span className="text-[11px] font-display mr-3 opacity-40">
                          {(category.algorithms.indexOf(algo) + 1).toString().padStart(2, '0')}
                        </span>
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

        {/* Sidebar Footer */}
        <div className="sidebar-footer-new">
          <div className="sidebar-toggle-container-bottom">
            {!sidebarCollapsed && (
              <span className="sidebar-bottom-title">Algorithms</span>
            )}
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
          </div>
        </div>
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
          onReset={handleReset}
          onStep={handleStep}
        />

        {/* Hero Visualization Area */}
        <div className={`visualization-hero ${isSplitView(selectedAlgorithm) ? 'graph-split-view' : ''}`}>
          {/* Visualization Canvas - Left Side for split view algos */}
          <div className={isSplitView(selectedAlgorithm) ? 'graph-canvas-container' : 'full-canvas-container'}>
            <VisualizationCanvas
              ref={canvasRef}
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
                <h3>Trace Logs</h3>
              </div>
              <div className="explanation-card-content">
                {explanation || 'Awaiting simulation start...'}
              </div>
            </div>
          )}
        </div>

        {/* Step Explanation - Hidden for split view algos and when nothing is selected */}
        {!isSplitView(selectedAlgorithm) && selectedAlgorithm && (
          <div className="explanation-section">
            <div className={`explanation-content-new ${explanation === 'Select an algorithm to begin visualization.' ? 'placeholder-text' : ''}`}>
              {explanation}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VisualizerLayout;
