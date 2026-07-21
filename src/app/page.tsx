'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import routineData from '@/data/routine.json';
import { getPhaseInfo } from '@/lib/week-phase';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';

const getDaysMap = () => {
  const map = [
    { id: 'monday', lbl: 'L', dayNumber: 1 },
    { id: 'tuesday', lbl: 'M', dayNumber: 2 },
    { id: 'wednesday', lbl: 'X', dayNumber: 3 },
    { id: 'thursday', lbl: 'J', dayNumber: 4 },
    { id: 'friday', lbl: 'V', dayNumber: 5 },
    { id: 'saturday', lbl: 'S', dayNumber: 6 },
    { id: 'sunday', lbl: 'D', dayNumber: 7 }
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

export default function Home() {
  const router = useRouter();
  const { session, startSession } = useWorkoutSession();
  const [selectedDayId, setSelectedDayId] = useState<string>('monday');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // If there's an active session, maybe redirect to workout?
    // According to vanilla app: if workout.restoreSession() is true, it shows workout view.
    if (session && !session.completed) {
      router.push('/workout');
      return;
    }

    const today = new Date().getDay();
    const currentDayNumber = today === 0 ? 7 : today;
    const todayId = getDaysMap().find(d => d.dayNumber === currentDayNumber)?.id || 'monday';
    setSelectedDayId(todayId);
  }, [session, router]);

  if (!isClient) return null; // Avoid hydration mismatch on initial render

  const phaseInfo = getPhaseInfo();
  const isDeload = phaseInfo.isDeload;
  
  const activeRoutine = routineData.days.find((r: any) => r.id === selectedDayId);
  if (!activeRoutine) return <div className="p-md">Rutina no encontrada</div>;

  const handleStart = () => {
    startSession(activeRoutine);
    router.push('/workout');
  };

  return (
    <div className="px-md md:px-lg py-md space-y-lg">
      <section className="space-y-md">
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

        <div className="flex justify-between bg-[#1a1a1e] p-xs rounded-xl border border-[#2d2d33]">
          {getDaysMap().map(d => {
            const isActive = d.id === selectedDayId;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDayId(d.id)}
                className={`flex-1 flex flex-col items-center py-sm rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-on-primary shadow-lg scale-105' 
                    : 'text-on-surface-variant hover:bg-surface-bright cursor-pointer'
                }`}
              >
                <span className={`font-label-caps text-label-caps ${isActive ? 'opacity-80' : 'opacity-60'}`}>{d.lbl}</span>
                <span className="font-stat-value text-stat-value">{d.num}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a1e] to-[#0d0d0f] border border-[#2d2d33] p-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <span className="bg-error/20 text-error font-label-caps text-label-caps px-sm py-1 rounded-full border border-error/30 uppercase">
                INTENSIDAD {activeRoutine.intensity}
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{activeRoutine.label}</h2>
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
        </div>
      </section>

      <section className="space-y-md">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">Lista de Ejercicios</h3>
          <span className="text-primary font-body-md text-body-md cursor-pointer hover:underline">Ver todos</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md pb-24">
          {activeRoutine.exercises.map((ex: any) => (
            <div key={ex.id} className="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer group">
              <div className="aspect-video w-full overflow-hidden bg-[#232328]">
                {ex.imageUrl ? (
                  <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🏋️</div>
                )}
              </div>
              <div className="p-md flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 bg-[#232328] rounded-lg flex items-center justify-center text-primary border border-[#2d2d33]">
                    <span className="material-symbols-outlined text-2xl">exercise</span>
                  </div>
                  <div>
                    <p className="font-stat-value text-stat-value text-on-surface line-clamp-1">{ex.name}</p>
                    <p className="text-on-surface-variant font-body-md text-body-md">
                      {ex.sets}x{ex.reps || (ex.repsMin + '-' + ex.repsMax)} reps
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-md z-50">
        <button 
          onClick={handleStart}
          className="w-full h-[56px] bg-[#ff4d3d] text-[#f5f5f5] rounded-xl font-headline-md text-headline-md shadow-[0_8px_32px_rgba(255,77,61,0.4)] flex items-center justify-center gap-md active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          EMPEZAR ENTRENAMIENTO
        </button>
      </div>
    </div>
  );
}
