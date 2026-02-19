import { RequestHandler } from "express";
import multer from "multer";
import { fetchWithTimeout, retry } from "../utils/http";

const upload = multer();

export const uploadMiddleware = upload.single("image");

// Inline helper since utils/soilData might be missing/conflicted
function getSoilInfo(name: string) {
  const lower = name.toLowerCase();
  
  if (lower.includes("rice") || lower.includes("paddy")) {
    return {
      type: "Clay / Loam",
      ph: "5.5 - 6.5",
      moisture: "High (Flooded)",
      temperature: "20-35°C",
      notes: "Rice requires standing water during early growth stages. Ensure good water retention."
    };
  }
  if (lower.includes("corn") || lower.includes("maize")) {
    return {
      type: "Loamy / Sandy Loam",
      ph: "5.8 - 7.0",
      moisture: "Moderate",
      temperature: "18-27°C",
      notes: "Corn needs well-drained soil rich in organic matter. Avoid waterlogging."
    };
  }
  if (lower.includes("potato")) {
    return {
      type: "Sandy Loam",
      ph: "4.8 - 5.5",
      moisture: "Consistent",
      temperature: "15-20°C",
      notes: "Potatoes prefer loose soil for tuber development. Monitor moisture to prevent rot."
    };
  }
  
  // Default / Generic
  return {
    type: "Loamy (Generic)",
    ph: "6.0 - 7.0",
    moisture: "Moderate",
    temperature: "20-25°C",
    notes: "General best conditions for most crops. Test soil for specific needs."
  };
}

async function runHuggingFace(image: Buffer) {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  const model = process.env.HF_MODEL || "microsoft/resnet-50"; // generic image classifier
  if (!token) return null;
  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/octet-stream",
  };
  const res = await retry(
    () =>
      fetchWithTimeout(
        url,
        { method: "POST", headers, body: image as any },
        12000,
      ),
    2,
    500,
  );
  if (!res.ok) return null;
  try {
    const data = await res.json();
    // HF returns an array of { label, score }
    if (Array.isArray(data)) {
      return data
        .slice(0, 5)
        .map((d: any) => ({ className: d.label, probability: d.score }));
    }
    return null;
  } catch {
    return null;
  }
}

async function runLocalAIService(file: any) {
  try {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("file", blob, file.originalname);

    const res = await fetch("http://localhost:8000/predict/disease", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      const analysis = data.analysis;
      
      // Adapt Python service output to frontend 'predictions' format
      let predictions: { className: string; probability: number }[] = [];
      
      if (analysis) {
        const name = analysis.disease || analysis.status || "Unknown";
        const prob = analysis.confidence || 0;
        predictions.push({ className: name, probability: prob });
      }

      return {
        source: "local-ai-service",
        predictions,
        analysis: data.analysis,
      };
    }
  } catch (error) {
    console.log("Local AI service unreachable, using fallback");
  }
  return null;
}

export const predictHandler: RequestHandler = async (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "file required" });

  let predictions: { className: string; probability: number }[] = [];
  let source = "server-mock";
  let detectedCrop = "unknown";

  // 1. Try Local Python AI Service
  const localResult = await runLocalAIService(file);

  if (localResult && localResult.analysis) {
    source = "local-ai-service";
    // Normalize Local AI result to our standard list format for the frontend
    // The Python service returns: { status, disease, confidence, recommendation }
    if (localResult.analysis.disease) {
      predictions = [{
        className: localResult.analysis.disease,
        probability: localResult.analysis.confidence
      }];
    } else {
      predictions = [{
        className: localResult.analysis.status || "Healthy",
        probability: localResult.analysis.confidence || 0.99
      }];
    }
  }

  // 2. Try Hugging Face (if local failed)
  else {
    try {
      const hf = await runHuggingFace(file.buffer as Buffer);
      if (hf) {
        source = "huggingface";
        predictions = hf;
      }
    } catch { }
  }

  // 3. Fallback Mock Logic (if others failed or returned nothing)
  if (predictions.length === 0) {
    const name = file.originalname || "image.jpg";
    const lower = name.toLowerCase();

    // Rice
    if (lower.includes("rice") || lower.includes("paddy")) {
      if (lower.includes("blast")) {
        predictions = [
          { className: "Rice Blast", probability: 0.92 },
          { className: "Brown Spot", probability: 0.05 },
          { className: "Healthy Rice", probability: 0.03 },
        ];
      } else if (lower.includes("brown")) {
        predictions = [
          { className: "Brown Spot", probability: 0.88 },
          { className: "Rice Blast", probability: 0.08 },
          { className: "Healthy Rice", probability: 0.04 },
        ];
      } else {
        predictions = [
          { className: "Healthy Rice", probability: 0.95 },
          { className: "Deficiency (Zinc)", probability: 0.03 },
          { className: "Rice Blast", probability: 0.02 },
        ];
      }
    }
    // Corn / Maize
    else if (lower.includes("corn") || lower.includes("maize")) {
      if (lower.includes("rust")) {
        predictions = [
          { className: "Common Rust", probability: 0.94 },
          { className: "Gray Leaf Spot", probability: 0.04 },
          { className: "Healthy Corn", probability: 0.02 },
        ];
      } else if (lower.includes("blight")) {
        predictions = [
          { className: "Northern Corn Leaf Blight", probability: 0.91 },
          { className: "Common Rust", probability: 0.06 },
          { className: "Healthy Corn", probability: 0.03 },
        ];
      } else {
        predictions = [
          { className: "Healthy Corn", probability: 0.96 },
          { className: "Common Rust", probability: 0.03 },
          { className: "Gray Leaf Spot", probability: 0.01 },
        ];
      }
    }
    // Potato
    else if (lower.includes("potato")) {
      if (lower.includes("early")) {
        predictions = [
          { className: "Early Blight", probability: 0.89 },
          { className: "Late Blight", probability: 0.07 },
          { className: "Healthy Potato", probability: 0.04 },
        ];
      } else if (lower.includes("late")) {
        predictions = [
          { className: "Late Blight", probability: 0.93 },
          { className: "Early Blight", probability: 0.05 },
          { className: "Healthy Potato", probability: 0.02 },
        ];
      } else {
        predictions = [
          { className: "Healthy Potato", probability: 0.97 },
          { className: "Early Blight", probability: 0.02 },
          { className: "Late Blight", probability: 0.01 },
        ];
      }
    }
    // Generic / Default
    else if (
      lower.includes("blight") ||
      lower.includes("fungus") ||
      lower.includes("leaf")
    ) {
      predictions = [
        { className: "Leaf blight (approx)", probability: 0.86 },
        { className: "Septoria-like", probability: 0.08 },
        { className: "Healthy leaf", probability: 0.06 },
      ];
    } else if (lower.includes("rust")) {
      predictions = [
        { className: "Rust disease (approx)", probability: 0.78 },
        { className: "Healthy leaf", probability: 0.15 },
      ];
    } else {
      predictions = [
        { className: "Healthy leaf", probability: 0.7 },
        { className: "Unknown", probability: 0.2 },
        { className: "Soil/Background", probability: 0.09 },
      ];
    }
  }

  // Determine Crop Name for Soil Info
  // If we have a filename, use that. If not, check the top prediction class name.
  const nameToCheck = file.originalname + " " + (predictions[0]?.className || "");
  const soilInfo = getSoilInfo(nameToCheck);

  res.json({
    source,
    predictions,
    soilInfo
  });
};
