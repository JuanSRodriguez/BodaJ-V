
import React, { useEffect, useRef } from 'react';
import { TimelineItem } from '../types';

interface TimelineViewProps {
  timeline: TimelineItem[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, setTimeline }) => {
  const lastItemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const emptyItem = timeline.find(t => t.activity === '');
    if (emptyItem) {
      setTimeout(() => {
        const input = document.getElementById(`activity-${emptyItem.id}`) as HTMLInputElement;
        input?.focus();
      }, 50);
    }
  }, [timeline.length]);

  const updateItem = (id: string, updates: Partial<TimelineItem>) => {
    setTimeline(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t).sort((a, b) => a.time.localeCompare(b.time)));
  };

  const deleteItem = (id: string) => {
    setTimeline(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-40">
      <div className="mb-12 lg:mb-20 text-center">
        <h2 className="text-3xl lg:text-5xl font-serif font-black text-stone-50 italic tracking-tight mb-4">Coreografía del Evento</h2>
        <p className="text-stone-500 text-sm lg:text-base font-medium">Afinando el ritmo de tu celebración para un flujo perfecto.</p>
      </div>

      <div className="relative space-y-12 lg:space-y-16 before:absolute before:left-[35px] lg:before:left-[139px] before:top-8 before:bottom-8 before:w-0.5 before:bg-stone-800 before:shadow-sm">
        {timeline.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-stone-800 rounded-[3rem] bg-stone-950/20">
            <span className="text-7xl block mb-10 grayscale opacity-10 animate-pulse">⏳</span>
            <p className="text-stone-600 font-serif italic text-2xl tracking-wide">La secuencia de eventos aún no ha sido orquestada.</p>
          </div>
        ) : (
          timeline.map((item, idx) => (
            <div key={item.id} className="relative flex flex-col md:flex-row items-start gap-10 lg:gap-16 group transition-all duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="w-20 pl-4 lg:pl-0 pt-1 lg:text-right">
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateItem(item.id, { time: e.target.value })}
                  className="bg-transparent border-none p-0 text-xl lg:text-3xl font-serif font-black text-stone-50 lg:text-right focus:ring-0 cursor-pointer hover:text-rose-400 transition-colors tracking-tighter tabular-nums"
                />
              </div>

              <div className="absolute left-[28px] lg:left-[132px] top-4 lg:top-4 w-4 h-4 bg-stone-900 border-4 border-rose-500 rounded-full z-10 transition-transform duration-500 group-hover:scale-150 group-hover:bg-rose-500 shadow-lg shadow-rose-900/40"></div>

              <div className="flex-1 w-full card-premium p-6 lg:p-10 relative overflow-hidden group shadow-black/40">
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-950/20 rounded-full -mr-20 -mt-20 transition-transform duration-1000 group-hover:scale-110"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6 lg:mb-8 border-b border-stone-800 pb-4 lg:pb-6 gap-4">
                    <input
                      id={`activity-${item.id}`}
                      value={item.activity}
                      onChange={(e) => updateItem(item.id, { activity: e.target.value })}
                      placeholder="Definiendo el momento..."
                      className="flex-1 bg-transparent border-none p-0 text-lg lg:text-xl font-black text-stone-50 focus:ring-0 placeholder:text-stone-800 uppercase italic tracking-tight"
                    />
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-3 text-stone-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-950/30 rounded-2xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em]">Entorno / Lugar</label>
                      <div className="flex items-center gap-3">
                        <span className="text-xl opacity-20">📍</span>
                        <input
                          value={item.location}
                          onChange={(e) => updateItem(item.id, { location: e.target.value })}
                          placeholder="Ej: Jardín Secreto, Salón Principal..."
                          className="w-full bg-transparent border-none p-0 text-[14px] text-stone-400 font-bold focus:ring-0 italic"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em]">Dirección y Notas</label>
                      <div className="flex items-center gap-3">
                        <span className="text-xl opacity-20">📋</span>
                        <input
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                          placeholder="Asignar liderazgo o instrucciones detalladas..."
                          className="w-full bg-transparent border-none p-0 text-[14px] text-stone-400 font-bold focus:ring-0 italic"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
