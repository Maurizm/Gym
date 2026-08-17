'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface WorkoutSummaryData {
  durationSecs: number;
  totalVolume: number;
  totalSetsCompleted: number;
  starExercise: { name: string; weight: number };
  dayLabel: string;
  prsBroken?: Array<{ name: string; weight: number }>;
}

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WorkoutSummaryData;
}

export function WorkoutSummaryModal({ isOpen, onClose, data }: WorkoutSummaryModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${s}s`;
  };

  const volumeInTons = (data.totalVolume / 1000).toFixed(2);
  const formattedVolume = data.totalVolume >= 1000
    ? `${volumeInTons} Toneladas`
    : `${data.totalVolume} kg`;

  const getEquivalence = (kg: number) => {
    if (kg > 15000) return '🚀 ¡Has levantado el peso de un autobús escolar!';
    if (kg > 8000) return '🦏 ¡Has levantado el equivalente a 4 rinocerontes adultos!';
    if (kg > 4000) return '🚗 ¡Has levantado más peso que 3 coches compactos!';
    if (kg > 1500) return '🐃 ¡Has levantado el equivalente a un bisonte gigante!';
    return '🔥 ¡Excelente volumen de entrenamiento completado!';
  };

  const handleShare = async () => {
    const prsText = data.prsBroken && data.prsBroken.length > 0
      ? `\n🏆 PRs: ${data.prsBroken.map(p => `${p.name} (${p.weight}kg)`).join(', ')}`
      : '';

    const shareText = `💪 ¡Entrenamiento completado en El Proceso!\n📅 ${data.dayLabel}\n⏱️ Duración: ${formatDuration(data.durationSecs)}\n⚡ Volumen Total: ${data.totalVolume.toLocaleString('es-ES')} kg\n🎯 Series: ${data.totalSetsCompleted}\n⭐ Ejercicio Estrella: ${data.starExercise.name || 'Sin registro'} (${data.starExercise.weight}kg)${prsText}\n\n#ElProceso #JeffNippard`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Resumen de Entrenamiento — El Proceso',
          text: shareText,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if user dismissed or unsupported
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleFinishAndExit = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl animate-fade-in-up overflow-y-auto">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-surface border border-outline-variant/40 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden my-auto animate-scale-in">
        
        {/* Card Top Banner / Strava Wrapped Header */}
        <div className="relative bg-gradient-to-b from-primary/20 via-primary/5 to-transparent px-6 pt-7 pb-4 text-center border-b border-outline-variant/20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold tracking-widest uppercase mb-3">
            <span className="material-symbols-outlined text-xs">workspace_premium</span>
            WRAPPED DE ENTRENAMIENTO
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            ¡Sesión Demolida!
          </h2>
          <p className="text-on-surface-variant text-sm font-medium mt-1 capitalize">
            {data.dayLabel} · {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* Big Impact Stat: Total Volume */}
        <div className="px-6 pt-5 pb-4">
          <div className="relative bg-surface-bright/70 border border-outline-variant/30 rounded-2xl p-4 text-center overflow-hidden shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 block mb-1">
              VOLUMEN TOTAL LEVANTADO
            </span>
            <div className="text-3xl md:text-4xl font-extrabold text-primary font-mono tracking-tight my-1">
              {data.totalVolume.toLocaleString('es-ES')} <span className="text-xl font-bold text-on-surface">KG</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium mt-2 bg-background/50 py-1.5 px-3 rounded-lg border border-outline-variant/20 inline-block">
              {getEquivalence(data.totalVolume)}
            </p>
          </div>
        </div>

        {/* 3 Grid Stats */}
        <div className="grid grid-cols-3 gap-2.5 px-6 pb-4">
          <div className="bg-surface-bright/40 border border-outline-variant/20 rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-xl mb-1 block">timer</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">TIEMPO</span>
            <span className="text-sm font-bold text-on-surface font-mono">{formatDuration(data.durationSecs)}</span>
          </div>

          <div className="bg-surface-bright/40 border border-outline-variant/20 rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-success text-xl mb-1 block">check_circle</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">SERIES</span>
            <span className="text-sm font-bold text-on-surface font-mono">{data.totalSetsCompleted}</span>
          </div>

          <div className="bg-surface-bright/40 border border-outline-variant/20 rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-warning text-xl mb-1 block">fitness_center</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">MÁX CARGA</span>
            <span className="text-sm font-bold text-on-surface font-mono">{data.starExercise.weight || 0} kg</span>
          </div>
        </div>

        {/* Star Exercise Highlight */}
        {data.starExercise.name && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">star</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  EJERCICIO ESTRELLA
                </span>
                <p className="text-sm font-bold text-on-surface truncate">
                  {data.starExercise.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-primary">{data.starExercise.weight} kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Science Nippard Note */}
        <div className="px-6 pb-5">
          <div className="bg-surface-bright/30 rounded-xl p-3 border border-outline-variant/20 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-primary/80 shrink-0 mt-0.5">school</span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              <strong>Consejo de Nippard:</strong> La sesión ha terminado, pero el crecimiento apenas comienza. Prioriza 0.4g de proteína por kg en tu próxima comida y 8h de sueño reparador.
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-surface-bright/60 px-6 py-4 border-t border-outline-variant/20 flex flex-col gap-2.5">
          <button
            onClick={handleShare}
            className="
              w-full h-12 rounded-xl text-sm font-bold tracking-wide
              bg-surface text-on-surface border border-outline-variant/60
              hover:bg-surface-container active:scale-[0.98]
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              flex items-center justify-center gap-2 shadow-sm
            "
          >
            <span className="material-symbols-outlined text-lg">
              {copied ? 'done' : 'share'}
            </span>
            {copied ? '¡Copiado al Portapapeles!' : 'Compartir Resumen'}
          </button>

          <button
            onClick={handleFinishAndExit}
            className="
              w-full h-12 rounded-xl text-sm font-bold tracking-wide
              bg-primary text-on-primary
              hover:brightness-110 active:scale-[0.98]
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              flex items-center justify-center gap-2 shadow-lg shadow-primary/25
            "
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Listo, Volver al Inicio
          </button>
        </div>

      </div>
    </div>
  );
}
