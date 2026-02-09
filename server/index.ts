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
import { upsertFarmer, guestLogin, register, login, getDebugUsers, deleteDebugUser } from "./routes/auth";
import {
  saveAdvisoryHistory,
  getAdvisoryHistory,
  getProfileData,
  updateSubscription,
} from "./routes/profile";
import {
  recordAnalytics,
  getAnalyticsSummary,
  getCropTrends,
  getSoilHealthTrend,
  getWeatherImpactAnalysis,
  getSystemOverview,
} from "./routes/analytics";
import { getPostById } from "./routes/neon";
import { logTreatment, getAnimalStatus, getLedger } from "./routes/amu";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // DB: ensure the connection is ready before handling domain routes
  const dbReady = connectDB();
  app.use(async (_req, _res, next) => {
    try {
      await dbReady;
    } catch {
      // If connection fails, continue; in-memory mode will still work
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Domain routes
  // Domain routes
  app.post("/api/farmers", createFarmer);
  app.get("/api/farmers/:id", getFarmer);
  app.get("/api/weather", getWeather);
  app.post("/api/advisories", createAdvisory);
  app.get("/api/market", getMarketPrices);
  app.post("/api/chat", chatHandler);
  app.post("/api/predict", uploadMiddleware, predictHandler);
  
  // Auth routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/farmer", upsertFarmer); // legacy
  app.post("/api/auth/guest", guestLogin);
  app.get("/api/debug/users", getDebugUsers);
  app.delete("/api/debug/users/:id", deleteDebugUser);

  // AMU / Blockchain Routes
  app.post("/api/amu/log", logTreatment);
  app.get("/api/amu/status/:animalId", getAnimalStatus);
  app.get("/api/amu/ledger", getLedger);

  app.post("/api/advisory/history", saveAdvisoryHistory);
  app.get("/api/advisory/history/:farmerId", getAdvisoryHistory);
  app.get("/api/profile/:farmerId", getProfileData);
  app.put("/api/profile/:farmerId/subscription", updateSubscription);

  app.post("/api/analytics/record", recordAnalytics);
  app.get("/api/analytics/summary/:farmerId", getAnalyticsSummary);
  app.get("/api/analytics/crop-trends/:farmerId", getCropTrends);
  app.get("/api/analytics/soil-health/:farmerId", getSoilHealthTrend);
  app.get("/api/analytics/weather-impact/:farmerId", getWeatherImpactAnalysis);
  app.get("/api/analytics/system", getSystemOverview);

  // Neon example (requires NETLIFY_DATABASE_URL on Netlify)
  app.get("/api/neon/posts/:id", getPostById);

  return app;
}
