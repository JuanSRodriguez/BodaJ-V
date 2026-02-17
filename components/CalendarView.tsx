import React, { useState, useMemo } from 'react';
import { WeddingTask, TaskStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { signInWithGoogle, syncTasksToGoogleCalendar } from '../services/googleCalendarService';

interface CalendarViewProps {
  tasks: WeddingTask[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [currentDate]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, WeddingTask[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateStr = task.dueDate;
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(task);
      }
    });
    return map;
  }, [tasks]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const token = await signInWithGoogle();
      if (token) {
        const results = await syncTasksToGoogleCalendar(tasks, token);
        alert(`Sincronización completada: ${results.success} de ${results.total} tareas añadidas a tu Google Calendar.`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Error al sincronizar con Google Calendar. Por favor, asegúrate de haber dado los permisos necesarios.");
    } finally {
      setIsSyncing(false);
    }
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 lg:mb-12 gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full lg:w-auto gap-6 sm:gap-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif font-black text-stone-50 italic tracking-tight uppercase">Calendario de Hitos</h2>
            <p className="text-stone-400 text-sm mt-2 font-medium">Tus hitos arquitectónicos mapeados a través del tiempo.</p>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/40 border ${isSyncing
              ? 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed'
              : 'bg-stone-50 text-stone-950 hover:bg-white active:scale-[0.98] border-stone-200'
              }`}
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-600 border-t-stone-200 rounded-full animate-spin"></div>
                Sincronizando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.73 17.1,6.73L19.05,4.72C19.05,4.72 16.13,2 12.1,2C6.5,2 2,6.5 2,12C2,17.5 6.5,22 12.1,22C17.3,22 21.5,18.3 21.5,12C21.5,11.7 21.5,11.4 21.35,11.1V11.1Z" />
                </svg>
                Google Calendar
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 lg:gap-6 glass border border-stone-800/50 p-2 rounded-2xl shadow-xl shadow-black/40 w-fit">
          <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-stone-800 hover:shadow-sm rounded-xl transition-all text-stone-500 hover:text-stone-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-serif font-black text-stone-50 text-base lg:text-lg italic min-w-[160px] lg:min-w-[180px] text-center tracking-tighter">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="p-3 hover:bg-stone-800 hover:shadow-sm rounded-xl transition-all text-stone-500 hover:text-stone-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="card-premium overflow-x-auto overflow-y-hidden border-none -mx-6 lg:mx-0 shadow-2xl">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-7 bg-stone-900/50 border-b border-stone-800 backdrop-blur-md">
            {dayNames.map(day => (
              <div key={day} className="py-4 lg:py-6 text-center text-[9px] lg:text-[10px] uppercase font-black text-stone-500 tracking-[0.2em] lg:tracking-[0.3em]">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 min-h-[500px] lg:min-h-[700px] bg-stone-950/20">
            {monthData.map((day, idx) => {
              const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
              const dayTasks = dateStr ? tasksByDay[dateStr] : [];
              const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

              return (
                <div
                  key={idx}
                  className={`border-r border-b border-stone-800/50 p-2 lg:p-4 min-h-[80px] lg:min-h-[140px] transition-all duration-300 ${day ? 'hover:bg-stone-900/30' : 'bg-stone-950/10'} ${isToday ? 'bg-rose-950/20 relative' : ''}`}
                >
                  {day && (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[13px] font-black tabular-nums transition-colors ${isToday ? 'bg-stone-50 text-stone-950 w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-black/40 scale-110' : 'text-stone-500'}`}>
                          {day}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {dayTasks?.map(task => (
                          <div
                            key={task.id}
                            className={`group relative px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold truncate border shadow-sm transition-all hover:scale-105 hover:z-50 cursor-default uppercase tracking-widest ${STATUS_COLORS[task.status]}`}
                          >
                            <span className="mr-1.5 opacity-80">{task.icon}</span>
                            {task.title}

                            <div className="opacity-0 group-hover:opacity-100 absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 w-56 glass p-5 rounded-2xl z-[100] shadow-2xl transition-all duration-300 pointer-events-none border border-stone-800">
                              <h5 className="font-serif font-black text-stone-50 text-sm italic mb-2 tracking-tight border-b border-stone-800 pb-2">{task.title}</h5>
                              <p className="text-stone-400 text-[10px] lowercase font-medium leading-relaxed mb-3">{task.notes || 'Sin descripción detallada'}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase text-rose-400 tracking-widest">{task.category}</span>
                                <span className="text-stone-50 font-extrabold text-[11px] tabular-nums">${task.budget}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 lg:mt-12 flex flex-wrap items-center gap-4 lg:gap-8 justify-center">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 lg:gap-3 glass px-4 lg:px-5 py-2 lg:py-2.5 rounded-full border border-stone-800/50 hover:shadow-xl hover:shadow-black/20 transition-all group">
            <div className={`w-2 lg:w-2.5 h-2 lg:h-2.5 rounded-full transition-transform group-hover:scale-125 ${color.split(' ')[0]} ${color.split(' ')[1]}`} />
            <span className="text-[9px] lg:text-[10px] uppercase font-black text-stone-500 tracking-widest group-hover:text-stone-50 transition-colors uppercase">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
