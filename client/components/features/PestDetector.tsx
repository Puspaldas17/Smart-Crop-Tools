
import * as React from "react";
import { useTranslation } from "react-i18next";

export default function PestDetector() {
  const { t } = useTranslation();
  const [preds, setPreds] = React.useState<
    { className: string; probability: number }[]
  >([]);
  const [soilInfo, setSoilInfo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  async function serverPredict(file: File) {
    setLoading(true);
    setSoilInfo(null);
    try {
      const fd = new FormData();
      fd.append("image", file, file.name);
      const r = await fetch("/api/predict", { method: "POST", body: fd });
      const data = await r.json();
      if (r.ok && data.predictions) {
        setPreds(
          data.predictions.map((p: any) => ({
            className: p.className,
            probability: p.probability,
          })),
        );
        if (data.soilInfo) {
          setSoilInfo(data.soilInfo);
        }
      } else {
        setPreds([]);
      }
    } catch (err) {
      setPreds([]);
    }
    setLoading(false);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (imgRef.current) imgRef.current.src = url;
    await serverPredict(file);
  }

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-8 shadow-sm">
      <h3 className="text-xl font-semibold">
        {t("pest.title")}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        {t("pest.subtitle")}
      </p>
      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="text-sm"
          />
          <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
            <img
              ref={imgRef}
              alt="preview"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="mt-2 rounded-md bg-emerald-50 p-2 text-sm text-emerald-800">
            {t("pest.server_note")}
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">{t("pest.results")}</h4>
            {loading && <div className="text-sm text-slate-500">{t("common.loading")}</div>}
            {!loading && preds.length > 0 ? (
              <ul className="space-y-2">
                {preds.slice(0, 5).map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span>{p.className}</span>
                    <span className="font-medium">
                      {Math.round(p.probability * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              !loading && <div className="text-sm text-slate-400">{t("pest.no_results")}</div>
            )}
          </div>

          {soilInfo && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-medium text-slate-900 mb-2">{t("pest.soil.title")}</h4>
              <div className="rounded-lg bg-slate-50 p-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-xs">{t("pest.soil.type")}</span>
                    <span className="font-medium">{soilInfo.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">{t("pest.soil.ph")}</span>
                    <span className="font-medium">{soilInfo.ph}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">{t("pest.soil.moisture")}</span>
                    <span className="font-medium">{soilInfo.moisture}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">{t("pest.soil.temp")}</span>
                    <span className="font-medium">{soilInfo.temperature}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <span className="text-slate-500 block text-xs">{t("pest.soil.notes")}</span>
                  <p className="text-slate-700">{soilInfo.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
