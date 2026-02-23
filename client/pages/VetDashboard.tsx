import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Stethoscope, Search, FileText, CheckCircle2, Clock, AlertTriangle,
  Link2, Users, Send, RefreshCw, ChevronDown, Megaphone, BookOpen,
} from "lucide-react";

type VetTab = "patients" | "consultations" | "advisory";

interface Consultation {
  _id: string; farmerId: string; farmerName: string;
  animalId: string; disease: string; message: string;
  status: "pending" | "approved" | "rejected"; vetNote?: string; createdAt: string;
}
interface Advisory { _id: string; title: string; body: string; crop?: string; farmerName: string; createdAt: string; }
interface FarmerRow { _id: string; name: string; email?: string; phone?: string; soilType?: string; subscriptionStatus: string; createdAt: string; }

export default function VetDashboard() {
  const { farmer } = useAuth();
  const [tab, setTab] = useState<VetTab>("consultations");

  // ── Patients ────────────────────────────────────────────────────────────────
  const [patients, setPatients]   = useState<FarmerRow[]>([]);
  const [pLoading, setPLoading]   = useState(false);
  const [patientQ, setPatientQ]   = useState("");

  const loadPatients = useCallback(() => {
    setPLoading(true);
    fetch("/api/vet/farmers")
      .then((r) => r.json()).then((d) => setPatients(Array.isArray(d) ? d : []))
      .catch(() => setPatients([])).finally(() => setPLoading(false));
  }, []);
  useEffect(() => { if (tab === "patients") loadPatients(); }, [tab, loadPatients]);

  const filteredPatients = patients.filter((p) =>
    !patientQ ||
    (p.name || "").toLowerCase().includes(patientQ.toLowerCase()) ||
    (p.phone || "").includes(patientQ),
  );

  // ── Consultations ───────────────────────────────────────────────────────────
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [cLoading, setCLoading]           = useState(false);
  const [statusFilter, setStatusFilter]   = useState("all");
  const [noteMap, setNoteMap]             = useState<Record<string, string>>({});
  const [processing, setProcessing]       = useState<string | null>(null);

  const loadConsultations = useCallback(() => {
    setCLoading(true);
    const q = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    fetch(`/api/vet/consultations${q}`)
      .then((r) => r.json()).then((d) => setConsultations(Array.isArray(d) ? d : []))
      .catch(() => setConsultations([])).finally(() => setCLoading(false));
  }, [statusFilter]);
  useEffect(() => { if (tab === "consultations") loadConsultations(); }, [tab, loadConsultations]);

  const handleConsultationAction = async (id: string, status: "approved" | "rejected") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/vet/consultations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, vetNote: noteMap[id] || "", vetId: farmer?._id }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Consultation ${status}`);
      loadConsultations();
    } catch { toast.error("Update failed"); }
    finally { setProcessing(null); }
  };

  // ── Advisory ────────────────────────────────────────────────────────────────
  const [advisories, setAdvisories]   = useState<Advisory[]>([]);
  const [aLoading, setALoading]       = useState(false);
  const [advForm, setAdvForm]         = useState({ title: "", body: "", crop: "", farmerId: "", targetRole: "all" });
  const [sending, setSending]         = useState(false);

  const loadAdvisories = useCallback(() => {
    setALoading(true);
    const q = farmer?._id ? `?vetId=${farmer._id}` : "";
    fetch(`/api/vet/advisories${q}`)
      .then((r) => r.json()).then((d) => setAdvisories(Array.isArray(d) ? d : []))
      .catch(() => setAdvisories([])).finally(() => setALoading(false));
  }, [farmer?._id]);

  const handleSendAdvisory = async () => {
    if (!advForm.title || !advForm.body) { toast.error("Title and body required"); return; }
    if (!farmer?._id) { toast.error("Log in as a vet first"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/vet/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...advForm, vetId: farmer._id }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Advisory sent to farmers!");
      setAdvForm({ title: "", body: "", crop: "", farmerId: "", targetRole: "all" });
      loadAdvisories();
    } catch { toast.error("Send failed"); }
    finally { setSending(false); }
  };

  useEffect(() => { if (tab === "advisory") loadAdvisories(); }, [tab, loadAdvisories]);

  const TABS: { id: VetTab; label: string; icon: React.ReactNode }[] = [
    { id: "consultations", label: "Consultations", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "patients",      label: "My Patients",   icon: <Users className="h-4 w-4" /> },
    { id: "advisory",      label: "Advisory",      icon: <Megaphone className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card gradient-border rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-blue-500" />
            <span className="gradient-text">Veterinary Portal</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dr. {farmer?.name ?? "Vet"} · AMU Ledger &amp; Patient Management
          </p>
        </div>
        <a href="/amu" className="flex items-center gap-2 glass-card rounded-lg px-4 py-2 text-sm font-medium hover:shadow-md transition-all">
          <Link2 className="h-4 w-4 text-primary" /> AMU Ledger
        </a>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
              tab === id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {icon} {label}
            {id === "consultations" && consultations.filter(c => c.status === "pending").length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {consultations.filter(c => c.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONSULTATIONS TAB ─────────────────────────────────────────── */}
      {tab === "consultations" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-lg border border-border bg-background px-3 py-2">
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={loadConsultations} className="flex items-center gap-1.5 text-sm px-3 py-2 glass-card rounded-lg hover:shadow-md">
              <RefreshCw className={cn("h-4 w-4", cLoading && "animate-spin")} /> Refresh
            </button>
            <span className="text-sm text-muted-foreground ml-auto">{consultations.length} request{consultations.length !== 1 ? "s" : ""}</span>
          </div>

          {cLoading ? (
            <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Loading…
            </div>
          ) : consultations.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No consultation requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <div key={c._id} className={cn(
                  "glass-card gradient-border rounded-xl p-5 animate-fade-in-up",
                  c.status === "pending" && "border-amber-500/30",
                  c.status === "approved" && "border-emerald-500/30",
                  c.status === "rejected" && "border-rose-500/30",
                )}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">{c.farmerName}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {c.animalId && <span className="mr-2">🐄 {c.animalId}</span>}
                        <span className="font-medium text-foreground">{c.disease}</span>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">{c.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "text-xs font-semibold rounded-full px-2.5 py-0.5",
                        c.status === "pending"  && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                        c.status === "approved" && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
                        c.status === "rejected" && "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
                      )}>
                        {c.status === "pending" ? "⏳ Pending" : c.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {c.vetNote && (
                    <div className="mt-3 text-xs bg-muted/50 rounded-lg px-3 py-2">
                      <span className="font-semibold">Vet Note:</span> {c.vetNote}
                    </div>
                  )}

                  {c.status === "pending" && (
                    <div className="mt-4 space-y-2">
                      <textarea
                        placeholder="Add a diagnosis note or prescription… (optional)"
                        rows={2}
                        value={noteMap[c._id] || ""}
                        onChange={(e) => setNoteMap((p) => ({ ...p, [c._id]: e.target.value }))}
                        className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConsultationAction(c._id, "approved")}
                          disabled={processing === c._id}
                          className="flex-1 py-1.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                        >
                          {processing === c._id ? <RefreshCw className="h-4 w-4 animate-spin mx-auto" /> : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => handleConsultationAction(c._id, "rejected")}
                          disabled={processing === c._id}
                          className="flex-1 py-1.5 text-sm font-semibold rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 disabled:opacity-60 transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PATIENTS TAB ──────────────────────────────────────────────── */}
      {tab === "patients" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={patientQ} onChange={(e) => setPatientQ(e.target.value)}
                placeholder="Search by name or phone…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={loadPatients} className="flex items-center gap-1.5 text-sm px-3 py-2 glass-card rounded-lg hover:shadow-md">
              <RefreshCw className={cn("h-4 w-4", pLoading && "animate-spin")} />
            </button>
          </div>
          <div className="glass-card gradient-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Farmer", "Contact", "Soil", "Plan", "Joined"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pLoading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-1" />Loading…
                  </td></tr>
                ) : filteredPatients.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No patients found.</td></tr>
                ) : filteredPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.email || p.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.soilType || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5",
                        p.subscriptionStatus === "premium" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground")}>
                        {p.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADVISORY TAB ──────────────────────────────────────────────── */}
      {tab === "advisory" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Compose */}
          <div className="glass-card gradient-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-4 w-4 text-primary" /> Write Advisory
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Target</label>
              <select value={advForm.targetRole} onChange={(e) => setAdvForm((p) => ({ ...p, targetRole: e.target.value, farmerId: "" }))}
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2">
                <option value="all">All Farmers (Broadcast)</option>
                <option value="farmer">Specific Farmer</option>
              </select>
            </div>
            {advForm.targetRole === "farmer" && (
              <div>
                <label className="block text-xs font-medium mb-1">Farmer ID</label>
                <input value={advForm.farmerId} onChange={(e) => setAdvForm((p) => ({ ...p, farmerId: e.target.value }))}
                  placeholder="Paste farmer _id…"
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">Title</label>
              <input value={advForm.title} onChange={(e) => setAdvForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Monsoon disease alert"
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Crop (optional)</label>
              <input value={advForm.crop} onChange={(e) => setAdvForm((p) => ({ ...p, crop: e.target.value }))}
                placeholder="e.g. Rice, Wheat…"
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Advisory Body</label>
              <textarea value={advForm.body} onChange={(e) => setAdvForm((p) => ({ ...p, body: e.target.value }))} rows={5}
                placeholder="Write your advisory, recommendations, or diagnosis…"
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={handleSendAdvisory} disabled={sending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow hover:brightness-105 disabled:opacity-60 btn-press">
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send Advisory to Farmers"}
            </button>
          </div>

          {/* Advisory history */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">My Advisories</span>
              <button onClick={loadAdvisories} className="text-xs text-primary hover:underline flex items-center gap-1">
                <RefreshCw className={cn("h-3 w-3", aLoading && "animate-spin")} /> refresh
              </button>
            </div>
            {aLoading ? (
              <div className="text-center text-muted-foreground py-8"><RefreshCw className="h-5 w-5 animate-spin mx-auto" /></div>
            ) : advisories.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-sm text-muted-foreground">No advisories yet.</div>
            ) : advisories.map((a) => (
              <div key={a._id} className="glass-card gradient-border rounded-xl p-4 animate-fade-in-up">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm">{a.title}</div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                {a.crop && <div className="text-xs text-primary mt-0.5">🌾 {a.crop}</div>}
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
                <div className="mt-2 text-[10px] font-semibold text-muted-foreground">→ {a.farmerName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
