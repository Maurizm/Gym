const fs = require('fs');
const path = require('path');

const exercisesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/exercises.json'), 'utf8'));

// Exact dataset names map for the alternatives and main exercises
const dbMap = {
  // WARMUPS
  "Hanging Leg Raise": "hanging leg raise",
  "Scapular Pull-up": "scapular pull-up",
  "Inverted Row": "inverted row",
  "Ankle Circles": "ankle circles",
  "All Fours Squad Stretch": "all fours squad stretch",
  "Arms Apart Circular Toe Touch": "arms apart circular toe touch (male)",

  // MAIN
  "Barbell Bench Press": "barbell bench press",
  "Dumbbell Bench Press": "dumbbell bench press",
  "Machine Chest Press": "lever chest press",
  "Smith Machine Bench Press": "smith machine bench press",
  "Incline Dumbbell Press": "dumbbell incline bench press",
  "Barbell Incline Press": "barbell incline bench press",
  "Machine Incline Press": "lever incline chest press",
  "Seated Dumbbell Shoulder Press": "dumbbell seated shoulder press",
  "Barbell Overhead Press": "barbell seated overhead press",
  "Machine Shoulder Press": "lever shoulder press",
  "Arnold Press": "dumbbell arnold press",
  "Cable Crossover (Cable Fly)": "cable cross-over",
  "Pec Deck Machine": "lever seated fly",
  "Dumbbell Fly": "dumbbell fly",
  "Dumbbell Lateral Raise": "dumbbell lateral raise",
  "Cable Lateral Raise": "cable lateral raise",
  "Machine Lateral Raise": "lever lateral raise",
  "Rope Triceps Pushdown": "cable triceps pushdown",
  "V-Bar Pressdown": "cable triceps pushdown (v-bar)",
  "Dumbbell Triceps Kickback": "dumbbell triceps kickback",
  "Overhead Rope Extension": "cable overhead triceps extension (rope attachment)",
  
  "Conventional or Sumo Deadlift": "barbell deadlift",
  "Trap Bar Deadlift": "trap bar deadlift",
  "Rack Pull": "barbell rack pull",
  "Block Pull": "barbell rack pull",
  "Pendlay Row / Barbell Row": "barbell bent over row",
  "Chest-Supported T-Bar Row": "lever t bar row",
  "Dumbbell Row": "dumbbell bent over row",
  "Cable Seated Row": "cable seated row",
  "Seated Cable Row": "cable seated row",
  "Pull-ups (or Lat Pulldown)": "pull-up",
  "Assisted Pull-up Machine": "assisted pull-up",
  "Neutral-Grip Pulldown": "cable pulldown",
  "Seated Cable Row (Close Grip)": "cable seated row",
  "Machine Chest-Supported Row": "lever seated row",
  "Face Pull (Rope)": "cable rear pulldown",
  "Band Pull-Apart": "band pull apart",
  "Reverse Cable Crossover": "cable cross-over revers fly",
  "Reverse Pec Deck": "lever reverse pec deck fly",
  "EZ Bar Bicep Curl": "ez barbell curl",
  "Dumbbell Curl": "dumbbell alternate biceps curl",
  "Cable Curl": "cable curl",
  "Barbell Curl": "barbell curl",

  "Barbell Back Squat": "barbell full squat",
  "Hack Squat": "sled hack squat",
  "Leg Press": "sled 45",
  "Back Extensions": "hyperextension",
  "Smith Machine Squat": "smith machine squat",
  "Romanian Deadlift (RDL)": "barbell romanian deadlift",
  "Stiff Leg Deadlift": "barbell stiff leg deadlift",
  "Good Morning": "barbell good morning",
  "Dumbbell RDL": "dumbbell romanian deadlift",
  "Goblet Squat": "dumbbell goblet squat",
  "Dumbbell Walking Lunge": "dumbbell lunge",
  "Lying Leg Curl": "lever lying leg curl",
  "Seated Leg Curl": "lever seated leg curl",
  "Sliding Leg Curl": "lever lying leg curl",
  "Dumbbell Leg Curl": "dumbbell lying leg curl",
  "Standing Calf Raise": "lever standing calf raise",
  "Seated Calf Raise": "lever seated calf raise",
  "Leg Press Calf Raise": "sled calf press on leg press",
  "Cable Crunch": "cable kneeling crunch",
  "Weighted Crunch": "weighted crunch",
  "Hanging Leg Raise": "hanging leg raise",
  "V-Sit Up": "crunch",

  "Close-Grip Bench Press": "barbell close-grip bench press",
  "Dumbbell Close-Grip Press": "dumbbell close-grip press",
  "Floor Press": "barbell floor press",
  "Dip": "triceps dip",
  "One-Arm Dumbbell Row": "dumbbell bent over row",
  "Cable Single-Arm Row": "cable seated one arm row",
  "Chest-Supported Dumbbell Row": "dumbbell incline row",
  "Arnold Press": "dumbbell arnold press",
  "Supinated Lat Pulldown": "cable reverse-grip pulldown",
  "Chin-Ups": "chin-up",
  "Pronated Lat Pulldown": "cable pulldown",
  "Dumbbell Reverse Fly": "dumbbell reverse fly",
  "Dumbbell Hammer Curl": "dumbbell hammer curl",
  "Rope Hammer Curl": "cable hammer curl (with rope)",
  "EZ Bar Pronated Curl": "ez barbell reverse curl",
  "Lying Dumbbell Skull Crusher": "dumbbell lying triceps extension",
  "EZ Bar Skull Crusher": "barbell lying triceps extension skull crusher",
  "Cable Kickback": "cable kickback",

  "Barbell Hip Thrust": "barbell glute bridge",
  "Glute Bridge": "barbell glute bridge",
  "45° Hyperextension": "hyperextension",
  "Cable Pull-Through": "cable pull through (with rope)",
  "Dumbbell Walking Lunges": "dumbbell lunge",
  "Dumbbell Step-Up": "dumbbell step-up",
  "Bulgarian Split Squat": "barbell bulgarian split squat",
  "Reverse Lunge": "dumbbell reverse lunge",
  "Front Squat": "barbell front squat",
  "Safety Bar Squat": "barbell front squat",
  "Leg Extension": "lever leg extension",
  "Sissy Squat": "sissy squat",
  "Constant-Tension Goblet Squat": "dumbbell goblet squat",
  "Captain’s Chair Crunch": "captains chair straight leg raise",
  "Lying Leg Raise": "lying leg raise",
  "Push-Ups": "push-up",
  "Ab Wheel Rollout": "wheel rollout",
  "Plank": "front plank",
  
  "Dumbbell or Light Barbell RDL": "dumbbell romanian deadlift",
  "Lat Pulldown": "cable pulldown"
};

const esTranslations = {
  // WARMUPS
  "Hanging Leg Raise": "Elevación de Piernas Colgado",
  "Scapular Pull-up": "Dominada Escapular",
  "Inverted Row": "Remo Invertido",
  "Ankle Circles": "Rotación de Tobillos",
  "All Fours Squad Stretch": "Estiramiento en Cuadrupedia",
  "Arms Apart Circular Toe Touch": "Toque de Puntas de Pie Circular",

  // MAIN EXERCISES
  "Barbell Bench Press": "Press de Banca con Barra",
  "Dumbbell Bench Press": "Press de Banca con Mancuernas",
  "Machine Chest Press": "Press de Pecho en Máquina",
  "Smith Machine Bench Press": "Press de Banca en Multipower",
  "Incline Dumbbell Press": "Press Inclinado con Mancuernas",
  "Barbell Incline Press": "Press Inclinado con Barra",
  "Machine Incline Press": "Press Inclinado en Máquina",
  "Seated Dumbbell Shoulder Press": "Press de Hombros Sentado (Mancuernas)",
  "Barbell Overhead Press": "Press Militar con Barra",
  "Machine Shoulder Press": "Press de Hombros en Máquina",
  "Arnold Press": "Press Arnold",
  "Cable Crossover (Cable Fly)": "Cruce de Poleas",
  "Pec Deck Machine": "Máquina Pec Deck (Aperturas)",
  "Dumbbell Fly": "Aperturas con Mancuernas",
  "Dumbbell Lateral Raise": "Elevaciones Laterales con Mancuernas",
  "Cable Lateral Raise": "Elevaciones Laterales en Polea",
  "Machine Lateral Raise": "Elevaciones Laterales en Máquina",
  "Rope Triceps Pushdown": "Extensión de Tríceps con Cuerda",
  "V-Bar Pressdown": "Extensión de Tríceps (Barra V)",
  "Dumbbell Triceps Kickback": "Patada de Tríceps con Mancuerna",
  "Overhead Rope Extension": "Extensión de Tríceps sobre Cabeza (Cuerda)",

  "Conventional or Sumo Deadlift": "Peso Muerto Convencional o Sumo",
  "Trap Bar Deadlift": "Peso Muerto con Barra Hexagonal",
  "Rack Pull": "Rack Pull (Tirón desde Soportes)",
  "Block Pull": "Peso Muerto desde Bloques",
  "Pendlay Row / Barbell Row": "Remo Pendlay / Remo con Barra",
  "Chest-Supported T-Bar Row": "Remo en Punta Apoyado al Pecho",
  "Dumbbell Row": "Remo con Mancuerna",
  "Cable Seated Row": "Remo Sentado en Polea",
  "Seated Cable Row": "Remo Sentado en Polea",
  "Pull-ups (or Lat Pulldown)": "Dominadas (o Jalón al Pecho)",
  "Assisted Pull-up Machine": "Dominadas Asistidas",
  "Neutral-Grip Pulldown": "Jalón al Pecho (Agarre Neutro)",
  "Seated Cable Row (Close Grip)": "Remo Gironda (Agarre Estrecho)",
  "Machine Chest-Supported Row": "Remo en Máquina Apoyado al Pecho",
  "Face Pull (Rope)": "Face Pull con Cuerda",
  "Band Pull-Apart": "Separaciones con Banda Elástica",
  "Reverse Cable Crossover": "Cruces Inversos en Polea",
  "Reverse Pec Deck": "Pájaros en Máquina (Pec Deck Inverso)",
  "EZ Bar Bicep Curl": "Curl de Bíceps con Barra EZ",
  "Dumbbell Curl": "Curl de Bíceps con Mancuernas",
  "Cable Curl": "Curl de Bíceps en Polea",
  "Barbell Curl": "Curl de Bíceps con Barra",

  "Barbell Back Squat": "Sentadilla Trasera con Barra",
  "Hack Squat": "Sentadilla Hack",
  "Leg Press": "Prensa de Piernas",
  "Back Extensions": "Extensiones de Espalda",
  "Smith Machine Squat": "Sentadilla en Multipower",
  "Romanian Deadlift (RDL)": "Peso Muerto Rumano (RDL)",
  "Stiff Leg Deadlift": "Peso Muerto Piernas Rígidas",
  "Good Morning": "Buenos Días",
  "Dumbbell RDL": "Peso Muerto Rumano con Mancuernas",
  "Goblet Squat": "Sentadilla Goblet",
  "Dumbbell Walking Lunge": "Zancadas Caminando con Mancuernas",
  "Lying Leg Curl": "Curl de Isquios Tumbado",
  "Seated Leg Curl": "Curl de Isquios Sentado",
  "Sliding Leg Curl": "Curl Deslizante de Isquios",
  "Dumbbell Leg Curl": "Curl de Isquios con Mancuerna",
  "Standing Calf Raise": "Elevación de Talones de Pie",
  "Seated Calf Raise": "Elevación de Talones Sentado",
  "Leg Press Calf Raise": "Elevación de Talones en Prensa",
  "Cable Crunch": "Crunch Abdominal en Polea",
  "Weighted Crunch": "Crunch con Peso",
  "V-Sit Up": "Elevaciones en V",

  "Close-Grip Bench Press": "Press de Banca (Agarre Cerrado)",
  "Dumbbell Close-Grip Press": "Press con Mancuernas (Agarre Cerrado)",
  "Floor Press": "Press de Suelo",
  "Dip": "Fondos en Paralelas",
  "One-Arm Dumbbell Row": "Remo a una Mano con Mancuerna",
  "Cable Single-Arm Row": "Remo a una Mano en Polea",
  "Chest-Supported Dumbbell Row": "Remo con Mancuernas Apoyado al Pecho",
  "Supinated Lat Pulldown": "Jalón al Pecho Supino",
  "Chin-Ups": "Dominadas Supinas",
  "Pronated Lat Pulldown": "Jalón al Pecho Prono",
  "Dumbbell Reverse Fly": "Pájaros con Mancuernas (Vuelo Inverso)",
  "Dumbbell Hammer Curl": "Curl Martillo con Mancuernas",
  "Rope Hammer Curl": "Curl Martillo con Cuerda",
  "EZ Bar Pronated Curl": "Curl Prono con Barra EZ",
  "Lying Dumbbell Skull Crusher": "Rompecráneos con Mancuernas",
  "EZ Bar Skull Crusher": "Rompecráneos con Barra EZ",
  "Cable Kickback": "Patada de Tríceps en Polea",

  "Barbell Hip Thrust": "Hip Thrust con Barra",
  "Glute Bridge": "Puente de Glúteos",
  "45° Hyperextension": "Hiperextensiones a 45°",
  "Cable Pull-Through": "Pull-Through en Polea",
  "Dumbbell Walking Lunges": "Zancadas Caminando con Mancuernas",
  "Dumbbell Step-Up": "Subidas a Cajón con Mancuernas",
  "Bulgarian Split Squat": "Sentadilla Búlgara",
  "Reverse Lunge": "Zancada Inversa",
  "Front Squat": "Sentadilla Frontal",
  "Safety Bar Squat": "Sentadilla con Barra de Seguridad",
  "Leg Extension": "Extensión de Cuádriceps",
  "Sissy Squat": "Sentadilla Sissy",
  "Constant-Tension Goblet Squat": "Sentadilla Goblet (Tensión Constante)",
  "Captain’s Chair Crunch": "Elevación de Piernas en Silla Romana",
  "Lying Leg Raise": "Elevación de Piernas Tumbado",
  "Push-Ups": "Flexiones",
  "Ab Wheel Rollout": "Rueda Abdominal",
  "Plank": "Plancha Abdominal",
  
  "Dumbbell or Light Barbell RDL": "Peso Muerto Rumano Ligero",
  "Lat Pulldown": "Jalón al Pecho"
};

function translateName(name) {
  return esTranslations[name] || name;
}

function getDatasetMatch(userStr) {
  let dbName = dbMap[userStr];
  if (!dbName) {
    dbName = userStr.toLowerCase();
  }
  
  let match = exercisesData.find(e => e.name.toLowerCase() === dbName.toLowerCase());
  if (match) return match;

  match = exercisesData.find(e => e.name.toLowerCase().includes(dbName.toLowerCase()));
  if (match) return match;

  const words = dbName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
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
      best = ex;
    }
  }
  
  if (bestScore > 0) return best;
  return null;
}

const upperWarmups = [
  { name: "Hanging Leg Raise", sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true },
  { name: "Scapular Pull-up", sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true },
  { name: "Inverted Row", sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true }
];

const lowerWarmups = [
  { name: "Ankle Circles", sets: 1, repsMin: 10, repsMax: 15, perSide: true, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true },
  { name: "All Fours Squad Stretch", sets: 1, repsMin: 30, repsMax: 45, unit: "seg", restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true },
  { name: "Arms Apart Circular Toe Touch", sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true }
];

const fullBodyWarmups = [
  { name: "Hanging Leg Raise", sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true },
  { name: "Inverted Row", sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true },
  { name: "Arms Apart Circular Toe Touch", sets: 1, repsMin: 10, repsMax: 15, restSeconds: 0, alts: [], notes: "Calentamiento", isWarmup: true }
];

const routineMap = {
  monday: {
    label: "PUSH (Empuje - Énfasis Pesado)",
    intensity: "Alta (RPE 8-10)",
    note: "Fuerza en press de banca y hombros.",
    exercises: [
      ...upperWarmups,
      { name: "Barbell Bench Press", sets: 3, repsMin: 5, repsMax: 8, restSeconds: 240, alts: ["Dumbbell Bench Press", "Machine Chest Press", "Smith Machine Bench Press"] },
      { name: "Incline Dumbbell Press", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, alts: ["Barbell Incline Press", "Machine Incline Press"] },
      { name: "Seated Dumbbell Shoulder Press", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, alts: ["Barbell Overhead Press", "Machine Shoulder Press", "Arnold Press"] },
      { name: "Cable Crossover (Cable Fly)", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Pec Deck Machine", "Dumbbell Fly"] },
      { name: "Dumbbell Lateral Raise", sets: 4, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Cable Lateral Raise", "Machine Lateral Raise"] },
      { name: "Rope Triceps Pushdown", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["V-Bar Pressdown", "Dumbbell Triceps Kickback", "Overhead Rope Extension"] }
    ]
  },
  tuesday: {
    label: "PULL (Tirón - Énfasis Espesor)",
    intensity: "Alta (RPE 8-9)",
    note: "Remos pesados y dorsal ancho.",
    exercises: [
      ...upperWarmups,
      { name: "Conventional or Sumo Deadlift", sets: 3, repsMin: 5, repsMax: 5, restSeconds: 300, alts: ["Trap Bar Deadlift", "Rack Pull", "Block Pull"] },
      { name: "Pendlay Row / Barbell Row", sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, alts: ["Chest-Supported T-Bar Row", "Dumbbell Row", "Cable Seated Row"] },
      { name: "Pull-ups (or Lat Pulldown)", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, alts: ["Assisted Pull-up Machine", "Neutral-Grip Pulldown"] },
      { name: "Seated Cable Row (Close Grip)", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["Machine Chest-Supported Row", "Dumbbell Row"] },
      { name: "Face Pull (Rope)", sets: 3, repsMin: 15, repsMax: 20, restSeconds: 120, alts: ["Band Pull-Apart", "Reverse Cable Crossover", "Reverse Pec Deck"] },
      { name: "EZ Bar Bicep Curl", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, alts: ["Dumbbell Curl", "Cable Curl", "Barbell Curl"] }
    ]
  },
  wednesday: {
    label: "LEGS (Piernas - Cuádriceps/Femorales)",
    intensity: "Alta (RPE 8-10)",
    note: "Sentadilla pesada y estímulo metabólico.",
    exercises: [
      ...lowerWarmups,
      { name: "Barbell Back Squat", sets: 3, repsMin: 5, repsMax: 8, restSeconds: 240, alts: ["Hack Squat", "Leg Press", "Smith Machine Squat"] },
      { name: "Romanian Deadlift (RDL)", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, alts: ["Stiff Leg Deadlift", "Good Morning", "Dumbbell RDL"] },
      { name: "Leg Press", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 180, alts: ["Goblet Squat", "Dumbbell Walking Lunge"] },
      { name: "Lying Leg Curl", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Seated Leg Curl", "Sliding Leg Curl", "Dumbbell Leg Curl"] },
      { name: "Standing Calf Raise", sets: 4, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["Seated Calf Raise", "Leg Press Calf Raise"] },
      { name: "Cable Crunch", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Weighted Crunch", "Hanging Leg Raise", "V-Sit Up"] }
    ]
  },
  thursday: {
    label: "UPPER (Tren Superior - Hipertrofia)",
    intensity: "Media (RPE 8-10)",
    note: "Repeticiones moderadas/altas, menos peso, máximo control.",
    exercises: [
      ...upperWarmups,
      { name: "Close-Grip Bench Press", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, alts: ["Dumbbell Close-Grip Press", "Floor Press", "Dip"] },
      { name: "One-Arm Dumbbell Row", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["Cable Single-Arm Row", "Chest-Supported Dumbbell Row"] },
      { name: "Arnold Press", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["Seated Dumbbell Shoulder Press", "Machine Shoulder Press"] },
      { name: "Supinated Lat Pulldown", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Chin-Ups", "Pronated Lat Pulldown"] },
      { name: "Dumbbell Reverse Fly", sets: 3, repsMin: 15, repsMax: 15, restSeconds: 60, alts: ["Reverse Pec Deck", "Reverse Cable Crossover"] },
      { name: "Dumbbell Hammer Curl", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 0, alts: ["Rope Hammer Curl", "EZ Bar Pronated Curl"] },
      { name: "Lying Dumbbell Skull Crusher", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, alts: ["EZ Bar Skull Crusher", "Overhead Rope Extension", "Cable Kickback"] }
    ]
  },
  friday: {
    label: "LOWER (Tren Inferior - Glúteos)",
    intensity: "Media (RPE 8-10)",
    note: "Carga mecánica en femorales/glúteos y aislamiento de cuádriceps.",
    exercises: [
      ...lowerWarmups,
      { name: "Barbell Hip Thrust", sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, alts: ["Glute Bridge", "45° Hyperextension", "Cable Pull-Through"] },
      { name: "Dumbbell Walking Lunges", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, perSide: true, alts: ["Dumbbell Step-Up", "Bulgarian Split Squat", "Reverse Lunge"] },
      { name: "Front Squat", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, alts: ["Goblet Squat", "Safety Bar Squat", "Leg Press"] },
      { name: "Leg Extension", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Sissy Squat", "Constant-Tension Goblet Squat"] },
      { name: "Seated Leg Curl", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Lying Leg Curl", "Sliding Leg Curl"] },
      { name: "Hanging Leg Raise", sets: 3, repsMin: 10, repsMax: 15, restSeconds: 120, alts: ["Captain’s Chair Crunch", "Lying Leg Raise", "V-Sit Up"] }
    ]
  },
  saturday: {
    label: "Full Body 1 (Enfoque Fuerza Funcional)",
    intensity: "Baja (RPE 7)",
    note: "Ocasional, no debe interferir con la recuperación.",
    exercises: [
      ...fullBodyWarmups,
      { name: "Barbell Back Squat", sets: 3, repsMin: 6, repsMax: 8, restSeconds: 120, alts: ["Hack Squat", "Leg Press"] },
      { name: "Dumbbell Bench Press", sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, alts: ["Machine Chest Press", "Push-Ups"] },
      { name: "Seated Cable Row", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, alts: ["Dumbbell Row", "Chest-Supported Dumbbell Row"] },
      { name: "Dumbbell Lateral Raise", sets: 3, repsMin: 15, repsMax: 15, restSeconds: 90, alts: ["Cable Lateral Raise"] },
      { name: "Dumbbell Curl", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 0, alts: ["EZ Bar Bicep Curl"] },
      { name: "Rope Triceps Pushdown", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, alts: ["Overhead Rope Extension"] }
    ]
  },
  sunday: {
    label: "Full Body 2 (Máquinas / Hipertrofia)",
    intensity: "Baja (RPE 7)",
    note: "Ocasional, no debe interferir con la recuperación.",
    exercises: [
      ...fullBodyWarmups,
      { name: "Leg Press", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["Goblet Squat"] },
      { name: "Dumbbell or Light Barbell RDL", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["Good Morning", "Cable Pull-Through"] },
      { name: "Machine Shoulder Press", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, alts: ["Seated Dumbbell Shoulder Press"] },
      { name: "Lat Pulldown", sets: 3, repsMin: 12, repsMax: 15, restSeconds: 120, alts: ["Assisted Pull-up Machine"] },
      { name: "Pec Deck Machine", sets: 3, repsMin: 15, repsMax: 15, restSeconds: 90, alts: ["Cable Crossover (Cable Fly)", "Dumbbell Fly"] },
      { name: "Plank", sets: 3, repsMin: 40, repsMax: 60, unit: "seg", restSeconds: 60, alts: ["Cable Crunch", "Ab Wheel Rollout"] }
    ]
  }
};

const daysMap = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const finalRoutine = { days: [] };
let exIdCount = 1;

for (let i = 0; i < daysMap.length; i++) {
  const dayId = daysMap[i];
  const config = routineMap[dayId];
  const dayObj = {
    id: dayId,
    dayNumber: i + 1,
    label: config.label,
    intensity: config.intensity,
    note: config.note,
    exercises: []
  };

  for (const ex of config.exercises) {
    const mainMatch = getDatasetMatch(ex.name);
    
    let notesData = "";
    if (ex.notes) notesData += ex.notes;
    if (ex.alts && ex.alts.length > 0) {
      if (notesData) notesData += " | ";
      notesData += "Alt: " + ex.alts.map(a => translateName(a)).join(', ');
    }

    const exObj = {
      id: "ex-" + exIdCount++,
      name: translateName(ex.name),
      sets: ex.sets,
      repsMin: ex.repsMin,
      repsMax: ex.repsMax,
      restSeconds: ex.restSeconds,
      notes: notesData || undefined,
      isWarmup: ex.isWarmup
    };
    if (ex.unit) exObj.unit = ex.unit;
    if (ex.perSide) exObj.perSide = ex.perSide;

    let imageUrls = [];
    
    if (mainMatch) {
      exObj.imageUrl = "/" + mainMatch.gif_url;
      imageUrls.push("/" + mainMatch.gif_url);
    } else {
      exObj.imageUrl = "/assets/images/placeholder.gif";
      imageUrls.push("/assets/images/placeholder.gif");
    }

    if (ex.alts) {
      for (const alt of ex.alts) {
        const altMatch = getDatasetMatch(alt);
        if (altMatch) {
          imageUrls.push("/" + altMatch.gif_url);
        }
      }
    }
    
    exObj.imageUrls = [...new Set(imageUrls)];
    
    dayObj.exercises.push(exObj);
  }
  
  finalRoutine.days.push(dayObj);
}

fs.writeFileSync(path.join(__dirname, 'src/data/routine.json'), JSON.stringify(finalRoutine, null, 2), 'utf8');
console.log('Routine updated with SPANISH translations!');
