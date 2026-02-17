import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './services/firebase';
import { TaskItem } from './components/TaskItem';
import { Sidebar } from './components/Sidebar';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { BudgetView } from './components/BudgetView';
import { CalendarView } from './components/CalendarView';
import { GuestManager } from './components/GuestManager';
import { TimelineView } from './components/TimelineView';
import { SeatingPlan } from './components/SeatingPlan';
import { VowsAssistant } from './components/VowsAssistant';
import { WeddingTask, TaskStatus, TaskCategory, WeddingStats, Guest, TimelineItem, Table } from './types';
import { INITIAL_TASKS } from './constants';
import { getAISuggestions } from './services/gemini';

import { saveWeddingData, subscribeToWeddingData } from './services/weddingService';

export type ViewMode = 'checklist' | 'budget' | 'calendar' | 'guests' | 'timeline' | 'seating' | 'vows';

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('checklist');
  const [coupleImage, setCoupleImage] = useState<string | null>(null);

  const [tasks, setTasks] = useState<WeddingTask[]>(INITIAL_TASKS);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [weddingDate, setWeddingDate] = useState('2025-06-21');
  const [weddingTheme, setWeddingTheme] = useState('Jardín Romántico Moderno');
  const [vows, setVows] = useState('');

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);
  const [draftTask, setDraftTask] = useState<WeddingTask | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const skipNextSnapshot = useRef(false);

  // Initial Load from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToWeddingData((data) => {
      // Skip snapshots triggered by our own saves
      if (skipNextSnapshot.current) {
        skipNextSnapshot.current = false;
        return;
      }
      if (data) {
        console.log("Loading data from Firestore:", data);
        setTasks(data.tasks || INITIAL_TASKS);
        setGuests(data.guests || []);
        setTimeline(data.timeline || []);
        setTables(data.tables || []);
        setWeddingDate(data.weddingDate || '2025-06-21');
        setWeddingTheme(data.weddingTheme || 'Jardín Romántico Moderno');
        setVows(data.vows || '');
        setCoupleImage(data.coupleImage || null);
      } else {
        console.log("No data found in Firestore, using current state (initial).");
      }
      setIsInitialLoad(false);
    });

    return () => unsubscribe();
  }, []);

  // Save to Firestore on changes
  useEffect(() => {
    if (isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      console.log("Saving wedding data to Firestore...", { tasksCount: tasks.length });
      skipNextSnapshot.current = true;
      saveWeddingData({
        weddingDate,
        weddingTheme,
        tasks,
        guests,
        timeline,
        tables,
        vows,
        coupleImage,
        updatedAt: Date.now()
      });
    }, 1000); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [tasks, guests, timeline, tables, weddingDate, weddingTheme, vows, coupleImage, isInitialLoad]);

  const stats = useMemo<WeddingStats>(() => {
    const today = new Date();
    const target = new Date(weddingDate);
    const diffTime = target.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === TaskStatus.DONE).length,
      totalBudget: tasks.reduce((sum, t) => sum + (t.budget || 0), 0),
      spentAmount: tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0),
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0
    };
  }, [tasks, weddingDate]);

  const selectedTask = useMemo(() => {
    if (isCreatingNewTask) return draftTask;
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId, isCreatingNewTask, draftTask]);

  const handleAddTask = useCallback(() => {
    const newTask: WeddingTask = {
      id: generateId(),
      title: '',
      category: TaskCategory.OTHER,
      status: TaskStatus.TODO,
      budget: 0,
      actualCost: 0,
      dueDate: '',
      notes: '',
      color: '#f3f4f6',
      icon: '✨',
      supplier: ''
    };
    setDraftTask(newTask);
    setIsCreatingNewTask(true);
    setSelectedTaskId(null);
    if (viewMode !== 'budget' && viewMode !== 'calendar') {
      setViewMode('checklist');
    }
  }, [viewMode]);

  const handleConfirmTaskCreation = (newTask: WeddingTask) => {
    setTasks(prev => [newTask, ...prev]);
    setIsCreatingNewTask(false);
    setDraftTask(null);
    setSelectedTaskId(null);
  };

  const updateTask = useCallback((id: string, updates: Partial<WeddingTask>) => {
    if (isCreatingNewTask && draftTask?.id === id) {
      setDraftTask(prev => prev ? { ...prev, ...updates } : null);
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  }, [isCreatingNewTask, draftTask]);

  const deleteTask = useCallback((id: string) => {
    if (isCreatingNewTask && draftTask?.id === id) {
      setIsCreatingNewTask(false);
      setDraftTask(null);
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTaskId(null);
    }
  }, [isCreatingNewTask, draftTask]);

  const handleAiAsk = async () => {
    setIsAiLoading(true);
    try {
      const suggestions = await getAISuggestions(tasks, weddingTheme);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const addAiTask = (suggestion: any) => {
    const newTask: WeddingTask = {
      id: generateId(),
      title: suggestion.title,
      category: suggestion.category as TaskCategory || TaskCategory.OTHER,
      status: TaskStatus.TODO,
      budget: 0,
      actualCost: 0,
      dueDate: '',
      notes: suggestion.reason,
      color: '#f3f4f6',
      icon: '✨',
      supplier: ''
    };
    setDraftTask(newTask);
    setIsCreatingNewTask(true);
    setAiSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  };

  const handleAddGuest = useCallback(() => {
    const newGuest: Guest = {
      id: generateId(),
      name: '',
      group: 'Otros',
      side: 'Ambos',
      confirmed: false,
      dietaryNotes: ''
    };
    setGuests(prev => [newGuest, ...prev]);
    setViewMode('guests');
  }, []);

  const handleAddTimelineItem = useCallback(() => {
    const newItem: TimelineItem = {
      id: generateId(),
      time: '12:00',
      activity: '',
      location: '',
      notes: ''
    };
    setTimeline(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    setViewMode('timeline');
  }, []);

  const handleAddTable = useCallback(() => {
    const newTable: Table = {
      id: generateId(),
      name: `Mesa ${tables.length + 1}`,
      capacity: 10
    };
    setTables(prev => [...prev, newTable]);
    setViewMode('seating');
  }, [tables.length]);

  const renderGlobalAddButton = () => {
    let label = "Nueva Tarea";
    let action = handleAddTask;

    if (viewMode === 'guests') {
      label = "Nuevo Invitado";
      action = handleAddGuest;
    } else if (viewMode === 'timeline') {
      label = "Nuevo Hito";
      action = handleAddTimelineItem;
    } else if (viewMode === 'seating') {
      label = "Nueva Mesa";
      action = handleAddTable;
    }

    return (
      <button
        onClick={action}
        className="bg-stone-50 text-stone-900 px-4 lg:px-6 py-3 rounded-2xl text-[11px] lg:text-[13px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-black/20 active:scale-[0.97] flex items-center gap-2 lg:gap-3 whitespace-nowrap"
      >
        <span className="text-xl leading-none">+</span> <span className="hidden sm:inline">{label}</span><span className="sm:hidden">Nuevo</span>
      </button>
    );
  };

  return (
    <div className={`app-container ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <Sidebar
        stats={stats}
        viewMode={viewMode}
        setViewMode={(mode) => {
          setViewMode(mode);
          setIsMobileMenuOpen(false);
        }}
        weddingDate={weddingDate}
        setWeddingDate={setWeddingDate}
        weddingTheme={weddingTheme}
        setWeddingTheme={setWeddingTheme}
        coupleImage={coupleImage}
        setCoupleImage={setCoupleImage}
        isOpen={isMobileMenuOpen}
      />

      <main className="main-content">
        <header className="h-[80px] lg:h-[100px] flex items-center justify-between px-6 lg:px-12 glass sticky top-0 z-30 border-b border-stone-800/50">
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-stone-300 hover:text-white transition-colors"
            >
              <span className="w-6 h-0.5 bg-current rounded-full"></span>
              <span className="w-6 h-0.5 bg-current rounded-full"></span>
              <span className="w-6 h-0.5 bg-current rounded-full"></span>
            </button>
            <div className="hidden lg:block w-1.5 h-10 bg-stone-50 rounded-full shadow-lg shadow-black/20"></div>
            <div>
              <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-stone-500 mb-0.5 lg:mb-1">
                Espacio de Trabajo / {viewMode}
              </h2>
              <h1 className="text-lg lg:text-xl font-serif font-black text-stone-50 italic tracking-tight">
                {viewMode === 'checklist' && 'Gestión de Tareas'}
                {viewMode === 'budget' && 'Control Presupuestario'}
                {viewMode === 'calendar' && 'Calendario de Hitos'}
                {viewMode === 'guests' && 'Lista de Invitados'}
                {viewMode === 'timeline' && 'Cronograma del Evento'}
                {viewMode === 'seating' && 'Plano de Mesas'}
                {viewMode === 'vows' && 'Votos Matrimoniales'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {viewMode === 'checklist' && (
              <button
                onClick={handleAiAsk}
                disabled={isAiLoading}
                className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 rounded-2xl text-[11px] lg:text-[12px] font-black uppercase tracking-wider transition-all duration-300 border shadow-sm ${isAiLoading
                  ? 'bg-stone-900/50 text-stone-700 border-stone-800 cursor-not-allowed'
                  : 'bg-rose-950/30 text-rose-400 border-rose-900/50 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                  }`}
              >
                <span className="lg:inline">{isAiLoading ? 'Analizando...' : '✨ Sugerencias IA'}</span>
              </button>
            )}
            {renderGlobalAddButton()}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 bg-stone-900/20">
          {aiSuggestions.length > 0 && viewMode === 'checklist' && (
            <div className="mb-12 lg:mb-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 animate-fade-in">
              {aiSuggestions.map((s, idx) => (
                <div key={idx} className="card-premium p-6 lg:p-10 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-stone-800 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-rose-950 text-rose-400 rounded-xl flex items-center justify-center text-xl mb-6 shadow-inner ring-1 ring-rose-900/50">✨</div>
                    <h4 className="font-extrabold text-stone-50 text-base mb-4 tracking-tight group-hover:text-rose-400 transition-colors uppercase italic">{s.title}</h4>
                    <p className="text-stone-400 text-[14px] leading-relaxed mb-8">{s.reason}</p>
                  </div>
                  <button
                    onClick={() => addAiTask(s)}
                    className="relative z-10 text-stone-100 font-black text-[11px] uppercase tracking-widest hover:text-rose-400 text-left flex items-center gap-3 transition-all"
                  >
                    <span className="w-5 h-5 bg-stone-800 text-white rounded-full flex items-center justify-center text-[10px] group-hover:bg-rose-600 transition-colors">+</span>
                    Añadir a mi lista
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setAiSuggestions([])}
                  className="text-stone-600 hover:text-stone-300 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:tracking-[0.4em]"
                >
                  Descartar inspiraciones
                </button>
              </div>
            </div>
          )}

          {viewMode === 'checklist' && (
            <div className="animate-fade-in mb-20">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-800/50 sticky top-0 z-20 border-b border-stone-800 backdrop-blur-md hidden md:table-header-group">
                  <tr>
                    <th className="py-8 pl-10 pr-4 w-20"></th>
                    <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.25em] w-24">Icono</th>
                    <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.25em]">Descripción de la Tarea</th>
                    <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.25em] w-56">Categoría</th>
                    <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.25em] w-48">Estado</th>
                    <th className="py-8 px-6 text-[10px] uppercase font-black text-stone-500 tracking-[0.25em] w-40">Fecha Límite</th>
                    <th className="py-8 px-10 text-right w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isSelected={selectedTaskId === task.id}
                      onSelect={() => {
                        setSelectedTaskId(task.id);
                        setIsCreatingNewTask(false);
                      }}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </tbody>
              </table>
              {tasks.length === 0 && (
                <div className="py-40 text-center bg-stone-950/20">
                  <span className="text-8xl block mb-10 grayscale opacity-10 animate-pulse">🥂</span>
                  <p className="text-stone-500 font-serif italic text-2xl tracking-wide">Tu viaje comienza con un solo plan.</p>
                  <p className="text-stone-700 text-[11px] uppercase font-black mt-4 tracking-[0.3em]">Empieza por añadir tu primera tarea</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'calendar' && <CalendarView tasks={tasks} />}
          {viewMode === 'budget' && <BudgetView tasks={tasks} onUpdateTask={updateTask} selectedTaskId={selectedTaskId} />}
          {viewMode === 'guests' && <GuestManager guests={guests} setGuests={setGuests} />}
          {viewMode === 'timeline' && <TimelineView timeline={timeline} setTimeline={setTimeline} />}
          {viewMode === 'seating' && <SeatingPlan guests={guests} setGuests={setGuests} tables={tables} setTables={setTables} />}
          {viewMode === 'vows' && <VowsAssistant vows={vows} setVows={setVows} weddingTheme={weddingTheme} />}
        </div>
      </main>

      <TaskDetailDrawer
        task={selectedTask}
        isCreating={isCreatingNewTask}
        onClose={() => {
          setSelectedTaskId(null);
          setIsCreatingNewTask(false);
          setDraftTask(null);
        }}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onConfirmCreation={handleConfirmTaskCreation}
      />
    </div>
  );
};

export default App;
