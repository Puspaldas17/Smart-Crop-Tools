import { ArrowRight, Sprout, CloudSun, Bot } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-10 md:p-16 ring-1 ring-slate-200/60">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-medium text-amber-700 shadow-sm backdrop-blur-sm">
            <Sprout className="h-4 w-4" />
            Built for small & marginal farmers
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            Smart Crop Advisory
          </h1>
          <p className="mt-4 max-w-prose text-slate-600 md:text-lg">
            One unified platform for crop advice, market prices, weather alerts
            and pest detection — multilingual and voice‑enabled.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/#solution"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              See Solution
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/#tech"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Technical Approach
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <CloudSun className="h-4 w-4 text-emerald-600" /> Weather aware
            </span>
            <span className="inline-flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-600" /> Voice & chat
            </span>
          </div>
        </div>
        <div className="order-first md:order-none">
          <div className="mx-auto w-full max-w-lg rounded-2xl bg-white/80 p-6 shadow-md ring-1 ring-slate-200 backdrop-blur">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-slate-200/60">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50" />
              <svg
                viewBox="0 0 800 500"
                className="absolute inset-0 h-full w-full"
                aria-label="Illustration of smart farming dashboard"
                role="img"
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                    <stop
                      offset="100%"
                      stopColor="#f59e0b"
                      stopOpacity="0.25"
                    />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="800" height="500" fill="url(#g1)" />
                <circle cx="650" cy="90" r="40" fill="#fde68a" />
                <path
                  d="M0 360 C200 300, 300 420, 500 360 C650 320, 700 380, 800 340 L800 500 L0 500 Z"
                  fill="#dcfce7"
                />
                <g stroke="#86efac" strokeWidth="2" opacity="0.8">
                  <line x1="40" y1="390" x2="760" y2="390" />
                  <line x1="40" y1="420" x2="760" y2="420" />
                  <line x1="40" y1="450" x2="760" y2="450" />
                </g>
                <rect
                  x="60"
                  y="60"
                  width="240"
                  height="120"
                  rx="14"
                  fill="#ffffff"
                  opacity="0.8"
                />
                <rect
                  x="330"
                  y="60"
                  width="180"
                  height="80"
                  rx="14"
                  fill="#ffffff"
                  opacity="0.8"
                />
                <rect
                  x="540"
                  y="160"
                  width="200"
                  height="90"
                  rx="14"
                  fill="#ffffff"
                  opacity="0.8"
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_60%)]" />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
                  <CloudSun className="h-4 w-4 text-emerald-600" /> Weather
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
                  <Sprout className="h-4 w-4 text-emerald-600" /> Advisory
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
                  <Bot className="h-4 w-4 text-emerald-600" /> Chat
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-gradient-to-r from-[#ff8a00] to-[#2ea043] p-3 text-center text-sm font-semibold text-white">
              Personalized, data‑driven farming
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
