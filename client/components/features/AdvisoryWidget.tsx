import { useEffect, useState } from "react";
import { INDIA_CENTROID } from "@/lib/geo";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function AdvisoryWidget() {
  const { farmer, authHeaders } = useAuth();
  const { t } = useTranslation();
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
    setStatus(t('advisory.generating'));
    try {
      const r = await fetch("/api/advisories", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ crop, lat: coords.lat, lon: coords.lon }),
      });
      const data = await r.json();
      if (r.ok) {
        setAdvisory(data);
        setStatus(t('advisory.ready'));

        if (farmer && farmer._id && !farmer.isGuest) {
          const summary = data.summary || "Advisory generated";
          const historyPayload = {
            farmerId: farmer._id,
            crop,
            advisory: summary,
            weatherData: { lat: coords.lat, lon: coords.lon },
          };

          const analyticsPayload = {
            farmerId: farmer._id,
            crop,
            cropHealthScore: Math.random() * 40 + 60,
            soilMoisture: Math.random() * 50 + 30,
            soilNitrogen: Math.random() * 60 + 20,
            soilPH: 5.8 + Math.random() * 1.8,
            temperature: 20 + Math.random() * 20,
            humidity: 40 + Math.random() * 40,
            rainfall: Math.random() * 30,
            pestPressure: Math.random() * 60,
            diseaseRisk: Math.random() * 50,
          };

          try {
            await Promise.all([
              fetch("/api/advisory/history", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify(historyPayload),
              }),
              fetch("/api/analytics/record", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify(analyticsPayload),
              }),
            ]);
          } catch (error) {
            console.error("Failed to save data:", error);
          }
        }
      } else setStatus(data.error || t('common.error'));
    } catch (e) {
      setStatus(t('common.error'));
    }
  }

  return (
    <div
      id="advisory"
      className="my-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h3 className="text-xl font-semibold">{t('advisory.title')}</h3>
      <form onSubmit={onSubmit} className="mt-3 flex items-stretch gap-3">
        <input
          name="crop"
          placeholder={t('advisory.placeholder')}
          className="w-4/5 rounded-md border border-slate-300 px-4 py-3 text-sm"
        />
        <button className="w-1/5 rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
          {t('advisory.button')}
        </button>
      </form>
      <div className="mt-3 text-sm text-slate-600">{status}</div>
      {advisory && (
        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          <div className="font-semibold">{t('advisory.summary')}</div>
          <div>{advisory.summary}</div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs font-semibold">{t('advisory.fertilizer')}</div>
              <div>{advisory.fertilizer}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs font-semibold">{t('advisory.irrigation')}</div>
              <div>{advisory.irrigation}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs font-semibold">{t('advisory.pest')}</div>
              <div>{advisory.pest}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
