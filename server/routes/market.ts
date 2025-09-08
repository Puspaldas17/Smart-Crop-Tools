import { RequestHandler } from "express";

const sample = [
  {
    commodity: "Wheat",
    state: "Punjab",
    mandi: "Ludhiana",
    unit: "Qtl",
    price: 2200,
  },
  {
    commodity: "Wheat",
    state: "Punjab",
    mandi: "Amritsar",
    unit: "Qtl",
    price: 2180,
  },
  {
    commodity: "Rice",
    state: "Punjab",
    mandi: "Ferozepur",
    unit: "Qtl",
    price: 2450,
  },
  {
    commodity: "Potato",
    state: "Punjab",
    mandi: "Jalandhar",
    unit: "Qtl",
    price: 1250,
  },
  {
    commodity: "Onion",
    state: "Punjab",
    mandi: "Patiala",
    unit: "Qtl",
    price: 1650,
  },
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
