# 🌾 AgriVerse

**AI-powered smart farming platform for India's rural farmers.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/Puspaldas17/Smart-Crop-Tools)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Python-informational?style=flat-square)](PROJECT_DETAILS.md)
[![PWA](https://img.shields.io/badge/PWA-enabled-purple?style=flat-square)](https://web.dev/pwa/)

> 📖 For all features, architecture, and roadmap → **[PROJECT_DETAILS.md](PROJECT_DETAILS.md)**

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

| Variable         | Description               | Default                 |
| ---------------- | ------------------------- | ----------------------- |
| `MONGODB_URI`    | MongoDB connection string | In-memory fallback      |
| `PORT`           | Server port               | `8080`                  |
| `AI_SERVICE_URL` | Python AI service URL     | `http://localhost:8000` |

> Without `MONGODB_URI`, the app runs in **Demo Mode** with in-memory data — great for local testing.

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

## Verification

1. Open **http://localhost:8080**
2. Register/Login as a Farmer (Guest Mode also available)
3. Use the 🌐 button to switch language (EN / Hindi / Odia)
4. Go to **Dashboard → Pest Detector** to verify AI service is connected
5. Go to **Dashboard → Analytics** to see charts

---

## Project Structure

```
AgriVerse/
│
├── client/                          # React 18 Frontend (Vite + TypeScript)
│   ├── components/
│   │   ├── features/                # Feature components
│   │   │   ├── Gamification/        # MissionCard, BadgesGallery, LeaderboardWidget
│   │   │   ├── Analytics.tsx        # Charts (Recharts) — 4 tabs
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── PestAlertWidget.tsx
│   │   │   ├── PestDetector.tsx
│   │   │   ├── UpgradeModal.tsx
│   │   │   ├── Chatbot.tsx
│   │   │   ├── MarketCard.tsx
│   │   │   └── WeatherCard.tsx
│   │   └── home/                    # Landing page sections (Hero, Stats, CTA…)
│   │
│   ├── pages/                       # Route-level pages
│   │   ├── Dashboard.tsx            # Main dashboard (6 tabs)
│   │   ├── Leaderboard.tsx          # Full leaderboard with podium
│   │   ├── Marketplace.tsx          # F2C produce marketplace
│   │   ├── CropCalendar.tsx         # Sowing/harvest calendar
│   │   ├── Profile.tsx              # Farmer profile + XP stats
│   │   ├── VetDashboard.tsx         # Veterinary portal
│   │   ├── AdminDashboard.tsx       # Admin portal
│   │   └── Layout.tsx               # Shared layout + navigation
│   │
│   ├── context/
│   │   └── GamificationContext.tsx  # XP, Level, Streak, Missions, Badges state
│   │
│   └── i18n.ts                      # EN / Hindi / Odia translations
│
├── server/                          # Node.js + Express 5 REST API
│   ├── routes/                      # /auth, /advisory, /analytics, /market, /amu
│   └── db.ts                        # MongoDB / in-memory adapter
│
├── ai_service/                      # Python FastAPI ML service
│   ├── main.py                      # Pest/disease detection endpoint
│   └── requirements.txt
│
├── shared/                          # Shared TypeScript types
├── public/                          # PWA icons, manifest.json
├── .env.example                     # Environment variable template
└── PROJECT_DETAILS.md               # Full feature documentation
```

---

## Available Routes

| Route          | Page                        |
| -------------- | --------------------------- |
| `/`            | Landing page                |
| `/login`       | Farmer login / registration |
| `/dashboard`   | Main dashboard              |
| `/leaderboard` | Full leaderboard            |
| `/marketplace` | F2C marketplace             |
| `/calendar`    | Crop sowing calendar        |
| `/profile`     | Farmer profile              |
| `/vet`         | Veterinary portal           |
| `/admin`       | Admin portal                |

---

## Troubleshooting

| Problem                   | Solution                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| Port 8080 already in use  | PowerShell: `$env:PORT=9090; npm run dev`                           |
| AI Service not connecting | Make sure `python main.py` is running in `ai_service/` on port 8000 |
| Analytics shows no charts | Click the tab — it uses smart mock fallback data locally            |
| MongoDB connection error  | Remove `MONGODB_URI` from `.env` to use in-memory mode              |
| PWA icons missing         | Run `npm run build` once to generate PWA assets                     |

---

## Author

**Puspal Das** · SOA University (ITER), Bhubaneswar, Odisha  
GitHub: [@Puspaldas17](https://github.com/Puspaldas17)

---

## License

MIT License — see [LICENSE](LICENSE)
