import { RequestHandler } from "express";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK
// Note: GoogleGenAI automatically picks up GEMINI_API_KEY from process.env, 
// but we explicitly pass it here for clarity if it exists.
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "dummy" 
});

export const chatHandler: RequestHandler = async (req, res) => {
  try {
    const { message, lat, lon, lang = "en" } = req.body as {
      message?: string;
      lat?: number;
      lon?: number;
      lang?: string;
    };
    
    if (!message) return res.status(400).json({ error: "message required" });

    // 1. Safety Check: Ensure API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return res.status(500).json({ 
        error: "Missing GEMINI_API_KEY. Please add it to your .env file to activate the AI." 
      });
    }

    // 2. Determine target language for the AI prompt
    const shortLang = lang.split("-")[0];
    const targetLang = shortLang === "or" ? "Odia" : shortLang === "hi" ? "Hindi" : "English";

    // 3. Optional: Fetch local weather to give Gemini more context
    let weatherContext = "";
    if (lat != null && lon != null) {
      const key = process.env.OPENWEATHER_API_KEY;
      if (key && key !== "your_openweather_api_key_here") {
        try {
          const r = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
          );
          if (r.ok) {
            const w = await r.json();
            weatherContext = `Current User Weather: ${w.weather?.[0]?.description}, Temp: ${w.main?.temp}°C, Humidity: ${w.main?.humidity}%. `;
          }
        } catch (e) {
          console.error("Optional weather fetch failed", e);
        }
      }
    }

    // 4. Build System Instruction for Gemini
    const systemInstruction = `You are AgriVerse, an expert AI agricultural assistant designed for small and marginal farmers. 
Your goal is to provide concise, practical, and highly accurate advice regarding crop health, pest management, irrigation, fertilizers, and market trends.
Keep your answers very brief (2-4 short sentences max). Do not use markdown formatting like bolding or asterisks.
If the user provides location or weather data, use it to give contextual advice.
${weatherContext}
IMPORTANT: You MUST reply in the ${targetLang} language.`;

    // 5. Generate Response using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const reply = response.text || "Sorry, I couldn't generate a response right now.";
    res.json({ reply });
  } catch (e: any) {
    console.error("Gemini Chat Error:", e);
    // Return the actual error message to the client so they can debug API key issues
    res.status(500).json({ error: e.message || "Failed to generate AI response. Check server logs." });
  }
};
