import { ShieldCheck, Sparkles } from "lucide-react";

export default function Highlight() {
  return (
    <section aria-label="Innovation and trust" className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-8 ring-1 ring-slate-200">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Personalized, data‑driven farming</h3>
          <p className="mt-1 text-slate-600">Built with open data and privacy‑first design to deliver trustworthy advice for every farmer.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-600" /> Innovation‑focused
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Trusted & secure
          </span>
        </div>
      </div>
    </section>
  );
}
