import { Calendar } from 'lucide-react';

export default function RestDay() {
    return (
        <div className="py-20">
            <div className="relative overflow-hidden rounded-3xl border-4 border-green-600 bg-gradient-to-br from-green-900/40 to-emerald-900/40">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="relative text-center p-16">
                    <div className="inline-block bg-green-600/20 p-6 rounded-full mb-8 border-4 border-green-500">
                        <Calendar className="w-16 h-16 text-green-400" />
                    </div>

                    <h2 className="text-6xl font-black tracking-tighter mb-6">
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            DÍA DE
                        </span>
                        <br />
                        <span className="text-white">RECUPERACIÓN</span>
                    </h2>

                    <p className="text-2xl text-gray-300 font-bold max-w-2xl mx-auto leading-relaxed mb-8">
                        El crecimiento muscular ocurre{' '}
                        <span className="text-green-400 font-black">FUERA DEL GYM</span>.
                        <br />
                        Duerme 7-9 horas. Come bien. Hidrátate.
                    </p>

                    <div className="flex justify-center gap-4 flex-wrap">
                        <div className="bg-black/70 px-6 py-3 rounded-lg border-2 border-green-500">
                            <div className="text-xs text-gray-400 mb-1">ACTIVIDAD</div>
                            <div className="text-xl font-black text-green-400">CAMINATA LIGERA</div>
                        </div>
                        <div className="bg-black/70 px-6 py-3 rounded-lg border-2 border-green-500">
                            <div className="text-xs text-gray-400 mb-1">ESTIRAMIENTOS</div>
                            <div className="text-xl font-black text-green-400">10-15 MIN</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
