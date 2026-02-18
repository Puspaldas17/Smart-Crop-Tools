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
      title: "Smart Crop Advisory",
      desc: "Expert guidance on seeds, fertilizers, and irrigation tailored to your soil.",
    },
    {
      icon: CloudSun,
      title: "Precision Weather",
      desc: "Hyper-local forecasts to help you plan sowing and harvesting with confidence.",
    },
    {
      icon: Brain,
      title: "AI Farming Assistant",
      desc: "Instant answers to your farming queries, available 24/7.",
    },
    {
      icon: Languages,
      title: "Native Language Support",
      desc: "Interact naturally with voice commands in your local dialect.",
    },
    {
      icon: Camera,
      title: "Instant Disease Detection",
      desc: "Snap a photo to identify pests and get immediate remedy suggestions.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "Your farm data is yours. We ensure complete privacy and security.",
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
