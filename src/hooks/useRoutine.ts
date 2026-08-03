'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import defaultRoutine from '@/data/routine.json';

const ROUTINE_KEY = 'gymapp:custom_routine';

export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  repsMin?: number;
  repsMax?: number;
  unit?: string;
  perSide?: boolean;
  restSeconds?: number;
  notes?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isWarmup?: boolean;
}

export interface RoutineDay {
  id: string;
  dayNumber: number;
  label?: string;
  restDay?: boolean;
  intensity?: string;
  note?: string;
  exercises: RoutineExercise[];
}

export interface RoutineData {
  days: RoutineDay[];
}

export function useRoutine() {
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get<RoutineData | null>(ROUTINE_KEY, null);
    if (saved) {
      setRoutine(saved);
    } else {
      setRoutine(defaultRoutine as RoutineData);
    }
    setIsLoaded(true);
  }, []);

  const saveRoutine = useCallback((newRoutine: RoutineData) => {
    setRoutine(newRoutine);
    storage.set(ROUTINE_KEY, newRoutine);
  }, []);

  const updateDay = useCallback((dayId: string, updatedExercises: RoutineExercise[]) => {
    if (!routine) return;
    const newRoutine = { ...routine };
    const dayIndex = newRoutine.days.findIndex(d => d.id === dayId);
    if (dayIndex !== -1) {
      newRoutine.days[dayIndex] = { ...newRoutine.days[dayIndex], exercises: updatedExercises };
      saveRoutine(newRoutine);
    }
  }, [routine, saveRoutine]);

  return {
    routine,
    isLoaded,
    updateDay,
    saveRoutine,
  };
}
