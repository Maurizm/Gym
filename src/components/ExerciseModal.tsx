'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageCarousel } from './ImageCarousel';
import nippardTips from '@/data/nippard_tips.json';
import exercisesData from '@/data/exercises.json';

interface ExerciseModalProps {
  exerciseName: string; // The translated Spanish name (for the UI) or English name
  exerciseData: any; // The raw object from exercisesData (or formatted)
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseModal({ exerciseName, exerciseData, isOpen, onClose }: ExerciseModalProps) {
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

  const originalName = exerciseData?.name?.toLowerCase() || "";
  
  // Attempt exact match first, if not try partial map
  let tips = (nippardTips as any)[originalName];
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
    if (engKey) tips = (nippardTips as any)[engKey];
  }

  const goldenRule = (nippardTips as any).golden_rule;

  let images: string[] = [];
  if (exerciseData?.imageUrls && exerciseData.imageUrls.length > 0) {
    images = exerciseData.imageUrls;
  } else if (exerciseData?.imageUrl) {
    images = [exerciseData.imageUrl];
  } else if (exerciseData?.gif_url) {
    images = [ `/${exerciseData.gif_url}` ];
  }

  // Translation helpers
  const esDict: Record<string, string> = {
    chest: "Pecho", back: "Espalda", legs: "Piernas", shoulders: "Hombros", arms: "Brazos", core: "Abdomen", cardio: "Cardio", upper: "Tren Superior", lower: "Tren Inferior", waist: "Cintura", neck: "Cuello", biceps: "Bíceps", triceps: "Tríceps", glutes: "Glúteos", quads: "Cuádriceps", hamstrings: "Isquiotibiales", calves: "Gemelos", lats: "Dorsales", traps: "Trapecios", forearms: "Antebrazos", barbell: "Barra", dumbbell: "Mancuernas", cable: "Polea", machine: "Máquina", bodyweight: "Peso Corporal", "pull-up bar": "Barra de Dominadas", band: "Banda Elástica", kettlebell: "Pesa Rusa", "ez bar": "Barra EZ", medicine_ball: "Balón Medicinal", stability_ball: "Balón de Estabilidad", bosu_ball: "Pelota Bosu", smith_machine: "Multipower"
  };
  const t = (str: string) => esDict[str?.toLowerCase()] || str;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      
      {/* Modal Content */}
      <div 
        className={`bg-surface w-full md:w-[600px] max-h-[90vh] md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-12 md:scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image/Carousel */}
        <div className="relative w-full aspect-video bg-surface-bright shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          
          {images.length > 0 ? (
            <div className="absolute inset-0 group/carousel">
              <ImageCarousel images={images} alt={exerciseName} showLabels />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              Sin imagen
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-lg overflow-y-auto flex-1">
          <h2 className="font-headline-lg text-headline-lg text-on-surface capitalize mb-2">{exerciseName}</h2>
          
          {exerciseData?.target && exerciseData?.equipment && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-label-caps text-label-caps capitalize">
                {t(exerciseData.target)}
              </span>
              <span className="px-3 py-1 bg-secondary-fixed/20 text-secondary-fixed rounded-full font-label-caps text-label-caps capitalize">
                {t(exerciseData.equipment)}
              </span>
            </div>
          )}

          {/* Golden Rule Banner (Only if there are tips, as this implies it's a core hypertrophy exercise) */}
          {tips && goldenRule && (
            <div className="bg-tertiary-container/30 border border-tertiary/20 rounded-xl p-md mb-6 animate-fade-in">
              <h4 className="font-headline-sm text-headline-sm text-tertiary flex items-center gap-2 mb-2">
                <span>{goldenRule.title}</span>
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">
                {goldenRule.content}
              </p>
            </div>
          )}

          {/* Expert Tips */}
          {tips ? (
            <div className="space-y-6 animate-fade-in delay-100">
              <div className="bg-surface-container rounded-xl p-md">
                <h4 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                  ¿Por qué hacerlo?
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{tips.why}</p>
              </div>

              <div className="bg-surface-container rounded-xl p-md">
                <h4 className="font-headline-sm text-headline-sm text-error flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                  Pesos y Esfuerzo (RPE)
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{tips.weights}</p>
              </div>

              <div className="bg-surface-container rounded-xl p-md">
                <h4 className="font-headline-sm text-headline-sm text-secondary flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[20px]">accessibility_new</span>
                  Técnica Perfecta
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{tips.technique}</p>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container rounded-xl p-lg text-center mt-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">info</span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Información técnica detallada no disponible para este ejercicio en los manuales actuales.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
