import { Sprout, CloudSun, Brain } from "lucide-react";

export default function Features() {
  const features = [
    { icon: Sprout, title: "Smart advisory", desc: "Guidance for crop, fertilizer and irrigation." },
    { icon: CloudSun, title: "Weather aware", desc: "Localized forecasts and timely alerts." },
    { icon: Brain, title: "Quick insights", desc: "Ask questions via chat and get answers fast." },
  ];
  return (
    <section
      aria-labelledby="features-title"
      className="rounded-2xl bg-white p-8 ring-1 ring-slate-200"
    >
      <h2 id="features-title" className="text-2xl font-bold tracking-tight">
        Highlights
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 p-6 hover:shadow-sm"
          >
            <Icon className="h-5 w-5 text-emerald-600" />
            <div className="mt-3 text-base font-semibold text-slate-900">
              {title}
            </div>
            <div className="mt-1 text-sm text-slate-600">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
