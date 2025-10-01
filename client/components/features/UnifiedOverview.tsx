import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CloudSun, Sprout, Bug, Store } from "lucide-react";
import { INDIA_CENTROID } from "@/lib/geo";

export default function UnifiedOverview() {
  const { farmer } = useAuth();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [weather, setWeather] = useState<any>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [market, setMarket] = useState<any[]>([]);

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

  async function fetchSafe(path: string, timeout = 7000) {
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

  useEffect(() => {
    (async () => {
      if (!coords) return;
      setWeatherError(null);
      const r = await fetchSafe(
        `/api/weather?lat=${encodeURIComponent(String(coords.lat))}&lon=${encodeURIComponent(String(coords.lon))}`,
        7000,
      );
      if (r && r.ok) {
        try {
          const data = await r.json();
          setWeather(data);
        } catch {
          setWeather(null);
          setWeatherError("Weather unavailable");
        }
      } else {
        setWeather(null);
        setWeatherError("Weather unavailable");
      }
    })();
  }, [coords]);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams({ commodity: "Wheat" });
      const r = await fetchSafe(`/api/market?${params.toString()}`, 7000);
      if (r && r.ok) {
        const data = await r.json();
        setMarket((data.items || []).slice(0, 3));
      } else setMarket([]);
    })();
  }, []);

  const alertText = useMemo(() => {
    if (!weather) return null;
    const a: string[] = [];
    if (weather.tempC != null && (weather.tempC < 12 || weather.tempC > 35))
      a.push("Extreme temperature");
    if (weather.humidity != null && weather.humidity > 80)
      a.push("High humidity");
    if (weather.windKph != null && weather.windKph > 35) a.push("High wind");
    return a.join("; ") || null;
  }, [weather]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Unified Overview</h3>
      <p className="mt-1 text-sm text-slate-600">
        Soil, weather, pest and market — all in one place.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sprout className="h-4 w-4 text-emerald-600" /> Soil
          </div>
          <div className="mt-2 text-sm text-slate-700">
            <div>Farmer: {farmer?.name || "—"}</div>
            <div>Soil type: {farmer?.soilType || "Unknown"}</div>
            <div>
              Land size: {farmer?.landSize ? `${farmer.landSize} acres` : "—"}
            </div>
            <a
              href="/login"
              className="mt-2 inline-block text-xs text-emerald-700 underline"
            >
              Update profile
            </a>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CloudSun className="h-4 w-4 text-amber-600" /> Weather
          </div>
          <div className="mt-2 text-sm text-slate-700">
            {weather ? (
              <>
                <div>Temp: {weather.tempC}°C</div>
                <div>Humidity: {weather.humidity}%</div>
                <div>Wind: {Math.round(weather.windKph || 0)} km/h</div>
                <div>Cond: {weather.conditions || "—"}</div>
                {alertText && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-900">
                    <AlertTriangle className="h-3 w-3" /> {alertText}
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500">
                {weatherError || "Allow location for local weather."}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Store className="h-4 w-4 text-blue-600" /> Market
          </div>
          <div className="mt-2 text-sm text-slate-700">
            {market.length ? (
              <ul className="space-y-1">
                {market.map((m, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{m.mandi}</span>
                    <span className="font-medium">₹ {m.price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500">No data</div>
            )}
            <a
              href="#market"
              className="mt-2 inline-block text-xs text-blue-700 underline"
            >
              Open market & weather
            </a>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bug className="h-4 w-4 text-rose-600" /> Pest
          </div>
          <div className="mt-2 text-sm text-slate-700">
            <div>Upload a leaf/crop image to analyze.</div>
            <a
              href="#pest"
              className="mt-2 inline-block text-xs text-rose-700 underline"
            >
              Open detector
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
