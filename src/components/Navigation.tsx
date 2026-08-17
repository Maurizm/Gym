'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

const ACTIVE_SESSION_KEY = 'gymapp:active_session';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Entreno', icon: 'fitness_center' },
  { href: '/routine', label: 'Rutina', icon: 'calendar_month' },
  { href: '/history', label: 'Historial', icon: 'history' },
  { href: '/stats', label: 'Stats', icon: 'bar_chart' },
  { href: '/settings', label: 'Ajustes', icon: 'settings' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === '/workout';
  return pathname.startsWith(href);
}

export function Navigation() {
  const pathname = usePathname();
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE TOP APP BAR — visible below md
          ══════════════════════════════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 left-0 right-0 z-40 h-14 bg-surface/90 backdrop-blur-xl border-b border-outline-variant px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 active:scale-[0.98] transition-transform">
          <div className="w-8 h-8 shrink-0 relative flex items-center justify-center">
            <img
              alt="El Proceso"
              className="w-8 h-8 object-contain rounded-lg shrink-0 block dark:hidden shadow-sm"
              src="/assets/images/Logoclaro.jpg"
            />
            <img
              alt="El Proceso"
              className="w-8 h-8 object-contain rounded-lg shrink-0 hidden dark:block shadow-sm"
              src="/assets/images/logooscuro.jpg"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-primary tracking-tight">
              El Proceso
            </span>
            <span className="text-[8px] font-mono tracking-[0.18em] text-on-surface-variant uppercase opacity-60">
              Training
            </span>
          </div>
        </Link>
        {hasActiveSession && (
          <Link
            href="/workout"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-[11px] font-bold tracking-wide animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            En Curso
          </Link>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR — visible at md+
          ══════════════════════════════════════════════════════════════════════ */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`
          hidden md:flex flex-col shrink-0 sticky top-0 h-screen
          bg-surface border-r border-outline-variant
          transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarExpanded ? 'w-56' : 'w-[72px]'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-sm h-16 px-md border-b border-outline-variant overflow-hidden">
          <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
            <img
              alt="El Proceso"
              className="w-9 h-9 object-contain rounded-xl shrink-0 block dark:hidden shadow-sm"
              src="/assets/images/Logoclaro.jpg"
            />
            <img
              alt="El Proceso"
              className="w-9 h-9 object-contain rounded-xl shrink-0 hidden dark:block shadow-sm"
              src="/assets/images/logooscuro.jpg"
            />
          </div>
          <div
            className={`
              flex flex-col leading-none whitespace-nowrap overflow-hidden
              transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}
            `}
          >
            <span className="text-lg font-bold text-primary tracking-tight leading-tight">
              El Proceso
            </span>
            <span className="text-[9px] font-mono tracking-[0.18em] text-on-surface-variant uppercase opacity-60">
              Training
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-xs px-sm py-md" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex items-center gap-sm h-11 rounded-xl overflow-hidden
                  transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${sidebarExpanded ? 'px-md' : 'justify-center px-0'}
                  ${active
                    ? 'bg-primary/12 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
                  }
                `}
                aria-current={active ? 'page' : undefined}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
                )}

                <span
                  className="material-symbols-outlined text-xl shrink-0"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>

                <span
                  className={`
                    text-sm font-medium whitespace-nowrap overflow-hidden
                    transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}
                  `}
                >
                  {item.label}
                </span>

                {/* Active session indicator */}
                {item.href === '/' && hasActiveSession && (
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot shrink-0 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-sm pb-md border-t border-outline-variant pt-md">
          <div
            className={`
              flex items-center gap-sm px-md overflow-hidden
              transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <span className="text-[10px] text-on-surface-variant font-mono tracking-wider opacity-50">
              v0.1.0
            </span>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM TAB BAR — visible below md
          ══════════════════════════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50
                   flex items-center justify-around
                   h-[72px] px-sm
                   bg-surface/80 backdrop-blur-xl
                   border-t border-outline-variant
                   safe-area-bottom"
        aria-label="Navegación principal"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center
                w-16 h-14 rounded-2xl
                transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                active:scale-[0.92]
                ${active
                  ? 'text-primary'
                  : 'text-on-surface-variant'
                }
              `}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active pill background */}
              {active && (
                <span className="absolute inset-x-2 top-0.5 h-8 bg-primary/12 rounded-full" />
              )}

              <span
                className="material-symbols-outlined text-[22px] relative z-10"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>

              <span className={`
                text-[10px] font-semibold tracking-wide mt-0.5 relative z-10
                ${active ? 'text-primary' : 'text-on-surface-variant'}
              `}>
                {item.label}
              </span>

              {/* Active session dot */}
              {item.href === '/' && hasActiveSession && (
                <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-success animate-pulse-dot border-2 border-surface" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
