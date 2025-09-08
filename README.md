# Smart Crop Advisory System

AI‑powered, multilingual guidance for farmers. The platform unifies a voice‑enabled chatbot, local weather with alerts, market prices, crop advisory, and image‑based pest diagnosis. Built mobile‑first, responsive, and resilient to poor connectivity.

• Demo (preview, non‑prod): open the Builder preview URL
• Repository: https://github.com/puspaldas05/Smart-Crop-Tools

---

## Table of Contents
- Features
- Architecture Overview
- Tech Stack
- Project Structure
- Getting Started (VS Code)
- Configuration (Environment Variables)
- Scripts
- API Reference
- Responsiveness & Accessibility
- Deployment
- Troubleshooting
- Roadmap
- Security & Privacy

---

## Features
- Multilingual, voice‑enabled AI Chatbot (geolocation‑aware responses)
- Real‑time Market Prices (Punjab) with robust offline/sample fallbacks
- Local Weather with safety alerts (temperature, humidity, wind)
- Quick Crop Advisory (summary, fertilizer, irrigation, pest hints)
- Image‑based Pest/Disease Detection (server‑side inference in preview for reliability)
- Minimal farmer login and gated “Working Suite”
- Smooth scrolling, fluid typography, and responsive layout across devices

## Architecture Overview
- Single repository with SPA (client), API (server), and shared types.
- Vite serves React and mounts Express middleware for APIs in development.
- Preview/CDN environments can restrict external requests; the app includes graceful fallbacks (sample data, server inference) so the UI remains functional.

## Tech Stack
- Frontend: React 18 (Vite), TailwindCSS, Radix UI primitives
- Backend: Express
- Database: MongoDB via Mongoose (Farmer, Advisory)
- AI: Server‑side image prediction endpoint (upgradeable to a real model service)

## Project Structure
```
client/
  App.tsx                 # Router + providers
  global.css              # Tailwind theme, fluid type, smooth scroll
  pages/
    Layout.tsx            # Header, nav, footer, container
    Index.tsx             # Landing + Proposed Solution + Working Suite
    Login.tsx             # Farmer login/registration
    Docs.tsx              # In‑app README viewer (/docs)
  components/
    features/
      Chatbot.tsx         # Multilingual + voice chatbot
      MarketWidget.tsx    # Prices table + weather with alerts & fallbacks
      PestDetector.tsx    # Server‑only prediction in preview
      FeatureTiles.tsx    # Quick action tiles (scroll & events)
      AdvisoryWidget.tsx  # Weather‑aware advisory form
    ui/                   # Shadcn UI building blocks
  hooks/                  # useAuth, useSpeech, etc.
  lib/                    # utils

server/
  index.ts                # Express app; routes registration
  db.ts                   # Mongo connection + models
  routes/
    auth.ts               # POST /api/auth/farmer
    farmers.ts            # Example CRUD
    advisory.ts           # POST /api/advisories
    weather.ts            # GET /api/weather (Open‑Meteo fallback)
    market.ts             # GET /api/market (sample/proxy)
    predict.ts            # POST /api/predict (server prediction)

shared/
  api.ts                  # Shared DTOs/types across client & server

vite.config.ts            # Vite + Express integration (dev port 8080)
vite.config.server.ts     # Server build config
postcss.config.js         # Tailwind/PostCSS
 tailwind.config.ts       # Custom screens & tokens
```

## Getting Started (VS Code)
1) Clone
```
git clone https://github.com/puspaldas05/Smart-Crop-Tools.git
cd Smart-Crop-Tools
```
2) Install dependencies (pnpm)
```
pnpm install --no-frozen-lockfile
```
3) (Optional) Configure .env at repo root
```
MONGODB_URI=your-mongodb-uri
OPENWEATHER_API_KEY=your-openweather-key
MARKET_API_URL=your-market-api-url
```
4) Run the app
```
pnpm dev
```
- Open http://localhost:8080
- Use Login (top‑right) to access the Working Suite (Chatbot, Market & Weather, Pest Detector, Advisory)
5) Open in VS Code
```
code .
```
Recommended extensions: ESLint, Tailwind CSS IntelliSense.

## Configuration (Environment Variables)
- MONGODB_URI: MongoDB connection string (enables persistence)
- OPENWEATHER_API_KEY: optional key for weather providers (server falls back to Open‑Meteo)
- MARKET_API_URL: optional external market API/proxy (server returns curated sample if unset)

## Scripts
- pnpm dev — run SPA + Express APIs in Vite dev mode (port 8080)
- pnpm build — build client and server bundles
- pnpm start — run the built server bundle
- pnpm typecheck — TypeScript checks

## API Reference
- POST /api/auth/farmer — upsert farmer
  - body: { name: string; phone: string; soilType?: string; landSize?: number; language?: string; location?: { lat?: number; lon?: number; village?: string; state?: string } }
  - returns: Farmer document
- GET /api/market?commodity&state — market prices
  - returns: { source: "live" | "sample"; items: { commodity, state, mandi, unit, price }[] }
- GET /api/weather?lat&lon — local weather
  - returns: { tempC, humidity, windKph, conditions }
- POST /api/advisories — generate advisory
  - body: { crop: string; lat: number; lon: number }
  - returns: { summary, fertilizer, irrigation, pest, weather }
- POST /api/predict (multipart form‑data: image)
  - returns: { source: "server-mock" | "server"; predictions: { className, probability }[] }

## Responsiveness & Accessibility
- Breakpoints: xs 480 • md 768 • lg 1024 • xl 1440 • 2xl 1920+
- Fluid typography via CSS clamp() in client/global.css; images/media are max‑width:100%, height:auto
- Smooth scrolling enabled, horizontal overflow prevented; semantic HTML and sensible contrast

## Deployment
- Netlify or Vercel via Builder MCP
  - Click Open MCP popover and connect Netlify or Vercel, then deploy
  - Previews are not production URLs; use MCP deploys for stable links

## Troubleshooting
- Network‑restricted previews: app falls back to server prediction and sample market data to avoid errors
- Weather blocked/slow: a friendly message is shown; refresh via the button in the Weather panel
- Mongo not configured: APIs continue with sample/in‑memory behavior where applicable
- Port conflicts: update server.port in vite.config.ts

## Roadmap
- Replace server mock predictor with a production model service
- Add persistent auth/session and secure farmer profile storage
- Integrate real market and weather providers with keys/secrets
- Add i18n strings for full UI coverage and RTL support where needed
- Improve e2e tests and monitoring (Sentry MCP)

## Security & Privacy
- Do not commit secrets. Use platform environment variables for previews/deploys
- Minimal PII for demos (name/phone). Review and align with your data policies before production
