import { useState, useEffect } from 'react';
import VisualizerLayout from './layout/VisualizerLayout';
import { algorithms } from './algorithms/searching/search.meta';
import { sortAlgorithms } from './algorithms/sorting/sort.meta';
import { graphAlgorithms } from './algorithms/graphs/graph.meta';
import { treeAlgorithms } from './algorithms/trees/tree.meta';
import { dpAlgorithms } from './algorithms/dp/dp.meta';
import { backtrackingAlgorithms } from './algorithms/backtracking/backtracking.meta';
import { mathAlgorithms } from './algorithms/math/math.meta';
import './styles/visualizer.css';

const DSAVisualizer = () => {
  const [selectedCategory, setSelectedCategory] = useState('searching');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [inputData, setInputData] = useState('');
  const [target, setTarget] = useState('');
  const [arraySize, setArraySize] = useState(10);

  // Listen for completion events to stop playback
  useEffect(() => {
    const handleStopPlayback = () => {
      setIsPlaying(false);
    };



    window.addEventListener('stopPlayback', handleStopPlayback);
    return () => {
      window.removeEventListener('stopPlayback', handleStopPlayback);
    };
  }, []);

  const categories = {
    searching: {
      name: 'Search',
      algorithms: algorithms,
      icon: '🔍'
    },
    sorting: {
      name: 'Sort',
      algorithms: sortAlgorithms,
      icon: '🔄'
    },
    graphs: {
      name: 'Graphs',
      algorithms: graphAlgorithms,
      icon: '🕸️'
    },
    trees: {
      name: 'Trees',
      algorithms: treeAlgorithms,
      icon: '🌳'
    },
    dp: {
      name: 'Dynamic Programming',
      algorithms: dpAlgorithms,
      icon: '💡'
    },
    backtracking: {
      name: 'Backtracking',
      algorithms: backtrackingAlgorithms,
      icon: '↩️'
    },
    math: {
      name: 'Math',
      algorithms: mathAlgorithms,
      icon: '∑'
    }
  };

  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    setIsPlaying(false);
  };

  return (
    <VisualizerLayout
      categories={categories}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedAlgorithm={selectedAlgorithm}
      onAlgorithmSelect={handleAlgorithmSelect}
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
    />
  );
};

export default DSAVisualizer;
