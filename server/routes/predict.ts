import { RequestHandler } from "express";
import multer from "multer";
import { fetchWithTimeout, retry } from "../utils/http";

const upload = multer();

export const uploadMiddleware = upload.single("image");

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
      return {
        source: "local-ai-service",
        analysis: data.analysis,
      };
    }
  } catch (error) {
    // Service likely not running, ignore and fall back
    console.log("Local AI service unreachable, using fallback");
  }
  return null;
}

export const predictHandler: RequestHandler = async (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "file required" });

  // 1. Try Local Python AI Service
  const localResult = await runLocalAIService(file);
  if (localResult) {
    return res.json(localResult);
  }

  // 2. Try Hugging Face inference if configured
  try {
    const hf = await runHuggingFace(file.buffer as Buffer);
    if (hf) return res.json({ source: "huggingface", predictions: hf });
  } catch {}

  // Fallback simple mock prediction logic for demo
  const name = file.originalname || "image.jpg";
  const lower = name.toLowerCase();
  let items: { className: string; probability: number }[] = [];

  // Rice
  if (lower.includes("rice") || lower.includes("paddy")) {
    if (lower.includes("blast")) {
      items = [
        { className: "Rice Blast", probability: 0.92 },
        { className: "Brown Spot", probability: 0.05 },
        { className: "Healthy Rice", probability: 0.03 },
      ];
    } else if (lower.includes("brown")) {
      items = [
        { className: "Brown Spot", probability: 0.88 },
        { className: "Rice Blast", probability: 0.08 },
        { className: "Healthy Rice", probability: 0.04 },
      ];
    } else {
      items = [
        { className: "Healthy Rice", probability: 0.95 },
        { className: "Deficiency (Zinc)", probability: 0.03 },
        { className: "Rice Blast", probability: 0.02 },
      ];
    }
  } 
  // Corn / Maize
  else if (lower.includes("corn") || lower.includes("maize")) {
    if (lower.includes("rust")) {
      items = [
        { className: "Common Rust", probability: 0.94 },
        { className: "Gray Leaf Spot", probability: 0.04 },
        { className: "Healthy Corn", probability: 0.02 },
      ];
    } else if (lower.includes("blight")) {
      items = [
        { className: "Northern Corn Leaf Blight", probability: 0.91 },
        { className: "Common Rust", probability: 0.06 },
        { className: "Healthy Corn", probability: 0.03 },
      ];
    } else {
       items = [
        { className: "Healthy Corn", probability: 0.96 },
        { className: "Common Rust", probability: 0.03 },
        { className: "Gray Leaf Spot", probability: 0.01 },
      ];
    }
  }
  // Potato
  else if (lower.includes("potato")) {
     if (lower.includes("early")) {
      items = [
        { className: "Early Blight", probability: 0.89 },
        { className: "Late Blight", probability: 0.07 },
        { className: "Healthy Potato", probability: 0.04 },
      ];
    } else if (lower.includes("late")) {
      items = [
        { className: "Late Blight", probability: 0.93 },
        { className: "Early Blight", probability: 0.05 },
        { className: "Healthy Potato", probability: 0.02 },
      ];
    } else {
       items = [
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
    items = [
      { className: "Leaf blight (approx)", probability: 0.86 },
      { className: "Septoria-like", probability: 0.08 },
      { className: "Healthy leaf", probability: 0.06 },
    ];
  } else if (lower.includes("rust")) {
    items = [
      { className: "Rust disease (approx)", probability: 0.78 },
      { className: "Healthy leaf", probability: 0.15 },
    ];
  } else {
    items = [
      { className: "Healthy leaf", probability: 0.7 },
      { className: "Unknown", probability: 0.2 },
      { className: "Soil/Background", probability: 0.09 },
    ];
  }
  res.json({ source: "server-mock", predictions: items });
};
