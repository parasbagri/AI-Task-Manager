import { GoogleGenAI } from "@google/genai";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface EnhancedTask {
  title: string;
  description: string | null;
}

export async function enhanceTaskWithAI(userInput: string): Promise<EnhancedTask> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Using fallback.');
    return {
      title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
      description: null
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a task management assistant. Given the user's natural language input, generate a clear, concise task title and a  description. Return ONLY a valid JSON object with "title" and "description" fields. User input: "${userInput}"`;

  const maxRetries = 10;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const content = result.text;

      if (content) {
        try {
          const jsonRegex = /```json\n([\s\S]*?)\n```/;
          const match = content.match(jsonRegex);
          const jsonToParse = match ? match[1] : content;
          const parsed = JSON.parse(jsonToParse);

          return {
            title: parsed.title || userInput,
            description: parsed.description || null
          };
        } catch (e) {
          console.error('Failed to parse JSON from Gemini response:', e);
          return {
            title: content.trim(),
            description: null
          };
        }
      }
    } catch (error: any) {
      if (error.status === 503 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Gemini model overloaded. Retrying in ${delay}ms...`);
        await sleep(delay);
        attempt++;
      } else {
        console.error('Gemini AI enhancement error:', error);
        break;
      }
    }
  }

  return {
    title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
    description: null
  };
}
