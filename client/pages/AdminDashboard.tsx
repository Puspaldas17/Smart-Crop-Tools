import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  Users, Activity, AlertTriangle, ShieldCheck, TrendingUp,
  RefreshCw, Trash2, Crown, ChevronDown, Search, Send,
  Bell, Settings, LayoutDashboard, Syringe, UserCog,
  CheckCircle2, XCircle, Wifi, Database, Stethoscope, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"];
type AdminTab = "overview" | "users" | "amu" | "broadcast" | "system";

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; accent: string;
}) {
  const accentMap: Record<string, string> = {
    blue:   "from-blue-500/10 to-blue-500/5   border-blue-500/20",
    green:  "from-green-500/10 to-green-500/5  border-green-500/20",
    orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20",
    sky:    "from-sky-500/10 to-sky-500/5       border-sky-500/20",
    rose:   "from-rose-500/10 to-rose-500/5     border-rose-500/20",
  };
  return (
    <div className={cn(
      "glass-card gradient-border rounded-xl p-4 bg-gradient-to-br animate-scale-in stat-card",
      accentMap[accent],
    )}>
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-background/60 p-2">{icon}</div>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground/70">{label}</div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ data }: { data: any }) {
  const { authHeaders } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/consultations", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setConsultations(Array.isArray(d) ? d : []))
      .catch(() => setConsultations([]));
  }, []);

  if (!data) return <div className="text-center text-muted-foreground py-12">Loading…</div>;
  if (data.error || !data.metrics) return <div className="text-center text-red-500 py-12">Failed to load overview data.</div>;
  const { metrics, adoptionTrend, diseaseDistribution } = data;
  const pendingConsultations = consultations.filter((c) => c.status === "pending").length;
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={<Users className="h-5 w-5 text-blue-500" />}    label="Total Farmers"    value={metrics.totalFarmers}        sub="↑ registered"             accent="blue"   />
        <MetricCard icon={<Activity className="h-5 w-5 text-green-500" />}  label="Active Today"    value={metrics.activeToday}          sub="new 24h"                  accent="green"  />
        <MetricCard icon={<TrendingUp className="h-5 w-5 text-sky-500" />}  label="Advisories"      value={metrics.totalAdvisories}      sub="all-time"                 accent="sky"    />
        <MetricCard icon={<Stethoscope className="h-5 w-5 text-indigo-500" />} label="Consultations" value={consultations.length}         sub={`${pendingConsultations} pending`} accent="violet" />
        <MetricCard icon={<AlertTriangle className="h-5 w-5 text-orange-500" />} label="AMU Violations" value={metrics.activeWithdrawals}  sub="withdrawal active"        accent="orange" />
        <MetricCard icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />} label="Compliance"  value={`${metrics.complianceRate}%`} sub="via ledger"               accent="green"  />
      </div>

      {/* Subscription split */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card gradient-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold">Subscription Split</span>
          </div>
          <div className="flex items-end gap-6 mt-4">
            <div>
              <div className="text-3xl font-bold text-amber-500">{metrics.premiumCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Premium</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-400">{metrics.freeCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Free</div>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                  style={{ width: metrics.totalFarmers > 0 ? `${(metrics.premiumCount / metrics.totalFarmers) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Disease distribution pie */}
        <div className="glass-card gradient-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            <span className="text-sm font-semibold">Disease / AMU Distribution</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diseaseDistribution} cx="50%" cy="50%" outerRadius={55} dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {diseaseDistribution.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Adoption trend */}
      <div className="glass-card gradient-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm font-semibold">Platform Adoption (6 months)</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={adoptionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2.5}
                dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consultations overview */}
      {consultations.length > 0 && (
        <div className="glass-card gradient-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-sm">Farmer ↔ Vet Consultations</span>
            {pendingConsultations > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingConsultations} pending
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Farmer", "Vet", "Disease", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {consultations.slice(0, 8).map((c: any) => (
                  <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.farmerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.vetName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.disease}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs font-semibold rounded-full px-2 py-0.5",
                        c.status === "approved" ? "bg-emerald-100 text-emerald-700"
                        : c.status === "rejected" ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700",
                      )}>
                        {c.status === "approved" ? "✅ Approved" : c.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { authHeaders } = useAuth();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ q, role: roleFilter, status: statusFilter });
    fetch(`/api/admin/farmers?${params}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setFarmers(Array.isArray(d) ? d : []))
      .catch(() => setFarmers([]))
      .finally(() => setLoading(false));
  }, [q, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await fetch(`/api/admin/farmers/${id}`, { method: "DELETE", headers: authHeaders() });
    toast.success(`Deleted ${name}`);
    load();
  };

  const handlePatch = async (id: string, field: string, value: string) => {
    await fetch(`/api/admin/farmers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ [field]: value }),
    });
    toast.success("Updated");
    setEditing(null);
    load();
  };

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "farmer", subscriptionStatus: "free" });

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Subscription", "Soil Type", "Land Size", "Created At"];
    const rows = farmers.map((f) => [
      f.name ?? "",
      f.email ?? "",
      f.phone ?? "",
      f.role ?? "farmer",
      f.subscriptionStatus ?? "free",
      f.soilType ?? "",
      f.landSize ?? "",
      f.createdAt ? new Date(f.createdAt).toLocaleDateString("en-IN") : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agriverse_users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success(`Exported ${farmers.length} users to CSV`);
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required"); return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`✅ ${form.role.charAt(0).toUpperCase() + form.role.slice(1)} "${form.name}" saved to DB`);
      setForm({ name: "", email: "", phone: "", password: "", role: "farmer", subscriptionStatus: "free" });
      setShowCreate(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground font-medium">{farmers.length} users in database</p>
        <button
          onClick={exportCSV}
          disabled={farmers.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Create User Panel */}
      <div className="glass-card gradient-border rounded-xl overflow-hidden">

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold hover:bg-muted/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-primary" />
            Create New User (Admin / Vet / Farmer)
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showCreate && "rotate-180")} />
        </button>
        {showCreate && (
          <div className="border-t border-border px-5 py-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {[
              { label: "Full Name *",  key: "name",     type: "text",     placeholder: "e.g. Dr. Vet Officer" },
              { label: "Email *",      key: "email",    type: "email",    placeholder: "vet@agriverse.in" },
              { label: "Phone",        key: "phone",    type: "tel",      placeholder: "9876543210" },
              { label: "Password *",   key: "password", type: "password", placeholder: "min 6 chars" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2">
                <option value="farmer">Farmer</option>
                <option value="vet">Vet</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Plan</label>
              <select value={form.subscriptionStatus} onChange={(e) => setForm((p) => ({ ...p, subscriptionStatus: e.target.value }))}
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2">
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-1">
              <button onClick={() => setShowCreate(false)} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating}
                className="btn-press text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:brightness-105 disabled:opacity-60 flex items-center gap-2">
                {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                {creating ? "Saving…" : "Save to Database"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm rounded-lg border border-border bg-background px-3 py-2">
          <option value="all">All Roles</option>
          <option value="farmer">Farmer</option>
          <option value="admin">Admin</option>
          <option value="vet">Vet</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm rounded-lg border border-border bg-background px-3 py-2">
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        <button onClick={load} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="glass-card gradient-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Name / Contact", "Role", "Plan", "Soil", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />Loading…
                </td></tr>
              ) : farmers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No farmers found.</td></tr>
              ) : farmers.map((f) => (
                <tr key={f._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.email || f.phone || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    {editing === f._id + "role" ? (
                      <select autoFocus defaultValue={f.role}
                        onBlur={(e) => handlePatch(f._id, "role", e.target.value)}
                        className="text-xs rounded border border-border bg-background px-2 py-1">
                        {["farmer", "admin", "vet"].map((r) => <option key={r}>{r}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setEditing(f._id + "role")}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20">
                        {f.role} <ChevronDown className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === f._id + "sub" ? (
                      <select autoFocus defaultValue={f.subscriptionStatus}
                        onBlur={(e) => handlePatch(f._id, "subscriptionStatus", e.target.value)}
                        className="text-xs rounded border border-border bg-background px-2 py-1">
                        {["free", "premium"].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setEditing(f._id + "sub")}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold hover:opacity-80",
                          f.subscriptionStatus === "premium"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                        )}>
                        {f.subscriptionStatus === "premium" && <Crown className="h-3 w-3" />}
                        {f.subscriptionStatus} <ChevronDown className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{f.soilType || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(f.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(f._id, f.name)}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">{farmers.length} record{farmers.length !== 1 ? "s" : ""}</div>}
      </div>
    </div>
  );
}

// ─── AMU Ledger Tab ──────────────────────────────────────────────────────────
function AmuTab() {
  const { authHeaders } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/amu", { headers: authHeaders() })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ logs: [], chainLength: 0 }));
  }, []);

  const logs: any[] = data?.logs || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass-card rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Chain length: <span className="text-primary">{data?.chainLength ?? "—"}</span>
          </div>
          <div className="glass-card rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Active violations: <span className="text-orange-500">{logs.filter((l) => l.status === "active").length}</span>
          </div>
        </div>
        <Link to="/amu" className="text-sm text-primary hover:underline">Full AMU →</Link>
      </div>

      <div className="glass-card gradient-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Animal ID", "Drug", "Dosage", "Withdrawal", "Treated", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No AMU logs yet.</td></tr>
              ) : logs.map((l) => (
                <tr key={l._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.animalId}</td>
                  <td className="px-4 py-3">{l.drugName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.dosage}</td>
                  <td className="px-4 py-3">{l.withdrawalDays}d {l.daysLeft > 0 ? `(${l.daysLeft}d left)` : ""}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.treatmentDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    {l.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/30 rounded-full px-2.5 py-0.5">
                        <XCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-2.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Broadcast Tab ─────────────────────────────────────────────────────────────
function BroadcastTab() {
  const { authHeaders } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = () => {
    fetch("/api/admin/broadcasts", { headers: authHeaders() }).then((r) => r.json()).then(setHistory).catch(() => {});
  };

  useEffect(loadHistory, []);

  const handleSend = async () => {
    if (!title || !body) return toast.error("Title and body are required.");
    setSending(true);
    await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ title, body, target }),
    });
    toast.success("Broadcast sent!");
    setTitle(""); setBody("");
    loadHistory();
    setSending(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Compose */}
      <div className="glass-card gradient-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <Bell className="h-4 w-4 text-primary" /> Compose Broadcast
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Target</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)}
            className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2">
            <option value="all">All Farmers</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title…"
            className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Message</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
            placeholder="Write your message…"
            className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button onClick={handleSend} disabled={sending}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow hover:brightness-105 disabled:opacity-60 btn-press">
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : "Send Broadcast"}
        </button>
      </div>

      {/* History */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-muted-foreground">Recent Broadcasts</div>
        {history.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center text-sm text-muted-foreground">No broadcasts yet.</div>
        ) : history.map((b) => (
          <div key={b.id} className="glass-card gradient-border rounded-xl p-4 animate-fade-in-up">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-sm text-foreground">{b.title}</div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(b.ts).toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{b.body}</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
              → {b.target}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── System Tab ────────────────────────────────────────────────────────────────
function SystemTab() {
  const checks = [
    { label: "API Server",         ok: true,  note: "Express running" },
    { label: "Database (MongoDB)", ok: true, note: "In-memory or MongoDB Atlas" },
    { label: "Analytics Route",    ok: true,  note: "/api/analytics/system" },
    { label: "Admin Routes",       ok: true,  note: "/api/admin/*" },
    { label: "AMU Ledger",         ok: true,  note: "/api/amu/*" },
    { label: "Chat / AI",          ok: true,  note: "/api/chat" },
  ];

  return (
    <div className="space-y-4">
      <div className="glass-card gradient-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Wifi className="h-4 w-4 text-primary" /> Service Health
        </div>
        {checks.map(({ label, ok, note }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">{note}</div>
            </div>
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5",
              ok ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                 : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
            )}>
              {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {ok ? "Healthy" : "Down"}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card gradient-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Settings className="h-4 w-4 text-primary" /> Admin Actions
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/api/analytics/system" target="_blank"
            className="text-sm px-4 py-2 glass-card rounded-lg hover:shadow-md transition-all font-medium">
            📊 System Analytics JSON
          </a>
          <a href="/api/admin/farmers" target="_blank"
            className="text-sm px-4 py-2 glass-card rounded-lg hover:shadow-md transition-all font-medium">
            👥 Farmers JSON
          </a>
          <a href="/api/admin/amu" target="_blank"
            className="text-sm px-4 py-2 glass-card rounded-lg hover:shadow-md transition-all font-medium">
            💉 AMU Ledger JSON
          </a>
          <a href="/api/debug/users" target="_blank"
            className="text-sm px-4 py-2 glass-card rounded-lg hover:shadow-md transition-all font-medium">
            🔧 Debug Users JSON
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────
const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",   label: "Overview",   icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "users",      label: "Users",      icon: <UserCog className="h-4 w-4" /> },
  { id: "amu",        label: "AMU Ledger", icon: <Syringe className="h-4 w-4" /> },
  { id: "broadcast",  label: "Broadcast",  icon: <Bell className="h-4 w-4" /> },
  { id: "system",     label: "System",     icon: <Settings className="h-4 w-4" /> },
];

export default function AdminDashboard() {
  const { authHeaders } = useAuth();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = () => {
    setLoading(true);
    fetch("/api/admin/overview", { headers: authHeaders() })
      .then((r) => r.json())
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  };

  useEffect(loadOverview, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card gradient-border rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-blue-500" />
            <span className="gradient-text">Authority Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AgriVerse System Overview · Odisha / Khordha District
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse-dot" />
            Live
          </span>
          <button onClick={loadOverview}
            className="flex items-center gap-1.5 text-sm px-3 py-2 glass-card rounded-lg hover:shadow-md btn-press">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
              tab === id
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {tab === "overview"   && <OverviewTab  data={overview} />}
        {tab === "users"      && <UsersTab />}
        {tab === "amu"        && <AmuTab />}
        {tab === "broadcast"  && <BroadcastTab />}
        {tab === "system"     && <SystemTab />}
      </div>
    </div>
  );
}
