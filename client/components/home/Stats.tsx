export default function Stats() {
  const items = [
    { value: "20-30%", label: "yield increase", highlight: "from-green-400 to-green-600" },
    { value: "24x7", label: "advisory access", highlight: "from-blue-400 to-blue-600" },
    { value: "Multi-lingual", label: "voice & chat", highlight: "from-purple-400 to-purple-600" },
    { value: "Real-time", label: "weather & prices", highlight: "from-orange-400 to-orange-600" },
  ];
  return (
    <section
      aria-label="Key stats"
      className="relative z-10 -mt-10 max-w-7xl mx-auto px-4 md:px-8"
    >
      <div className="grid gap-4 md:gap-6 text-center grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div 
            key={it.label} 
            className="glass-panel group relative overflow-hidden rounded-[2rem] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-neo hover:bg-white/60 dark:hover:bg-black/60 cursor-default"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Subtle background glow on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${it.highlight}`} />
            
            <div className={`bg-gradient-to-br ${it.highlight} bg-clip-text text-3xl sm:text-4xl lg:text-5xl font-black text-transparent mb-2 drop-shadow-sm transition-transform duration-500 group-hover:scale-105`}>
              {it.value}
            </div>
            <div className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wider">
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
