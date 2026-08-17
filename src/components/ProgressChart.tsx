'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SessionState } from '@/hooks/useWorkoutSession';
import { getBestWeightInSession } from '@/hooks/useWorkoutHistory';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  history: SessionState[];
}

export function ProgressChart({ history }: Props) {
  const { library } = useExerciseLibrary();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'1M' | '3M' | 'ALL'>('ALL');

  // Extract all unique exercises done in the history
  const availableExercises = useMemo(() => {
    const ids = new Set<string>();
    history.forEach(sess => {
      if (!sess.completed) return;
      sess.exerciseLogs.forEach(log => {
        if (log.sets.some((s: { completed: boolean; weightKg?: string }) => s.completed && s.weightKg)) {
          ids.add(log.exerciseId);
        }
      });
    });
    
    const results: { id: string; name: string }[] = [];
    ids.forEach(id => {
      // Find name from library
      let name = id;
      const ex = library.find(e => e.id === id);
      if (ex) {
        name = ex.name;
      }
      results.push({ id, name });
    });
    
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [history, library]);

  // Set default exercise if not selected
  if (!selectedExerciseId && availableExercises.length > 0) {
    setSelectedExerciseId(availableExercises[0].id);
  }

  // Build chart data
  const chartData = useMemo(() => {
    if (!selectedExerciseId) return null;

    // Filter sessions that have this exercise completed
    const dataPoints: { date: string; weight: number }[] = [];
    
    // Process oldest to newest
    let sortedHistory = [...history].sort((a, b) => a.startTime - b.startTime);

    if (timeFilter !== 'ALL') {
      const now = Date.now();
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      const threshold = timeFilter === '1M' ? now - oneMonth : now - (3 * oneMonth);
      sortedHistory = sortedHistory.filter(sess => sess.startTime >= threshold);
    }
    
    sortedHistory.forEach(sess => {
      if (!sess.completed) return;
      const best = getBestWeightInSession(sess, selectedExerciseId);
      if (best) {
        const date = new Date(sess.startTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        dataPoints.push({ date, weight: parseFloat(best) });
      }
    });

    if (dataPoints.length === 0) return null;

    return {
      labels: dataPoints.map(d => d.date),
      datasets: [
        {
          label: 'Peso Máximo (kg)',
          data: dataPoints.map(d => d.weight),
          borderColor: '#a22c29', // primary color
          backgroundColor: 'rgba(162, 44, 41, 0.12)',
          borderWidth: 3,
          pointBackgroundColor: '#fafaf7', // on-surface
          pointBorderColor: '#a22c29',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.3
        }
      ]
    };
  }, [history, selectedExerciseId, timeFilter]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0a100d', // surface-container
        titleColor: '#d6d5c9', // on-surface-variant
        bodyColor: '#a22c29', // primary
        borderColor: '#b9baa3', // outline-variant (roughly)
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: Record<string, unknown>) => `${(context.parsed as Record<string, unknown>).y} kg`
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(185, 186, 163, 0.15)', // outline-variant with opacity
        },
        ticks: {
          color: '#d6d5c9', // on-surface-variant
          font: { family: 'var(--font-mono)', size: 12 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#d6d5c9',
          font: { family: 'var(--font-mono)', size: 12 }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (availableExercises.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant rounded-2xl p-md text-center text-on-surface-variant shadow-sm dark:shadow-none">
        No hay datos suficientes para mostrar gráficos.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-md md:p-lg space-y-md animate-fade-in-up shadow-sm dark:shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
        <h3 className="text-headline-sm text-on-surface">Evolución de Peso</h3>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="bg-surface-bright border border-outline-variant text-on-surface rounded-xl px-sm py-xs text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary max-w-full md:max-w-[250px] transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          {availableExercises.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => setTimeFilter('1M')} 
          className={`px-3 py-1 rounded-full text-label-caps tracking-wider transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${timeFilter === '1M' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-bright text-on-surface-variant hover:text-on-surface border border-outline-variant/50'}`}
        >
          1 MES
        </button>
        <button 
          onClick={() => setTimeFilter('3M')} 
          className={`px-3 py-1 rounded-full text-label-caps tracking-wider transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${timeFilter === '3M' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-bright text-on-surface-variant hover:text-on-surface border border-outline-variant/50'}`}
        >
          3 MESES
        </button>
        <button 
          onClick={() => setTimeFilter('ALL')} 
          className={`px-3 py-1 rounded-full text-label-caps tracking-wider transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${timeFilter === 'ALL' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-bright text-on-surface-variant hover:text-on-surface border border-outline-variant/50'}`}
        >
          TODO
        </button>
      </div>
      
      <div className="w-full h-64 mt-md">
        {chartData ? (
          <Line data={chartData as any} options={options as any} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-bright/50 border border-dashed border-outline-variant rounded-xl">
            Sin datos para este ejercicio.
          </div>
        )}
      </div>
    </div>
  );
}
