import { Activity, Target, Zap, TrendingUp } from 'lucide-react';
import type { WarmupStep } from '../types';

export const warmupData: WarmupStep[] = [
    {
        title: 'CARDIO BAJO',
        duration: '5-10 MIN',
        description: 'Eleva tu temperatura corporal. 100-135 BPM. Cualquier máquina: cinta, bici, elíptica.',
        icon: <Activity className="w-8 h-8" />,
        color: 'from-red-600 to-orange-600',
        img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17be5d?auto=format&fit=crop&w=800&q=80',
        videoId: 'IODxDxX7oi4',
    },
    {
        title: 'FOAM ROLLING',
        duration: '2-3 MIN',
        description: 'Liberación miofascial en los grupos musculares que vas a entrenar. Mejora el ROM y reduce el riesgo de lesión.',
        icon: <Target className="w-8 h-8" />,
        color: 'from-blue-600 to-cyan-600',
        img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
        videoId: 'zP_-eDMUhfU',
    },
    {
        title: 'ACTIVACIÓN DINÁMICA',
        duration: '~5 MIN',
        description: 'Movimientos dinámicos específicos al músculo del día. Sin estiramiento estático — eso reduce la fuerza.',
        icon: <Zap className="w-8 h-8" />,
        color: 'from-green-600 to-emerald-600',
        img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
        videoId: 'Q2F5jH2OWmI',
    },
    {
        title: 'SERIES DE APROXIMACIÓN',
        duration: 'ESPECÍFICO',
        description: 'Series de calentamiento con peso progresivo: 50% × 10 → 70% × 5 → 85% × 2 antes del primer trabajo real.',
        icon: <TrendingUp className="w-8 h-8" />,
        color: 'from-purple-600 to-pink-600',
        img: 'https://images.unsplash.com/photo-1526403646761-63940d0ec9a7?auto=format&fit=crop&w=800&q=80',
        videoId: 'oiDLTfC0jG0',
    },
];
