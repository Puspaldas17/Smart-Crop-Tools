import { useState } from "react";
import { Shield, Link2, Hash, QrCode, Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProduceRecord {
  id: string;
  txHash: string;
  crop: string;
  quantity: string;
  harvestDate: string;
  farmerId: string;
  farmerName: string;
  soilType?: string;
  pesticides: string[];
  certifier: string;
  verified: boolean;
  timestamp: string;
}

function genHash(): string {
  return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

const CERTIFIERS = ["AgriVerify DAO", "FarmLedger Network", "GreenTrace Protocol"];

export function ProduceBlockchain({ farmerId, farmerName }: { farmerId?: string; farmerName?: string }) {
  const [records, setRecords] = useState<ProduceRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    crop: "",
    quantity: "",
    harvestDate: "",
    pesticides: "",
  });

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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            Produce Blockchain Ledger
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register harvests on an immutable ledger for traceability and buyer trust.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-105 transition"
        >
          + Register Harvest
        </button>
      </div>

      {/* Registration form */}
      {showForm && (
        <div className="glass-card border-white/10 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-sm">New Harvest Registration</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Crop *</label>
              <input
                placeholder="e.g. Rice"
                value={form.crop}
                onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Quantity *</label>
              <input
                placeholder="e.g. 2.5 tonnes"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Harvest Date *</label>
              <input
                type="date"
                value={form.harvestDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((f) => ({ ...f, harvestDate: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Pesticides Used (comma-separated)</label>
              <input
                placeholder="e.g. Neem oil, Chlorpyrifos"
                value={form.pesticides}
                onChange={(e) => setForm((f) => ({ ...f, pesticides: e.target.value }))}
                className="mt-1 w-full text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegister}
              disabled={!form.crop || !form.quantity || !form.harvestDate}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:brightness-105 transition flex items-center gap-1"
            >
              <Link2 className="h-3.5 w-3.5" /> Register on Ledger
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition">
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
            return (
              <div key={rec.id} className="glass-card border-white/10 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
                  onClick={() => setExpandedId(expanded ? null : rec.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <QrCode className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{rec.crop} — {rec.quantity}</p>
                        {rec.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">
                            <Check className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Harvested: {new Date(rec.harvestDate).toLocaleDateString("en-IN")} · {rec.certifier}
                      </p>
                    </div>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>

                {expanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                    {/* Tx hash */}
                    <div className="flex items-center gap-2 mt-3">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <code className="text-[10px] text-muted-foreground break-all flex-1">{rec.txHash}</code>
                      <button onClick={() => copyHash(rec.txHash)} className="shrink-0 text-primary hover:opacity-80 transition">
                        {copiedHash === rec.txHash ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div><span className="text-foreground font-medium">Farmer:</span> {rec.farmerName}</div>
                      <div><span className="text-foreground font-medium">ID:</span> {rec.farmerId}</div>
                      <div><span className="text-foreground font-medium">Timestamp:</span> {new Date(rec.timestamp).toLocaleString("en-IN")}</div>
                      <div><span className="text-foreground font-medium">Pesticides:</span> {rec.pesticides.join(", ")}</div>
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
