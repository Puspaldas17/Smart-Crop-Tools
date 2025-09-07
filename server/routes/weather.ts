import { RequestHandler } from "express";

export const getWeather: RequestHandler = async (req, res) => {
  try {
    const { lat, lon } = req.query as { lat?: string; lon?: string };
    if (!lat || !lon)
      return res.status(400).json({ error: "lat and lon required" });
    const key = process.env.OPENWEATHER_API_KEY;

    if (key) {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
      const resp = await fetch(url);
      if (!resp.ok)
        return res.status(502).json({ error: "Weather API failed" });
      const data = await resp.json();
      return res.json({
        tempC: data.main?.temp,
        humidity: data.main?.humidity,
        windKph: data.wind?.speed ? data.wind.speed * 3.6 : undefined,
        conditions: data.weather?.[0]?.description,
        raw: data,
        source: "openweather",
      });
    }

    // Fallback to Open-Meteo (no API key required)
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const r = await fetch(omUrl);
    if (!r.ok) return res.status(502).json({ error: "Weather API failed" });
    const w = await r.json();
    const cur = w.current || {};
    const code = cur.weather_code as number | undefined;
    const description = weatherCodeToText(code);
    return res.json({
      tempC: cur.temperature_2m,
      humidity: cur.relative_humidity_2m,
      windKph: cur.wind_speed_10m,
      conditions: description,
      raw: w,
      source: "open-meteo",
    });
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
