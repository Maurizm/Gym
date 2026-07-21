import { progress } from '../modules/progress.js';

let currentChart = null;

export const historyView = {
  render(routines) {
    const history = progress.getHistory();
    const container = document.getElementById('view-history');
    
    // Calculate streak
    let streak = 0;
    if (history.length > 0) {
      streak = 1; // Basic streak mock for UI, real logic would check consecutive days
    }
    
    let html = `
      <!-- Streak Indicator & Page Title -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-sm">
        <div>
          <h1 class="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background">Tu Progreso</h1>
          <p class="text-on-surface-variant font-body-md text-body-md">Mide tu evolución y sesiones previas.</p>
        </div>
        <div class="bg-surface-container-high border border-outline-variant p-sm rounded-xl flex items-center gap-sm">
          <div class="bg-primary-container/20 p-xs rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-primary-container" data-icon="local_fire_department" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
          </div>
          <div>
            <div class="font-label-caps text-label-caps text-on-surface-variant uppercase">Estado actual</div>
            <div class="font-stat-value text-stat-value text-primary">Racha de ${streak} días</div>
          </div>
        </div>
      </div>
      
      <!-- Progress Chart Bento Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-md mb-xl">
        
        <!-- Main Chart Card -->
        <div class="lg:col-span-2 bg-[#1a1a1e] border border-[#2d2d33] rounded-xl p-lg flex flex-col gap-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
            <div class="flex items-center gap-sm">
              <span class="material-symbols-outlined text-secondary-fixed" data-icon="show_chart">show_chart</span>
              <h2 class="font-headline-md text-headline-md text-on-surface">Evolución de Carga</h2>
            </div>
            <!-- Exercise Selector Dropdown -->
            <div class="relative min-w-[240px]">
              <select id="history-exercise-select" class="w-full bg-[#232328] border border-[#2d2d33] h-touch-target-min px-md rounded-lg flex items-center justify-between font-body-md text-body-md text-on-surface focus:border-primary transition-all appearance-none outline-none">
                <option value="">Selecciona un ejercicio...</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
          <div class="chart-container mt-md relative w-full h-[250px]">
             <canvas id="progress-chart"></canvas>
          </div>
        </div>
        
        <!-- Sessions List -->
        <div class="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl overflow-hidden flex flex-col min-h-[300px] lg:max-h-[350px]">
          <div class="p-md border-b border-[#2d2d33] bg-[#232328]">
             <h3 class="font-headline-md text-headline-md text-on-surface">Sesiones Pasadas</h3>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar p-sm space-y-sm" id="history-list">
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Populate select
    const select = document.getElementById('history-exercise-select');
    routines.forEach(day => {
      day.exercises.forEach(ex => {
        if (![...select.options].some(opt => opt.value === ex.id)) {
          const opt = document.createElement('option');
          opt.value = ex.id;
          opt.textContent = ex.name;
          select.appendChild(opt);
        }
      });
    });
    
    // Populate sessions
    const listContainer = document.getElementById('history-list');
    if (history.length === 0) {
      listContainer.innerHTML = '<p class="text-on-surface-variant p-md text-center">No hay sesiones registradas todavía.</p>';
    } else {
      history.forEach(session => {
        const dayLabel = routines.find(r => r.id === session.dayId)?.label || 'Entrenamiento';
        const mins = Math.floor(session.durationSeconds / 60);
        
        let totalVol = 0;
        session.exerciseLogs.forEach(ex => {
          ex.sets.forEach(set => {
            if (set.completed && set.weightKg && set.repsDone) {
              totalVol += parseFloat(set.weightKg) * parseInt(set.repsDone);
            }
          });
        });

        const card = document.createElement('div');
        card.className = 'bg-[#232328] p-sm rounded-lg border border-[#2d2d33]';
        card.innerHTML = `
          <div class="font-stat-value text-stat-value text-on-surface">${dayLabel}</div>
          <div class="flex justify-between mt-xs text-on-surface-variant font-label-caps text-label-caps uppercase">
            <span>${session.date} (Sem. ${session.weekNumber})</span>
            <span>⏱️ ${mins} min</span>
          </div>
          <div class="mt-xs font-label-caps text-label-caps text-secondary-fixed">
            Volumen: ${totalVol > 0 ? totalVol + ' kg' : '--'}
          </div>
        `;
        listContainer.appendChild(card);
      });
    }

    // Chart logic
    select.onchange = (e) => {
      const exId = e.target.value;
      if (exId) {
        this.renderChart(exId);
      } else if (currentChart) {
        currentChart.destroy();
        currentChart = null;
      }
    };
  },

  renderChart(exerciseId) {
    const dataPoints = progress.getExerciseProgress(exerciseId);
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    if (currentChart) {
      currentChart.destroy();
    }

    if (dataPoints.length === 0) return;

    const labels = dataPoints.map(dp => {
      const parts = dp.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
    const data = dataPoints.map(dp => dp.weight);

    Chart.defaults.color = '#ab8984';
    Chart.defaults.font.family = 'Inter';

    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Max Peso (kg)',
          data: data,
          borderColor: '#63ff95',
          backgroundColor: 'rgba(99, 255, 149, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#0d0d0f',
          pointBorderColor: '#63ff95',
          pointBorderWidth: 2,
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#232328',
            titleColor: '#f5f5f5',
            bodyColor: '#63ff95',
            borderColor: '#2d2d33',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            grid: { color: '#2d2d33' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
};
