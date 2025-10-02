import { useEffect, useState } from "react";

export default function MarketCard() {
  const [commodity, setCommodity] = useState("Wheat");
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchSafe(path: string, timeout = 7000): Promise<Response | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(path, { signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch {
      return null;
    }
  }

  async function loadPrices() {
    const params = new URLSearchParams();
    if (commodity) params.set("commodity", commodity);
    const path = "/api/market" + (params.toString() ? `?${params.toString()}` : "");

    const r = await fetchSafe(path, 7000);
    if (r && r.ok) {
      const data = await r.json();
      setItems(data.items || []);
      setError(null);
      return;
    }

    setError("Network unavailable — showing sample data");
    const fallback = await fetchSafe("/api/market", 7000);
    if (fallback && fallback.ok) {
      const data = await fallback.json();
      setItems(data.items || []);
      return;
    }

    setItems([
      { commodity: "Wheat", state: "Uttar Pradesh", mandi: "Kanpur", unit: "Qtl", price: 2210 },
      { commodity: "Rice", state: "West Bengal", mandi: "Kolkata", unit: "Qtl", price: 2460 },
      { commodity: "Onion", state: "Maharashtra", mandi: "Nashik", unit: "Qtl", price: 1700 },
    ]);
  }

  useEffect(() => {
    loadPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commodity]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Market Prices</h3>
        <div className="flex gap-2">
          <input
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      {error && (
        <div className="mt-3 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">{error}</div>
      )}
      <div className="mt-4 max-h-64 overflow-y-auto overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="px-2 py-1">Commodity</th>
              <th className="px-2 py-1">State</th>
              <th className="px-2 py-1">Mandi</th>
              <th className="px-2 py-1">Unit</th>
              <th className="px-2 py-1">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1">{i.commodity}</td>
                <td className="px-2 py-1">{i.state}</td>
                <td className="px-2 py-1">{i.mandi}</td>
                <td className="px-2 py-1">{i.unit}</td>
                <td className="px-2 py-1">₹ {i.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
