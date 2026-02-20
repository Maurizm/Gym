import { Users, Star, TrendingUp } from 'lucide-react';
import type { Champion, StatItem } from '../types';

export const champions: Champion[] = [
    {
        name: 'JEFF NIPPARD',
        title: 'CREADOR DEL PROGRAMA',
        stats: '10+ AÑOS EXPERIENCIA',
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'TU NOMBRE',
        title: 'PRÓXIMO CAMPEÓN',
        stats: 'SEMANA 1 DE 12',
        img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    },
];

export const stats: StatItem[] = [
    { icon: Users, label: 'ATLETAS ACTIVOS', value: '1,000+', color: 'from-blue-600 to-cyan-600' },
    { icon: Star, label: 'RATING PROMEDIO', value: '4.9/5', color: 'from-yellow-600 to-orange-600' },
    { icon: TrendingUp, label: 'MEJORA GARANTIZADA', value: '100%', color: 'from-green-600 to-emerald-600' },
];
