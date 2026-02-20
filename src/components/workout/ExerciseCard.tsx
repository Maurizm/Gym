import { Clock, Info, PlayCircle, Play, ChevronRight, Target, CheckCircle } from 'lucide-react';
import type { Exercise } from '../../types';
import IntensityBadge from './IntensityBadge';

interface ExerciseCardProps {
    exercise: Exercise;
    index: number;
}

export default function ExerciseCard({ exercise, index }: ExerciseCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border-4 border-gray-800 hover:border-orange-500 transition-all bg-gray-900">
            <div className="flex flex-col lg:flex-row">

                {/* Imagen / Video */}
                <div className="lg:w-2/5 relative min-h-[280px] bg-black overflow-hidden">
                    <img
                        src={exercise.img}
                        alt={exercise.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                    />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-50 animate-pulse" />
                            <a
                                href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-20 h-20 rounded-full bg-black/90 border-4 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white hover:border-red-400 transition-all transform hover:scale-110"
                            >
                                <PlayCircle size={40} />
                            </a>
                        </div>
                    </div>

                    {/* Stats Overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded-lg border-2 border-white/20 font-black">
                            <div className="text-xs text-gray-400 mb-1">SETS × REPS</div>
                            <div className="text-2xl text-white">{exercise.sets} × {exercise.reps}</div>
                        </div>
                        <IntensityBadge level={exercise.intensity} />
                    </div>

                    {/* Rest */}
                    <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1 rounded-full border-2 border-blue-500">
                        <Clock className="w-4 h-4 inline mr-2 text-blue-400" />
                        <span className="font-black text-sm">{exercise.rest}</span>
                    </div>
                </div>

                {/* Detalles */}
                <div className="lg:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="font-black text-xs tracking-widest text-gray-500 mb-1">
                                    EJERCICIO {index + 1}
                                </div>
                                <h3 className="font-black text-2xl md:text-3xl tracking-tight group-hover:text-orange-400 transition-colors">
                                    {exercise.name}
                                </h3>
                            </div>
                        </div>

                        {/* Nota técnica */}
                        <div className="bg-black/50 p-4 rounded-xl border-2 border-gray-800 mb-4">
                            <div className="flex items-start gap-3">
                                <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-300 leading-relaxed font-medium">{exercise.note}</p>
                            </div>
                        </div>

                        {/* RPE */}
                        <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 p-4 rounded-xl border-2 border-orange-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-orange-400" />
                                <span className="font-black text-sm tracking-wider text-orange-400">INTENSIDAD TARGET</span>
                            </div>
                            <div className="text-2xl font-black text-white">
                                RPE {exercise.rpe} <span className="text-lg text-gray-400">/ 10</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Deja 2-3 reps en reserva</p>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-6 pt-4 border-t-2 border-gray-800 flex justify-between items-center">
                        <a
                            href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-black tracking-wider transition-all transform hover:scale-105 flex items-center gap-2 border-2 border-blue-400 shadow-lg"
                        >
                            <Play className="w-5 h-5" />
                            VER TUTORIAL
                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                        <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-black text-sm transition-all border-2 border-gray-700">
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
