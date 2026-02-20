import { Dumbbell, Flame, Trophy } from 'lucide-react';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TABS = [
    { id: 'home', icon: Trophy, label: 'INICIO' },
    { id: 'warmup', icon: Flame, label: 'CALENTAMIENTO' },
    { id: 'workout', icon: Dumbbell, label: 'ENTRENAMIENTO' },
];

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b-4 border-red-600 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-red-600 to-orange-600 p-2 rounded-lg">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-xl tracking-tighter">NIPPARD</h2>
                            <p className="text-xs text-gray-400 tracking-wider">FUNDAMENTALS</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-black text-sm tracking-wider transition-all flex items-center gap-2 border-2 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-red-600 to-orange-600 border-red-400 text-white shadow-lg shadow-red-900/50'
                                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                                    }`}
                            >
                                <tab.icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
