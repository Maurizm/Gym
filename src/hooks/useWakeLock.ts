'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock(enabled: boolean = true) {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      if (!wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setIsLocked(true);

        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
          setIsLocked(false);
        });
      }
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      setIsLocked(false);
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
      wakeLockRef.current = null;
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && isSupported) {
      requestLock();
    } else {
      releaseLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && isSupported) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [enabled, isSupported, requestLock, releaseLock]);

  return { isLocked, isSupported };
}
