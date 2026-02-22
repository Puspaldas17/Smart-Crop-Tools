import { UserPlus, Cloud, Wand2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const STEP_COLORS = [
  { text: "text-emerald-500", ring: "bg-emerald-500/15 text-emerald-600", bar: "from-emerald-500" },
  { text: "text-sky-500",     ring: "bg-sky-500/15 text-sky-600",         bar: "from-sky-500"     },
  { text: "text-violet-500",  ring: "bg-violet-500/15 text-violet-600",   bar: "from-violet-500"  },
  { text: "text-amber-500",   ring: "bg-amber-500/15 text-amber-600",     bar: "from-amber-500"   },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { icon: UserPlus,     key: "s1" },
    { icon: Cloud,        key: "s2" },
    { icon: Wand2,        key: "s3" },
    { icon: CheckCircle2, key: "s4" },
  ] as const;

  return (
    <section
      aria-labelledby="how-title"
      className="glass-card gradient-border rounded-2xl px-4 md:px-8 py-6 md:py-8 animate-fade-in-up"
    >
      <h2 id="how-title" className="text-2xl font-bold tracking-tight animate-fade-in-left">
        {t("how.title")}
      </h2>

      {/* Connector line on desktop */}
      <div className="relative mt-5">
        <div className="hidden md:block absolute top-8 left-[6%] right-[6%] h-0.5 bg-gradient-to-r from-emerald-500/40 via-violet-500/40 to-amber-500/40 rounded-full" />
        <ol className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 relative">
          {steps.map(({ icon: Icon, key }, i) => {
            const c = STEP_COLORS[i];
            return (
              <li
                key={key}
                className="glass-card gradient-border rounded-xl p-5 animate-fade-in-up tilt-card"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                {/* Step number */}
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${c.ring}`}>
                  {i + 1}
                </div>
                {/* Icon */}
                <div className={`mt-4 animate-float ${i % 2 === 0 ? "" : "animate-float-slow"}`} style={{ animationDelay: `${0.5 * i}s` }}>
                  <Icon className={`h-6 w-6 ${c.text}`} />
                </div>
                {/* Content */}
                <div className="mt-3 text-base font-semibold text-foreground">
                  {t(`how.${key}.title`)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {t(`how.${key}.desc`)}
                </div>
                {/* Bottom accent bar */}
                <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${c.bar} to-transparent`} />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
