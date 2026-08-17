"use client";

import { useState } from "react";
import exercisesData from "@/data/exercises.json";
import Image from "next/image";
import { ExerciseModal } from "@/components/ExerciseModal";

const esDict: Record<string, string> = {
  all: "Todos",
  chest: "Pecho", back: "Espalda", legs: "Piernas", shoulders: "Hombros",
  arms: "Brazos", core: "Abdomen", cardio: "Cardio", upper: "Tren Superior",
  lower: "Tren Inferior", waist: "Cintura", neck: "Cuello", biceps: "Bíceps",
  triceps: "Tríceps", glutes: "Glúteos", quads: "Cuádriceps",
  hamstrings: "Isquiotibiales", calves: "Gemelos", lats: "Dorsales",
  traps: "Trapecios", forearms: "Antebrazos", barbell: "Barra",
  dumbbell: "Mancuernas", cable: "Polea", machine: "Máquina",
  bodyweight: "Peso Corporal", "pull-up bar": "Barra de Dominadas",
  band: "Banda Elástica", kettlebell: "Pesa Rusa", "ez bar": "Barra EZ",
  medicine_ball: "Balón Medicinal", stability_ball: "Balón de Estabilidad",
  bosu_ball: "Pelota Bosu", smith_machine: "Multipower"
};
const t = (str: string) => esDict[str?.toLowerCase()] || str;

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<Record<string, unknown> | null>(null);

  const categories = ["all", ...Array.from(new Set(exercisesData.map(ex => ex.category)))];

  const filteredExercises = exercisesData.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const displayedExercises = filteredExercises.slice(0, 50);

  return (
    <div className="px-md md:px-lg py-lg pb-32 max-w-6xl mx-auto space-y-lg">
      {/* Header */}
      <header className="animate-fade-in-up">
        <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">
          Biblioteca de Ejercicios
        </h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Explora más de {exercisesData.length} ejercicios para tu entrenamiento.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-md animate-fade-in-up delay-75">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Buscar ejercicio o músculo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full bg-surface border border-outline-variant rounded-xl
              pl-12 pr-md py-sm text-on-surface text-body-md
              focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none
              transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            "
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="
            bg-surface border border-outline-variant rounded-xl
            px-md py-sm text-on-surface text-body-md
            focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none
            transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            capitalize
          "
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{t(cat)}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
        {displayedExercises.map((exercise, idx) => (
          <div
            key={exercise.id}
            className="
              bg-surface border border-outline-variant rounded-2xl overflow-hidden
              shadow-sm dark:shadow-none
              hover:border-primary/30 hover:-translate-y-0.5
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              group cursor-pointer animate-fade-in-up
            "
            style={{ animationDelay: `${Math.min(idx, 11) * 40}ms` }}
            onClick={() => setSelectedExercise(exercise as unknown as Record<string, unknown>)}
          >
            <div className="relative h-48 w-full bg-surface-bright overflow-hidden">
              <Image
                src={`/${exercise.gif_url}`}
                alt={exercise.name}
                fill
                className="
                  object-cover
                  group-hover:scale-105
                  transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                "
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            <div className="p-md">
              <h3 className="font-semibold text-on-surface capitalize line-clamp-1 text-body-md" title={exercise.name}>
                {exercise.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-sm">
                <span className="text-[10px] font-bold px-2.5 py-1 bg-primary-soft text-primary rounded-full capitalize tracking-wide">
                  {t(exercise.target)}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-surface-bright text-on-surface-variant rounded-full capitalize tracking-wide border border-outline-variant">
                  {t(exercise.equipment)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-2xl animate-fade-in-up">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-md block">search_off</span>
          <p className="text-body-lg text-on-surface-variant">No se encontraron ejercicios.</p>
          <p className="text-body-md text-outline mt-xs">Intenta con otro término de búsqueda.</p>
        </div>
      )}

      {filteredExercises.length > 50 && (
        <div className="text-center mt-lg">
          <p className="text-sm text-on-surface-variant">
            Mostrando 50 de {filteredExercises.length} resultados. Usa el buscador para encontrar más.
          </p>
        </div>
      )}

      <ExerciseModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exerciseName={selectedExercise?.name ? t(selectedExercise.name as string) : ""}
        exerciseData={selectedExercise}
      />
    </div>
  );
}
