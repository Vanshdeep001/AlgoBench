import { useState, useEffect, useRef } from 'react';

/**
 * Visual-only countdown. Server is source of truth for contest end.
 * @param {string} endTime - ISO end time from attempt.endTime
 * @param {() => void} onExpire - called when time reaches 0
 * @returns { { remainingMs: number, expired: boolean, formatted: string } }
 */
export function useContestTimer(endTime, onExpire) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!endTime) {
      setRemainingMs(0);
      setExpired(true);
      return;
    }
    const end = new Date(endTime).getTime();

    const tick = () => {
      const now = Date.now();
      const left = Math.max(0, end - now);
      setRemainingMs(left);
      if (left <= 0) {
        setExpired(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onExpireRef.current?.();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endTime]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = expired
    ? '0:00:00'
    : `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { remainingMs, expired, formatted };
}
