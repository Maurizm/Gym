import { storage } from './storage.js';

export const progress = {
  getHistory() {
    return storage.get('gymapp:sessions', []).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getExerciseProgress(exerciseId) {
    const history = this.getHistory();
    const dataPoints = [];

    // Reverse history to get chronological order (oldest first)
    [...history].reverse().forEach(session => {
      const exLog = session.exerciseLogs.find(l => l.exerciseId === exerciseId);
      if (exLog) {
        // Find max weight used in completed sets
        let maxWeight = 0;
        exLog.sets.forEach(set => {
          if (set.completed && set.weightKg) {
            const weight = parseFloat(set.weightKg);
            if (weight > maxWeight) {
              maxWeight = weight;
            }
          }
        });

        if (maxWeight > 0) {
          dataPoints.push({
            date: session.date,
            weight: maxWeight
          });
        }
      }
    });

    return dataPoints;
  }
};
