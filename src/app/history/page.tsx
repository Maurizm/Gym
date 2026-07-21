'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { SessionState } from '@/hooks/useWorkoutSession';
import routineData from '@/data/routine.json';

export default function History() {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const history = storage.get<SessionState[]>('gymapp:sessions', []);
    setSessions(history.reverse()); // latest first
  }, []);

  if (!isClient) return null;

  if (sessions.length === 0) {
    return (
      <div className="px-md md:px-lg pt-md">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Historial de Entrenamientos</h2>
        <div className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl p-lg text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-[64px] text-outline-variant">history</span>
          <p className="text-on-surface-variant font-body-lg text-body-lg">Aún no hay entrenamientos registrados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-md md:px-lg pt-md pb-32">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Historial de Entrenamientos</h2>
      <div className="space-y-lg">
        {sessions.map((sess) => {
          const routine = routineData.days.find((r: any) => r.id === sess.dayId);
          const dt = new Date(sess.startTime);
          const formattedDate = dt.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          });

          return (
            <div key={sess.sessionId} className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
              <div className="p-md bg-[#232328]/50 border-b border-[#2d2d33] flex justify-between items-center">
                <div>
                  <h3 className="font-stat-value text-stat-value text-on-surface capitalize">{formattedDate}</h3>
                  <p className="text-on-surface-variant font-body-md text-body-md">{routine?.label || 'Rutina Desconocida'} · Semana {sess.weekNumber}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="bg-secondary-container/10 text-secondary-fixed px-sm py-xs rounded text-sm flex items-center gap-xs border border-secondary-container/20">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    {Math.floor((sess.durationSeconds || 0) / 60)} min
                  </span>
                </div>
              </div>
              <div className="p-md space-y-sm">
                {sess.exerciseLogs.map((log) => {
                  const ex = routine?.exercises.find((e: any) => e.id === log.exerciseId);
                  const setsDone = log.sets.filter(s => s.completed);
                  if (setsDone.length === 0) return null;
                  
                  return (
                    <div key={log.exerciseId} className="flex justify-between items-center text-sm">
                      <span className="text-on-surface line-clamp-1 flex-1">{ex?.name || log.exerciseId}</span>
                      <span className="text-on-surface-variant font-medium">
                        {setsDone.length} sets 
                        {setsDone[0]?.weightKg ? ` @ \${setsDone[0].weightKg}kg` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
