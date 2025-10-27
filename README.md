

````markdown
# 🌾 Smart Crop Advisory System

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with React](https://img.shields.io/badge/frontend-React-blue?logo=react)]()
[![Backend: Express](https://img.shields.io/badge/backend-Express-black?logo=express)]()
[![Database: MongoDB](https://img.shields.io/badge/database-MongoDB-green?logo=mongodb)]()

> 🌱 A full-stack, production-ready **MERN** app delivering multilingual, data-driven guidance for farmers — powered by real-time weather, market prices, and image-based pest diagnosis.

---

## 🚀 Quick Start

See [`docs/running.md`](docs/running.md) for complete setup and deployment details.

```bash
# Clone the repo
git clone https://github.com/puspaldas05/Smart-Crop-Tools.git
cd Smart-Crop-Tools

# Install dependencies
pnpm install

# Run the dev server
pnpm dev
````

➡️ Visit [http://localhost:8080](http://localhost:8080)
🧑‍🌾 Login (top-right) to access the **Working Suite** (Chatbot, Market, Weather, Pest Detector, Advisory)

---

## ✨ Features

* 🗣️ **Voice & Multilingual Chatbot** – geolocation-aware smart replies
* 💹 **Market Prices (Punjab)** – with robust offline/sample fallbacks
* 🌦️ **Local Weather Alerts** – temp, humidity, wind safety notifications
* 🌾 **Quick Crop Advisory** – fertilizer, irrigation, and pest hints
* 🐛 **Pest/Disease Detection** – via server-side ML image inference
* 🔐 **Lightweight Farmer Login** – secure, minimal credential model
* 📱 **Responsive Design** – smooth scroll, fluid typography, mobile-first UI

---

## 🧱 Tech Stack

| Layer                | Technology                                     |
| :------------------- | :--------------------------------------------- |
| **Frontend**         | React (Vite), TailwindCSS, Radix UI            |
| **Backend**          | Express.js (integrated with Vite for dev)      |
| **Database**         | MongoDB via Mongoose (with in-memory fallback) |
| **Machine Learning** | Server endpoint (Hugging Face Inference API)   |

---

## 🏗️ Architecture & Structure

Monorepo with client (SPA), server (API), and shared TypeScript models.

```
client/
 ├─ App.tsx                # Router + providers
 ├─ global.css             # Tailwind theme, smooth scroll
 ├─ pages/                 # Landing, Login, Suite
 ├─ components/features/   # Chatbot, Market, PestDetector, Advisory
 ├─ components/ui/         # Reusable UI blocks
 ├─ hooks/                 # useAuth, useSpeech, etc.
 └─ lib/                   # Utilities

server/
 ├─ index.ts               # Express app + route registration
 ├─ node-build.ts          # Production HTTP server
 ├─ db.ts                  # Mongo connection (fallback: in-memory)
 └─ routes/                # API handlers (auth, market, weather, etc.)

shared/
 └─ api.ts                 # Shared DTOs/types for client + server

netlify/
 ├─ functions/api.ts       # Netlify Function wrapper for Express
 └─ netlify.toml           # Build config + redirects
```

---

## ⚙️ Requirements

* 🟢 **Node.js** 18+ (20+ recommended)
* 🔵 **pnpm** 8+ (preferred) or npm
* 🧩 **VS Code** (recommended for debugging)

---

## 🧑‍💻 Run & Debug in VS Code

Open the project in VS Code:

```bash
code .
```

Use **JavaScript Debug Terminal** and run:

```bash
pnpm dev
```

Or debug the production server using:

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
      "env": { "PORT": "3000" },
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## 🌐 Environment Variables

| Variable      | Description                     | Example             |
| ------------- | ------------------------------- | ------------------- |
| `PORT`        | Local server port               | `8080`              |
| `MONGODB_URI` | MongoDB connection URI          | `mongodb+srv://...` |
| `HF_API_KEY`  | Hugging Face API key (optional) | `hf_123abc...`      |

> 🧠 If `MONGODB_URI` is not set, the app runs with an **in-memory demo DB**.

---

## 📦 Scripts

| Command          | Description                     |
| :--------------- | :------------------------------ |
| `pnpm dev`       | Run dev server (Vite + Express) |
| `pnpm build`     | Build client + server bundles   |
| `pnpm start`     | Run built production server     |
| `pnpm test`      | Run tests                       |
| `pnpm typecheck` | Type validation                 |

---

## 🚢 Deployment

Supports multiple targets:

* 🌍 **Netlify** (serverless) → uses `netlify/functions/api.ts`
* 🧭 **Vercel** → check `docs/deploy-vercel.md`
* 🖥️ **Self-hosted / Builder MCP** – simple `pnpm build && pnpm start`

---

## 🧰 Troubleshooting

* ❌ **Port busy?**

  ```powershell
  $env:PORT=9090; pnpm dev
  ```

* 🧩 **No MongoDB connection?**
  App switches to an **in-memory DB** for demos.

* 🔍 **404 NOT_FOUND on Vercel?**
  Check `vercel.json` or deployment logs and ensure API routes are registered.

---

## 🔒 Security

* Never commit secrets or `.env` files.
* Use environment variables on your hosting provider.
* Only minimal demo data (name/phone) is stored.
* Add monitoring (Sentry, etc.) and WAF/rate limiting on `/api/*` before production.

---

## 📜 License

MIT License © [Puspal Das](https://github.com/puspaldas05)

---
