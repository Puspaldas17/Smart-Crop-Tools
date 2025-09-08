# Smart Crop Advisory System

AI‑powered, multilingual guidance for farmers. This app brings together a voice‑enabled chatbot, market prices, local weather alerts, crop advisory, and image‑based pest/disease detection. Built for reliability in low‑connectivity environments and fully responsive across devices.

- Live preview (non‑prod): open the running app from Builder preview
- Repository: https://github.com/puspaldas05/Smart-Crop-Tools

## Features

- Multilingual AI Chatbot (voice input + TTS) with location‑aware answers
- Market Prices (Punjab) with resilient fallbacks and filtering
- Local Weather with alerts (extreme temperature, humidity, wind)
- Quick Crop Advisory generated from crop + location
- Image‑based Pest/Disease Detection (server‑side inference in preview)
- Farmer login/identity (minimal) and Tools gating
- Smooth scrolling, responsive typography, and accessibility focus

## Tech Stack

- Frontend: React 18 (Vite) + TailwindCSS + Radix UI primitives
- Backend: Express (mounted in Vite dev server for local DX)
- Database: MongoDB via Mongoose (Farmer, Advisory models)
- AI: server‑side prediction endpoint; can be replaced with real model service

## Architecture

- Single repo with client (SPA), server (API), and shared types.
- Vite dev server serves the SPA and proxies/embeds Express for APIs.
- Preview environments can block external model/CDN access; the app uses graceful fallbacks to keep working.

## File Structure


client/
  App.tsx
  global.css
  pages/
    Layout.tsx            # Header, nav, footer, container
    Index.tsx             # Landing + Proposed Solution + Working Suite
    Login.tsx             # Farmer login/registration
    Docs.tsx              # In‑app README viewer (/docs)
  components/
    features/
      Chatbot.tsx         # Multilingual + voice chatbot
      MarketWidget.tsx    # Prices table + weather panel with alerts
      PestDetector.tsx    # Server‑only image prediction in preview
      FeatureTiles.tsx    # Quick actions (scroll + events)
      AdvisoryWidget.tsx  # Weather‑aware advisory form
    ui/                   # Shadcn UI components
  hooks/                  # useAuth, useSpeech, etc.
  lib/                    # utils

server/
  index.ts                # Express app; routes registration
  db.ts                   # Mongo connection + Farmer/Advisory models
  routes/
    auth.ts               # POST /api/auth/farmer
    farmers.ts            # Example CRUD
    advisory.ts           # POST /api/advisories
    weather.ts            # GET /api/weather (Open‑Meteo fallback)
    market.ts             # GET /api/market (sample/proxy)
    predict.ts            # POST /api/predict (server prediction)

shared/
  api.ts                  # Shared DTOs/types

vite.config.ts            # Vite + Express integration (dev port 8080)
vite.config.server.ts     # Server build config
postcss.config.js         # Tailwind/PostCSS
 tailwind.config.ts       # Custom breakpoints + tokens
```

## Responsive Design

- Tailwind custom screens: xs 480 • md 768 • lg 1024 • xl 1440 • 2xl 1920+
- Fluid typography via CSS clamp() in client/global.css
- Images/video/svg/canvas are responsive (max‑width:100%, height:auto)

## API Endpoints

- POST `/api/auth/farmer` → upsert farmer { name, phone, soilType?, landSize?, language?, location? }
- GET `/api/market?commodity&state` → prices (Punjab sample used if external API not configured)
- GET `/api/weather?lat&lon` → local weather (Open‑Meteo fallback if no key)
- POST `/api/advisories` → generates advisory
- POST `/api/predict` (multipart form‑data: image) → server‑side prediction

## Environment Variables (optional)

Create a `.env` at repo root for local development if you need real services:

- `MONGODB_URI` — MongoDB connection string
- `OPENWEATHER_API_KEY` — for weather providers that need a key (fallbacks exist)
- `MARKET_API_URL` — optional external market API/proxy

## Getting Started (VS Code)

1. Clone the repository

```
git clone https://github.com/puspaldas05/Smart-Crop-Tools.git
cd Smart-Crop-Tools
```

2. Install dependencies (pnpm)

```
pnpm install --no-frozen-lockfile
```

3. (Optional) Configure `.env`

```
MONGODB_URI=your-mongodb-uri
OPENWEATHER_API_KEY=your-openweather-key
MARKET_API_URL=your-market-api-url
```

4. Run the app

```
pnpm dev
```

- Open http://localhost:8080
- Login (top‑right) to access the Working Suite (Chatbot, Market & Weather, Pest Detector, Advisory)

5. Open in VS Code

```
code .
```

Recommended extensions: ESLint, Tailwind CSS IntelliSense.

## Scripts

- `pnpm dev` — run SPA + Express APIs in Vite dev mode (port 8080)
- `pnpm build` — build client and server bundles
- `pnpm start` — run the built server bundle
- `pnpm typecheck` — TypeScript project‑wide checks

## Deployment (MCP)

- Netlify or Vercel via Builder MCP: click Open MCP popover and connect the provider, then deploy.
- Note: Builder preview links are not production‑grade URLs.

## Troubleshooting

- Network‑restricted previews: the app auto‑falls back (server prediction, sample market data) to avoid errors.
- Weather blocked/slow: a user‑friendly message is shown instead of failing.
- Mongo not configured: APIs continue with sample/in‑memory behavior where applicable.
- Port conflicts: adjust `server.port` in vite.config.ts.

## Security & Privacy

- Do not commit secrets. Use platform environment variables for previews/deploys.
- Minimal PII (farmer name/phone) for demos; adapt to your data policies before production.

---
Maintained by The Compilers — Smart India Hackathon 2025.
