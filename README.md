# 🌾 AgriVerse (formerly Smart Crop Tools)

**AgriVerse** is a comprehensive, AI-powered digital platform designed to revolutionize sustainable farming practices. It integrates gamified learning, real-time advisory, and livestock health management into a single, accessible solution for farmers.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/stack-MERN-blue)]()

---

## 🚀 Vision & Roadmap

**AgriVerse** aims to bridge the gap between technology and traditional farming. Our roadmap outlines the evolution of this platform into a gamified ecosystem.

### 1️⃣ Problem Statement

- **Low Adoption**: Sustainable practices are often ignored due to lack of engaging training.
- **AMU Risks**: Unsafe antimicrobial usage in livestock poses health risks.
- **Information Gap**: Lack of personalized, localized advisory.

### 2️⃣ Project Objective

To create a digital platform that:

- Educates via **gamification**.
- Tracks **antimicrobial usage (AMU)**.
- Delivers **AI-based advisory**.
- Works **offline** in local languages.

### 3️⃣ Core Modules (Planned)

1.  **Gamified Farming Platform**: Missions, rewards, and leaderboards to drive sustainable habits.
2.  **AMU & Compliance**: Digital logbooks, vet verification, and withdrawal alerts.
3.  **AI Decision Support**: Soil health analysis, weather forecasting, and crop recommendations.
4.  **AI Assistant**: Voice-enabled, multilingual chatbot with image-based disease diagnosis.

### 4️⃣ Development Roadmap

- **Step 1**: Requirement Analysis & Persona Definition.
- **Step 2**: System Architecture & Microservices Design.
- **Step 3**: Frontend Development (Mobile/Web).
- **Step 4**: AI/ML Model Training (Crop & Disease).
- **Step 5**: AMU & Blockchain Integration.
- **Step 6**: Dashboards & Analytics.
- **Step 7**: Field Testing & Validation.
- **Step 8**: Pilot Deployment.

_(See `ROADMAP.md` for full details)_

---

## ✨ Current Features

The project currently provides the following foundational features:

- **🗣️ Multilingual Chatbot**: Voice-enabled, context-aware smart replies.
- **💹 Market Prices**: Real-time or sample data for crop prices (Mandi rates).
- **🌦️ Weather Alerts**: Localized temperature, humidity, and wind safety notifications.
- **🐛 Pest Detection**: Machine-Learning powered image diagnosis (Server-side & Client-side).
- **🔐 Farmer Access**: Secure, lightweight login system (Guest mode supported).

---

## 🛠️ Technology Stack

| Layer            | Technology                                |
| :--------------- | :---------------------------------------- |
| **Frontend**     | React 18, Vite, TailwindCSS, Radix UI     |
| **Backend**      | Node.js, Express.js (Express 5)           |
| **Database**     | MongoDB (Mongoose) + In-memory fallback   |
| **Auth/Storage** | Supabase (Optional/Mocked for dev)        |
| **ML/AI**        | Hugging Face Inference API, TensorFlow.js |
| **Deployment**   | Vercel, Netlify, or self-hosted Node.js   |

---

## 💻 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- **Node.js** v18+ (Recommended v20+)
- **npm** or **pnpm**

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/puspaldas05/Smart-Crop-Tools.git
    cd Smart-Crop-Tools
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env` (optional, defaults provided):
    ```bash
    cp .env.example .env
    ```

    - _Note_: If `MONGODB_URI` is not set, the app uses an in-memory database.
    - _Note_: If `SUPABASE_URL` is not set, a placeholder mock is used to prevent startup crashes.

### Running the Application

**Development Mode** (Hot Reloading):

```bash
npm run dev
```

> Opens at `http://localhost:8080` (or `http://localhost:5173`)

**Production Build & Run**:

1.  Build the project:
    ```bash
    npm run build
    ```
2.  Start the production server:
    `bash
    npm start
    `
    > Server runs on port **3000** by default (or user defined `PORT`).

### Testing

Run TypeScript validation:

```bash
npm run typecheck
```

---

## 🧰 Troubleshooting

- **Port in use?**
  - Set `PORT` environment variable: `$env:PORT=9090; npm start`.
- **Database connection fails?**
  - Ensure your IP is whitelisted in MongoDB Atlas.
  - For local dev, just remove `MONGODB_URI` to use the in-memory fallback.
- **Supabase errors?**
  - The app gracefully handles missing Supabase credentials by using placeholders. Some features (advanced auth) may be limited without valid keys.

---

## 📜 License

MIT License.
