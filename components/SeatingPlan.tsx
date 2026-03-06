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
    <div className="space-y-12 view-transition pb-40">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col">
          <h2 className="text-2xl lg:text-4xl font-serif font-black text-white italic tracking-tight mb-2">Spatial Orchestration</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 px-1">Harmonizing souls / Architecture of connection</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 glass p-4 rounded-3xl border border-white/5 shadow-2xl w-full lg:w-auto">
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Name your space (e.g. Orion, Venice)..."
            className="flex-1 glass bg-white/5 border-white/10 rounded-2xl px-6 py-4 text-[14px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-rose-500/30 lg:w-80 transition-all placeholder:text-white/10"
            onKeyPress={(e) => e.key === 'Enter' && addTable()}
          />
          <button
            onClick={addTable}
            className="bg-white text-stone-950 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-95 transition-all hover:bg-rose-50 hover:shadow-glow"
          >
            Design Space
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        <div className="lg:col-span-1 glass p-8 lg:p-10 rounded-[3rem] border border-white/5 shadow-2xl lg:sticky lg:top-32 overflow-hidden relative group">
          <div className="absolute inset-0 bg-rose-500/[0.01] blur-[60px] group-hover:bg-rose-500/[0.03] transition-all duration-1000" />
          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-10 flex items-center justify-between relative z-10">
            Awaiting Placement
            <span className="bg-rose-500/10 text-rose-400 px-4 py-1.5 rounded-full text-[11px] font-black shadow-[0_0_20px_rgba(244,63,94,0.2)] border border-rose-500/20">{guestsWithoutTable.length}</span>
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {guestsWithoutTable.length === 0 ? (
              <div className="text-center py-24 text-white/10 italic font-serif text-lg tracking-tight">Every soul has found its place.</div>
            ) : (
              guestsWithoutTable.map(guest => (
                <div key={guest.id} className="glass bg-white/5 p-5 rounded-2xl border border-white/5 shadow-sm flex items-center justify-between group/guest hover:border-rose-500/30 hover:bg-white/[0.08] transition-all duration-500">
                  <span className="text-[14px] font-bold text-white/60 group-hover/guest:text-white tracking-tight transition-colors">{guest.name}</span>
                  <select
                    onChange={(e) => assignTable(guest.id, e.target.value)}
                    value=""
                    className="text-[9px] font-black uppercase tracking-[0.15em] bg-stone-900 border-none rounded-xl px-4 py-2 opacity-0 group-hover/guest:opacity-100 focus:opacity-100 transition-all cursor-pointer hover:bg-stone-800 text-white shadow-2xl"
                  >
                    <option value="" disabled className="bg-stone-900">Place at...</option>
                    {tables.map(t => <option key={t.id} value={t.id} className="bg-stone-900">{t.name}</option>)}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-10">
          {tables.length === 0 ? (
            <div className="col-span-full py-48 text-center glass border-dashed border-white/5 rounded-[4rem] flex flex-col items-center bg-white/[0.01] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/[0.01] blur-[150px] group-hover:bg-indigo-500/[0.03] transition-all duration-1000" />
              <span className="text-8xl mb-12 grayscale opacity-5 group-hover:opacity-10 group-hover:grayscale-0 transition-all duration-1000 animate-pulse relative z-10">🏛️</span>
              <p className="text-white/20 font-serif italic text-2xl tracking-tight relative z-10">Begin designing your spatial layout by adding spaces.</p>
            </div>
          ) : (
            tables.map(table => {
              const tableGuests = guests.filter(g => g.tableId === table.id);
              const occupancy = tableGuests.length;
              const isFull = occupancy >= table.capacity;

              return (
                <div key={table.id} className="card-premium p-10 relative group overflow-hidden border-white/5 hover:border-white/10 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-700">
                  <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 transition-all duration-1000 group-hover:scale-125 ${isFull ? 'bg-rose-500/[0.05] blur-[40px]' : 'bg-emerald-500/[0.05] blur-[40px]'}`}></div>

                  <div className="relative z-10 space-y-10">
                    <div className="flex lg:items-center justify-between border-b border-white/5 pb-6 gap-6">
                      <div className="flex flex-col">
                        <h4 className="font-serif font-black text-white text-2xl italic tracking-tight group-hover:text-rose-400 transition-colors uppercase mb-1">{table.name}</h4>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.4)] transition-all duration-500 ${isFull ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isFull ? 'text-rose-500' : 'text-white/20'}`}>
                            {occupancy} / {table.capacity} Occupancy
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTable(table.id)}
                        className="w-10 h-10 flex items-center justify-center text-white/10 hover:text-rose-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 shadow-none hover:shadow-glow"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {tableGuests.map(guest => (
                        <div key={guest.id} className="glass bg-white/5 px-4 py-3.5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl transition-all duration-500 flex items-center justify-between group/item">
                          <span className="text-[13px] font-bold text-white/50 group-hover/item:text-white truncate tracking-tight transition-colors">{guest.name}</span>
                          <button
                            onClick={() => assignTable(guest.id, undefined)}
                            className="w-6 h-6 flex items-center justify-center text-white/10 hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all transform hover:scale-150 leading-none text-xl"
                            title="Unseat Guest"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {occupancy < table.capacity && (
                        <div className="border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/10 text-[9px] font-black uppercase tracking-[0.3em] min-h-[50px] group-hover:border-white/20 group-hover:text-white/20 transition-all duration-700">
                          Available Slot
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
