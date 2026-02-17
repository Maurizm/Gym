import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Flame, Clock, Info, PlayCircle, ChevronRight, Calendar, Activity,
  Trophy, Zap, Target, TrendingUp, Users, Star, Award, ArrowRight, Play, CheckCircle
} from 'lucide-react';

const ProgramApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeDay, setActiveDay] = useState(1);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [modalVideo, setModalVideo] = useState<{ id: string; title: string } | null>(null);

  // Tracker de progreso
  const [progress, setProgress] = useState<Record<string, { weights: Record<string, string> }>>({});

  useEffect(() => {
    const saved = localStorage.getItem('nippardProgressMauricioCarlos');
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('nippardProgressMauricioCarlos', JSON.stringify(progress));
  }, [progress]);

  // Countdown para próximo ciclo (18 de Febrero 6:00 AM del año actual o siguiente)
  useEffect(() => {
    const now = new Date();
    let targetYear = now.getFullYear();
    let targetDate = new Date(targetYear, 1, 18, 6, 0, 0);
    
    if (now > targetDate) {
      targetDate = new Date(targetYear + 1, 1, 18, 6, 0, 0);
    }

    const interval = setInterval(() => {
      const distance = targetDate.getTime() - new Date().getTime();
      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getVideoEmbed = (exerciseName: string) => {
    const videoIds: Record<string, string> = {
      'Press de Banca con Barra': 'vcBig73ojpE',
      'Press Inclinado con Mancuernas': 'fGm-ef-4PVk',
      'Aperturas en Polea (Cable Flye)': 'fGm-ef-4PVk',
      'Fondos Asistidos': 'fGm-ef-4PVk',
      'Rompecráneos con Mancuernas': '3ryh7PNhz3E',
      'Sentadilla Trasera (Back Squat)': 'bEv6CCg2BC8',
      'Peso Muerto Rumano': 'VL5Ab0T07e4',
      'Hip Thrust con Barra': 'xDmFkJxPzeM',
      'Extensiones de Pierna': '3ryh7PNhz3E',
      'Curl Femoral Tumbado/Sentado': '3ryh7PNhz3E',
      'Elevación de Talones de Pie': '3ryh7PNhz3E',
      'Jalón al Pecho (Agarre Supino)': 'O94yEoGXtBY',
      'Remo Sentado en Polea': 'jLvqKgW-_G8',
      'Remo Barra T (Soporte Pecho)': 'jLvqKgW-_G8',
      'Face Pull Sentado': 'qfc70k40318',
      'Curl con Mancuernas (Supino)': '3ryh7PNhz3E',
      'Peso Muerto (Deadlift)': 'VL5Ab0T07e4',
      'Zancadas Caminando': '3ryh7PNhz3E',
      'Extensión Pierna (Unilateral)': '3ryh7PNhz3E',
      'Curl Femoral (Unilateral)': '3ryh7PNhz3E',
      'Abducción de Cadera (Máquina)': '3ryh7PNhz3E',
      'Plancha Abdominal': '3ryh7PNhz3E',
      'Press Militar (Barra o Mancuerna)': '_RlRDWO2jfg',
      'Elevaciones Laterales': 'v_ZkxWzYnMc',
      'Vuelos Inversos (Cable Reverse Fly)': 'qfc70k40318',
      'Extensión Tríceps Cuerda (1 mano)': '3ryh7PNhz3E',
      'Curl Bíceps Polea (1 mano)': '3ryh7PNhz3E'
    };
    return videoIds[exerciseName] || 'vcBig73ojpE';
  };

  const getImageUrl = (text: string) => `https://images.unsplash.com/photo-${
    text.includes('Press') ? '1517836357463-1c44e13e8b99' :
    text.includes('Sentadilla') || text.includes('Squat') ? '1574680178050-55c6a6a96e0a' :
    text.includes('Peso Muerto') || text.includes('Deadlift') ? '1526401485123-4ae56e49e4b2' :
    text.includes('Curl') ? '1583454122833-2537b0f95fa7' :
    text.includes('Hip Thrust') ? '1571019614242-c5c5dee9f50b' :
    text.includes('Remo') ? '1605296867304-46d5465a13f1' :
    text.includes('Jalón') || text.includes('Pull') ? '1581009146003-9e3c68a79d62' :
    '1534438327276-14e5300c3a48'
  }?auto=format&fit=crop&w=800&q=80`;

  const warmupData = [
    { title: "CARDIO BAJO", duration: "5-10 MIN", description: "Eleva tu temperatura corporal. 100-135 BPM.", icon: <Activity className="w-8 h-8" />, color: "from-red-600 to-orange-600" },
    { title: "FOAM ROLLING", duration: "2-3 MIN", description: "Liberación miofascial en grupos grandes.", icon: <Target className="w-8 h-8" />, color: "from-blue-600 to-cyan-600" },
    { title: "ACTIVACIÓN", duration: "~5 MIN", description: "Movimientos dinámicos sin estiramiento estático.", icon: <Zap className="w-8 h-8" />, color: "from-green-600 to-emerald-600" },
    { title: "APROXIMACIÓN", duration: "ESPECÍFICO", description: "Series de calentamiento con peso progresivo.", icon: <TrendingUp className="w-8 h-8" />, color: "from-purple-600 to-pink-600" }
  ];

  const champions = [
    { name: "JEFF NIPPARD", title: "CREADOR DEL PROGRAMA", stats: "10+ AÑOS EXPERIENCIA", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80" },
    { name: "MAURICIO & CARLOS", title: "PRÓXIMOS CAMPEONES DE COCHABAMBA", stats: "SEMANA 1 DE 12 • BOLIVIA", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80" }
  ];

  const workoutData = {
    1: { title: "PECHO Y TRÍCEPS", subtitle: "EMPUJE SUPERIOR", focus: "DOMINA EL PRESS", exercises: [
      { name: "Press de Banca con Barra", sets: 3, reps: "6", rpe: 7, rest: "3-4 min", note: "Codos a 45°. Retrae escápulas. Mantente firme.", img: getImageUrl("Press Banca"), videoId: getVideoEmbed("Press de Banca con Barra"), intensity: "ALTA" },
      { name: "Press Inclinado con Mancuernas", sets: 3, reps: "8", rpe: 8, rest: "2-3 min", note: "Escápulas retraídas. Hombros lejos de orejas.", img: getImageUrl("Press Inclinado"), videoId: getVideoEmbed("Press Inclinado con Mancuernas"), intensity: "ALTA" },
      { name: "Aperturas en Polea (Cable Flye)", sets: 3, reps: "12", rpe: 8, rest: "1-2 min", note: "Junta los codos internos, no las manos.", img: getImageUrl("Cable Fly"), videoId: getVideoEmbed("Aperturas en Polea (Cable Flye)"), intensity: "MEDIA" },
      { name: "Fondos Asistidos", sets: 3, reps: "10", rpe: 7, rest: "1-2 min", note: "Inclina torso 15° adelante para pecho.", img: getImageUrl("Fondos"), videoId: getVideoEmbed("Fondos Asistidos"), intensity: "MEDIA" },
      { name: "Rompecráneos con Mancuernas", sets: 3, reps: "12", rpe: 8, rest: "1-2 min", note: "No muevas el brazo superior. Solo antebrazos.", img: getImageUrl("Rompecráneos"), videoId: getVideoEmbed("Rompecráneos con Mancuernas"), intensity: "MEDIA" }
    ]},
    // ... (agrega los demás días como en tu código original: 2,3,5,6)
    // Para no hacer el mensaje eterno, asumo que copias los demás bloques de workoutData de tu versión anterior
    // Si necesitas que los incluya completos, dime y los agrego
  };

  const dayMapping = { 1: 1, 2: 2, 3: 3, 4: null, 5: 5, 6: 6, 7: null };

  const IntensityBadge = ({ level }: { level: string }) => {
    const colors = {
      'MÁXIMA': 'bg-red-600 border-red-400',
      'ALTA': 'bg-orange-600 border-orange-400',
      'MEDIA': 'bg-yellow-600 border-yellow-400',
      'BAJA': 'bg-green-600 border-green-400'
    };
    return <span className={`${colors[level as keyof typeof colors]} border-2 px-2 py-0.5 rounded text-xs font-black tracking-wider`}>{level}</span>;
  };

  const ModalVideo = ({ videoId, isOpen, onClose, title }: { videoId: string; isOpen: boolean; onClose: () => void; title: string }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-4xl mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-red-600" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="text-xl font-black text-white">{title} - Tutorial Jeff Nippard</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">×</button>
          </div>
          <div className="relative pt-[56.25%]">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`Tutorial de ${title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Hero, Nav, Warmup, etc. — mantén tu estructura original aquí */}
      {/* Solo muestro las partes nuevas/modificadas para brevedad */}

      {/* En la sección workout, dentro de cada exercise card, el botón de tutorial: */}
      {/* <button onClick={() => setModalVideo({ id: exercise.videoId, title: exercise.name })} ... >VER TUTORIAL</button> */}

      {/* Tracker en cada ejercicio (ejemplo dentro del map de exercises): */}
      {/* 
      <div className="mt-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
        <label className="block text-sm font-bold text-gray-300 mb-2">
          Peso & Reps hoy ({new Date().toLocaleDateString('es-BO')})
        </label>
        <input
          type="text"
          placeholder="Ej: 85kg × 6"
          value={progress[exercise.name]?.weights?.[new Date().toISOString().split('T')[0]] || ''}
          onChange={e => {
            const date = new Date().toISOString().split('T')[0];
            setProgress(prev => ({
              ...prev,
              [exercise.name]: {
                ...prev[exercise.name],
                weights: { ...prev[exercise.name]?.weights, [date]: e.target.value }
              }
            }));
          }}
          className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
        />
      </div>
      */}

      {/* Pestaña PROGRESS */}
      {activeTab === 'progress' && (
        <div className="space-y-8 py-8">
          <h2 className="text-5xl font-black text-center tracking-tighter">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">PROGRESO</span>
            <br />
            <span className="text-white">MAURICIO & CARLOS</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-2xl font-black mb-4">Before</h3>
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800" alt="Inicio" className="rounded-xl border-4 border-orange-500 mx-auto" />
              <p className="mt-2 text-gray-400">Semana 1 - Cochabamba</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black mb-4">After (actualiza pronto)</h3>
              <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800" alt="Progreso" className="rounded-xl border-4 border-green-500 mx-auto opacity-70" />
              <p className="mt-2 text-gray-400">¡Sigue dándole!</p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-2xl font-black mb-4">Pesos registrados</h3>
            {Object.keys(progress).length === 0 ? (
              <p className="text-gray-400">Aún no hay registros. ¡Empieza a loguear tus lifts!</p>
            ) : (
              Object.entries(progress).map(([ex, data]) => (
                <div key={ex} className="mb-4">
                  <h4 className="font-bold text-orange-400">{ex}</h4>
                  {Object.entries(data.weights || {}).map(([date, val]) => (
                    <p key={date} className="text-sm text-gray-300">{date}: {val}</p>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ModalVideo 
        videoId={modalVideo?.id || ''} 
        title={modalVideo?.title || ''} 
        isOpen={!!modalVideo} 
        onClose={() => setModalVideo(null)} 
      />

      {/* Footer y resto de tu app */}
    </div>
  );
};

export default ProgramApp;