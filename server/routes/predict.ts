import { RequestHandler } from "express";
import multer from "multer";

const upload = multer();

export const uploadMiddleware = upload.single("image");

export const predictHandler: RequestHandler = async (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "file required" });

  const name = file.originalname || "image.jpg";
  const lower = name.toLowerCase();
  let items: { className: string; probability: number }[] = [];

  // Very simple mock prediction logic for demo
  if (
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
