import {
  Sprout,
  CloudSun,
  Brain,
  Languages,
  Shield,
  Camera,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Sprout,
      title: "Crop advisory",
      desc: "Fertilizer, irrigation and crop selection guidance.",
    },
    {
      icon: CloudSun,
      title: "Weather alerts",
      desc: "Localized forecasts and actionable notifications.",
    },
    {
      icon: Brain,
      title: "Insights",
      desc: "Chatbot for quick answers and best practices.",
    },
    {
      icon: Languages,
      title: "Multilingual",
      desc: "Voice‑first UX in native languages.",
    },
    {
      icon: Camera,
      title: "Pest detection",
      desc: "On‑device image analysis for pests and diseases.",
    },
    {
      icon: Shield,
      title: "Privacy by design",
      desc: "Secure handling of farmer data and preferences.",
    },
  ];
  return (
    <section
      aria-labelledby="features-title"
      className="rounded-2xl bg-card px-4 md:px-8 py-8 md:py-16 ring-1 ring-border"
    >
      <h2 id="features-title" className="text-2xl font-bold tracking-tight">
        What you get
      </h2>
      <div className="mt-6 grid gap-6 md:gap-8 min-[577px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-border p-6 hover:shadow-sm"
          >
            <Icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-base font-semibold text-foreground">
              {title}
            </div>
            <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
