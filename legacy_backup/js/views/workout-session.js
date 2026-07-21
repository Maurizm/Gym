import { workout } from '../modules/workout.js';
import { timer } from '../modules/timer.js';

export const workoutSessionView = {
  render(dayRoutine, onFinish) {
    if (!workout.state) {
      console.error("No active workout state");
      return;
    }
    
    const container = document.getElementById('view-workout');
    
    // Header for active session
    let html = `
      <div class="flex flex-col gap-md mb-24">
    `;
    
    dayRoutine.exercises.forEach((ex, exIndex) => {
      const exState = workout.state.exerciseLogs.find(l => l.exerciseId === ex.id);
      const hasVariants = ex.imageUrls && ex.imageUrls.length > 1;
      const dataUrls = hasVariants ? `data-urls='${JSON.stringify(ex.imageUrls)}' data-idx="0"` : '';
      const imageHTML = ex.imageUrl 
        ? `<div class="mt-md w-full h-48 rounded-xl bg-cover bg-center grayscale opacity-40 cycle-img" style="background-image: url('${ex.imageUrl}'); ${hasVariants ? 'cursor: pointer;' : ''}" ${dataUrls}></div>`
        : '';
      
      let setsRows = '';
      exState.sets.forEach((set, sIndex) => {
        const isChecked = set.completed;
        const rowClass = isChecked ? "bg-[#232328]/30 border-b border-[#2d2d33]" : "border-b border-[#2d2d33]";
        const iconColor = isChecked ? "text-[#39ff88]" : "text-outline-variant";
        const iconName = isChecked ? "check_circle" : "radio_button_unchecked";
        const fillStyle = isChecked ? "font-variation-settings: 'FILL' 1;" : "";

        setsRows += `
          <tr class="${rowClass}">
            <td class="py-md px-xs text-on-surface-variant">${set.setNumber}</td>
            <td class="py-md px-xs">
              <input type="number" inputmode="decimal" class="set-weight bg-[#232328] border-none rounded-lg w-16 text-center text-on-surface focus:ring-2 focus:ring-primary-container" placeholder="kg" data-ex="${ex.id}" data-set="${set.setNumber}" value="${set.weightKg || ''}">
            </td>
            <td class="py-md px-xs">
              <input type="number" inputmode="numeric" class="set-reps bg-[#232328] border-none rounded-lg w-16 text-center text-on-surface focus:ring-2 focus:ring-primary-container" placeholder="reps" data-ex="${ex.id}" data-set="${set.setNumber}" value="${set.repsDone || ''}">
            </td>
            <td class="py-md px-xs text-right">
              <button class="set-check w-touch-target-min h-touch-target-min inline-flex items-center justify-end ${iconColor}" data-ex="${ex.id}" data-set="${set.setNumber}" data-rest="${ex.restSeconds}">
                <span class="material-symbols-outlined" data-icon="${iconName}" style="${fillStyle}">${iconName}</span>
              </button>
            </td>
          </tr>
        `;
      });
      
      html += `
        <section class="bg-[#1a1a1e] rounded-xl border border-[#2d2d33] overflow-hidden">
          <div class="p-md flex justify-between items-start">
            <div class="flex flex-col">
              <h2 class="font-headline-md text-headline-md text-on-surface">${ex.name}</h2>
              <span class="text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mt-base">Objetivo: ${ex.sets}x${ex.reps || (ex.repsMin+'-'+ex.repsMax)} reps</span>
            </div>
          </div>
          <div class="px-md pb-md overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#2d2d33] text-on-surface-variant font-label-caps text-label-caps">
                  <th class="py-sm px-xs w-12">SET</th>
                  <th class="py-sm px-xs">KG</th>
                  <th class="py-sm px-xs">REPS</th>
                  <th class="py-sm px-xs text-right">LISTO</th>
                </tr>
              </thead>
              <tbody class="font-stat-value text-stat-value">
                ${setsRows}
              </tbody>
            </table>
          </div>
          ${imageHTML}
        </section>
      `;
    });
    
    html += `</div>`;
    
    // Bottom Action Bar
    html += `
      <nav class="fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest border-t border-outline-variant px-lg py-md max-w-7xl mx-auto flex items-center justify-between shadow-lg rounded-t-xl">
        <div class="flex items-center gap-md">
          <div class="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center text-primary">
            <span class="material-symbols-outlined" data-icon="fitness_center">fitness_center</span>
          </div>
          <div class="hidden md:flex flex-col">
            <span class="font-label-caps text-label-caps text-on-surface-variant">RUTINA</span>
            <span class="font-stat-value text-stat-value line-clamp-1">${dayRoutine.label}</span>
          </div>
        </div>
        <button id="finish-workout-btn" class="bg-primary-container text-on-primary-container rounded-lg px-xl h-touch-target-min font-headline-md text-headline-md-mobile flex items-center gap-sm active:scale-95 transition-all shadow-xl">
          <span class="material-symbols-outlined" data-icon="check_circle">check_circle</span>
          Finalizar
        </button>
      </nav>
    `;
    
    container.innerHTML = html;
    
    // Event Listeners
    container.querySelectorAll('.set-weight, .set-reps').forEach(input => {
      input.addEventListener('change', (e) => {
        const el = e.target;
        const exId = el.dataset.ex;
        const setNum = parseInt(el.dataset.set);
        const data = {};
        if (el.classList.contains('set-weight')) data.weightKg = el.value;
        if (el.classList.contains('set-reps')) data.repsDone = el.value;
        workout.logSet(exId, setNum, data);
      });
    });
    
    container.querySelectorAll('.set-check').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const el = e.currentTarget;
        const exId = el.dataset.ex;
        const setNum = parseInt(el.dataset.set);
        const restSecs = parseInt(el.dataset.rest);
        
        const icon = el.querySelector('.material-symbols-outlined');
        const isCompleted = icon.textContent === 'check_circle';
        const newState = !isCompleted;
        const tr = el.closest('tr');
        
        if (newState) {
          icon.textContent = 'check_circle';
          icon.style.fontVariationSettings = "'FILL' 1";
          el.classList.remove('text-outline-variant');
          el.classList.add('text-[#39ff88]');
          tr.classList.add('bg-[#232328]/30');
          this.startRestTimer(restSecs);
        } else {
          icon.textContent = 'radio_button_unchecked';
          icon.style.fontVariationSettings = "'FILL' 0";
          el.classList.remove('text-[#39ff88]');
          el.classList.add('text-outline-variant');
          tr.classList.remove('bg-[#232328]/30');
        }
        
        workout.logSet(exId, setNum, { completed: newState });
      });
    });

    // Cycle image on click
    container.querySelectorAll('.cycle-img').forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!e.currentTarget.dataset.urls) return;
        const urls = JSON.parse(e.currentTarget.dataset.urls);
        let idx = parseInt(e.currentTarget.dataset.idx);
        idx = (idx + 1) % urls.length;
        e.currentTarget.style.backgroundImage = \`url('\${urls[idx]}')\`;
        e.currentTarget.dataset.idx = idx;
      });
    });
    
    document.getElementById('finish-workout-btn').addEventListener('click', () => {
      if(confirm('¿Seguro que deseas finalizar el entrenamiento?')) {
        workout.finishSession();
        timer.stop();
        this.hideTimerOverlay();
        onFinish();
      }
    });
    
    const timerSkipBtn = document.getElementById('timer-skip-btn');
    if (timerSkipBtn) {
      timerSkipBtn.onclick = () => {
        timer.stop();
        this.hideTimerOverlay();
      };
    }
    
    if (timer.intervalId) {
       this.showTimerOverlay();
    }
  },
  
  startRestTimer(seconds) {
    this.showTimerOverlay();
    const progressEl = document.getElementById('timer-progress');
    timer.onTick = (sec) => {
      document.getElementById('timer-display').textContent = timer.format(sec);
      if (progressEl) {
        progressEl.style.width = \`\${(sec / seconds) * 100}%\`;
      }
    };
    timer.onComplete = () => {
      this.hideTimerOverlay();
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400]);
    };
    timer.start(seconds);
  },
  
  showTimerOverlay() {
    const el = document.getElementById('timer-overlay');
    if(el) el.style.display = 'block';
  },
  
  hideTimerOverlay() {
    const el = document.getElementById('timer-overlay');
    if(el) el.style.display = 'none';
  }
};
