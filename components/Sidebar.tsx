import React, { useRef, useState } from 'react';
import { WeddingStats } from '../types';
import { ViewMode } from '../App';
import { uploadFile } from '../services/storageService';

interface SidebarProps {
  stats: WeddingStats;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  weddingDate: string;
  setWeddingDate: (date: string) => void;
  weddingTheme: string;
  setWeddingTheme: (theme: string) => void;
  coupleImage: string | null;
  setCoupleImage: (image: string | null) => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  stats,
  viewMode,
  setViewMode,
  weddingDate,
  setWeddingDate,
  weddingTheme,
  setWeddingTheme,
  coupleImage,
  setCoupleImage,
  isOpen
}) => {
  const progress = Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadFile(file, `profile/couple_${Date.now()}`);
        setCoupleImage(url);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const NavItem = ({ mode, label, icon }: { mode: ViewMode, label: string, icon: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[14px] font-semibold transition-all duration-300 ${viewMode === mode
        ? 'bg-stone-900 text-white shadow-xl shadow-black/40 translate-x-1 border border-stone-800'
        : 'text-stone-500 hover:bg-stone-800/50 hover:text-stone-300'
        }`}
    >
      <span className="text-xl opacity-80">{icon}</span>
      {label}
    </button>
  );

  return (
    <aside className={`w-[85vw] max-w-[320px] flex flex-col p-8 border-r border-stone-800 sidebar-glass fixed lg:relative inset-y-0 left-0 z-50 transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Decorative Blur Background Element */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => !isUploading && fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-12 h-12 rounded-2xl shadow-premium flex items-center justify-center border border-stone-800 overflow-hidden transition-all group relative flex-shrink-0 ${isUploading ? 'cursor-not-allowed' : 'hover:border-rose-500/50 hover:shadow-rose-900/20'}`}
            title="Subir foto de pareja"
          >
            {isUploading ? (
              <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-stone-600 border-t-rose-500 rounded-full animate-spin"></div>
              </div>
            ) : coupleImage ? (
              <img src={coupleImage} alt="Foto de pareja" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-stone-600 group-hover:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </button>
          <div>
            <h1 className="font-serif text-2xl font-black text-stone-50 tracking-tight leading-tight">Juan&Vale</h1>
            <p className="text-[10px] text-rose-400 font-extrabold uppercase tracking-[0.3em] -mt-1">Atelier Nupcial</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        <nav className="space-y-1.5 pt-2">
          <p className="text-[11px] font-extrabold text-stone-500 uppercase tracking-[0.2em] mb-4 px-6">Gestión</p>
          <NavItem mode="checklist" label="Lista de Tareas" icon="📝" />
          <NavItem mode="calendar" label="Calendario" icon="📅" />
          <NavItem mode="budget" label="Presupuesto" icon="💰" />
          <NavItem mode="guests" label="Invitados" icon="👥" />

          <div className="pt-8 space-y-1.5">
            <p className="text-[11px] font-extrabold text-stone-500 uppercase tracking-[0.2em] mb-4 px-6">Planificación</p>
            <NavItem mode="timeline" label="Cronograma" icon="⏳" />
            <NavItem mode="seating" label="Plano de Mesas" icon="🪑" />
            <NavItem mode="vows" label="Votos" icon="📜" />
          </div>
        </nav>

        {/* Improved Progress Section */}
        <section className="bg-stone-900/50 p-7 rounded-[2rem] border border-stone-800 shadow-premium space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Estado del Viaje</h3>
            <span className="text-lg font-serif font-black text-rose-400 italic">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-300 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tight text-center">
            {stats.completedTasks} de {stats.totalTasks} hitos alcanzados
          </p>
        </section>

        {/* Refined Quick Parameters */}
        <section className="space-y-6 pb-8">
          <p className="text-[11px] font-extrabold text-stone-500 uppercase tracking-[0.2em] px-6">Esenciales</p>
          <div className="px-2 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-stone-400 uppercase px-4">Fecha de la Boda</label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl px-5 py-3 text-[13px] font-bold text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-900/50 focus:border-rose-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-stone-400 uppercase px-4">Tema y Estética</label>
              <textarea
                value={weddingTheme}
                onChange={(e) => setWeddingTheme(e.target.value)}
                placeholder="Ej: Jardín Romántico Moderno"
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl px-5 py-4 text-[13px] font-medium text-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-900/50 focus:border-rose-500 min-h-[100px] resize-none transition-all shadow-sm leading-relaxed"
              />
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-auto pt-6 border-t border-stone-800 relative z-10">
        <div className="flex items-center justify-between bg-stone-900 border border-stone-800 p-6 rounded-[1.5rem] shadow-xl shadow-black/50">
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-black text-stone-50 italic">{stats.daysRemaining}</span>
            <span className="text-[9px] font-extrabold text-stone-500 uppercase tracking-[0.2em]">Días restantes</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse"></div>
        </div>
      </footer>
    </aside>
  );
};
