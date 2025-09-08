import * as React from "react";
export default function PestDetector() {
  const [preds, setPreds] = React.useState<
    { className: string; probability: number }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  async function serverPredict(file: File) {
    setLoading(true);
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">
        Image-based Pest/Disease Detection
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Upload a leaf/crop image. The on-device model will classify visible
        objects (prototype).
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row">
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
          {serverFallback && (
            <div className="mt-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">
              Using server-side prediction because on-device model is
              unavailable.
            </div>
          )}
        </div>
        <div className="flex-1">
          {loading && <div className="text-sm text-slate-500">Analyzing…</div>}
          {!loading && preds.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
