
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function lookupWord(word: string): Promise<string> {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Provide a concise Latin dictionary entry for the word "${word}". Include its part of speech, declension/conjugation family, and primary English meanings. Format the response as plain text. If the word is not a valid Latin word, state that.`;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error(`Error looking up word "${word}":`, error);
    throw new Error('Failed to fetch definition from Gemini API.');
  }
}
