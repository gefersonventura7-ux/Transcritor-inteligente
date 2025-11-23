import { GoogleGenAI } from "@google/genai";
import { TranscriptionResponse } from "../types";

const GEMINI_MODEL = 'gemini-2.5-flash';

export const transcribeMedia = async (
  base64Data: string,
  mimeType: string
): Promise<TranscriptionResponse> => {
  
  if (!process.env.API_KEY) {
    throw new Error("Chave de API não encontrada (process.env.API_KEY).");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            text: `Por favor, transcreva o seguinte arquivo de áudio/vídeo.
            Diretrizes:
            1. Identifique os interlocutores se possível (ex: Interlocutor 1, Interlocutor 2).
            2. Formate a saída em Markdown limpo e legível.
            3. Se houver ruído ou partes inaudíveis, marque como [inaudível].
            4. Responda APENAS com a transcrição, sem introduções ou conclusões.`
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("A resposta da API estava vazia.");
    }

    return { text };

  } catch (error) {
    console.error("Erro na transcrição Gemini:", error);
    throw error;
  }
};