# 🌾 AgriVerse

**AgriVerse** is a comprehensive, AI-powered digital platform designed to revolutionize sustainable farming practices. It integrates gamified learning, real-time advisory, and livestock health management into a single, accessible solution for farmers.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/stack-MERN-blue)]()

---

## ✨ Key Features

- **🗣️ Multilingual AI Chatbot**: Voice-enabled assistant that understands local languages (Hindi, Odia, English) and provides context-aware farming advice.
- **💹 Real-time Market Prices**: Access live Mandi rates for various crops to make informed selling decisions.
- **🌦️ Localized Weather Alerts**: Precise weather forecasts with alerts for extreme conditions like high humidity or temp.
- **🐛 Pest & Disease Detection**: AI-powered image analysis to detect crop diseases and recommend treatments (Powered by Python AI Service).
- **📝 Gamified Learning**: Missions and rewards to encourage sustainable farming habits.
- **💊 AMU & Livestock Health**: Track antimicrobial usage and manage livestock health records.

---

## 🛠️ Technology Stack

| Layer          | Technology                            |
| :------------- | :------------------------------------ |
| **Frontend**   | React 18, Vite, TailwindCSS, Radix UI |
| **Backend**    | Node.js, Express.js (Express 5)       |
| **AI Service** | Python (FastAPI, TensorFlow/PyTorch)  |
| **Database**   | MongoDB (Mongoose)                    |
| **Auth**       | Custom Auth / Supabase (Optional)     |

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

> Access the app at: [http://localhost:8080](http://localhost:8080)

**Terminal 2: Start AI Service**

```bash
cd ai_service
python main.py
```

> AI Service runs at: [http://localhost:8000](http://localhost:8000)

---

## 📂 Project Structure

```
AgriVerse/
├── client/              # React Frontend
├── server/              # Node.js/Express Backend
├── ai_service/          # Python AI API (FastAPI)
├── shared/              # Shared Types/Utils
└── scripts/             # Utility scripts (seeding, etc.)
```

## 🧰 Troubleshooting

- **Port Conflicts**: If port `8080` is in use, set `PORT=9090 npm run dev` (PowerShell: `$env:PORT=9090; npm run dev`).
- **AI Service Error**: Ensure Python dependencies are installed and the service is running on port `8000`.
- **Database**: If you don't have MongoDB installed, the app will run in "Demo Mode" with in-memory data.

---

## 📜 License

MIT License.
