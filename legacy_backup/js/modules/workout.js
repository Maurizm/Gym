import { storage } from './storage.js';
import { getPhaseInfo } from './week-phase.js';

const ACTIVE_SESSION_KEY = 'gymapp:active_session';
const SESSIONS_HISTORY_KEY = 'gymapp:sessions';

export const workout = {
  state: null,

  startSession(day) {
    const phaseInfo = getPhaseInfo();

    // Initialize session state
    this.state = {
      sessionId: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now(),
      dayId: day.id,
      date: new Date().toISOString().split('T')[0],
      startTime: Date.now(),
      weekNumber: phaseInfo.weekNumber,
      exerciseLogs: day.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          weightKg: '',
          repsDone: '',
          completed: false
        }))
      })),
      completed: false
    };

    this.saveState();
  },

  restoreSession() {
    const saved = storage.get(ACTIVE_SESSION_KEY);
    if (saved) {
      this.state = saved;
      return true;
    }
    return false;
  },

  saveState() {
    if (this.state) {
      storage.set(ACTIVE_SESSION_KEY, this.state);
    }
  },

  logSet(exerciseId, setNumber, data) {
    if (!this.state) return;

    const exLog = this.state.exerciseLogs.find(l => l.exerciseId === exerciseId);
    if (exLog) {
      const setLog = exLog.sets.find(s => s.setNumber === setNumber);
      if (setLog) {
        Object.assign(setLog, data);
        this.saveState();
      }
    }
  },

  finishSession() {
    if (!this.state) return;

    this.state.durationSeconds = Math.floor((Date.now() - this.state.startTime) / 1000);
    this.state.completed = true;

    // Move to history
    const history = storage.get(SESSIONS_HISTORY_KEY, []);
    history.push(this.state);
    storage.set(SESSIONS_HISTORY_KEY, history);

    // Clear active session
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    this.state = null;
  }
};
