import { RequestHandler } from "express";

export const getWeather: RequestHandler = async (req, res) => {
  try {
    const { lat, lon } = req.query as { lat?: string; lon?: string };
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) return res.status(501).json({ error: "OPENWEATHER_API_KEY not set" });
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    const resp = await fetch(url);
    if (!resp.ok) return res.status(502).json({ error: "Weather API failed" });
    const data = await resp.json();
    res.json({
      tempC: data.main?.temp,
      humidity: data.main?.humidity,
      windKph: data.wind?.speed ? data.wind.speed * 3.6 : undefined,
      conditions: data.weather?.[0]?.description,
      raw: data,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
};
