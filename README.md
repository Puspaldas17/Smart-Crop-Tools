# 🌾 AgriVerse

**AgriVerse** is a comprehensive, AI-powered digital platform designed to revolutionize sustainable farming practices. It integrates gamified learning, real-time advisory, and livestock health management into a single, accessible solution for farmers.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/stack-MERN-blue)]()

---

## ✨ Key Features

### 🌍 **Multilingual & Accessible**

- **3 Language Support**: Fully localized in **English**, **Hindi (हिंदी)**, and **Odia (ଓଡ଼ିଆ)**.
- **Voice-Enabled Chatbot**: Talk to the AI assistant in your native language for farming advice.
- **Dark Mode**: Switch between Light and Dark themes for comfortable viewing in any lighting condition.
- **Offline Capabilities**: PWA support ensures key features work even with spotty internet.

### 🎮 **Gamified Farming**

- **Daily Missions**: Complete tasks like "Upload Soil Photo" or "Check Market Prices" to earn XP.
- **Leveling System**: Earn XP, level up, and maintain daily streaks to stay motivated.
- **Badges & Rewards**: Unlock achievements like "Green Thumb" or "Market Guru" for consistent activity.
- **Leaderboard**: Compete with other farmers (locally or regionally) to improve farming practices.

### 🤖 **AI & Smart Advisory**

- **Crop Advisory**: Personalized fertilizer, irrigation, and seed recommendations based on your soil type and land size.
- **Pest & Disease Detection**: Upload a photo of your crop, and our **Python-based AI Service** (TensorFlow/CNN) detects diseases and suggests remedies instantly.
- **Chatbot Assistant**: Ask anything about weather, crops, or government schemes.

### 📊 **Real-Time Data**

- **Market Intelligence**: Live Mandi rates (APMC prices) for various crops to help you sell at the best price.
- **Weather Forecasts**: Localized 3-day weather predictions with alerts for extreme conditions (drought, heavy rain).

### 🛠️ **Farm Management Tools**

- **Dashboard**: A unified view of your farm's health, recent advisories, and subscription status.
- **AMU & Livestock**: Track antimicrobial usage and manage cattle/livestock health records.
- **Subscription Plans**: Manage Free vs. Premium tiers for advanced analytics and priority support.

---

## � Why AgriVerse? (Unique Features)

What sets AgriVerse apart from standard farming apps:

1.  **🗣️ Voice-First for Low Literacy**: Unlike text-heavy apps, AgriVerse is built for accessibility. Farmers can simply **speak** in their native dialect to get answers, making technology usable for everyone.
2.  **🎮 Behavior Change via Gamification**: We don't just give advice; we motivate action. By turning farming tasks into "Missions" with streaks and badges, we encourage long-term adoption of sustainable practices.
3.  **⚡ Offline-First Architecture**: Farming happens in the field, often far from cell towers. Our PWA design ensures that critical features like previous advisories and crop tools work **without an internet connection**.
4.  **🔗 Holistic Ecosystem**: Most apps focus on _one_ thing (just weather, or just market prices). AgriVerse connects the dots: **Weather + Soil + Market + Pest Detection** all in one place to give truly unified advice.

---

## �🛠️ Technology Stack

| Layer          | Technology                            |
| :------------- | :------------------------------------ |
| **Frontend**   | React 18, Vite, TailwindCSS, Radix UI |
| **Backend**    | Node.js, Express.js (Express 5)       |
| **AI Service** | Python (FastAPI, TensorFlow/PyTorch)  |
| **Database**   | MongoDB (Mongoose)                    |
| **Auth**       | Custom JWT Auth                       |

---

## 🚀 Getting Started

Follow these steps to set up and run the full AgriVerse ecosystem (Web App + AI Service).

### Prerequisites

- **Node.js** v18+ (Recommended v20+)
- **Python** v3.10+
- **npm** or **pnpm**

### 1. Installation

**Clone the repository:**

```bash
git clone https://github.com/puspaldas05/Smart-Crop-Tools.git
cd Smart-Crop-Tools
```

**Install Web App Dependencies:**

```bash
npm install
```

**Install AI Service Dependencies:**

```bash
cd ai_service
pip install -r requirements.txt
cd ..
```

_(Note: On Windows, use `pip install --upgrade pillow` if you encounter image library issues.)_

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

- By default, the app uses an **in-memory database** if `MONGODB_URI` is not set.
- For full features, configure your MongoDB URI in `.env`.

### 3. Running the Project

You need to run the **Web App** and the **AI Service** in separate terminals.

**Terminal 1: Start Web Application (Frontend + Backend)**

```bash
npm run dev
```

> 🟢 Access the app at: [http://localhost:8080](http://localhost:8080)

**Terminal 2: Start AI Service**

```bash
cd ai_service
python main.py
```

> 🟢 AI Service runs at: [http://localhost:8000](http://localhost:8000)

### 4. Verification

1.  Open [http://localhost:8080](http://localhost:8080) in your browser.
2.  Use the **Language Switcher** in the top bar to test Hindi/Odia.
3.  Go to **Dashboard** -> **Pest Detector** to test the connection to the Python AI Service.

---

## 📂 Project Structure

```
AgriVerse/
├── client/              # React Frontend (Vite)
│   ├── components/      # UI & Feature Components
│   ├── pages/           # Route Pages (Dashboard, Index, etc.)
│   └── i18n.ts          # Language Configuration
├── server/              # Node.js/Express Backend API
├── ai_service/          # Python AI API (FastAPI + ML Models)
└── shared/              # Shared Types/Utils
```

## 🧰 Troubleshooting

- **Port Conflicts**: If port `8080` is in use, set `PORT=9090 npm run dev` (PowerShell: `$env:PORT=9090; npm run dev`).
- **AI Service Error**: Ensure Python dependencies are installed (`pip install -r requirements.txt`) and the service is running on port `8000`.
- **Database**: If you don't have MongoDB installed, the app will run in "Demo Mode" with in-memory data.

---

## 📜 License

MIT License.
