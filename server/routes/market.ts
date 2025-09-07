import { RequestHandler } from "express";

const sample = [
  { commodity: "Wheat", state: "UP", mandi: "Kanpur", unit: "Qtl", price: 2150 },
  { commodity: "Rice", state: "WB", mandi: "Kolkata", unit: "Qtl", price: 2400 },
  { commodity: "Potato", state: "WB", mandi: "Hooghly", unit: "Qtl", price: 1200 },
  { commodity: "Onion", state: "MH", mandi: "Nashik", unit: "Qtl", price: 1600 },
];

export const getMarketPrices: RequestHandler = async (req, res) => {
  const { commodity, state } = req.query as { commodity?: string; state?: string };
  const apiUrl = process.env.MARKET_API_URL; // expected to return array like sample

  try {
    if (apiUrl) {
      const url = new URL(apiUrl);
      if (commodity) url.searchParams.set("commodity", commodity);
      if (state) url.searchParams.set("state", state);
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        return res.json({ source: "live", items: data });
      }
    }
  } catch {}

  const items = sample.filter(
    (i) => (!commodity || i.commodity.toLowerCase().includes(commodity.toLowerCase())) && (!state || i.state.toLowerCase() === state.toLowerCase()),
  );
  res.json({ source: "sample", items });
};
