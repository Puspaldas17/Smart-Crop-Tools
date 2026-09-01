import { RequestHandler } from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const upload = multer();
export const uploadMiddleware = upload.single("image");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export const predictHandler: RequestHandler = async (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "file required" });

  // --- Mock fallback (used when no GEMINI_API_KEY is configured) ---
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    const crops = [
      { label: "Tomato – Early Blight", prob: 0.92, cure: "Copper Fungicide / Chlorothalonil", soil: { type: "Loamy", ph: "6.0-6.8", moisture: "Moderate", temperature: "21-27°C", notes: "Well-drained soil. Avoid overhead watering to reduce blight spread." } },
      { label: "Rice – Rice Blast", prob: 0.89, cure: "Tricyclazole or Isoprothiolane", soil: { type: "Clay/Loam", ph: "5.5-6.5", moisture: "High (Flooded)", temperature: "20-35°C", notes: "Maintain standing water at tillering stage. Ensure good water retention." } },
      { label: "Corn – Common Rust", prob: 0.94, cure: "Fungicide with Pyraclostrobin", soil: { type: "Sandy Loam", ph: "5.8-7.0", moisture: "Moderate", temperature: "18-27°C", notes: "Well-drained, organic-rich soil. Avoid waterlogging." } },
      { label: "Cotton – Aphids Infestation", prob: 0.87, cure: "Imidacloprid or Neem Oil spray", soil: { type: "Deep Sandy Loam", ph: "5.8-8.0", moisture: "Low to Moderate", temperature: "25-35°C", notes: "Cotton prefers deep soils. Monitor aphid colonies weekly." } },
      { label: "Wheat – Leaf Rust", prob: 0.91, cure: "Propiconazole or Tebuconazole", soil: { type: "Loamy / Clay Loam", ph: "6.0-7.5", moisture: "Moderate", temperature: "15-24°C", notes: "Ensure good drainage. Apply fungicide at first sign of rust pustules." } },
    ];
    const picked = crops[Math.floor(Math.random() * crops.length)];
    return res.json({
      source: "mock-fallback",
      predictions: [
        { className: picked.label, probability: picked.prob },
        { className: `Recommended Treatment: ${picked.cure}`, probability: 1.0 },
        { className: "Tip: Add GEMINI_API_KEY in .env for real AI vision analysis", probability: 0.0 },
      ],
      soilInfo: picked.soil,
    });
  }

  try {

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
