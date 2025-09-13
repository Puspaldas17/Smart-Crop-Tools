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
      className="rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur"
    >
      <div className="grid gap-6 text-center sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="space-y-1">
            <div className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
              {it.value}
            </div>
            <div className="text-sm text-slate-600">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
