import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function MarketWidget() {
  const [commodity, setCommodity] = useState("Wheat");
  const state = "Punjab";
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords({ lat: 31.1471, lon: 75.3412 }); // Punjab centroid fallback
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setCoords({ lat: 31.1471, lon: 75.3412 }),
    );
  }, []);

  async function loadPrices() {
    try {
      // If offline, skip remote fetch and let server return sample data
      const params = new URLSearchParams();
      if (commodity) params.set("commodity", commodity);
      if (state) params.set("state", state);
      const path =
        "/api/market" + (params.toString() ? `?${params.toString()}` : "");

      const r = await fetch(path);
      if (r.ok) {
        const data = await r.json();
        setItems(data.items || []);
        setError(null);
        return;
      }
      // non-ok response -> fallback to sample
      setError("Network unavailable — showing sample data");
    } catch (err) {
      // suppress noisy stack traces from the environment; set user-friendly error
      setError("Network unavailable — showing sample data");
    }

    // final fallback: try to fetch without params, then local sample
    try {
      const fallback = await fetch("/api/market");
      const data = await fallback.json();
      setItems(data.items || []);
    } catch (e2) {
      setItems([
        {
          commodity: "Wheat",
          state: "Punjab",
          mandi: "Ludhiana",
          unit: "Qtl",
          price: 2200,
        },
      ]);
    }
  }

  async function loadWeather() {
    try {
      if (!coords) return;
      const url = new URL("/api/weather", window.location.origin);
      url.searchParams.set("lat", String(coords.lat));
      url.searchParams.set("lon", String(coords.lon));
      const r = await fetch(url);
      if (!r.ok) throw new Error(`weather fetch failed: ${r.status}`);
      const data = await r.json();
      setWeather(data);
    } catch (e) {
      console.error("Weather load error:", e);
      setWeather(null);
    }
  }

  useEffect(() => {
    loadPrices();
  }, [commodity, state]);
  useEffect(() => {
    loadWeather();
  }, [coords]);
  useEffect(() => {
    const handler = () => loadWeather();
    window.addEventListener("weather:refresh", handler as any);
    return () => window.removeEventListener("weather:refresh", handler as any);
  }, [coords]);

  const alertText = useMemo(() => {
    if (!weather) return null;
    const a: string[] = [];
    if (weather.tempC != null && (weather.tempC < 12 || weather.tempC > 35))
      a.push("Extreme temperature alert");
    if (weather.humidity != null && weather.humidity > 80)
      a.push("High humidity—risk of fungal disease");
    if (weather.windKph != null && weather.windKph > 35)
      a.push("High wind speed—protect crops");
    return a.join("; ") || null;
  }, [weather]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Market Prices (Punjab)</h3>
          <div className="flex gap-2">
            <input
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-36 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
              State: Punjab
            </span>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          {error && (
            <div className="mb-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">
              {error}
            </div>
          )}
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="px-2 py-1">Commodity</th>
                <th className="px-2 py-1">State</th>
                <th className="px-2 py-1">Mandi</th>
                <th className="px-2 py-1">Unit</th>
                <th className="px-2 py-1">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-1">{i.commodity}</td>
                  <td className="px-2 py-1">{i.state}</td>
                  <td className="px-2 py-1">{i.mandi}</td>
                  <td className="px-2 py-1">{i.unit}</td>
                  <td className="px-2 py-1">₹ {i.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Weather</h3>
          <button
            onClick={loadWeather}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm"
          >
            Refresh
          </button>
        </div>
        {weather ? (
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            <div>Temperature: {weather.tempC}°C</div>
            <div>Humidity: {weather.humidity}%</div>
            <div>Wind: {Math.round(weather.windKph || 0)} km/h</div>
            <div>Conditions: {weather.conditions}</div>
            {alertText && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-amber-900">
                <AlertTriangle className="h-4 w-4" /> {alertText}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-500">
            Allow location to see local weather.
          </div>
        )}
      </div>
    </div>
  );
}
