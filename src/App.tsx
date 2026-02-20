import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WarmupSection from './components/WarmupSection';
import WorkoutSection from './components/workout/WorkoutSection';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {activeTab === 'home' && <HeroSection setActiveTab={setActiveTab} />}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto p-4 pb-20">
        {activeTab === 'warmup' && <WarmupSection />}
        {activeTab === 'workout' && <WorkoutSection />}
      </main>

      <footer className="bg-black border-t-4 border-red-600 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 font-bold mb-2">
            JEFF NIPPARD FUNDAMENTALS HYPERTROPHY PROGRAM
          </p>
          <p className="text-sm text-gray-600">© 2026 — CIENCIA. DISCIPLINA. RESULTADOS.</p>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}