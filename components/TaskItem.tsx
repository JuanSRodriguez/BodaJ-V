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
      className={`group transition-all duration-300 cursor-pointer border-b border-white/5 flex flex-col md:table-row md:hover:bg-white/[0.03] active:bg-white/[0.05] ${isSelected ? 'bg-rose-500/10' : ''}`}
    >

      {/* Selector & Title (Mobile + Desktop) */}
      <td className="md:py-6 md:pl-10 md:pr-4 py-6 px-6 flex items-center gap-5 md:table-cell" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
          <input
            type="checkbox"
            checked={task.status === TaskStatus.DONE}
            onChange={(e) => onUpdate(task.id, { status: e.target.checked ? TaskStatus.DONE : TaskStatus.TODO })}
            className="appearance-none w-7 h-7 rounded-lg border border-white/20 checked:bg-rose-500 checked:border-rose-500 transition-all duration-300 cursor-pointer focus:ring-0 shadow-inner group-hover:border-white/40"
          />
          {task.status === TaskStatus.DONE && (
            <svg className="absolute w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="md:hidden flex-1 overflow-hidden ml-2">
          <p className={`text-[15px] font-bold truncate tracking-tight transition-all duration-500 ${task.status === TaskStatus.DONE ? 'text-white/20 line-through' : 'text-white'}`}>
            {task.title || 'Untitled Milestone'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-black">{task.category}</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[8px] uppercase tracking-[0.2em] text-rose-400 font-extrabold">{task.status}</span>
          </div>
        </div>
        <div className="md:hidden glass w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-2xl">
          {task.icon || '✨'}
        </div>
      </td>


      {/* Desktop Icon */}
      <td className="py-6 px-6 hidden md:table-cell">
        <div className="w-12 h-12 glass border-white/5 rounded-2xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 group-hover:bg-white/5 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-700">
          {task.icon || '✨'}
        </div>
      </td>

      {/* Desktop Title & Strategy */}
      <td className="py-6 px-6 min-w-[320px] max-w-lg hidden md:table-cell">
        <div className="flex flex-col">
          <span className={`text-[16px] font-bold tracking-tight transition-all duration-500 mb-0.5 ${task.status === TaskStatus.DONE ? 'text-white/10 line-through' : 'text-white'}`}>
            {task.title || <span className="text-white/20 italic font-medium">Untitled Masterpiece</span>}
          </span>
          <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">
            Essential Milestone
          </span>
        </div>
      </td>

      {/* Desktop Category */}
      <td className="py-6 px-6 w-56 hidden md:table-cell">
        <span className={`text-[9px] uppercase tracking-[0.25em] px-4 py-2 rounded-lg border font-black shadow-lg transition-all duration-500 whitespace-nowrap inline-block ${CATEGORY_COLORS[task.category]}`}>
          {task.category}
        </span>
      </td>

      {/* Progress Status */}
      <td className="md:py-6 md:px-6 px-6 py-2 w-auto md:w-52 md:table-cell">
        <span className={`text-[9px] uppercase tracking-[0.25em] px-4 py-2 rounded-lg border font-black shadow-lg transition-all duration-500 whitespace-nowrap inline-block ${STATUS_COLORS[task.status]}`}>
          {task.status}
        </span>
      </td>

      {/* Deadline Timeline */}
      <td className="md:py-6 md:px-6 px-6 pb-6 pt-2 md:w-44 text-white/30 font-bold text-[13px] tabular-nums tracking-tight whitespace-nowrap md:table-cell">
        {task.dueDate ? (
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            {task.dueDate.split('-').reverse().join(' / ')}
          </div>
        ) : (
          <span className="text-white/10 uppercase text-[10px] tracking-widest px-4">TBA</span>
        )}
      </td>

      {/* Elegant Actions */}
      <td className="md:py-6 md:px-10 px-6 py-4 text-right space-x-2 md:table-cell" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onDelete(task.id)}
          className="w-12 h-12 flex items-center justify-center text-white/30 hover:text-rose-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500/10 rounded-2xl border border-white/5 md:border-transparent hover:border-rose-500/20 shadow-none hover:shadow-glow"
          title="Archive Task"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

      </td>
    </tr>
  );
};
