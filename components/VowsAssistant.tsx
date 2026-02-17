
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
      const prompt = `Estoy escribiendo mis votos matrimoniales. Mi tema de boda es "${weddingTheme}". Lo que llevo escrito hasta ahora es: "${vows}". Ayúdame a mejorar estos votos o dame ideas nuevas con un tono ${tone}. Responde en ESPAÑOL con un texto sugerido hermoso y conmovedor.`;

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
    <div className="max-w-6xl mx-auto animate-fade-in pb-40">
      <div className="text-center mb-12 lg:mb-20 space-y-4">
        <h2 className="text-3xl lg:text-5xl font-serif font-black text-stone-50 italic tracking-tight">Promesas Eternas</h2>
        <p className="text-stone-500 text-sm lg:text-base max-w-xl mx-auto leading-relaxed font-medium px-6">
          Un santuario sagrado para tus palabras más profundas. Deja que tu corazón guíe, y nuestra IA ofrecerá susurros de inspiración.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Editor de Votos Premium */}
        <div className="lg:col-span-8 relative group">
          <div className="hidden lg:block absolute -left-10 -top-10 w-24 h-24 text-[120px] text-stone-800 font-serif opacity-20 select-none pointer-events-none group-hover:text-rose-900 transition-colors duration-1000">“</div>
          <div className="card-premium p-8 lg:p-16 bg-stone-900 min-h-[500px] lg:min-h-[700px] flex flex-col relative overflow-hidden shadow-black/60">
            <div className="absolute top-0 right-0 w-64 h-64 bg-stone-950/40 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>

            <textarea
              value={vows}
              onChange={(e) => setVows(e.target.value)}
              placeholder="En el silencio de la mañana, me di cuenta..."
              className="w-full flex-1 bg-transparent text-xl lg:text-2xl font-serif leading-[2] lg:leading-[2.2] text-stone-50 outline-none placeholder:text-stone-800 italic relative z-10 resize-none"
            />

            <div className="mt-12 pt-8 border-t border-stone-800 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em]">
                  {vows.split(/\s+/).filter(Boolean).length} Palabras Sagradas
                </span>
              </div>
              <p className="text-[10px] font-black text-stone-700 uppercase tracking-widest italic">Tema: {weddingTheme}</p>
            </div>
          </div>
        </div>

        {/* Panel de Asistencia IA Minimalista */}
        <div className="lg:col-span-4 space-y-8 lg:space-y-10">
          <div className="glass p-8 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-stone-800 shadow-premium space-y-6 lg:space-y-8 shadow-black/40">
            <h3 className="text-[11px] font-black text-stone-50 uppercase tracking-[0.3em] flex items-center gap-4">
              <span className="w-10 h-10 bg-stone-800 text-rose-400 rounded-2xl flex items-center justify-center text-xl shadow-inner ring-1 ring-stone-700">✨</span>
              Motor de Inspiración
            </h3>
            <p className="text-[13px] text-stone-400 leading-relaxed font-medium">Selecciona una resonancia para evocar nuevas dimensiones de expresión.</p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { tone: 'romántico y profundo', label: 'Romance Profundo' },
                { tone: 'divertido y ligero', label: 'Divertido y Ligero' },
                { tone: 'poético y literario', label: 'Poético Literario' },
                { tone: 'breve y sincero', label: 'Breve Sinceridad' }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => handleAiAssist(t.tone)}
                  disabled={isAiLoading}
                  className="w-full bg-stone-800 hover:bg-stone-50 text-stone-200 hover:text-stone-900 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-30 flex items-center justify-between group"
                >
                  {t.label}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>

          {suggestion && (
            <div className="card-premium p-10 animate-fade-in relative overflow-hidden border-rose-900/40 bg-rose-950/10 shadow-black/40">
              <div className="flex items-center justify-between mb-8 border-b border-rose-900/50 pb-4">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">Sugerencia Celestial</span>
                <button onClick={() => setSuggestion('')} className="text-rose-500 hover:text-rose-400 transition-colors text-xl leading-none">×</button>
              </div>
              <p className="text-[15px] italic text-stone-400 leading-[1.8] whitespace-pre-line font-serif mb-10">
                {suggestion}
              </p>
              <button
                onClick={() => {
                  setVows(vows ? vows + "\n\n" + suggestion : suggestion);
                  setSuggestion('');
                }}
                className="w-full py-4 bg-stone-50 text-stone-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-black/40 active:scale-95"
              >
                Incorporar al Borrador
              </button>
            </div>
          )}

          {isAiLoading && (
            <div className="flex flex-col items-center justify-center py-20 px-10 glass rounded-[2.5rem] space-y-6 border-stone-800">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-stone-800 border-t-rose-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs">✨</div>
              </div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] animate-pulse text-center">Invocando la resonancia perfecta...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
