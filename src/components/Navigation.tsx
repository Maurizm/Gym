'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '/workout';
  const isHistory = pathname === '/history';

  return (
    <>
      <header className="flex justify-between items-center h-touch-target-min px-lg w-full sticky top-0 z-40 bg-surface dark:bg-surface border-b border-outline-variant/30">
        <div className="flex items-center gap-xs">
          <img alt="Logo Procesos" className="w-8 h-8 object-contain rounded-md" src="/assets/images/logo.png" />
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">PROCESOS</span>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <Link href="/" className={`nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer \${isHome ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary-fixed-dim'}`}>
            Entrenamiento
          </Link>
          <Link href="/history" className={`nav-link font-body-md text-body-md transition-colors duration-200 cursor-pointer \${isHistory ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary-fixed-dim'}`}>
            Historial
          </Link>
          <a className="text-on-surface-variant font-medium hover:text-primary-fixed-dim font-body-md text-body-md transition-colors duration-200 cursor-pointer">Ajustes</a>
        </nav>
        <div className="flex items-center gap-md">
          <button className="flex items-center justify-center w-touch-target-min h-touch-target-min text-on-surface">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex flex-row items-center justify-between px-lg py-md bg-surface-container-highest border-t border-outline-variant shadow-lg rounded-t-xl">
        <Link href="/" className={`mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all \${isHome ? 'bg-primary-container text-on-primary-container scale-100' : 'scale-95 text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined">fitness_center</span>
          <span className="font-label-caps text-label-caps">Entreno</span>
        </Link>
        <Link href="/history" className={`mob-nav-btn flex flex-col items-center justify-center rounded-lg px-md py-xs transition-all \${isHistory ? 'bg-primary-container text-on-primary-container scale-100' : 'scale-95 text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined">history</span>
          <span className="font-label-caps text-label-caps">Historial</span>
        </Link>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-bright transition-all">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-caps text-label-caps">Ajustes</span>
        </button>
      </nav>
    </>
  );
}
