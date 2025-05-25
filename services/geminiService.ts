import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Attempt to get API_KEY from environment variables.
// In a Vite/Create React App setup, this would be import.meta.env.VITE_API_KEY or process.env.REACT_APP_API_KEY.
// For a simple static setup as assumed, process.env.API_KEY is the way.
// The user MUST ensure process.env.API_KEY is defined in the execution environment.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
let apiKeyMissingWarningLogged = false;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  if (!apiKeyMissingWarningLogged) {
    console.warn(
      "Gemini API Key (process.env.API_KEY) not found. AI features will be disabled. " +
      "Please ensure the API_KEY environment variable is set."
    );
    apiKeyMissingWarningLogged = true;
  }
}

const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const isAIAvailable = (): boolean => !!ai;

export const generateText = async (prompt: string, systemInstruction?: string): Promise<string | null> => {
  if (!ai) return null;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    // Consider how to propagate this error to the UI
    if (error instanceof Error && error.message.includes("API key not valid")) {
        alert("Gemini API Key is not valid. Please check your API_KEY environment variable.");
    }
    return null;
  }
};

export const generateJson = async <T>(prompt: string, systemInstruction?: string): Promise<T | null> => {
  if (!ai) return null;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        ...(systemInstruction && { systemInstruction }),
      },
    });

    let jsonStr = response.text.trim();
    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e, "Raw text:", response.text);
      // Fallback: try to extract JSON from a more complex string if simple parse fails
      const jsonMatch = jsonStr.match(/(\{.*\}|\[.*\])/s);
      if (jsonMatch && jsonMatch[0]) {
          try {
              return JSON.parse(jsonMatch[0]) as T;
          } catch (e2) {
               console.error("Secondary JSON parsing attempt failed:", e2);
               // Propagate this error to UI if possible
               throw new Error(`Failed to parse AI response as JSON. Details: ${e2 instanceof Error ? e2.message : String(e2)}`);
          }
      }
      throw new Error(`Failed to parse AI response as JSON. Details: ${e instanceof Error ? e.message : String(e)}`);
    }
  } catch (error) {
    console.error("Error generating JSON with Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        alert("Gemini API Key is not valid. Please check your API_KEY environment variable.");
    }
    // Propagate error to UI
    throw error;
  }
};
