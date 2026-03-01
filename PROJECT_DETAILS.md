# AgriVerse — Project Overview & Feature Documentation

<div align="center">

**Empowering India's 140 Million Farmers with AI, Gamification & Real-Time Intelligence**

_A full-stack, multilingual, offline-capable smart farming platform_

---

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/Puspaldas17/Smart-Crop-Tools)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?style=flat-square)](tsconfig.json)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-enabled-purple?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Languages](https://img.shields.io/badge/languages-EN%20%7C%20HI%20%7C%20OR-orange?style=flat-square)](client/i18n.ts)

</div>

---

## Executive Summary

AgriVerse is a comprehensive, AI-powered digital farming ecosystem designed for India's small and marginal farmers. It unifies crop advisory, real-time market intelligence, AI-driven pest detection, gamified learning, veterinary consultations with appointment scheduling, antimicrobial usage tracking, IoT sensor telemetry, drone imagery analysis, government scheme discovery, supply-chain blockchain, and PDF farm report generation — all in one platform accessible in three languages, installable offline, and usable without high digital literacy.

---

## Problem Statement

India's agricultural sector accounts for 18% of GDP and employs 44% of the workforce, yet the farmer remains chronically underserved by technology.

| Challenge                          | Scale                                                    |
| ---------------------------------- | -------------------------------------------------------- |
| Lack of personalized crop advisory | 140M+ small & marginal farmers have no agronomist access |
| Market price opacity               | Middlemen capture 30–40% of farm-gate value              |
| Late pest & disease detection      | Annual crop losses estimated at ₹80,000+ crore           |
| Digital accessibility barriers     | Low literacy + inconsistent internet in rural areas      |
| No veterinary access               | Livestock healthcare gap in rural India                  |
| Fragmented tooling                 | No single platform integrates weather, soil, market & AI |

**AgriVerse solves all six — in one unified, accessible application.**

---

## Platform Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   React 18 Frontend (Vite)                        │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────┐  ┌────────────────┐  │
│  │  Dashboard │  │  Vet Portal│  │ Admin  │  │ Tools & Insights│  │
│  │  (7 Tabs)  │  │            │  │ Portal │  │   (5 Tabs)     │  │
│  └─────┬──────┘  └─────┬──────┘  └───┬────┘  └───────┬────────┘  │
│        │               │             │               │            │
│  ┌─────▼───────────────▼─────────────▼───────────────▼──────────┐ │
│  │          GamificationContext  (XP · Level · Streak)          │ │
│  └─────────────────────────┬──────────────────────────────────  ┘ │
└───────────────────────────┼────────────────────────────────────── ┘
                            │  REST API + JWT Auth (Express)
┌───────────────────────────▼──────────────────────────────────────┐
│                  Node.js / Express Backend                        │
│  /api/auth · /api/farmers · /api/appointments                    │
│  /api/vet  · /api/admin   · /api/advisory · /api/analytics       │
│  /api/amu  · /api/market  · /api/chat     · /api/predict         │
└──────────────┬─────────────────────────────────┬─────────────────┘
               │                                 │
  ┌────────────▼──────────┐       ┌──────────────▼──────────────┐
  │  MongoDB + Mongoose   │       │  Python AI Service           │
  │  (In-Memory Fallback) │       │  FastAPI + TensorFlow/CNN   │
  └───────────────────────┘       └─────────────────────────────┘
```

---

## Technology Stack

| Layer                    | Technology                          | Purpose                                      |
| ------------------------ | ----------------------------------- | -------------------------------------------- |
| **Frontend Framework**   | React 18 + Vite + TypeScript        | Core UI with fast HMR                        |
| **Styling**              | TailwindCSS + CSS Custom Properties | Design system + glassmorphism + dark mode    |
| **UI Primitives**        | Radix UI + shadcn/ui                | Accessible, headless components (50+)        |
| **Data Visualization**   | Recharts                            | Analytics charts (Line, Bar, Area, Radar)    |
| **Client Routing**       | React Router v6                     | SPA page navigation                          |
| **State Management**     | React Context API + `localStorage`  | Auth, gamification, streak persistence       |
| **Internationalization** | react-i18next                       | EN / Hindi / Odia (~1200 translation keys)   |
| **PDF Generation**       | jsPDF + html2canvas                 | Formatted A4 farm report download            |
| **Backend Runtime**      | Node.js + Express                   | REST API server                              |
| **Database**             | MongoDB + Mongoose                  | Persistent data storage with schemas         |
| **Demo Fallback**        | Custom in-memory adapter (`db.ts`)  | Full functionality without MongoDB           |
| **Authentication**       | JWT (jsonwebtoken) + bcryptjs       | Stateless role-based auth (farmer/vet/admin) |
| **AI Service**           | Python + FastAPI                    | ML model API server                          |
| **Machine Learning**     | TensorFlow / PyTorch + CNN          | Crop disease image classification            |
| **PWA**                  | vite-plugin-pwa + Workbox           | Offline caching + installability             |
| **Icons**                | Lucide React                        | Consistent iconography                       |
| **Alerts**               | Sonner                              | Non-blocking toast notifications             |

---

## Pages & Routes

| Route          | Component            | Access        | Description                            |
| -------------- | -------------------- | ------------- | -------------------------------------- |
| `/`            | `Index.tsx`          | Public        | Landing page with featured tools       |
| `/login`       | `Login.tsx`          | Public        | Registration and JWT authentication    |
| `/dashboard`   | `Dashboard.tsx`      | Farmer        | Core farmer dashboard (7 tabs)         |
| `/tools`       | `ToolsPage.tsx`      | Farmer        | Tools & Insights (IoT/Drone/Chain/PDF) |
| `/vet`         | `VetDashboard.tsx`   | Vet           | Vet consultation & advisory management |
| `/admin`       | `AdminDashboard.tsx` | Admin         | Platform admin panel                   |
| `/amu`         | `AMUManager.tsx`     | Vet / Admin   | AMU blockchain ledger                  |
| `/leaderboard` | `Leaderboard.tsx`    | Authenticated | Community XP rankings with podium      |
| `/marketplace` | `Marketplace.tsx`    | Authenticated | Farmer-to-Consumer produce exchange    |
| `/calendar`    | `CropCalendar.tsx`   | Authenticated | Seasonal sowing & harvest planner      |
| `/profile`     | `Profile.tsx`        | Authenticated | Farmer profile with gamification stats |

---

## Feature Documentation

### Feature 1 — Gamification Engine

> Drives measurable behaviour change by converting best practices into rewarding daily habits.

**Daily Mission System**

- 8 missions assigned each day covering all platform features
- Each mission awards 40–100 XP upon completion
- All missions auto-reset at midnight using `localStorage` date comparison

**XP & Leveling**

- XP persists across sessions; animated XP progress bar on Profile page
- Higher levels unlock badge eligibility thresholds

**Daily Login Streak Tracking**

- Compares today's login date to last recorded login — increments or resets accordingly
- Streak displayed prominently on Dashboard and Profile

**Badge System (10+ Badges)**

- Unlockable: Green Thumb, Market Guru, Streak Master, Early Bird, Crop Hero, Pest Buster, Weather Watcher, Community Star, and more
- Locked badges shown with greyed overlay and lock icon

**Full Leaderboard Page (`/leaderboard`)**

- Animated Gold 🥇 / Silver 🥈 / Bronze 🥉 podium for top 3 farmers
- Filter tabs: **Weekly · Monthly · All-Time**

---

### Feature 2 — JWT Authentication & Role-Based Access

> Stateless, secure authentication with role enforcement at every API endpoint.

- **Login / Register** returns a signed JWT containing `{ id, role, name }`
- JWT stored in `localStorage`; `authHeaders()` helper attaches `Authorization: Bearer <token>` to every API call
- **`verifyToken`** middleware decodes and validates JWT on all protected routes
- **`requireRole(...roles)`** middleware enforces `farmer` / `vet` / `admin` access
- Guest mode bypasses JWT; guest users cannot access vet inbox or advisory history
- Clear `401 Unauthorized` and `403 Forbidden` responses for invalid/missing tokens

---

### Feature 3 — AI & Smart Advisory

> Personalized agronomic intelligence, delivered in seconds.

**Crop Advisory Engine**

- Tailored recommendations for fertilizer, irrigation, and crop variety based on soil type, land area, and season

**AI Chatbot Assistant**

- Multilingual conversational Q&A with Web Speech API voice input

**Pest & Disease Image Detection**

- Upload crop leaf photo → Python AI service (FastAPI + CNN) → disease name, confidence %, and treatment

**Predictive Pest Alert Widget (14-Day Forecast)**

- Calculates outbreak likelihood for Rice, Wheat, Tomato, Maize using month, weather patterns, and historical data
- Shows 14-day bar chart with risk levels, trend arrow, confidence %, and "Take Action" button
- 🔴 High / 🟡 Medium / 🟢 Low — pulsing red indicator on High risk

**Advisory History Tab**

- All AI-generated advisories persisted and displayed chronologically with crop, text, and date

---

### Feature 4 — Analytics Dashboard (4 Tabs)

> Deep farm intelligence through interactive, always-populated data visualizations.

All charts use intelligently generated 30-day mock data as fallback when the backend has no records.

| Tab             | Contents                                                           |
| --------------- | ------------------------------------------------------------------ |
| **Overview**    | 4 KPI cards, grouped bar chart, radar chart                        |
| **Crop Perf.**  | Progress bars per crop, 30-day trend line chart                    |
| **Soil Health** | Dual-area chart (moisture + nitrogen), pH line chart               |
| **Weather**     | 3 stat cards, multi-axis temperature/humidity chart, rainfall bars |

---

### Feature 5 — Veterinary Consultation System

> Bridging the gap between rural farmers and veterinary professionals.

**Farmer — Vet Inbox Tab (Dashboard)**

- Submit consultation requests (Animal ID, disease, message)
- Track status: `Pending` / `Approved` / `Rejected` with vet reply note
- View all vet advisories addressed to them (targeted or broadcast)
- **Book appointments** directly from the Vet Inbox tab

**Vet Dashboard (`/vet`)**

| Capability          | Description                                     |
| ------------------- | ----------------------------------------------- |
| Patient List        | All registered farmers                          |
| Consultation Queue  | All requests — approve, reject, reply, re-open  |
| Appointment Manager | View / confirm / reschedule appointments        |
| Broadcast Advisory  | Send advisory to all farmers or specific farmer |
| Advisory History    | All advisories sent, with date and target       |

**Appointment API**

| Method  | Endpoint                | Description                                 |
| ------- | ----------------------- | ------------------------------------------- |
| `GET`   | `/api/appointments`     | List appointments (filtered by role)        |
| `POST`  | `/api/appointments`     | Farmer books a new appointment              |
| `PATCH` | `/api/appointments/:id` | Vet updates status, note, or scheduled time |

---

### Feature 6 — Tools & Insights Page (`/tools`)

> Five advanced farming tools unified in one tab-based page.

#### Tab 1 — IoT Sensor Dashboard

- Live mock telemetry: soil moisture, temperature, pH, nitrogen
- Status indicators (🟢 Optimal / 🟡 Warning / 🔴 Alert) with target ranges
- Auto-refreshes every 30 seconds; irrigation alert when moisture is out of range

#### Tab 2 — Drone Aerial Analysis

- Drag-and-drop aerial image upload
- Simulated CNN analysis (2.2 s delay) across 4 field zones
- Per-zone results: NDVI score, uniformity %, waterlogging risk, dry patch %, recommendation

#### Tab 3 — Produce Blockchain Ledger

- Register harvests: crop, quantity, harvest date, pesticides used
- Each entry gets a unique simulated 40-char hex transaction hash
- Randomly assigned certifier (AgriVerify DAO / FarmLedger Network / GreenTrace Protocol)
- Expandable block cards with copy-to-clipboard hash

#### Tab 4 — Government Scheme Finder

- 7 major schemes: PM-KISAN, PMFBY, KCC, eNAM, ATMA, RKVY, NFSM
- Search + category filter (subsidy / insurance / credit / market / welfare)
- Land-size eligibility check using farmer's profile data
- Expandable cards with official government portal links

#### Tab 5 — PDF Farm Report Export

- Check/uncheck sections to include: Profile, Advisory, Pest, IoT, AMU, Blockchain
- **jsPDF + html2canvas** renders a hidden A4-formatted HTML report at 2× resolution
- Automatically sliced into A4 pages and downloaded as a real `.pdf` file
- Named: `SmartCropTools_FarmReport_<FarmerName>_<Year>.pdf`

---

### Feature 7 — F2C Community Marketplace (`/marketplace`)

> Eliminating middlemen through direct Farmer-to-Consumer commerce.

- 8 produce listings with search, category filter (Grain / Vegetable / Fruit), and organic badge
- Contact Seller reveals phone + one-click WhatsApp deeplink
- Post new listings via inline form

---

### Feature 8 — Crop Sowing Calendar (`/calendar`)

> Seasonal planner with agronomic data for 10 major Indian crops.

- 12-month strip selector defaulting to the current month
- **SOW NOW 🌱 / HARVEST ✅** badges per crop per month
- 12-segment horizontal timeline bar (green = sowing, orange = harvest)
- Water requirement filter: Low · Medium · High

---

### Feature 9 — Notification Center

- 🔔 Bell icon with unread red badge counter
- 7 pre-populated notifications across 5 categories: Pest / Market / Weather / Mission / System
- Category filter chips, Mark All Read, and individual dismiss buttons

---

### Feature 10 — Farmer Profile Page

- Farm details form: name, phone, soil type (6 Indian classifications), land size, language
- Right column gamification stats: XP progress bar, streak days, badges unlocked, missions today
- Full badge showcase grid with locked overlay

---

### Feature 11 — Subscription & Upgrade System

**Free vs Premium comparison (8 feature rows)**

- Upgrade CTA (₹199/month) opens comparison modal with animated confirm flow

---

### Feature 12 — Admin Portal (`/admin`)

| Capability            | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| Overview KPIs         | Total farmers, active today, total advisories, total consultations |
| User Management       | View, edit, delete any farmer/vet/admin account                    |
| Create User           | Admin creates accounts for vets and other admins                   |
| Seed Default Users    | One-click to seed default admin + vet accounts in MongoDB          |
| Broadcast Message     | Send platform-wide notifications                                   |
| AMU Ledger View       | Admin view of full antimicrobial usage ledger                      |
| Consultation Overview | View all consultations across all vets and farmers                 |

---

### Feature 13 — AMU Blockchain Ledger (`/amu`)

| Capability                 | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| Hash-Chain Architecture    | Each AMU entry SHA-hashed and chained to prior entry (tamper-evident) |
| Treatment Logging          | Antibiotic, dosage, animal ID, date, attending vet                    |
| Withdrawal Period Tracking | Days remaining until produce is safe for sale                         |
| Blockchain Viewer UI       | Visual ledger with hash values and chain links                        |

---

### Feature 14 — Multilingual Support & Accessibility

| Capability           | Detail                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| 3 UI Languages       | English · Hindi (हिंदी) · Odia (ଓଡ଼ିଆ)                                    |
| Translation Coverage | Navigation, tabs, missions, toasts, errors, advisory, vet portal, chatbot |
| Voice Input          | Web Speech API in Chatbot                                                 |
| Dark Mode            | Full dark theme via CSS custom properties                                 |
| PWA                  | Installable; offline caching via vite-plugin-pwa + Workbox                |

---

### Feature 15 — Weather & Market Data

**Weather Card** — 3-day forecast with temperature, humidity, wind speed, condition icon, and extreme event alerts

**Market Price Card** — Live Mandi rates (APMC) with delta indicators (🔺▼) for major crops

---

## Data Models (MongoDB Schemas)

| Model             | Key Fields                                                                          |
| ----------------- | ----------------------------------------------------------------------------------- |
| `Farmer`          | name, email, password (bcrypt), phone, soilType, landSize, role, subscriptionStatus |
| `Advisory`        | farmerId, crop, summary, fertilizer, irrigation, pest, weather                      |
| `AdvisoryHistory` | farmerId, crop, advisory text, weatherData, soilData                                |
| `AnalyticsData`   | farmerId, crop, date, health score, yield, soil metrics, weather metrics            |
| `DrugLog`         | animalId, drugName, dosage, withdrawalDays, applicator, treatmentDate               |
| `Block`           | index, timestamp, data, previousHash, hash (AMU blockchain)                         |
| `Consultation`    | farmerId, vetId, animalId, disease, message, status, vetNote                        |
| `VetAdvisory`     | vetId, farmerId (null=all), title, body, crop, targetRole                           |
| `Appointment`     | farmerId, vetId, animalId, reason, scheduledAt, status, vetNote                     |

All models have an **in-memory fallback** via the custom `InMemoryCollection` adapter in `db.ts`.

---

## What Differentiates AgriVerse

| Differentiator                        | Strategic Rationale                                                     |
| ------------------------------------- | ----------------------------------------------------------------------- |
| **Voice-First Interface**             | Removes literacy barrier; farmers speak, not type                       |
| **Gamification for Behaviour Change** | Converts one-time curiosity into daily, sustained adoption              |
| **14-Day Predictive Pest Forecast**   | Warns farmers ahead of outbreak season, not after detection             |
| **JWT Role-Based Security**           | Stateless auth with vet/admin enforcement at the API level              |
| **IoT + Drone + Blockchain Tools**    | 5 advanced features in one unified Tools & Insights page                |
| **Offline-First PWA Architecture**    | Usable in areas with no or intermittent connectivity                    |
| **Unified Ecosystem**                 | Weather + Soil + AI + Market + Vet + Community in one app               |
| **Verified Supply Chain Records**     | AMU blockchain provides trust for organic & compliant produce           |
| **Middleman-Free Marketplace**        | Farmers capture full value; consumers get fresher, cheaper produce      |
| **Vet-Farmer Direct Channel**         | Rural farmers get veterinary advice and appointments without travelling |

---

## Future Roadmap

| Feature                     | Status  | Description                                            |
| --------------------------- | ------- | ------------------------------------------------------ |
| 💳 UPI Payment Integration  | Planned | In-app payments for Marketplace transactions           |
| 📲 SMS Fallback Channel     | Planned | Critical alerts to feature phones via Twilio           |
| 🔗 QR Code per Produce Lot  | Planned | QR traceability for each blockchain-registered harvest |
| 🧪 Real AI/ML Backend       | Planned | Full Python CNN model integration (currently mock)     |
| 🌐 Live Deployment          | Planned | Render.com + MongoDB Atlas cloud deployment            |
| ✅ Unit & Integration Tests | Planned | Vitest + React Testing Library test suite              |

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
