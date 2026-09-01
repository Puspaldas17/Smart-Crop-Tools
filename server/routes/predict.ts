import { RequestHandler } from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const upload = multer();
export const uploadMiddleware = upload.single("image");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export const predictHandler: RequestHandler = async (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "file required" });

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY for vision prediction." });
    }

    const base64Image = file.buffer.toString("base64");
    
    const systemInstruction = `You are an expert agricultural botanist. 
You will be given an image. 
If the image is NOT a plant, crop, leaf, or soil (e.g. a dog, a person, a car), you MUST reject it by returning a single prediction with className "Invalid: Not an agricultural image" and probability 1.0. Set all soilInfo fields to "N/A".
If the image IS a plant, identify the plant and diagnose any diseases, deficiencies, or pests present. Provide up to 3 predictions.
Provide the recommended soil conditions for that specific plant.
Return your response EXACTLY as a JSON object matching this schema, with NO markdown formatting, NO backticks, and NO other text:
{
  "source": "gemini-vision",
  "predictions": [
    { "className": "string", "probability": number }
  ],
  "soilInfo": {
    "type": "string",
    "ph": "string",
    "moisture": "string",
    "temperature": "string",
    "notes": "string"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Image, mimeType: file.mimetype || "image/jpeg" } },
            { text: "Analyze this image and return the JSON." }
          ]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.1, 
      }
    });

    let rawText = response.text || "{}";
    
    // Clean up any potential markdown formatting Gemini might accidentally include
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const result = JSON.parse(rawText);
    
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    res.status(500).json({ error: "Failed to analyze image with AI." });
  }
};
