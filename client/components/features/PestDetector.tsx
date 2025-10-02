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
    <div className="my-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-semibold">
        Image-based Pest/Disease Detection
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Upload a leaf/crop image. Analysis runs on the server for maximum
        compatibility in this preview.
      </p>
      <div className="mt-4 flex flex-col items-start gap-6 md:flex-row md:items-start">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="text-sm"
          />
          <div className="mt-3 flex justify-center">
            <div className="relative w-full max-w-xl overflow-hidden rounded-lg bg-slate-100 pt-[75%]">
              <img
                ref={imgRef}
                alt="preview"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          </div>
          <div className="mt-2 rounded-md bg-emerald-50 p-2 text-sm text-emerald-800">
            Using server-side prediction for reliability.
          </div>
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
