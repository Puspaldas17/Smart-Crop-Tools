# Smart Crop Advisory System

[![build](https://img.shields.io/badge/build-passing-brightgreen)](https://vercel.com)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Quick Start: see `docs/running.md` for easy, copy-paste PowerShell commands to run, test and deploy this project.

A production‑ready, full‑stack MERN application that delivers data‑driven, multilingual guidance for farmers. It unifies a voice‑enabled chatbot, local weather with alerts, market prices, quick crop advisory, and image‑based pest diagnosis in a single responsive web app.

- Frontend: React (Vite) + TailwindCSS + Radix UI
- Backend: Express (integrated with Vite in dev) + shared TypeScript types
- Database: MongoDB via Mongoose (with in‑memory fallback for local demos)
- ML: Server endpoint with optional Hugging Face Inference API

---

## Table of Contents

- Features
- Architecture & Project Structure
- Requirements
- Quick Start (VS Code)
- Environment Variables
- Scripts
- API Reference
- Deployment (Netlify, Self‑host, Builder MCP)
- Troubleshooting
- Security

---

## Features

- Multilingual, voice‑enabled chatbot (geolocation‑aware responses)
- Market Prices (Punjab) with robust offline/sample fallbacks
- Local Weather with safety alerts (temperature, humidity, wind)
- Quick Crop Advisory (summary, fertilizer, irrigation, pest hints)
- Image‑based Pest/Disease Detection (server‑side inference in preview)
- Minimal farmer login and gated “Working Suite”
- Smooth scrolling, fluid typography, and responsive layout across devices

## Architecture & Project Structure

- Single repo with SPA (client), API (server), and shared types.
- Vite serves React and mounts Express middleware for APIs during development (single port).
- Production build emits:
  - Client SPA → `dist/spa/`
  - Server bundle → `dist/server/node-build.mjs` (serves SPA and `/api/*`)

```
client/
  App.tsx                 # Router + providers
  global.css              # Tailwind theme, fluid type, smooth scroll
  pages/
    Layout.tsx            # Header, nav, footer, container
    Index.tsx             # Landing + Working Suite (chat, market, weather, pest)
    Login.tsx             # Farmer login/registration
  components/
    features/
      Chatbot.tsx         # Multilingual + voice chatbot
      MarketWidget.tsx    # Prices + weather with alerts & fallbacks
      PestDetector.tsx    # Server-side prediction in preview
      FeatureTiles.tsx    # Quick action tiles (scroll & events)
      AdvisoryWidget.tsx  # Weather-aware advisory form
    ui/                   # UI building blocks
  hooks/                  # useAuth, useSpeech, etc.
  lib/                    # utils

server/
  index.ts                # Express app; routes registration
  node-build.ts           # Production HTTP server (serves SPA + API)
  db.ts                   # Mongo connection + Farmer/Advisory models (in‑memory fallback)
  routes/                 # API handlers (auth, advisory, weather, market, predict, demo)

shared/
  api.ts                  # Shared DTOs/types across client & server

netlify/
  functions/api.ts        # Netlify Function wrapper for Express
netlify.toml              # Build + redirects to `/.netlify/functions/api`
```

## Requirements

- Node.js 18+ (or 20+ recommended)
- pnpm 8+ (preferred) or npm
- VS Code (recommended)

## Quick Start (VS Code)

1. Clone and install

```
git clone https://github.com/puspaldas05/Smart-Crop-Tools.git
cd Smart-Crop-Tools
pnpm install
```

2. Run the app (dev)

```
pnpm dev
```

- Open http://localhost:8080
- Login (top‑right) to access the Working Suite (Chatbot, Market & Weather, Pest Detector, Advisory)

3. Open and debug in VS Code

```
code .
```

- Use “JavaScript Debug Terminal” and run `pnpm dev`, or use this launch config to debug the production server:

```jsonc
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run built server",
      "program": "${workspaceFolder}/dist/server/node-build.mjs",
      "cwd": "${workspaceFolder}",
      "env": { "PORT": "3000" },
      "skipFiles": ["<node_internals>/**"],
    # Smart Crop Advisory System

    [![build](https://img.shields.io/badge/build-passing-brightgreen)](https://vercel.com) [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

    Quick Start: see `docs/running.md` for easy, copy-paste PowerShell commands to run, test and deploy this project.

    A concise, well-organized starter for a full-stack crop advisory web app (React + Express + TypeScript). This repo contains a client SPA, an Express API, and shared types. It uses Vite for development and build.

    Contents

    - Quick Start (copy-paste commands)
    - What this repo contains (high level)
    - Run / Build / Test commands (PowerShell-ready)
    - Deployment notes (Vercel + Netlify)
    - Troubleshooting & next steps

    See full developer docs in `docs/` (running.md, deploy-vercel.md).

    Why this repo is useful

    - Fast local development: Vite serves the SPA and mounts Express middleware on the same port (hot reload for both).
    - Easy serverless deployment: server code is prepared to be used as a serverless function (Vercel/Netlify) and as a standalone Node server.

    Quick Start (Windows PowerShell)

    1) Install dependencies

    ```powershell
    npm install
    ```

    2) Create a local .env (optional)

    ```powershell
    copy .env.example .env
    # Edit .env to set MONGODB_URI or any API keys
    ```

    3) Run in development (Vite + Express)

    ```powershell
    npm run dev
    # or force port: $env:PORT = "8080"; npm run dev
    ```

    4) Run tests and typecheck

    ```powershell
    npm run typecheck
    npm test
    ```

    5) Production build & start

    ```powershell
    npm run build
    npm start
    ```

    Project at-a-glance

    ```
    client/                # React SPA (Vite + TypeScript)
    server/                # Express API and server build entry
    shared/                # Shared TypeScript types between client & server
    api/                   # Vercel serverless wrapper (exports handler)
    dist/                  # Built artifacts (spa + server)
    docs/                  # Developer docs: running.md, deploy-vercel.md
    ```

    Important scripts (package.json)

    - `npm run dev` — start Vite dev server (with Express middleware)
    - `npm run build` — build client and server bundles (also lists dist/spa contents for diagnostics)
    - `npm start` — start the built Node server (`dist/server/node-build.mjs`)
    - `npm test` — run Vitest unit tests
    - `npm run typecheck` — run TypeScript compiler checks

    Environment variables

    - MONGODB_URI — MongoDB connection string (if absent, the app uses an in-memory fallback)
    - OPENWEATHER_API_KEY — optional weather API key
    - MARKET_API_URL / MARKET_API_KEY — optional market data source
    - HF_TOKEN / HF_MODEL — optional Hugging Face token/model for image prediction

    Deployment notes

    - Vercel: `vercel.json` and `api/index.ts` are included. Set `Build Command = npm run build` and `Output Directory = dist/spa`. Add env vars in the Vercel dashboard.
    - Netlify: `netlify.toml` and Netlify functions wrapper exist for Netlify functions.

    Troubleshooting quick checks

    - If Vite reports "Port X is in use" — either free the port or set `$env:PORT` before starting.
    - If you see `[db] MONGODB_URI not set. Using in-memory storage.` — set `MONGODB_URI` in `.env` or in your host's env vars.
    - If Vercel shows `404 NOT_FOUND` after deploy, check the build logs for `dist/spa/index.html` (CI outputs a listing). Also check function logs for serverless errors.

    CI

    - A GitHub Actions workflow is included at `.github/workflows/ci.yml` to run install, typecheck, tests, and build on push/PR to `main`.

    Contributing

    - Please open issues or PRs. See `docs/` for more context and deployment instructions.

    License

    - MIT

- Never commit secrets. Use environment variables in your hosting provider.
- Only minimal PII (name/phone) is collected in the demo. Review and harden before production.
- Add monitoring (e.g., Sentry) and WAF/Rate limits on `/api/*` in production.
