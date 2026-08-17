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

export interface RoutinePhase {
  id: string;
  name: string;
  days: RoutineDay[];
}

export interface RoutineData {
  phases?: RoutinePhase[];
  days?: RoutineDay[]; // Legacy fallback
  programStartDate?: number; // Epoch timestamp
  manualPhaseId?: string; // Optional manual override
}

export function useRoutine() {
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get<RoutineData | null>(ROUTINE_KEY, null);
    // @ts-ignore (we know version might exist)
    if (saved && saved.phases && saved.version >= 7) {
      setRoutine(saved);
    } else {
      // Si no hay nada guardado, es la rutina legacy sin fases, o tiene versión vieja, forzamos la nueva
      const initialRoutine = defaultRoutine as RoutineData;
      if (!initialRoutine.programStartDate) {
        initialRoutine.programStartDate = Date.now();
      }
      setRoutine(initialRoutine);
      storage.set(ROUTINE_KEY, initialRoutine);
    }
    setIsLoaded(true);
  }, []);

  const saveRoutine = useCallback((newRoutine: RoutineData) => {
    setRoutine(newRoutine);
    storage.set(ROUTINE_KEY, newRoutine);
  }, []);

  // Compute Current Phase dynamically
  let currentPhaseIndex = 0;
  let currentWeek = 1;
  let currentPhase: RoutinePhase | null = null;
  let phases: RoutinePhase[] = [];

  if (routine) {
    if (routine.phases && routine.phases.length > 0) {
      phases = routine.phases;
      if (routine.manualPhaseId) {
        currentPhaseIndex = phases.findIndex(p => p.id === routine.manualPhaseId);
        if (currentPhaseIndex === -1) currentPhaseIndex = 0;
      } else {
        const start = routine.programStartDate || Date.now();
        const diffMs = Date.now() - start;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        currentWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
        
        // Bloques de 2 semanas: Semanas 1,2 = fase 0. Semanas 3,4 = fase 1. Semanas 5,6 = fase 0...
        const block = Math.floor((currentWeek - 1) / 2);
        currentPhaseIndex = block % phases.length;
      }
      currentPhase = phases[currentPhaseIndex];
    } else if (routine.days) {
      // Legacy wrapper
      currentPhase = { id: 'legacy', name: 'Legacy', days: routine.days };
      phases = [currentPhase];
    }
  }

  const updateDay = useCallback((phaseId: string, dayId: string, updatedExercises: RoutineExercise[]) => {
    if (!routine) return;
    const newRoutine = { ...routine };
    
    if (newRoutine.phases) {
      const pIdx = newRoutine.phases.findIndex(p => p.id === phaseId);
      if (pIdx !== -1) {
        const dIdx = newRoutine.phases[pIdx].days.findIndex(d => d.id === dayId);
        if (dIdx !== -1) {
          newRoutine.phases[pIdx].days[dIdx] = { ...newRoutine.phases[pIdx].days[dIdx], exercises: updatedExercises };
        }
      }
    } else if (newRoutine.days) {
      // Legacy
      const dIdx = newRoutine.days.findIndex(d => d.id === dayId);
      if (dIdx !== -1) {
        newRoutine.days[dIdx] = { ...newRoutine.days[dIdx], exercises: updatedExercises };
      }
    }
    saveRoutine(newRoutine);
  }, [routine, saveRoutine]);

  return {
    routine,
    isLoaded,
    updateDay,
    saveRoutine,
    currentPhase,
    currentPhaseIndex,
    currentWeek,
    phases
  };
}
