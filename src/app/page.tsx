'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useRoutine } from '@/hooks/useRoutine';
import { ImageCarousel } from '@/components/ImageCarousel';
import { ExerciseModal } from '@/components/ExerciseModal';

interface DayMap {
  id: string;
  lbl: string;
  dayNumber: number;
  num: string;
}

const getDaysMap = (): DayMap[] => {
  const map = [
    { id: 'monday', lbl: 'Lu', dayNumber: 1 },
    { id: 'tuesday', lbl: 'Ma', dayNumber: 2 },
    { id: 'wednesday', lbl: 'Mi', dayNumber: 3 },
    { id: 'thursday', lbl: 'Ju', dayNumber: 4 },
    { id: 'friday', lbl: 'Vi', dayNumber: 5 },
    { id: 'saturday', lbl: 'Sa', dayNumber: 6 },
    { id: 'sunday', lbl: 'Do', dayNumber: 7 }
  ];

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();

  return map.map(d => {
    const date = new Date(now);
    date.setDate(now.getDate() + (d.dayNumber - currentDay));
    return {
      ...d,
      num: date.getDate().toString()
    };
  });
};

/** Format rest seconds to a readable string like "2:30" or "60s" */
function formatRest(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s === 0 ? `${m}min` : `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format the reps/unit display for an exercise */
function formatReps(ex: Record<string, unknown>): string {
  const unit = (ex.unit as string) || 'reps';
  const reps = ex.reps != null
    ? `${ex.reps}`
    : `${ex.repsMin}-${ex.repsMax}`;
  return `${ex.sets}×${reps} ${unit}`;
}

export default function Home() {
  const router = useRouter();
  const { session, isLoaded: sessionLoaded, startSession } = useWorkoutSession();
  const { history } = useWorkoutHistory();
  const { routine, isLoaded: routineLoaded, currentPhase, currentWeek } = useRoutine();
  const [selectedDayId, setSelectedDayId] = useState<string>('monday');
  const [isClient, setIsClient] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Record<string, unknown> | null>(null);

  const [isBtnVisible, setIsBtnVisible] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const btnRef = useCallback((node: HTMLDivElement) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) {
      observerRef.current = new IntersectionObserver(([entry]) => {
        setIsBtnVisible(entry.isIntersecting);
      });
      observerRef.current.observe(node);
    }
  }, []);

  // Build a set of dates that have completed sessions for badge display
  const completedDates = new Set(
    history.filter(s => s.completed).map(s => s.dayId)
  );

  useEffect(() => {
    setIsClient(true);
    if (!sessionLoaded) return;
    if (session && !session.completed) {
      router.push('/workout');
      return;
    }

    const today = new Date().getDay();
    const currentDayNumber = today === 0 ? 7 : today;
    const todayId = getDaysMap().find(d => d.dayNumber === currentDayNumber)?.id || 'monday';
    setSelectedDayId(todayId);
  }, [session, sessionLoaded, router]);

  if (!isClient || !sessionLoaded || !routineLoaded || !routine || !currentPhase) {
    // Skeleton loading state
    return (
      <div className="px-md md:px-lg py-md space-y-lg">
        <div className="space-y-md animate-pulse">
          <div className="h-10 w-48 bg-surface-bright rounded-lg" />
          <div className="h-5 w-32 bg-surface-bright rounded" />
        </div>
        <div className="flex gap-xs">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 h-16 bg-surface-bright rounded-lg animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
        <div className="h-48 bg-surface rounded-2xl border border-outline-variant animate-pulse" />
      </div>
    );
  }

  const activeRoutine = currentPhase.days.find((r) => r.id === selectedDayId);
  if (!activeRoutine) return <div className="p-md text-on-surface-variant">Día de descanso o rutina no encontrada.</div>;

  const handleStart = () => {
    startSession(activeRoutine);
    router.push('/workout');
  };

  // Check if this day has a past session this week
  const lastSession = history.filter(s => s.dayId === selectedDayId && s.completed).slice(-1)[0];

  return (
    <div className="px-md md:px-lg py-md space-y-lg max-w-5xl mx-auto">
      {/* Header */}
      <section className="space-y-md animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-sm">
          <div className="space-y-xs">
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">Hola, Atleta</h1>
            <p className="text-on-surface-variant text-body-md">Hoy toca: {activeRoutine.label as string}</p>
          </div>
          <div className="bg-primary-soft border-primary/20 text-primary px-md py-xs rounded-full border flex items-center gap-xs self-start md:self-auto">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
            <span className="text-label-caps">Semana {currentWeek} · {currentPhase.name}</span>
          </div>
        </div>

        {/* Day picker */}
        <div className="flex justify-between bg-surface p-xs rounded-xl border border-outline-variant">
          {getDaysMap().map(d => {
            const isActive = d.id === selectedDayId;
            const hasDone = completedDates.has(d.id);
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDayId(d.id)}
                className={`
                  flex-1 flex flex-col items-center py-sm rounded-xl relative
                  transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  active:scale-[0.95]
                  ${isActive
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/25'
                    : 'text-on-surface-variant hover:bg-surface-bright cursor-pointer'
                  }
                `}
              >
                <span className={`text-label-caps ${isActive ? 'opacity-80' : 'opacity-60'}`}>{d.lbl}</span>
                <span className="font-mono text-lg font-bold">{d.num}</span>
                {hasDone && !isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-success opacity-80" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Workout card */}
      <section className="relative overflow-hidden rounded-2xl bg-surface border border-outline-variant shadow-sm dark:shadow-none p-lg animate-fade-in-up delay-100">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <div className="flex items-center gap-sm mb-xs flex-wrap">
              <span className="bg-primary-soft text-primary text-label-caps px-sm py-1 rounded-full border border-primary/20 uppercase">
                INTENSIDAD {activeRoutine.intensity as string}
              </span>
              {lastSession && (
                <span className="bg-success-soft text-success text-label-caps px-sm py-1 rounded-full border border-success/20 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                  Completado esta semana
                </span>
              )}
            </div>
            <h2 className="text-headline-md text-on-surface">{activeRoutine.label as string}</h2>
            {(activeRoutine.note) && (
              <p className="text-on-surface-variant text-body-md mt-sm leading-relaxed max-w-prose">
                {activeRoutine.note as string}
              </p>
            )}
            <div className="flex items-center gap-md mt-sm text-on-surface-variant">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="text-body-md">~60 min</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">fitness_center</span>
                <span className="text-body-md">{(activeRoutine.exercises as unknown[]).length} Ejercicios</span>
              </div>
            </div>
          </div>

          <div className="mt-sm md:mt-0" ref={btnRef}>
            <button
              onClick={handleStart}
              className="
                relative w-full md:w-auto shrink-0 h-[60px] px-lg
                bg-primary text-on-primary rounded-xl
                text-lg font-bold tracking-wide
                shadow-lg shadow-primary/25 dark:shadow-primary/15
                flex items-center justify-center gap-md
                active:scale-[0.97] hover:brightness-110
                transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                overflow-hidden group
              "
            >
              <div className="absolute inset-0 bg-white/10 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              <span className="whitespace-nowrap">EMPEZAR</span>
            </button>
          </div>
        </div>
      </section>

      {/* Exercise list */}
      <section className="space-y-xl pb-8">
        {(() => {
          const exercises = activeRoutine.exercises as unknown as Record<string, unknown>[];
          const warmups = exercises.filter((e) => e.isWarmup);
          const workout = exercises.filter((e) => !e.isWarmup);

          const renderList = (title: string, list: Record<string, unknown>[]) => {
            if (list.length === 0) return null;
            return (
              <div className="space-y-md">
                <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <h3 className="text-headline-md text-on-surface">{title}</h3>
                  <span className="text-on-surface-variant text-label-caps">{list.length} ejercicios</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  {list.map((ex, idx: number) => {
                    const delayClass = idx < 7 ? `delay-${[75, 100, 150, 200, 300, 400, 500][idx]}` : 'delay-500';
                    const perSide = ex.perSide ? ' c/lado' : '';
                    return (
                      <div
                        key={ex.id as string}
                        className={`
                          bg-surface border border-outline-variant rounded-xl overflow-hidden
                          hover:border-primary/40
                          transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                          cursor-pointer group animate-fade-in-up ${delayClass}
                        `}
                        onClick={() => setSelectedExercise(ex)}
                      >
                        <div className="aspect-video w-full overflow-hidden bg-surface-bright relative">
                          <div className="absolute inset-0 group/carousel">
                            <ImageCarousel images={(ex.imageUrls as string[]) || (ex.imageUrl ? [ex.imageUrl as string] : [])} alt={ex.name as string} showLabels />
                          </div>
                        </div>
                        <div className="p-md flex items-center justify-between">
                          <div className="flex items-center gap-md">
                            <div className="w-10 h-10 bg-surface-bright rounded-lg flex items-center justify-center text-primary border border-outline-variant shrink-0">
                              <span className="material-symbols-outlined text-2xl">exercise</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-stat-value text-on-surface">{ex.name as string}</p>
                              <div className="flex items-center gap-sm flex-wrap">
                                <p className="text-on-surface-variant text-body-md">
                                  {formatReps(ex)}{perSide}
                                </p>
                                {!!ex.restSeconds && (
                                  <span className="flex items-center gap-0.5 text-outline text-label-caps">
                                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>timer</span>
                                    {formatRest(ex.restSeconds as number)}
                                  </span>
                                )}
                              </div>
                              {!!ex.notes && (
                                <p className="text-outline text-label-caps italic mt-0.5 line-clamp-1">&quot;{ex.notes as string}&quot;</p>
                              )}
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0">chevron_right</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          };

          return (
            <>
              {renderList("Calentamiento", warmups)}
              {renderList("Entrenamiento", workout)}
            </>
          );
        })()}
      </section>

      <ExerciseModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exerciseName={(selectedExercise?.name as string) || ''}
        exerciseData={selectedExercise}
      />

      {/* Floating Action Button (Only visible when main button is scrolled out) */}
      {!isBtnVisible && (
        <button
          onClick={handleStart}
          className="
            fixed bottom-[104px] md:bottom-24 right-4 md:right-8 z-50 w-16 h-16 rounded-full flex items-center justify-center
            bg-primary text-on-primary shadow-xl animate-scale-in hover:brightness-110 active:scale-95 transition-all
          "
        >
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            play_arrow
          </span>
        </button>
      )}
    </div>
  );
}
