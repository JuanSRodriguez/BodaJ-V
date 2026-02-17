
import React, { useState, useMemo } from 'react';
import { WeddingTask, TaskCategory, TaskStatus } from '../types';
import { CATEGORY_COLORS, STATUS_COLORS } from '../constants';

interface BudgetViewProps {
  tasks: WeddingTask[];
  onUpdateTask: (id: string, updates: Partial<WeddingTask>) => void;
  selectedTaskId?: string | null;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ tasks, onUpdateTask, selectedTaskId }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const globalStats = useMemo(() => {
    const totalBudget = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const totalSpent = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
    const totalPaid = tasks
      .filter(t => t.status === TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.actualCost || 0), 0);
    const pendingPayment = tasks
      .filter(t => t.status !== TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.actualCost || 0), 0);

    return { totalBudget, totalSpent, totalPaid, pendingPayment };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => filterCategory === 'all' || t.category === filterCategory)
      .filter(t => filterStatus === 'all' || t.status === filterStatus);
  }, [tasks, filterCategory, filterStatus]);

  const tableTotals = useMemo(() => {
    const budget = filteredTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const spent = filteredTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
    return { budget, spent };
  }, [filteredTasks]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h2 className="text-2xl lg:text-3xl font-serif font-black text-stone-50 italic">Libro Contable de la Boda</h2>
        <div className="flex items-center gap-4 bg-stone-900 border border-stone-800 p-2 rounded-2xl w-fit">
          <span className="text-[10px] font-black uppercase text-stone-500 px-3">Edición rápida estilo Excel activa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="bg-stone-900 border-2 border-stone-800 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl shadow-black/40">
          <p className="text-stone-500 text-[11px] font-black uppercase tracking-widest mb-2">Inversión Planificada</p>
          <h3 className="text-2xl lg:text-3xl font-serif font-black text-stone-50">${globalStats.totalBudget.toLocaleString()}</h3>
        </div>

        <div className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border-2 shadow-xl shadow-black/40 ${globalStats.totalSpent > globalStats.totalBudget ? 'bg-rose-950/30 border-rose-500/50' : 'bg-stone-50 border-stone-50 text-stone-900'}`}>
          <p className={`${globalStats.totalSpent > globalStats.totalBudget ? 'text-rose-400' : 'text-stone-500'} text-[11px] font-black uppercase tracking-widest mb-2`}>
            Flujo de Gasto Real
          </p>
          <h3 className={`text-2xl lg:text-3xl font-serif font-black ${globalStats.totalSpent > globalStats.totalBudget ? 'text-rose-50' : 'text-stone-900'}`}>
            ${globalStats.totalSpent.toLocaleString()}
          </h3>
        </div>

        <div className="bg-emerald-950/20 border-2 border-emerald-900/30 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl shadow-black/20">
          <p className="text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-2">Monto Liquidado</p>
          <h3 className="text-2xl lg:text-3xl font-serif font-black text-emerald-50">${globalStats.totalPaid.toLocaleString()}</h3>
        </div>

        <div className="bg-amber-950/20 border-2 border-amber-900/30 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl shadow-black/20">
          <p className="text-amber-400 text-[11px] font-black uppercase tracking-widest mb-2">Deudas Pendientes</p>
          <h3 className="text-2xl lg:text-3xl font-serif font-black text-amber-50">${globalStats.pendingPayment.toLocaleString()}</h3>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b-2 border-stone-900 pb-6 gap-4">
          <h4 className="font-serif font-black text-stone-50 text-xl italic">Matriz de Servicios</h4>
          <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-[10px] lg:text-[11px] font-black uppercase bg-stone-900 border-2 border-stone-800 rounded-xl px-4 py-2 focus:border-rose-500 text-stone-300 transition-all outline-none"
            >
              <option value="all">Categorías</option>
              {Object.values(TaskCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-[10px] lg:text-[11px] font-black uppercase bg-stone-900 border-2 border-stone-800 rounded-xl px-4 py-2 focus:border-rose-500 text-stone-300 transition-all outline-none"
            >
              <option value="all">Estados</option>
              {Object.values(TaskStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-stone-900 rounded-[2rem] lg:rounded-[2.5rem] border border-stone-800 overflow-x-auto shadow-2xl shadow-black/60 -mx-6 lg:mx-0">
          <table className="w-full text-left min-w-[800px] lg:min-w-0">
            <thead className="bg-stone-800/50 border-b border-stone-800">
              <tr>
                <th className="py-6 px-8 text-[11px] uppercase font-black text-stone-500 tracking-[0.2em]">Activo/Servicio</th>
                <th className="py-6 px-4 text-[11px] uppercase font-black text-stone-500 tracking-[0.2em]">Esfera</th>
                <th className="py-6 px-4 text-[11px] uppercase font-black text-stone-500 tracking-[0.2em] text-right">Estimado ($)</th>
                <th className="py-6 px-4 text-[11px] uppercase font-black text-stone-500 tracking-[0.2em] text-right">Real ($)</th>
                <th className="py-6 px-4 text-[11px] uppercase font-black text-stone-500 tracking-[0.2em] text-right">Varianza</th>
                <th className="py-6 px-8 text-[11px] uppercase font-black text-stone-500 tracking-[0.2em]">Liquidación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredTasks.map(task => {
                const diff = (task.budget || 0) - (task.actualCost || 0);
                return (
                  <tr key={task.id} className="hover:bg-stone-800/30 group transition-colors">
                    <td className="py-6 px-8">
                      <p className="text-sm font-black text-stone-50">{task.title || 'Dominio Nulo'}</p>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${CATEGORY_COLORS[task.category]}`}>
                        {task.category}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <input
                        type="number"
                        value={task.budget}
                        onChange={(e) => onUpdateTask(task.id, { budget: Number(e.target.value) })}
                        className="bg-transparent border-none text-right font-bold text-stone-400 focus:ring-2 focus:ring-stone-800 rounded-lg py-1 w-24 hover:bg-stone-800 transition-colors"
                      />
                    </td>
                    <td className="py-6 px-4 text-right">
                      <input
                        type="number"
                        value={task.actualCost}
                        onChange={(e) => onUpdateTask(task.id, { actualCost: Number(e.target.value) })}
                        className="bg-transparent border-none text-right font-black text-stone-50 focus:ring-2 focus:ring-stone-800 rounded-lg py-1 w-24 hover:bg-stone-800 transition-colors"
                      />
                    </td>
                    <td className={`py-6 px-4 text-right text-xs font-black ${diff < 0 ? 'text-rose-400' : diff > 0 ? 'text-emerald-400' : 'text-stone-700'}`}>
                      {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff.toLocaleString()}`}
                    </td>
                    <td className="py-6 px-8">
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                        className={`text-[10px] px-3 py-1.5 rounded-xl font-black transition-all border-none focus:ring-0 cursor-pointer bg-transparent ${STATUS_COLORS[task.status]}`}
                      >
                        {Object.values(TaskStatus).map(s => <option key={s} value={s} className="bg-stone-900 border-none">{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-stone-50 text-stone-900 font-black">
              <tr>
                <td colSpan={2} className="py-8 px-8 text-[11px] uppercase tracking-[0.3em]">Totales del Segmento Filtrado</td>
                <td className="py-8 px-4 text-right text-base">${tableTotals.budget.toLocaleString()}</td>
                <td className="py-8 px-4 text-right text-base">${tableTotals.spent.toLocaleString()}</td>
                <td className={`py-8 px-4 text-right text-sm ${(tableTotals.budget - tableTotals.spent) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${(tableTotals.budget - tableTotals.spent).toLocaleString()}
                </td>
                <td className="py-8 px-8"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
