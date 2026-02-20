interface DaySelectorProps {
    activeDay: number;
    setActiveDay: (day: number) => void;
}

const DAY_LABELS: Record<number, string> = {
    1: 'PECHO',
    2: 'PIERNAS',
    3: 'ESPALDA',
    4: 'REST',
    5: 'PIERNAS',
    6: 'HOMBROS',
    7: 'REST',
};

export default function DaySelector({ activeDay, setActiveDay }: DaySelectorProps) {
    return (
        <div className="mb-8">
            <h3 className="text-center text-2xl font-black tracking-widest mb-6 text-gray-400">
                SELECCIONA TU BATALLA
            </h3>
            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const isRest = day === 4 || day === 7;
                    const isActive = activeDay === day;
                    return (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`flex-shrink-0 min-w-[140px] rounded-xl border-4 transition-all transform hover:scale-105 ${isActive
                                    ? isRest
                                        ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-400 shadow-2xl shadow-green-900/50'
                                        : 'bg-gradient-to-br from-red-600 to-orange-600 border-red-400 shadow-2xl shadow-red-900/50'
                                    : 'bg-gray-900 border-gray-700 hover:border-gray-500'
                                }`}
                        >
                            <div className="p-4 text-center">
                                <div className="font-black text-xs tracking-widest mb-2 opacity-80">DÍA</div>
                                <div className="font-black text-4xl mb-2">{day}</div>
                                <div className="font-black text-sm tracking-wide">{DAY_LABELS[day]}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
