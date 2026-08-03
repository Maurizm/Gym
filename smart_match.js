const fs = require('fs');
const exercisesData = JSON.parse(fs.readFileSync('src/data/exercises.json'));

function smartMatch(query) {
  const words = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;
  for (const ex of exercisesData) {
    const exWords = ex.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
    let score = 0;
    for (const w of words) {
      if (exWords.includes(w)) score += 1;
      else if (exWords.some(ew => ew.includes(w) || w.includes(ew))) score += 0.5;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = ex.name;
    }
  }
  return bestMatch;
}

const queries = [
  "barbell bench press",
  "dumbbell incline bench press",
  "dumbbell seated shoulder press",
  "cable crossover",
  "dumbbell lateral raise",
  "rope triceps pushdown",
  "barbell deadlift",
  "barbell bent over row",
  "pull-up",
  "cable seated row",
  "cable face pull",
  "ez bar bicep curl",
  "barbell back squat",
  "barbell romanian deadlift",
  "leg press",
  "lying leg curl",
  "standing calf raise",
  "cable crunch",
  "close-grip bench press",
  "one-arm dumbbell row",
  "arnold press",
  "supinated lat pulldown",
  "dumbbell reverse fly",
  "dumbbell hammer curl",
  "lying dumbbell skull crusher",
  "barbell hip thrust",
  "dumbbell walking lunges",
  "front squat",
  "leg extension",
  "seated leg curl",
  "hanging leg raise",
  "dumbbell bench press",
  "dumbbell curl",
  "dumbbell rdl",
  "machine shoulder press",
  "lat pulldown",
  "pec deck machine",
  "plank"
];

for (const q of queries) {
  console.log(`${q}  --->  ${smartMatch(q)}`);
}
