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

export const getMarketPrices: RequestHandler = async (req, res) => {
  const { commodity, state } = req.query as {
    commodity?: string;
    state?: string;
  };
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
    (i) =>
      (!commodity ||
        i.commodity.toLowerCase().includes(commodity.toLowerCase())) &&
      (!state || i.state.toLowerCase() === state.toLowerCase()),
  );
  res.json({ source: "sample", items });
};
