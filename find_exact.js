const fs = require('fs');
const exercisesData = JSON.parse(fs.readFileSync('src/data/exercises.json'));

const userList = [
  "Barbell Bench Press", "Dumbbell Bench Press", "Machine Chest Press", "Smith Machine Bench Press",
  "Incline Dumbbell Press", "Barbell Incline Press", "Machine Incline Press",
  "Seated Dumbbell Shoulder Press", "Barbell Overhead Press", "Machine Shoulder Press", "Arnold Press",
  "Cable Crossover", "Pec Deck Machine", "Dumbbell Fly",
  "Dumbbell Lateral Raise", "Cable Lateral Raise", "Machine Lateral Raise",
  "Rope Triceps Pushdown", "V-Bar Pressdown", "Dumbbell Triceps Kickback", "Overhead Rope Extension",
  
  "Conventional Deadlift", "Sumo Deadlift", "Trap Bar Deadlift", "Rack Pull", "Block Pull",
  "Pendlay Row", "Barbell Row", "Chest-Supported T-Bar Row", "Dumbbell Row", "Cable Seated Row",
  "Pull-ups", "Lat Pulldown", "Assisted Pull-up Machine", "Neutral-Grip Pulldown",
  "Seated Cable Row (Close Grip)", "Machine Chest-Supported Row",
  "Face Pull", "Band Pull-Apart", "Reverse Cable Crossover", "Reverse Pec Deck",
  "EZ Bar Bicep Curl", "Dumbbell Curl", "Cable Curl", "Barbell Curl",
  
  "Barbell Back Squat", "Hack Squat", "Leg Press", "Back Extensions", "Smith Machine Squat",
  "Romanian Deadlift", "Stiff Leg Deadlift", "Good Morning", "Dumbbell RDL",
  "Goblet Squat", "Dumbbell Walking Lunge",
  "Lying Leg Curl", "Seated Leg Curl", "Sliding Leg Curl", "Dumbbell Leg Curl",
  "Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise",
  "Cable Crunch", "Weighted Crunch", "Hanging Leg Raise", "V-Sit Up",
  
  "Close-Grip Bench Press", "Dumbbell Close-Grip Press", "Floor Press", "Dip",
  "One-Arm Dumbbell Row", "Cable Single-Arm Row", "Chest-Supported Dumbbell Row",
  "Arnold Press", "Supinated Lat Pulldown", "Chin-Ups", "Pronated Lat Pulldown",
  "Dumbbell Reverse Fly", "Dumbbell Hammer Curl", "Rope Hammer Curl", "EZ Bar Pronated Curl",
  "Lying Dumbbell Skull Crusher", "EZ Bar Skull Crusher", "Cable Kickback",
  
  "Barbell Hip Thrust", "Glute Bridge", "45° Hyperextension", "Cable Pull-Through",
  "Dumbbell Walking Lunges", "Dumbbell Step-Up", "Bulgarian Split Squat", "Reverse Lunge",
  "Front Squat", "Safety Bar Squat", "Leg Extension", "Sissy Squat", "Constant-Tension Goblet Squat",
  "Captain’s Chair Crunch", "Lying Leg Raise", "Push-Ups", "Ab Wheel Rollout", "Plank"
];

function searchEx(query) {
  const q = query.toLowerCase().replace(/[^a-z ]/g, '').trim();
  
  // exact
  let match = exercisesData.find(e => e.name.toLowerCase() === q);
  if (match) return match.name;
  
  // includes
  match = exercisesData.find(e => e.name.toLowerCase() === q + " ");
  if (match) return match.name;
  
  // words
  const words = q.split(' ').filter(w => w.length > 2);
  let best = null;
  let bestScore = 0;
  for (const ex of exercisesData) {
    const en = ex.name.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (en.includes(w)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = ex.name;
    }
  }
  return bestScore >= words.length - 1 ? best : "NOT_FOUND";
}

for (const u of userList) {
  console.log(u + " => " + searchEx(u));
}
