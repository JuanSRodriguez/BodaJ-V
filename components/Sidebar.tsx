import React, { useRef, useState } from 'react';
import { WeddingStats } from '../types';
import { ViewMode } from '../App';
import { uploadFile } from '../services/storageService';
import { auth } from '../services/firebase';


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
      if (!auth.currentUser) {
        alert("Debes iniciar sesión con Google para subir imágenes por razones de seguridad.");
        return;
      }
      setIsUploading(true);
      try {
        const url = await uploadFile(file, `profile/couple_${Date.now()}`);
        setCoupleImage(url);
      } catch (error: any) {
        console.error("Upload failed details:", error);
        alert(`Error al subir la imagen: ${error.message || 'Error desconocido'}`);
      } finally {
        setIsUploading(false);
      }
    }

  };

  const NavItem = ({ mode, label, icon }: { mode: ViewMode, label: string, icon: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 relative group ${viewMode === mode
        ? 'text-white'
        : 'text-stone-500 hover:text-stone-300'
        }`}
    >
      {viewMode === mode && (
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-transparent border-l-2 border-rose-500 rounded-r-xl z-0" />
      )}
      <span className={`text-xl z-10 transition-transform group-hover:scale-110 ${viewMode === mode ? 'opacity-100' : 'opacity-50'}`}>{icon}</span>
      <span className="z-10">{label}</span>
      {viewMode === mode && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] z-10" />
      )}
    </button>
  );

  return (
    <aside className={`w-[280px] lg:w-[320px] flex flex-col glass-raised border-r border-white/5 fixed lg:relative inset-y-0 left-0 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="p-8 relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="relative group">
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
              className={`w-14 h-14 rounded-2xl overflow-hidden glass border border-white/10 transition-all group relative flex-shrink-0 flex items-center justify-center ${isUploading ? 'cursor-not-allowed' : 'hover:border-rose-500/50 hover:scale-105'}`}
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-rose-500 rounded-full animate-spin" />
              ) : coupleImage ? (
                <img src={coupleImage} alt="Couple" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              ) : (
                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">✨</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-black uppercase text-white tracking-widest">Edit</span>
              </div>
            </button>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-black text-white tracking-tight leading-none mb-1">Juan&Vale</h1>
            <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.4em]">Wedding Atelier</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 mb-12">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 px-2">Gestión</p>
          <NavItem mode="checklist" label="Checklist" icon="📝" />
          <NavItem mode="calendar" label="Calendario" icon="📅" />
          <NavItem mode="budget" label="Presupuesto" icon="💰" />
          <NavItem mode="guests" label="Invitados" icon="👥" />

          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-8 mb-4 px-2">Planificación</p>
          <NavItem mode="timeline" label="Cronograma" icon="⏳" />
          <NavItem mode="seating" label="Distribución" icon="🪑" />
          <NavItem mode="vows" label="Votos" icon="📜" />
        </nav>

        {/* Status Card */}
        <div className="card-premium p-6 bg-white/5 border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Progreso</span>
            <span className="text-sm font-serif font-black text-rose-400 italic">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-300 transition-all duration-1000 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest text-center">
            {stats.completedTasks} / {stats.totalTasks} Tareas
          </p>
        </div>
      </div>

      <div className="mt-auto p-8 relative z-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">Fecha de la Boda</label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">Tema Estético</label>
            <textarea
              value={weddingTheme}
              onChange={(e) => setWeddingTheme(e.target.value)}
              placeholder="Jardín Romántico Moderno..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] font-medium text-stone-300 focus:outline-none focus:ring-1 focus:ring-rose-500/50 min-h-[80px] resize-none transition-all leading-relaxed"
            />
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between p-5 glass rounded-2xl border-white/5 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-black text-white italic leading-none mb-1">{stats.daysRemaining}</span>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Días Restantes</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
};
