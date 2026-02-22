import { useTranslation } from "react-i18next";

export default function Stats() {
  const { t } = useTranslation();

  const items = [
    { key: "s1" },
    { key: "s2" },
    { key: "s3" },
    { key: "s4" },
  ] as const;

  return (
    <section
      aria-label="Key stats"
      className="glass-card gradient-border rounded-2xl px-4 md:px-8 py-5 md:py-8 animate-fade-in-up delay-200"
    >
      <div className="grid gap-6 md:gap-8 text-center grid-cols-2 md:grid-cols-4">
        {items.map(({ key }, i) => (
          <div
            key={key}
            className={`space-y-1 stat-card animate-fade-in-up`}
            style={{ animationDelay: `${0.15 + i * 0.1}s` }}
          >
            <div className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
              {t(`stats.${key}.value`)}
            </div>
            <div className="text-sm text-muted-foreground">{t(`stats.${key}.label`)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
