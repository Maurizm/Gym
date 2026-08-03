'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutSession, ExerciseLog } from '@/hooks/useWorkoutSession';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useTimer } from '@/hooks/useTimer';
import { useRoutine } from '@/hooks/useRoutine';
import { ImageCarousel } from '@/components/ImageCarousel';
import { ExerciseModal } from '@/components/ExerciseModal';
import confetti from 'canvas-confetti';

/** Format rest seconds to a readable label */
function formatRest(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s === 0 ? `${m}min` : `${m}:${s.toString().padStart(2, '0')}`;
}

/** Get the correct unit label for an exercise */
function getUnit(ex: any): string {
  return ex.unit || 'reps';
}

/** Format reps goal string */
function formatGoal(ex: any): string {
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
  const [activeRoutine, setActiveRoutine] = useState<any>(null);
  const [prCelebrated, setPrCelebrated] = useState<Record<string, boolean>>({});
  const [prMessage, setPrMessage] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    if (!sessionLoaded || !routineLoaded) return;
    if (!session) {
      router.push('/');
      return;
    }
    if (!routine) return;
    
    const dayRoutine = routine.days.find((r: any) => r.id === session.dayId);
    if (!dayRoutine) {
      router.push('/');
      return;
    }
    setActiveRoutine(dayRoutine);
  }, [session, sessionLoaded, routine, routineLoaded, router]);

  // Pre-fill weights from history when session & history are both ready
  useEffect(() => {
    if (!session || !activeRoutine) return;
    activeRoutine.exercises.forEach((ex: any) => {
      const lastWeight = getLastWeight(ex.id);
      if (!lastWeight) return;
      const exLog = session.exerciseLogs.find((l: ExerciseLog) => l.exerciseId === ex.id);
      if (!exLog) return;
      exLog.sets.forEach(set => {
        if (!set.weightKg) {
          logSet(ex.id, set.setNumber, { weightKg: lastWeight });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoutine]);

  if (!sessionLoaded || !routineLoaded || !session || !activeRoutine) return null;

  // --- Progress calculation ---
  const totalSets = session.exerciseLogs.reduce((acc, log) => acc + log.sets.length, 0);
  const completedSets = session.exerciseLogs.reduce(
    (acc, log) => acc + log.sets.filter(s => s.completed).length,
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

    session?.exerciseLogs.forEach(log => {
      const exDef = activeRoutine?.exercises.find((e: any) => e.id === log.exerciseId);
      log.sets.forEach(set => {
        if (!set.completed || set.isWarmup) return;
        totalSetsCompleted++;
        const w = parseFloat(set.weightKg);
        const r = parseInt(set.repsDone, 10);
        if (!isNaN(w) && !isNaN(r)) totalVolume += w * r;
        if (!isNaN(w) && w > starExercise.weight) {
          starExercise = { name: exDef?.name ?? '', weight: w };
        }
      });
    });

    const dayLabel = activeRoutine?.label ?? session?.dayId ?? 'Entrenamiento';

    setSummaryData({ durationSecs, totalVolume: Math.round(totalVolume), totalSetsCompleted, starExercise, dayLabel });
    finishSession();
    timer.stop();
    setShowSummary(true);

    // Burst of confetti
    confetti({ particleCount: 220, spread: 100, origin: { y: 0.55 }, colors: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ff4d3d'] });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.2 }, colors: ['#fff', '#c7d2fe'] }), 400);
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.8 }, colors: ['#fff', '#a5f3fc'] }), 700);
  };

  const handleSetToggle = (exId: string, setNum: number, restSecs: number, currentCompleted: boolean) => {
    const newState = !currentCompleted;
    logSet(exId, setNum, { completed: newState });
    
    if (newState && restSecs > 0) {
      timer.start(restSecs);
    }

    if (newState && session) {
      const exState = session.exerciseLogs.find(l => l.exerciseId === exId);
      const targetSet = exState?.sets.find(s => s.setNumber === setNum);
      if (targetSet?.weightKg) {
        const weight = parseFloat(targetSet.weightKg);
        const historicalMax = getMaxWeight(exId);
        
        if (!isNaN(weight) && historicalMax > 0 && weight > historicalMax && !prCelebrated[exId]) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#39ff88', '#82f3ff', '#ff4d3d']
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

  return (
    <>
      {/* ── POST-WORKOUT SUMMARY OVERLAY ────────────────────────────── */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in-up px-md">
          <div className="w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden border border-outline-variant animate-fade-in-up">

            {/* Hero header */}
            <div className="bg-gradient-to-br from-primary/30 via-secondary-fixed/10 to-surface-bright px-lg pt-lg pb-md text-center">
              <div className="text-5xl mb-sm">🏆</div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">¡Sesión Completada!</h2>
              <p className="text-on-surface-variant text-sm mt-xs capitalize line-clamp-2">{summaryData.dayLabel}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-xs px-lg py-md">
              {[
                {
                  icon: 'timer', label: 'Duración',
                  value: summaryData.durationSecs >= 3600
                    ? `${Math.floor(summaryData.durationSecs / 3600)}h ${Math.floor((summaryData.durationSecs % 3600) / 60)}m`
                    : `${Math.floor(summaryData.durationSecs / 60)}m`,
                  color: '#0ea5e9',
                },
                {
                  icon: 'done_all', label: 'Series', value: summaryData.totalSetsCompleted, color: '#10b981',
                },
                {
                  icon: 'scale', label: 'Volumen', value: summaryData.totalVolume > 0 ? `${summaryData.totalVolume.toLocaleString('es')}kg` : '—', color: '#6366f1',
                },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="flex flex-col items-center gap-xs bg-surface-bright rounded-2xl py-md px-sm text-center">
                  <span className="material-symbols-outlined" style={{ color, fontSize: 22, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">{value}</p>
                  <p className="text-[10px] text-on-surface-variant font-label-caps uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Star exercise */}
            {summaryData.starExercise?.name && (
              <div className="mx-lg mb-md flex items-center gap-sm bg-primary/10 border border-primary/25 rounded-2xl px-md py-sm">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-label-caps text-primary uppercase tracking-wider">Ejercicio estrella</p>
                  <p className="font-body-md text-body-md text-on-surface font-semibold truncate">{summaryData.starExercise.name}</p>
                  <p className="text-xs text-on-surface-variant">{summaryData.starExercise.weight} kg máx.</p>
                </div>
              </div>
            )}

            {/* Motivational message */}
            <p className="text-center text-sm text-on-surface-variant px-lg pb-sm italic">
              {summaryData.totalSetsCompleted >= 15
                ? '¡Sesión épica! Descansa bien, lo mereces. 💪'
                : summaryData.totalSetsCompleted >= 8
                ? '¡Gran trabajo! El progreso es constante. 🔥'
                : '¡Buen comienzo! Cada sesión cuenta. ⚡'}
            </p>

            {/* CTA */}
            <div className="px-lg pb-lg pt-xs">
              <button
                onClick={() => router.push('/')}
                className="w-full h-14 rounded-2xl font-headline-sm text-headline-sm text-white font-bold flex items-center justify-center gap-sm active:scale-95 transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PR Toast Message */}
      {prMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up bg-surface-container-highest border border-primary text-primary px-lg py-sm rounded-full shadow-[0_0_20px_rgba(255,180,169,0.4)] flex items-center gap-sm">
          <span className="material-symbols-outlined">social_leaderboard</span>
          <span className="font-headline-md text-headline-md">{prMessage}</span>
        </div>
      )}

      <div className="px-md py-lg pb-48">
        <div className="flex flex-col gap-md mb-24">
          {activeRoutine.exercises.map((ex: any, exIdx: number) => {
            const exState = session.exerciseLogs.find((l: ExerciseLog) => l.exerciseId === ex.id);
            if (!exState) return null;

            const isFirstWarmup = exIdx === 0 && ex.isWarmup;
            const isFirstMain = !ex.isWarmup && (exIdx === 0 || activeRoutine.exercises[exIdx - 1].isWarmup);

            const unit = getUnit(ex);
            const completedCount = exState.sets.filter((s: any) => s.completed).length;
            const allDone = completedCount === exState.sets.length;

            return (
              <div key={ex.id} className="contents">
                {isFirstWarmup && (
                  <div className="flex items-center gap-sm mt-4 mb-2">
                    <span className="material-symbols-outlined text-secondary-fixed">local_fire_department</span>
                    <h3 className="font-headline-md text-headline-md text-secondary-fixed">Calentamiento</h3>
                    <div className="flex-1 h-px bg-outline-variant/50 ml-sm"></div>
                  </div>
                )}
                {isFirstMain && (
                  <div className="flex items-center gap-sm mt-8 mb-2">
                    <span className="material-symbols-outlined text-primary">fitness_center</span>
                    <h3 className="font-headline-md text-headline-md text-primary">Entrenamiento</h3>
                    <div className="flex-1 h-px bg-outline-variant/50 ml-sm"></div>
                  </div>
                )}
                <section
                  className={`rounded-2xl dark:rounded-lg shadow-md dark:shadow-none border overflow-hidden transition-all duration-300 ${
                  allDone
                    ? 'bg-surface border-primary/30'
                    : 'bg-surface border-outline-variant'
                }`}
              >
                {/* Exercise header */}
                <div className="p-md flex justify-between items-start">
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-sm">
                      <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">{ex.name}</h2>
                      <button 
                        onClick={() => setSelectedExercise(ex)} 
                        className="text-primary hover:scale-110 active:scale-95 transition-all w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full"
                        title="Ver técnica detallada"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>psychology</span>
                      </button>
                      {allDone && (
                        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </div>
                    <span className="text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mt-base">
                      Objetivo: {formatGoal(ex)}
                    </span>
                    {ex.notes && (
                      <span className="text-outline font-label-caps text-label-caps italic mt-1 opacity-80">
                        💡 {ex.notes}
                      </span>
                    )}
                  </div>
                  {ex.restSeconds && (
                    <span className="flex items-center gap-1 text-outline font-label-caps text-label-caps shrink-0 ml-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
                      {formatRest(ex.restSeconds)}
                    </span>
                  )}
                </div>

                {/* Exercise GIF carousel */}
                {(ex.imageUrls?.length > 0 || ex.imageUrl) && (() => {
                  const imgs: string[] = ex.imageUrls?.length > 0 ? ex.imageUrls : [ex.imageUrl];
                  return (
                    <div className="relative w-full bg-surface-bright overflow-hidden group/carousel" style={{ aspectRatio: '16/9' }}>
                      <ImageCarousel images={imgs} alt={ex.name} showLabels />
                    </div>
                  );
                })()}

                {/* Sets list */}

                <div className="px-md pb-md flex flex-col gap-sm">
                  {exState.sets.map((set) => {
                    const isChecked = set.completed;
                    return (
                      <div
                        key={set.setNumber}
                        className={`border rounded-xl dark:rounded-lg p-3 transition-colors duration-200 ${
                          isChecked ? 'bg-primary/10 border-primary/40 animate-pulse-rust' : 'bg-surface border-outline-variant shadow-sm dark:shadow-none'
                        } ${set.isWarmup ? 'border-dashed border-secondary-fixed/50 opacity-90' : ''}`}
                      >
                        <div className="flex items-end justify-between gap-3">
                          
                          {/* Set number */}
                          <div className="flex flex-col mb-1 items-center justify-center w-6">
                            <span className="text-[10px] text-on-surface-variant font-label-caps opacity-70">SET</span>
                            <span className={`font-mono text-lg font-bold ${isChecked ? 'text-primary' : 'text-on-surface-variant'}`}>{set.setNumber}</span>
                          </div>

                          {/* Weight */}
                          <div className="flex flex-col flex-1 max-w-[120px]">
                            <span className="text-[10px] text-on-surface-variant font-label-caps mb-1 opacity-70">PESO (KG)</span>
                            <div className="flex items-center bg-background rounded-md h-12 border border-outline-variant focus-within:border-primary transition-colors">
                              <button 
                                onClick={() => {
                                  const current = parseFloat(set.weightKg) || 0;
                                  logSet(ex.id, set.setNumber, { weightKg: Math.max(0, current - 2.5).toString() });
                                }}
                                className="w-10 h-full flex items-center justify-center text-primary active:scale-90 transition-transform hover:bg-surface-bright rounded-l-md"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">remove</span>
                              </button>
                              <input
                                type="number"
                                inputMode="decimal"
                                className="w-full bg-transparent border-none text-center font-mono text-2xl font-bold text-on-surface focus:ring-0 p-0"
                                placeholder="0"
                                value={set.weightKg}
                                onChange={(e) => logSet(ex.id, set.setNumber, { weightKg: e.target.value })}
                              />
                              <button 
                                onClick={() => {
                                  const current = parseFloat(set.weightKg) || 0;
                                  logSet(ex.id, set.setNumber, { weightKg: (current + 2.5).toString() });
                                }}
                                className="w-10 h-full flex items-center justify-center text-primary active:scale-90 transition-transform hover:bg-surface-bright rounded-r-md"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">add</span>
                              </button>
                            </div>
                          </div>

                          {/* Reps */}
                          <div className="flex flex-col flex-1 max-w-[80px]">
                            <span className="text-[10px] text-on-surface-variant font-label-caps mb-1 opacity-70">REPS</span>
                            <div className="flex items-center bg-background rounded-md h-12 border border-outline-variant focus-within:border-primary transition-colors">
                              <input
                                type="number"
                                inputMode="numeric"
                                className="w-full bg-transparent border-none text-center font-mono text-2xl font-bold text-on-surface focus:ring-0 p-0"
                                placeholder="0"
                                value={set.repsDone}
                                onChange={(e) => logSet(ex.id, set.setNumber, { repsDone: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => logSet(ex.id, set.setNumber, { isWarmup: !set.isWarmup })}
                                className={`w-8 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-colors ${set.isWarmup ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-bright text-on-surface-variant'}`}
                                title="Marcar como calentamiento"
                              >
                                W
                              </button>
                              <button
                                onClick={() => removeSet(ex.id, set.setNumber)}
                                className="w-8 h-6 flex items-center justify-center rounded text-[10px] font-bold bg-error-container/30 text-error hover:bg-error-container transition-colors"
                                title="Eliminar serie"
                              >
                                <span className="material-symbols-outlined" style={{fontSize: 14}}>delete</span>
                              </button>
                            </div>
                            <button
                              onClick={() => handleSetToggle(ex.id, set.setNumber, ex.restSeconds || 60, isChecked)}
                              className={`h-10 px-4 rounded-lg dark:rounded-md flex items-center justify-center transition-all active:scale-95 font-label-caps text-label-caps tracking-wider font-bold ${
                                isChecked 
                                  ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/30 dark:shadow-none' 
                                  : 'bg-background text-on-surface-variant border border-outline-variant hover:border-primary/50'
                              }`}
                            >
                              {isChecked ? 'LISTO' : 'HECHO'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => addSet(ex.id)}
                    className="mt-2 py-2 flex items-center justify-center gap-xs rounded-lg border border-dashed border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors font-label-caps text-label-caps"
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

      {/* Bottom nav bar with progress */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest border-t border-outline-variant px-lg py-md max-w-7xl mx-auto shadow-lg rounded-t-xl animate-slide-up">
        {/* Progress bar */}
        <div className="w-full h-1 bg-[#232328] rounded-full mb-md overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#39ff88] to-[#00e473] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">fitness_center</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-on-surface-variant">PROGRESO</span>
              <span className="font-stat-value text-stat-value text-primary">
                {completedSets}/{totalSets} series
              </span>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="bg-primary-container text-on-primary-container rounded-lg px-xl h-touch-target-min font-headline-md text-headline-md flex items-center gap-sm active:scale-95 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Finalizar
          </button>
        </div>
      </nav>

      {/* Rest timer */}
      {timer.isActive && (
        <div className="fixed bottom-24 md:bottom-20 left-0 w-full z-40 px-md">
          <div className="max-w-3xl mx-auto bg-surface-container-highest rounded-lg shadow-lg border border-outline-variant p-md flex flex-col items-center timer-glow animate-slide-up">
            <div className="flex items-center gap-md w-full justify-between">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-secondary-fixed">DESCANSO</span>
                <div className="font-timer-display text-[48px] md:text-timer-display text-secondary-fixed leading-none">
                  {timer.remainingSecs !== null ? timer.format(timer.remainingSecs) : '00:00'}
                </div>
              </div>
              <button
                onClick={timer.stop}
                className="bg-primary-container text-on-primary-container rounded-lg px-md h-touch-target-min font-label-caps text-label-caps uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-sm">timer_off</span>
                Saltar
              </button>
            </div>
            <div className="w-full h-1 bg-[#232328] rounded-full mt-md overflow-hidden">
              <div
                className="h-full bg-secondary-fixed transition-all duration-1000"
                style={{ width: `${((timer.remainingSecs || 0) / timer.totalSecs) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <ExerciseModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exerciseName={selectedExercise?.name || ""}
        exerciseData={selectedExercise}
      />
    </>
  );
}
