import {
  CheckCircle2,
  Sprout,
  Mic,
  WifiOff,
  CloudSun,
  Languages,
  Brain,
  Shield,
} from "lucide-react";

import React, { useState, Suspense, startTransition } from "react";
const Chatbot = React.lazy(() => import("@/components/features/Chatbot"));
const MarketWidget = React.lazy(
  () => import("@/components/features/MarketWidget"),
);
const PestDetector = React.lazy(
  () => import("@/components/features/PestDetector"),
);
import { useAuth } from "@/hooks/useAuth";

const FeatureTiles = React.lazy(
  () => import("@/components/features/FeatureTiles"),
);
const AdvisoryWidget = React.lazy(
  () => import("@/components/features/AdvisoryWidget"),
);
const UnifiedOverview = React.lazy(
  () => import("@/components/features/UnifiedOverview"),
);
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";

function ToolsSuiteInner() {
  return (
    <div className="grid gap-8">
      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading…
          </div>
        }
      >
        <FeatureTiles />
      </Suspense>
      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading overview…
          </div>
        }
      >
        <UnifiedOverview />
      </Suspense>
      <div id="advisory">
        <Suspense
          fallback={
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading…
            </div>
          }
        >
          <AdvisoryWidget />
        </Suspense>
      </div>
      <div className="grid gap-8 min-[577px]:grid-cols-2">
        <div id="chat">
          <Suspense
            fallback={
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Loading chat…
              </div>
            }
          >
            <Chatbot />
          </Suspense>
        </div>
        <div id="market">
          <Suspense
            fallback={
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Loading market & weather…
              </div>
            }
          >
            <MarketWidget />
          </Suspense>
        </div>
      </div>
      <div id="pest">
        <Suspense
          fallback={
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading detector…
            </div>
          }
        >
          <PestDetector />
        </Suspense>
      </div>
    </div>
  );
}

function ToolsSuite() {
  const { farmer } = useAuth();
  if (!farmer) return null;
  return <ToolsSuiteInner />;
}

export default function Index() {
  const { farmer } = useAuth();
  return (
    <div className="space-y-24">
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA />

      {/* About */}
      <section id="about" className="scroll-mt-24">
        {/* Proposed Solution */}
        <div id="solution" className={`scroll-mt-24 ${farmer ? "hidden" : ""}`}>
          <header className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Proposed Solution
            </h2>
            <p className="mt-2 max-w-prose text-slate-600">
              A mobile app and chatbot that work online and offline to deliver
              personalized crop, fertilizer, irrigation and pest
              management—backed by real‑time weather and market data.
            </p>
          </header>
          <div className="grid gap-6 min-[577px]:grid-cols-2">
            <Card title="Detailed explanation">
              <List
                items={[
                  "Intelligent mobile app and chatbot with multilingual and voice support.",
                  "Personalized crop, fertilizer and pest advisory using soil, weather and crop history.",
                  "Real-time market price updates and weather alerts.",
                  "Image-based pest/disease detection.",
                ]}
              />
            </Card>
            <Card title="How it addresses the problem">
              <List
                items={[
                  "Enables scientific, data-driven decisions.",
                  "Reduces dependency on middlemen and shopkeepers.",
                  "Accessible in native languages with voice guidance.",
                  "Promotes sustainable farming and cost savings.",
                ]}
              />
            </Card>
            <Card title="Innovation and uniqueness">
              <List
                items={[
                  "Offline mode for low‑internet areas.",
                  "Voice-enabled interface for low literacy users.",
                  "Unified platform: soil, weather, pest and market data.",
                  "Feedback loop for continuous improvement.",
                ]}
              />
            </Card>
          </div>
        </div>

        {/* Tools (All working parts in one place) */}
        <section
          id="tools"
          className={`scroll-mt-24 ${!farmer ? "hidden" : ""}`}
        >
          <header className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Working Suite</h2>
            <p className="mt-2 max-w-prose text-slate-600">
              Chatbot, Market & Weather, Pest Detection, and Advisory demo — all
              together.
            </p>
          </header>
          <ToolsSuite />
        </section>

        {/* Technical Approach */}
        <div id="tech" className={`scroll-mt-24 ${farmer ? "hidden" : ""}`}>
          <header className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Technical Approach
            </h2>
          </header>
          <div className="grid gap-6 min-[577px]:grid-cols-2">
            <Card title="Technologies (MERN)">
              <List
                items={[
                  "Frontend: React (Vite) + Tailwind; PWA + i18n.",
                  "Backend: Node.js + Express (REST).",
                  "Database: MongoDB (Atlas/local) via Mongoose.",
                  "Machine Learning: TFJS/CNN for pest detection; crop recommendation service.",
                  "APIs: IMD/OpenWeather (weather), eNAM/Agri Market (prices); Bhashini/Google STT for voice.",
                ]}
              />
            </Card>
            <Card title="Methodology & flow">
              <List
                items={[
                  "Farmer registers profile (soil type, land size, language).",
                  "System fetches weather + soil + crop data.",
                  "Generates advisory (fertilizer, crop choice, irrigation).",
                  "Farmer uploads image; ML detects disease and suggests remedies.",
                  "App shows market prices and alerts; feedback refines advice.",
                ]}
              />
            </Card>
          </div>
        </div>

        {/* Feasibility */}
        <div className={`scroll-mt-24 ${farmer ? "hidden" : ""}`}>
          <header className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Feasibility and Viability
            </h2>
          </header>
          <div className="grid gap-6 min-[577px]:grid-cols-2 lg:grid-cols-3">
            <Card title="Feasibility">
              <List
                items={[
                  "Readily available APIs (weather, mandi rates).",
                  "Open-source datasets (soil, crop, pest).",
                  "Scalable cloud backend; mobile‑first and low cost.",
                ]}
              />
            </Card>
            <Card title="Risks">
              <List
                items={[
                  "Limited digital literacy.",
                  "Patchy internet in rural areas.",
                  "Regional language diversity and adoption trust.",
                ]}
              />
            </Card>
            <Card title="Mitigation">
              <List
                items={[
                  "Govt tie‑ups for credibility; community demos via NGOs.",
                  "Offline features with SMS fallback.",
                  "Voice‑first UX in native languages.",
                ]}
              />
            </Card>
          </div>
        </div>

        {/* Impact */}
        <div id="impact" className={`scroll-mt-24 ${farmer ? "hidden" : ""}`}>
          <header className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Impact and Benefits
            </h2>
          </header>
          <div className="grid gap-6 min-[577px]:grid-cols-2">
            <Card title="Impact on audience">
              <List
                items={[
                  "Saves cost and reduces crop failures.",
                  "Delivers scientific, personalized advice.",
                  "Directly benefits small & marginal farmers (86% in India).",
                ]}
              />
            </Card>
            <Card title="Benefits">
              <List
                items={[
                  "Government/NGO: actionable data for policy.",
                  "Environmental: prevents chemical overuse, supports sustainability.",
                  "Economic: 20–30% yield increase; reduced input cost.",
                  "Social: empowers rural farmers; improves food security.",
                ]}
              />
            </Card>
          </div>
        </div>

        {/* Research */}
        <div id="research" className={`scroll-mt-24 ${farmer ? "hidden" : ""}`}>
          <header className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Research and References
            </h2>
          </header>
          <div className="grid gap-6 min-[577px]:grid-cols-2">
            <Card title="Sources">
              <List
                items={[
                  "IMD / OpenWeather API – forecasts.",
                  "Indian Govt APIs – eNAM, Agri Market, Bhashini.",
                  "PlantVillage dataset – pest/disease recognition.",
                  "FAO & ICAR studies – ICT advisories improve yield by 20–30%.",
                  "NABARD 2022 — 86% of Indian farmers are small/marginal.",
                ]}
              />
            </Card>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Key Capabilities</h3>
              <div className="mt-4 grid gap-3">
                {[
                  { icon: Mic, text: "Voice-enabled multilingual chatbot" },
                  {
                    icon: WifiOff,
                    text: "Offline-first with graceful fallback",
                  },
                  { icon: Shield, text: "Privacy by design; secure data use" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-emerald-600" />
                    <span className="text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Item({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-700">{text}</div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 text-slate-700">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <span className="text-sm md:text-base leading-relaxed break-words">
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}
