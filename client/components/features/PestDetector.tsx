import { useEffect, useRef, useState } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

export default function PestDetector() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [preds, setPreds] = useState<{ className: string; probability: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let mounted = true;
    mobilenet.load({ version: 2, alpha: 1.0 }).then((m) => {
      if (mounted) setModel(m);
    });
    return () => { mounted = false; };
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !model) return;
    const url = URL.createObjectURL(file);
    if (imgRef.current) imgRef.current.src = url;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 50));
    if (imgRef.current) {
      const res = await model.classify(imgRef.current);
      setPreds(res.map((r) => ({ className: r.className, probability: r.probability })));
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Image-based Pest/Disease Detection</h3>
      <p className="mt-1 text-sm text-slate-600">Upload a leaf/crop image. The on-device model will classify visible objects (prototype).</p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <input type="file" accept="image/*" capture="environment" onChange={onFile} className="text-sm" />
          <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
            <img ref={imgRef} alt="preview" className="h-full w-full object-contain" />
          </div>
        </div>
        <div className="flex-1">
          {loading && <div className="text-sm text-slate-500">Analyzing…</div>}
          {!loading && preds.length > 0 && (
            <ul className="space-y-2">
              {preds.slice(0, 5).map((p, i) => (
                <li key={i} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <span>{p.className}</span>
                  <span className="font-medium">{Math.round(p.probability * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
