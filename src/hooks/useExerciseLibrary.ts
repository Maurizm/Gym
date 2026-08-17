'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { storage } from '@/lib/storage';
import defaultRoutine from '@/data/routine.json';

const CUSTOM_EXERCISES_KEY = 'gymapp:custom_exercises';

export interface LibraryExercise {
  id: string;
  name: string;
  unit: string;
  perSide?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  isCustom?: boolean;
}

export function useExerciseLibrary() {
  const [customExercises, setCustomExercises] = useState<LibraryExercise[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get<LibraryExercise[]>(CUSTOM_EXERCISES_KEY, []);
    setCustomExercises(saved);
    setIsLoaded(true);
  }, []);

  const saveCustomExercises = useCallback((newExercises: LibraryExercise[]) => {
    setCustomExercises(newExercises);
    storage.set(CUSTOM_EXERCISES_KEY, newExercises);
  }, []);

  const addCustomExercise = useCallback((name: string, unit: string = 'reps', perSide: boolean = false) => {
    const newEx: LibraryExercise = {
      id: `custom-${Date.now()}`,
      name,
      unit,
      perSide,
      isCustom: true
    };
    saveCustomExercises([...customExercises, newEx]);
    return newEx;
  }, [customExercises, saveCustomExercises]);

  const library = useMemo(() => {
    const map = new Map<string, LibraryExercise>();
    
    // Add defaults
    if (defaultRoutine.phases) {
      defaultRoutine.phases.forEach(phase => {
        phase.days.forEach(day => {
          day.exercises.forEach((ex: any) => {
            if (!map.has(ex.id)) {
              map.set(ex.id, {
                id: ex.id,
                name: ex.name,
                unit: ex.unit || 'reps',
                perSide: ex.perSide || false,
                imageUrl: ex.imageUrl,
                imageUrls: ex.imageUrls,
                isCustom: false
              });
            }
          });
        });
      });
    } else if ((defaultRoutine as any).days) {
      // Fallback for legacy
      (defaultRoutine as any).days.forEach((day: any) => {
        day.exercises.forEach((ex: any) => {
          if (!map.has(ex.id)) {
            map.set(ex.id, {
              id: ex.id,
              name: ex.name,
              unit: ex.unit || 'reps',
              perSide: ex.perSide || false,
              imageUrl: ex.imageUrl,
              imageUrls: ex.imageUrls,
              isCustom: false
            });
          }
        });
      });
    }

    // Add custom
    customExercises.forEach(ex => {
      map.set(ex.id, ex);
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [customExercises]);

  return {
    library,
    isLoaded,
    addCustomExercise
  };
}
