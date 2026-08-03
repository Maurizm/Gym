'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { useRoutine } from '@/hooks/useRoutine';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Filler, Legend
);

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function isSameWeek(date: Date, ref: Date) {
  const startOfWeek = new Date(ref);
  startOfWeek.setDate(ref.getDate() - ref.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-md flex flex-col gap-xs shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-xl" style={{ color: color || 'var(--color-primary)' }}>{icon}</span>
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{label}</p>
      </div>
      <p className="font-headline-lg text-headline-lg text-on-surface font-bold leading-none">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant">{sub}</p>}
    </div>
  );
}

function MuscleBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-sm">
      <span className="text-xs text-on-surface-variant w-24 shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-2 bg-surface-bright rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-on-surface-variant w-6 text-right">{count}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Stats() {
  const { history, stats, getExerciseHistoryData, isLoaded: historyLoaded } = useWorkoutHistory();
  const { library, isLoaded: libLoaded } = useExerciseLibrary();
  const { routine, isLoaded: routineLoaded } = useRoutine();
  const [selectedExId, setSelectedExId] = useState('');
  const [tab, setTab] = useState<'overview' | 'progress' | 'calendar'>('overview');

  useEffect(() => {
    if (libLoaded && library.length > 0 && !selectedExId) {
      const def = library.find(e => e.name.toLowerCase().includes('press de banca')) || library[0];
      if (def) setSelectedExId(def.id);
    }
  }, [libLoaded, library, selectedExId]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const completedSessions = useMemo(() => history.filter(s => s.completed), [history]);

  const thisWeekSessions = useMemo(() =>
    completedSessions.filter(s => isSameWeek(new Date(s.startTime), new Date())).length,
    [completedSessions]
  );

  const avgDuration = useMemo(() => {
    if (!completedSessions.length) return 0;
    return Math.round(completedSessions.reduce((a, s) => a + (s.durationSeconds || 0), 0) / completedSessions.length);
  }, [completedSessions]);

  // Volume per last 8 weeks
  const weeklyVolume = useMemo(() => {
    const weeks: { label: string; volume: number }[] = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const ref = new Date(now);
      ref.setDate(now.getDate() - w * 7);
      const startOfWeek = new Date(ref);
      startOfWeek.setDate(ref.getDate() - ref.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const weekLabel = startOfWeek.toLocaleDateString('es', { month: 'short', day: 'numeric' });
      let volume = 0;
      for (const s of completedSessions) {
        const d = new Date(s.startTime);
        if (d >= startOfWeek && d < endOfWeek) {
          s.exerciseLogs.forEach(log => {
            log.sets.forEach(set => {
              if (set.completed && !set.isWarmup && set.weightKg && set.repsDone) {
                const w = parseFloat(set.weightKg);
                const r = parseInt(set.repsDone, 10);
                if (!isNaN(w) && !isNaN(r)) volume += w * r;
              }
            });
          });
        }
      }
      weeks.push({ label: weekLabel, volume: Math.round(volume) });
    }
    return weeks;
  }, [completedSessions]);

  // Muscle frequency
  const muscleFreq = useMemo(() => {
    if (!routineLoaded || !routine) return {};
    const freq: Record<string, number> = {};
    for (const session of completedSessions) {
      const dayDef = routine.days.find((d: any) => d.id === session.dayId);
      if (!dayDef) continue;
      for (const ex of dayDef.exercises) {
        if (ex.isWarmup) continue;
        const log = session.exerciseLogs.find((l: any) => l.exerciseId === ex.id);
        if (!log || !log.sets.some((s: any) => s.completed)) continue;
        const libMatch = library.find(libEx => libEx.name.toLowerCase() === ex.name.toLowerCase());
        const muscle = ((ex as any).target || (libMatch as any)?.target || 'otros').toLowerCase();
        freq[muscle] = (freq[muscle] || 0) + 1;
      }
    }
    return freq;
  }, [completedSessions, routine, routineLoaded, library]);

  const topMuscles = Object.entries(muscleFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxMuscle = topMuscles[0]?.[1] ?? 1;

  // Calendar — last 10 weeks activity heatmap
  const calendarDays = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const completedDates = new Set(completedSessions.map(s => new Date(s.startTime).toISOString().split('T')[0]));
    const today = new Date();
    for (let i = 69; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, count: completedDates.has(dateStr) ? 1 : 0 });
    }
    return days;
  }, [completedSessions]);

  // Progress chart
  const chartData = getExerciseHistoryData(selectedExId);
  const selectedEx = library.find(e => e.id === selectedExId);

  if (!historyLoaded || !libLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  const MUSCLE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const lineChartData = {
    labels: chartData.map(d => new Date(d.date).toLocaleDateString('es', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Peso Máximo (kg)',
      data: chartData.map(d => d.maxWeight),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.12)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#6366f1',
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const barChartData = {
    labels: weeklyVolume.map(w => w.label),
    datasets: [{
      label: 'Volumen (kg)',
      data: weeklyVolume.map(w => w.volume),
      backgroundColor: weeklyVolume.map((_, i) =>
        i === weeklyVolume.length - 1 ? 'rgba(99,102,241,0.9)' : 'rgba(99,102,241,0.3)'
      ),
      borderRadius: 6,
    }],
  };

  const chartOptions = (isDark = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1e2e',
        titleColor: '#fff',
        bodyColor: '#a5b4fc',
        borderColor: '#3f3f5c',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#8a8a93', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#8a8a93', font: { size: 11 } } },
    },
  });

  const TABS = [
    { id: 'overview', label: 'Resumen', icon: 'dashboard' },
    { id: 'progress', label: 'Progreso', icon: 'show_chart' },
    { id: 'calendar', label: 'Calendario', icon: 'calendar_month' },
  ] as const;

  return (
    <div className="px-md md:px-lg pt-lg pb-32 space-y-lg animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Mis Estadísticas</h1>
        <p className="text-on-surface-variant font-body-md text-body-md mt-xs">
          {stats.totalSessions} sesiones completadas · Racha de {stats.streakDays} días
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-xs bg-surface-container p-1 rounded-xl self-start w-full md:w-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-xs px-md py-sm rounded-lg font-label-caps text-label-caps transition-all duration-200 ${
              tab === t.id
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: tab === t.id ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-lg animate-fade-in-up">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            <StatCard icon="fitness_center" label="Sesiones totales" value={stats.totalSessions} sub="completadas" color="#6366f1" />
            <StatCard icon="local_fire_department" label="Esta semana" value={thisWeekSessions} sub="sesiones" color="#ef4444" />
            <StatCard icon="bolt" label="Racha actual" value={`${stats.streakDays} días`} sub="consecutivos" color="#f59e0b" />
            <StatCard icon="timer" label="Duración media" value={formatDuration(avgDuration)} sub="por sesión" color="#0ea5e9" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Volume bar chart */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-md space-y-md">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Volumen Semanal</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Últimas 8 semanas (kg totales)</p>
              </div>
              <div className="h-52">
                {weeklyVolume.some(w => w.volume > 0) ? (
                  <Bar data={barChartData} options={chartOptions() as any} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-2 border-2 border-dashed border-outline-variant rounded-xl">
                    <span className="material-symbols-outlined text-4xl opacity-40">bar_chart</span>
                    <p className="text-sm">Sin datos aún</p>
                  </div>
                )}
              </div>
            </div>

            {/* Muscle frequency */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-md space-y-md">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Músculos más Trabajados</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Series completadas por grupo muscular</p>
              </div>
              {topMuscles.length > 0 ? (
                <div className="space-y-sm pt-xs">
                  {topMuscles.map(([muscle, count], i) => (
                    <MuscleBar
                      key={muscle}
                      label={muscle}
                      count={count}
                      max={maxMuscle}
                      color={MUSCLE_COLORS[i % MUSCLE_COLORS.length]}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-40 flex flex-col items-center justify-center text-on-surface-variant gap-2 border-2 border-dashed border-outline-variant rounded-xl">
                  <span className="material-symbols-outlined text-4xl opacity-40">accessibility_new</span>
                  <p className="text-sm">Completa sesiones para ver datos</p>
                </div>
              )}
            </div>
          </div>

          {/* Global totals */}
          <div className="grid grid-cols-2 gap-sm">
            <StatCard icon="scale" label="Volumen total" value={`${stats.totalVolume.toLocaleString('es')} kg`} sub="toneladas levantadas" color="#10b981" />
            <StatCard icon="schedule" label="Tiempo total" value={formatDuration(stats.totalMinutes * 60)} sub="horas entrenadas" color="#8b5cf6" />
          </div>
        </div>
      )}

      {/* ── PROGRESS TAB ── */}
      {tab === 'progress' && (
        <div className="space-y-lg animate-fade-in-up">
          <div className="bg-surface border border-outline-variant rounded-2xl p-md md:p-lg space-y-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Progresión de Carga</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Peso máximo por sesión</p>
              </div>
              <select
                value={selectedExId}
                onChange={e => setSelectedExId(e.target.value)}
                className="bg-surface-bright border border-outline-variant text-on-surface rounded-xl px-md py-sm focus:outline-none focus:border-primary text-sm"
              >
                {library.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* PR badge */}
            {chartData.length > 0 && (() => {
              const pr = Math.max(...chartData.map(d => d.maxWeight));
              return (
                <div className="flex items-center gap-sm p-sm bg-primary/10 border border-primary/20 rounded-xl">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  <div>
                    <p className="font-label-caps text-label-caps text-primary">RÉCORD PERSONAL</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{pr} kg</p>
                  </div>
                </div>
              );
            })()}

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <Line data={lineChartData} options={chartOptions() as any} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl gap-2">
                  <span className="material-symbols-outlined text-4xl opacity-40">show_chart</span>
                  <p className="text-sm">Sin datos para {selectedEx?.name || 'este ejercicio'}</p>
                  <p className="text-xs opacity-60">Registra pesos durante tus sesiones</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR TAB ── */}
      {tab === 'calendar' && (
        <div className="space-y-lg animate-fade-in-up">
          <div className="bg-surface border border-outline-variant rounded-2xl p-md md:p-lg space-y-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Actividad — Últimos 70 días</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{completedSessions.length} sesiones registradas</p>
            </div>

            {/* Heatmap grid */}
            <div className="flex flex-wrap gap-1 pt-xs">
              {calendarDays.map(({ date, count }) => {
                const d = new Date(date + 'T12:00:00');
                const isToday = date === new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={date}
                    title={`${d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}${count ? ' ✓ Entreno' : ''}`}
                    className={`w-7 h-7 rounded-md transition-all duration-300 flex items-center justify-center cursor-default
                      ${count ? 'bg-primary shadow-sm shadow-primary/30' : 'bg-surface-bright border border-outline-variant/40'}
                      ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface' : ''}
                    `}
                  >
                    {count > 0 && (
                      <span className="material-symbols-outlined text-white/90" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>
                        fitness_center
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-sm pt-xs">
              <div className="w-5 h-5 rounded bg-surface-bright border border-outline-variant/40" />
              <span className="text-xs text-on-surface-variant">Sin entreno</span>
              <div className="w-5 h-5 rounded bg-primary ml-sm" />
              <span className="text-xs text-on-surface-variant">Sesión completada</span>
            </div>

            {/* Recent sessions list */}
            {completedSessions.length > 0 && (
              <div className="space-y-sm pt-sm border-t border-outline-variant">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant">Últimas Sesiones</h4>
                {[...completedSessions].reverse().slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-sm border-b border-outline-variant/30 last:border-0">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                      </div>
                      <div>
                        <p className="font-body-md text-body-md text-on-surface capitalize">{s.dayId ?? 'Sesión'}</p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(s.startTime).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-primary">{formatDuration(s.durationSeconds || 0)}</p>
                      <p className="text-xs text-on-surface-variant">{s.exerciseLogs?.length ?? 0} ejercicios</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
