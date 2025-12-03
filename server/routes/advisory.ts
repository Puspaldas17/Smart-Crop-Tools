import { RequestHandler } from "express";
import { supabase } from "../supabase";

function generateAdvice({
  tempC,
  humidity,
}: {
  tempC?: number;
  humidity?: number;
}) {
  const parts: string[] = [];
  if (tempC !== undefined) {
    if (tempC < 15)
      parts.push("Low temperature: prefer wheat/mustard; reduce irrigation.");
    else if (tempC < 28)
      parts.push(
        "Moderate temperature: paddy/vegetables suitable; standard irrigation schedule.",
      );
    else
      parts.push(
        "High temperature: select drought‑tolerant crops; irrigate in early morning/evening.",
      );
  }
  if (humidity !== undefined) {
    if (humidity > 80)
      parts.push(
        "High humidity: monitor fungal diseases; use preventive fungicide when needed.",
      );
    else if (humidity < 30)
      parts.push("Low humidity: mulch to retain soil moisture.");
  }
  return (
    parts.join(" ") ||
    "Provide location to fetch weather for personalized advice."
  );
}

export const createAdvisory: RequestHandler = async (req, res) => {
  try {
    const { farmerId, crop, lat, lon } = req.body as {
      farmerId?: string;
      crop?: string;
      lat?: number;
      lon?: number;
    };

    let weather: any = undefined;
    if (lat != null && lon != null) {
      const key = process.env.OPENWEATHER_API_KEY;
      if (key) {
        const resp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
        );
        if (resp.ok) weather = await resp.json();
      }
    }

    const summary = generateAdvice({
      tempC: weather?.main?.temp,
      humidity: weather?.main?.humidity,
    });
    const fertilizer = crop?.toLowerCase().includes("paddy")
      ? "NPK 10:26:26 at sowing; urea split doses at tillering/PI."
      : "Balanced NPK based on soil test; apply compost/manure to improve organic matter.";
    const irrigation =
      weather?.main?.temp && weather.main.temp > 30
        ? "Irrigate 2–3 times/week in short cycles."
        : "Irrigate weekly based on soil moisture.";
    const pest =
      "Scout weekly; use pheromone traps; prefer bio‑control where possible.";

    const { data, error } = await supabase
      .from("advisories")
      .insert({
        farmer_id: farmerId,
        crop,
        summary,
        fertilizer,
        irrigation,
        pest,
        weather,
      })
      .select()
      .single();

    if (error) {
      console.error("[advisory] Error creating:", error);
      return res.status(400).json({ error: "Failed to create advisory" });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error("[advisory] Error:", e);
    res.status(400).json({ error: "Failed to create advisory" });
  }
};
