# Smart Crop Advisory (MERN + Vite + Express)

# Smart Crop Advisory System

AI‑powered, multilingual guidance for farmers: chatbot with voice, market prices, local weather alerts, crop advisory, and image‑based pest detection. Fully responsive and production‑ready.

## Highlights

- Responsive Tailwind breakpoints: xs 480 • md 768 • lg 1024 • xl 1440 • 2xl 1920+
- MERN architecture: React + Vite + Tailwind, Express backend, MongoDB via Mongoose
- Graceful offline/network fallbacks; smooth scrolling; accessibility‑minded UI

## How it works (features)

- Login/Identity: minimal farmer profile is stored client‑side; server exposes `/api/auth/farmer` upsert for persistence.
- Chatbot (client/components/features/Chatbot.tsx): multilingual + voice I/O; geolocation augments prompts (weather‑aware);
  responds via `/api/chat`.
- Market & Weather (…/MarketWidget.tsx): fetches `/api/market` and `/api/weather`. If the network is restricted, it shows
  a warning and seamlessly falls back to sample data (no UI breakage).
- Quick Crop Advisory (…/AdvisoryWidget.tsx): posts crop + location to `/api/advisories` and renders a concise plan
  (summary, fertilizer, irrigation, pest).
- Pest Detector (…/PestDetector.tsx): server‑only prediction in this preview for maximum reliability. Uploads an
  image to `/api/predict` and renders top classes. This avoids TFJS model fetches that can be blocked by CSP/CDN.

## Tech Stack

- Frontend: React 18, Vite, TailwindCSS, Radix primitives
- Backend: Express (mounted inside Vite dev server)
- Database: MongoDB (Mongoose)
- AI: server‑side prediction endpoint (can be upgraded to a real model service)

## File structure

```
client/
  App.tsx
  pages/
    Layout.tsx            # Header, nav, footer, container
    Index.tsx             # Landing + Proposed Solution + Tools Suite
    Login.tsx             # Farmer login/registration
  components/
    features/
      Chatbot.tsx         # Multilingual + voice chatbot
      MarketWidget.tsx    # Market table + weather panel with alerts
      PestDetector.tsx    # Server‑only image prediction in preview
      FeatureTiles.tsx    # Quick actions (scroll + events)
      AdvisoryWidget.tsx  # Weather‑aware advisory form
    ui/                   # Shadcn UI building blocks
  hooks/                  # useAuth, useSpeech, etc.
  lib/                    # utils
  global.css              # Tailwind theme + responsive base

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
  api.ts                  # Shared DTOs

vite.config.ts            # Vite + Express integration (dev port 8080)
vite.config.server.ts     # Server build config
postcss.config.js         # Tailwind/PostCSS
 tailwind.config.ts       # Custom screens + tokens
```

## Prerequisites

- Node.js 18+
- pnpm (project specifies the version via packageManager)

## Run locally in VS Code (step‑by‑step)

1) Get the code
- Option A: Download Project (#project-download) and extract
- Option B: Clone with Git in VS Code (Command Palette → Git: Clone…) and select the repo URL

2) Install dependencies
- `pnpm install --no-frozen-lockfile`

3) Configure environment (optional)
- Create `.env` at repo root if needed:
  - `MONGODB_URI=...` (Mongo connection string)
  - `OPENWEATHER_API_KEY=...` (optional)
  - `MARKET_API_URL=...` (optional external market API)

4) Start the app
- `pnpm dev`
- Open http://localhost:8080

5) Open in VS Code
- From a terminal: `code .` (or File → Open Folder…)
- Recommended extensions: ESLint, Tailwind CSS IntelliSense

## Production build

- Build: `pnpm build`
- Start (server bundle): `pnpm start`

## API summary

- POST `/api/auth/farmer` → upsert farmer { name, phone, soilType?, landSize?, language?, location? }
- GET `/api/weather?lat&lon` → weather (Open‑Meteo fallback if no key)
- GET `/api/market?commodity&state` → market prices (Punjab sample if offline)
- POST `/api/advisories` → generate advisory
- POST `/api/predict` (form‑data: image) → server prediction

## Responsiveness

- Tailwind screens: xs 480 • md 768 • lg 1024 • xl 1440 • 2xl 1920+
- Fluid typography via clamp() in `client/global.css`; media are max‑width:100%

## Deployment (MCP)

- Netlify or Vercel: click [Open MCP popover](#open-mcp-popover) and connect the provider, then deploy.
- Tip: previews are not production URLs; use MCP deploys for live links.

## Troubleshooting

- Network‑restricted environments: the app auto‑falls back (e.g., server prediction, sample market data).
- Mongo not configured: APIs still work with in‑memory/sample behavior where applicable.
- Port conflicts: update `server.port` in `vite.config.ts`.
