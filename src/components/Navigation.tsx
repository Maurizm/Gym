'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

const ACTIVE_SESSION_KEY = 'gymapp:active_session';

export function Navigation() {
  const pathname = usePathname();
  const [hasActiveSession, setHasActiveSession] = useState(false);

  const isHome = pathname === '/' || pathname === '/workout';
  const isHistory = pathname === '/history';
  const isRoutine = pathname === '/routine';

  // Poll localStorage for active session indicator
  useEffect(() => {
    const check = () => {
      const s = storage.get<{ completed?: boolean } | null>(ACTIVE_SESSION_KEY, null);
      setHasActiveSession(!!s && !s.completed);
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="flex justify-between items-center h-touch-target-min px-lg w-full sticky top-0 z-40 bg-surface dark:bg-surface border-b border-outline-variant/30">
        <div className="flex items-center gap-sm">
          <img
            alt="El Proceso"
            className="w-10 h-10 object-contain rounded-xl shadow-sm border border-outline-variant/30"
            src="/assets/images/logo.png"
          />
          <div className="flex flex-col leading-none">
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight leading-tight">
              El Proceso
            </span>
            <span className="text-[10px] font-mono tracking-[0.18em] text-on-surface-variant uppercase opacity-60">
              Training
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <Link href="/" className={`nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer flex items-center gap-xs ${isHome ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary-fixed-dim'}`}>
            Entrenamiento
            {hasActiveSession && (
              <span className="w-2 h-2 rounded-full bg-[#39ff88] animate-pulse-dot inline-block" title="Sesión activa" />
            )}
          </Link>
          <Link href="/routine" className={`nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer ${isRoutine ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary-fixed-dim'}`}>
            Rutina
          </Link>
          <Link href="/history" className={`nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer ${isHistory ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary-fixed-dim'}`}>
            Historial
          </Link>
          <Link href="/settings" className={`nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer ${pathname === '/settings' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary-fixed-dim'}`}>
            Ajustes
          </Link>
          <Link href="/stats" className={`nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer ${pathname === '/stats' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary-fixed-dim'}`}>
            Estadísticas
          </Link>
        </nav>
        <div className="flex items-center gap-md">
          <button className="flex items-center justify-center w-touch-target-min h-touch-target-min text-on-surface">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex flex-row items-center justify-between px-lg py-md bg-surface-container-highest border-t border-outline-variant shadow-lg rounded-t-xl">
        <Link href="/" className={`mob-nav-btn relative flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all ${isHome ? 'bg-primary-container text-on-primary-container scale-100' : 'scale-95 text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined">fitness_center</span>
          <span className="font-label-caps text-label-caps">Entreno</span>
          {hasActiveSession && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#39ff88] animate-pulse-dot border border-[#0d0d0f]" />
          )}
        </Link>
        <Link href="/routine" className={`mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all ${isRoutine ? 'bg-primary-container text-on-primary-container scale-100' : 'scale-95 text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isRoutine ? "'FILL' 1" : "'FILL' 0" }}>calendar_month</span>
          <span className="font-label-caps text-label-caps">Rutina</span>
        </Link>
        <Link href="/history" className={`mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all ${isHistory ? 'bg-primary-container text-on-primary-container scale-100' : 'scale-95 text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined">history</span>
          <span className="font-label-caps text-label-caps">Historial</span>
        </Link>
        <Link href="/settings" className={`mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all ${pathname === '/settings' ? 'bg-primary-container text-on-primary-container scale-100' : 'scale-95 text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/settings' ? "'FILL' 1" : "'FILL' 0" }}>
            settings
          </span>
          <span className="font-label-caps text-label-caps">Ajustes</span>
        </Link>
        <Link href="/stats" className={`mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all ${pathname === '/stats' ? 'bg-primary-container text-on-primary-container scale-100' : 'scale-95 text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/stats' ? "'FILL' 1" : "'FILL' 0" }}>
            monitoring
          </span>
          <span className="font-label-caps text-label-caps">Stats</span>
        </Link>
      </nav>
    </>
  );
}
