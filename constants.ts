
import { TaskCategory, TaskStatus, WeddingTask } from './types';

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  [TaskCategory.VENUE]: 'bg-rose-950/20 text-rose-300 border-rose-900/40',
  [TaskCategory.ATTIRE]: 'bg-indigo-950/20 text-indigo-300 border-indigo-900/40',
  [TaskCategory.GUESTS]: 'bg-emerald-950/20 text-emerald-300 border-emerald-900/40',
  [TaskCategory.PHOTO_VIDEO]: 'bg-amber-950/20 text-amber-300 border-amber-900/40',
  [TaskCategory.DECOR]: 'bg-fuchsia-950/20 text-fuchsia-300 border-fuchsia-900/40',
  [TaskCategory.MUSIC]: 'bg-cyan-950/20 text-cyan-300 border-cyan-900/40',
  [TaskCategory.LEGAL]: 'bg-slate-950/20 text-slate-300 border-slate-900/40',
  [TaskCategory.OTHER]: 'bg-stone-800/40 text-stone-300 border-stone-700/50',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-stone-800/40 text-stone-400 border-stone-700/50',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-950/40 text-blue-300 border-blue-900/40',
  [TaskStatus.DONE]: 'bg-emerald-950/40 text-emerald-300 border-emerald-900/40',
  [TaskStatus.PENDING_PAYMENT]: 'bg-orange-950/40 text-orange-300 border-orange-900/40',
};

export const WEDDING_ICONS = ['💍', '👗', '👔', '🎂', '🥂', '📸', '💐', '🎵', '💌', '📍', '💒', '🚗', '🎁', '🍽️', '✨', '🗓️'];

export const INITIAL_TASKS: WeddingTask[] = [
  {
    id: '1',
    title: 'Reservar el lugar principal',
    category: TaskCategory.VENUE,
    status: TaskStatus.DONE,
    budget: 5000,
    actualCost: 5500,
    dueDate: '2024-06-01',
    notes: 'Incluye catering y decoración básica.',
    color: '#fee2e2',
    icon: '💒',
    supplier: 'Hacienda Los Olivos'
  },
  {
    id: '2',
    title: 'Elegir el vestido de novia',
    category: TaskCategory.ATTIRE,
    status: TaskStatus.IN_PROGRESS,
    budget: 2000,
    actualCost: 0,
    dueDate: '2024-08-15',
    notes: 'Buscando en tiendas del centro.',
    color: '#e0e7ff',
    icon: '👗',
    supplier: 'Boutique Nupcial'
  }
];
