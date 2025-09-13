import { ArrowRight, Sprout, CloudSun, Bot } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-10 md:p-16">
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
            One unified platform for crop advice, market prices, weather alerts and
            pest detection — multilingual and voice‑enabled.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/#solution"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:brightness-95"
            >
              See Solution
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/#tech"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Technical Approach
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><CloudSun className="h-4 w-4 text-emerald-600"/> Weather aware</span>
            <span className="inline-flex items-center gap-2"><Bot className="h-4 w-4 text-emerald-600"/> Voice & chat</span>
          </div>
        </div>
        <div className="order-first md:order-none">
          <div className="mx-auto w-full max-w-lg rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <div className="h-44 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 ring-1 ring-slate-200/60" />
            <div className="mt-4 rounded-lg bg-gradient-to-r from-[#ff8a00] to-[#2ea043] p-3 text-center text-sm font-semibold text-white">
              Personalized, data‑driven farming
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
