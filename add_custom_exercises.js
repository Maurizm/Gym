const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/exercises.json');
const exercisesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Generate a random numeric ID for the custom exercises
function generateId() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

const customExercises = [
  {
    "id": generateId(),
    "name": "inverted row",
    "category": "back",
    "body_part": "back",
    "target": "upper back",
    "equipment": "bar",
    "image": "assets/images/placeholder.gif",
    "gif_url": "videos/Inverted Row.gif",
    "instructions": {
      "en": "Place a bar in a rack at waist height. Hang underneath with an overhand grip, keeping your body straight. Pull your chest to the bar by retracting your shoulder blades, then lower yourself with control.",
      "es": "Coloca una barra en un rack a la altura de la cintura. Cuélgate por debajo con agarre prono manteniendo el cuerpo recto. Tira de tu pecho hacia la barra retrayendo los omóplatos, y baja controladamente."
    }
  },
  {
    "id": generateId(),
    "name": "scapular pull-up",
    "category": "back",
    "body_part": "back",
    "target": "traps",
    "equipment": "pull-up bar",
    "image": "assets/images/placeholder.gif",
    "gif_url": "videos/Scapular Pull-up.gif",
    "instructions": {
      "en": "Hang from a pull-up bar with straight arms. Without bending your elbows, pull your shoulder blades down and together to lift your body slightly. Pause, then lower under control.",
      "es": "Cuélgate de una barra de dominadas con los brazos estirados. Sin doblar los codos, tira de los omóplatos hacia abajo y júntalos para elevar ligeramente tu cuerpo. Pausa y baja con control."
    }
  }
];

// Comprobar si ya existen para no duplicar
for (const customEx of customExercises) {
  if (!exercisesData.some(e => e.name === customEx.name)) {
    exercisesData.unshift(customEx);
  }
}

fs.writeFileSync(filePath, JSON.stringify(exercisesData, null, 2), 'utf8');
console.log('Custom exercises added to exercises.json!');
