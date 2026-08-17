'use client';

import { useState, useEffect } from 'react';
import { useRoutine, RoutineDay, RoutineExercise } from '@/hooks/useRoutine';
import { useExerciseLibrary, LibraryExercise } from '@/hooks/useExerciseLibrary';
import { useTheme } from 'next-themes';

type Tab = 'ROUTINE' | 'LIBRARY';

const DAY_NAMES: Record<string, string> = {
  monday: 'Lu', tuesday: 'Ma', wednesday: 'Mi', thursday: 'Ju',
  friday: 'Vi', saturday: 'Sa', sunday: 'Do'
};

/* ═══════════════════════════════════════════════════════════════════════════
   Decorated Theme Toggle — lives exclusively in Settings
   ═══════════════════════════════════════════════════════════════════════════ */
function ThemeToggleCard() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[120px] bg-surface border border-outline-variant rounded-2xl animate-pulse" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm dark:shadow-none overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: isDark ? 'radial-gradient(circle, #a22c29 0%, transparent 70%)' : 'radial-gradient(circle, #d6d5c9 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-sm mb-md">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
          <div>
            <h3 className="text-stat-value text-on-surface">Apariencia</h3>
            <p className="text-sm text-on-surface-variant">
              {isDark ? 'Modo oscuro AMOLED activo' : 'Modo claro activo'}
            </p>
          </div>
        </div>

        <div className="flex gap-sm">
          {/* Light option */}
          <button
            onClick={() => setTheme('light')}
            className={`
              flex-1 flex flex-col items-center gap-sm p-md rounded-xl border-2
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              active:scale-[0.97]
              ${!isDark
                ? 'border-primary bg-primary-soft shadow-sm'
                : 'border-outline-variant hover:border-on-surface-variant/30'
              }
            `}
          >
            {/* Mini preview */}
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#eeede5] border border-[#d6d5c9] p-1.5">
              <div className="w-full h-1.5 bg-[#a22c29] rounded-full mb-1" />
              <div className="w-3/4 h-1 bg-[#0a100d]/20 rounded-full mb-0.5" />
              <div className="w-1/2 h-1 bg-[#0a100d]/10 rounded-full" />
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: !isDark ? "'FILL' 1" : "'FILL' 0" }}>
                light_mode
              </span>
              <span className={`text-label-caps ${!isDark ? 'text-primary' : 'text-on-surface-variant'}`}>
                CLARO
              </span>
            </div>
          </button>

          {/* Dark option */}
          <button
            onClick={() => setTheme('dark')}
            className={`
              flex-1 flex flex-col items-center gap-sm p-md rounded-xl border-2
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              active:scale-[0.97]
              ${isDark
                ? 'border-primary bg-primary-soft shadow-sm'
                : 'border-outline-variant hover:border-on-surface-variant/30'
              }
            `}
          >
            {/* Mini preview */}
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#0a100d] border border-[#b9baa3]/15 p-1.5">
              <div className="w-full h-1.5 bg-[#a22c29] rounded-full mb-1" />
              <div className="w-3/4 h-1 bg-[#d6d5c9]/30 rounded-full mb-0.5" />
              <div className="w-1/2 h-1 bg-[#d6d5c9]/15 rounded-full" />
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isDark ? "'FILL' 1" : "'FILL' 0" }}>
                dark_mode
              </span>
              <span className={`text-label-caps ${isDark ? 'text-primary' : 'text-on-surface-variant'}`}>
                OSCURO
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Settings Page
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Settings() {
  const { routine, isLoaded: routineLoaded, updateDay, phases, currentPhase, saveRoutine } = useRoutine();
  const { library, isLoaded: libLoaded, addCustomExercise } = useExerciseLibrary();

  const [activeTab, setActiveTab] = useState<Tab>('ROUTINE');
  const [selectedDayId, setSelectedDayId] = useState<string>('monday');
  const [viewPhaseId, setViewPhaseId] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [showLibModal, setShowLibModal] = useState(false);

  const activePhaseId = viewPhaseId || (currentPhase?.id ?? '');
  const activePhase = phases.find(p => p.id === activePhaseId) || currentPhase;

  if (!routineLoaded || !libLoaded || !routine || !activePhase) return null;

  const daysMap = activePhase.days;
  const activeDay = daysMap.find(d => d.id === selectedDayId) || daysMap[0];

  const handleRemoveExercise = (exId: string) => {
    if (!confirm('¿Quitar este ejercicio del día?')) return;
    updateDay(activePhase.id, activeDay.id, activeDay.exercises.filter(e => e.id !== exId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newEx = [...activeDay.exercises];
    [newEx[index - 1], newEx[index]] = [newEx[index], newEx[index - 1]];
    updateDay(activePhase.id, activeDay.id, newEx);
  };

  const handleMoveDown = (index: number) => {
    if (index === activeDay.exercises.length - 1) return;
    const newEx = [...activeDay.exercises];
    [newEx[index + 1], newEx[index]] = [newEx[index], newEx[index + 1]];
    updateDay(activePhase.id, activeDay.id, newEx);
  };

  const handleAddToRoutine = (libEx: LibraryExercise) => {
    const newRoutineEx: RoutineExercise = {
      id: libEx.id,
      name: libEx.name,
      sets: 3,
      reps: 10,
      unit: libEx.unit,
      perSide: libEx.perSide,
      imageUrl: libEx.imageUrl,
      imageUrls: libEx.imageUrls
    };
    updateDay(activePhase.id, activeDay.id, [...activeDay.exercises, newRoutineEx]);
    setShowLibModal(false);
  };

  const handleCreateCustom = () => {
    if (!newExName.trim()) return;
    addCustomExercise(newExName.trim());
    setNewExName('');
    setShowAddModal(false);
  };

  const filteredLibrary = library.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-md md:px-lg pt-md pb-32 space-y-lg max-w-5xl mx-auto animate-fade-in-up">
      <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">Ajustes</h2>

      {/* ── Decorated Theme Toggle ── */}
      <ThemeToggleCard />

      {/* ── Program Details ── */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm dark:shadow-none relative">
        <div className="flex items-center gap-sm mb-md">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            calendar_month
          </span>
          <div>
            <h3 className="text-stat-value text-on-surface">Progreso del Programa</h3>
            <p className="text-sm text-on-surface-variant">
              Semana {currentPhase?.id === 'legacy' ? 1 : Math.max(1, Math.floor((Date.now() - (routine?.programStartDate || Date.now())) / (1000 * 60 * 60 * 24 * 7)) + 1)} · {currentPhase?.name || 'Fase 1'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-sm items-start sm:items-center">
          <label className="text-sm text-on-surface-variant flex-1">
            Reinicio del programa
          </label>
          <button
            onClick={() => {
              if (confirm('¿Reiniciar el programa desde la Semana 1 hoy?')) {
                saveRoutine({ ...routine, programStartDate: Date.now(), manualPhaseId: undefined });
              }
            }}
            className="px-md py-sm bg-surface-bright border border-outline-variant rounded-xl text-label-caps text-on-surface hover:bg-outline-variant/20 transition-colors"
          >
            REINICIAR A SEMANA 1
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full bg-surface rounded-xl border border-outline-variant p-1">
        <button
          onClick={() => setActiveTab('ROUTINE')}
          className={`
            flex-1 py-sm text-label-caps rounded-lg
            transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${activeTab === 'ROUTINE' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}
          `}
        >
          EDITAR RUTINA
        </button>
        <button
          onClick={() => setActiveTab('LIBRARY')}
          className={`
            flex-1 py-sm text-label-caps rounded-lg
            transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${activeTab === 'LIBRARY' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}
          `}
        >
          BIBLIOTECA
        </button>
      </div>

      {activeTab === 'ROUTINE' && (
        <div className="space-y-md">
          {phases.length > 1 && (
            <div className="flex w-full bg-surface rounded-xl border border-outline-variant p-1">
              {phases.map(p => (
                <button
                  key={p.id}
                  onClick={() => setViewPhaseId(p.id)}
                  className={`
                    flex-1 py-xs text-label-caps rounded-lg flex items-center justify-center gap-2
                    transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${p.id === activePhaseId ? 'bg-primary-soft text-primary shadow-sm border border-primary/20' : 'text-on-surface-variant hover:text-on-surface'}
                  `}
                >
                  {p.name}
                  {p.id === currentPhase?.id && <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Fase Activa" />}
                </button>
              ))}
            </div>
          )}

          {/* Day Selector */}
          <div className="flex gap-sm overflow-x-auto pb-sm no-scrollbar">
            {daysMap.map(day => (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`
                  px-md py-sm rounded-xl text-label-caps whitespace-nowrap border
                  transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  active:scale-[0.95]
                  ${selectedDayId === day.id
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/30'
                  }
                `}
              >
                {DAY_NAMES[day.id] || day.id.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Routine List */}
          <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
            {activeDay.exercises.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant text-body-md">
                Día de descanso. No hay ejercicios.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {activeDay.exercises.map((ex, idx) => (
                  <div key={`${ex.id}-${idx}`} className="p-md flex items-center justify-between gap-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-stat-value text-on-surface">{ex.name}</p>
                      <p className="text-body-md text-on-surface-variant">
                        {ex.sets} series de {ex.reps || `${ex.repsMin}-${ex.repsMax}`} {ex.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-xs">
                      <div className="flex flex-col gap-1 mr-xs">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="text-on-surface-variant disabled:opacity-20 hover:text-primary transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === activeDay.exercises.length - 1}
                          className="text-on-surface-variant disabled:opacity-20 hover:text-primary transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(ex.id)}
                        className="
                          w-10 h-10 flex items-center justify-center rounded-xl
                          bg-error-container/20 text-on-error-container
                          hover:bg-error-container/40
                          transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                          active:scale-[0.92]
                        "
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLibModal(true)}
              className="
                w-full p-md text-primary text-label-caps flex items-center justify-center gap-xs
                hover:bg-surface-bright border-t border-outline-variant
                transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              "
            >
              <span className="material-symbols-outlined text-sm">add</span>
              AÑADIR EJERCICIO
            </button>
          </div>
        </div>
      )}

      {activeTab === 'LIBRARY' && (
        <div className="space-y-md">
          <div className="flex gap-sm">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full bg-surface border border-outline-variant rounded-xl
                  pl-12 pr-md py-sm text-on-surface
                  focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none
                  transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                "
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="
                px-md bg-primary text-on-primary rounded-xl flex items-center justify-center h-touch-target-min
                hover:brightness-110 active:scale-[0.95]
                transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              "
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {filteredLibrary.map(ex => (
              <div key={ex.id} className="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm dark:shadow-none">
                {ex.imageUrl ? (
                  <img src={ex.imageUrl} className="w-12 h-12 rounded-lg object-cover opacity-60" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-bright flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">fitness_center</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-stat-value text-on-surface">{ex.name}</p>
                  {ex.isCustom && <span className="text-[10px] bg-primary-soft text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Custom</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Select Exercise to add to routine */}
      {showLibModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col justify-end md:items-center md:justify-center">
          <div className="bg-surface rounded-t-3xl md:rounded-3xl h-[80vh] md:h-auto md:max-h-[70vh] md:w-[500px] flex flex-col animate-slide-up border-t md:border border-outline-variant shadow-2xl">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-headline-md text-on-surface">Seleccionar Ejercicio</h3>
              <button
                onClick={() => setShowLibModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-surface-bright rounded-full hover:bg-outline-variant/20 transition-colors duration-150"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-md">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl px-md py-sm text-on-surface focus:border-primary focus:outline-none transition-colors duration-150"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-md space-y-xs">
              {filteredLibrary.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => handleAddToRoutine(ex)}
                  className="
                    w-full text-left bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md
                    hover:border-primary/40 active:bg-surface-bright
                    transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                >
                  {ex.imageUrl ? (
                    <img src={ex.imageUrl} className="w-10 h-10 rounded-lg object-cover opacity-50" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface-bright flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">fitness_center</span>
                    </div>
                  )}
                  <span className="text-stat-value text-on-surface">{ex.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Custom Exercise */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-surface rounded-2xl p-lg w-full max-w-sm border border-outline-variant animate-scale-in shadow-2xl">
            <h3 className="text-headline-md text-on-surface mb-md">Crear Ejercicio</h3>
            <div className="space-y-md">
              <div>
                <label className="text-on-surface-variant text-label-caps block mb-xs">NOMBRE DEL EJERCICIO</label>
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="
                    w-full bg-surface border border-outline-variant rounded-xl px-md py-sm text-on-surface
                    focus:border-primary focus:outline-none
                    transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                  placeholder="Ej. Curl Martillo Inclinado"
                  autoFocus
                />
              </div>
              <div className="flex gap-sm pt-sm">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="
                    flex-1 py-sm rounded-xl border border-outline-variant text-on-surface text-label-caps
                    hover:bg-surface-bright active:scale-[0.97]
                    transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleCreateCustom}
                  disabled={!newExName.trim()}
                  className="
                    flex-1 py-sm rounded-xl bg-primary text-on-primary text-label-caps
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:brightness-110 active:scale-[0.97]
                    transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                >
                  GUARDAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
