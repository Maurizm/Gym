'use client';

import { useState } from 'react';
import { useRoutine } from '@/hooks/useRoutine';
import { useRouter } from 'next/navigation';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { ImageCarousel } from '@/components/ImageCarousel';

// Color palette per day — vibrant but clean
const DAY_CONFIG: Record<string, {
  label: string;
  short: string;
  accent: string;
  bg: string;
  icon: string;
}> = {
  monday:    { label: 'Lunes',     short: 'LUN', accent: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-950/30',   icon: 'exercise' },
  tuesday:   { label: 'Martes',    short: 'MAR', accent: '#0ea5e9', bg: 'bg-sky-50 dark:bg-sky-950/30',         icon: 'exercise' },
  wednesday: { label: 'Miércoles', short: 'MIÉ', accent: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'exercise' },
  thursday:  { label: 'Jueves',    short: 'JUE', accent: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/30',     icon: 'exercise' },
  friday:    { label: 'Viernes',   short: 'VIE', accent: '#ef4444', bg: 'bg-rose-50 dark:bg-rose-950/30',       icon: 'exercise' },
  saturday:  { label: 'Sábado',    short: 'SÁB', accent: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-950/30',   icon: 'exercise' },
  sunday:    { label: 'Domingo',   short: 'DOM', accent: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-950/30',       icon: 'exercise' },
};

function formatGoal(ex: any): string {
  const unit = ex.unit || 'reps';
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
  const { routine, isLoaded } = useRoutine();
  const { startSession } = useWorkoutSession();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  if (!isLoaded || !routine) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">refresh</span>
      </div>
    );
  }

  const handleStart = (day: any) => {
    startSession(day);
    router.push('/workout');
  };

  const activeDay = routine.days.find((d: any) => d.id === selectedDay);

  return (
    <div className="px-md md:px-lg py-lg pb-32 space-y-lg animate-fade-in-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-md">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Mi Rutina
          </h1>
          <p className="text-on-surface-variant font-body-md text-body-md mt-xs">
            {routine.days.reduce((acc: number, d: any) => acc + d.exercises.length, 0)} ejercicios · 7 días
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-surface border border-outline-variant rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`px-md py-xs rounded-md font-label-caps text-label-caps transition-all flex items-center gap-xs ${
              viewMode === 'week'
                ? 'bg-on-surface text-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">calendar_view_week</span>
            Semana
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-md py-xs rounded-md font-label-caps text-label-caps transition-all flex items-center gap-xs ${
              viewMode === 'day'
                ? 'bg-on-surface text-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_day</span>
            Día
          </button>
        </div>
      </div>

      {/* ── WEEK VIEW ──────────────────────────────────────────── */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
          {routine.days.map((day: any, dayIdx: number) => {
            const cfg = DAY_CONFIG[day.id] ?? DAY_CONFIG.monday;
            return (
              <div
                key={day.id}
                className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${dayIdx * 60}ms` }}
              >
                {/* Day Header */}
                <div className={`${cfg.bg} p-md border-b border-outline-variant/50`}>
                  <div className="flex items-center justify-between mb-xs">
                    <span
                      className="text-xs font-bold tracking-[0.15em] font-mono opacity-70"
                      style={{ color: cfg.accent }}
                    >
                      {cfg.short}
                    </span>
                    <span
                      className="text-xs font-label-caps font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: cfg.accent + '22', color: cfg.accent }}
                    >
                      {day.exercises.length} ej.
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface leading-tight">
                    {cfg.label}
                  </h2>
                  <p className="text-on-surface-variant text-xs mt-xs leading-snug line-clamp-2">
                    {day.label}
                  </p>
                  {(day.intensity) && (
                    <span
                      className="inline-block mt-sm text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase"
                      style={{ backgroundColor: cfg.accent + '18', color: cfg.accent }}
                    >
                      {day.intensity}
                    </span>
                  )}
                </div>

                {/* Exercise List */}
                <div className="flex-1 divide-y divide-outline-variant/40 px-md">
                  {day.exercises.length === 0 ? (
                    <div className="py-lg text-center text-on-surface-variant font-body-md text-body-md">
                      Descanso activo
                    </div>
                  ) : (
                    day.exercises.map((ex: any, i: number) => (
                      <div key={ex.id} className="py-sm flex items-start gap-sm">
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono mt-0.5"
                          style={{ backgroundColor: cfg.accent + '20', color: cfg.accent }}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-body-md text-body-md text-on-surface leading-snug">{ex.name}</p>
                          <div className="flex flex-wrap items-center gap-xs mt-0.5">
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              {formatGoal(ex)}
                            </span>
                            {ex.restSeconds && (
                              <span className="flex items-center gap-0.5 text-[10px] text-on-surface-variant opacity-60">
                                <span className="material-symbols-outlined" style={{ fontSize: 10 }}>timer</span>
                                {formatRest(ex.restSeconds)}
                              </span>
                            )}
                            {ex.perSide && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: cfg.accent + '18', color: cfg.accent }}>
                                c/lado
                              </span>
                            )}
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-on-surface-variant italic opacity-70 mt-0.5 line-clamp-1">
                              💡 {ex.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Start Button */}
                {day.exercises.length > 0 && (
                  <div className="p-md pt-sm">
                    <button
                      onClick={() => handleStart(day)}
                      className="w-full py-sm rounded-xl font-label-caps text-label-caps text-white font-bold tracking-wider transition-all active:scale-95 hover:opacity-90 flex items-center justify-center gap-xs"
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
            {routine.days.map((day: any) => {
              const cfg = DAY_CONFIG[day.id] ?? DAY_CONFIG.monday;
              const isActive = selectedDay === day.id;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-0.5 px-md py-sm rounded-xl border transition-all"
                  style={isActive
                    ? { backgroundColor: cfg.accent, borderColor: cfg.accent, color: '#fff' }
                    : { borderColor: 'var(--color-outline-variant)' }
                  }
                >
                  <span className={`text-[10px] font-bold tracking-widest font-mono ${isActive ? 'text-white/80' : 'text-on-surface-variant'}`}>
                    {cfg.short}
                  </span>
                  <span className={`font-stat-value text-stat-value font-bold ${isActive ? 'text-white' : 'text-on-surface'}`}>
                    {day.exercises.length}
                  </span>
                  <span className={`text-[9px] ${isActive ? 'text-white/70' : 'text-on-surface-variant'}`}>ej.</span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Detail */}
          {activeDay && (() => {
            const cfg = DAY_CONFIG[activeDay.id] ?? DAY_CONFIG.monday;
            return (
              <div className="space-y-md animate-fade-in-up">
                {/* Day Info Banner */}
                <div className={`${cfg.bg} rounded-2xl p-lg border border-outline-variant/50`}>
                  <div className="flex items-start justify-between gap-md">
                    <div>
                      <span
                        className="text-xs font-bold tracking-[0.15em] font-mono"
                        style={{ color: cfg.accent }}
                      >
                        {cfg.short} — {cfg.label}
                      </span>
                      <h2 className="font-headline-md text-headline-md text-on-surface mt-xs">
                        {activeDay.label}
                      </h2>
                      {(activeDay.note) && (
                        <p className="text-on-surface-variant font-body-md text-body-md mt-sm leading-relaxed max-w-prose">
                          {activeDay.note}
                        </p>
                      )}
                    </div>
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: cfg.accent + '22' }}
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ color: cfg.accent, fontVariationSettings: "'FILL' 1" }}>
                        fitness_center
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-md mt-md flex-wrap">
                    <span
                      className="flex items-center gap-xs text-xs font-bold px-sm py-xs rounded-full"
                      style={{ backgroundColor: cfg.accent + '18', color: cfg.accent }}
                    >
                      <span className="material-symbols-outlined text-sm">fitness_center</span>
                      {activeDay.exercises.length} ejercicios
                    </span>
                    {(activeDay.intensity) && (
                      <span
                        className="text-xs font-bold tracking-wide px-sm py-xs rounded-full"
                        style={{ backgroundColor: cfg.accent + '18', color: cfg.accent }}
                      >
                        {activeDay.intensity}
                      </span>
                    )}
                    <span
                      className="flex items-center gap-xs text-xs font-bold px-sm py-xs rounded-full"
                      style={{ backgroundColor: cfg.accent + '18', color: cfg.accent }}
                    >
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      ~60 min
                    </span>
                  </div>
                </div>

                {/* Exercise Cards with full image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {activeDay.exercises.map((ex: any, i: number) => {
                    const images = ex.imageUrls && ex.imageUrls.length > 0
                      ? ex.imageUrls
                      : ex.imageUrl ? [ex.imageUrl] : [];

                    return (
                      <div
                        key={ex.id}
                        className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all animate-fade-in-up"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        {/* Full-height image area */}
                        <div className="relative w-full bg-surface-bright" style={{ aspectRatio: '16/9' }}>
                          {images.length > 0 ? (
                            <div className="absolute inset-0 group">
                              <ImageCarousel images={images} alt={ex.name} />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                              🏋️
                            </div>
                          )}

                          {/* Number badge over image */}
                          <div
                            className="absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center font-mono text-sm font-bold shadow-md z-10"
                            style={{ backgroundColor: cfg.accent, color: '#fff' }}
                          >
                            {i + 1}
                          </div>

                          {/* Multi-image indicator */}
                          {images.length > 1 && (
                            <div
                              className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-md z-10"
                              style={{ backgroundColor: cfg.accent + 'dd', color: '#fff' }}
                            >
                              {images.length} vistas
                            </div>
                          )}
                        </div>

                        {/* Exercise info */}
                        <div className="p-md">
                          <p className="font-stat-value text-stat-value text-on-surface leading-snug">{ex.name}</p>

                          <div className="flex flex-wrap items-center gap-xs mt-sm">
                            {/* Sets × Reps pill */}
                            <span
                              className="font-mono text-sm font-bold px-3 py-1 rounded-lg"
                              style={{ backgroundColor: cfg.accent + '15', color: cfg.accent }}
                            >
                              {formatGoal(ex)}
                            </span>

                            {/* Rest time */}
                            {ex.restSeconds && (
                              <span className="flex items-center gap-0.5 text-xs text-on-surface-variant bg-surface-bright px-2 py-1 rounded-lg">
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>timer</span>
                                {formatRest(ex.restSeconds)} descanso
                              </span>
                            )}
                          </div>

                          {/* Coach note */}
                          {ex.notes && (
                            <div
                              className="mt-sm flex items-start gap-xs p-sm rounded-lg text-xs"
                              style={{ backgroundColor: cfg.accent + '10', color: cfg.accent }}
                            >
                              <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5" style={{ fontSize: 14 }}>
                                tips_and_updates
                              </span>
                              <p className="leading-relaxed">{ex.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Start Session CTA */}
                {activeDay.exercises.length > 0 && (
                  <button
                    onClick={() => handleStart(activeDay)}
                    className="w-full h-16 rounded-2xl font-headline-md text-headline-md text-white font-bold tracking-wide flex items-center justify-center gap-md active:scale-95 transition-all shadow-lg hover:opacity-90"
                    style={{
                      backgroundColor: cfg.accent,
                      boxShadow: `0 8px 32px ${cfg.accent}55`
                    }}
                  >
                    <span className="material-symbols-outlined text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_circle
                    </span>
                    EMPEZAR ENTRENAMIENTO
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
