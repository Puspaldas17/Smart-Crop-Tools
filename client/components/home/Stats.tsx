export default function Stats() {
  const items = [
    { value: "20–30%", label: "yield increase" },
    { value: "24x7", label: "advisory access" },
    { value: "Multi‑lingual", label: "voice & chat" },
    { value: "Real‑time", label: "weather & prices" },
  ];
  return (
    <section
      aria-label="Key stats"
      className="rounded-2xl border border-border bg-card/70 px-4 md:px-8 py-8 md:py-16 backdrop-blur"
    >
      <div className="grid gap-6 md:gap-8 text-center min-[577px]:grid-cols-2 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="space-y-1">
            <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
              {it.value}
            </div>
            <div className="text-sm text-muted-foreground">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
