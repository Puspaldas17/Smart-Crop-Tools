import { RequestHandler } from "express";

const sample = [
  { commodity: "Wheat", state: "Punjab", mandi: "Ludhiana", unit: "Qtl", price: 2200 },
  { commodity: "Wheat", state: "Uttar Pradesh", mandi: "Kanpur", unit: "Qtl", price: 2150 },
  { commodity: "Rice", state: "West Bengal", mandi: "Kolkata", unit: "Qtl", price: 2450 },
  { commodity: "Rice", state: "Tamil Nadu", mandi: "Thanjavur", unit: "Qtl", price: 2400 },
  { commodity: "Onion", state: "Maharashtra", mandi: "Nashik", unit: "Qtl", price: 1700 },
  { commodity: "Onion", state: "Karnataka", mandi: "Hubballi", unit: "Qtl", price: 1650 },
  { commodity: "Potato", state: "Uttar Pradesh", mandi: "Agra", unit: "Qtl", price: 1200 },
  { commodity: "Potato", state: "West Bengal", mandi: "Hooghly", unit: "Qtl", price: 1250 },
  { commodity: "Soybean", state: "Madhya Pradesh", mandi: "Indore", unit: "Qtl", price: 4800 },
  { commodity: "Cotton", state: "Telangana", mandi: "Warangal", unit: "Qtl", price: 6200 },
  { commodity: "Tur", state: "Maharashtra", mandi: "Latur", unit: "Qtl", price: 7000 },
  { commodity: "Chilli", state: "Andhra Pradesh", mandi: "Guntur", unit: "Qtl", price: 9000 },
];

import { getCache, setCache, makeKey } from "../utils/cache";
import { fetchWithTimeout, retry } from "../utils/http";

export const getMarketPrices: RequestHandler = async (req, res) => {
  const { commodity, state } = req.query as {
    commodity?: string;
    state?: string;
  };
  const apiUrl = process.env.MARKET_API_URL; // optional external provider (JSON array)
  const apiKey = process.env.MARKET_API_KEY; // optional header key

  // Cache for 5 minutes by commodity/state
  const cacheKey = makeKey([
    "market",
    (commodity || "").toLowerCase(),
    (state || "").toLowerCase(),
  ]);
  const cached = getCache<any>(cacheKey);
  if (cached)
    return res.json({
      source: cached.source,
      items: cached.items,
      cached: true,
    });

  try {
    if (apiUrl) {
      const url = new URL(apiUrl);
      if (commodity) url.searchParams.set("commodity", commodity);
      if (state) url.searchParams.set("state", state);
      const r = await retry(() =>
        fetchWithTimeout(
          url.toString(),
          {
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
          },
          7000,
        ),
      );
      if (r.ok) {
        const data = await r.json();
        const payload = { source: "live" as const, items: data };
        setCache(cacheKey, payload, 5 * 60 * 1000);
        return res.json(payload);
      }
    }
  } catch {}

  const items = sample.filter(
    (i) =>
      (!commodity ||
        i.commodity.toLowerCase().includes(commodity.toLowerCase())) &&
      (!state || i.state.toLowerCase() === state.toLowerCase()),
  );
  const payload = { source: "sample" as const, items };
  setCache(cacheKey, payload, 5 * 60 * 1000);
  res.json(payload);
};
