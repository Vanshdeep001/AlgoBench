import { useState, useCallback } from 'react';

export const useSpeedControl = (initialSpeed = 50) => {
  const [speed, setSpeed] = useState(initialSpeed);

  const increaseSpeed = useCallback(() => {
    setSpeed(prev => Math.min(prev + 10, 100));
  }, []);

  const decreaseSpeed = useCallback(() => {
    setSpeed(prev => Math.max(prev - 10, 10));
  }, []);

  const setSpeedValue = useCallback((value) => {
    setSpeed(Math.max(10, Math.min(100, value)));
  }, []);

  return {
    speed,
    setSpeed: setSpeedValue,
    increaseSpeed,
    decreaseSpeed
  };
};
