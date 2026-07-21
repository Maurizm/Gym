'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutSession, ExerciseLog } from '@/hooks/useWorkoutSession';
import { useTimer } from '@/hooks/useTimer';
import routineData from '@/data/routine.json';

export default function Workout() {
  const router = useRouter();
  const { session, logSet, finishSession } = useWorkoutSession();
  const timer = useTimer();
  const [activeRoutine, setActiveRoutine] = useState<any>(null);

  useEffect(() => {
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
  }, [session, router]);

  if (!session || !activeRoutine) return null;

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
  };

  return (
    <>
      <div className="px-md py-lg pb-48">
        <div className="flex flex-col gap-md mb-24">
          {activeRoutine.exercises.map((ex: any) => {
            const exState = session.exerciseLogs.find((l: ExerciseLog) => l.exerciseId === ex.id);
            if (!exState) return null;

            return (
              <section key={ex.id} className="bg-[#1a1a1e] rounded-xl border border-[#2d2d33] overflow-hidden">
                <div className="p-md flex justify-between items-start">
                  <div className="flex flex-col">
                    <h2 className="font-headline-md text-headline-md text-on-surface">{ex.name}</h2>
                    <span className="text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mt-base">
                      Objetivo: {ex.sets}x{ex.reps || (ex.repsMin + '-' + ex.repsMax)} reps
                    </span>
                  </div>
                </div>
                <div className="px-md pb-md overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2d2d33] text-on-surface-variant font-label-caps text-label-caps">
                        <th className="py-sm px-xs w-12">SET</th>
                        <th className="py-sm px-xs">KG</th>
                        <th className="py-sm px-xs">REPS</th>
                        <th className="py-sm px-xs text-right">LISTO</th>
                      </tr>
                    </thead>
                    <tbody className="font-stat-value text-stat-value">
                      {exState.sets.map((set) => {
                        const isChecked = set.completed;
                        return (
                          <tr key={set.setNumber} className={`\${isChecked ? 'bg-[#232328]/30 border-b border-[#2d2d33]' : 'border-b border-[#2d2d33]'}`}>
                            <td className="py-md px-xs text-on-surface-variant">{set.setNumber}</td>
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
                                placeholder="reps"
                                value={set.repsDone}
                                onChange={(e) => logSet(ex.id, set.setNumber, { repsDone: e.target.value })}
                              />
                            </td>
                            <td className="py-md px-xs text-right">
                              <button
                                onClick={() => handleSetToggle(ex.id, set.setNumber, ex.restSeconds || 60, isChecked)}
                                className={`set-check w-touch-target-min h-touch-target-min inline-flex items-center justify-end \${isChecked ? 'text-[#39ff88]' : 'text-outline-variant'}`}
                              >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: isChecked ? "'FILL' 1" : "'FILL' 0" }}>
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
                {ex.imageUrl && (
                  <div 
                    className="mt-md w-full h-48 rounded-xl bg-cover bg-center grayscale opacity-40 cycle-img" 
                    style={{ backgroundImage: `url('\${ex.imageUrl}')` }}
                  ></div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest border-t border-outline-variant px-lg py-md max-w-7xl mx-auto flex items-center justify-between shadow-lg rounded-t-xl">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">fitness_center</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant">RUTINA</span>
            <span className="font-stat-value text-stat-value line-clamp-1">{activeRoutine.label}</span>
          </div>
        </div>
        <button
          onClick={handleFinish}
          className="bg-primary-container text-on-primary-container rounded-lg px-xl h-touch-target-min font-headline-md text-headline-md-mobile flex items-center gap-sm active:scale-95 transition-all shadow-xl"
        >
          <span className="material-symbols-outlined">check_circle</span>
          Finalizar
        </button>
      </nav>

      {timer.isActive && (
        <div className="fixed bottom-24 md:bottom-20 left-0 w-full z-40 px-md">
          <div className="max-w-3xl mx-auto bg-surface-container-highest rounded-xl shadow-lg border border-outline-variant p-md flex flex-col items-center timer-glow">
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
                style={{ width: `\${((timer.remainingSecs || 0) / timer.totalSecs) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
