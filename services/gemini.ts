
import { GoogleGenAI, Type } from "@google/genai";
import { WeddingTask } from "../types";

export const getAISuggestions = async (currentTasks: WeddingTask[], weddingTheme: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tasksSummary = currentTasks.map(t => `${t.title} (${t.status})`).join(", ");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Basándote en estas tareas de boda existentes: ${tasksSummary} y el tema "${weddingTheme}", ¿qué 5 elementos críticos faltan en mi planificador? Responde en ESPAÑOL como un array JSON de objetos con "title", "category" y "reason". Usa categorías estándar de bodas.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["title", "category", "reason"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error al parsear la respuesta de la IA:", error);
    return [];
  }
};
