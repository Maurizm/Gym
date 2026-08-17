'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const playDing = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export function useTimer() {
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const [totalSecs, setTotalSecs] = useState<number>(0);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const format = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      playDing();
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

  const addTime = useCallback((secondsToAdd: number) => {
    if (!endTimeRef.current || remainingSecs === null) return;
    const newRemaining = remainingSecs + secondsToAdd;
    if (newRemaining <= 0) {
      stop();
      return;
    }
    const newTotal = totalSecs + secondsToAdd;
    setTotalSecs(newTotal);
    setRemainingSecs(newRemaining);
    endTimeRef.current = endTimeRef.current + (secondsToAdd * 1000);
  }, [remainingSecs, totalSecs, stop]);

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
    addTime,
    format,
    isActive: remainingSecs !== null
  };
}
