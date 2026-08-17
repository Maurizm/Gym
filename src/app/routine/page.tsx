'use client';

import { useState, useRef, useCallback } from 'react';
import { useRoutine } from '@/hooks/useRoutine';
import { useRouter } from 'next/navigation';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { ImageCarousel } from '@/components/ImageCarousel';
import { ExerciseModal } from '@/components/ExerciseModal';

// Color palette per day
const DAY_CONFIG: Record<string, {
  label: string;
  short: string;
  accent: string;
  icon: string;
}> = {
  monday:    { label: 'Lunes',     short: 'LUN', accent: '#a22c29', icon: 'exercise' },
  tuesday:   { label: 'Martes',    short: 'MAR', accent: '#0ea5e9', icon: 'exercise' },
  wednesday: { label: 'Miércoles', short: 'MIÉ', accent: '#16a34a', icon: 'exercise' },
  thursday:  { label: 'Jueves',    short: 'JUE', accent: '#d97706', icon: 'exercise' },
  friday:    { label: 'Viernes',   short: 'VIE', accent: '#902923', icon: 'exercise' },
  saturday:  { label: 'Sábado',    short: 'SÁB', accent: '#8b5cf6', icon: 'exercise' },
  sunday:    { label: 'Domingo',   short: 'DOM', accent: '#b9baa3', icon: 'exercise' },
};

function formatGoal(ex: Record<string, unknown>): string {
  const unit = (ex.unit as string) || 'reps';
  const reps = ex.reps != null ? `${ex.reps}` : `${ex.repsMin}–${ex.repsMax}`;
  const perSide = ex.perSide ? ' c/lado' : '';
  return `${ex.sets} × ${reps} ${unit}${perSide}`;
}

function formatRest(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s === 0 ? `${m}min` : `${m}:${s.toString().padStart(2, '0')}`;
}

type ViewMode = 'week' | 'day';

export default function RoutinePage() {
  const { routine, isLoaded, currentPhase, phases, currentWeek } = useRoutine();
  const { startSession } = useWorkoutSession();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedExercise, setSelectedExercise] = useState<Record<string, unknown> | null>(null);
  const [viewPhaseId, setViewPhaseId] = useState<string>('');

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

  const activePhaseId = viewPhaseId || (currentPhase?.id ?? '');
  const activePhase = phases.find(p => p.id === activePhaseId) || currentPhase;

  if (!isLoaded || !routine || !activePhase) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  const handleStart = (day: any) => {
    startSession(day);
    router.push('/workout');
  };

  const activeDay = activePhase.days.find((d) => d.id === selectedDay);

  return (
    <div className="px-md md:px-lg py-lg pb-32 space-y-lg max-w-6xl mx-auto animate-fade-in-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-md">
        <div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">
            Mi Rutina
          </h1>
          <p className="text-on-surface-variant text-body-md mt-xs">
            {activePhase.days.reduce((acc: number, d: any) => acc + (d.exercises as unknown[]).length, 0)} ejercicios · 7 días
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-surface border border-outline-variant rounded-xl p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`
              px-md py-xs rounded-lg text-label-caps
              transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              flex items-center gap-xs
              ${viewMode === 'week'
                ? 'bg-on-surface text-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">calendar_view_week</span>
            Semana
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`
              px-md py-xs rounded-lg text-label-caps
              transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              flex items-center gap-xs
              ${viewMode === 'day'
                ? 'bg-on-surface text-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">view_day</span>
            Día
          </button>
        </div>
      </div>

      {phases.length > 1 && (
        <div className="mt-md max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <label className="text-label-caps text-on-surface-variant/80 mb-3 ml-1 block flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">cycle</span>
            Fase del Programa
          </label>
          <div className="relative flex w-full bg-surface border border-outline-variant/30 rounded-[1.25rem] p-1.5 shadow-inner">
            {phases.map(p => {
              const isActive = p.id === activePhaseId;
              const isCurrent = p.id === currentPhase?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setViewPhaseId(p.id)}
                  className={`
                    relative flex-1 py-3 px-2 rounded-xl text-label-caps tracking-wide
                    transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    flex items-center justify-center gap-2 z-10
                    ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10 shadow-sm" />
                  )}
                  {p.name}
                  {isCurrent && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary shadow-[0_0_8px_rgba(162,44,41,0.8)]' : 'bg-on-surface-variant/50'}`} 
                      title="Fase Activa (La que debes hacer hoy)" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WEEK VIEW ──────────────────────────────────────────── */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
          {activePhase.days.map((day: any, dayIdx: number) => {
            const cfg = DAY_CONFIG[day.id as string] ?? DAY_CONFIG.monday;
            const exercises = (day.exercises as unknown[]) || [];
            return (
              <div
                key={day.id as string}
                className="
                  bg-surface border border-outline-variant rounded-2xl overflow-hidden
                  shadow-sm dark:shadow-none
                  hover:border-primary/30 hover:-translate-y-0.5
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  flex flex-col animate-fade-in-up
                "
                style={{ animationDelay: `${dayIdx * 60}ms` }}
              >
                {/* Day Header */}
                <div className="p-md border-b border-outline-variant" style={{ backgroundColor: cfg.accent + '08' }}>
                  <div className="flex items-center justify-between mb-xs">
                    <span
                      className="text-xs font-bold tracking-[0.15em] font-mono opacity-70"
                      style={{ color: cfg.accent }}
                    >
                      {cfg.short}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-label-caps"
                      style={{ backgroundColor: cfg.accent + '18', color: cfg.accent }}
                    >
                      {exercises.length} ej.
                    </span>
                  </div>
                  <h2 className="text-headline-md text-on-surface leading-tight">
                    {cfg.label}
                  </h2>
                  <p className="text-on-surface-variant text-xs mt-xs leading-snug line-clamp-2">
                    {day.label as string}
                  </p>
                  {(day.intensity) && (
                    <span
                      className="inline-block mt-sm text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase"
                      style={{ backgroundColor: cfg.accent + '15', color: cfg.accent }}
                    >
                      {day.intensity as string}
                    </span>
                  )}
                </div>

                {/* Exercise List */}
                <div className="flex-1 divide-y divide-outline-variant px-md">
                  {exercises.length === 0 ? (
                    <div className="py-lg text-center text-on-surface-variant text-body-md">
                      Descanso activo
                    </div>
                  ) : (
                    exercises.map((ex: any, i: number) => (
                      <div key={ex.id as string} className="py-sm flex items-start gap-sm">
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono mt-0.5"
                          style={{ backgroundColor: cfg.accent + '18', color: cfg.accent }}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-md text-on-surface leading-snug">{ex.name as string}</p>
                          <div className="flex flex-wrap items-center gap-xs mt-0.5">
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              {formatGoal(ex)}
                            </span>
                            {!!ex.restSeconds && (
                              <span className="flex items-center gap-0.5 text-[10px] text-on-surface-variant opacity-60">
                                <span className="material-symbols-outlined" style={{ fontSize: 10 }}>timer</span>
                                {formatRest(ex.restSeconds as number)}
                              </span>
                            )}
                            {!!ex.perSide && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: cfg.accent + '15', color: cfg.accent }}>
                                c/lado
                              </span>
                            )}
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-on-surface-variant italic opacity-70 mt-0.5 line-clamp-1">
                              💡 {ex.notes as string}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Start Button */}
                {exercises.length > 0 && (
                  <div className="p-md pt-sm">
                    <button
                      onClick={() => handleStart(day)}
                      className="
                        w-full py-sm rounded-xl text-label-caps text-white font-bold tracking-wider
                        transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                        active:scale-[0.97] hover:brightness-110
                        flex items-center justify-center gap-xs
                      "
                      style={{ backgroundColor: cfg.accent }}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_circle
                      </span>
                      EMPEZAR
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── DAY VIEW ───────────────────────────────────────────── */}
      {viewMode === 'day' && (
        <div className="space-y-lg">
          {/* Day Selector Scroll */}
          <div className="flex gap-sm overflow-x-auto pb-xs no-scrollbar -mx-md px-md">
            {activePhase.days.map((day: any) => {
              const cfg = DAY_CONFIG[day.id as string] ?? DAY_CONFIG.monday;
              const isActive = selectedDay === day.id;
              const exercises = day.exercises as unknown[];
              return (
                <button
                  key={day.id as string}
                  onClick={() => setSelectedDay(day.id as string)}
                  className={`
                    flex-shrink-0 flex flex-col items-center gap-0.5 px-md py-sm rounded-xl border
                    transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                    active:scale-[0.95]
                  `}
                  style={isActive
                    ? { backgroundColor: cfg.accent, borderColor: cfg.accent, color: '#fff' }
                    : { borderColor: 'var(--color-outline-variant)' }
                  }
                >
                  <span className={`text-[10px] font-bold tracking-widest font-mono ${isActive ? 'text-white/80' : 'text-on-surface-variant'}`}>
                    {cfg.short}
                  </span>
                  <span className={`font-mono text-lg font-bold ${isActive ? 'text-white' : 'text-on-surface'}`}>
                    {exercises.length}
                  </span>
                  <span className={`text-[9px] ${isActive ? 'text-white/70' : 'text-on-surface-variant'}`}>ej.</span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Detail */}
          {activeDay && (() => {
            const cfg = DAY_CONFIG[activeDay.id as string] ?? DAY_CONFIG.monday;
            const exercises = activeDay.exercises as unknown as Record<string, unknown>[];
            return (
              <div className="space-y-md animate-fade-in-up">
                {/* Day Info Banner */}
                <div className="rounded-2xl p-lg border border-outline-variant" style={{ backgroundColor: cfg.accent + '08' }}>
                  <div className="flex items-start justify-between gap-md">
                    <div>
                      <span className="text-xs font-bold tracking-[0.15em] font-mono" style={{ color: cfg.accent }}>
                        {cfg.short} — {cfg.label}
                      </span>
                      <h2 className="text-headline-md text-on-surface mt-xs">
                        {activeDay.label as string}
                      </h2>
                      {(activeDay.note) && (
                        <p className="text-on-surface-variant text-body-md mt-sm leading-relaxed max-w-prose">
                          {activeDay.note as string}
                        </p>
                      )}
                    </div>
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: cfg.accent + '18' }}
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ color: cfg.accent, fontVariationSettings: "'FILL' 1" }}>
                        fitness_center
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-md mt-md flex-wrap">
                    <span
                      className="flex items-center gap-xs text-xs font-bold px-sm py-xs rounded-full"
                      style={{ backgroundColor: cfg.accent + '15', color: cfg.accent }}
                    >
                      <span className="material-symbols-outlined text-sm">fitness_center</span>
                      {exercises.length} ejercicios
                    </span>
                    {(activeDay.intensity) && (
                      <span
                        className="text-xs font-bold tracking-wide px-sm py-xs rounded-full"
                        style={{ backgroundColor: cfg.accent + '15', color: cfg.accent }}
                      >
                        {activeDay.intensity as string}
                      </span>
                    )}
                    <span
                      className="flex items-center gap-xs text-xs font-bold px-sm py-xs rounded-full"
                      style={{ backgroundColor: cfg.accent + '15', color: cfg.accent }}
                    >
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      ~60 min
                    </span>
                  </div>
                </div>

                {/* Exercise Cards with full image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {(exercises as any[]).map((ex: any, i: number) => {
                    const images = (ex.imageUrls as string[])?.length > 0
                      ? ex.imageUrls as string[]
                      : ex.imageUrl ? [ex.imageUrl as string] : [];

                    return (
                      <div
                        key={ex.id as string}
                        className="
                          bg-surface border border-outline-variant rounded-2xl overflow-hidden
                          shadow-sm dark:shadow-none
                          hover:border-primary/30
                          transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                          animate-fade-in-up cursor-pointer group
                        "
                        style={{ animationDelay: `${i * 50}ms` }}
                        onClick={() => setSelectedExercise(ex)}
                      >
                        <div className="relative w-full bg-surface-bright" style={{ aspectRatio: '16/9' }}>
                          {images.length > 0 ? (
                            <div className="absolute inset-0 group/carousel">
                              <ImageCarousel images={images} alt={ex.name as string} showLabels />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                              🏋️
                            </div>
                          )}

                          {/* Number badge */}
                          <div
                            className="absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center font-mono text-sm font-bold shadow-md z-10"
                            style={{ backgroundColor: cfg.accent, color: '#fff' }}
                          >
                            {i + 1}
                          </div>

                          {images.length > 1 && (
                            <div
                              className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-md z-10"
                              style={{ backgroundColor: cfg.accent + 'dd', color: '#fff' }}
                            >
                              {images.length} vistas
                            </div>
                          )}
                        </div>

                        <div className="p-md">
                          <p className="text-stat-value text-on-surface leading-snug">{ex.name as string}</p>

                          <div className="flex flex-wrap items-center gap-xs mt-sm">
                            <span
                              className="font-mono text-sm font-bold px-3 py-1 rounded-lg"
                              style={{ backgroundColor: cfg.accent + '12', color: cfg.accent }}
                            >
                              {formatGoal(ex)}
                            </span>

                            {!!ex.restSeconds && (
                              <span className="flex items-center gap-0.5 text-xs text-on-surface-variant bg-surface-bright px-2 py-1 rounded-lg">
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>timer</span>
                                {formatRest(ex.restSeconds as number)} descanso
                              </span>
                            )}
                          </div>

                          {!!ex.notes && (
                            <div
                              className="mt-sm flex items-start gap-xs p-sm rounded-lg text-xs"
                              style={{ backgroundColor: cfg.accent + '0a', color: cfg.accent }}
                            >
                              <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5" style={{ fontSize: 14 }}>
                                tips_and_updates
                              </span>
                              <p className="leading-relaxed">{ex.notes as string}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Start Session CTA */}
                {exercises.length > 0 && (
                  <div className="mt-xl" ref={btnRef}>
                    <button
                      onClick={() => handleStart(activeDay)}
                      className="
                        w-full h-16 rounded-2xl text-headline-md text-white font-bold tracking-wide
                        flex items-center justify-center gap-md
                        active:scale-[0.97] hover:brightness-110
                        transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                        shadow-lg
                      "
                      style={{
                        backgroundColor: cfg.accent,
                        boxShadow: `0 8px 32px ${cfg.accent}40`
                      }}
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_circle
                      </span>
                      EMPEZAR ENTRENAMIENTO
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Floating Action Button (Only visible when main button is scrolled out) */}
      {!isBtnVisible && (
        <button
          onClick={() => {
            const day = activePhase.days.find((d: any) => d.id === selectedDay);
            if (day) handleStart(day);
          }}
          className="
            fixed bottom-[104px] md:bottom-24 right-4 md:right-8 z-50 w-16 h-16 rounded-full flex items-center justify-center
            text-white shadow-xl animate-scale-in hover:brightness-110 active:scale-95 transition-all pointer-events-auto
          "
          style={{
            backgroundColor: DAY_CONFIG[selectedDay]?.accent || '#a22c29',
            boxShadow: `0 8px 32px ${DAY_CONFIG[selectedDay]?.accent || '#a22c29'}80`
          }}
        >
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            play_arrow
          </span>
        </button>
      )}

      <ExerciseModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exerciseName={(selectedExercise?.name as string) || ""}
        exerciseData={selectedExercise}
      />
    </div>
  );
}
