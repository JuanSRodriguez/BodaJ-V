import { getGenerativeModel } from "firebase/ai";
import { ai } from "./firebase";
import { WeddingTask, Guest, Table, TaskStatus } from "../types";

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    text: string;
}

export const chatWithAI = async (
    userMessage: string,
    history: ChatMessage[],
    context: {
        tasks: WeddingTask[];
        guests: Guest[];
        tables: Table[];
        weddingDate: string;
        weddingTheme: string;
        budgetLimit: number;
    }
) => {
    try {
        const model = getGenerativeModel(ai, { model: "gemini-3-flash-preview" });



        // Estadísticas para el contexto
        const totalSpent = context.tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
        const remainingBudget = context.budgetLimit - totalSpent;
        const pendingTasksCount = context.tasks.filter(t => t.status !== TaskStatus.DONE).length;
        const totalGuests = context.guests.length;
        const confirmedGuests = context.guests.filter(g => g.confirmed).length;

        const systemPrompt = `
Eres el "Asistente de Boda J&V", un experto planner de bodas premium para Juan & Vale.
Tu tono es elegante, servicial, proactivo y ligeramente romántico.

CONTEXTO ACTUAL DE LA BODA:
- Fecha: ${context.weddingDate}
- Tema: ${context.weddingTheme}
- Presupuesto Total: $${context.budgetLimit.toLocaleString('es-CO')}
- Presupuesto Restante: $${remainingBudget.toLocaleString('es-CO')}
- Tareas Pendientes: ${pendingTasksCount} de ${context.tasks.length}
- Fecha de Hoy: ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Hora Actual: ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
- Invitados: ${totalGuests} en total (${confirmedGuests} confirmados)



Resumen de Tareas Críticas:
${context.tasks.filter(t => t.status !== TaskStatus.DONE).slice(0, 5).map(t => `- ${t.title} (${t.category})`).join('\n')}

INSTRUCCIONES:
1. Responde siempre en ESPAÑOL.
2. Si te preguntan sobre el presupuesto o tareas, usa los datos proporcionados arriba.
3. Da sugerencias creativas que encajen con el tema "${context.weddingTheme}".
4. Sé conciso pero amable. Usa emojis de boda si es apropiado 💍✨.
5. Si el usuario quiere crear un recordatorio (ej: "Recuérdame X", "Agenda Y", "Avísame Z"):
   - Identifica la fecha (si dice "hoy" usa ${new Date().toISOString().split('T')[0]}).
   - Identifica la hora si se menciona (ej: "2:47 pm").
   - Genera OBLIGATORIAMENTE este bloque JSON al final:
   :::INTENT:::{"type": "REMINDER", "title": "Título de la tarea", "date": "YYYY-MM-DD", "time": "HH:mm", "notes": "Cualquier detalle extra"}:::
   - Si no mencionan hora, usa "09:00".



MENSAJE DEL USUARIO:
${userMessage}
        `;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        return response.text();

    } catch (error) {
        console.error("Error en AI Assistant:", error);
        return "Lo siento, tuve un pequeño contratiempo celestial. ¿Podrías intentar preguntarme de nuevo? ✨";
    }
};
