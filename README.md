# Smart Crop Advisory System

A production‑ready, full‑stack MERN application that delivers data‑driven, multilingual guidance for farmers. It unifies a voice‑enabled chatbot, local weather with alerts, market prices, quick crop advisory, and image‑based pest diagnosis in a single responsive web app.

- Frontend: React (Vite) + TailwindCSS + Radix UI
- Backend: Express (integrated with Vite in dev) + shared TypeScript types
- Database: MongoDB via Mongoose (with in‑memory fallback for local demos)
- ML: Server endpoint with optional Hugging Face Inference API

---

## TL;DR (Run it)

- Install: `pnpm install`
- Dev: `pnpm dev` → http://localhost:8080
- Build: `pnpm build`
- Start (after build): `node dist/server/node-build.mjs` → http://localhost:3000 (override with `PORT`)

## Ports

- Dev (Vite + Express middleware): http://localhost:8080
- API in dev: same origin, path‑prefixed `/api/*`
- Production server: defaults to http://localhost:3000 (set `PORT` to change)

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

1) Install and run (dev)

```
pnpm install
pnpm dev
```

- Open http://localhost:8080
- Login (top‑right) to access the Working Suite (Chatbot, Market & Weather, Pest Detector, Advisory)

2) Run in VS Code

- Open the folder in VS Code
- Option A: Use “JavaScript Debug Terminal”, run `pnpm dev` and navigate to http://localhost:8080
- Option B: Debug the production server (after `pnpm build`) with this launch config:

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
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Environment Variables

All are optional for local development; sensible fallbacks are included.

- MONGODB_URI — enables persistence (without it, an in‑memory store is used)
- OPENWEATHER_API_KEY — improves weather fidelity (fallback to Open‑Meteo without key)
- MARKET_API_URL — external market API/proxy returning an array of items
- MARKET_API_KEY — optional bearer token for MARKET_API_URL
- HF_TOKEN or HUGGINGFACE_TOKEN — enables server image classification via Hugging Face
- HF_MODEL — optional, defaults to `microsoft/resnet-50`

Create a `.env` file at the repo root if desired:

```
MONGODB_URI=...
OPENWEATHER_API_KEY=...
MARKET_API_URL=...
MARKET_API_KEY=...
HF_TOKEN=...
HF_MODEL=microsoft/resnet-50
```

## Scripts

- `pnpm dev` — Vite dev server (Express middleware) at http://localhost:8080
- `pnpm build` — Build client and server bundles
- `pnpm start` — Start the built server (`dist/server/node-build.mjs`) on `PORT` (defaults to 3000)
- `pnpm typecheck` — TypeScript checks
- `pnpm test` — Run Vitest tests

## API Reference (selected)

- `POST /api/auth/farmer` — upsert farmer
  - body: `{ name, phone, soilType?, landSize?, language?, location? }`
- `GET /api/market?commodity&state` — market prices (live or sample)
- `GET /api/weather?lat&lon` — local weather (OpenWeather if key, else Open‑Meteo)
- `POST /api/advisories` — generate advisory `{ crop, lat, lon }`
- `POST /api/predict` — form‑data `image` file → server mock or Hugging Face

## Deployment

### Option A: Netlify (recommended)

This repository is already configured for Netlify via `netlify.toml` and `netlify/functions/api.ts`.

Steps:

1. Push your code to GitHub/GitLab.
2. In Netlify, “Add new site” → “Import from Git”. Select this repository.
3. Build settings (auto‑detected from `netlify.toml`):
   - Build command: `npm run build:client`
   - Publish directory: `dist/spa`
   - Functions directory: `netlify/functions`
4. Set environment variables (if needed): MONGODB_URI, OPENWEATHER_API_KEY, MARKET_API_URL, MARKET_API_KEY, HF_TOKEN, HF_MODEL.
5. Deploy. Your SPA is served from `dist/spa`, and all `/api/*` routes are redirected to `/.netlify/functions/api` (Express wrapped by `serverless-http`).

### Option B: Self‑host (Node server)

1. Build:

```
pnpm build
```

2. Set environment variables on the host (as needed).
3. Start the server:

```
node dist/server/node-build.mjs
```

4. Serve behind a reverse proxy (e.g., Nginx) and terminate TLS there if desired.

### Option C: Builder MCP one‑click deploys (Netlify or Vercel)

- In Builder.io Projects, click [Open MCP popover], connect Netlify or Vercel, and trigger a deploy.
- For Vercel, ensure your project includes serverless wiring for Express. This repo ships first‑class Netlify support; Vercel may require adding a serverless function that wraps `createServer()`.

## Troubleshooting

- Dev server/port: Default dev URL is http://localhost:8080 (configured in `vite.config.ts`).
- “Cannot find module dist/server/node-build.mjs” when starting prod: run `pnpm build` first.
- No MongoDB configured: the app falls back to in‑memory storage so you can demo all flows.
- Weather blocked/slow: the app automatically uses Open‑Meteo; the UI shows a friendly status.
- Large bundles: consider dynamic imports or `manualChunks` if you need smaller chunks for production.

## Security

- Never commit secrets. Use environment variables in your hosting provider.
- Only minimal PII (name/phone) is collected in the demo. Review and harden before production.
- Add monitoring (e.g., Sentry) and WAF/Rate limits on `/api/*` in production.
