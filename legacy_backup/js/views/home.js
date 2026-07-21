import { getPhaseInfo } from '../modules/week-phase.js';

export const homeView = {
  render(routines, onStartWorkout, onDaySelect) {
    const today = new Date().getDay();
    const currentDayNumber = today === 0 ? 7 : today;
    const selectedDayId = window.selectedDayId || routines.find(r => r.dayNumber === currentDayNumber)?.id || 'monday';
    const activeRoutine = routines.find(r => r.id === selectedDayId);
    
    const phaseInfo = getPhaseInfo();
    const isDeload = phaseInfo.isDeload;
    
    const container = document.getElementById('view-home');
    
    // Day Selector Data
    const daysMap = [
      { id: 'monday', lbl: 'L', num: '1' },
      { id: 'tuesday', lbl: 'M', num: '2' },
      { id: 'wednesday', lbl: 'X', num: '3' },
      { id: 'thursday', lbl: 'J', num: '4' },
      { id: 'friday', lbl: 'V', num: '5' },
      { id: 'saturday', lbl: 'S', num: '6' },
      { id: 'sunday', lbl: 'D', num: '7' }
    ];

    const chipsHTML = daysMap.map(d => {
      const isActive = d.id === selectedDayId;
      const btnClass = isActive 
        ? "flex-1 flex flex-col items-center py-sm rounded-lg bg-primary text-on-primary shadow-lg scale-105 transition-all"
        : "flex-1 flex flex-col items-center py-sm rounded-lg text-on-surface-variant hover:bg-surface-bright transition-colors cursor-pointer day-chip";
      
      const lblClass = isActive ? "opacity-80" : "opacity-60";
      
      return `
        <button class="${btnClass}" data-day="${d.id}" ${isActive ? '' : 'onclick="window.selectedDayId=\''+d.id+'\'"'}>
          <span class="font-label-caps text-label-caps ${lblClass}">${d.lbl}</span>
          <span class="font-stat-value text-stat-value">${d.num}</span>
        </button>
      `;
    }).join('');

    const exercisesCardsHTML = activeRoutine.exercises.map(ex => {
      const imageHTML = ex.imageUrl 
        ? `<img src="${ex.imageUrl}" alt="${ex.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
        : `<div class="w-full h-full flex items-center justify-center text-4xl">🏋️</div>`;

      return `
        <div class="bg-[#1a1a1e] border border-[#2d2d33] rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer group">
          <div class="aspect-video w-full overflow-hidden bg-[#232328]">
            ${imageHTML}
          </div>
          <div class="p-md flex items-center justify-between">
            <div class="flex items-center gap-md">
              <div class="w-10 h-10 bg-[#232328] rounded-lg flex items-center justify-center text-primary border border-[#2d2d33]">
                <span class="material-symbols-outlined text-2xl">exercise</span>
              </div>
              <div>
                <p class="font-stat-value text-stat-value text-on-surface line-clamp-1">${ex.name}</p>
                <p class="text-on-surface-variant font-body-md text-body-md">${ex.sets}x${ex.reps || (ex.repsMin+'-'+ex.repsMax)} reps</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Header Section -->
      <section class="space-y-md">
        <div class="flex justify-between items-end">
          <div class="space-y-xs">
            <h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Hola, Atleta</h1>
            <p class="text-on-surface-variant font-body-md text-body-md">Hoy toca: ${activeRoutine.label}</p>
          </div>
          <div class="${isDeload ? 'bg-error/20 border-error/30 text-error' : 'bg-secondary-container/10 border-secondary-container/20 text-secondary-fixed'} px-md py-xs rounded-full border flex items-center gap-xs">
            <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">${isDeload ? 'trending_down' : 'trending_up'}</span>
            <span class="font-label-caps text-label-caps">Semana ${phaseInfo.weekNumber} · ${phaseInfo.phaseLabel}</span>
          </div>
        </div>

        <!-- Weekly Selector -->
        <div class="flex justify-between bg-[#1a1a1e] p-xs rounded-xl border border-[#2d2d33]">
          ${chipsHTML}
        </div>
      </section>

      <!-- Routine Highlight -->
      <section class="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a1e] to-[#0d0d0f] border border-[#2d2d33] p-lg">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-sm mb-xs">
              <span class="bg-error/20 text-error font-label-caps text-label-caps px-sm py-1 rounded-full border border-error/30 uppercase">INTENSIDAD ${activeRoutine.intensity}</span>
            </div>
            <h2 class="font-headline-md text-headline-md text-on-surface">${activeRoutine.label}</h2>
            <div class="flex items-center gap-md mt-sm text-on-surface-variant">
              <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-sm">schedule</span>
                <span class="font-body-md text-body-md">~60 min</span>
              </div>
              <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-sm">fitness_center</span>
                <span class="font-body-md text-body-md">${activeRoutine.exercises.length} Ejercicios</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Exercises List -->
      <section class="space-y-md">
        <div class="flex justify-between items-center">
          <h3 class="font-headline-md text-headline-md text-on-surface">Lista de Ejercicios</h3>
          <span class="text-primary font-body-md text-body-md cursor-pointer hover:underline">Ver todos</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md pb-24">
          ${exercisesCardsHTML}
        </div>
      </section>

      <!-- FAB Sticky Button -->
      <div class="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-md z-50">
        <button id="fab-start-btn" class="w-full h-[56px] bg-[#ff4d3d] text-[#f5f5f5] rounded-xl font-headline-md text-headline-md shadow-[0_8px_32px_rgba(255,77,61,0.4)] flex items-center justify-center gap-md active:scale-95 transition-transform">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
          EMPEZAR ENTRENAMIENTO
        </button>
      </div>
    `;

    // Rebind day chips manually since onclick attributes stringify
    container.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        window.selectedDayId = e.currentTarget.dataset.day;
        onDaySelect();
      });
    });

    const startBtn = document.getElementById('fab-start-btn');
    startBtn.addEventListener('click', () => {
      const originalContent = startBtn.innerHTML;
      startBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> PREPARANDO...';
      setTimeout(() => {
        onStartWorkout(activeRoutine);
      }, 300);
    });
  }
};
