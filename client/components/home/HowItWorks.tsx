import { UserPlus, Cloud, Wand2, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create profile",
      desc: "Language, soil type and field details.",
    },
    {
      icon: Cloud,
      title: "Gather data",
      desc: "Weather, soil and crop history.",
    },
    {
      icon: Wand2,
      title: "Generate advice",
      desc: "Personalized crop, irrigation and input plan.",
    },
    {
      icon: CheckCircle2,
      title: "Act & improve",
      desc: "Track outcomes and refine recommendations.",
    },
  ];

  return (
    <section
      aria-labelledby="how-title"
      className="relative overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-br from-secondary/10 to-transparent px-4 md:px-8 py-16 md:py-24 max-w-7xl mx-auto shadow-sm"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 id="how-title" className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            A seamless journey from setup to successful harvest.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />

          <ol className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <li
                key={title}
                className="glass-panel group relative overflow-hidden rounded-[2rem] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl bg-white/40 dark:bg-black/40 border-white/30 backdrop-blur-xl"
              >
                {/* Step Number Badge */}
                <div className="absolute top-4 left-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/50 backdrop-blur-md border border-white/20 font-bold text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                
                <div className="mx-auto mt-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white to-white/40 dark:from-black dark:to-black/40 shadow-inner border border-white/50 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="h-10 w-10 text-primary drop-shadow-sm" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
