'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutSession, ExerciseLog } from '@/hooks/useWorkoutSession';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useTimer } from '@/hooks/useTimer';
import { useRoutine } from '@/hooks/useRoutine';
import { useWakeLock } from '@/hooks/useWakeLock';
import { ImageCarousel } from '@/components/ImageCarousel';
import { ExerciseModal } from '@/components/ExerciseModal';
import { WorkoutSummaryModal, WorkoutSummaryData } from '@/components/WorkoutSummaryModal';
import confetti from 'canvas-confetti';

/** Format rest seconds to a readable label */
function formatRest(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s === 0 ? `${m}min` : `${m}:${s.toString().padStart(2, '0')}`;
}

/** Get the correct unit label for an exercise */
function getUnit(ex: Record<string, unknown>): string {
  return (ex.unit as string) || 'reps';
}

/** Format reps goal string */
function formatGoal(ex: Record<string, unknown>): string {
  const unit = getUnit(ex);
  const reps =
    ex.reps != null ? `${ex.reps}` : `${ex.repsMin}-${ex.repsMax}`;
  const side = ex.perSide ? ' c/lado' : '';
  return `${ex.sets}×${reps} ${unit}${side}`;
}

export default function Workout() {
  const router = useRouter();
  const { session, isLoaded: sessionLoaded, logSet, addSet, removeSet, finishSession } = useWorkoutSession();
  const { getLastWeight, getMaxWeight } = useWorkoutHistory();
  const { routine, isLoaded: routineLoaded } = useRoutine();
  const timer = useTimer();
  const { isLocked: isScreenAwake } = useWakeLock(true);
  const [activeRoutine, setActiveRoutine] = useState<Record<string, unknown> | null>(null);
  const [prCelebrated, setPrCelebrated] = useState<Record<string, boolean>>({});
  const [prMessage, setPrMessage] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Record<string, unknown> | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<WorkoutSummaryData | null>(null);

  useEffect(() => {
    if (!sessionLoaded || !routineLoaded) return;
    if (!session) {
      router.push('/');
      return;
    }
    if (!routine) return;
    
    let dayRoutine: any = null;
    if ((routine as any).phases) {
      for (const p of (routine as any).phases) {
        const found = p.days.find((d: any) => d.id === session.dayId);
        if (found) { dayRoutine = found; break; }
      }
    } else if ((routine as any).days) {
      dayRoutine = (routine as any).days.find((r: any) => r.id === session.dayId);
    }
    
    if (!dayRoutine) {
      router.push('/');
      return;
    }
    setActiveRoutine(dayRoutine);
  }, [session, sessionLoaded, routine, routineLoaded, router]);

  // Pre-fill weights from history when session & history are both ready
  useEffect(() => {
    if (!session || !activeRoutine) return;
    const exercises = activeRoutine.exercises as Record<string, unknown>[];
    exercises.forEach((ex) => {
      const lastWeight = getLastWeight(ex.id as string);
      if (!lastWeight) return;
      const exLog = session.exerciseLogs.find((l: ExerciseLog) => l.exerciseId === ex.id);
      if (!exLog) return;
      exLog.sets.forEach((set: { weightKg?: string, setNumber: number }) => {
        if (!set.weightKg) {
          logSet(ex.id as string, set.setNumber, { weightKg: lastWeight });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoutine]);

  if (!sessionLoaded || !routineLoaded || !session || !activeRoutine) return null;

  // --- Progress calculation ---
  const totalSets = session.exerciseLogs.reduce((acc: number, log: ExerciseLog) => acc + log.sets.length, 0);
  const completedSets = session.exerciseLogs.reduce(
    (acc: number, log: ExerciseLog) => acc + log.sets.filter((s: { completed: boolean }) => s.completed).length,
    0
  );
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleFinish = () => {
    if (!confirm('¿Seguro que deseas finalizar el entrenamiento?')) return;

    const durationSecs = Math.floor((Date.now() - (session?.startTime ?? Date.now())) / 1000);

    // Compute summary stats
    let totalVolume = 0;
    let totalSetsCompleted = 0;
    let starExercise = { name: '', weight: 0 };
    const exercisesDef = activeRoutine.exercises as Record<string, unknown>[];

    session?.exerciseLogs.forEach((log: ExerciseLog) => {
      const exDef = exercisesDef.find((e) => e.id === log.exerciseId);
      log.sets.forEach((set: { completed: boolean, isWarmup?: boolean, weightKg?: string, repsDone?: string }) => {
        if (!set.completed || set.isWarmup) return;
        totalSetsCompleted++;
        const w = parseFloat(set.weightKg || '0');
        const r = parseInt(set.repsDone || '0', 10);
        if (!isNaN(w) && !isNaN(r)) totalVolume += w * r;
        if (!isNaN(w) && w > starExercise.weight) {
          starExercise = { name: (exDef?.name as string) ?? '', weight: w };
        }
      });
    });

    const dayLabel = (activeRoutine.label as string) ?? session?.dayId ?? 'Entrenamiento';

    setSummaryData({ durationSecs, totalVolume: Math.round(totalVolume), totalSetsCompleted, starExercise, dayLabel });
    finishSession();
    timer.stop();
    setShowSummary(true);

    // Burst of confetti
    confetti({ particleCount: 220, spread: 100, origin: { y: 0.55 }, colors: ['#a22c29', '#d6d5c9', '#b9baa3', '#16a34a', '#d97706'] });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.2 }, colors: ['#fafaf7', '#d6d5c9'] }), 400);
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.8 }, colors: ['#fafaf7', '#b9baa3'] }), 700);
  };

  const handleSetToggle = (exId: string, setNum: number, _restSecs: number, currentCompleted: boolean) => {
    const newState = !currentCompleted;
    logSet(exId, setNum, { completed: newState });
    
    // Set 3 minutes (180s) default rest as requested
    const restSecs = 180;
    
    if (newState && restSecs > 0) {
      timer.start(restSecs);
    }

    if (newState && session) {
      const exState = session.exerciseLogs.find((l: ExerciseLog) => l.exerciseId === exId);
      const targetSet = exState?.sets.find((s: { setNumber: number }) => s.setNumber === setNum);
      if (targetSet?.weightKg) {
        const weight = parseFloat(targetSet.weightKg);
        const historicalMax = getMaxWeight(exId);
        
        if (!isNaN(weight) && historicalMax > 0 && weight > historicalMax && !prCelebrated[exId]) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#16a34a', '#a22c29', '#d97706']
          });
          setPrCelebrated(prev => ({ ...prev, [exId]: true }));
          setPrMessage(`¡NUEVO PR: ${weight}kg!`);
          setTimeout(() => setPrMessage(null), 4000);
        }
      }
    }

    // Vibrate briefly on set completion
    if (newState && 'vibrate' in navigator) {
      navigator.vibrate(40);
    }
  };

  const exercises = activeRoutine.exercises as Record<string, unknown>[];

  return (
    <>
      {/* ── POST-WORKOUT SUMMARY MODAL (STRAPA / WRAPPED STYLE) ────── */}
      {showSummary && summaryData && (
        <WorkoutSummaryModal
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
          data={summaryData}
        />
      )}

      {/* PR Toast Message */}
      {prMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up bg-surface border-2 border-warning text-warning px-lg py-sm rounded-full shadow-[0_0_20px_rgba(217,119,6,0.3)] flex items-center gap-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>social_leaderboard</span>
          <span className="text-headline-sm">{prMessage}</span>
        </div>
      )}

      <div className="px-md py-lg pb-[200px] max-w-4xl mx-auto">
        {/* Workout Header Bar with WakeLock status */}
        <div className="flex items-center justify-between bg-surface border border-outline-variant/40 rounded-2xl px-4 py-3 mb-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase block">ENTRENAMIENTO ACTIVO</span>
            <h1 className="text-lg font-bold text-on-surface capitalize">{(activeRoutine.label as string) || 'Sesión'}</h1>
          </div>

          <div className="flex items-center gap-2">
            {isScreenAwake && (
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold" title="La pantalla permanecerá encendida durante el entrenamiento">
                <span className="material-symbols-outlined text-xs animate-pulse">lock_open</span>
                <span className="hidden sm:inline">Pantalla Activa</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-md">
          {exercises.map((ex, exIdx: number) => {
            const exState = session.exerciseLogs.find((l: ExerciseLog) => l.exerciseId === ex.id);
            if (!exState) return null;

            const isFirstWarmup = Boolean(exIdx === 0 && ex.isWarmup);
            const isFirstMain = Boolean(!ex.isWarmup && (exIdx === 0 || exercises[exIdx - 1].isWarmup));

            const completedCount = exState.sets.filter((s: { completed: boolean }) => s.completed).length;
            const allDone = completedCount === exState.sets.length && exState.sets.length > 0;

            return (
              <div key={ex.id as string} className="contents">
                {isFirstWarmup && (
                  <div className="flex items-center gap-sm mt-4 mb-2 animate-fade-in-up">
                    <span className="material-symbols-outlined text-warning">local_fire_department</span>
                    <h3 className="text-headline-sm text-warning tracking-tight">Calentamiento</h3>
                    <div className="flex-1 h-px bg-outline-variant/50 ml-sm"></div>
                  </div>
                )}
                {isFirstMain && (
                  <div className="flex items-center gap-sm mt-8 mb-2 animate-fade-in-up">
                    <span className="material-symbols-outlined text-primary">fitness_center</span>
                    <h3 className="text-headline-sm text-primary tracking-tight">Entrenamiento</h3>
                    <div className="flex-1 h-px bg-outline-variant/50 ml-sm"></div>
                  </div>
                )}
                <section
                  className={`
                    rounded-2xl shadow-sm dark:shadow-none border overflow-hidden
                    transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    animate-fade-in-up
                    ${allDone ? 'bg-surface-bright border-primary/30' : 'bg-surface border-outline-variant'}
                  `}
                  style={{ animationDelay: `${exIdx * 50}ms` }}
                >
                  {/* Exercise header */}
                  <div className="p-md flex justify-between items-start">
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-sm">
                        <h2 className="text-headline-md text-on-surface tracking-tight leading-tight">{ex.name as string}</h2>
                        <button 
                          onClick={() => setSelectedExercise(ex)} 
                          className="text-primary hover:bg-surface-bright active:scale-95 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] w-8 h-8 flex items-center justify-center bg-primary-soft rounded-full"
                          title="Ver técnica detallada"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>psychology</span>
                        </button>
                        {allDone && (
                          <span className="material-symbols-outlined text-success text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        )}
                      </div>
                      <span className="text-on-surface-variant text-label-caps mt-sm">
                        OBJETIVO: {formatGoal(ex)}
                      </span>
                      {!!ex.notes && (
                        <span className="text-outline text-label-caps italic mt-1 bg-outline-variant/10 px-2 py-0.5 rounded inline-block">
                          💡 {ex.notes as string}
                        </span>
                      )}
                    </div>
                    {!!ex.restSeconds && (
                      <span className="flex items-center gap-1 text-outline text-label-caps shrink-0 ml-sm bg-surface-bright px-2 py-1 rounded-lg border border-outline-variant/50">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
                        {formatRest(ex.restSeconds as number)}
                      </span>
                    )}
                  </div>

                  {/* Exercise GIF carousel */}
                  {Boolean(((ex.imageUrls as string[])?.length > 0 || ex.imageUrl)) && (() => {
                    const imgs: string[] = (ex.imageUrls as string[])?.length > 0 ? (ex.imageUrls as string[]) : [ex.imageUrl as string];
                    return (
                      <div className="relative w-full bg-surface-bright overflow-hidden group/carousel" style={{ aspectRatio: '21/9' }}>
                        <ImageCarousel images={imgs} alt={ex.name as string} showLabels />
                      </div>
                    );
                  })()}

                  {/* Sets list */}
                  <div className="px-md pb-md pt-sm flex flex-col gap-sm">
                    {exState.sets.map((set: { setNumber: number, completed: boolean, isWarmup?: boolean, weightKg?: string, repsDone?: string }) => {
                      const isChecked = set.completed;
                      return (
                        <div
                          key={set.setNumber}
                          className={`
                            border rounded-xl p-3 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                            ${isChecked ? 'bg-primary-soft/50 border-primary/30' : 'bg-surface border-outline-variant shadow-sm dark:shadow-none'}
                            ${set.isWarmup ? 'border-dashed border-warning/50' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between gap-3">
                            
                            {/* Set number */}
                            <div className="flex flex-col items-center justify-center w-8 shrink-0">
                              <span className="text-[10px] text-on-surface-variant text-label-caps opacity-80">SET</span>
                              <span className={`font-mono text-lg font-bold ${isChecked ? 'text-primary' : 'text-on-surface-variant'}`}>{set.setNumber}</span>
                            </div>

                            {/* Weight */}
                            <div className="flex flex-col flex-1 max-w-[140px]">
                              <span className="text-[10px] text-on-surface-variant text-label-caps mb-1 opacity-80 pl-1">PESO (KG)</span>
                              <div className="flex items-center bg-surface-bright rounded-lg h-12 border border-outline-variant focus-within:border-primary transition-colors">
                                <button 
                                  onClick={() => {
                                    const current = parseFloat(set.weightKg || '0') || 0;
                                    logSet(ex.id as string, set.setNumber, { weightKg: Math.max(0, current - 2.5).toString() });
                                  }}
                                  className="w-10 h-full flex items-center justify-center text-primary active:scale-[0.9] transition-transform hover:bg-surface-container rounded-l-lg"
                                >
                                  <span className="material-symbols-outlined text-sm font-bold">remove</span>
                                </button>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  className="w-full bg-transparent border-none text-center font-mono text-xl font-bold text-on-surface focus:ring-0 p-0"
                                  placeholder="0"
                                  value={set.weightKg || ''}
                                  onChange={(e) => logSet(ex.id as string, set.setNumber, { weightKg: e.target.value })}
                                />
                                <button 
                                  onClick={() => {
                                    const current = parseFloat(set.weightKg || '0') || 0;
                                    logSet(ex.id as string, set.setNumber, { weightKg: (current + 2.5).toString() });
                                  }}
                                  className="w-10 h-full flex items-center justify-center text-primary active:scale-[0.9] transition-transform hover:bg-surface-container rounded-r-lg"
                                >
                                  <span className="material-symbols-outlined text-sm font-bold">add</span>
                                </button>
                              </div>
                            </div>

                            {/* Reps */}
                            <div className="flex flex-col flex-1 max-w-[80px]">
                              <span className="text-[10px] text-on-surface-variant text-label-caps mb-1 opacity-80 pl-1">REPS</span>
                              <div className="flex items-center bg-surface-bright rounded-lg h-12 border border-outline-variant focus-within:border-primary transition-colors">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  className="w-full bg-transparent border-none text-center font-mono text-xl font-bold text-on-surface focus:ring-0 p-0"
                                  placeholder="0"
                                  value={set.repsDone || ''}
                                  onChange={(e) => logSet(ex.id as string, set.setNumber, { repsDone: e.target.value })}
                                />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 shrink-0">
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => logSet(ex.id as string, set.setNumber, { isWarmup: !set.isWarmup })}
                                  className={`
                                    w-8 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-colors
                                    ${set.isWarmup ? 'bg-warning-soft text-warning border border-warning/30' : 'bg-surface-bright text-on-surface-variant border border-outline-variant'}
                                  `}
                                  title="Marcar como calentamiento"
                                >
                                  W
                                </button>
                                <button
                                  onClick={() => removeSet(ex.id as string, set.setNumber)}
                                  className="w-8 h-6 flex items-center justify-center rounded text-[10px] font-bold bg-error-container/20 text-error hover:bg-error-container/40 transition-colors"
                                  title="Eliminar serie"
                                >
                                  <span className="material-symbols-outlined" style={{fontSize: 14}}>delete</span>
                                </button>
                              </div>
                              <button
                                onClick={() => handleSetToggle(ex.id as string, set.setNumber, (ex.restSeconds as number) || 60, isChecked)}
                                className={`
                                  h-10 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                                  active:scale-95 text-label-caps tracking-wider
                                  ${isChecked 
                                    ? 'bg-primary text-on-primary shadow-sm shadow-primary/25 border border-primary/20' 
                                    : 'bg-surface-bright text-on-surface-variant border border-outline-variant hover:border-primary/50 hover:text-primary'}
                                `}
                              >
                                {isChecked ? 'LISTO' : 'HECHO'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => addSet(ex.id as string)}
                      className="
                        mt-xs py-sm flex items-center justify-center gap-xs rounded-xl
                        border border-dashed border-outline-variant text-on-surface-variant
                        hover:text-primary hover:border-primary/50 hover:bg-primary-soft/50
                        transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                        text-label-caps active:scale-[0.98]
                      "
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      AÑADIR SERIE
                    </button>
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rest timer */}
      {timer.isActive && (
        <div className="fixed bottom-[104px] md:bottom-24 left-0 w-full z-40 px-md animate-slide-up pointer-events-none">
          <div className="max-w-xl mx-auto bg-surface rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-primary/30 p-md flex flex-col items-center timer-glow pointer-events-auto">
            <div className="flex items-center gap-md w-full justify-between">
              <div className="flex flex-col">
                <span className="text-label-caps text-primary opacity-90">DESCANSO</span>
                <div className="font-timer-display text-5xl md:text-6xl text-on-surface leading-none mt-1">
                  {timer.remainingSecs !== null ? timer.format(timer.remainingSecs) : '00:00'}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => timer.addTime(-30)} className="text-xs bg-surface-bright text-on-surface/80 px-2 py-1 rounded-md border border-outline-variant hover:bg-surface-bright/80 active:scale-95 transition-all">-30s</button>
                  <button onClick={() => timer.addTime(30)} className="text-xs bg-surface-bright text-on-surface/80 px-2 py-1 rounded-md border border-outline-variant hover:bg-surface-bright/80 active:scale-95 transition-all">+30s</button>
                </div>
              </div>
              <button
                onClick={timer.stop}
                className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-md h-12 text-label-caps active:scale-95 transition-all flex items-center gap-xs border border-primary/20"
              >
                <span className="material-symbols-outlined text-sm">timer_off</span>
                Saltar
              </button>
            </div>
            <div className="w-full h-1.5 bg-surface-bright rounded-full mt-md overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${((timer.remainingSecs || 0) / timer.totalSecs) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar with progress */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-t border-outline-variant px-md md:px-lg py-sm pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.4)] animate-slide-up">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-bright rounded-full mb-sm overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center text-success border border-success/20">
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">PROGRESO</span>
                <span className="text-stat-value text-success">
                  {completedSets}/{totalSets} series
                </span>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="
                bg-primary text-on-primary rounded-xl px-lg h-12 text-headline-sm flex items-center gap-sm
                active:scale-95 hover:brightness-110
                transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                shadow-lg shadow-primary/20
              "
            >
              <span className="material-symbols-outlined">check_circle</span>
              Finalizar
            </button>
          </div>
        </div>
      </nav>

      <ExerciseModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exerciseName={(selectedExercise?.name as string) || ""}
        exerciseData={selectedExercise}
      />
    </>
  );
}
