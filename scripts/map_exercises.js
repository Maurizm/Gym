const fs = require('fs');

const exercisesDb = JSON.parse(fs.readFileSync('src/data/exercises.json', 'utf8'));

// The user's requested exercises
const requestedExercises = [
  // Phase 1
  "Press de Banca con Barra",
  "Press Inclinado con Mancuernas",
  "Aperturas en Polea (Cable Fly)",
  "Fondos en Máquina (Assisted Dip)",
  "Extensión de Tríceps en Banco (Skull Crusher con Mancuerna)",
  
  "Sentadilla con Barra",
  "Peso Muerto Rumano (RDL)",
  "Thrust de Cadera con Barra (Hip Thrust)",
  "Extensión de Cuádriceps en Máquina",
  "Curl Femoral en Máquina",
  "Elevación de Talones (Gemelos) de Pie",
  "Crunch (Encogimientos abdominales)",
  
  "Jalón al Pecho con Agarre Supino (Palmas hacia ti)",
  "Remo en Polea Sentado",
  "Remo en Banco T (Chest-Supported T-Bar Row)",
  "Face Pull Sentado (Polea al rostro)",
  "Curl de Bíceps con Mancuernas (Supino)",
  
  "Peso Muerto Convencional",
  "Zancadas Caminando con Mancuernas",
  "Extensión de Cuádriceps a Una Pierna",
  "Curl Femoral a Una Pierna",
  "Abductores en Máquina Sentado",
  "Elevación de Talones de Pie",
  "Plancha Abdominal (Plank)",
  
  "Press Militar con Barra (De pie)",
  "Elevaciones Laterales con Mancuernas",
  "Pájaros en Polea (Cable Reverse Flye)",
  "Extensión de Tríceps en Polea a Una Mano con Cuerda",
  "Curl de Bíceps en Polea a Una Mano",

  // Phase 2
  "Press de Banca con Barra",
  "Press Inclinado en Máquina",
  "Aperturas en Máquina (Pec Deck)",
  "Fondos en Máquina (Assisted Dip)",
  "Patada de Tríceps en Polea (Tricep Kickback)",

  "Peso Muerto Convencional",
  "Sentadilla Goblet (Con una mancuerna al pecho)",
  "Thrust de Cadera a Una Pierna con Mancuerna",
  "Prensa de Piernas",
  "Curl Femoral Tumbado",
  "Elevación de Talones de Pie",
  "Abdominal Bicicleta (Bicycle Crunch)",

  "Jalón al Pecho Tradicional (Lat Pulldown)",
  "Remo con Mancuerna a Una Mano",
  "Remo con Barra Inclinado (Bent Over Row)",
  "Pájaros en Máquina (Reverse Pec Deck)",
  "Curl de Bíceps con Barra Z (EZ Bar Curl)",

  "Sentadilla con Barra",
  "Thrust de Cadera con Barra",
  "Peso Muerto Rumano (RDL)",
  "Curl Femoral Sentado",
  "Elevación de Talones de Pie",
  "Elevación de Piernas Colgado (Hanging Leg Raise)",
  "Abductores en Máquina Sentado",

  "Press de Hombros con Mancuernas Sentado",
  "Elevaciones Laterales en Polea",
  "Elevaciones Laterales Inclinado con Mancuernas (Pájaros)",
  "Press de Banca en el Suelo con Mancuernas (Floor Press)",
  "Curl Martillo con Mancuernas"
];

const uniqueRequested = [...new Set(requestedExercises)];

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}

const dbNormalized = exercisesDb.map(ex => ({
  ...ex,
  norm: normalize(ex.name)
}));

const mapped = [];
const notFound = [];

for (const req of uniqueRequested) {
  const normReq = normalize(req);
  
  // Try to find a match
  let match = dbNormalized.find(ex => normReq.includes(ex.norm) || ex.norm.includes(normReq));
  
  if (!match) {
    // try word matching
    const words = req.toLowerCase().replace(/[^a-z0-9áéíóúñ ]/g, '').split(' ').filter(w => w.length > 3);
    const bestMatches = dbNormalized.map(ex => {
      let score = 0;
      for (const w of words) {
        if (ex.name.toLowerCase().includes(w)) score++;
      }
      return { ex, score };
    }).sort((a, b) => b.score - a.score);
    
    if (bestMatches.length > 0 && bestMatches[0].score > 1) {
      match = bestMatches[0].ex;
    }
  }
  
  if (match) {
    mapped.push({ requested: req, matchedId: match.id, matchedName: match.name });
  } else {
    notFound.push(req);
  }
}

fs.writeFileSync('exercise_mapping.json', JSON.stringify({ mapped, notFound }, null, 2));
console.log('Mapping complete. Found:', mapped.length, 'Not Found:', notFound.length);
