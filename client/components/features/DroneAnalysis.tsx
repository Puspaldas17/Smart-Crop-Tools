import { useState, useRef } from "react";
import { Upload, Eye, AlertCircle, CheckCircle2, Loader2, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

interface DroneResult {
  area: string;
  uniformity: number;
  waterloggingRisk: "high" | "medium" | "low";
  chlorophyllIndex: number;
  dryPatches: number;
  recommendation: string;
}

const MOCK_RESULTS: DroneResult[] = [
  { area: "North Block (2.3 ha)", uniformity: 87, waterloggingRisk: "low", chlorophyllIndex: 0.74, dryPatches: 2, recommendation: "Growth is uniform. Slight moisture stress in corner patches — spot irrigate." },
  { area: "South Block (1.8 ha)", uniformity: 61, waterloggingRisk: "high", chlorophyllIndex: 0.52, dryPatches: 7, recommendation: "Waterlogging detected in 3 zones. Improve drainage channels before next irrigation." },
  { area: "East Block (3.1 ha)", uniformity: 94, waterloggingRisk: "low", chlorophyllIndex: 0.81, dryPatches: 0, recommendation: "Excellent crop uniformity. No action required. Continue current regimen." },
];

const RISK_CONFIG = {
  high:   { label: "High",   cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  medium: { label: "Medium", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  low:    { label: "Low",    cls: "text-green-400 bg-green-500/10 border-green-500/30" },
};

export function DroneAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DroneResult[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function analyze() {
    if (!file) return;
    setLoading(true);
    // Simulate ML analysis with random result selection
    setTimeout(() => {
      const count = Math.floor(Math.random() * 2) + 2; // 2–3 blocks
      setResults(MOCK_RESULTS.slice(0, count));
      setLoading(false);
    }, 2200);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TreePine className="h-5 w-5 text-emerald-500" />
          Drone Aerial Analysis
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload an aerial/drone image to detect growth uniformity, waterlogging, and dry patches.
        </p>
      </div>

      {/* Upload zone */}
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
          preview ? "border-primary/40" : "border-white/10 hover:border-white/30"
        )}
        onClick={() => fileRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {preview ? (
          <img src={preview} alt="aerial" className="max-h-48 mx-auto rounded-lg object-cover" />
        ) : (
          <div>
            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-60" />
            <p className="text-sm text-muted-foreground">Drag & drop aerial image, or click to browse</p>
            <p className="text-xs text-muted-foreground mt-0.5">Supports JPG, PNG, TIFF</p>
          </div>
        )}
      </div>

      {file && !loading && !results && (
        <button
          onClick={analyze}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-105 transition"
        >
          <Eye className="h-4 w-4" /> Analyze Aerial Image
        </button>
      )}

      {loading && (
        <div className="glass-card rounded-xl p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Processing image with satellite-level CNN model…</p>
          <p className="text-xs text-muted-foreground mt-1">Detecting growth anomalies, waterlogging, chlorophyll index…</p>
        </div>
      )}

      {results && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" /> Analysis Complete — {results.length} Zones Detected
          </h4>
          {results.map((r) => (
            <div key={r.area} className="glass-card border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{r.area}</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", RISK_CONFIG[r.waterloggingRisk].cls)}>
                  Waterlog: {RISK_CONFIG[r.waterloggingRisk].label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{r.uniformity}%</div>
                  <div className="text-[10px] text-muted-foreground">Uniformity</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-400">{r.chlorophyllIndex}</div>
                  <div className="text-[10px] text-muted-foreground">NDVI Index</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-400">{r.dryPatches}</div>
                  <div className="text-[10px] text-muted-foreground">Dry Patches</div>
                </div>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                {r.recommendation}
              </div>
            </div>
          ))}
          <button onClick={() => { setFile(null); setPreview(null); setResults(null); }}
            className="text-xs text-muted-foreground hover:text-foreground transition underline">
            Analyze another image
          </button>
        </div>
      )}
    </div>
  );
}
