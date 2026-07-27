'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { getPhaseInfo } from '@/lib/week-phase';

const ACTIVE_SESSION_KEY = 'gymapp:active_session';
const SESSIONS_HISTORY_KEY = 'gymapp:sessions';

export interface ExerciseSet {
  setNumber: number;
  weightKg: string;
  repsDone: string;
  completed: boolean;
  isWarmup?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: ExerciseSet[];
}

export interface SessionState {
  sessionId: string;
  dayId: string;
  date: string;
  startTime: number;
  weekNumber: number;
  exerciseLogs: ExerciseLog[];
  completed: boolean;
  durationSeconds?: number;
}

export function useWorkoutSession() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Rehydrate on mount
  useEffect(() => {
    const saved = storage.get<SessionState | null>(ACTIVE_SESSION_KEY, null);
    if (saved) setSession(saved);
    setIsLoaded(true);
  }, []);

  const saveState = useCallback((state: SessionState) => {
    setSession(state);
    storage.set(ACTIVE_SESSION_KEY, state);
  }, []);

  const startSession = useCallback((day: any) => {
    const phaseInfo = getPhaseInfo();
    const newState: SessionState = {
      sessionId: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : 'id-' + Date.now(),
      dayId: day.id,
      date: new Date().toISOString().split('T')[0],
      startTime: Date.now(),
      weekNumber: phaseInfo.weekNumber,
      exerciseLogs: day.exercises.map((ex: any) => ({
        exerciseId: ex.id,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          weightKg: '',
          repsDone: '',
          completed: false
        }))
      })),
      completed: false
    };
    saveState(newState);
    return newState;
  }, [saveState]);

  const logSet = useCallback((exerciseId: string, setNumber: number, data: Partial<ExerciseSet>) => {
    setSession(prev => {
      if (!prev) return prev;
      const newState = { ...prev, exerciseLogs: [...prev.exerciseLogs] };
      const exIdx = newState.exerciseLogs.findIndex(l => l.exerciseId === exerciseId);
      if (exIdx >= 0) {
        const exLog = { ...newState.exerciseLogs[exIdx], sets: [...newState.exerciseLogs[exIdx].sets] };
        const setIdx = exLog.sets.findIndex(s => s.setNumber === setNumber);
        if (setIdx >= 0) {
          exLog.sets[setIdx] = { ...exLog.sets[setIdx], ...data };
        }
        newState.exerciseLogs[exIdx] = exLog;
        storage.set(ACTIVE_SESSION_KEY, newState);
        return newState;
      }
      return prev;
    });
  }, []);

  const finishSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return null;
      const finalState = { ...prev, completed: true, durationSeconds: Math.floor((Date.now() - prev.startTime) / 1000) };
      
      const history = storage.get<SessionState[]>(SESSIONS_HISTORY_KEY, []);
      history.push(finalState);
      storage.set(SESSIONS_HISTORY_KEY, history);
      
      storage.remove(ACTIVE_SESSION_KEY);
      return null;
    });
  }, []);

  const addSet = useCallback((exerciseId: string) => {
    setSession(prev => {
      if (!prev) return prev;
      const newState = { ...prev, exerciseLogs: [...prev.exerciseLogs] };
      const exIdx = newState.exerciseLogs.findIndex(l => l.exerciseId === exerciseId);
      if (exIdx >= 0) {
        const exLog = { ...newState.exerciseLogs[exIdx], sets: [...newState.exerciseLogs[exIdx].sets] };
        
        const lastSet = exLog.sets[exLog.sets.length - 1];
        const nextSetNum = lastSet ? lastSet.setNumber + 1 : 1;
        
        exLog.sets.push({
          setNumber: nextSetNum,
          weightKg: lastSet ? lastSet.weightKg : '',
          repsDone: '',
          completed: false
        });
        
        newState.exerciseLogs[exIdx] = exLog;
        storage.set(ACTIVE_SESSION_KEY, newState);
        return newState;
      }
      return prev;
    });
  }, []);

  const removeSet = useCallback((exerciseId: string, setNumber: number) => {
    setSession(prev => {
      if (!prev) return prev;
      const newState = { ...prev, exerciseLogs: [...prev.exerciseLogs] };
      const exIdx = newState.exerciseLogs.findIndex(l => l.exerciseId === exerciseId);
      if (exIdx >= 0) {
        const exLog = { ...newState.exerciseLogs[exIdx], sets: [...newState.exerciseLogs[exIdx].sets] };
        
        exLog.sets = exLog.sets.filter(s => s.setNumber !== setNumber);
        exLog.sets.forEach((s, idx) => {
          s.setNumber = idx + 1;
        });
        
        newState.exerciseLogs[exIdx] = exLog;
        storage.set(ACTIVE_SESSION_KEY, newState);
        return newState;
      }
      return prev;
    });
  }, []);

  return {
    session,
    isLoaded,
    startSession,
    logSet,
    addSet,
    removeSet,
    finishSession
  };
}
