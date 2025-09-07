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
        "For live mandi prices, specify a commodity (e.g., wheat) and state (e.g., UP). You can also use the Market widget on the page.",
      );
    }

    if (/(crop|fertilizer|advice|advisory)/.test(m)) {
      replies.push(
        "General advisory: choose crops based on local climate and soil test. Maintain balanced NPK and use compost. Monitor pests weekly and irrigate based on soil moisture.",
      );
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
