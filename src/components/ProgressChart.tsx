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
        if (log.sets.some(s => s.completed && s.weightKg)) {
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
          borderColor: '#ffb4a9', // Primary color
          backgroundColor: 'rgba(255, 180, 169, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#ffb4a9',
          pointBorderColor: '#1e0f0d',
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
        backgroundColor: '#372623', // surface-container-high
        titleColor: '#e5beb8',
        bodyColor: '#fadcd7',
        borderColor: '#5c403c',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y} kg`
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: '#2d2d33',
        },
        ticks: {
          color: '#e5beb8', // on-surface-variant
          font: { family: 'Inter', size: 12 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#e5beb8',
          font: { family: 'Inter', size: 12 }
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
      <div className="bg-surface border border-outline-variant rounded-lg p-md text-center text-on-surface-variant">
        No hay datos suficientes para mostrar gráficos.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-lg p-md space-y-md animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
        <h3 className="font-headline-md text-headline-md text-on-surface">Evolución de Peso</h3>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="bg-[#232328] border border-outline-variant text-on-surface rounded-lg px-sm py-xs font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary max-w-full md:max-w-[250px]"
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
          className={`px-3 py-1 rounded-full text-xs font-label-caps tracking-wider transition-colors ${timeFilter === '1M' ? 'bg-primary text-on-primary' : 'bg-[#232328] text-on-surface-variant hover:bg-[#2d2d33]'}`}
        >
          1 MES
        </button>
        <button 
          onClick={() => setTimeFilter('3M')} 
          className={`px-3 py-1 rounded-full text-xs font-label-caps tracking-wider transition-colors ${timeFilter === '3M' ? 'bg-primary text-on-primary' : 'bg-[#232328] text-on-surface-variant hover:bg-[#2d2d33]'}`}
        >
          3 MESES
        </button>
        <button 
          onClick={() => setTimeFilter('ALL')} 
          className={`px-3 py-1 rounded-full text-xs font-label-caps tracking-wider transition-colors ${timeFilter === 'ALL' ? 'bg-primary text-on-primary' : 'bg-[#232328] text-on-surface-variant hover:bg-[#2d2d33]'}`}
        >
          TODO
        </button>
      </div>
      
      <div className="w-full h-64 mt-md">
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
            Sin datos para este ejercicio.
          </div>
        )}
      </div>
    </div>
  );
}
