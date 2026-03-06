import React from 'react';
import { WeddingStats } from '../types';

interface StatsHeaderProps {
  stats: WeddingStats;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ stats }) => {
  const progressPercentage = Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const remaining = (stats.totalBudgetLimit || 1) - stats.spentAmount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {/* Progress Card */}
      <div className="card-premium p-8 bg-white/5 border-white/10 group relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-rose-500/20 transition-all duration-700" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 font-bold">Progreso del Viaje</p>
        <div className="flex items-baseline gap-2 mb-6">
          <h3 className="text-4xl font-serif font-black text-white italic">{progressPercentage}%</h3>
          <span className="text-xs text-white/30 font-bold uppercase tracking-widest">Listo</span>
        </div>
        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-rose-300 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Budget Card */}
      <div className="card-premium p-8 bg-white/5 border-white/10 group relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 font-bold">Presupuesto Sugerido</p>
        <div className="flex flex-col">
          <h3 className="text-2xl font-serif font-black text-white italic mb-1 tracking-tight">
            {formatCurrency(stats.totalBudgetLimit || 0)}
          </h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Límite Establecido</p>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Control Financiero</span>
        </div>
      </div>

      {/* Spent Card */}
      <div className="card-premium p-8 bg-white/5 border-white/10 group relative overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-700 ${remaining < 0 ? 'bg-rose-500/5 opacity-100' : 'bg-transparent'}`} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 font-bold">Monto Ejecutado</p>
        <div className="flex flex-col">
          <h3 className={`text-2xl font-serif font-black italic mb-1 tracking-tight ${remaining < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
            {formatCurrency(stats.spentAmount)}
          </h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            {stats.totalBudgetLimit > 0 ? ((stats.spentAmount / stats.totalBudgetLimit) * 100).toFixed(1) : 0}% del total
          </p>
        </div>
        <div className="mt-6 w-full bg-black/40 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${remaining < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, (stats.spentAmount / (stats.totalBudgetLimit || 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Countdown Card */}
      <div className="card-premium p-8 bg-white/5 border-white/10 group relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 font-bold">Cuenta Regresiva</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-serif font-black text-white italic leading-none">{stats.daysRemaining}</h3>
          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Días</span>
        </div>
        <div className="mt-8 flex justify-end">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/60 font-black uppercase tracking-[0.2em]">El Gran Día Espera</span>
        </div>
      </div>
    </div>
  );
};
