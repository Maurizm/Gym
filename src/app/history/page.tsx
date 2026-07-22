'use client';

import { useEffect, useState } from 'react';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { getBestWeightInSession } from '@/hooks/useWorkoutHistory';
import { SessionState } from '@/hooks/useWorkoutSession';
import { ProgressChart } from '@/components/ProgressChart';
import routineData from '@/data/routine.json';

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

function getWeekLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return 'Esta semana';
  if (diffDays < 14) return 'Semana pasada';

  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - d.getDay());
  return weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

export default function History() {
  const { history, isLoaded, stats } = useWorkoutHistory();
  const [isClient, setIsClient] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isLoaded) return null;

  // Latest first
  const sessions = [...history].reverse();

  // Group by week label
  const grouped: { label: string; sessions: SessionState[] }[] = [];
  sessions.forEach(sess => {
    const label = getWeekLabel(new Date(sess.startTime));
    const existing = grouped.find(g => g.label === label);
    if (existing) existing.sessions.push(sess);
    else grouped.push({ label, sessions: [sess] });
  });

  if (sessions.length === 0) {
    return (
      <div className="px-md md:px-lg pt-md">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Historial de Entrenamientos</h2>
        <div className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl p-lg text-center flex flex-col items-center gap-md animate-fade-in-up">
          <span className="material-symbols-outlined text-[64px] text-outline-variant">history</span>
          <p className="text-on-surface-variant font-body-lg text-body-lg">Aún no hay entrenamientos registrados.</p>
          <p className="text-outline font-body-md text-body-md">Completa tu primera sesión para verla aquí.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-md md:px-lg pt-md pb-32 space-y-lg">
      <div className="flex items-center justify-between animate-fade-in-up">
        <h2 className="font-headline-md text-headline-md text-on-surface">Historial de Entrenamientos</h2>
        <button 
          onClick={() => setShowChart(!showChart)}
          className={`flex items-center gap-xs px-sm py-1 rounded-full border transition-colors ${showChart ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1a1a1e] border-[#2d2d33] text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined text-sm">show_chart</span>
          <span className="font-label-caps text-label-caps">{showChart ? 'Ocultar Gráfica' : 'Ver Gráfica'}</span>
        </button>
      </div>

      {showChart && (
        <ProgressChart history={history} />
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-md animate-fade-in-up delay-75">
        <div className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl p-md text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">SESIONES</p>
          <p className="font-headline-md text-headline-md text-primary animate-count-up">{stats.totalSessions}</p>
        </div>
        <div className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl p-md text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">RACHA</p>
          <div className="flex items-center justify-center gap-1">
            <p className="font-headline-md text-headline-md text-[#39ff88] animate-count-up">{stats.currentStreak}</p>
            <span className="material-symbols-outlined text-[#39ff88]" style={{ fontSize: 18 }}>local_fire_department</span>
          </div>
        </div>
        <div className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl p-md text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">MINUTOS</p>
          <p className="font-headline-md text-headline-md text-secondary-fixed animate-count-up">{stats.totalMinutes}</p>
        </div>
      </div>

      {/* Grouped sessions */}
      <div className="space-y-xl">
        {grouped.map(group => (
          <div key={group.label}>
            {/* Week separator */}
            <div className="flex items-center gap-md mb-md">
              <div className="h-px flex-1 bg-[#2d2d33]" />
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest px-sm">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-[#2d2d33]" />
            </div>

            <div className="space-y-md">
              {group.sessions.map((sess, idx) => {
                const routine = routineData.days.find((r: any) => r.id === sess.dayId);
                const dt = new Date(sess.startTime);
                const formattedDate = dt.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                });

                // Count completed sets and exercises
                const completedExercises = sess.exerciseLogs.filter(
                  log => log.sets.some(s => s.completed)
                ).length;
                const totalSets = sess.exerciseLogs.reduce((acc, log) => acc + log.sets.filter(s => s.completed).length, 0);

                return (
                  <div
                    key={sess.sessionId}
                    className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl overflow-hidden hover:border-primary/30 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* Session header */}
                    <div className="p-md bg-[#232328]/50 border-b border-[#2d2d33] flex justify-between items-start">
                      <div>
                        <h3 className="font-stat-value text-stat-value text-on-surface capitalize">{formattedDate}</h3>
                        <p className="text-on-surface-variant font-body-md text-body-md">
                          {routine?.label || 'Rutina Desconocida'} · Semana {sess.weekNumber}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-xs">
                        <span className="bg-secondary-container/10 text-secondary-fixed px-sm py-xs rounded text-sm flex items-center gap-xs border border-secondary-container/20">
                          <span className="material-symbols-outlined text-sm">timer</span>
                          {sess.durationSeconds ? formatDuration(sess.durationSeconds) : '—'}
                        </span>
                        <span className="text-on-surface-variant font-label-caps text-label-caps">
                          {completedExercises} ej · {totalSets} series
                        </span>
                      </div>
                    </div>

                    {/* Exercise logs */}
                    <div className="p-md space-y-sm">
                      {sess.exerciseLogs.map((log) => {
                        const ex = routine?.exercises.find((e: any) => e.id === log.exerciseId);
                        const setsDone = log.sets.filter(s => s.completed);
                        if (setsDone.length === 0) return null;

                        const bestWeight = getBestWeightInSession(sess, log.exerciseId);
                        const weightsVary = setsDone.some(s => s.weightKg !== setsDone[0].weightKg);

                        return (
                          <div key={log.exerciseId} className="flex justify-between items-center text-sm py-xs border-b border-[#2d2d33]/50 last:border-0">
                            <span className="text-on-surface flex-1 mr-md">{ex?.name || log.exerciseId}</span>
                            <div className="text-right shrink-0">
                              <span className="text-on-surface-variant font-medium">
                                {setsDone.length} sets
                                {bestWeight ? (
                                  <span className="text-primary ml-1">
                                    @ {bestWeight}kg{weightsVary ? ' (máx)' : ''}
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
