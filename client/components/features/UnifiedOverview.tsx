import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CloudSun, Sprout, Bug, Store } from "lucide-react";
import { INDIA_CENTROID } from "@/lib/geo";
import { useTranslation } from "react-i18next";

export default function UnifiedOverview() {
  const { t } = useTranslation();
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
          setWeatherError(t("common.error"));
        }
      } else {
        setWeather(null);
        setWeatherError(t("common.error"));
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
      a.push(t("tools.overview.high_temp"));
    if (weather.humidity != null && weather.humidity > 80)
      a.push(t("tools.overview.high_humidity"));
    if (weather.windKph != null && weather.windKph > 35) a.push(t("tools.overview.high_wind"));
    return a.join("; ") || null;
  }, [weather, t]);

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-8 shadow-sm">
      <h3 className="text-xl font-semibold">{t("tools.overview.title")}</h3>
      <p className="mt-1 text-sm text-slate-600">
        {t("tools.overview.desc")}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sprout className="h-4 w-4 text-emerald-600" /> {t("tools.overview.soil")}
          </div>
          <div className="mt-2 text-sm text-slate-700">
            <div>{t("tools.overview.farmer")}: {farmer?.name || "—"}</div>
            <div>{t("tools.overview.soil_type")}: {farmer?.soilType || t("tools.overview.unknown")}</div>
            <div>
              {t("tools.overview.land_size")}: {farmer?.landSize ? `${farmer.landSize} ${t("tools.overview.acres")}` : "—"}
            </div>
            <a
              href="/login"
              className="mt-2 inline-block text-xs text-emerald-700 underline"
            >
              {t("tools.overview.update_profile")}
            </a>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CloudSun className="h-4 w-4 text-amber-600" /> {t("tools.overview.weather")}
          </div>
          <div className="mt-2 text-sm text-slate-700">
            {weather ? (
              <>
                <div>{t("tools.overview.temp")}: {weather.tempC}°C</div>
                <div>{t("tools.overview.humidity")}: {weather.humidity}%</div>
                <div>{t("tools.overview.wind")}: {Math.round(weather.windKph || 0)} km/h</div>
                <div>{t("tools.overview.cond")}: {weather.conditions || "—"}</div>
                {alertText && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-900">
                    <AlertTriangle className="h-3 w-3" /> {alertText}
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500">
                {weatherError || t("tools.overview.allow_location")}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Store className="h-4 w-4 text-blue-600" /> {t("tools.overview.market")}
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
              <div className="text-slate-500">{t("market.empty")}</div>
            )}
            <a
              href="#market"
              className="mt-2 inline-block text-xs text-blue-700 underline"
            >
              {t("tools.overview.open_market")}
            </a>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bug className="h-4 w-4 text-rose-600" /> {t("tools.overview.pest")}
          </div>
          <div className="mt-2 text-sm text-slate-700">
            <div>{t("tools.overview.upload_leaf")}</div>
            <a
              href="#pest"
              className="mt-2 inline-block text-xs text-rose-700 underline"
            >
              {t("tools.overview.open_detector")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
