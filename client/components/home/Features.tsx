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
      colSpan: "md:col-span-2 lg:col-span-2",
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      icon: CloudSun,
      title: "Precision Weather",
      desc: "Hyper-local forecasts to help you plan sowing and harvesting with confidence.",
      colSpan: "md:col-span-1 lg:col-span-1",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      icon: Camera,
      title: "Instant Disease Detection",
      desc: "Snap a photo to identify pests and get immediate remedy suggestions.",
      colSpan: "md:col-span-1 lg:col-span-1",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      icon: Brain,
      title: "AI Farming Assistant",
      desc: "Instant answers to your farming queries, available 24/7.",
      colSpan: "md:col-span-2 lg:col-span-1",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Languages,
      title: "Native Language Support",
      desc: "Interact naturally with voice commands in your local dialect.",
      colSpan: "md:col-span-1 lg:col-span-2",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "Your farm data is yours. We ensure complete privacy and security.",
      colSpan: "md:col-span-1 lg:col-span-3",
      color: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
    },
  ];

  return (
    <section
      aria-labelledby="features-title"
      className="py-24 max-w-7xl mx-auto px-4 md:px-8"
    >
      <div className="text-center mb-16">
        <h2 id="features-title" className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Unmatched <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Capabilities</span>
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Everything you need to modernize your farming operations, elegantly integrated into one platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
        {features.map(({ icon: Icon, title, desc, colSpan, color, bg, border }, i) => (
          <div
            key={title}
            className={`glass-panel group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between ${colSpan}`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${bg.replace('/10', '')}`} />
            
            <div className="relative z-10">
              <div className={`inline-flex p-4 rounded-2xl mb-6 ${bg} ${border} border shadow-inner backdrop-blur-md`}>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
