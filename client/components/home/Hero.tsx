import { ArrowRight, Sprout, CloudSun, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden rounded-3xl bg-secondary/20 px-4 md:px-8 py-8 md:py-12 min-h-0">
      {/* Animated glow blobs */}
      <div className="hero-glow -top-24 -left-24 h-80 w-80 bg-accent/30 animate-float-slow" />
      <div className="hero-glow -bottom-24 -right-24 h-80 w-80 bg-primary/25 animate-float" style={{ animationDelay: "2s" }} />
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-secondary/20" />

      <div className="relative z-10 grid items-center gap-8 grid-cols-1 md:grid-cols-2">
        {/* Text column */}
        <div className="mx-auto max-w-[min(70vw,800px)] text-center">
          {/* Badge */}
          <div className="animate-fade-in mx-auto inline-flex items-center gap-2 rounded-full border border-accent/50 bg-background/70 px-4 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm backdrop-blur-sm badge-pulse">
            <Sprout className="h-4 w-4 text-primary animate-pulse-dot" />
            {t("hero.badge")}
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 mt-5 font-extrabold leading-tight tracking-tight text-foreground drop-shadow-sm">
            {t("hero.headline1")}
            <span className="block gradient-text">{t("hero.headline2")}</span>
          </h1>

          {/* Body */}
          <p className="animate-fade-in-up delay-200 mt-4 mx-auto max-w-[65ch] text-muted-foreground md:text-lg leading-relaxed">
            {t("hero.body")}
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/#about"
              className="btn-press inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-105 transition-all"
            >
              {t("hero.cta_solution")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/#about"
              className="btn-press inline-flex items-center gap-2 rounded-md border border-input bg-background/80 backdrop-blur px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent/10 transition-all"
            >
              {t("hero.cta_tech")}
            </a>
          </div>

          {/* Tags */}
          <div className="animate-fade-in-up delay-400 mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CloudSun className="h-4 w-4 text-primary" /> {t("hero.tag_weather")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> {t("hero.tag_chat")}
            </span>
          </div>
        </div>

        {/* Card column */}
        <div className="order-first md:order-none animate-fade-in-right delay-200">
          <div className="mx-auto w-full max-w-lg glass-card gradient-border rounded-2xl p-6 tilt-card">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-border/60">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-accent/20" />
              <svg
                viewBox="0 0 800 500"
                className="absolute inset-0 h-full w-full"
                aria-label="Illustration of smart farming dashboard"
                role="img"
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#34d399" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
                <rect x="0"  y="0"   width="800" height="500" fill="url(#g1)" />
                <circle cx="650" cy="90" r="40" fill="#fde68a" />
                <path d="M0 360 C200 300, 300 420, 500 360 C650 320, 700 380, 800 340 L800 500 L0 500 Z" fill="#dcfce7" />
                <g stroke="#86efac" strokeWidth="2" opacity="0.8">
                  <line x1="40" y1="390" x2="760" y2="390" />
                  <line x1="40" y1="420" x2="760" y2="420" />
                  <line x1="40" y1="450" x2="760" y2="450" />
                </g>
                <rect x="60"  y="60"  width="240" height="120" rx="14" fill="#ffffff" opacity="0.82" />
                <rect x="330" y="60"  width="180" height="80"  rx="14" fill="#ffffff" opacity="0.82" />
                <rect x="540" y="160" width="200" height="90"  rx="14" fill="#ffffff" opacity="0.82" />
              </svg>
              {/* Shimmer sweep */}
              <div className="absolute inset-0 shimmer pointer-events-none" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.5),transparent_60%)]" />

              {/* Floating badges */}
              <div className="absolute bottom-3 left-3 flex gap-2 animate-float" style={{ animationDelay: "0.5s" }}>
                {[
                  { icon: CloudSun, label: t("hero.tag_weather_short") },
                  { icon: Sprout,   label: t("hero.tag_advisory")       },
                  { icon: Bot,      label: t("hero.tag_chat_short")     },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border">
                    <Icon className="h-3.5 w-3.5 text-primary" /> {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Tagline bar */}
            <div className="mt-4 rounded-lg bg-gradient-to-r from-[#ff8a00] via-[#2ea043] to-[#007cf0] p-3 text-center text-sm font-bold text-white tracking-wide animate-pulse-glow">
              {t("hero.card_tagline")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
