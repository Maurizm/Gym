'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { SessionState } from '@/hooks/useWorkoutSession';

const SESSIONS_HISTORY_KEY = 'gymapp:sessions';

export interface HistoryStats {
  totalSessions: number;
  streakDays: number;
  totalMinutes: number;
  totalVolume: number;
}

/**
 * Returns the most recent logged weight (in kg) for a given exercise,
 * from any past completed session.
 */
export function getLastWeightForExercise(
  history: SessionState[],
  exerciseId: string
): string {
  // history is stored oldest-first; iterate from newest
  for (let i = history.length - 1; i >= 0; i--) {
    const log = history[i].exerciseLogs.find(l => l.exerciseId === exerciseId);
    if (!log) continue;
    // Find a completed set that has a weight (ignore warmup sets)
    const completedSet = [...log.sets].reverse().find(s => s.completed && !s.isWarmup && s.weightKg);
    if (completedSet?.weightKg) return completedSet.weightKg;
  }
  return '';
}

/**
 * Returns the maximum weight lifted (across all completed sets) for an exercise
 * in a given session.
 */
export function getBestWeightInSession(session: SessionState, exerciseId: string): string {
  const log = session.exerciseLogs.find(l => l.exerciseId === exerciseId);
  if (!log) return '';
  const weights = log.sets
    .filter(s => s.completed && !s.isWarmup && s.weightKg)
    .map(s => parseFloat(s.weightKg))
    .filter(w => !isNaN(w));
  if (weights.length === 0) return '';
  return Math.max(...weights).toString();
}

/**
 * Returns the all-time absolute max weight for an exercise across the entire history.
 */
export function getAbsoluteMaxWeight(history: SessionState[], exerciseId: string): number {
  let max = 0;
  for (const session of history) {
    if (!session.completed) continue;
    const log = session.exerciseLogs.find(l => l.exerciseId === exerciseId);
    if (!log) continue;
    
    for (const set of log.sets) {
      if (set.completed && !set.isWarmup && set.weightKg) {
        const w = parseFloat(set.weightKg);
        if (!isNaN(w) && w > max) {
          max = w;
        }
      }
    }
  }
  return max;
}

/**
 * Computes a consecutive-day streak from a list of sessions.
 */
function computeStreak(sessions: SessionState[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Unique dates (ISO date string), sorted descending
  const uniqueDates = Array.from(
    new Set(sessions.map(s => new Date(s.startTime).toISOString().split('T')[0]))
  ).sort((a, b) => (a > b ? -1 : 1));

  let streak = 0;
  let expected = new Date(today);

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr + 'T00:00:00');
    const diff = Math.round((expected.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0 || diff === 1) {
      streak++;
      expected = d;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Computes the total volume (weight * reps) for a list of sessions.
 */
function computeTotalVolume(sessions: SessionState[]): number {
  let volume = 0;
  sessions.forEach(sess => {
    if (!sess.completed) return;
    sess.exerciseLogs.forEach(log => {
      log.sets.forEach(set => {
        if (set.completed && !set.isWarmup && set.weightKg && set.repsDone) {
          const w = parseFloat(set.weightKg);
          const r = parseInt(set.repsDone, 10);
          if (!isNaN(w) && !isNaN(r)) {
            volume += (w * r);
          }
        }
      });
    });
  });
  return volume;
}

export function useWorkoutHistory() {
  const [history, setHistory] = useState<SessionState[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get<SessionState[]>(SESSIONS_HISTORY_KEY, []);
    setHistory(saved);
    setIsLoaded(true);
  }, []);

  const stats: HistoryStats = {
    totalSessions: history.filter(s => s.completed).length,
    streakDays: computeStreak(history),
    totalMinutes: Math.floor(history.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60),
    totalVolume: computeTotalVolume(history),
  };

  const getLastWeight = (exerciseId: string) =>
    getLastWeightForExercise(history, exerciseId);

  const getMaxWeight = (exerciseId: string) =>
    getAbsoluteMaxWeight(history, exerciseId);

  const getExerciseHistoryData = (exerciseId: string) => {
    const result: { date: string; maxWeight: number }[] = [];
    for (const session of history) {
      if (!session.completed) continue;
      const log = session.exerciseLogs.find(l => l.exerciseId === exerciseId);
      if (!log) continue;
      
      let dailyMax = 0;
      for (const set of log.sets) {
        if (set.completed && !set.isWarmup && set.weightKg) {
          const w = parseFloat(set.weightKg);
          if (!isNaN(w) && w > dailyMax) {
            dailyMax = w;
          }
        }
      }
      
      if (dailyMax > 0) {
        result.push({
          date: session.date,
          maxWeight: dailyMax
        });
      }
    }
    return result;
  };

  return { history, isLoaded, stats, getLastWeight, getMaxWeight, getExerciseHistoryData };
}
