# 🌾 AgriVerse

**AI-powered smart farming platform for India's rural farmers.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/Puspaldas17/Smart-Crop-Tools)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Python-informational?style=flat-square)](PROJECT_DETAILS.md)
[![PWA](https://img.shields.io/badge/PWA-enabled-purple?style=flat-square)](https://web.dev/pwa/)
[![Languages](https://img.shields.io/badge/languages-EN%20%7C%20HI%20%7C%20OR-orange?style=flat-square)](client/i18n.ts)

> 📖 Full feature documentation, architecture, and roadmap → **[PROJECT_DETAILS.md](PROJECT_DETAILS.md)**

---

## Prerequisites

| Tool    | Version                                 |
| ------- | --------------------------------------- |
| Node.js | v18+ (v20+ recommended)                 |
| Python  | v3.10+                                  |
| npm     | Latest                                  |
| MongoDB | Optional (in-memory fallback available) |

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Puspaldas17/Smart-Crop-Tools.git
cd Smart-Crop-Tools

# 2. Install Node.js dependencies (frontend + backend)
npm install

# 3. Install Python AI service dependencies
cd ai_service
pip install -r requirements.txt
cd ..
```

> **Windows Note:** If you get Pillow errors: `pip install --upgrade pillow`

---

## Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

| Variable          | Description                     | Default                    |
| ----------------- | ------------------------------- | -------------------------- |
| `MONGODB_URI`     | MongoDB connection string       | In-memory fallback (empty) |
| `PORT`            | Express server port             | `8080`                     |
| `AI_SERVICE_URL`  | Python AI (FastAPI) service URL | `http://localhost:8000`    |
| `OPENWEATHER_KEY` | OpenWeatherMap API key          | Optional                   |
| `PING_MESSAGE`    | Custom ping response message    | `ping`                     |

> Without `MONGODB_URI`, the app runs in **Demo Mode** with a fast in-memory adapter — great for local testing.

---

## Running the Project

You need **two terminals** running simultaneously:

**Terminal 1 — Web App (React + Express)**

```bash
npm run dev
```

🟢 App: **http://localhost:8080**

**Terminal 2 — Python AI Service**

```bash
cd ai_service
python main.py
```

🟢 AI Service: **http://localhost:8000**

---

## Quick Verification

1. Open **http://localhost:8080**
2. Register or Login as a **Farmer** (Guest Mode also available — no sign-up needed)
3. Use the 🌐 button to switch language (EN / हिंदी / ଓଡ଼ିଆ)
4. Go to **Dashboard → Vet Inbox** to test the vet consultation system
5. Go to **Dashboard → Pest Detector** to verify AI service is connected
6. Go to **Dashboard → Analytics** to see interactive charts

Login as **Vet** or **Admin** to access their dedicated portals (`/vet`, `/admin`).

---

## Project Structure

```
AgriVerse/
│
├── client/                          # React 18 Frontend (Vite + TypeScript)
│   ├── App.tsx                      # Root: routing, providers, global fetch guard
│   ├── global.css                   # Design system (variables, animations, glassmorphism)
│   ├── i18n.ts                      # EN / Hindi / Odia translations (~1200 keys)
│   │
│   ├── components/
│   │   ├── features/                # Feature components
│   │   │   ├── Gamification/        # MissionCard, BadgesGallery, LeaderboardWidget
│   │   │   ├── Analytics.tsx        # 4-tab Recharts analytics dashboard
│   │   │   ├── Chatbot.tsx          # AI chatbot with voice input
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── PestAlertWidget.tsx  # Seasonal risk indicator
│   │   │   ├── PestDetector.tsx     # Image upload → AI disease detection
│   │   │   ├── MarketCard.tsx / MarketWidget.tsx
│   │   │   ├── WeatherCard.tsx
│   │   │   └── UpgradeModal.tsx
│   │   ├── home/                    # Landing page sections (Hero, Stats, CTA…)
│   │   └── ui/                      # shadcn/ui primitives (50+ components)
│   │
│   ├── pages/                       # Route-level pages
│   │   ├── Index.tsx                # Public landing page
│   │   ├── Login.tsx                # Register + login (email/password)
│   │   ├── Dashboard.tsx            # Farmer dashboard (7 tabs)
│   │   ├── VetDashboard.tsx         # Vet portal: consultations + advisories
│   │   ├── AdminDashboard.tsx       # Admin portal: users + KPIs + broadcast
│   │   ├── AMUManager.tsx           # Antimicrobial usage blockchain ledger
│   │   ├── Leaderboard.tsx          # Community XP rankings with podium
│   │   ├── Marketplace.tsx          # F2C produce marketplace
│   │   ├── CropCalendar.tsx         # Seasonal sowing & harvest calendar
│   │   ├── Profile.tsx              # Farmer profile + XP + badges
│   │   ├── Layout.tsx               # Shared layout + navigation
│   │   └── NotFound.tsx             # 404 page
│   │
│   ├── context/
│   │   └── GamificationContext.tsx  # XP, Level, Streak, Missions, Badges state
│   └── hooks/
│       ├── useAuth.tsx              # Auth context + farmer state
│       ├── use-toast.ts             # Toast utility
│       └── useInView.ts             # Intersection observer hook
│
├── server/                          # Node.js + Express 5 REST API
│   ├── index.ts                     # Server factory: all routes registered here
│   ├── db.ts                        # MongoDB/Mongoose models + in-memory adapter
│   ├── node-build.ts                # Production server entry (serves built SPA)
│   │
│   ├── routes/
│   │   ├── auth.ts                  # Register, login, guest, debug users
│   │   ├── farmers.ts               # Farmer CRUD, consultation request, vet advisories
│   │   ├── vet.ts                   # Vet consultations, update, advisories
│   │   ├── admin.ts                 # User management, broadcast, seed, overview
│   │   ├── advisory.ts              # Crop advisory creation
│   │   ├── analytics.ts             # Per-farmer analytics (trends, soil, weather)
│   │   ├── amu.ts                   # AMU drug log + blockchain ledger
│   │   ├── chat.ts                  # AI chatbot proxy
│   │   ├── predict.ts               # Image upload → AI pest/disease prediction
│   │   ├── market.ts                # Mandi market prices
│   │   ├── weather.ts               # Weather data
│   │   ├── profile.ts               # Advisory history + subscription
│   │   ├── neon.ts                  # Netlify Neon DB example route
│   │   └── demo.ts                  # Health/demo endpoint
│   │
│   ├── lib/
│   │   └── ledger.ts                # Hash-chain blockchain implementation
│   └── utils/
│       ├── cache.ts                 # Simple in-memory TTL cache
│       ├── http.ts                  # HTTP fetch helper
│       └── soilData.ts              # Soil data lookup utilities
│
├── ai_service/                      # Python FastAPI ML service
│   ├── main.py                      # Pest/disease detection endpoint
│   └── requirements.txt
│
├── api/
│   └── index.ts                     # Vercel serverless adapter
│
├── shared/                          # Shared TypeScript types
├── public/                          # PWA icons, manifest.json
├── docs/                            # Additional documentation
├── scripts/                         # Build / utility scripts
├── .env.example                     # Environment variable template
└── PROJECT_DETAILS.md               # Full feature documentation
```

---

## Available Routes

| Route          | Page                           | Access        |
| -------------- | ------------------------------ | ------------- |
| `/`            | Landing page                   | Public        |
| `/login`       | Farmer login / registration    | Public        |
| `/dashboard`   | Main farmer dashboard (7 tabs) | Farmer        |
| `/vet`         | Veterinary portal              | Vet           |
| `/admin`       | Admin portal                   | Admin         |
| `/amu`         | AMU blockchain ledger          | Vet / Admin   |
| `/leaderboard` | Community XP leaderboard       | Authenticated |
| `/marketplace` | F2C produce marketplace        | Authenticated |
| `/calendar`    | Crop sowing & harvest calendar | Authenticated |
| `/profile`     | Farmer profile + gamification  | Authenticated |

---

## API Endpoints Summary

| Group     | Endpoint prefix    | Description                           |
| --------- | ------------------ | ------------------------------------- |
| Auth      | `/api/auth/*`      | Register, login, guest login          |
| Farmers   | `/api/farmers/*`   | CRUD, consultations, vet advisories   |
| Vet       | `/api/vet/*`       | Consultations, advisory management    |
| Admin     | `/api/admin/*`     | User mgmt, broadcasts, overview KPIs  |
| Advisory  | `/api/advisories`  | Crop advisory generation              |
| Analytics | `/api/analytics/*` | Crop trends, soil health, weather     |
| AMU       | `/api/amu/*`       | Drug log, withdrawal tracking, ledger |
| Market    | `/api/market`      | Mandi market prices                   |
| Weather   | `/api/weather`     | Weather data                          |
| Chatbot   | `/api/chat`        | AI chatbot proxy                      |
| Pest AI   | `/api/predict`     | Image-based pest/disease prediction   |
| Profile   | `/api/profile/*`   | Advisory history, subscription        |

---

## Troubleshooting

| Problem                   | Solution                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| Port 8080 already in use  | PowerShell: `$env:PORT=9090; npm run dev`                           |
| AI Service not connecting | Make sure `python main.py` is running in `ai_service/` on port 8000 |
| Analytics shows no charts | Click the tab — uses smart mock fallback data locally               |
| MongoDB connection error  | Remove `MONGODB_URI` from `.env` to use in-memory mode              |
| PWA icons missing         | Run `npm run build` once to generate PWA assets                     |
| Consultations not showing | Ensure farmer is logged in (non-guest) and MongoDB is connected     |
| "Invalid Date" on cards   | Fixed — ensure you're on the latest commit (`.toObject()` patch)    |

---

## Author

**Puspal Das** · SOA University (ITER), Bhubaneswar, Odisha
GitHub: [@Puspaldas17](https://github.com/Puspaldas17)

---

## License

MIT License — see [LICENSE](LICENSE)
