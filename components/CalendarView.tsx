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
        alert(`Sync complete: ${results.success} of ${results.total} tasks added to your Google Calendar.`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Error syncing with Google Calendar. Please check permissions.");
    } finally {
      setIsSyncing(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="view-transition pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full lg:w-auto gap-8">
          <div className="flex flex-col">
            <h2 className="text-2xl lg:text-4xl font-serif font-black text-white italic tracking-tight mb-2">Milestone Calendar</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 px-1">Chronological Strategy / Time Mapping</p>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] ${isSyncing
              ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
              : 'bg-white text-stone-950 hover:bg-rose-50 hover:shadow-glow'
              }`}
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/10 border-t-rose-500 rounded-full animate-spin"></div>
                Syncing Matrix...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.73 17.1,6.73L19.05,4.72C19.05,4.72 16.13,2 12.1,2C6.5,2 2,6.5 2,12C2,17.5 6.5,22 12.1,22C17.3,22 21.5,18.3 21.5,12C21.5,11.7 21.5,11.4 21.35,11.1V11.1Z" />
                </svg>
                Google Sync
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-6 glass border border-white/5 p-2 rounded-2xl shadow-2xl">
          <button onClick={() => changeMonth(-1)} className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-serif font-black text-white text-xl italic min-w-[200px] text-center tracking-tight">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 bg-white/5 border-b border-white/5 backdrop-blur-3xl">
              {dayNames.map(day => (
                <div key={day} className="py-6 text-center text-[10px] uppercase font-black text-white/20 tracking-[0.3em]">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 min-h-[600px] bg-white/[0.02]">
              {monthData.map((day, idx) => {
                const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                const dayTasks = dateStr ? tasksByDay[dateStr] : [];
                const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                return (
                  <div
                    key={idx}
                    className={`border-r border-b border-white/5 p-4 min-h-[140px] transition-all duration-500 relative ${day ? 'hover:bg-white/[0.03]' : 'bg-transparent'} ${isToday ? 'bg-rose-500/[0.03]' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[14px] font-black tabular-nums transition-all duration-500 ${isToday ? 'text-rose-500 scale-125' : 'text-white/20'}`}>
                            {day}
                          </span>
                          {isToday && <div className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />}
                        </div>
                        <div className="space-y-2">
                          {dayTasks?.map(task => (
                            <div
                              key={task.id}
                              className={`group relative px-3 py-2 rounded-xl text-[9px] font-black truncate border transition-all duration-500 hover:scale-105 hover:z-50 cursor-default uppercase tracking-[0.15em] shadow-lg ${STATUS_COLORS[task.status]}`}
                            >
                              <span className="mr-2 opacity-100">{task.icon}</span>
                              {task.title}

                              <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 absolute left-1/2 -bottom-4 translate-x-1/2 w-64 glass p-6 rounded-2xl z-[100] shadow-[0_40px_80px_rgba(0,0,0,0.8)] transition-all duration-400 pointer-events-none border border-white/10 backdrop-blur-3xl">
                                <h5 className="font-serif font-black text-white text-base italic mb-3 tracking-tight border-b border-white/5 pb-3">{task.title}</h5>
                                <p className="text-white/40 text-[11px] font-medium leading-relaxed mb-4 normal-case">{task.notes || 'No detailed blueprint provided.'}</p>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-black uppercase text-rose-400 tracking-[0.2em]">{task.category}</span>
                                  <span className="text-white font-black text-[12px] tabular-nums tracking-tighter">${task.budget?.toLocaleString()}</span>
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
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-8 justify-center">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-4 glass px-6 py-3 rounded-2xl border border-white/5 hover:border-white/10 hover:shadow-glow transition-all duration-500 group cursor-default">
            <div className={`w-2 h-2 rounded-full transition-transform group-hover:scale-150 ${color.split(' ')[0]} shadow-[0_0_12px_rgba(255,255,255,0.2)]`} />
            <span className="text-[10px] font-black uppercase text-white/20 tracking-[0.25em] group-hover:text-white transition-colors uppercase">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
