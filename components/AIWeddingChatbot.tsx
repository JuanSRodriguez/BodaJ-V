import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI, ChatMessage } from '../services/aiAssistant';
import { WeddingTask, Guest, Table } from '../types';
import { signInWithGoogle, createCalendarReminder } from '../services/googleCalendarService';

interface AIWeddingChatbotProps {
    tasks: WeddingTask[];
    guests: Guest[];
    tables: Table[];
    weddingDate: string;
    weddingTheme: string;
    budgetLimit: number;
    onAddTask: (title: string, date: string, time: string, notes: string) => void;
}



export const AIWeddingChatbot: React.FC<AIWeddingChatbotProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingReminder, setPendingReminder] = useState<{ title: string, date: string, notes: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, pendingReminder]);

    const handleCreateReminder = async (data: { title: string, date: string, time: string, notes: string }) => {
        try {
            const token = await signInWithGoogle();
            if (token) {
                const result = await createCalendarReminder(data.title, data.date, data.time, data.notes, token);
                if (result.success) {
                    // Sync with local calendar/tasks
                    props.onAddTask(data.title, data.date, data.time, data.notes);

                    setMessages(prev => [...prev, {

                        role: 'model',
                        text: `✅ ¡Perfecto! He agendado "${data.title}" en tu Google Calendar para el ${data.date} a las ${data.time || '09:00'}. Recibirás recordatorios por correo automáticamente.`
                    }]);
                    setPendingReminder(null);
                }
            }
        } catch (error) {
            console.error("Reminder creation error", error);
            setMessages(prev => [...prev, {
                role: 'model',
                text: "❌ Hubo un problema al conectar con Google Calendar. Por favor, asegúrate de permitir las ventanas emergentes (popups) y dar los permisos necesarios."
            }]);
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setPendingReminder(null);

        try {
            const response = await chatWithAI(text, messages, props);

            // Handle Intent Detection
            const intentMatch = response.match(/:::INTENT:::(.*?):::/);
            let aiText = response;
            let intent = null;

            if (intentMatch) {
                aiText = response.replace(/:::INTENT:::.*?:::/, '').trim();
                try {
                    intent = JSON.parse(intentMatch[1]);
                } catch (e) {
                    console.error("Failed to parse intent", e);
                }
            }

            const aiMsg: ChatMessage = { role: 'model', text: aiText || 'Lo siento, no pude procesar eso.' };
            setMessages(prev => [...prev, aiMsg]);

            if (intent && intent.type === 'REMINDER') {
                setPendingReminder(intent);
            }

        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        "¿Cómo va mi presupuesto?",
        "Sugerencias de música",
        "Recordatorio cita flores lunes",
        "Ideas de decoración"
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-sans">
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-glow overflow-hidden relative group ${isOpen ? 'bg-white text-stone-950 scale-90 rotate-90' : 'bg-rose-500 text-white hover:scale-110'
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-2xl relative z-10">{isOpen ? '×' : '✨'}</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-24 right-0 w-[400px] max-w-[calc(100vw-40px)] h-[600px] max-h-[calc(100vh-120px)] glass rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-fade-in-up">
                    {/* Header */}
                    <div className="p-8 bg-white/[0.03] border-b border-white/5 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-rose-500/30 shadow-glow">
                                <img src="/ai-avatar.png" alt="AI Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0a0a0a] animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">Asistente Juan & Vale</h3>
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Experto en Planeación</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/20">
                        {messages.length === 0 && (
                            <div className="text-center py-6 space-y-6">
                                <p className="text-[12px] text-white/30 font-medium leading-relaxed italic">
                                    "Cada detalle es un hilo en el tapiz de su historia. ¿En qué puedo ayudarles hoy?"
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    {quickActions.map(action => (
                                        <button
                                            key={action}
                                            onClick={() => handleSend(action)}
                                            className="text-[10px] uppercase tracking-widest font-black p-4 glass bg-white/5 hover:bg-white hover:text-stone-950 rounded-xl transition-all border-white/5 text-white/40 text-left flex items-center gap-3"
                                        >
                                            <span className="text-rose-500/50">✦</span>
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {m.role === 'model' && (
                                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                        <img src="/ai-avatar.png" alt="AI" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] p-6 rounded-3xl text-[14px] leading-relaxed shadow-xl ${m.role === 'user'
                                    ? 'bg-rose-500 text-white rounded-tr-none'
                                    : 'glass bg-white/5 text-white/70 rounded-tl-none border border-white/5'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 animate-pulse">
                                    <img src="/ai-avatar.png" alt="AI" className="w-full h-full object-cover grayscale opacity-50" />
                                </div>
                                <div className="glass bg-white/5 p-6 rounded-3xl rounded-tl-none border border-white/5">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirmation for Reminder */}
                        {pendingReminder && (
                            <div className="flex flex-col gap-4 glass bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xl">📅</span>
                                    <div>
                                        <p className="text-[12px] font-black text-white uppercase tracking-wider">{pendingReminder.title}</p>
                                        <p className="text-[10px] text-rose-500 font-bold">{pendingReminder.date} | {pendingReminder.time || '09:00'}</p>
                                    </div>

                                </div>
                                <p className="text-[11px] text-white/50 mb-2">Para agendar esto necesito sincronizar con tu Google Calendar.</p>
                                <button
                                    onClick={() => handleCreateReminder(pendingReminder)}
                                    className="w-full py-4 bg-white text-stone-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 transition-all hover:shadow-glow active:scale-95"
                                >
                                    Confirmar y Agendar
                                </button>
                                <button
                                    onClick={() => setPendingReminder(null)}
                                    className="text-[9px] text-white/20 uppercase font-black tracking-widest hover:text-white/40 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-8 bg-white/[0.03] border-t border-white/5">
                        <div className="relative flex items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe un mensaje..."
                                className="w-full bg-white/5 border border-white/5 focus:border-rose-500/50 rounded-2xl py-4 pl-6 pr-16 outline-none text-white text-[13px] transition-all placeholder:text-white/10"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-3 w-10 h-10 rounded-xl bg-white text-stone-950 flex items-center justify-center hover:scale-110 active:scale-90 transition-all disabled:opacity-20"
                            >
                                ↑
                            </button>
                        </div>
                        <p className="text-[9px] text-white/10 mt-4 text-center uppercase tracking-widest font-bold">
                            Powered by Google Gemini 3 Flash
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
