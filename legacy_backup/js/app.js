import { homeView } from './views/home.js';
import { workoutSessionView } from './views/workout-session.js';
import { historyView } from './views/history.js';
import { workout } from './modules/workout.js';

window.addEventListener('error', (e) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:20px;font-family:monospace;white-space:pre-wrap;';
  errDiv.innerText = 'Global Error:\n' + e.message + '\n\n' + e.filename + ':' + e.lineno;
  document.body.appendChild(errDiv);
});
window.addEventListener('unhandledrejection', (e) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:20px;font-family:monospace;white-space:pre-wrap;';
  errDiv.innerText = 'Unhandled Promise Rejection:\n' + (e.reason && e.reason.stack ? e.reason.stack : e.reason);
  document.body.appendChild(errDiv);
});

let routinesData = [];

async function loadData() {
  try {
    const res = await fetch('./js/data/routine.json');
    const data = await res.json();
    routinesData = data.days;
  } catch (err) {
    console.error('Error loading routine data', err);
  }
}

function updateNavState(viewId) {
  // Desktop Nav
  const deskHome = document.getElementById('nav-home');
  const deskHist = document.getElementById('nav-history');
  
  [deskHome, deskHist].forEach(el => {
    if(!el) return;
    el.className = 'nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer text-on-surface-variant font-medium hover:text-primary-fixed-dim';
  });

  const activeDesk = viewId === 'history' ? deskHist : deskHome;
  if (activeDesk) {
    activeDesk.className = 'nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer text-primary font-bold border-b-2 border-primary pb-1';
  }

  // Mobile Nav
  const mobHome = document.getElementById('mob-nav-home');
  const mobHist = document.getElementById('mob-nav-history');
  
  [mobHome, mobHist].forEach(el => {
    if(!el) return;
    el.className = 'mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs scale-95 transition-all text-on-surface-variant hover:bg-surface-bright';
  });

  const activeMob = viewId === 'history' ? mobHist : mobHome;
  if (activeMob) {
    activeMob.className = 'mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all bg-primary-container text-on-primary-container scale-100';
  }
}

function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  window.scrollTo(0,0);
  updateNavState(viewId);
}

function initRouter() {
  const btnHome = document.getElementById('nav-home');
  const btnHistory = document.getElementById('nav-history');
  const mobHome = document.getElementById('mob-nav-home');
  const mobHistory = document.getElementById('mob-nav-history');

  const goHome = () => {
    if (workout.state) {
      const activeRoutine = routinesData.find(r => r.id === workout.state.dayId);
      workoutSessionView.render(activeRoutine, () => renderHome());
      switchView('workout');
    } else {
      renderHome();
      switchView('home');
    }
  };

  const goHistory = () => {
    historyView.render(routinesData);
    switchView('history');
  };

  if(btnHome) btnHome.addEventListener('click', goHome);
  if(mobHome) mobHome.addEventListener('click', goHome);
  if(btnHistory) btnHistory.addEventListener('click', goHistory);
  if(mobHistory) mobHistory.addEventListener('click', goHistory);
}

function renderHome() {
  homeView.render(routinesData, (selectedRoutine) => {
    workout.startSession(selectedRoutine);
    workoutSessionView.render(selectedRoutine, () => {
      renderHome();
      switchView('home');
    });
    switchView('workout');
  }, () => {
    // Re-render workout if started
    if(workout.state && workout.state.dayId === window.selectedDayId) {
      const activeRoutine = routinesData.find(r => r.id === workout.state.dayId);
      workoutSessionView.render(activeRoutine, () => {
        renderHome();
        switchView('home');
      });
      switchView('workout');
    }
  });
}

async function startApp() {
  await loadData();
  initRouter();
  
  if (workout.restoreSession()) {
    const activeRoutine = routinesData.find(r => r.id === workout.state.dayId);
    workoutSessionView.render(activeRoutine, () => {
      renderHome();
      switchView('home');
    });
    switchView('workout');
  } else {
    renderHome();
    switchView('home');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
