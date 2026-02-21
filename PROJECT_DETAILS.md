# AgriVerse — Project Overview & Feature Documentation

<div align="center">

**Empowering India's 140 Million Farmers with AI, Gamification & Real-Time Intelligence**

_A full-stack, multilingual, offline-capable smart farming platform_

---

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/Puspaldas17/Smart-Crop-Tools)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-enabled-purple?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Languages](https://img.shields.io/badge/languages-EN%20%7C%20HI%20%7C%20OR-orange?style=flat-square)](client/i18n.ts)

</div>

---

## Executive Summary

AgriVerse is a comprehensive, AI-powered digital farming ecosystem designed from the ground up for India's small and marginal farmers. It unifies crop advisory, real-time market intelligence, AI-driven pest detection, gamified learning, and community commerce into a single platform — accessible in three languages, installable offline, and usable without high digital literacy.

---

## Problem Statement

India's agricultural sector accounts for 18% of GDP and employs 44% of the workforce, yet the farmer at the center of this ecosystem remains chronically underserved by technology.

**Key pain points addressed by AgriVerse:**

| Challenge                          | Scale                                                    |
| ---------------------------------- | -------------------------------------------------------- |
| Lack of personalized crop advisory | 140M+ small & marginal farmers have no agronomist access |
| Market price opacity               | Middlemen capture 30–40% of farm-gate value              |
| Late pest & disease detection      | Annual crop losses estimated at ₹80,000+ crore           |
| Digital accessibility barriers     | Low literacy + inconsistent internet in rural areas      |
| Fragmented tooling                 | No single platform integrates weather, soil, market & AI |

**AgriVerse solves all five — in one unified, accessible application.**

---

## Platform Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   React 18 Frontend (Vite)                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Dashboard   │  │  Leaderboard │  │    Marketplace     │  │
│  │  (6 Tabs)    │  │  / Calendar  │  │    / Profile       │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                 │                   │              │
│  ┌──────▼─────────────────▼───────────────────▼───────────┐  │
│  │          GamificationContext  (XP · Level · Streak)    │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │  REST API (Express 5)
┌───────────────────────────▼──────────────────────────────────┐
│                  Node.js / Express Backend                    │
│         /api/auth  ·  /api/advisory  ·  /api/analytics       │
│         /api/market  ·  /api/amu                             │
└───────────────┬──────────────────────────────────────────────┘
                │                        │
   ┌────────────▼──────────┐  ┌──────────▼──────────────────┐
   │  MongoDB + Mongoose   │  │  Python AI Service           │
   │  (In-Memory Fallback) │  │  FastAPI + TensorFlow/CNN   │
   └───────────────────────┘  └─────────────────────────────┘
```

---

## Technology Stack

| Layer                    | Technology                          | Purpose                                   |
| ------------------------ | ----------------------------------- | ----------------------------------------- |
| **Frontend Framework**   | React 18 + Vite + TypeScript        | Core UI with fast HMR                     |
| **Styling**              | TailwindCSS + CSS Custom Properties | Design system + dark mode                 |
| **UI Primitives**        | Radix UI + shadcn/ui                | Accessible, headless components           |
| **Data Visualization**   | Recharts                            | Analytics charts (Line, Bar, Area, Radar) |
| **Client Routing**       | React Router v6                     | SPA page navigation                       |
| **State Management**     | React Context API + `localStorage`  | Auth, gamification, streak persistence    |
| **Internationalization** | react-i18next                       | EN / Hindi / Odia translation             |
| **Backend Runtime**      | Node.js + Express 5                 | REST API server                           |
| **Database**             | MongoDB + Mongoose                  | Persistent data storage                   |
| **Demo Fallback**        | Custom in-memory adapter            | Full functionality without MongoDB        |
| **Authentication**       | Custom JWT                          | Role-based session management             |
| **AI Service**           | Python + FastAPI                    | ML model API server                       |
| **Machine Learning**     | TensorFlow / PyTorch + CNN          | Crop disease image classification         |
| **PWA**                  | vite-plugin-pwa + Workbox           | Offline caching + installability          |
| **Icons**                | Lucide React                        | Consistent iconography                    |
| **Alerts**               | Sonner                              | Non-blocking toast notifications          |

---

## Pages & Routes

| Route          | Component            | Description                             |
| -------------- | -------------------- | --------------------------------------- |
| `/`            | `Index.tsx`          | Public landing page with featured tools |
| `/login`       | `Login.tsx`          | Registration and authentication         |
| `/dashboard`   | `Dashboard.tsx`      | Core farmer dashboard (6 tabs)          |
| `/leaderboard` | `Leaderboard.tsx`    | Community XP rankings with podium       |
| `/marketplace` | `Marketplace.tsx`    | Farmer-to-Consumer produce exchange     |
| `/calendar`    | `CropCalendar.tsx`   | Seasonal sowing & harvest planner       |
| `/profile`     | `Profile.tsx`        | Farmer profile with gamification stats  |
| `/vet`         | `VetDashboard.tsx`   | Veterinary livestock management         |
| `/admin`       | `AdminDashboard.tsx` | Platform administration panel           |

---

## Feature Documentation

### Feature 1 — Gamification Engine

> Drives measurable behavior change by converting best practices into rewarding daily habits.

**Daily Mission System**

- 8 missions assigned each day, covering all platform features
- Representative missions: _"Upload a Soil Photo"_, _"Check Market Prices"_, _"Run Pest Detector"_, _"Check Today's Weather"_, _"Read Your Advisory"_, _"Visit the Marketplace"_, _"Update Your Profile"_, _"View the Leaderboard"_
- Each mission awards 40–100 XP upon completion
- All missions auto-reset at midnight using `localStorage` date comparison
- A live countdown timer on each card shows hours remaining until reset

**XP & Leveling**

- XP accumulates persistently across sessions via `localStorage`
- An animated XP progress bar on the Profile page shows advancement toward next level
- Higher levels unlock badge eligibility thresholds

**Daily Login Streak Tracking**

- Compares today's login date to the last recorded login date
- Streak increments by 1 for consecutive daily logins; resets to 1 after any missed day
- Streak count displayed prominently on Dashboard and Profile

**Badge System (10+ Badges)**

- Unlockable achievement badges: _Green Thumb_, _Market Guru_, _Streak Master_, _Early Bird_, _Crop Hero_, _Pest Buster_, _Weather Watcher_, _Community Star_, and more
- Displayed as an interactive grid on Dashboard (Missions tab) and Profile
- Locked badges shown with greyed-out overlay and lock icon

**Full Leaderboard Page (`/leaderboard`)**

- Animated Gold 🥇 / Silver 🥈 / Bronze 🥉 podium for top 3 farmers
- Full ranked table below with XP and level displayed per row
- Active user's position highlighted dynamically from `GamificationContext`
- Filter tabs: **Weekly** · **Monthly** · **All-Time**
- Compact leaderboard widget also embedded in the Dashboard Missions tab

---

### Feature 2 — AI & Smart Advisory

> Personalized agronomic intelligence, delivered in seconds.

**Crop Advisory Engine**

- Generates tailored recommendations for fertilizer dosage, irrigation schedule, and crop variety
- Input factors: farmer's registered soil type, land area (acres), and current season
- Advisory text stored in Advisory History for future reference

**AI Chatbot Assistant**

- Conversational farming Q&A supporting all three platform languages
- Voice input enabled via the **Web Speech API** — farmers can speak rather than type
- Lazily loaded for fast initial page performance

**Pest & Disease Image Detection**

- Drag-and-drop or browse to upload a crop leaf photograph
- Image transmitted to Python AI service (FastAPI + CNN model)
- Returns: disease name, confidence percentage, description, and treatment options
- Graceful error state displayed when AI service is unavailable

**Predictive Pest Alert Widget**

- Displayed on the Dashboard as a persistent awareness card
- Calculates outbreak risk for 4 crops (Rice, Wheat, Tomato, Maize) based on current month
- Risk levels: 🔴 **High** / 🟡 **Medium** / 🟢 **Low** — logic driven by seasonal patterns
- Pulsing red indicator when any crop reaches High risk status

**Advisory History Tab**

- All AI-generated advisories persisted and displayed chronologically
- Each entry shows: crop name, full advisory text, and date generated
- Populated with 5 agronomically accurate mock entries for demonstration (Rice, Wheat, Tomato, Maize, Onion)

---

### Feature 3 — Analytics Dashboard (4 Tabs)

> Deep farm intelligence through interactive, always-populated data visualizations.

All charts use intelligently generated 30-day mock data as fallback when the backend has no records, ensuring a complete experience locally.

**Overview Tab**

- 4 KPI stat cards: Total Advisories · Avg Soil Moisture · Temperature · Avg Pest Risk Score
- Grouped Bar Chart: advisory count vs. average health score per crop type
- Radar Chart: 5-axis pest risk visualization across pest categories

**Crop Performance Tab**

- Horizontal progress bars per crop with semantic color coding:
  - 🟢 Green: score ≥ 75 · 🟡 Amber: ≥ 60 · 🔴 Red: < 60
- 30-day trend Line Chart: Health Score, Yield Index, and Pest Pressure as overlaid series

**Soil Health Tab**

- Dual-series Area Chart: Soil Moisture % and Nitrogen % with gradient fills
- Line Chart: Soil pH level over 30 days with 6.0–7.0 ideal-range reference

**Weather Impact Tab**

- 3 summary stat cards: Avg Temperature · Avg Humidity · Total Rainfall (30-day sum)
- Multi-axis Line Chart: Temperature and Humidity correlated with Crop Health Score
- Daily Rainfall Bar Chart: precipitation in mm over 30 days

---

### Feature 4 — F2C Community Marketplace (`/marketplace`)

> Eliminating agricultural middlemen through direct Farmer-to-Consumer commerce.

| Capability                | Description                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Produce Listings**      | 8 pre-populated cards showing crop, quantity, price/kg, seller name, and district    |
| **Organic Certification** | Visual 🌱 badge for certified organic produce                                        |
| **Real-Time Search**      | Filter listings by crop name or seller location                                      |
| **Category Tabs**         | All · Grain · Vegetable · Fruit — instant client-side filtering                      |
| **Contact Seller**        | Reveals phone number and generates a one-click WhatsApp deeplink                     |
| **Post a Listing**        | Farmers submit new listings via an inline form (crop, qty, price, contact, location) |

---

### Feature 5 — Crop Sowing Calendar (`/calendar`)

> An interactive seasonal planner with agronomic data for 10 major Indian crops.

| Crop          | Sowing Window            | Harvest Window            |
| ------------- | ------------------------ | ------------------------- |
| Rice (Kharif) | June – July              | October – November        |
| Wheat (Rabi)  | November – December      | March – April             |
| Maize         | June, November           | September, February       |
| Tomato        | February, July, November | April, September, January |
| Onion         | October – December       | February – April          |
| Potato        | October – November       | January – February        |
| Soybean       | June – July              | October – November        |
| Sunflower     | February, October        | May, January              |
| Sugarcane     | January, October         | October – December        |
| Mango         | July – August            | March – May               |

**Interactive UI:**

- 12-month strip selector — defaults to the current month automatically
- **SOW NOW 🌱** / **HARVEST ✅** action badges displayed contextually per crop per month
- 12-segment horizontal timeline bar per crop (green = sowing months, orange = harvest months)
- Water requirement filter: **Low** · **Medium** · **High**
- One real agronomic tip displayed per crop card

---

### Feature 6 — Notification Center

> Proactive, categorized alerts delivered via a polished slide-in panel.

- Accessible via the 🔔 bell icon in the top navigation bar
- **Red unread badge** counter updates in real time
- 7 pre-populated notifications across 5 categories: Pest · Market · Weather · Mission · System
- Filter chips allow view by category
- **Mark All Read** clears the badge count in one click
- Individual notifications are dismissible via ✕ button
- Unread items have a primary-color dot and subtle background highlight

---

### Feature 7 — Farmer Profile Page (Redesigned)

> Transformed from a plain input form into a rich, two-column gamification dashboard.

**Left Column — Farm Details Form**

- Labeled fields with icon prefixes: Full Name · Phone Number
- **Soil Type** dropdown (6 Indian soil classifications: Alluvial, Black/Regur, Red & Laterite, Arid & Desert, Forest & Hill, Saline)
- Land area input in acres
- **Language preference** selector (English / Hindi / Odia)
- Save button with spinner loading state; Sign Out button (danger-styled, separated)

**Right Column — Gamification Stats Panel**

- Auto-generated avatar with initials and farm subtitle
- Animated **XP progress bar** with current XP and remaining XP to next level
- Three stat tiles: 🔥 Streak Days · 🏆 Badges Unlocked · ✅ Missions Done Today
- **Badge showcase grid** — every badge rendered as a tile; locked badges shown greyed with a lock overlay

---

### Feature 8 — Usage Stats & Subscription Tab

> A transparent view of platform usage and plan capabilities.

**Usage Summary (4 stat cards)**

- Total Advisories Generated — with color-coded card (blue)
- Days Active / Current Streak — (orange)
- Missions Completed Today (x/8) — (green)
- Current Plan Status (Free / Premium) — (slate / purple)

**Plan Feature Comparison (8 rows)**

| Feature                     | Free              | Premium           |
| --------------------------- | ----------------- | ----------------- |
| Crop advisory generation    | ✅ Unlimited      | ✅ Unlimited      |
| AI chatbot assistant        | ✅ 10 queries/day | ✅ Unlimited      |
| Real-time weather alerts    | ✅ Basic          | ✅ Advanced       |
| Market price tracking       | ✅ Mandi prices   | ✅ + Price trends |
| Pest image detection        | ✅ 5 scans/day    | ✅ Unlimited      |
| Advanced analytics & charts | 🔒 Locked         | ✅ Included       |
| Priority support (24/7)     | 🔒 Locked         | ✅ Included       |
| Offline mode                | 🔒 Locked         | ✅ Included       |

- **Upgrade to Premium** CTA button (gradient, ₹199/month) opens the Upgrade Modal

---

### Feature 9 — Subscription Upgrade Modal

- Side-by-side **Free vs. Premium** plan comparison table
- Animated "Upgrading..." spinner state on button click
- Success toast notification confirming plan upgrade
- Built on Radix UI `Dialog` for full keyboard navigation and screen-reader accessibility

---

### Feature 10 — Multilingual Support & Accessibility

| Capability                    | Detail                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **3 UI Languages**            | English · Hindi (हिंदी) · Odia (ଓଡ଼ିଆ)                                                                           |
| **Translation Coverage**      | Navigation labels, dashboard tabs, mission names, mission descriptions, toasts, error messages, advisory content |
| **Voice Input**               | Web Speech API integration in Chatbot — speak in any supported dialect                                           |
| **Dark Mode**                 | Full dark theme toggled via top-nav; implemented via CSS custom properties                                       |
| **PWA (Progressive Web App)** | Installable to home screen; Service Worker provides offline caching via Vite PWA Plugin + Workbox                |

---

### Feature 11 — Weather & Market Data

**Weather Card**

- 3-day localized forecast: temperature, humidity, wind speed, condition icon
- Contextual alerts for extreme events (drought risk, heavy rainfall)

**Market Price Card**

- Live Mandi rates (APMC) for major crops
- Delta indicators (🔺▼) showing price change direction
- Displayed on Dashboard and the public tools section of the landing page

---

### Feature 12 — AI-Powered Pest & Disease Detector

- Drag-and-drop or file-browse image upload interface
- Image sent to Python FastAPI microservice for CNN-based inference
- Response includes: disease name, confidence score (%), clinical description, and treatment recommendation
- Graceful degradation with informative error state when the AI service is offline

---

### Feature 13 — Veterinary Portal (`/vet`)

Dedicated portal for livestock health management targeting veterinary practitioners and farmers:

- Livestock case logs and individual animal health records
- Treatment history and medication tracking
- Vaccination schedule planner and reminders
- Case summary dashboard with status indicators

---

### Feature 14 — Admin Portal (`/admin`)

Platform administration interface for internal operators:

- Farmer user account management
- System health and uptime monitoring
- Platform-wide usage analytics overview
- Advisory and content moderation tools

---

### Feature 15 — AMU Blockchain Ledger

> Ensuring verifiable, tamper-evident records of antimicrobial usage in livestock treatment.

| Capability                     | Description                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Hash-Chain Architecture**    | Each AMU log entry is SHA-hashed and chained to the prior entry, creating a tamper-evident ledger    |
| **Treatment Logging**          | Records antibiotic name, dosage, animal ID, date administered, and attending veterinarian            |
| **Withdrawal Period Tracking** | Calculates and displays remaining days until produce (milk, meat, eggs) is safe for sale/consumption |
| **Blockchain Viewer UI**       | Visual ledger interface displaying all entries with their respective hash values and chain links     |

---

### Feature 16 — Navigation System

| Zone                            | Links Available                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------- |
| **Public Header**               | Home · About · Tools · Contact                                                    |
| **Authenticated User Dropdown** | Dashboard · 🏆 Leaderboard · 🛒 Marketplace · 📅 Crop Calendar · Profile · Logout |
| **Mobile Navigation Sheet**     | Full navigation in a slide-in drawer (responsive)                                 |
| **Top Nav Icons**               | 🌐 Language Switcher · 🔔 Notification Bell (with badge) · 🌙 Dark Mode Toggle    |

---

## What Differentiates AgriVerse

| Differentiator                       | Strategic Rationale                                                |
| ------------------------------------ | ------------------------------------------------------------------ |
| **Voice-First Interface**            | Removes literacy barrier; farmers speak, not type                  |
| **Gamification for Behavior Change** | Converts one-time curiosity into daily, sustained adoption         |
| **Seasonal Intelligence**            | Advisory and alerts aware of Indian agronomic calendar             |
| **Offline-First PWA Architecture**   | Usable in areas with no or intermittent connectivity               |
| **Unified Ecosystem**                | Weather + Soil + AI + Market + Community in one app                |
| **Verified Supply Chain Records**    | AMU blockchain provides trust for organic & compliant produce      |
| **Middleman-Free Marketplace**       | Farmers capture full value; consumers get fresher, cheaper produce |

---

## Future Roadmap

| Feature                            | Status               | Description                                            |
| ---------------------------------- | -------------------- | ------------------------------------------------------ |
| 🛰️ IoT Sensor Integration          | Planned              | Soil moisture sensors + automated irrigation triggers  |
| 🔗 Full Produce Blockchain         | Partial _(AMU done)_ | Farm-to-consumer traceability on-chain                 |
| 🛸 Drone Imagery Analysis          | Planned              | Aerial CNN analysis for uneven growth and waterlogging |
| 🧠 Predictive Outbreak Forecasting | In Progress          | Warn farmers 2–3 weeks ahead using micro-climate ML    |
| 📲 SMS Fallback Channel            | Planned              | Critical alerts to feature phones with no smartphone   |
| 💳 UPI Payment Integration         | Planned              | In-app payments for Marketplace transactions           |
| 🤝 NGO & Government Scheme Links   | Planned              | Verified scheme eligibility checks and NGO advisory    |

---

## Developer

|                 |                                                                     |
| --------------- | ------------------------------------------------------------------- |
| **Name**        | Puspal Das                                                          |
| **Institution** | SOA University (ITER), Bhubaneswar, Odisha                          |
| **GitHub**      | [@Puspaldas17](https://github.com/Puspaldas17)                      |
| **Repository**  | [Smart-Crop-Tools](https://github.com/Puspaldas17/Smart-Crop-Tools) |

---

## License

MIT License — open source for the benefit of India's farming community.
