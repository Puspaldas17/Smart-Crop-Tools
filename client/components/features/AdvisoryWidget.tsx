import { useEffect, useState } from "react";
import { INDIA_CENTROID } from "@/lib/geo";
import { useAuth } from "@/hooks/useAuth";

export default function AdvisoryWidget() {
  const { farmer } = useAuth();
  const [status, setStatus] = useState("");
  const [advisory, setAdvisory] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords(INDIA_CENTROID);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setCoords(INDIA_CENTROID),
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
      if (r.ok) {
        setAdvisory(data);
        setStatus("Ready.");

        if (farmer && farmer._id && !farmer.isGuest) {
          const summary = data.summary || "Advisory generated";
          const historyPayload = {
            farmerId: farmer._id,
            crop,
            advisory: summary,
            weatherData: { lat: coords.lat, lon: coords.lon },
          };

          try {
            await fetch("/api/advisory/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(historyPayload),
            });
          } catch (historyError) {
            console.error("Failed to save history:", historyError);
          }
        }
      } else setStatus(data.error || "Failed");
    } catch (e) {
      setStatus("Network error");
    }
  }

  return (
    <div
      id="advisory"
      className="my-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h3 className="text-xl font-semibold">Quick Crop Advisory</h3>
      <form onSubmit={onSubmit} className="mt-3 flex items-stretch gap-3">
        <input
          name="crop"
          placeholder="Crop (e.g., wheat)"
          className="w-4/5 rounded-md border border-slate-300 px-4 py-3 text-sm"
        />
        <button className="w-1/5 rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
          Get Advice
        </button>
      </form>
      <div className="mt-3 text-sm text-slate-600">{status}</div>
      {advisory && (
        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          <div className="font-semibold">Summary</div>
          <div>{advisory.summary}</div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs font-semibold">Fertilizer</div>
              <div>{advisory.fertilizer}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs font-semibold">Irrigation</div>
              <div>{advisory.irrigation}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs font-semibold">Pest</div>
              <div>{advisory.pest}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
