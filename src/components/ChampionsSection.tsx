import { Trophy } from 'lucide-react';
import { champions, stats } from '../data/championsData';

export default function ChampionsSection() {
    return (
        <div className="space-y-12 py-8">
            {/* Header */}
            <div className="text-center mb-16">
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-4">
                    <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        HALL OF
                    </span>
                    <br />
                    <span className="text-white">CHAMPIONS</span>
                </h2>
                <p className="text-xl text-gray-400 font-bold">LOS QUE DOMINAN EL HIERRO</p>
            </div>

            {/* Champion Cards */}
            <div className="grid md:grid-cols-2 gap-8">
                {champions.map((champion, idx) => (
                    <div
                        key={idx}
                        className="group relative overflow-hidden rounded-2xl border-4 border-yellow-600 hover:border-yellow-400 transition-all transform hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/40 to-orange-900/40" />
                        <div className="relative">
                            <div className="h-80 overflow-hidden">
                                <img
                                    src={champion.img}
                                    alt={champion.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            </div>
                            <div className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg font-black border-2 border-yellow-300 shadow-2xl">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="bg-yellow-500 text-black px-3 py-1 rounded-full inline-block mb-3 font-black text-xs tracking-widest">
                                    {champion.title}
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter mb-2">{champion.name}</h3>
                                <p className="text-xl font-black text-yellow-400">{champion.stats}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-900 rounded-2xl p-8 border-4 border-gray-800 hover:border-white/20 transition-all text-center"
                    >
                        <div className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div className="text-4xl font-black mb-2">{stat.value}</div>
                        <div className="text-sm text-gray-400 font-bold tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
