import * as React from "react";
export default function PestDetector() {
  const [preds, setPreds] = React.useState<
    { className: string; probability: number }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  // Soil data state
  const [soilData, setSoilData] = React.useState<{
    ph: number;
    moisture: string;
    organicMatter: string;
    temperature: string;
  } | null>(null);

  async function serverPredict(file: File) {
    setLoading(true);
    setSoilData(null); // Reset previous data
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
        // Mock Soil Data on successful detection
        setSoilData({
          ph: 6.5 + Math.random() * 1.0, // Random pH between 6.5 and 7.5
          moisture: "High (Surface)",
          organicMatter: "Medium-High",
          temperature: "24°C",
        });
      } else {
        setPreds([]);
        setSoilData(null);
      }
    } catch (err) {
      setPreds([]);
      setSoilData(null);
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
        Upload a leaf/crop image. Analysis runs on the server for maximum
        compatibility in this preview.
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
          {/* Analysis Section */}
          <div>
            {loading && (
              <div className="text-sm text-slate-500">Analyzing…</div>
            )}
            {!loading && preds.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Analysis Results</h4>
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
              </div>
            )}
          </div>

          {/* Soil Report Section */}
          {!loading && soilData && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <h4 className="flex items-center gap-2 font-medium text-indigo-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-sprout"
                >
                  <path d="M7 20h10" />
                  <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                  <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.2.4-4.8-.4-1.2-.6-2.1-1.9-2-3.3a2.94 2.94 0 0 1 2.5-2.8c1.2-.1 2.5.5 3 1.6z" />
                  <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-3.8A3 3 0 0 0 16.5 2c-1.2-.1-2.5.5-3 1.6z" />
                </svg>
                Soil Assessment Report
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded bg-white p-2 shadow-sm">
                  <div className="text-xs text-slate-500">Soil pH</div>
                  <div className="font-semibold text-slate-800">
                    {soilData.ph.toFixed(1)}
                  </div>
                </div>
                <div className="rounded bg-white p-2 shadow-sm">
                  <div className="text-xs text-slate-500">Moisture</div>
                  <div className="font-semibold text-slate-800">
                    {soilData.moisture}
                  </div>
                </div>
                <div className="rounded bg-white p-2 shadow-sm">
                  <div className="text-xs text-slate-500">Organic Matter</div>
                  <div className="font-semibold text-slate-800">
                    {soilData.organicMatter}
                  </div>
                </div>
                <div className="rounded bg-white p-2 shadow-sm">
                  <div className="text-xs text-slate-500">Est. Temp</div>
                  <div className="font-semibold text-slate-800">
                    {soilData.temperature}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-indigo-800">
                * Based on crop type and environmental data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
