import React, { useEffect, useRef } from 'react';
import { TimelineItem } from '../types';

interface TimelineViewProps {
  timeline: TimelineItem[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, setTimeline }) => {
  const lastItemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const emptyItem = timeline.find(t => t.activity === '');
    if (emptyItem) {
      setTimeout(() => {
        const input = document.getElementById(`activity-${emptyItem.id}`) as HTMLInputElement;
        input?.focus();
      }, 50);
    }
  }, [timeline.length]);

  const updateItem = (id: string, updates: Partial<TimelineItem>) => {
    setTimeline(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t).sort((a, b) => a.time.localeCompare(b.time)));
  };

  const deleteItem = (id: string) => {
    setTimeline(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto view-transition pb-40">
      <div className="mb-20 text-center">
        <h2 className="text-3xl lg:text-5xl font-serif font-black text-white italic tracking-tight mb-4">Event Choreography</h2>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 px-1">Orchestrating the rhythm of celebration</p>
      </div>

      <div className="relative space-y-16 lg:space-y-24 before:absolute before:left-[40px] lg:before:left-[159px] before:top-12 before:bottom-12 before:w-px before:bg-white/5 before:shadow-glow">
        {timeline.length === 0 ? (
          <div className="text-center py-40 glass border-dashed border-white/5 rounded-[3rem] bg-white/[0.02] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-500/[0.02] blur-[100px] group-hover:bg-rose-500/[0.05] transition-all duration-1000" />
            <span className="text-8xl block mb-12 grayscale opacity-5 group-hover:opacity-10 group-hover:grayscale-0 transition-all duration-1000 animate-pulse">⏳</span>
            <p className="text-white/20 font-serif italic text-2xl tracking-tight px-10 relative z-10">The flow of magic has not yet been synchronized.</p>
          </div>
        ) : (
          timeline.map((item, idx) => (
            <div key={item.id} className="relative flex flex-col md:flex-row items-start gap-12 lg:gap-20 group transition-all duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="w-24 pl-6 lg:pl-0 pt-2 lg:text-right group-hover:scale-110 transition-transform origin-right">
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateItem(item.id, { time: e.target.value })}
                  className="bg-transparent border-none p-0 text-2xl lg:text-4xl font-serif font-black text-white lg:text-right focus:ring-0 cursor-pointer hover:text-rose-500 transition-all tracking-tighter tabular-nums"
                />
              </div>

              <div className="absolute left-[34px] lg:left-[152px] top-6 lg:top-6 w-3 h-3 bg-stone-950 border-2 border-white/20 rounded-full z-10 transition-all duration-700 group-hover:scale-150 group-hover:bg-rose-500 group-hover:border-rose-500 group-hover:shadow-glow"></div>

              <div className="flex-1 w-full card-premium p-8 lg:p-12 relative overflow-hidden group/card shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/[0.03] rounded-full -mr-24 -mt-24 transition-all duration-1000 group-hover/card:bg-rose-500/[0.07] group-hover/card:scale-125"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 lg:mb-12 border-b border-white/5 pb-6 lg:pb-8 gap-6">
                    <input
                      id={`activity-${item.id}`}
                      value={item.activity}
                      onChange={(e) => updateItem(item.id, { activity: e.target.value })}
                      placeholder="Defining the moment..."
                      className="flex-1 bg-transparent border-none p-0 text-xl lg:text-2xl font-black text-white focus:ring-0 placeholder:text-white/5 uppercase italic tracking-tight group-hover/card:text-rose-400 transition-colors"
                    />
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-rose-400 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-all duration-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 shadow-none hover:shadow-glow"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4 pt-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Setting / Location</label>
                      <div className="flex items-center gap-4 group/input">
                        <div className="w-10 h-10 rounded-xl glass border-white/5 flex items-center justify-center text-lg opacity-20 group-hover/input:opacity-100 group-hover/input:text-rose-500 transition-all">📍</div>
                        <input
                          value={item.location}
                          onChange={(e) => updateItem(item.id, { location: e.target.value })}
                          placeholder="Secret Garden, Grand Ballroom..."
                          className="w-full bg-transparent border-none p-0 text-[15px] text-white/40 font-bold focus:ring-0 italic placeholder:text-white/5 hover:text-white transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 pt-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Directives & Notes</label>
                      <div className="flex items-center gap-4 group/input">
                        <div className="w-10 h-10 rounded-xl glass border-white/5 flex items-center justify-center text-lg opacity-20 group-hover/input:opacity-100 group-hover/input:text-rose-500 transition-all">📋</div>
                        <input
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                          placeholder="Lead directives or choreography details..."
                          className="w-full bg-transparent border-none p-0 text-[15px] text-white/40 font-bold focus:ring-0 italic placeholder:text-white/5 hover:text-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
