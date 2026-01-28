import { useState, useCallback } from 'react';

export const useStepController = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const stepForward = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps)));
  }, [totalSteps]);

  return {
    currentStep,
    isPlaying,
    totalSteps,
    setTotalSteps,
    setCurrentStep,
    play,
    pause,
    toggle,
    stepForward,
    stepBackward,
    reset,
    goToStep
  };
};
