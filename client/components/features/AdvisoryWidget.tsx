import { useEffect, useState } from "react";

export default function AdvisoryWidget() {
  const [status, setStatus] = useState("");
  const [advisory, setAdvisory] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords({ lat: 31.1471, lon: 75.3412 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setCoords({ lat: 31.1471, lon: 75.3412 })
    );
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!coords) return;
    const fd = new FormData(e.currentTarget);
    const crop = String(fd.get("crop") || "");
    setStatus("Generating advisory…");
    try {
      const r = await fetch("/api/advisories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop, lat: coords.lat, lon: coords.lon }),
      });
      const data = await r.json();
      if (r.ok) { setAdvisory(data); setStatus("Ready."); } else setStatus(data.error || "Failed");
    } catch (e) {
      setStatus("Network error");
    }
  }

  return (
    <div id="advisory" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Quick Crop Advisory</h3>
      <form onSubmit={onSubmit} className="mt-3 flex gap-3">
        <input name="crop" placeholder="Crop (e.g., wheat)" className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Get Advice</button>
      </form>
      <div className="mt-2 text-sm text-slate-600">{status}</div>
      {advisory && (
        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          <div className="font-semibold">Summary</div>
          <div>{advisory.summary}</div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-3"><div className="text-xs font-semibold">Fertilizer</div><div>{advisory.fertilizer}</div></div>
            <div className="rounded-md border border-slate-200 p-3"><div className="text-xs font-semibold">Irrigation</div><div>{advisory.irrigation}</div></div>
            <div className="rounded-md border border-slate-200 p-3"><div className="text-xs font-semibold">Pest</div><div>{advisory.pest}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
