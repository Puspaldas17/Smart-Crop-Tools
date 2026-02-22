import { Sprout, CloudSun, Brain, Languages, Shield, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

const ICON_COLORS = [
  "text-emerald-500", "text-sky-500", "text-violet-500",
  "text-orange-500", "text-rose-500", "text-teal-500",
];
const ICON_BG = [
  "bg-emerald-500/10", "bg-sky-500/10", "bg-violet-500/10",
  "bg-orange-500/10", "bg-rose-500/10", "bg-teal-500/10",
];

export default function Features() {
  const { t } = useTranslation();

  const features = [
    { icon: Sprout,    key: "f1" },
    { icon: CloudSun,  key: "f2" },
    { icon: Brain,     key: "f3" },
    { icon: Languages, key: "f4" },
    { icon: Camera,    key: "f5" },
    { icon: Shield,    key: "f6" },
  ] as const;

  return (
    <section
      aria-labelledby="features-title"
      className="rounded-2xl glass-card px-4 md:px-8 py-6 md:py-8 animate-fade-in-up"
    >
      <h2 id="features-title" className="text-2xl font-bold tracking-tight animate-fade-in-left">
        {t("features.title")}
      </h2>
      <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, key }, i) => (
          <div
            key={key}
            className="glass-card gradient-border rounded-xl p-5 tilt-card animate-scale-in"
            style={{ animationDelay: `${0.08 * i}s` }}
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${ICON_BG[i]}`}>
              <Icon className={`h-5 w-5 ${ICON_COLORS[i]}`} />
            </div>
            <div className="mt-3 text-base font-semibold text-foreground">
              {t(`features.${key}.title`)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {t(`features.${key}.desc`)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
