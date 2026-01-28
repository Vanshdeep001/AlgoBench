export const createDelay = (speed) => {
  // Speed is 10-100, convert to delay in ms
  // Higher speed = lower delay
  // Speed 10 = 500ms, Speed 100 = 50ms
  const minDelay = 50;
  const maxDelay = 500;
  const delay = maxDelay - ((speed - 10) / 90) * (maxDelay - minDelay);
  
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
