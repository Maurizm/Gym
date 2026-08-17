const fs = require('fs');
const exercisesData = JSON.parse(fs.readFileSync('src/data/exercises.json'));

function findEx(nameOrId) {
  let ex = exercisesData.find(e => e.id === nameOrId);
  if (!ex) {
    ex = exercisesData.find(e => e.name.toLowerCase() === nameOrId.toLowerCase());
  }
  if (!ex) {
    ex = exercisesData.find(e => e.name.toLowerCase().includes(nameOrId.toLowerCase()));
  }
  return ex;
}

function createRoutineExercise(searchStr, spanishName, sets, repsMin, repsMax, notes = '') {
  const ex = findEx(searchStr);
  if (!ex) {
    console.warn(`[WARNING] Could not find exercise matching: ${searchStr}`);
    return {
      id: `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: spanishName,
      sets,
      repsMin,
      repsMax,
      unit: "reps",
      notes
    };
  }
  return {
    id: ex.id,
    name: spanishName, // Usamos el nombre en español para la UI
    sets,
    repsMin,
    repsMax,
    unit: ex.unit || "reps",
    perSide: ex.perSide,
    imageUrl: ex.gif_url || ex.image,
    imageUrls: undefined,
    notes: ex.instructions?.es || notes
  };
}

const routineData = {
  version: 7,
  programStartDate: Date.now(),
  phases: [
    {
      id: "phase1",
      name: "Base de Fuerza (Fase 1)",
      days: [
        {
          id: "monday",
          dayNumber: 1,
          label: "Pecho y Tríceps",
          intensity: "Alta",
          exercises: [
            createRoutineExercise("barbell bench press", "Press de Banca con Barra", 3, 5, 8, "Baja la barra al pecho con control."),
            createRoutineExercise("dumbbell incline bench press", "Press Inclinado con Mancuernas", 3, 8, 10, "Ángulo de 30 grados máximo."),
            createRoutineExercise("lever seated fly", "Aperturas en Polea", 3, 12, 15, "Concéntrate en el estiramiento del pecho."),
            createRoutineExercise("barbell lying triceps extension skull crusher", "Skull Crusher (Extensión Tríceps)", 3, 8, 10, "Baja la barra hacia la frente."),
            createRoutineExercise("cable pushdown", "Extensión de Tríceps en Polea", 3, 12, 15, "Mantén los codos pegados al cuerpo.")
          ]
        },
        {
          id: "tuesday",
          dayNumber: 2,
          label: "Piernas (Enfoque Cuádriceps)",
          intensity: "Muy Alta",
          exercises: [
            createRoutineExercise("barbell full squat", "Sentadilla con Barra", 3, 5, 8, "Baja hasta romper el paralelo."),
            createRoutineExercise("barbell romanian deadlift", "Peso Muerto Rumano (RDL)", 3, 8, 10, "Siente el estiramiento en los isquios."),
            createRoutineExercise("sled 45° leg press", "Prensa de Piernas", 3, 10, 12, "Empuja a través del talón."),
            createRoutineExercise("leg extension", "Extensión de Cuádriceps", 3, 12, 15, "Sostén 1 segundo arriba."),
            createRoutineExercise("seated leg curl", "Curl Femoral", 3, 10, 12, "Controla la fase excéntrica."),
            createRoutineExercise("lever seated calf raise", "Elevación de Gemelos", 4, 12, 15, "Estiramiento completo abajo.")
          ]
        },
        {
          id: "wednesday",
          dayNumber: 3,
          label: "Espalda y Bíceps",
          intensity: "Media-Alta",
          exercises: [
            createRoutineExercise("cable underhand pulldown", "Jalón al Pecho", 3, 8, 10, "Tira hacia el esternón superior."),
            createRoutineExercise("barbell bent over row", "Remo con Barra Inclinado", 3, 8, 10, "Mantén la espalda recta."),
            createRoutineExercise("cable seated row", "Remo en Polea Sentado", 3, 10, 12, "Aprieta las escápulas al final."),
            createRoutineExercise("cable standing rear delt row (with rope)", "Face Pull", 3, 12, 15, "Tira hacia la altura de los ojos."),
            createRoutineExercise("dumbbell seated bicep curl", "Curl de Bíceps con Mancuernas", 3, 10, 12, "Supinación completa arriba."),
            createRoutineExercise("ez barbell close grip preacher curl", "Curl de Bíceps con Barra Z", 3, 10, 12, "Sin balancear el torso.")
          ]
        },
        {
          id: "thursday",
          dayNumber: 4,
          label: "Piernas (Enfoque Glúteo/Isquio)",
          intensity: "Alta",
          exercises: [
            createRoutineExercise("barbell deadlift", "Peso Muerto Convencional", 3, 5, 8, "Barra pegada a las espinillas."),
            createRoutineExercise("hyperextension", "Thrust de Cadera con Barra", 3, 8, 10, "Pausa de 1s arriba."),
            createRoutineExercise("dumbbell goblet squat", "Sentadilla Goblet", 3, 10, 12, "Pecho arriba, codos dentro de rodillas."),
            createRoutineExercise("leg extension", "Extensión de Cuádriceps", 3, 12, 15, "Bombeo controlado."),
            createRoutineExercise("lever lying leg curl", "Curl Femoral Tumbado", 3, 10, 12, "Sin levantar la cadera del banco."),
            createRoutineExercise("lever seated hip abduction", "Abductores en Máquina", 3, 12, 15, "Movimiento constante.")
          ]
        },
        {
          id: "friday",
          dayNumber: 5,
          label: "Hombros y Abdomen",
          intensity: "Media",
          exercises: [
            createRoutineExercise("barbell standing close grip military press", "Press Militar con Barra", 3, 6, 8, "Sin usar las piernas."),
            createRoutineExercise("dumbbell lateral raise", "Elevaciones Laterales", 4, 12, 15, "Lidera con los codos."),
            createRoutineExercise("dumbbell reverse fly", "Pájaros en Máquina", 3, 12, 15, "Enfoque en el deltoides posterior."),
            createRoutineExercise("hanging leg raise", "Elevación de Piernas Colgado", 3, 10, 15, "Evita el balanceo."),
            createRoutineExercise("decline crunch", "Crunch Abdominal", 3, 15, 20, "Contracción enfocada."),
            createRoutineExercise("front plank", "Plancha Abdominal", 3, 60, 60, "Glúteos y abdomen apretados. (Segundos)")
          ]
        },
        {
          id: "saturday",
          dayNumber: 6,
          label: "Empuje Superior (Fuerza)",
          intensity: "Media-Alta",
          exercises: [
            createRoutineExercise("dumbbell seated shoulder press", "Press de Hombros", 3, 8, 10),
            createRoutineExercise("dumbbell incline bench press", "Press Inclinado", 3, 8, 10),
            createRoutineExercise("dumbbell lateral raise", "Elevaciones Laterales", 3, 10, 12),
            createRoutineExercise("cable pushdown", "Tríceps en Polea", 3, 10, 12),
            createRoutineExercise("dumbbell hammer curl", "Curl Martillo", 3, 10, 12)
          ]
        },
        {
          id: "sunday",
          dayNumber: 7,
          label: "Tirón Superior (Fuerza)",
          intensity: "Media",
          exercises: [
            createRoutineExercise("pull-up", "Dominadas", 3, 6, 8),
            createRoutineExercise("cable seated row", "Remo Sentado", 3, 8, 10),
            createRoutineExercise("cable standing cross-over high reverse fly", "Pájaros en Polea", 3, 10, 12),
            createRoutineExercise("dumbbell shrug", "Encogimientos", 3, 10, 12),
            createRoutineExercise("barbell curl", "Curl con Barra", 3, 8, 10)
          ]
        }
      ]
    },
    {
      id: "phase2",
      name: "Hipertrofia (Fase 2)",
      days: [
        {
          id: "monday",
          dayNumber: 1,
          label: "Pecho y Tríceps",
          intensity: "Alta",
          exercises: [
            createRoutineExercise("barbell incline bench press", "Press Inclinado con Barra", 3, 6, 8, "Barra baja a la clavícula."),
            createRoutineExercise("dumbbell bench press", "Press de Banca con Mancuernas", 3, 8, 10, "Baja profundo."),
            createRoutineExercise("lever seated fly", "Aperturas en Máquina (Pec Deck)", 3, 12, 15, "Aprieta al juntar las manos."),
            createRoutineExercise("barbell close-grip bench press", "Press en el Suelo con Mancuernas", 3, 10, 12, "Pausa 1s cuando los codos toquen el suelo."),
            createRoutineExercise("cable triceps pushdown", "Extensión de Tríceps", 3, 12, 15, "Con barra o cuerda."),
            createRoutineExercise("cable standing one arm triceps extension", "Tríceps a Una Mano (Cuerda)", 3, 12, 15, "Ligera inclinación del torso.")
          ]
        },
        {
          id: "tuesday",
          dayNumber: 2,
          label: "Piernas (Enfoque Cuádriceps)",
          intensity: "Alta",
          exercises: [
            createRoutineExercise("barbell front squat", "Sentadilla Frontal", 3, 6, 8, "Mantén los codos altos."),
            createRoutineExercise("dumbbell lunge", "Zancadas Caminando con Mancuernas", 3, 10, 12, "Pasos largos para glúteo, cortos para cuádriceps."),
            createRoutineExercise("lever leg extension", "Extensión de Cuádriceps (1 Pierna)", 3, 12, 15, "Aísla cada pierna."),
            createRoutineExercise("lever lying two-one leg curl", "Curl Femoral (1 Pierna)", 3, 10, 12, "Aprieta fuerte abajo."),
            createRoutineExercise("standing calf raise", "Elevación de Talones", 4, 12, 15, "Rango completo de movimiento.")
          ]
        },
        {
          id: "wednesday",
          dayNumber: 3,
          label: "Espalda y Bíceps",
          intensity: "Media",
          exercises: [
            createRoutineExercise("pull up", "Dominadas (o Jalón Neutro)", 3, 8, 10, "Baja de forma controlada."),
            createRoutineExercise("t-bar row", "Remo en Banco T (Apoyado)", 3, 8, 10, "Tira con los codos hacia atrás."),
            createRoutineExercise("dumbbell one arm bent-over row", "Remo con Mancuerna a Una Mano", 3, 10, 12, "Estira el dorsal abajo."),
            createRoutineExercise("cable standing cross-over high reverse fly", "Pájaros en Polea", 3, 12, 15, "Cruza los cables frente a ti."),
            createRoutineExercise("dumbbell hammer curl", "Curl Martillo con Mancuernas", 3, 10, 12, "Trabaja el braquial."),
            createRoutineExercise("cable one arm curl", "Curl en Polea a Una Mano", 3, 12, 15, "Tensión constante en el bíceps.")
          ]
        },
        {
          id: "thursday",
          dayNumber: 4,
          label: "Piernas (Enfoque Isquio/Glúteo)",
          intensity: "Alta",
          exercises: [
            createRoutineExercise("dumbbell romanian deadlift", "RDL con Mancuernas", 3, 8, 10, "Empuja la cadera hacia atrás."),
            createRoutineExercise("hyperextension", "Thrust de Cadera a 1 Pierna", 3, 10, 12, "Usa una mancuerna sobre la cadera."),
            createRoutineExercise("seated leg curl", "Curl Femoral Sentado", 3, 10, 12, "Concéntrate en la contracción."),
            createRoutineExercise("leg extension", "Extensión de Cuádriceps", 3, 12, 15, "Añade un poco de volumen a cuádriceps."),
            createRoutineExercise("standing calf raise", "Elevación de Talones de Pie", 4, 15, 20, "Altas repeticiones para bombeo.")
          ]
        },
        {
          id: "friday",
          dayNumber: 5,
          label: "Hombros y Abdomen",
          intensity: "Media",
          exercises: [
            createRoutineExercise("dumbbell seated shoulder press", "Press de Hombros Sentado", 3, 8, 10, "Baja hasta que las mancuernas toquen los hombros."),
            createRoutineExercise("cable lateral raise", "Elevaciones Laterales en Polea", 3, 12, 15, "El cable mantiene la tensión constante."),
            createRoutineExercise("dumbbell incline rear lateral raise", "Pájaros Inclinado con Mancuernas", 3, 12, 15, "Pecho apoyado en banco inclinado."),
            createRoutineExercise("bicycle crunch", "Bicycle Crunch", 3, 20, 30, "Rodilla a codo opuesto."),
            createRoutineExercise("hanging leg raise", "Elevación de Piernas Colgado", 3, 10, 15, "Lleva las rodillas al pecho.")
          ]
        },
        {
          id: "saturday",
          dayNumber: 6,
          label: "Empuje Superior (Hipertrofia)",
          intensity: "Alta",
          exercises: [
            createRoutineExercise("cable cross-over variation", "Cruces en Polea", 3, 12, 15),
            createRoutineExercise("lever chest press", "Press en Máquina", 3, 10, 12),
            createRoutineExercise("dumbbell lateral raise", "Elevaciones Laterales", 3, 12, 15),
            createRoutineExercise("cable standing one arm triceps extension", "Extensión Tríceps", 3, 12, 15),
            createRoutineExercise("cable curl", "Curl en Polea", 3, 12, 15)
          ]
        },
        {
          id: "sunday",
          dayNumber: 7,
          label: "Tirón Superior (Hipertrofia)",
          intensity: "Media-Alta",
          exercises: [
            createRoutineExercise("cable straight arm pulldown", "Pull-over en Polea", 3, 12, 15),
            createRoutineExercise("dumbbell one arm bent-over row", "Remo a una mano", 3, 10, 12),
            createRoutineExercise("lever seated reverse fly", "Pájaros en Máquina", 3, 12, 15),
            createRoutineExercise("barbell upright row", "Remo al Mentón", 3, 10, 12),
            createRoutineExercise("dumbbell hammer curl", "Curl Martillo", 3, 12, 15)
          ]
        }
      ]
    }
  ]
};

fs.writeFileSync('src/data/routine.json', JSON.stringify(routineData, null, 2));
console.log('Routine successfully generated with Phase 1 and Phase 2!');
