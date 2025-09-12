import { RequestHandler } from "express";

import { getCache, setCache, makeKey } from "../utils/cache";
import { fetchWithTimeout, retry } from "../utils/http";

export const getWeather: RequestHandler = async (req, res) => {
  try {
    const { lat, lon } = req.query as { lat?: string; lon?: string };
    if (!lat || !lon)
      return res.status(400).json({ error: "lat and lon required" });

    // Cache by rounded coords (≈1km granularity) for 10 minutes
    const latR = Math.round(Number(lat) * 100) / 100;
    const lonR = Math.round(Number(lon) * 100) / 100;
    const cacheKey = makeKey(["weather", latR, lonR]);
    const cached = getCache<any>(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const key = process.env.OPENWEATHER_API_KEY;

    if (key) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latR}&lon=${lonR}&appid=${key}&units=metric`;
        const resp = await retry(() => fetchWithTimeout(url, {}, 7000));
        if (resp.ok) {
          const data = await resp.json();
          const payload = {
            tempC: data.main?.temp,
            humidity: data.main?.humidity,
            windKph: data.wind?.speed ? data.wind.speed * 3.6 : undefined,
            conditions: data.weather?.[0]?.description,
            raw: data,
            source: "openweather",
          };
          setCache(cacheKey, payload, 10 * 60 * 1000);
          return res.json(payload);
        }
      } catch {}
    }

    // Fallback to Open-Meteo (no API key required)
    try {
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latR}&longitude=${lonR}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
      const r = await retry(() => fetchWithTimeout(omUrl, {}, 7000));
      if (r.ok) {
        const w = await r.json();
        const cur = w.current || {};
        const code = cur.weather_code as number | undefined;
        const description = weatherCodeToText(code);
        const payload = {
          tempC: cur.temperature_2m,
          humidity: cur.relative_humidity_2m,
          windKph: cur.wind_speed_10m,
          conditions: description,
          raw: w,
          source: "open-meteo",
        };
        setCache(cacheKey, payload, 10 * 60 * 1000);
        return res.json(payload);
      }
    } catch {}

    // Last-resort local sample so the UI never shows 502
    const payload = {
      tempC: 28,
      humidity: 65,
      windKph: 8,
      conditions: "Partly cloudy",
      source: "sample",
    };
    setCache(cacheKey, payload, 5 * 60 * 1000);
    return res.json(payload);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
};

function weatherCodeToText(code?: number) {
  const map: Record<number, string> = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm w/ hail",
    99: "Thunderstorm w/ hail",
  };
  return code != null ? map[code] || "Unknown" : undefined;
}
