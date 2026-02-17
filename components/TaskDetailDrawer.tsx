
import React, { useRef, useEffect, useState } from 'react';
import { WeddingTask, TaskStatus, TaskCategory } from '../types';
import { STATUS_COLORS, CATEGORY_COLORS, WEDDING_ICONS } from '../constants';

interface TaskDetailDrawerProps {
  task: WeddingTask | null;
  isCreating?: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<WeddingTask>) => void;
  onDelete: (id: string) => void;
  onConfirmCreation?: (task: WeddingTask) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isCreating,
  onClose,
  onUpdate,
  onDelete,
  onConfirmCreation
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [localTask, setLocalTask] = useState<WeddingTask | null>(null);

  useEffect(() => {
    setLocalTask(task);
  }, [task?.id, isCreating]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [localTask?.notes]);

  useEffect(() => {
    if (localTask && (!localTask.title || localTask.title === '')) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [localTask?.id]);

  if (!localTask || !task) return null;

  const handleChange = (updates: Partial<WeddingTask>) => {
    const updated = { ...localTask, ...updates };
    setLocalTask(updated);
    if (!isCreating) {
      onUpdate(task.id, updates);
    }
  };

  const handleConfirm = () => {
    if (isCreating && onConfirmCreation) {
      if (!localTask.title.trim()) {
        alert("El nombre de la tarea es obligatorio.");
        titleInputRef.current?.focus();
        return;
      }
      onConfirmCreation(localTask);
    } else {
      onClose();
    }
  };

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const newValue = value.substring(0, selectionStart) + prefix + selectedText + suffix + value.substring(selectionEnd);
    handleChange({ notes: newValue });
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = selectionStart + prefix.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl transition-all duration-700" onClick={onClose} />

      <div className="relative w-full lg:max-w-[700px] bg-stone-900 h-full shadow-2xl shadow-black/80 flex flex-col border-l border-stone-800 animate-fade-in transition-transform duration-700 translate-x-0">
        <header className="px-6 lg:px-12 py-8 lg:py-10 border-b border-stone-800 flex items-center justify-between bg-stone-900/80 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={onClose}
              className="group p-4 text-stone-100 hover:bg-stone-800 rounded-[1.25rem] transition-all border border-transparent hover:border-stone-700"
            >
              <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-stone-500 mb-2">Especificación del Elemento</h2>
              <h3 className="font-serif font-black text-2xl text-stone-50 italic tracking-tight">
                {isCreating ? 'Arquitectar Nueva Tarea' : 'Modificar Hitos'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => { if (confirm('¿Estás seguro de que deseas eliminar permanentemente este hito?')) { onDelete(task.id); onClose(); } }}
            className="text-[11px] font-black text-stone-500 hover:text-rose-400 uppercase tracking-widest transition-all px-6 py-3 hover:bg-rose-950/30 rounded-2xl border border-transparent hover:border-rose-900/40"
          >
            Eliminar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-12 lg:space-y-16 custom-scrollbar pb-32">
          {/* Título Principal */}
          <div className="space-y-10">
            <div className="flex items-start gap-8">
              <div className="relative group">
                <select
                  value={localTask.icon || '✨'}
                  onChange={(e) => handleChange({ icon: e.target.value })}
                  className="text-5xl bg-stone-800 hover:bg-stone-950 text-stone-100 p-8 rounded-[2.5rem] border-none focus:ring-8 focus:ring-stone-800/50 cursor-pointer appearance-none transition-all outline-none shadow-premium relative z-10"
                >
                  {WEDDING_ICONS.map(i => <option key={i} value={i} className="bg-stone-900">{i}</option>)}
                </select>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-stone-700 border border-stone-600 rounded-full flex items-center justify-center text-[10px] text-stone-100 shadow-sm z-20 pointer-events-none">✎</div>
              </div>
              <div className="flex-1 pt-2">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-4 block">Título del Hito</label>
                <input
                  ref={titleInputRef}
                  value={localTask.title}
                  onChange={(e) => handleChange({ title: e.target.value })}
                  placeholder="La esencia de esta tarea..."
                  className="w-full text-4xl font-serif font-black text-stone-50 bg-transparent border-none p-0 focus:ring-0 outline-none transition-all placeholder:text-stone-800 italic tracking-tighter"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] block ml-1">Estado de Ejecución</label>
              <select
                value={localTask.status}
                onChange={(e) => handleChange({ status: e.target.value as TaskStatus })}
                className={`w-full text-[12px] font-black py-5 px-6 rounded-[1.5rem] border-2 shadow-sm cursor-pointer transition-all outline-none uppercase tracking-widest ${STATUS_COLORS[localTask.status]}`}
              >
                {Object.values(TaskStatus).map(s => <option key={s} value={s} className="bg-stone-900">{s}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] block ml-1">Capa Arquitectónica</label>
              <select
                value={localTask.category}
                onChange={(e) => handleChange({ category: e.target.value as TaskCategory })}
                className={`w-full text-[12px] font-black py-5 px-6 rounded-[1.5rem] border-2 shadow-sm cursor-pointer transition-all outline-none uppercase tracking-widest ${CATEGORY_COLORS[localTask.category]}`}
              >
                {Object.values(TaskCategory).map(c => <option key={c} value={c} className="bg-stone-900">{c}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] block ml-1">Horizonte Crítico</label>
              <input
                type="date"
                value={localTask.dueDate}
                onChange={(e) => handleChange({ dueDate: e.target.value })}
                className="w-full text-[13px] font-black bg-stone-950/40 p-5 rounded-[1.5rem] border border-stone-800 focus:bg-stone-800 focus:border-stone-600 text-stone-50 outline-none transition-all shadow-inner tabular-nums"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] block ml-1">Socio / Entidad</label>
              <input
                value={localTask.supplier || ''}
                onChange={(e) => handleChange({ supplier: e.target.value })}
                placeholder="Identificar socio o recurso..."
                className="w-full text-[13px] font-black bg-stone-950/40 p-5 rounded-[1.5rem] border border-stone-800 focus:bg-stone-800 focus:border-stone-600 text-stone-50 placeholder:text-stone-700 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-8 pt-10 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-stone-100 uppercase tracking-[0.3em]">Matices Operativos y Notas</label>
              <div className="flex items-center gap-2 glass p-1.5 rounded-2xl border border-stone-800">
                <button onClick={() => insertFormat('**', '**')} className="w-10 h-10 hover:bg-stone-50 hover:text-stone-900 rounded-xl text-sm font-black text-stone-200 transition-all flex items-center justify-center">B</button>
                <button onClick={() => insertFormat('_', '_')} className="w-10 h-10 hover:bg-stone-50 hover:text-stone-900 rounded-xl text-sm font-serif italic text-stone-200 transition-all flex items-center justify-center">I</button>
                <button onClick={() => insertFormat('• ')} className="px-4 h-10 hover:bg-stone-50 hover:text-stone-900 rounded-xl text-[10px] text-stone-200 transition-all font-black uppercase tracking-widest flex items-center justify-center">Lista</button>
              </div>
            </div>
            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={localTask.notes}
                onChange={(e) => handleChange({ notes: e.target.value })}
                placeholder="Orquesta los detalles finales aquí..."
                className="w-full min-h-[400px] text-[15px] font-medium leading-[1.8] text-stone-400 bg-stone-950/20 border border-stone-800 rounded-[3rem] p-12 focus:bg-stone-950 focus:border-stone-600 outline-none transition-all placeholder:text-stone-800 resize-none shadow-inner custom-scrollbar"
              />
              <div className="absolute right-8 bottom-8 opacity-10 text-[60px] pointer-events-none select-none grayscale">✒️</div>
            </div>
          </div>

          {isCreating && (
            <div className="pt-10">
              <button
                onClick={handleConfirm}
                className="w-full py-7 bg-stone-50 text-stone-900 rounded-[2rem] text-[14px] font-black uppercase tracking-[0.4em] shadow-xl shadow-black/40 hover:bg-white hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-6 group"
              >
                <span className="text-3xl group-hover:rotate-12 transition-transform">✨</span>
                Elemento Génesis
              </button>
            </div>
          )}
        </div>

        {!isCreating && (
          <footer className="px-12 py-10 bg-stone-950/40 border-t border-stone-800 flex items-center justify-between mt-auto backdrop-blur-md">
            <span className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-4 italic tracking-widest">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Nota: Los valores fiscales se gestionan en la matriz de presupuesto
            </span>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-stone-800 border border-stone-700 text-[11px] font-black text-stone-100 uppercase tracking-widest hover:bg-stone-50 hover:text-stone-900 hover:border-stone-50 rounded-xl transition-all shadow-sm"
            >
              Sellar Especificaciones
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
