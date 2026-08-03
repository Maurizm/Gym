const fs = require('fs');
const path = require('path');

const exercisesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/exercises.json'), 'utf8'));

function findExercise(query) {
  const q = query.toLowerCase().trim();
  const exact = exercisesData.find(e => e.name.toLowerCase() === q);
  if (exact) return exact;
  const partial = exercisesData.find(e => e.name.toLowerCase().includes(q));
  return partial || null;
}

const queries = [
  "barbell bench press",
  "dumbbell incline bench press",
  "dumbbell seated shoulder press",
  "cable crossover",
  "dumbbell lateral raise",
  "cable triceps pushdown",
  "barbell deadlift",
  "barbell bent over row",
  "pull-up",
  "cable seated row",
  "cable face pull",
  "ez barbell curl",
  "barbell full squat",
  "barbell romanian deadlift",
  "sled leg press",
  "lever lying leg curl",
  "lever standing calf raise",
  "cable crunch",
  "barbell close grip bench press",
  "dumbbell one arm row",
  "dumbbell arnold press",
  "cable reverse grip pulldown",
  "dumbbell reverse fly",
  "dumbbell hammer curl",
  "barbell lying triceps extension",
  "barbell hip thrust",
  "dumbbell lunge",
  "barbell front squat",
  "lever leg extension",
  "lever seated leg curl",
  "hanging leg raise",
  "dumbbell bench press",
  "dumbbell biceps curl",
  "dumbbell romanian deadlift",
  "lever seated shoulder press",
  "lever pec deck fly",
  "front plank"
];

queries.forEach(q => {
  const match = findExercise(q);
  if (!match) {
    console.log(`FAILED TO MATCH: ${q}`);
  }
});
