
import React, { useState, useEffect, useRef } from 'react';
import { Guest } from '../types';

interface GuestManagerProps {
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
}

export const GuestManager: React.FC<GuestManagerProps> = ({ guests, setGuests }) => {
  const [newGuestName, setNewGuestName] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const emptyGuest = guests.find(g => !g.name);
    if (emptyGuest) {
      const input = document.getElementById(`guest-name-${emptyGuest.id}`) as HTMLInputElement;
      input?.focus();
    }
  }, [guests.length]);

  const handleAddFromInput = () => {
    if (!newGuestName) return;
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name: newGuestName,
      group: 'Otros',
      side: 'Ambos',
      confirmed: false,
      dietaryNotes: ''
    };
    setGuests([newGuest, ...guests]);
    setNewGuestName('');
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  const confirmedCount = guests.filter(g => g.confirmed).length;

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif font-black text-stone-50 italic tracking-tight">Registro de Invitados</h2>
          <p className="text-stone-500 text-sm mt-2 font-medium">Organizando tu círculo de amor y celebración.</p>
        </div>
        <div className="bg-stone-50 text-stone-900 px-8 py-4 rounded-[1.5rem] shadow-xl shadow-black/40 flex items-center gap-6 border border-stone-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1">Total Invitados</span>
            <span className="text-2xl font-serif font-black italic">{guests.length}</span>
          </div>
          <div className="w-px h-8 bg-stone-200"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 mb-1">Confirmados</span>
            <span className="text-2xl font-serif font-black italic">{confirmedCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="card-premium p-10 bg-emerald-950/20 border-emerald-900/30 flex items-center justify-between group shadow-black/40">
          <div>
            <p className="text-emerald-400 text-[10px] font-extrabold uppercase tracking-[.2em] mb-2">Respuestas Pendientes</p>
            <h3 className="text-4xl font-serif font-black text-stone-50 tracking-tighter tabular-nums">{guests.length - confirmedCount}</h3>
          </div>
          <div className="text-4xl opacity-20 group-hover:scale-110 transition-transform">💌</div>
        </div>
        <div className="card-premium p-10 bg-rose-950/20 border-rose-900/30 flex items-center justify-between group shadow-black/40">
          <div>
            <p className="text-rose-400 text-[10px] font-extrabold uppercase tracking-[.2em] mb-2">Asientos Asignados</p>
            <h3 className="text-4xl font-serif font-black text-stone-50 tracking-tighter tabular-nums">{guests.filter(g => g.tableId).length}</h3>
          </div>
          <div className="text-4xl opacity-20 group-hover:scale-110 transition-transform">🪑</div>
        </div>
      </div>

      <div className="bg-stone-900 rounded-[2.5rem] border border-stone-800 shadow-premium overflow-hidden">
        <div className="p-8 border-b border-stone-800 bg-stone-950/30 flex gap-6 items-center">
          <div className="flex-1 relative">
            <input
              ref={firstInputRef}
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFromInput()}
              placeholder="Ingresa nombre para invitar..."
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-6 py-4 text-[15px] font-bold text-stone-100 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/50 transition-all shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-stone-500 uppercase tracking-widest flex items-center gap-2 pointer-events-none">
              <span>Presiona Enter</span>
              <kbd className="bg-stone-900 px-2 py-1 rounded-md border border-stone-800 text-stone-400 font-mono">↵</kbd>
            </div>
          </div>
          <button
            onClick={handleAddFromInput}
            className="button-premium bg-stone-50 text-stone-900 px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-black/40 active:scale-95"
          >
            Añadir Invitado
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-stone-800/50 border-b border-stone-800">
            <tr>
              <th className="py-8 px-10 text-[10px] uppercase font-black text-stone-500 tracking-[0.2em] w-16">RSVP</th>
              <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.2em]">Identidad del Invitado</th>
              <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.2em]">Círculo</th>
              <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.2em]">Procedencia</th>
              <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.2em]">Notas y Dieta</th>
              <th className="py-8 px-10 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-32 text-center">
                  <span className="text-6xl block mb-8 opacity-10 grayscale">🕯️</span>
                  <p className="text-stone-600 font-serif italic text-xl">The registry is awaiting its first entry.</p>
                </td>
              </tr>
            ) : (
              guests.map(guest => (
                <tr key={guest.id} className="hover:bg-stone-800/30 group transition-all duration-300">
                  <td className="py-7 px-10">
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <input
                        type="checkbox"
                        checked={guest.confirmed}
                        onChange={(e) => updateGuest(guest.id, { confirmed: e.target.checked })}
                        className="appearance-none w-6 h-6 rounded-lg border-2 border-stone-700 checked:bg-rose-500 checked:border-rose-500 transition-all cursor-pointer focus:ring-0"
                      />
                      {guest.confirmed && (
                        <svg className="absolute w-3 h-3 text-stone-900 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                  </td>
                  <td className="py-7 px-6">
                    <input
                      id={`guest-name-${guest.id}`}
                      value={guest.name}
                      onChange={(e) => updateGuest(guest.id, { name: e.target.value })}
                      placeholder="Identidad del invitado"
                      className="bg-transparent border-none p-0 text-[15px] font-bold text-stone-50 focus:ring-0 w-full placeholder:text-stone-700 tracking-tight"
                    />
                  </td>
                  <td className="py-7 px-6">
                    <select
                      value={guest.group}
                      onChange={(e) => updateGuest(guest.id, { group: e.target.value as any })}
                      className="bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 focus:ring-4 focus:ring-stone-800/50 outline-none transition-all cursor-pointer"
                    >
                      <option>Familia</option>
                      <option>Amigos</option>
                      <option>Trabajo</option>
                      <option>Otros</option>
                    </select>
                  </td>
                  <td className="py-7 px-6">
                    <select
                      value={guest.side}
                      onChange={(e) => updateGuest(guest.id, { side: e.target.value as any })}
                      className="bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 focus:ring-4 focus:ring-stone-800/50 outline-none transition-all cursor-pointer"
                    >
                      <option>Novia</option>
                      <option>Novio</option>
                      <option>Ambos</option>
                    </select>
                  </td>
                  <td className="py-7 px-6">
                    <input
                      value={guest.dietaryNotes}
                      onChange={(e) => updateGuest(guest.id, { dietaryNotes: e.target.value })}
                      placeholder="Requisitos especiales o alergias..."
                      className="bg-transparent border-none p-0 text-[12px] text-stone-500 italic font-medium focus:ring-0 w-full tracking-tight"
                    />
                  </td>
                  <td className="py-7 px-10 text-right">
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="p-3 text-stone-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-950/30 rounded-2xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
