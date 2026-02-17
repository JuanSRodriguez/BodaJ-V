
import React, { useState } from 'react';
import { Guest, Table } from '../types';

interface SeatingPlanProps {
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
};

export const SeatingPlan: React.FC<SeatingPlanProps> = ({ guests, setGuests, tables, setTables }) => {
  const [tableName, setTableName] = useState('');

  const addTable = () => {
    if (!tableName) return;
    const newTable: Table = {
      id: generateId(),
      name: tableName,
      capacity: 10
    };
    setTables(prev => [...prev, newTable]);
    setTableName('');
  };

  const removeTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    setGuests(prev => prev.map(g => g.tableId === id ? { ...g, tableId: undefined } : g));
  };

  const assignTable = (guestId: string, tableId: string | undefined) => {
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, tableId } : g));
  };

  const guestsWithoutTable = guests.filter(g => !g.tableId && g.confirmed);

  return (
    <div className="space-y-12 animate-fade-in pb-40">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl lg:text-4xl font-serif font-black text-stone-50 italic tracking-tight">Distribución Espacial</h2>
          <p className="text-stone-500 text-sm mt-2 font-medium">Armonizando almas y conversaciones en tu celebración.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 glass p-3 sm:p-2 rounded-2xl border border-stone-800 shadow-xl shadow-black/40 w-full lg:w-auto">
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Nombra tu mesa (Ej: Orión, Venecia)..."
            className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-6 py-4 sm:py-3 text-sm font-bold text-stone-100 focus:outline-none focus:ring-4 focus:ring-rose-500/10 lg:w-72 transition-all placeholder:text-stone-700"
            onKeyPress={(e) => e.key === 'Enter' && addTable()}
          />
          <button
            onClick={addTable}
            className="bg-stone-50 text-stone-900 px-8 py-4 sm:py-3 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-lg shadow-black/20"
          >
            Añadir Espacio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        <div className="lg:col-span-1 glass p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-stone-800 shadow-premium lg:sticky lg:top-32">
          <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-6 lg:mb-8 flex items-center justify-between">
            Esperando Ubicación
            <span className="bg-rose-950/40 text-rose-400 px-3 py-1 rounded-full text-[11px] font-black shadow-inner ring-1 ring-rose-900/50">{guestsWithoutTable.length}</span>
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {guestsWithoutTable.length === 0 ? (
              <div className="text-center py-20 text-stone-600 italic font-serif text-sm">Cada alma ha encontrado su lugar.</div>
            ) : (
              guestsWithoutTable.map(guest => (
                <div key={guest.id} className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-sm flex items-center justify-between group hover:border-rose-900/50 hover:shadow-black/60 transition-all">
                  <span className="text-[13px] font-bold text-stone-200 tracking-tight">{guest.name}</span>
                  <select
                    onChange={(e) => assignTable(guest.id, e.target.value)}
                    value=""
                    className="text-[9px] font-black uppercase tracking-widest bg-stone-800 border-none rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer hover:bg-stone-700 text-stone-300"
                  >
                    <option value="" disabled className="bg-stone-900">Ubicación...</option>
                    {tables.map(t => <option key={t.id} value={t.id} className="bg-stone-900">{t.name}</option>)}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-10">
          {tables.length === 0 ? (
            <div className="col-span-full py-40 text-center bg-stone-900/50 border-2 border-dashed border-stone-800 rounded-[4rem] flex flex-col items-center">
              <span className="text-8xl mb-10 grayscale opacity-10 animate-pulse">🏛️</span>
              <p className="text-stone-500 font-serif italic text-2xl tracking-wide">Comienza a diseñar tu plano añadiendo mesas.</p>
            </div>
          ) : (
            tables.map(table => {
              const tableGuests = guests.filter(g => g.tableId === table.id);
              const occupancy = tableGuests.length;
              const isFull = occupancy >= table.capacity;

              return (
                <div key={table.id} className="card-premium p-10 relative group overflow-hidden border-none hover:shadow-2xl transition-all duration-700 shadow-black/60">
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-all duration-700 group-hover:scale-150 ${isFull ? 'bg-rose-950/20' : 'bg-emerald-950/20'}`}></div>

                  <div className="relative z-10 space-y-6 lg:space-y-8">
                    <div className="flex lg:items-center justify-between border-b border-stone-800 pb-4 lg:pb-6 gap-4">
                      <div>
                        <h4 className="font-serif font-black text-stone-50 text-xl lg:text-2xl italic tracking-tight group-hover:text-rose-400 transition-colors uppercase">{table.name}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isFull ? 'text-rose-400' : 'text-stone-500'}`}>
                            {occupancy} / {table.capacity} Capacidad
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTable(table.id)}
                        className="p-3 text-stone-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-950/30 rounded-2xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {tableGuests.map(guest => (
                        <div key={guest.id} className="bg-stone-950 px-4 py-3 rounded-2xl border border-stone-800 hover:border-stone-700 hover:bg-stone-900 hover:shadow-lg transition-all flex items-center justify-between group/item">
                          <span className="text-[12px] font-bold text-stone-200 truncate tracking-tight">{guest.name}</span>
                          <button
                            onClick={() => assignTable(guest.id, undefined)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all transform scale-150 leading-none"
                            title="Remove guest"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {occupancy < table.capacity && (
                        <div className="border-2 border-dashed border-stone-800 rounded-2xl flex items-center justify-center text-stone-700 text-[10px] font-black uppercase tracking-widest min-h-[44px]">
                          Open Slot
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
