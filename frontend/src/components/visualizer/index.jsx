import { useState } from 'react';
import VisualizerLayout from './layout/VisualizerLayout';
import { algorithms } from './algorithms/searching/search.meta';
import { sortAlgorithms } from './algorithms/sorting/sort.meta';
import './styles/visualizer.css';

const DSAVisualizer = () => {
  const [selectedCategory, setSelectedCategory] = useState('searching');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [inputData, setInputData] = useState('');
  const [target, setTarget] = useState('');
  const [arraySize, setArraySize] = useState(10);

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
    trees: {
      name: 'Trees',
      algorithms: [],
      icon: '🌳'
    },
    graphs: {
      name: 'Graphs',
      algorithms: [],
      icon: '🕸️'
    },
    dp: {
      name: 'DP',
      algorithms: [],
      icon: '💡'
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
