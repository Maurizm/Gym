'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPhaseInfo } from '@/lib/week-phase';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useRoutine } from '@/hooks/useRoutine';
import { ImageCarousel } from '@/components/ImageCarousel';

const getDaysMap = () => {
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
function formatReps(ex: any): string {
  const unit = ex.unit || 'reps';
  const reps = ex.reps != null
    ? `${ex.reps}`
    : `${ex.repsMin}-${ex.repsMax}`;
  return `${ex.sets}×${reps} ${unit}`;
}

export default function Home() {
  const router = useRouter();
  const { session, isLoaded: sessionLoaded, startSession } = useWorkoutSession();
  const { history } = useWorkoutHistory();
  const { routine, isLoaded: routineLoaded } = useRoutine();
  const [selectedDayId, setSelectedDayId] = useState<string>('monday');
  const [isClient, setIsClient] = useState(false);

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

  if (!isClient || !sessionLoaded || !routineLoaded || !routine) return null;

  const phaseInfo = getPhaseInfo();
  const isDeload = phaseInfo.isDeload;

  const activeRoutine = routine.days.find((r: any) => r.id === selectedDayId);
  if (!activeRoutine) return <div className="p-md">Rutina no encontrada</div>;

  const handleStart = () => {
    startSession(activeRoutine);
    router.push('/workout');
  };

  // Check if this day has a past session this week
  const todayDate = new Date().toISOString().split('T')[0];
  const lastSession = history.filter(s => s.dayId === selectedDayId && s.completed).slice(-1)[0];

  return (
    <div className="px-md md:px-lg py-md space-y-lg">
      {/* Header */}
      <section className="space-y-md animate-fade-in-up">
        <div className="flex justify-between items-end">
          <div className="space-y-xs">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Hola, Atleta</h1>
            <p className="text-on-surface-variant font-body-md text-body-md">Hoy toca: {activeRoutine.label}</p>
          </div>
          <div className={`${isDeload ? 'bg-error/20 border-error/30 text-error' : 'bg-secondary-container/10 border-secondary-container/20 text-secondary-fixed'} px-md py-xs rounded-full border flex items-center gap-xs`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isDeload ? 'trending_down' : 'trending_up'}
            </span>
            <span className="font-label-caps text-label-caps">Semana {phaseInfo.weekNumber} · {phaseInfo.phaseLabel}</span>
          </div>
        </div>

        {/* Day picker */}
        <div className="flex justify-between bg-surface p-xs rounded-lg border border-outline-variant">
          {getDaysMap().map(d => {
            const isActive = d.id === selectedDayId;
            const hasDone = completedDates.has(d.id);
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDayId(d.id)}
                className={`flex-1 flex flex-col items-center py-sm rounded-lg transition-all relative ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-lg scale-105'
                    : 'text-on-surface-variant hover:bg-surface-bright cursor-pointer'
                }`}
              >
                <span className={`font-label-caps text-label-caps ${isActive ? 'opacity-80' : 'opacity-60'}`}>{d.lbl}</span>
                <span className="font-stat-value text-stat-value">{d.num}</span>
                {hasDone && !isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#39ff88] opacity-80" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Workout card */}
      <section className="relative overflow-hidden rounded-2xl bg-surface border border-outline-variant shadow-md dark:shadow-none p-lg animate-fade-in-up delay-100">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <div className="flex items-center gap-sm mb-xs flex-wrap">
              <span className="bg-primary/10 text-primary font-label-caps text-label-caps px-sm py-1 rounded-full border border-primary/20 uppercase">
                INTENSIDAD {activeRoutine.intensity}
              </span>
              {lastSession && (
                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-label-caps text-label-caps px-sm py-1 rounded-full border border-emerald-200 dark:border-emerald-700/40 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                  Completado esta semana
                </span>
              )}
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{activeRoutine.label}</h2>
            {(activeRoutine.note) && (
              <p className="text-on-surface-variant font-body-md text-body-md mt-sm leading-relaxed max-w-prose">
                {activeRoutine.note}
              </p>
            )}
            <div className="flex items-center gap-md mt-sm text-on-surface-variant">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-body-md text-body-md">~60 min</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">fitness_center</span>
                <span className="font-body-md text-body-md">{activeRoutine.exercises.length} Ejercicios</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="relative w-full md:w-auto shrink-0 h-[64px] px-lg bg-primary text-white rounded-xl font-headline-md text-headline-md shadow-lg shadow-primary/30 flex items-center justify-center gap-md active:scale-95 transition-all overflow-hidden group hover:opacity-90 mt-sm md:mt-0"
          >
            <div className="absolute inset-0 bg-white/10 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="material-symbols-outlined text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            <span className="tracking-wide text-lg md:text-xl font-bold whitespace-nowrap">EMPEZAR</span>
          </button>
        </div>
      </section>

      {/* Exercise list */}
      <section className="space-y-md">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">Lista de Ejercicios</h3>
          <span className="text-on-surface-variant font-label-caps text-label-caps">{activeRoutine.exercises.length} ejercicios</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md pb-24">
          {activeRoutine.exercises.map((ex: any, idx: number) => {
            const delayClass = idx < 7 ? `delay-${[75, 100, 150, 200, 300, 400, 500][idx]}` : 'delay-500';
            const perSide = ex.perSide ? ' c/lado' : '';
            return (
              <div
                key={ex.id}
                className={`bg-surface border border-outline-variant rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer group animate-fade-in-up ${delayClass}`}
              >
                <div className="aspect-video w-full overflow-hidden bg-surface-bright">
                  <ImageCarousel images={ex.imageUrls || (ex.imageUrl ? [ex.imageUrl] : [])} alt={ex.name} />
                </div>
                <div className="p-md flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 bg-surface-bright rounded-lg flex items-center justify-center text-primary border border-outline-variant shrink-0">
                      <span className="material-symbols-outlined text-2xl">exercise</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-stat-value text-stat-value text-on-surface">{ex.name}</p>
                      <div className="flex items-center gap-sm flex-wrap">
                        <p className="text-on-surface-variant font-body-md text-body-md">
                          {formatReps(ex)}{perSide}
                        </p>
                        {ex.restSeconds && (
                          <span className="flex items-center gap-0.5 text-outline font-label-caps text-label-caps">
                            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>timer</span>
                            {formatRest(ex.restSeconds)}
                          </span>
                        )}
                      </div>
                      {ex.notes && (
                        <p className="text-outline font-label-caps text-label-caps italic mt-0.5 line-clamp-1">"{ex.notes}"</p>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors shrink-0">chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
