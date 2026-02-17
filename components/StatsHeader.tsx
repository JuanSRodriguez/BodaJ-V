
import React from 'react';
import { WeddingStats } from '../types';

interface StatsHeaderProps {
  stats: WeddingStats;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ stats }) => {
  const progressPercentage = Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-stone-900 p-6 rounded-2xl shadow-xl shadow-black/20 border border-stone-800 transition-all hover:border-stone-700">
        <p className="text-stone-500 text-sm font-medium mb-1 uppercase tracking-wider">Progreso</p>
        <div className="flex items-end gap-2">
          <h3 className="text-3xl font-serif font-bold text-stone-50">{progressPercentage}%</h3>
          <p className="text-sm text-stone-600 mb-1">completado</p>
        </div>
        <div className="w-full bg-stone-800 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-rose-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-stone-900 p-6 rounded-2xl shadow-xl shadow-black/20 border border-stone-800 transition-all hover:border-stone-700">
        <p className="text-stone-500 text-sm font-medium mb-1 uppercase tracking-wider">Inversión Total</p>
        <h3 className="text-3xl font-serif font-bold text-stone-50">${stats.totalBudget.toLocaleString()}</h3>
        <p className="text-xs text-stone-600 mt-2">Presupuestado</p>
      </div>

      <div className="bg-stone-900 p-6 rounded-2xl shadow-xl shadow-black/20 border border-stone-800 transition-all hover:border-stone-700">
        <p className="text-stone-500 text-sm font-medium mb-1 uppercase tracking-wider">Monto Ejecutado</p>
        <h3 className="text-3xl font-serif font-bold text-rose-400">${stats.spentAmount.toLocaleString()}</h3>
        <p className="text-xs text-stone-600 mt-2">
          {((stats.spentAmount / stats.totalBudget) * 100).toFixed(1)}% del total
        </p>
      </div>

      <div className="bg-stone-900 p-6 rounded-2xl shadow-xl shadow-black/20 border border-stone-800 transition-all hover:border-stone-700">
        <p className="text-stone-500 text-sm font-medium mb-1 uppercase tracking-wider">Cuenta Regresiva</p>
        <h3 className="text-3xl font-serif font-bold text-stone-50">{stats.daysRemaining}</h3>
        <p className="text-xs text-stone-600 mt-2">Días para el gran día</p>
      </div>
    </div>
  );
};
