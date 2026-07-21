'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer() {
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const [totalSecs, setTotalSecs] = useState<number>(0);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const format = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}`;
  };

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    setRemainingSecs(null);
  }, []);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;
    const now = Date.now();
    const ms = endTimeRef.current - now;

    if (ms <= 0) {
      stop();
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
      return;
    }
    setRemainingSecs(Math.ceil(ms / 1000));
  }, [stop]);

  const start = useCallback((seconds: number) => {
    stop();
    setTotalSecs(seconds);
    setRemainingSecs(seconds);
    endTimeRef.current = Date.now() + seconds * 1000;

    intervalRef.current = setInterval(tick, 1000);
    tick(); // Initial
  }, [stop, tick]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && endTimeRef.current) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  return {
    remainingSecs,
    totalSecs,
    start,
    stop,
    format,
    isActive: remainingSecs !== null
  };
}
