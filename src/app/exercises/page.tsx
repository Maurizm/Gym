"use client";

import { useState } from "react";
import exercisesData from "@/data/exercises.json";
import Image from "next/image";
import { ExerciseModal } from "@/components/ExerciseModal";

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const esDict: Record<string, string> = {
    all: "Todos",
    chest: "Pecho",
    back: "Espalda",
    legs: "Piernas",
    shoulders: "Hombros",
    arms: "Brazos",
    core: "Abdomen",
    cardio: "Cardio",
    upper: "Tren Superior",
    lower: "Tren Inferior",
    waist: "Cintura",
    neck: "Cuello",
    biceps: "Bíceps",
    triceps: "Tríceps",
    glutes: "Glúteos",
    quads: "Cuádriceps",
    hamstrings: "Isquiotibiales",
    calves: "Gemelos",
    lats: "Dorsales",
    traps: "Trapecios",
    forearms: "Antebrazos",
    barbell: "Barra",
    dumbbell: "Mancuernas",
    cable: "Polea",
    machine: "Máquina",
    bodyweight: "Peso Corporal",
    "pull-up bar": "Barra de Dominadas",
    band: "Banda Elástica",
    kettlebell: "Pesa Rusa",
    "ez bar": "Barra EZ",
    medicine_ball: "Balón Medicinal",
    stability_ball: "Balón de Estabilidad",
    bosu_ball: "Pelota Bosu",
    smith_machine: "Multipower"
  };

  const t = (str: string) => esDict[str?.toLowerCase()] || str;

  const categories = ["all", ...Array.from(new Set(exercisesData.map(ex => ex.category)))];

  const filteredExercises = exercisesData.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exercise.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const displayedExercises = filteredExercises.slice(0, 50);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Biblioteca de Ejercicios
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explora más de {exercisesData.length} ejercicios para tu entrenamiento.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar ejercicio o músculo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all capitalize"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{t(cat)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedExercises.map((exercise) => (
            <div 
              key={exercise.id} 
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 group cursor-pointer"
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <Image
                  src={`/${exercise.gif_url}`}
                  alt={exercise.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg capitalize line-clamp-1" title={exercise.name}>
                    {exercise.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full capitalize">
                    {t(exercise.target)}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full capitalize">
                    {t(exercise.equipment)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No se encontraron ejercicios.</p>
          </div>
        )}
        
        {filteredExercises.length > 50 && (
          <div className="text-center mt-10">
            <p className="text-sm text-gray-500">
              Mostrando 50 de {filteredExercises.length} resultados. Usa el buscador para encontrar más.
            </p>
          </div>
        )}
      </div>

      <ExerciseModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exerciseName={selectedExercise?.name ? t(selectedExercise.name) : ""}
        exerciseData={selectedExercise}
      />
    </div>
  );
}
