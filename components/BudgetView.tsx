import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { WeddingTask, TaskCategory, TaskStatus } from '../types';
import { CATEGORY_COLORS, STATUS_COLORS } from '../constants';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, className, placeholder }) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());

  useEffect(() => {
    if (document.activeElement !== document.getElementById(`curr-input-${value}`)) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setLocalValue(rawValue);
    const numericValue = parseInt(rawValue, 10) || 0;
    onChange(numericValue);
  };

  const formatWithDots = (val: string) => {
    if (!val) return '';
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="relative flex items-center w-full">
      <span className="text-sm text-white/30 mr-2 font-bold">$</span>
      <input
        id={`curr-input-${value}`}
        type="text"
        value={formatWithDots(localValue)}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
    </div>
  );
};

interface BudgetViewProps {
  tasks: WeddingTask[];
  onUpdateTask: (id: string, updates: Partial<WeddingTask>) => void;
  selectedTaskId?: string | null;
  totalBudgetLimit: number;
  setTotalBudgetLimit: (value: number) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = React.memo(({
  tasks,
  onUpdateTask,
  selectedTaskId,
  totalBudgetLimit,
  setTotalBudgetLimit
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const globalStats = useMemo(() => {
    const totalPlanned = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const totalSpent = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
    const totalPaid = tasks
      .filter(t => t.status === TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.actualCost || 0), 0);
    const pendingPayment = tasks
      .filter(t => t.status !== TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.actualCost || 0), 0);

    const remainingBudget = totalBudgetLimit - totalSpent;
    const isOverBudget = remainingBudget < 0;

    return { totalPlanned, totalSpent, totalPaid, pendingPayment, remainingBudget, isOverBudget };
  }, [tasks, totalBudgetLimit]);

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

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }, []);

  return (
    <div className="space-y-12 view-transition pb-20 p-2 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-4">
        <div>
          <h2 className="text-3xl lg:text-5xl font-serif font-black text-white italic tracking-tight mb-3">Control Financiero</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-rose-500/50" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Auditoría Presupuestal 2026</p>
          </div>
        </div>

        <div className="glass px-8 py-5 rounded-[2rem] border-white/5 flex items-center gap-8 shadow-2xl relative group bg-white/[0.02] w-full lg:w-auto overflow-hidden">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black uppercase text-rose-400 tracking-[0.2em] mb-1">Presupuesto Sugerido</span>
            <CurrencyInput
              value={totalBudgetLimit}
              onChange={setTotalBudgetLimit}
              className="bg-transparent border-none text-white font-serif font-black text-xl lg:text-2xl italic tracking-tight outline-none w-full sm:w-64 lg:w-56 focus:text-rose-400 transition-colors"
              placeholder="0"
            />
          </div>
          <div className="absolute inset-x-12 -bottom-px h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Total Budget */}
        <div className="card-premium p-8 bg-white/[0.03] border-white/5 flex flex-col justify-between group min-h-[10rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors duration-500" />
          <div className="relative z-10">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Inversión Total</p>
            <p className="text-[11px] font-bold text-white/5 uppercase tracking-widest leading-none">Saldo del Presupuesto</p>
          </div>
          <h3 className="text-xl lg:text-2xl font-serif font-black text-white italic tracking-tighter relative z-10 whitespace-nowrap overflow-hidden text-ellipsis mt-4">
            {formatCurrency(totalBudgetLimit)}
          </h3>
        </div>

        {/* Card: Total Spent */}
        <div className="card-premium p-8 bg-white/[0.03] border-white/5 flex flex-col justify-between group min-h-[10rem] relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-colors duration-500 ${globalStats.isOverBudget && totalBudgetLimit > 0 ? 'bg-rose-500/10' : 'bg-white/5'}`} />
          <div className="relative z-10">
            <p className={`${globalStats.isOverBudget && totalBudgetLimit > 0 ? 'text-rose-400' : 'text-white/30'} text-[10px] font-black uppercase tracking-[0.2em] mb-1`}>Ejecutado</p>
            <p className="text-[11px] font-bold text-white/5 uppercase tracking-widest leading-none">Saldo de lo Gastado</p>
          </div>
          <h3 className={`text-xl lg:text-2xl font-serif font-black italic tracking-tighter relative z-10 transition-colors whitespace-nowrap overflow-hidden text-ellipsis mt-4 ${globalStats.isOverBudget && totalBudgetLimit > 0 ? 'text-rose-400' : 'text-white'}`}>
            {formatCurrency(globalStats.totalSpent)}
          </h3>
        </div>

        {/* Card: Remaining Balance */}
        <div className={`card-premium p-8 flex flex-col justify-between group min-h-[10rem] relative overflow-hidden transition-all duration-500 ${globalStats.isOverBudget && totalBudgetLimit > 0 ? 'bg-rose-500/[0.08] border-rose-500/20 shadow-[0_20px_40px_-15px_rgba(244,63,94,0.15)]' : 'bg-white/[0.03] border-white/5'}`}>
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-colors duration-500 ${globalStats.isOverBudget && totalBudgetLimit > 0 ? 'bg-rose-500/20' : 'bg-emerald-500/5'}`} />
          <div className="relative z-10">
            <p className={`${globalStats.isOverBudget && totalBudgetLimit > 0 ? 'text-rose-400' : 'text-emerald-400/50'} text-[10px] font-black uppercase tracking-[0.2em] mb-1`}>
              {globalStats.isOverBudget && totalBudgetLimit > 0 ? 'Sobregiro' : 'Disponible'}
            </p>
            <p className="text-[11px] font-bold text-white/5 uppercase tracking-widest leading-none">De lo que va Quedando</p>
          </div>
          <div className="mt-4 overflow-hidden">
            <h3 className={`text-xl lg:text-2xl font-serif font-black italic tracking-tighter relative z-10 whitespace-nowrap overflow-hidden text-ellipsis ${globalStats.isOverBudget && totalBudgetLimit > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
              {formatCurrency(Math.abs(globalStats.remainingBudget))}
            </h3>
            {globalStats.isOverBudget && totalBudgetLimit > 0 && (
              <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest animate-pulse mt-2 block truncate">¡Exceso Detectado!</span>
            )}
          </div>
        </div>

        {/* Card: Pending Payments */}
        <div className="card-premium p-8 bg-white/[0.03] border-white/5 flex flex-col justify-between group min-h-[10rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors duration-500" />
          <div className="relative z-10">
            <p className="text-amber-400/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Cuentas por Pagar</p>
            <p className="text-[11px] font-bold text-white/5 uppercase tracking-widest leading-none">Pasivos Pendientes</p>
          </div>
          <h3 className="text-xl lg:text-2xl font-serif font-black text-white italic tracking-tighter relative z-10 whitespace-nowrap overflow-hidden text-ellipsis mt-4">
            {formatCurrency(globalStats.pendingPayment)}
          </h3>
        </div>
      </div>

      <div className="space-y-10">
        {globalStats.isOverBudget && totalBudgetLimit > 0 && (
          <div className="glass p-10 rounded-[2.5rem] border-rose-500/30 bg-rose-500/5 flex items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700 overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-4xl shadow-glow flex-shrink-0">⚠️</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[12px] font-black uppercase text-rose-500 tracking-[0.4em] mb-2 truncate">Notificación de Desfase</h5>
              <p className="text-rose-400/80 text-sm font-medium leading-relaxed max-w-2xl break-words">
                Los gastos reales ejecutados han superado el presupuesto sugerido por un margen de <span className="text-rose-400 font-black underline decoration-rose-500/50 decoration-2 underline-offset-4">{formatCurrency(Math.abs(globalStats.remainingBudget))}</span>. Se recomienda revisar la matriz de servicios.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/10 pb-8 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-1.5 h-12 bg-rose-500 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.5)] flex-shrink-0" />
            <h4 className="font-serif font-black text-white text-3xl lg:text-4xl italic tracking-tight italic">Matriz de Servicios</h4>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-[10px] font-black uppercase glass border-white/10 rounded-2xl px-6 py-4 text-white hover:text-rose-400 focus:ring-1 focus:ring-rose-500/40 transition-all outline-none cursor-pointer bg-white/5 tracking-widest"
            >
              <option value="all" className="bg-stone-900 border-none">Todas las Categorías</option>
              {Object.values(TaskCategory).map(cat => (
                <option key={cat} value={cat} className="bg-stone-900 border-none">{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-[10px] font-black uppercase glass border-white/10 rounded-2xl px-6 py-4 text-white hover:text-rose-400 focus:ring-1 focus:ring-rose-500/40 transition-all outline-none cursor-pointer bg-white/5 tracking-widest"
            >
              <option value="all" className="bg-stone-900 border-none">Todos los Estados</option>
              {Object.values(TaskStatus).map(s => (
                <option key={s} value={s} className="bg-stone-900 border-none">{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-premium bg-white/[0.01] border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px] border-collapse relative">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="py-8 px-12 text-[10px] uppercase font-black text-white/20 tracking-[0.4em]">Servicio</th>
                  <th className="py-8 px-6 text-[10px] uppercase font-black text-white/20 tracking-[0.4em]">Categoría</th>
                  <th className="py-8 px-6 text-[10px] uppercase font-black text-white/20 tracking-[0.4em] text-right">Planeado</th>
                  <th className="py-8 px-6 text-[10px] uppercase font-black text-white/20 tracking-[0.4em] text-right">Real</th>
                  <th className="py-8 px-6 text-[10px] uppercase font-black text-white/20 tracking-[0.4em] text-right">Varianza</th>
                  <th className="py-8 px-12 text-[10px] uppercase font-black text-white/20 tracking-[0.4em]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTasks.map(task => {
                  const diff = (task.budget || 0) - (task.actualCost || 0);
                  return (
                    <tr key={task.id} className="hover:bg-white/[0.03] group transition-all duration-300">
                      <td className="py-8 px-12">
                        <p className="text-base font-black text-white tracking-tight group-hover:text-rose-400 transition-colors italic whitespace-nowrap overflow-hidden text-ellipsis">{task.title || 'Sin Título'}</p>
                      </td>
                      <td className="py-8 px-6">
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg border transition-all ${CATEGORY_COLORS[task.category]} border-white/5 bg-white/5`}>
                          {task.category}
                        </span>
                      </td>
                      <td className="py-8 px-6 text-right">
                        <CurrencyInput
                          value={task.budget || 0}
                          onChange={(val) => onUpdateTask(task.id, { budget: val })}
                          className="bg-transparent border-none text-right font-bold text-white/40 focus:text-white rounded-lg py-2 px-1 w-32 transition-all outline-none tabular-nums"
                        />
                      </td>
                      <td className="py-8 px-6 text-right">
                        <CurrencyInput
                          value={task.actualCost || 0}
                          onChange={(val) => onUpdateTask(task.id, { actualCost: val })}
                          className="bg-transparent border-none text-right font-black text-white/60 focus:text-rose-400 rounded-lg py-2 px-1 w-32 transition-all outline-none tabular-nums"
                        />
                      </td>
                      <td className={`py-8 px-6 text-right text-sm font-black tabular-nums transition-all ${diff < 0 ? 'text-rose-500 truncate' : diff > 0 ? 'text-emerald-400' : 'text-white/10'}`}>
                        {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff.toLocaleString()}`}
                      </td>
                      <td className="py-8 px-12">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                          className={`text-[9px] px-4 py-2.5 rounded-xl font-black transition-all border border-white/5 cursor-pointer bg-white/5 tracking-widest uppercase ${STATUS_COLORS[task.status]} hover:border-white/20 outline-none`}
                        >
                          {Object.values(TaskStatus).map(s => <option key={s} value={s} className="bg-stone-900 uppercase">{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="glass bg-white/[0.02] p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-10 border-t border-white/5 overflow-hidden">
            <div className="flex items-center gap-6 min-w-0">
              <div className="w-14 h-14 rounded-2xl glass bg-white/5 border-white/10 flex items-center justify-center text-3xl shadow-glow flex-shrink-0">📊</div>
              <div className="min-w-0">
                <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-1 truncate">Cálculo de Segmento</p>
                <h5 className="font-serif font-black text-white text-2xl italic tracking-tight truncate">Totales Filtrados</h5>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-10 lg:gap-16">
              <div className="flex flex-col">
                <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-2 font-bold">Planeado</span>
                <span className="text-xl font-serif font-black text-white italic tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{formatCurrency(tableTotals.budget)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-2 font-bold">Ejecutado</span>
                <span className="text-xl font-serif font-black text-rose-500 italic tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{formatCurrency(tableTotals.spent)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-2 font-bold">Varianza</span>
                <span className={`text-xl font-serif font-black italic tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] ${(tableTotals.budget - tableTotals.spent) < 0 ? 'text-rose-700' : 'text-emerald-400'}`}>
                  {formatCurrency(tableTotals.budget - tableTotals.spent)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
