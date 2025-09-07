import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { connectDB } from "./db";
import { createFarmer, getFarmer } from "./routes/farmers";
import { getWeather } from "./routes/weather";
import { createAdvisory } from "./routes/advisory";
import { getMarketPrices } from "./routes/market";
import { chatHandler } from "./routes/chat";
import { predictHandler, uploadMiddleware } from "./routes/predict";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // DB
  void connectDB();

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Domain routes
  app.post("/api/farmers", createFarmer);
  app.get("/api/farmers/:id", getFarmer);
  app.get("/api/weather", getWeather);
  app.post("/api/advisories", createAdvisory);
  app.get("/api/market", getMarketPrices);
  app.post("/api/chat", chatHandler);

  return app;
}
