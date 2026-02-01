export const createDelay = (speed) => {
  // Speed is 10-100, convert to delay in ms
  // Higher speed = lower delay
  // We want to make it significantly slower overall
  // Speed 10 = 2000ms (Very Slow)
  // Speed 50 = ~1000ms (Medium)
  // Speed 100 = 100ms (Fast)
  const minDelay = 100;
  const maxDelay = 2000;

  // Use a non-linear scale to give more control at slower speeds
  // Formula: maxDelay - ((speed - 10) / 90) * (maxDelay - minDelay)
  const delay = maxDelay - Math.pow((speed - 10) / 90, 0.8) * (maxDelay - minDelay);

  return new Promise(resolve => setTimeout(resolve, delay));
};

export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
