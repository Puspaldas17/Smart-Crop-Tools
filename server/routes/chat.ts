import { RequestHandler } from "express";

export const chatHandler: RequestHandler = async (req, res) => {
  try {
    const { message, lat, lon } = req.body as {
      message?: string;
      lat?: number;
      lon?: number;
    };
    if (!message) return res.status(400).json({ error: "message required" });

    const m = message.toLowerCase();
    const replies: string[] = [];

    if (/(weather|temp|rain)/.test(m) && lat != null && lon != null) {
      const key = process.env.OPENWEATHER_API_KEY;
      if (key) {
        const r = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
        );
        if (r.ok) {
          const w = await r.json();
          replies.push(
            `Weather: ${w.weather?.[0]?.description || ""}, Temp ${w.main?.temp ?? "?"}°C, Humidity ${w.main?.humidity ?? "?"}%`,
          );
        }
      }
    }

    if (/(price|mandi|market)/.test(m)) {
      replies.push(
        "For live mandi prices, please check the 'Market' tab. I can tell you that Wheat is currently trending up in Punjab markets.",
      );
    }

    if (/(yield|production|harvest)/.test(m)) {
       replies.push(
        "To improve yield: 1. Ensure soil testing. 2. Use certified seeds. 3. Follow timely irrigation. 4. Manage pests early with bio-pesticides.",
      );
    }

    if (/(irrigation|water)/.test(m)) {
       replies.push(
        "Irrigation tip: Water early morning or late evening to reduce evaporation. For paddy, maintain standing water only at critical stages.",
      );
    }

    if (/(crop|fertilizer|advice|advisory|wheat|rice|corn)/.test(m)) {
      if (m.includes("wheat")) {
         replies.push(
          "Wheat Advisory: Sowing time is Nov 1-15. Use NPK 120:60:40. Irrigate at CRI stage (21 days after sowing).",
        );
      } else if (m.includes("rice") || m.includes("paddy")) {
         replies.push(
          "Rice Advisory: Maintain 2-5cm water level. Apply Urea in splits. Watch out for Stem Borer and Blast disease.",
        );
      } else {
        replies.push(
          "General advisory: choose crops based on local climate and soil test. Maintain balanced NPK and use compost. Monitor pests weekly and irrigate based on soil moisture.",
        );
      }
    }

    if (!replies.length)
      replies.push(
        "I can help with weather, market prices, and crop advisory. Ask me about any of these.",
      );

    res.json({ reply: replies.join("\n") });
  } catch (e) {
    res.status(500).json({ error: "chat error" });
  }
};
