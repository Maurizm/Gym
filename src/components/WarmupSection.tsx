import { Info, PlayCircle } from 'lucide-react';
import { warmupData } from '../data/warmupData';

export default function WarmupSection() {
    return (
        <div className="space-y-8 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-6xl font-black tracking-tighter mb-4">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        PROTOCOLO
                    </span>
                    <br />
                    <span className="text-white">DE CALENTAMIENTO</span>
                </h2>
                <p className="text-xl text-gray-400 font-bold">4 PASOS ESENCIALES • 10-15 MINUTOS</p>
            </div>

            {/* Cards */}
            <div className="grid gap-8 md:grid-cols-2">
                {warmupData.map((step, idx) => (
                    <div
                        key={idx}
                        className="group relative overflow-hidden rounded-2xl border-4 border-gray-800 hover:border-orange-500 transition-all"
                    >
                        {/* Imagen con overlay de play */}
                        <div className="relative h-52 overflow-hidden bg-black">
                            <img
                                src={step.img}
                                alt={step.title}
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                            />
                            {/* Gradient de texto */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                            {/* Step number */}
                            <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded-full border border-gray-700">
                                <span className="text-white font-black text-sm">PASO {idx + 1}</span>
                            </div>

                            {/* Botón YouTube */}
                            <a
                                href={`https://www.youtube.com/watch?v=${step.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 flex items-center justify-center"
                                title={`Ver video: ${step.title}`}
                            >
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full blur-xl opacity-60 animate-pulse`} />
                                    <div className="relative w-16 h-16 rounded-full bg-black/90 border-4 border-white/30 flex items-center justify-center text-white hover:scale-110 transition-transform">
                                        <PlayCircle size={36} />
                                    </div>
                                </div>
                            </a>

                            {/* Etiqueta de duración */}
                            <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 rounded-full">
                                <span className={`font-black text-xs tracking-widest bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                                    {step.duration}
                                </span>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="relative p-6 bg-gray-950">
                            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                            <div className="relative flex items-start gap-4">
                                <div className={`bg-gradient-to-br ${step.color} p-3 rounded-xl border-2 border-white/20 shadow-2xl flex-shrink-0`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl mb-2 tracking-tight">{step.title}</h3>
                                    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                                    <a
                                        href={`https://www.youtube.com/watch?v=${step.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 mt-4 text-sm font-black tracking-wider bg-gradient-to-r ${step.color} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                                    >
                                        <PlayCircle size={16} className="text-orange-500" />
                                        VER TUTORIAL EN YOUTUBE →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border-4 border-blue-500">
                <div className="flex items-start gap-4">
                    <Info className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-black text-2xl mb-2 text-blue-400 tracking-tight">REGLA DE ORO</h4>
                        <p className="text-lg text-gray-200 leading-relaxed">
                            El calentamiento NO es para cansarte. Es para activar el sistema nervioso y preparar
                            las articulaciones. Si sudas ligeramente,{' '}
                            <span className="text-yellow-400 font-black">ESTÁS LISTO PARA DESTRUIR</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
