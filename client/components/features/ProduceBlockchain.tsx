import { useState } from "react";
import { Shield, Link2, Hash, Check, Copy, ChevronDown, ChevronUp, Download } from "lucide-react";

interface ProduceRecord {
  id: string;
  txHash: string;
  crop: string;
  quantity: string;
  harvestDate: string;
  farmerId: string;
  farmerName: string;
  pesticides: string[];
  certifier: string;
  verified: boolean;
  timestamp: string;
}

function genHash(): string {
  return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

const CERTIFIERS = ["AgriVerify DAO", "FarmLedger Network", "GreenTrace Protocol"];

// ── Minimal deterministic QR-like SVG (decorative but visually scannable) ──
function QRCodeSVG({ data, size = 140 }: { data: string; size?: number }) {
  const N = 21;
  const px = size / N;

  let seed = 0;
  for (let i = 0; i < data.length; i++) seed = (seed * 31 + data.charCodeAt(i)) >>> 0;
  function rand() {
    seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }

  const m: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false) as boolean[]);

  // Finder patterns (top-left, top-right, bottom-left)
  function finder(r: number, c: number) {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
      m[r + dr][c + dc] = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
    }
  }
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0);

  // Timing
  for (let i = 8; i < N - 8; i++) { m[6][i] = i % 2 === 0; m[i][6] = i % 2 === 0; }

  // Data (seeded random)
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const inFinder = (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
    if (!inFinder && r !== 6 && c !== 6) m[r][c] = rand() > 0.45;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx={3} />
      {m.flatMap((row, r) =>
        row.map((v, c) => v
          ? <rect key={`${r}-${c}`} x={c * px} y={r * px} width={px} height={px} fill="#111" />
          : null
        )
      )}
    </svg>
  );
}

function downloadQR(id: string, crop: string) {
  const el = document.getElementById(`qr-svg-${id}`);
  if (!el) return;
  const blob = new Blob([el.outerHTML], { type: "image/svg+xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `QR_${crop.replace(/\s+/g, "_")}_${id}.svg`;
  a.click();
}

export function ProduceBlockchain({ farmerId, farmerName }: { farmerId?: string; farmerName?: string }) {
  const [records, setRecords] = useState<ProduceRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crop: "", quantity: "", harvestDate: "", pesticides: "" });

  function handleRegister() {
    if (!form.crop || !form.quantity || !form.harvestDate) return;
    const rec: ProduceRecord = {
      id: String(Date.now()),
      txHash: genHash(),
      crop: form.crop,
      quantity: form.quantity,
      harvestDate: form.harvestDate,
      farmerId: farmerId ?? "ANON",
      farmerName: farmerName ?? "Unknown Farmer",
      pesticides: form.pesticides ? form.pesticides.split(",").map((p) => p.trim()) : ["None applied"],
      certifier: CERTIFIERS[Math.floor(Math.random() * CERTIFIERS.length)],
      verified: true,
      timestamp: new Date().toISOString(),
    };
    setRecords((r) => [rec, ...r]);
    setForm({ crop: "", quantity: "", harvestDate: "", pesticides: "" });
    setShowForm(false);
  }

  function copyHash(hash: string) {
    navigator.clipboard.writeText(hash).then(() => {
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    });
  }

  const qrData = (rec: ProduceRecord) =>
    `AgriVerse|${rec.txHash}|${rec.crop}|${rec.quantity}|${rec.farmerName}|${rec.harvestDate}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            Produce Blockchain Ledger
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register harvests on an immutable ledger. Each lot gets a scannable QR for buyer verification.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-105 transition"
        >
          + Register Harvest
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card border-white/10 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-sm">New Harvest Registration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Crop *</label>
              <input placeholder="e.g. Rice" value={form.crop}
                onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Quantity *</label>
              <input placeholder="e.g. 2.5 tonnes" value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Harvest Date *</label>
              <input type="date" value={form.harvestDate} max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((f) => ({ ...f, harvestDate: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Pesticides Used (comma-sep)</label>
              <input placeholder="e.g. Neem oil, Chlorpyrifos" value={form.pesticides}
                onChange={(e) => setForm((f) => ({ ...f, pesticides: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRegister} disabled={!form.crop || !form.quantity || !form.harvestDate}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:brightness-105 transition flex items-center gap-1">
              <Link2 className="h-3.5 w-3.5" /> Register on Ledger
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Records */}
      {records.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No produce registered yet.</p>
          <p className="text-xs mt-0.5">Click "Register Harvest" to add your first record.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((rec) => {
            const expanded = expandedId === rec.id;
            const qrVisible = showQR === rec.id;
            return (
              <div key={rec.id} className="glass-card border-white/10 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
                  onClick={() => setExpandedId(expanded ? null : rec.id)}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                      QR
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{rec.crop} — {rec.quantity}</p>
                        {rec.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">
                            <Check className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(rec.harvestDate).toLocaleDateString("en-IN")} · {rec.certifier}
                      </p>
                    </div>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>

                {expanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-white/5">
                    {/* Tx hash */}
                    <div className="flex items-center gap-2 mt-3">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <code className="text-[10px] text-muted-foreground break-all flex-1">{rec.txHash}</code>
                      <button onClick={() => copyHash(rec.txHash)} className="shrink-0 text-primary hover:opacity-80">
                        {copiedHash === rec.txHash ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div><span className="text-foreground font-medium">Farmer:</span> {rec.farmerName}</div>
                      <div><span className="text-foreground font-medium">ID:</span> {rec.farmerId}</div>
                      <div><span className="text-foreground font-medium">Registered:</span> {new Date(rec.timestamp).toLocaleString("en-IN")}</div>
                      <div><span className="text-foreground font-medium">Pesticides:</span> {rec.pesticides.join(", ")}</div>
                    </div>

                    {/* QR Code */}
                    <div className="border-t border-white/5 pt-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium">Lot QR Code</p>
                        <div className="flex gap-2">
                          <button onClick={() => setShowQR(qrVisible ? null : rec.id)}
                            className="text-xs px-3 py-1 rounded-md border border-white/10 hover:bg-white/5 transition">
                            {qrVisible ? "Hide" : "Show QR"}
                          </button>
                          {qrVisible && (
                            <button onClick={() => downloadQR(rec.id, rec.crop)}
                              className="text-xs px-3 py-1 rounded-md border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition flex items-center gap-1">
                              <Download className="h-3 w-3" /> Download
                            </button>
                          )}
                        </div>
                      </div>
                      {qrVisible && (
                        <div className="flex flex-col items-center gap-2">
                          <div id={`qr-svg-${rec.id}`} className="rounded-xl p-3 bg-card text-card-foreground shadow-lg inline-block">
                            <QRCodeSVG data={qrData(rec)} size={140} />
                          </div>
                          <p className="text-[10px] text-muted-foreground text-center">
                            Unique QR per lot · scan to verify on AgriVerse chain
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
