import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlanResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema using the proper Enum values from @google/genai
const studyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    planName: { type: Type.STRING },
    totalDays: { type: Type.INTEGER },
    schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          topic: { type: Type.STRING },
          summary: { type: Type.STRING },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
              },
              required: ["front", "back"],
            },
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswerIndex: { type: Type.INTEGER },
              },
              required: ["question", "options", "correctAnswerIndex"],
            },
          },
        },
        required: ["day", "topic", "summary", "flashcards", "quiz"],
      },
    },
  },
  required: ["planName", "totalDays", "schedule"],
};

export const generateStudyPlan = async (
  content: string,
  days: number
): Promise<StudyPlanResponse> => {
  try {
    const prompt = `
      Jesteś ekspertem edukacyjnym. Stwórz plan nauki na podstawie poniższego materiału.
      Materiał musi zostać podzielony logicznie na ${days} dni, zachowując kolejność treści.
      
      Dla każdego dnia wygeneruj:
      1. Temat przewodni.
      2. Zwięzłe streszczenie najważniejszych informacji (summary).
      3. 3-5 fiszek (pytanie/odpowiedź).
      4. 1-2 pytania quizowe z 4 opcjami wyboru.

      Oto treść materiału:
      "${content.substring(0, 30000)}" 
      (Limit treści do 30k znaków dla pewności)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyPlanSchema,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster JSON generation
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as StudyPlanResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};