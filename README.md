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
    # Smart Crop Advisory — Quick & Simple

    What it is
    - Small full-stack app: React (Vite) frontend + Express API (TypeScript).
    - Local dev uses Vite and mounts Express middleware so frontend and API work together.

    Quick start (PowerShell)
    ```powershell
    # 1. Install
    npm install

    # 2. Optional: copy env
    copy .env.example .env

    # 3. Start dev server (Vite + Express)
    npm run dev

    # 4. Run tests and typecheck
    npm run typecheck
    npm test

    # 5. Build and start (production)
    npm run build
    npm start
    ```

    Where to find more
    - Running & deploy instructions: `docs/running.md`
    - Vercel guide: `docs/deploy-vercel.md`

    Important notes
    - If `MONGODB_URI` is not set, the app uses an in-memory DB for demo data.
    - If port 8080 is busy, set `$env:PORT` before `npm run dev`.
    - CI builds run typecheck, tests, and build (`.github/workflows/ci.yml`).

    Files & folders (top-level)
    - `client/` — React app
    - `server/` — Express routes + server entry
    - `shared/` — shared TypeScript types
    - `api/` — serverless wrapper for Vercel
    - `docs/` — docs and deployment guides

    Need help?
    - Paste Vercel deployment logs here if you see `404 NOT_FOUND` and I'll help debug.

    License: MIT


- Never commit secrets. Use environment variables in your hosting provider.
- Only minimal PII (name/phone) is collected in the demo. Review and harden before production.
- Add monitoring (e.g., Sentry) and WAF/Rate limits on `/api/*` in production.
