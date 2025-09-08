import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function MarketWidget() {
  const [commodity, setCommodity] = useState("Wheat");
  const state = "Punjab";
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
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

  // Safe fetch helper: returns Response or null on error/timeout
  async function fetchSafe(
    path: string,
    timeout = 7000,
  ): Promise<Response | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(path, { signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) {
      // Do not rethrow - return null so callers can fallback gracefully
      return null;
    }
  }

  async function loadPrices() {
    // Try primary market API
    const params = new URLSearchParams();
    if (commodity) params.set("commodity", commodity);
    if (state) params.set("state", state);
    const path =
      "/api/market" + (params.toString() ? `?${params.toString()}` : "");

    const r = await fetchSafe(path, 7000);
    if (r && r.ok) {
      const data = await r.json();
      setItems(data.items || []);
      setError(null);
      return;
    }

    // Fallback path
    setError("Network unavailable — showing sample data");
    const fallback = await fetchSafe("/api/market", 7000);
    if (fallback && fallback.ok) {
      const data = await fallback.json();
      setItems(data.items || []);
      return;
    }

    // Last-resort local sample
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

  async function loadWeather() {
    setWeatherError(null);
    if (!coords) return;

    const path = `/api/weather?lat=${encodeURIComponent(String(coords.lat))}&lon=${encodeURIComponent(
      String(coords.lon),
    )}`;

    const r = await fetchSafe(path, 7000);
    if (r && r.ok) {
      try {
        const data = await r.json();
        setWeather(data);
        setWeatherError(null);
        return;
      } catch (e) {
        setWeatherError("Weather unavailable");
        setWeather(null);
        return;
      }
    }

    setWeatherError("Weather unavailable");
    setWeather(null);
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
            {weatherError
              ? weatherError
              : "Allow location to see local weather."}
          </div>
        )}
      </div>
    </div>
  );
}
