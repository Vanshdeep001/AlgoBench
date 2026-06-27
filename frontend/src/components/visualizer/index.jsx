import { useState, useEffect } from 'react';
import VisualizerLayout from './layout/VisualizerLayout';
import SharedNavbar from '../SharedNavbar';
import PublicFooter from '../PublicFooter';
import { algorithms } from './algorithms/searching/search.meta';
import { sortAlgorithms } from './algorithms/sorting/sort.meta';
import { graphAlgorithms } from './algorithms/graphs/graph.meta';
import { treeAlgorithms } from './algorithms/trees/tree.meta';
import { dpAlgorithms } from './algorithms/dp/dp.meta';
import { backtrackingAlgorithms } from './algorithms/backtracking/backtracking.meta';
import { mathAlgorithms } from './algorithms/math/math.meta';
import './styles/visualizer.css';
import {
  Search,
  ArrowUpDown,
  Share2,
  GitFork,
  BrainCircuit,
  Undo2,
  Calculator
} from 'lucide-react';

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
      icon: <Search size={20} />
    },
    sorting: {
      name: 'Sort',
      algorithms: sortAlgorithms,
      icon: <ArrowUpDown size={20} />
    },
    graphs: {
      name: 'Graphs',
      algorithms: graphAlgorithms,
      icon: <Share2 size={20} />
    },
    trees: {
      name: 'Trees',
      algorithms: treeAlgorithms,
      icon: <GitFork size={20} />
    },
    dp: {
      name: 'Dynamic Programming',
      algorithms: dpAlgorithms,
      icon: <BrainCircuit size={20} />
    },
    backtracking: {
      name: 'Backtracking',
      algorithms: backtrackingAlgorithms,
      icon: <Undo2 size={20} />
    },
    math: {
      name: 'Math',
      algorithms: mathAlgorithms,
      icon: <Calculator size={20} />
    }
  };

  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] flex flex-col">
      <SharedNavbar flat={true} />
      <div className="flex-1 relative min-h-0 w-full">
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
      </div>
      <PublicFooter />
    </div>
  );
};

export default DSAVisualizer;
