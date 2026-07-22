'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutSession, ExerciseLog } from '@/hooks/useWorkoutSession';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useTimer } from '@/hooks/useTimer';
import routineData from '@/data/routine.json';
import { ImageCarousel } from '@/components/ImageCarousel';
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
  const { session, isLoaded: sessionLoaded, logSet, finishSession } = useWorkoutSession();
  const { getLastWeight, getMaxWeight } = useWorkoutHistory();
  const timer = useTimer();
  const [activeRoutine, setActiveRoutine] = useState<any>(null);
  const [prCelebrated, setPrCelebrated] = useState<Record<string, boolean>>({});
  const [prMessage, setPrMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoaded) return;
    if (!session) {
      router.push('/');
      return;
    }
    const routine = routineData.days.find((r: any) => r.id === session.dayId);
    if (!routine) {
      router.push('/');
      return;
    }
    setActiveRoutine(routine);
  }, [session, sessionLoaded, router]);

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

  if (!sessionLoaded || !session || !activeRoutine) return null;

  // --- Progress calculation ---
  const totalSets = session.exerciseLogs.reduce((acc, log) => acc + log.sets.length, 0);
  const completedSets = session.exerciseLogs.reduce(
    (acc, log) => acc + log.sets.filter(s => s.completed).length,
    0
  );
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleFinish = () => {
    if (confirm('¿Seguro que deseas finalizar el entrenamiento?')) {
      finishSession();
      timer.stop();
      router.push('/');
    }
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

            const unit = getUnit(ex);
            const completedCount = exState.sets.filter(s => s.completed).length;
            const allDone = completedCount === exState.sets.length;

            return (
              <section
                key={ex.id}
                className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                  allDone
                    ? 'bg-[#1a1a1e] border-[#39ff88]/30'
                    : 'bg-[#1a1a1e] border-[#2d2d33]'
                }`}
              >
                {/* Exercise header */}
                <div className="p-md flex justify-between items-start">
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-sm">
                      <h2 className="font-headline-md text-headline-md text-on-surface">{ex.name}</h2>
                      {allDone && (
                        <span className="material-symbols-outlined text-[#39ff88] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
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

                {/* Sets table */}
                <div className="px-md pb-md overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2d2d33] text-on-surface-variant font-label-caps text-label-caps">
                        <th className="py-sm px-xs w-12">SET</th>
                        <th className="py-sm px-xs">KG</th>
                        <th className="py-sm px-xs">{unit.toUpperCase()}</th>
                        <th className="py-sm px-xs text-right">LISTO</th>
                      </tr>
                    </thead>
                    <tbody className="font-stat-value text-stat-value">
                      {exState.sets.map((set) => {
                        const isChecked = set.completed;
                        return (
                          <tr
                            key={set.setNumber}
                            className={`border-b border-[#2d2d33] transition-colors duration-200 ${
                              isChecked ? 'bg-[#39ff88]/5' : ''
                            }`}
                          >
                            <td className={`py-md px-xs ${isChecked ? 'text-[#39ff88]' : 'text-on-surface-variant'}`}>
                              {set.setNumber}
                            </td>
                            <td className="py-md px-xs">
                              <input
                                type="number"
                                inputMode="decimal"
                                className="set-weight bg-[#232328] border-none rounded-lg w-16 text-center text-on-surface focus:ring-2 focus:ring-primary-container"
                                placeholder="kg"
                                value={set.weightKg}
                                onChange={(e) => logSet(ex.id, set.setNumber, { weightKg: e.target.value })}
                              />
                            </td>
                            <td className="py-md px-xs">
                              <input
                                type="number"
                                inputMode="numeric"
                                className="set-reps bg-[#232328] border-none rounded-lg w-16 text-center text-on-surface focus:ring-2 focus:ring-primary-container"
                                placeholder={unit === 'reps' ? 'reps' : unit}
                                value={set.repsDone}
                                onChange={(e) => logSet(ex.id, set.setNumber, { repsDone: e.target.value })}
                              />
                            </td>
                            <td className="py-md px-xs text-right">
                              <button
                                onClick={() => handleSetToggle(ex.id, set.setNumber, ex.restSeconds || 60, isChecked)}
                                className={`set-check w-touch-target-min h-touch-target-min inline-flex items-center justify-end transition-colors ${
                                  isChecked ? 'text-[#39ff88]' : 'text-outline-variant'
                                }`}
                              >
                                <span
                                  className="material-symbols-outlined transition-all"
                                  style={{ fontVariationSettings: isChecked ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                  {isChecked ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Exercise image (shown under table) */}
                {(ex.imageUrl || (ex.imageUrls && ex.imageUrls.length > 0)) && (
                  <div className="mx-md mb-md w-full h-44 rounded-xl overflow-hidden grayscale opacity-35 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <ImageCarousel images={ex.imageUrls || [ex.imageUrl]} alt={ex.name} />
                  </div>
                )}
              </section>
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
              <span className="font-stat-value text-stat-value text-[#39ff88]">
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
          <div className="max-w-3xl mx-auto bg-surface-container-highest rounded-xl shadow-lg border border-outline-variant p-md flex flex-col items-center timer-glow animate-slide-up">
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
    </>
  );
}
