import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface VowsAssistantProps {
  vows: string;
  setVows: (vows: string) => void;
  weddingTheme: string;
}

export const VowsAssistant: React.FC<VowsAssistantProps> = ({ vows, setVows, weddingTheme }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const handleAiAssist = async (tone: string) => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `I am writing my wedding vows. My wedding theme is "${weddingTheme}". What I've written so far is: "${vows}". Help me enhance these vows or give me new ideas with a ${tone} tone. Respond in ENGLISH with a beautiful and moving suggested text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",


        contents: prompt
      });

      setSuggestion(response.text || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto view-transition pb-40">
      <div className="text-center mb-20 space-y-6">
        <h2 className="text-3xl lg:text-5xl font-serif font-black text-white italic tracking-tight mb-4">Eternal Promises</h2>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 px-1 max-w-2xl mx-auto leading-relaxed">
          A sacred sanctuary for your deepest words. Let your heart guide, and our AI will offer whispers of inspiration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Premium Vows Editor */}
        <div className="lg:col-span-8 relative group">
          <div className="hidden lg:block absolute -left-12 -top-12 w-24 h-24 text-[140px] text-white/5 font-serif select-none pointer-events-none group-hover:text-rose-500/10 transition-colors duration-1000">“</div>
          <div className="card-premium p-10 lg:p-20 bg-white/5 min-h-[600px] lg:min-h-[800px] flex flex-col relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/[0.02] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125"></div>

            <textarea
              value={vows}
              onChange={(e) => setVows(e.target.value)}
              placeholder="In the silence of the morning, I realized..."
              className="w-full flex-1 bg-transparent text-xl lg:text-3xl font-serif leading-[2] lg:leading-[2.5] text-white outline-none placeholder:text-white/5 italic relative z-10 resize-none custom-scrollbar"
            />

            <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-glow"></div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                  {vows.split(/\s+/).filter(Boolean).length} Sacred Words
                </span>
              </div>
              <p className="text-[10px] font-black text-rose-500/40 uppercase tracking-[0.3em] italic">Theme: {weddingTheme}</p>
            </div>
          </div>
        </div>

        {/* AI Assistance Panel */}
        <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-32">
          <div className="glass p-10 lg:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-8 relative overflow-hidden group/panel">
            <div className="absolute inset-0 bg-indigo-500/[0.01] blur-[100px] group-hover/panel:bg-indigo-500/[0.03] transition-all duration-1000" />
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-5 relative z-10">
              <span className="w-12 h-12 glass border-white/10 text-rose-400 rounded-2xl flex items-center justify-center text-2xl shadow-glow">✨</span>
              Inspiration Engine
            </h3>
            <p className="text-[13px] text-white/30 leading-relaxed font-medium relative z-10">Invoke a resonance to evoke new dimensions of expression.</p>

            <div className="grid grid-cols-1 gap-4 relative z-10">
              {[
                { tone: 'deeply romantic and soulful', label: 'Soulful Romance' },
                { tone: 'lighthearted and humorous', label: 'Witty & Light' },
                { tone: 'poetic and literary', label: 'Poetic Lyricism' },
                { tone: 'brief and sincere', label: 'Pure Sincerity' }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => handleAiAssist(t.tone)}
                  disabled={isAiLoading}
                  className="w-full glass bg-white/5 hover:bg-white text-white/40 hover:text-stone-950 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 disabled:opacity-20 flex items-center justify-between group active:scale-95 border-white/5 hover:border-white shadow-xl hover:shadow-glow"
                >
                  {t.label}
                  <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">→</span>
                </button>
              ))}
            </div>
          </div>

          {suggestion && (
            <div className="card-premium p-12 animate-fade-in relative overflow-hidden border-rose-500/10 bg-rose-500/[0.02] shadow-2xl">
              <div className="flex items-center justify-between mb-10 border-b border-rose-500/10 pb-6">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">Celestial Suggestion</span>
                <button onClick={() => setSuggestion('')} className="w-8 h-8 flex items-center justify-center text-rose-500 hover:text-white transition-colors text-2xl leading-none glass border-rose-500/20 rounded-full">×</button>
              </div>
              <p className="text-[16px] italic text-white/60 leading-[2] whitespace-pre-line font-serif mb-12">
                {suggestion}
              </p>
              <button
                onClick={() => {
                  setVows(vows ? vows + "\n\n" + suggestion : suggestion);
                  setSuggestion('');
                }}
                className="w-full py-5 bg-white text-stone-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-rose-50 transition-all shadow-glow active:scale-95"
              >
                Incorporate Blueprint
              </button>
            </div>
          )}

          {isAiLoading && (
            <div className="flex flex-col items-center justify-center py-24 px-12 glass rounded-[3.5rem] space-y-8 border-white/5 shadow-2xl bg-white/[0.01]">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-white/5 border-t-rose-500 rounded-full animate-spin shadow-glow"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">✨</div>
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse text-center">Invoking the perfect resonance...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
