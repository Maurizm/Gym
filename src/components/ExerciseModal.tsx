'use client';

import { useEffect, useState } from 'react';
import { ImageCarousel } from './ImageCarousel';
import nippardTips from '@/data/nippard_tips.json';

interface ExerciseModalProps {
  exerciseName?: string; // The translated Spanish name (for the UI) or English name
  exerciseData?: Record<string, unknown> | null; // The raw object from exercisesData (or formatted)
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseModal({ exerciseName = '', exerciseData = null, isOpen, onClose }: ExerciseModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const originalName = (exerciseData?.name as string)?.toLowerCase() || "";
  
  // Attempt exact match first, if not try partial map
  let tips = (nippardTips as Record<string, unknown>)[originalName] as Record<string, unknown> | undefined;
  if (!tips) {
    // Reverse map from Spanish to English for workout view
    const reverseMap: Record<string, string> = {
      "press de banca con barra": "barbell bench press",
      "press inclinado con mancuernas": "dumbbell incline bench press",
      "press de hombros sentado (mancuernas)": "dumbbell seated shoulder press",
      "press de hombros sentado con mancuernas": "dumbbell seated shoulder press",
      "cruce de poleas": "cable cross-over",
      "elevaciones laterales con mancuernas": "dumbbell lateral raise",
      "extensión de tríceps con cuerda": "cable triceps pushdown",
      "peso muerto convencional o sumo": "barbell deadlift",
      "remo pendlay / remo con barra": "barbell bent over row",
      "dominadas (o jalón al pecho)": "pull-up",
      "remo sentado en polea": "cable seated row",
      "remo gironda (agarre estrecho)": "cable seated row",
      "face pull con cuerda": "cable rear pulldown",
      "curl de bíceps con barra ez": "ez barbell curl",
      "sentadilla trasera con barra": "barbell full squat",
      "peso muerto rumano (rdl)": "barbell romanian deadlift",
      "prensa de piernas": "sled 45",
      "curl de isquios tumbado": "lever lying leg curl",
      "elevación de talones de pie": "lever standing calf raise",
      "crunch abdominal en polea": "cable kneeling crunch",
      "press de banca (agarre cerrado)": "barbell close-grip bench press",
      "press de banca agarre estrecho": "barbell close-grip bench press",
      "remo a una mano con mancuerna": "dumbbell bent over row",
      "press arnold": "dumbbell arnold press",
      "jalón al pecho supino": "cable reverse-grip pulldown",
      "pájaros con mancuernas (vuelo inverso)": "dumbbell reverse fly",
      "pájaros con mancuernas": "dumbbell reverse fly",
      "curl martillo con mancuernas": "dumbbell hammer curl",
      "rompecráneos con mancuernas": "dumbbell lying triceps extension",
      "hip thrust con barra": "barbell glute bridge",
      "zancadas caminando con mancuernas": "dumbbell lunge",
      "sentadilla frontal": "barbell front squat",
      "extensión de cuádriceps": "lever leg extension",
      "curl de isquios sentado": "lever seated leg curl",
      "elevación de piernas colgado": "hanging leg raise"
    };
    
    const engKey = reverseMap[originalName] || Object.keys(nippardTips).find(k => originalName.includes(k) || k.includes(originalName));
    if (engKey) tips = (nippardTips as Record<string, unknown>)[engKey] as Record<string, unknown>;
  }

  const goldenRule = (nippardTips as Record<string, unknown>).golden_rule as Record<string, unknown>;

  let images: string[] = [];
  if (exerciseData?.imageUrls && (exerciseData.imageUrls as string[]).length > 0) {
    images = exerciseData.imageUrls as string[];
  } else if (exerciseData?.imageUrl) {
    images = [exerciseData.imageUrl as string];
  } else if (exerciseData?.gif_url) {
    images = [ `/${exerciseData.gif_url}` ];
  }

  // Translation helpers
  const esDict: Record<string, string> = {
    chest: "Pecho", back: "Espalda", legs: "Piernas", shoulders: "Hombros", arms: "Brazos", core: "Abdomen", cardio: "Cardio", upper: "Tren Superior", lower: "Tren Inferior", waist: "Cintura", neck: "Cuello", biceps: "Bíceps", triceps: "Tríceps", glutes: "Glúteos", quads: "Cuádriceps", hamstrings: "Isquiotibiales", calves: "Gemelos", lats: "Dorsales", traps: "Trapecios", forearms: "Antebrazos", barbell: "Barra", dumbbell: "Mancuernas", cable: "Polea", machine: "Máquina", bodyweight: "Peso Corporal", "pull-up bar": "Barra de Dominadas", band: "Banda Elástica", kettlebell: "Pesa Rusa", "ez bar": "Barra EZ", medicine_ball: "Balón Medicinal", stability_ball: "Balón de Estabilidad", bosu_ball: "Pelota Bosu", smith_machine: "Multipower"
  };
  const t = (str: string) => esDict[str?.toLowerCase()] || str;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      
      {/* Modal Content */}
      <div 
        className={`
          bg-surface w-full md:w-[600px] max-h-[90vh] md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border border-outline-variant
          ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full md:translate-y-12 md:scale-95'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image/Carousel */}
        <div className="relative w-full aspect-video bg-surface-bright shrink-0">
          <button 
            onClick={onClose}
            className="
              absolute top-4 right-4 z-10 w-10 h-10 bg-surface/50 backdrop-blur-md border border-outline-variant/30
              hover:bg-surface text-on-surface rounded-full flex items-center justify-center
              transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            "
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          
          {images.length > 0 ? (
            <div className="absolute inset-0 group/carousel">
              <ImageCarousel images={images} alt={exerciseName} showLabels />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-label-caps text-label-caps">
              Sin imagen
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-lg overflow-y-auto flex-1">
          <h2 className="text-headline-lg text-on-surface capitalize mb-2">{exerciseName}</h2>
          
          {Boolean(exerciseData?.target && exerciseData?.equipment) && (
            <div className="flex flex-wrap gap-2 mb-lg">
              <span className="px-3 py-1 bg-primary-soft text-primary rounded-full text-label-caps capitalize tracking-wide">
                {t(exerciseData?.target as string)}
              </span>
              <span className="px-3 py-1 bg-surface-bright border border-outline-variant text-on-surface-variant rounded-full text-label-caps capitalize tracking-wide">
                {t(exerciseData?.equipment as string)}
              </span>
            </div>
          )}

          {/* Golden Rule Banner */}
          {Boolean(tips && goldenRule) && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-md mb-lg animate-fade-in-up">
              <h4 className="text-headline-sm text-warning flex items-center gap-2 mb-2">
                <span>{goldenRule.title as string}</span>
              </h4>
              <p className="text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
                {goldenRule.content as string}
              </p>
            </div>
          )}

          {/* Expert Tips */}
          {tips ? (
            <div className="space-y-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="bg-surface-bright border border-outline-variant rounded-2xl p-md">
                <h4 className="text-headline-sm text-primary flex items-center gap-2 mb-xs">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  ¿Por qué hacerlo?
                </h4>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{tips.why as string}</p>
              </div>

              <div className="bg-surface-bright border border-outline-variant rounded-2xl p-md">
                <h4 className="text-headline-sm text-error flex items-center gap-2 mb-xs">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                  Pesos y Esfuerzo (RPE)
                </h4>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{tips.weights as string}</p>
              </div>

              <div className="bg-surface-bright border border-outline-variant rounded-2xl p-md">
                <h4 className="text-headline-sm text-success flex items-center gap-2 mb-xs">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>accessibility_new</span>
                  Técnica Perfecta
                </h4>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{tips.technique as string}</p>
              </div>
            </div>
          ) : (
            <div className="bg-surface-bright border border-dashed border-outline-variant rounded-2xl p-lg text-center mt-md">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">info</span>
              <p className="text-body-md text-on-surface-variant">
                Información técnica detallada no disponible para este ejercicio en los manuales actuales.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
