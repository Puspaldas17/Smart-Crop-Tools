import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { INDIA_CENTROID } from "@/lib/geo";

export default function WeatherCard() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [weather, setWeather] = useState<any>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords(INDIA_CENTROID);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setCoords(INDIA_CENTROID),
    );
  }, []);

  async function fetchSafe(path: string, timeout = 7000): Promise<Response | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(path, { signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch {
      return null;
    }
  }

  async function loadWeather() {
    setWeatherError(null);
    if (!coords) return;
    const path = `/api/weather?lat=${encodeURIComponent(String(coords.lat))}&lon=${encodeURIComponent(String(coords.lon))}`;
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
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Weather</h3>
        <button
          onClick={loadWeather}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        >
          Refresh
        </button>
      </div>
      {weather ? (
        <div className="mt-4 space-y-1 text-sm text-slate-700">
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
        <div className="mt-4 text-sm text-slate-500">
          {weatherError ? weatherError : "Allow location to see local weather."}
        </div>
      )}
    </div>
  );
}
