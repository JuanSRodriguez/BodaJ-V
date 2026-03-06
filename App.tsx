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
import { StatsHeader } from './components/StatsHeader';
import { WeddingTask, TaskStatus, TaskCategory, WeddingStats, Guest, TimelineItem, Table } from './types';
import { INITIAL_TASKS } from './constants';
import { getAISuggestions } from './services/gemini';
import { AIWeddingChatbot } from './components/AIWeddingChatbot';


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
  const [totalBudgetLimit, setTotalBudgetLimit] = useState(0);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);
  const [draftTask, setDraftTask] = useState<WeddingTask | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');

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
        setTotalBudgetLimit(data.totalBudgetLimit || 0);
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
        totalBudgetLimit,
        coupleImage,
        updatedAt: Date.now()
      });
    }, 400); // Reduced debounce for snappier feel

    return () => clearTimeout(timeoutId);
  }, [tasks, guests, timeline, tables, weddingDate, weddingTheme, vows, totalBudgetLimit, coupleImage, isInitialLoad]);

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
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      totalBudgetLimit
    };
  }, [tasks, weddingDate, totalBudgetLimit]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'ALL') return tasks.filter(t => !t.isReminder);

    return tasks.filter(t => t.status === statusFilter && !t.isReminder);
  }, [tasks, statusFilter]);


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

  // Cleanup past reminders automatically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTasks(prevTasks => {
        const now = new Date();
        const validTasks = prevTasks.filter(task => {
          if (task.isReminder && task.dueDate && task.time) {
            const [hours, minutes] = task.time.split(':').map(Number);
            const [year, month, day] = task.dueDate.split('-').map(Number);
            const taskDateTime = new Date(year, month - 1, day, hours, minutes);
            if (taskDateTime < now) return false;
          }
          return true;
        });
        if (validTasks.length !== prevTasks.length) return validTasks;
        return prevTasks;
      });
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

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

  const handleChatbotAddTask = (title: string, date: string, time: string, notes: string) => {
    const newTask: WeddingTask = {
      id: generateId(),
      title,
      category: TaskCategory.OTHER,
      status: TaskStatus.TODO,
      budget: 0,
      actualCost: 0,
      dueDate: date,
      time: time,
      isReminder: true,
      notes,
      color: '#f3f4f6',
      icon: '✨',
      supplier: ''
    };
    setTasks(prev => [newTask, ...prev]);
  };

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
      {/* Juan&Vale Background Elements */}
      <div className="jv-bg">
        <div className="jv-blob w-[500px] h-[500px] bg-rose-500/10 top-[-10%] left-[-5%]" />
        <div className="jv-blob w-[400px] h-[400px] bg-indigo-500/10 bottom-[10%] right-[5%] blur-[150px]" />
      </div>

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
        <header className="h-[90px] lg:h-[110px] flex items-center justify-between px-8 lg:px-16 glass sticky top-0 z-30 border-b border-white/5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-12 h-12 flex flex-col items-center justify-center gap-1.5 text-white/50 hover:text-white transition-colors glass rounded-xl border-white/5"
            >
              <span className="w-6 h-0.5 bg-current rounded-full"></span>
              <span className="w-4 h-0.5 bg-current rounded-full self-start ml-3"></span>
              <span className="w-6 h-0.5 bg-current rounded-full"></span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                  Workspace / {viewMode}
                </h2>
              </div>
              <h1 className="text-xl lg:text-2xl font-serif font-black text-white italic tracking-tight">
                {viewMode === 'checklist' && 'Checklist Management'}
                {viewMode === 'budget' && 'Financial Control'}
                {viewMode === 'calendar' && 'Milestone Calendar'}
                {viewMode === 'guests' && 'Guest Experience'}
                {viewMode === 'timeline' && 'Event Cronogram'}
                {viewMode === 'seating' && 'Atmosphere & Seating'}
                {viewMode === 'vows' && 'Vows of Love'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={renderGlobalAddButton().props.onClick}
              className="button-modern"
            >
              <span className="text-xl leading-none">+</span>
              <span className="hidden sm:inline">{renderGlobalAddButton().props.children[2].props.children}</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[100dvh] custom-scrollbar p-5 lg:p-16 relative pb-32">
          {aiSuggestions.length > 0 && viewMode === 'checklist' && (

            <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
              {aiSuggestions.map((s, idx) => (
                <div key={idx} className="card-premium p-8 bg-gradient-to-br from-white/5 to-transparent border-white/10 flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-[50px] rounded-full -mr-20 -mt-20 group-hover:bg-rose-500/10 transition-all duration-1000" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 glass border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center text-xl mb-8 transition-transform group-hover:rotate-12">✨</div>
                    <h4 className="font-serif font-black text-white text-lg mb-4 tracking-tight group-hover:text-rose-400 transition-colors uppercase italic">{s.title}</h4>
                    <p className="text-white/40 text-[14px] leading-relaxed mb-8">{s.reason}</p>
                  </div>
                  <button
                    onClick={() => addAiTask(s)}
                    className="relative z-10 text-white/80 font-black text-[10px] uppercase tracking-widest hover:text-rose-400 text-left flex items-center gap-4 transition-all group/btn"
                  >
                    <div className="w-6 h-6 rounded-full glass border-white/10 flex items-center justify-center group-hover/btn:bg-rose-500 group-hover/btn:text-white transition-all">
                      <span className="text-xs">+</span>
                    </div>
                    Implement Strategy
                  </button>
                </div>
              ))}
              <div className="md:col-span-3 flex justify-center mt-4">
                <button
                  onClick={() => setAiSuggestions([])}
                  className="px-8 py-3 glass rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition-all hover:tracking-[0.4em]"
                >
                  Dissolve Inspirations
                </button>
              </div>
            </div>
          )}

          <div className="view-transition">
            {viewMode === 'checklist' && (
              <>
                <StatsHeader stats={stats} />

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'ALL'
                      ? 'bg-white text-stone-950 shadow-glow'
                      : 'glass text-white/40 hover:text-white border-white/5'}`}
                  >
                    Todas
                  </button>
                  {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.PENDING_PAYMENT].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                        ? 'bg-rose-500 text-white shadow-glow border-rose-500'
                        : 'glass text-white/40 hover:text-white border-white/5'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="card-premium bg-white/5 border-white/10 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 border-b border-white/5 backdrop-blur-xl hidden md:table-header-group">
                      <tr>
                        <th className="py-8 pl-10 pr-4 w-20"></th>
                        <th className="py-8 px-6 text-[10px] uppercase font-black text-white/30 tracking-[0.3em] w-24">Icon</th>
                        <th className="py-8 px-6 text-[10px] uppercase font-black text-white/30 tracking-[0.3em]">Strategy & Task</th>
                        <th className="py-8 px-6 text-[10px] uppercase font-black text-white/30 tracking-[0.3em] w-56">Category</th>
                        <th className="py-8 px-6 text-[10px] uppercase font-black text-white/30 tracking-[0.3em] w-48">Progress</th>
                        <th className="py-8 px-6 text-[10px] uppercase font-black text-white/30 tracking-[0.3em] w-40">Timeline</th>
                        <th className="py-8 px-10 text-right w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTasks.map((task) => (
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
                  {filteredTasks.length === 0 && (
                    <div className="py-48 text-center bg-black/20">
                      <span className="text-8xl block mb-12 grayscale opacity-10 animate-pulse">🥂</span>
                      <p className="text-white/60 font-serif italic text-3xl tracking-wide mb-4">
                        {statusFilter === 'ALL'
                          ? 'Tu viaje comienza con un solo plan.'
                          : `No se encontraron tareas con el estado "${statusFilter}".`}
                      </p>
                      <p className="text-rose-400 text-[10px] uppercase font-black tracking-[0.5em]">
                        {statusFilter === 'ALL' ? 'Inicia tu primer hito' : 'Intenta ajustar tus filtros de búsqueda'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {viewMode === 'calendar' && <CalendarView tasks={tasks} />}
            {viewMode === 'budget' && (
              <BudgetView
                tasks={tasks}
                onUpdateTask={updateTask}
                selectedTaskId={selectedTaskId}
                totalBudgetLimit={totalBudgetLimit}
                setTotalBudgetLimit={setTotalBudgetLimit}
              />
            )}
            {viewMode === 'guests' && <GuestManager guests={guests} setGuests={setGuests} />}
            {viewMode === 'timeline' && <TimelineView timeline={timeline} setTimeline={setTimeline} />}
            {viewMode === 'seating' && <SeatingPlan guests={guests} setGuests={setGuests} tables={tables} setTables={setTables} />}
            {viewMode === 'vows' && <VowsAssistant vows={vows} setVows={setVows} weddingTheme={weddingTheme} />}
          </div>
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
      {/* AI Assistant Chatbot */}
      <AIWeddingChatbot
        tasks={tasks}
        guests={guests}
        tables={tables}
        weddingDate={weddingDate}
        weddingTheme={weddingTheme}
        budgetLimit={totalBudgetLimit}
        onAddTask={handleChatbotAddTask}
      />



    </div>
  );
};


export default App;
