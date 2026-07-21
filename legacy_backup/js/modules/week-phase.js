import { storage } from './storage.js';

export function getPhaseInfo() {
  let settings = storage.get('gymapp:settings');

  if (!settings || !settings.startDate) {
    // Initialize settings if first time
    settings = {
      startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      unit: "kg",
      theme: "dark"
    };
    storage.set('gymapp:settings', settings);
  }

  const start = new Date(settings.startDate);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Week number 1 to 12
  let rawWeek = Math.floor(diffDays / 7) + 1;
  let cycleWeek = ((rawWeek - 1) % 12) + 1; // Loops back to 1 after 12

  let phaseLabel = "";
  let isDeload = false;

  if (cycleWeek >= 1 && cycleWeek <= 2) {
    phaseLabel = "Técnica, peso ligero";
  } else if (cycleWeek >= 3 && cycleWeek <= 4) {
    phaseLabel = "+2.5kg en compuestos";
  } else if (cycleWeek >= 5 && cycleWeek <= 6) {
    phaseLabel = "+1 serie a accesorios";
  } else if (cycleWeek >= 7 && cycleWeek <= 8) {
    phaseLabel = "Progresión libre";
  } else if (cycleWeek >= 9 && cycleWeek <= 10) {
    phaseLabel = "+1 serie más";
  } else if (cycleWeek === 11) {
    phaseLabel = "Descarga (deload)";
    isDeload = true;
  } else if (cycleWeek === 12) {
    phaseLabel = "Reinicio con más peso";
  }

  return {
    weekNumber: cycleWeek,
    totalWeek: rawWeek,
    phaseLabel,
    isDeload
  };
}
