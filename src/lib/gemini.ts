import { GoogleGenAI } from "@google/genai";

// Server-side Gemini AI client initialization conforming to skill guidelines
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});
