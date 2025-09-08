# Smart Crop Advisory (MERN + Vite + Express)

A production-ready, responsive web app for farmers: AI chatbot with multilingual voice, personalized crop/fertilizer/pest advisory, real-time Punjab market prices and local weather alerts, and image-based pest detection (with server fallback).

## Highlights

- Fully responsive: xs 480, md 768, lg 1024, xl 1440, 2xl 1920+ (Tailwind custom screens)
- MERN-ready backend: Express + MongoDB (Mongoose)
- Shared types between client and server
- Offline-friendly patterns and graceful fallbacks

## Tech Stack

- Frontend: React 18, Vite, TailwindCSS
- UI: Radix primitives + custom components
- Backend: Express (integrated with Vite dev server)
- DB: MongoDB via Mongoose
- AI: TFJS MobileNet (client) with server-side fallback

## Features

- Farmer auth: POST /api/auth/farmer upserts by phone; session stored locally
- Tools Suite (requires login)
  - AI Chatbot: voice input + TTS; weather-aware responses
  - Market & Weather: Punjab mandi prices + local weather alerts
  - Pest Detector: client TFJS; server fallback /api/predict
  - Quick Crop Advisory: weather-informed advisory summary

## Project Structure

```
client/                   # React SPA
  App.tsx                # Router + providers
  pages/
    Layout.tsx           # Header/Footer layout
    Index.tsx            # Landing + Tools Suite
    Login.tsx            # Farmer login/registration
  components/
    features/
      Chatbot.tsx
      MarketWidget.tsx
      PestDetector.tsx
      FeatureTiles.tsx
      AdvisoryWidget.tsx
    ui/                  # Shadcn components
  hooks/                 # useAuth, useSpeech
  lib/                   # utils
  global.css             # Tailwind theme + responsive base

server/                   # Express API
  index.ts               # Express setup + routes
  db.ts                  # Mongoose connection + models (Farmer, Advisory)
  routes/
    auth.ts              # POST /api/auth/farmer
    farmers.ts           # CRUD example
    advisory.ts          # POST /api/advisories
    weather.ts           # GET /api/weather (Open-Meteo fallback)
    market.ts            # GET /api/market (Punjab sample or proxy)
    predict.ts           # POST /api/predict (server fallback)

shared/
  api.ts                 # Shared DTOs

vite.config.ts           # Vite + Express integration
vite.config.server.ts    # Server build config
postcss.config.js        # Tailwind/PostCSS
 tailwind.config.ts      # Custom breakpoints + tokens
```

## Prerequisites

- Node.js 18+
- pnpm (preferred) — project ships with packageManager metadata

## Local Setup (VS Code)

1. Clone
   - Using GitHub: `git clone <your-repo-url>`
   - Or download the zip from Builder and extract
2. Install deps
   - `pnpm install --no-frozen-lockfile`
3. Configure environment (optional but recommended)
   - Create a `.env` file at repo root and set:
     - `MONGODB_URI=<your mongodb connection string>`
     - `OPENWEATHER_API_KEY=<optional openweather key>`
     - `MARKET_API_URL=<optional market api proxy>`
4. Run dev server
   - `pnpm dev`
   - App available at: http://localhost:8080
5. Open in VS Code
   - `code .`
   - Recommended extensions: ESLint, Tailwind CSS IntelliSense

## Build & Run (Production)

- Build: `pnpm build`
- Start: `pnpm start`

## Responsive Design

- Tailwind custom screens (tailwind.config.ts):
  - xs: 480px, md: 768px, lg: 1024px, xl: 1440px, 2xl: 1920px
- Global typography clamps in `client/global.css` ensure readable text across devices
- All media are responsive (`max-width:100%; height:auto`)

## API Endpoints

- POST `/api/auth/farmer` → upsert farmer { name, phone, soilType?, landSize?, language?, location? }
- GET `/api/weather?lat&lon` → weather with Open-Meteo fallback
- GET `/api/market?commodity&state` → prices (Punjab sample if no external API)
- POST `/api/advisories` → generates weather-informed advisory
- POST `/api/predict` (multipart form-data: image) → server-side prediction fallback

## Notes on AI Models

- Client TFJS model fetch may be restricted by CSP/CDN. The app falls back to `/api/predict` so the UI keeps working.
- For higher accuracy, replace server mock with a real model service.

## Environment & Secrets

- Do not commit secrets.
- Use Builder Settings to set environment variables in cloud previews.

## Deployment

- Netlify or Vercel via MCP (Builder). Connect MCP and trigger deploy.

## Troubleshooting

- If weather fails without OPENWEATHER_API_KEY, Open‑Meteo fallback is used.
- If TFJS model fails to fetch, server fallback is used automatically.
- Merge conflicts: this repo resolved to the Fusion starter layout and paths (`client/*`).
