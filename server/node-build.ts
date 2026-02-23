import * as Path from "path";
import { fileURLToPath } from "url";
import { createServer } from "./index";
import express from "express";

const app = createServer();
const port = Number(process.env.PORT) || 3000;

// In production, serve the built SPA files
const __dirname = Path.dirname(fileURLToPath(import.meta.url));
const distPath = Path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Handle React Router - serve index.html for all non-API routes
app.get(/.*/, (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(Path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
