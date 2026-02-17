
import React from 'react';
import { WeddingTask, TaskStatus, TaskCategory } from '../types';
import { CATEGORY_COLORS, STATUS_COLORS } from '../constants';

interface TaskItemProps {
  task: WeddingTask;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<WeddingTask>) => void;
  onDelete: (id: string) => void;
}


export const TaskItem: React.FC<TaskItemProps> = ({ task, isSelected, onSelect, onUpdate, onDelete }) => {
  return (
    <tr
      onClick={onSelect}
      className={`group transition-all duration-300 cursor-pointer border-b border-stone-800/50 flex flex-col md:table-row md:hover:bg-stone-800/30 ${isSelected ? 'bg-rose-950/20' : ''}`}
    >
      {/* Mobile Header (Checkbox + Title + Category) */}
      <td className="md:py-7 md:pl-10 md:pr-4 py-4 px-6 flex items-center gap-4 md:table-cell" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
          <input
            type="checkbox"
            checked={task.status === TaskStatus.DONE}
            onChange={(e) => onUpdate(task.id, { status: e.target.checked ? TaskStatus.DONE : TaskStatus.TODO })}
            className="appearance-none w-6 h-6 rounded-full border-2 border-stone-700 checked:bg-stone-100 checked:border-stone-100 transition-all cursor-pointer focus:ring-0 focus:ring-offset-0"
          />
          {task.status === TaskStatus.DONE && (
            <svg className="absolute w-3 h-3 text-stone-900 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="md:hidden flex-1 overflow-hidden">
          <p className={`text-sm font-bold truncate ${task.status === TaskStatus.DONE ? 'text-stone-600 line-through' : 'text-stone-50'}`}>
            {task.title || 'Hito sin nombre'}
          </p>
          <span className="text-[8px] uppercase tracking-widest text-stone-500 font-black">{task.category}</span>
        </div>
        <div className="md:hidden">
          {task.icon || '✨'}
        </div>
      </td>

      {/* Desktop Icon */}
      <td className="py-7 px-6 hidden md:table-cell">
        <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 group-hover:bg-stone-800 group-hover:shadow-lg transition-all duration-500 border border-transparent group-hover:border-stone-700">
          {task.icon || '✨'}
        </div>
      </td>

      {/* Desktop Title */}
      <td className="py-7 px-6 min-w-[300px] max-w-lg hidden md:table-cell">
        <span className={`text-[15px] font-bold tracking-tight transition-all duration-500 ${task.status === TaskStatus.DONE ? 'text-stone-600 line-through' : 'text-stone-50'}`}>
          {task.title || <span className="text-stone-700 italic font-medium">Obra Maestra Sin Título</span>}
        </span>
      </td>

      {/* Desktop Category */}
      <td className="py-7 px-6 w-56 hidden md:table-cell">
        <span className={`text-[9px] uppercase tracking-[0.2em] px-4 py-2 rounded-xl border-2 font-extrabold shadow-sm transition-all duration-300 whitespace-nowrap inline-block ${CATEGORY_COLORS[task.category]}`}>
          {task.category}
        </span>
      </td>

      {/* Status (Visible on desktop + mobile detail) */}
      <td className="md:py-7 md:px-6 px-6 py-2 w-auto md:w-48 md:table-cell">
        <span className={`text-[9px] uppercase tracking-[0.2em] px-4 py-2 rounded-xl border-2 font-extrabold shadow-sm transition-all duration-300 whitespace-nowrap inline-block ${STATUS_COLORS[task.status]}`}>
          {task.status}
        </span>
      </td>

      {/* Date */}
      <td className="md:py-7 md:px-6 px-6 pb-6 pt-2 md:w-40 text-stone-400 font-bold text-[13px] tabular-nums tracking-tight whitespace-nowrap md:table-cell">
        {task.dueDate ? task.dueDate.split('-').reverse().join(' . ') : <span className="text-stone-800">Pendiente</span>}
      </td>

      {/* Actions */}
      <td className="md:py-7 md:px-10 px-6 py-4 text-right space-x-2 md:table-cell" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onDelete(task.id)}
          className="p-3 text-stone-700 hover:text-rose-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-rose-950/30 rounded-2xl"
          title="Eliminar tarea"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
};
