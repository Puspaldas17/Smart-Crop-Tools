import { CheckCircle2, Sprout, Mic, WifiOff, CloudSun, Languages, Brain, Shield } from "lucide-react";

export default function Index() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffedd5] via-white to-[#dcfce7] p-8 md:p-12">
        <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Smart India Hackathon 2025 • Team: The Compilers • PS: SIH25010
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Smart Crop Advisory System
            </h1>
            <p className="mt-4 max-w-prose text-slate-600 md:text-lg">
              AI-powered, multilingual guidance for small and marginal farmers—combining soil, weather, market and pest insights into one simple, voice-enabled experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#solution" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:brightness-95">See Solution</a>
              <a href="#tech" className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Technical Approach</a>
            </div>
          </div>
          <div className="order-first md:order-none">
            <div className="mx-auto aspect-[4/3] w-full max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Sprout, label: "Crop advice" },
                  { icon: CloudSun, label: "Weather alerts" },
                  { icon: Brain, label: "AI insights" },
                  { icon: Languages, label: "Multilingual" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                    <Icon className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-gradient-to-r from-[#ff8a00] to-[#2ea043] p-3 text-center text-sm font-semibold text-white">
                Personalized, data‑driven farming
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff8a00]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </section>

      {/* Proposed Solution */}
      <section id="solution" className="scroll-mt-24">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Proposed Solution</h2>
          <p className="mt-2 max-w-prose text-slate-600">
            A mobile app and chatbot that work online and offline to deliver personalized crop, fertilizer, irrigation and pest management—backed by real‑time weather and market data.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Detailed explanation">
            <List items={[
              "AI-driven mobile app and chatbot with multilingual and voice support.",
              "Personalized crop, fertilizer and pest advisory using soil, weather and crop history.",
              "Real-time market price updates and weather alerts.",
              "Image-based pest/disease detection.",
            ]} />
          </Card>
          <Card title="How it addresses the problem">
            <List items={[
              "Enables scientific, data-driven decisions.",
              "Reduces dependency on middlemen and shopkeepers.",
              "Accessible in native languages with voice guidance.",
              "Promotes sustainable farming and cost savings.",
            ]} />
          </Card>
          <Card title="Innovation and uniqueness">
            <List items={[
              "Offline mode for low‑internet areas.",
              "Voice-enabled interface for low literacy users.",
              "Unified platform: soil, weather, pest and market data.",
              "Feedback loop for continuous improvement.",
            ]} />
          </Card>
        </div>
      </section>

      {/* Technical Approach */}
      <section id="tech" className="scroll-mt-24">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Technical Approach</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Technologies">
            <List items={[
              "Frontend: Android app (Flutter / React Native).",
              "Backend: Node.js or Django with PostgreSQL / Firebase.",
              "AI/ML: Crop recommendation and CNN-based pest/disease detection (PlantVillage).",
              "APIs: IMD/OpenWeather for weather, Agri Market/eNAM for prices.",
              "Language/Voice: Bhashini, Google Speech‑to‑Text, Indic NLP.",
            ]} />
          </Card>
          <Card title="Methodology & flow">
            <List items={[
              "Farmer registers profile (soil type, land size, language).",
              "System fetches weather + soil + crop data.",
              "Generates advisory (fertilizer, crop choice, irrigation).",
              "Farmer uploads image; ML detects disease and suggests remedies.",
              "App shows market prices and alerts; feedback refines advice.",
            ]} />
          </Card>
        </div>
      </section>

      {/* Feasibility */}
      <section id="feasibility" className="scroll-mt-24">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Feasibility and Viability</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Feasibility">
            <List items={[
              "Readily available APIs (weather, mandi rates).",
              "Open-source datasets (soil, crop, pest).",
              "Scalable cloud backend; mobile‑first and low cost.",
            ]} />
          </Card>
          <Card title="Risks">
            <List items={[
              "Limited digital literacy.",
              "Patchy internet in rural areas.",
              "Regional language diversity and adoption trust.",
            ]} />
          </Card>
          <Card title="Mitigation">
            <List items={[
              "Govt tie‑ups for credibility; community demos via NGOs.",
              "Offline features with SMS fallback.",
              "Voice‑first UX in native languages.",
            ]} />
          </Card>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="scroll-mt-24">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Impact and Benefits</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Impact on audience">
            <List items={[
              "Saves cost and reduces crop failures.",
              "Delivers scientific, personalized advice.",
              "Directly benefits small & marginal farmers (86% in India).",
            ]} />
          </Card>
          <Card title="Benefits">
            <List items={[
              "Government/NGO: actionable data for policy.",
              "Environmental: prevents chemical overuse, supports sustainability.",
              "Economic: 20–30% yield increase; reduced input cost.",
              "Social: empowers rural farmers; improves food security.",
            ]} />
          </Card>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="scroll-mt-24">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Research and References</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Sources">
            <List items={[
              "IMD / OpenWeather API – forecasts.",
              "Indian Govt APIs – eNAM, Agri Market, Bhashini.",
              "PlantVillage dataset – pest/disease recognition.",
              "FAO & ICAR studies – ICT advisories improve yield by 20–30%.",
              "NABARD 2022 – 86% of Indian farmers are small/marginal.",
            ]} />
          </Card>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Key Capabilities</h3>
            <div className="mt-4 grid gap-3">
              {[
                { icon: Mic, text: "Voice-enabled multilingual chatbot" },
                { icon: WifiOff, text: "Offline-first with graceful fallback" },
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
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
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
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
