'use client';

import { useState } from 'react';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Stats() {
  const { stats, getExerciseHistoryData, isLoaded: historyLoaded } = useWorkoutHistory();
  const { library, isLoaded: libLoaded } = useExerciseLibrary();
  
  const [selectedExId, setSelectedExId] = useState<string>('');

  if (!historyLoaded || !libLoaded) return null;

  if (!selectedExId && library.length > 0) {
    const defaultEx = library.find(e => e.name.toLowerCase().includes('press de banca')) || library[0];
    if (defaultEx) setSelectedExId(defaultEx.id);
  }

  const chartData = getExerciseHistoryData(selectedExId);
  
  const data = {
    labels: chartData.map(d => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Peso Máximo (kg)',
        data: chartData.map(d => d.maxWeight),
        borderColor: '#39ff88',
        backgroundColor: 'rgba(57, 255, 136, 0.5)',
        tension: 0.3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#39ff88',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#232328',
        titleColor: '#fff',
        bodyColor: '#39ff88',
        borderColor: '#3a3a40',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#2d2d33',
        },
        ticks: {
          color: '#8a8a93',
        }
      },
      y: {
        grid: {
          color: '#2d2d33',
        },
        ticks: {
          color: '#8a8a93',
        }
      }
    }
  };

  return (
    <div className="px-md md:px-lg pt-md pb-32 space-y-lg animate-fade-in-up">
      <h2 className="font-headline-md text-headline-md text-on-surface">Estadísticas</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
        <div className="bg-surface border border-outline-variant rounded-lg p-md">
          <p className="text-on-surface-variant font-label-caps text-label-caps">SESIONES TOTALES</p>
          <p className="font-headline-lg text-headline-lg text-on-surface mt-1">{stats.totalSessions}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-md">
          <p className="text-on-surface-variant font-label-caps text-label-caps">VOLUMEN TOTAL</p>
          <p className="font-headline-lg text-headline-lg text-primary mt-1">{stats.totalVolume.toLocaleString()} <span className="text-sm">kg</span></p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-md">
          <p className="text-on-surface-variant font-label-caps text-label-caps">RACHA ACTUAL</p>
          <p className="font-headline-lg text-headline-lg text-on-surface mt-1">{stats.streakDays} <span className="text-sm">días</span></p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-md">
          <p className="text-on-surface-variant font-label-caps text-label-caps">MINUTOS TOTALES</p>
          <p className="font-headline-lg text-headline-lg text-on-surface mt-1">{stats.totalMinutes}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-surface border border-outline-variant rounded-lg p-md md:p-lg space-y-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Progreso por Ejercicio</h3>
            <p className="text-on-surface-variant text-sm mt-1">Peso máximo levantado por sesión</p>
          </div>
          
          <select 
            value={selectedExId} 
            onChange={(e) => setSelectedExId(e.target.value)}
            className="bg-background border border-outline-variant text-on-surface rounded-lg px-md py-sm focus:outline-none focus:border-primary max-w-[250px] truncate"
          >
            {library.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <div className="h-[300px] w-full mt-lg">
          {chartData.length > 0 ? (
            <Line data={data} options={options} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-lg">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">show_chart</span>
              <p>No hay datos suficientes para este ejercicio.</p>
              <p className="text-sm opacity-70">Completa sesiones para ver tu progreso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
