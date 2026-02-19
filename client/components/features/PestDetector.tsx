```typescript
import * as React from "react";
export default function PestDetector() {
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
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold">
        Image-based Pest/Disease Detection
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Upload a leaf/crop image. Analysis runs on the server.
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
            Using server-side prediction for reliability.
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Analysis Results</h4>
            {loading && <div className="text-sm text-slate-500">Analyzing…</div>}
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
              !loading && <div className="text-sm text-slate-400">No results yet.</div>
            )}
          </div>

          {soilInfo && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-medium text-slate-900 mb-2">Soil Recommendations (Based on Crop)</h4>
              <div className="rounded-lg bg-slate-50 p-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-xs">Soil Type</span>
                    <span className="font-medium">{soilInfo.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">pH Level</span>
                    <span className="font-medium">{soilInfo.ph}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Moisture</span>
                    <span className="font-medium">{soilInfo.moisture}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Temperature</span>
                    <span className="font-medium">{soilInfo.temperature}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <span className="text-slate-500 block text-xs">Notes</span>
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
