import { Trophy, Play, Flame, ArrowRight, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
    setActiveTab: (tab: string) => void;
}

export default function HeroSection({ setActiveTab }: HeroSectionProps) {

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-black to-blue-900/30">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.4)',
                    }}
                />
            </div>

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                <div className="mb-6 inline-block">
                    <div className="flex items-center gap-3 bg-red-600/20 border-2 border-red-500 px-6 py-2 rounded-full backdrop-blur-sm">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-black tracking-widest text-sm">
                            JEFF NIPPARD FUNDAMENTALS
                        </span>
                    </div>
                </div>

                <h1 className="text-7xl md:text-9xl font-black mb-4 tracking-tighter leading-none">
                    <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                        DOMINA
                    </span>
                    <br />
                    <span className="text-white drop-shadow-2xl">TU CUERPO</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-bold tracking-wide">
                    12 SEMANAS • BODY PART SPLIT • HIPERTROFIA CIENTÍFICA
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        onClick={() => setActiveTab('workout')}
                        className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-8 py-4 rounded-lg font-black text-lg tracking-wider transition-all transform hover:scale-105 flex items-center justify-center gap-2 border-2 border-red-400 shadow-2xl shadow-red-900/50"
                    >
                        <Play className="w-6 h-6" />
                        COMENZAR ENTRENAMIENTO
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => setActiveTab('warmup')}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-black text-lg tracking-wider transition-all border-2 border-gray-700 flex items-center justify-center gap-2"
                    >
                        <Flame className="w-6 h-6 text-orange-500" />
                        VER CALENTAMIENTO
                    </button>
                </div>

            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <ChevronRight className="w-8 h-8 text-red-500 rotate-90" />
            </div>
        </section>
    );
}
