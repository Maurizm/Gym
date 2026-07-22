'use client';

import { useState, useEffect } from 'react';
import { useRoutine, RoutineDay, RoutineExercise } from '@/hooks/useRoutine';
import { useExerciseLibrary, LibraryExercise } from '@/hooks/useExerciseLibrary';
import { useTheme } from 'next-themes';

type Tab = 'ROUTINE' | 'LIBRARY';

const DAY_NAMES: Record<string, string> = {
  monday: 'LUN',
  tuesday: 'MAR',
  wednesday: 'MIÉ',
  thursday: 'JUE',
  friday: 'VIE',
  saturday: 'SÁB',
  sunday: 'DOM'
};

export default function Settings() {
  const { routine, isLoaded: routineLoaded, updateDay } = useRoutine();
  const { library, isLoaded: libLoaded, addCustomExercise } = useExerciseLibrary();
  
  const [activeTab, setActiveTab] = useState<Tab>('ROUTINE');
  const [selectedDayId, setSelectedDayId] = useState<string>('monday');

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  
  // Modal for adding exercise to routine day
  const [showLibModal, setShowLibModal] = useState(false);

  if (!routineLoaded || !libLoaded || !routine) return null;

  const daysMap = routine.days;
  const activeDay = daysMap.find(d => d.id === selectedDayId) || daysMap[0];

  const handleRemoveExercise = (exId: string) => {
    if (!confirm('¿Quitar este ejercicio del día?')) return;
    updateDay(activeDay.id, activeDay.exercises.filter(e => e.id !== exId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newEx = [...activeDay.exercises];
    [newEx[index - 1], newEx[index]] = [newEx[index], newEx[index - 1]];
    updateDay(activeDay.id, newEx);
  };

  const handleMoveDown = (index: number) => {
    if (index === activeDay.exercises.length - 1) return;
    const newEx = [...activeDay.exercises];
    [newEx[index + 1], newEx[index]] = [newEx[index], newEx[index + 1]];
    updateDay(activeDay.id, newEx);
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
    updateDay(activeDay.id, [...activeDay.exercises, newRoutineEx]);
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
    <div className="px-md md:px-lg pt-md pb-32 space-y-lg animate-fade-in-up">
      <h2 className="font-headline-md text-headline-md text-on-surface">Ajustes</h2>

      {/* Theme Toggle */}
      {mounted && (
        <div className="bg-surface border border-outline-variant rounded-lg p-md flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <h3 className="font-stat-value text-stat-value text-on-surface">Apariencia</h3>
            <p className="text-sm text-on-surface-variant mt-1">Elige tu vibra de entrenamiento</p>
          </div>
          <div className="flex bg-background rounded-lg p-1 border border-outline-variant">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-lg font-label-caps text-label-caps transition-all ${theme === 'light' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              LAB
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-lg font-label-caps text-label-caps transition-all ${theme === 'dark' ? 'bg-[#2d2d33] shadow-sm text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              IRON
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex w-full bg-surface rounded-lg border border-outline-variant p-1">
        <button
          onClick={() => setActiveTab('ROUTINE')}
          className={`flex-1 py-sm font-label-caps text-label-caps rounded-lg transition-colors ${activeTab === 'ROUTINE' ? 'bg-[#2d2d33] text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          EDITAR RUTINA
        </button>
        <button
          onClick={() => setActiveTab('LIBRARY')}
          className={`flex-1 py-sm font-label-caps text-label-caps rounded-lg transition-colors ${activeTab === 'LIBRARY' ? 'bg-[#2d2d33] text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          BIBLIOTECA
        </button>
      </div>

      {activeTab === 'ROUTINE' && (
        <div className="space-y-md">
          {/* Day Selector */}
          <div className="flex gap-sm overflow-x-auto pb-sm no-scrollbar">
            {daysMap.map(day => (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`px-md py-sm rounded-lg font-label-caps text-label-caps whitespace-nowrap transition-all border ${
                  selectedDayId === day.id 
                    ? 'bg-primary-container text-on-primary-container border-primary-container' 
                    : 'bg-surface border-outline-variant text-on-surface-variant'
                }`}
              >
                {DAY_NAMES[day.id] || day.id.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Routine List */}
          <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
            {activeDay.exercises.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant font-body-md text-body-md">
                Día de descanso. No hay ejercicios.
              </div>
            ) : (
              <div className="divide-y divide-[#2d2d33]">
                {activeDay.exercises.map((ex, idx) => (
                  <div key={`${ex.id}-${idx}`} className="p-md flex items-center justify-between gap-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-stat-value text-stat-value text-on-surface">{ex.name}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        {ex.sets} series de {ex.reps || `${ex.repsMin}-${ex.repsMax}`} {ex.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-xs">
                      <div className="flex flex-col gap-1 mr-xs">
                        <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="text-on-surface-variant disabled:opacity-20 hover:text-primary">
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                        </button>
                        <button onClick={() => handleMoveDown(idx)} disabled={idx === activeDay.exercises.length - 1} className="text-on-surface-variant disabled:opacity-20 hover:text-primary">
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                        </button>
                      </div>
                      <button onClick={() => handleRemoveExercise(ex.id)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-error-container text-on-error-container">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => setShowLibModal(true)}
              className="w-full p-md text-primary font-label-caps text-label-caps flex items-center justify-center gap-xs hover:bg-[#232328] transition-colors border-t border-outline-variant"
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
                className="w-full bg-surface border border-outline-variant rounded-lg pl-12 pr-md py-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-md bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center h-touch-target-min"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {filteredLibrary.map(ex => (
              <div key={ex.id} className="bg-surface border border-outline-variant rounded-lg p-md flex items-center gap-md">
                {ex.imageUrl ? (
                  <img src={ex.imageUrl} className="w-12 h-12 rounded-lg object-cover grayscale opacity-50" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#2d2d33] flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">fitness_center</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-stat-value text-stat-value text-on-surface">{ex.name}</p>
                  {ex.isCustom && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Custom</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Select Exercise to add to routine */}
      {showLibModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface rounded-t-3xl h-[80vh] flex flex-col animate-slide-up border-t border-outline-variant">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Seleccionar Ejercicio</h3>
              <button onClick={() => setShowLibModal(false)} className="w-10 h-10 flex items-center justify-center bg-surface-bright rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-md">
              <input 
                type="text" 
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-md py-sm text-on-surface"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-md space-y-xs">
              {filteredLibrary.map(ex => (
                <button 
                  key={ex.id} 
                  onClick={() => handleAddToRoutine(ex)}
                  className="w-full text-left bg-surface border border-outline-variant rounded-lg p-md flex items-center gap-md hover:border-primary active:bg-surface-bright"
                >
                  {ex.imageUrl ? (
                    <img src={ex.imageUrl} className="w-10 h-10 rounded-lg object-cover grayscale opacity-50" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#2d2d33] flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">fitness_center</span>
                    </div>
                  )}
                  <span className="font-stat-value text-stat-value text-on-surface">{ex.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Custom Exercise */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-md">
          <div className="bg-surface rounded-lg p-lg w-full max-w-sm border border-outline-variant animate-fade-in-up">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Crear Ejercicio</h3>
            <div className="space-y-md">
              <div>
                <label className="text-on-surface-variant font-label-caps text-label-caps block mb-xs">NOMBRE DEL EJERCICIO</label>
                <input 
                  type="text" 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-md py-sm text-on-surface focus:border-primary focus:outline-none"
                  placeholder="Ej. Curl Martillo Inclinado"
                  autoFocus
                />
              </div>
              <div className="flex gap-sm pt-sm">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-sm rounded-lg border border-outline-variant text-on-surface font-label-caps text-label-caps"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleCreateCustom}
                  disabled={!newExName.trim()}
                  className="flex-1 py-sm rounded-lg bg-primary-container text-on-primary-container font-label-caps text-label-caps disabled:opacity-50"
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
