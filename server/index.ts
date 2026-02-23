import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { connectDB } from "./db";
import { createFarmer, getFarmer, requestConsultation, getFarmerConsultations, getFarmerVetAdvisories } from "./routes/farmers";
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
import {
  getAdminOverview,
  listFarmers,
  updateFarmer,
  deleteFarmer,
  getAmuLedger,
  sendBroadcast,
  getBroadcasts,
  createUser,
  seedDefaultUsers,
  getAdminConsultations,
} from "./routes/admin";
import {
  getVetFarmers,
  getVetConsultations,
  updateConsultation,
  createVetAdvisory,
  getVetAdvisories,
} from "./routes/vet";

import {
  getBookings,
  createBooking,
  updateBooking,
} from "./routes/appointments";
import { verifyToken, requireRole } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // DB: ensure connection ready
  const dbReady = connectDB();
  app.use(async (_req, _res, next) => {
    try { await dbReady; } catch { /* fallback to in-memory */ }
    next();
  });

  // ── Ping / Demo ────────────────────────────────────────────────────────────
  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "ping" });
  });
  app.get("/api/demo", handleDemo);

  // ── Auth (public) ──────────────────────────────────────────────────────────
  app.post("/api/auth/register",    register);
  app.post("/api/auth/login",       login);
  app.post("/api/auth/farmer",      upsertFarmer);   // legacy
  app.post("/api/auth/guest",       guestLogin);

  // ── Debug (dev only — strip in prod via env flag if desired) ──────────────
  app.get("/api/debug/users",           verifyToken, requireRole("admin"), getDebugUsers);
  app.delete("/api/debug/users/:id",    verifyToken, requireRole("admin"), deleteDebugUser);

  // ── Farmer routes — specific paths BEFORE parameterised :id ───────────────
  app.post("/api/farmers",                           createFarmer);
  app.post("/api/farmers/consult",                   verifyToken, requestConsultation);
  app.get("/api/farmers/:id",                        getFarmer);
  app.get("/api/farmers/:id/consultations",          verifyToken, getFarmerConsultations);
  app.get("/api/farmers/:id/vet-advisories",         verifyToken, getFarmerVetAdvisories);

  // ── General (semi-public) ─────────────────────────────────────────────────
  app.get("/api/weather",                getWeather);
  app.post("/api/advisories",            verifyToken, createAdvisory);
  app.get("/api/market",                 getMarketPrices);
  app.post("/api/chat",                  verifyToken, chatHandler);
  app.post("/api/predict",               uploadMiddleware, predictHandler);

  // ── Profile ────────────────────────────────────────────────────────────────
  app.post("/api/advisory/history",                verifyToken, saveAdvisoryHistory);
  app.get("/api/advisory/history/:farmerId",        verifyToken, getAdvisoryHistory);
  app.get("/api/profile/:farmerId",                 verifyToken, getProfileData);
  app.put("/api/profile/:farmerId/subscription",   verifyToken, updateSubscription);

  // ── Analytics ─────────────────────────────────────────────────────────────
  app.post("/api/analytics/record",                    verifyToken, recordAnalytics);
  app.get("/api/analytics/summary/:farmerId",           verifyToken, getAnalyticsSummary);
  app.get("/api/analytics/crop-trends/:farmerId",       verifyToken, getCropTrends);
  app.get("/api/analytics/soil-health/:farmerId",       verifyToken, getSoilHealthTrend);
  app.get("/api/analytics/weather-impact/:farmerId",    verifyToken, getWeatherImpactAnalysis);
  app.get("/api/analytics/system",                      verifyToken, getSystemOverview);

  // ── AMU / Blockchain ──────────────────────────────────────────────────────
  app.post("/api/amu/log",                 verifyToken, logTreatment);
  app.get("/api/amu/status/:animalId",     verifyToken, getAnimalStatus);
  app.get("/api/amu/ledger",               verifyToken, getLedger);

  // ── Neon example ──────────────────────────────────────────────────────────
  app.get("/api/neon/posts/:id", getPostById);

  // ── Appointments ──────────────────────────────────────────────────────────
  app.get("/api/appointments",             verifyToken, getBookings);
  app.post("/api/appointments",            verifyToken, createBooking);
  app.patch("/api/appointments/:id",       verifyToken, updateBooking);

  // ── Admin routes (admin role required) ───────────────────────────────────
  app.get("/api/admin/overview",           verifyToken, requireRole("admin"), getAdminOverview);
  app.get("/api/admin/farmers",            verifyToken, requireRole("admin"), listFarmers);
  app.patch("/api/admin/farmers/:id",      verifyToken, requireRole("admin"), updateFarmer);
  app.delete("/api/admin/farmers/:id",     verifyToken, requireRole("admin"), deleteFarmer);
  app.get("/api/admin/amu",                verifyToken, requireRole("admin"), getAmuLedger);
  app.post("/api/admin/broadcast",         verifyToken, requireRole("admin"), sendBroadcast);
  app.get("/api/admin/broadcasts",         verifyToken, requireRole("admin"), getBroadcasts);
  app.post("/api/admin/create-user",       verifyToken, requireRole("admin"), createUser);
  app.post("/api/admin/seed",              seedDefaultUsers);   // open for first-time setup
  app.get("/api/admin/consultations",      verifyToken, requireRole("admin"), getAdminConsultations);

  // ── Vet routes (vet or admin role required) ───────────────────────────────
  app.get("/api/vet/farmers",              verifyToken, requireRole("vet", "admin"), getVetFarmers);
  app.get("/api/vet/consultations",        verifyToken, requireRole("vet", "admin"), getVetConsultations);
  app.patch("/api/vet/consultations/:id",  verifyToken, requireRole("vet", "admin"), updateConsultation);
  app.post("/api/vet/advisory",            verifyToken, requireRole("vet", "admin"), createVetAdvisory);
  app.get("/api/vet/advisories",           verifyToken, requireRole("vet", "admin"), getVetAdvisories);

  return app;
}
