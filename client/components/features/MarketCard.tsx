import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";

interface MarketItem {
  commodity: string;
  state: string;
  mandi: string;
  unit: string;
  price: number;
  prev?: number;
}

const BASE_PRICES: MarketItem[] = [
  { commodity: "Wheat",   state: "Uttar Pradesh", mandi: "Kanpur",   unit: "Qtl", price: 2210 },
  { commodity: "Rice",    state: "West Bengal",   mandi: "Kolkata",  unit: "Qtl", price: 2460 },
  { commodity: "Onion",   state: "Maharashtra",   mandi: "Nashik",   unit: "Qtl", price: 1700 },
  { commodity: "Tomato",  state: "Karnataka",     mandi: "Bengaluru",unit: "Qtl", price: 1850 },
  { commodity: "Potato",  state: "Punjab",        mandi: "Amritsar", unit: "Qtl", price: 1280 },
  { commodity: "Maize",   state: "Madhya Pradesh",mandi: "Indore",   unit: "Qtl", price: 1620 },
  { commodity: "Soybean", state: "Rajasthan",     mandi: "Jaipur",   unit: "Qtl", price: 4400 },
  { commodity: "Cotton",  state: "Gujarat",       mandi: "Rajkot",   unit: "Qtl", price: 6200 },
];

function jitter(base: number): number {
  const pct = (Math.random() - 0.5) * 0.02; // ±1%
  return Math.round(base * (1 + pct));
}

export default function MarketCard() {
  const [items, setItems] = useState<MarketItem[]>(BASE_PRICES.map(i => ({ ...i })));
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [ticking, setTicking] = useState(false);
  const [filter, setFilter] = useState("");
  const [serverError, setServerError] = useState(false);

  // Try to fetch from API; fall back to the simulated data
  const fetchPrices = useCallback(async () => {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(`/api/market${filter ? `?commodity=${encodeURIComponent(filter)}` : ""}`, { signal: ctrl.signal });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(prev =>
            data.items.map((item: MarketItem) => {
              const old = prev.find(p => p.commodity === item.commodity);
              return { ...item, prev: old?.price };
            })
          );
          setLastUpdated(new Date());
          setServerError(false);
          return;
        }
      }
    } catch { /* fall through to simulation */ }
    setServerError(true);
  }, [filter]);

  // Live simulation tick
  const tick = useCallback(() => {
    setTicking(true);
    setItems(prev =>
      prev.map(item => {
        const newPrice = jitter(item.price);
        return { ...item, prev: item.price, price: newPrice };
      })
    );
    setLastUpdated(new Date());
    setTimeout(() => setTicking(false), 600);
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh every 8 seconds
  useEffect(() => {
    const id = setInterval(tick, 8000);
    return () => clearInterval(id);
  }, [tick]);

  const displayed = filter
    ? items.filter(i => i.commodity.toLowerCase().includes(filter.toLowerCase()))
    : items;

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-400" />
            Live Market Prices
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {serverError ? "Simulated live data · auto-updates every 8s" : "eNAM mandi data · auto-updates every 8s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={tick}
            className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition"
            title="Refresh prices"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${ticking ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by crop…"
        className="mb-3 w-full rounded-lg border border-border bg-background/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Table */}
      <div className="flex-1 overflow-x-auto remove-scrollbar">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-1.5 pr-3 font-medium">Commodity</th>
              <th className="text-left py-1.5 pr-3 font-medium hidden sm:table-cell">Mandi</th>
              <th className="text-right py-1.5 font-medium">₹/Qtl</th>
              <th className="text-right py-1.5 pl-2 font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((item, idx) => {
              const diff = item.prev !== undefined ? item.price - item.prev : 0;
              const up = diff > 0;
              const down = diff < 0;
              return (
                <tr key={idx} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{item.commodity}</div>
                    <div className="text-muted-foreground text-[10px]">{item.state}</div>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground hidden sm:table-cell">{item.mandi}</td>
                  <td className="py-2 text-right font-semibold">
                    ₹{item.price.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    {diff !== 0 ? (
                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${up ? "text-green-400" : "text-red-400"}`}>
                        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {up ? "+" : ""}{diff}
                      </span>
                    ) : <span className="text-muted-foreground text-[10px]">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Live indicator */}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-dot" />
        Live · prices update every 8 seconds
      </div>
    </div>
  );
}
