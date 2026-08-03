const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/exercises.json');
const exercisesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function generateId() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

const customExercises = [
  {
    "id": generateId(),
    "name": "dead hang",
    "category": "back",
    "body_part": "back",
    "target": "lats",
    "equipment": "pull-up bar",
    "image": "assets/images/placeholder.gif",
    "gif_url": "assets/images/placeholder.gif", 
    "instructions": {
      "en": "Grab a pull-up bar with an overhand grip and simply hang from it. Keep your arms straight and relax your body.",
      "es": "Agarra una barra de dominadas con agarre prono y simplemente cuélgate. Mantén los brazos estirados y relaja el cuerpo."
    }
  }
];

// Comprobar si ya existe
if (!exercisesData.some(e => e.name === "dead hang")) {
  exercisesData.unshift(customExercises[0]);
  fs.writeFileSync(filePath, JSON.stringify(exercisesData, null, 2), 'utf8');
  console.log('Dead hang added to exercises.json!');
} else {
  console.log('Dead hang already exists.');
}
