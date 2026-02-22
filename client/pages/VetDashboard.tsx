import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Stethoscope, Search, FileText, CheckCircle2,
  Clock, AlertTriangle, Link2, LogOut,
} from "lucide-react";

interface DrugLog {
  _id: string;
  animalId: string;
  drugName: string;
  dosage: string;
  withdrawalDays: number;
  treatmentDate: string;
  applicator: string;
}

// Pending prescription requests (mock)
const PENDING_REQUESTS = [
  { id: "p1", farmer: "Suresh Kumar", animal: "Cow #A12", drug: "Oxytetracycline", date: "20 Feb 2026" },
  { id: "p2", farmer: "Anita Devi",   animal: "Goat #G7",  drug: "Albendazole",    date: "21 Feb 2026" },
  { id: "p3", farmer: "Ranjit Sahu",  animal: "Pig #P3",   drug: "Ivermectin",     date: "21 Feb 2026" },
];

export default function VetDashboard() {
  const { farmer, logout } = useAuth();
  const [logs, setLogs]       = useState<DrugLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searched, setSearched] = useState(false);

  async function searchAnimal() {
    if (!searchId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/amu/status/${searchId}`);
      if (res.ok) {
        toast.success("Animal record found");
        setLogs([
          {
            _id: "1",
            animalId: searchId,
            drugName: "Oxytetracycline",
            dosage: "10 ml",
            withdrawalDays: 7,
            treatmentDate: new Date(Date.now() - 2 * 86400000).toISOString(),
            applicator: "Dr. Singh",
          },
        ]);
      } else {
        toast.error("No records found for this ID");
        setLogs([]);
      }
    } catch {
      toast.error("Search failed — check network connection");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  function daysRemaining(treatmentDate: string, withdrawalDays: number) {
    const treated = new Date(treatmentDate).getTime();
    const safeDate = treated + withdrawalDays * 86400000;
    const remaining = Math.ceil((safeDate - Date.now()) / 86400000);
    return remaining;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="glass-card rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-blue-600" />
            Veterinary Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome, Dr. {farmer?.name} · AMU Ledger &amp; Patient Records
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Search Panel */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              Patient Search
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Animal ID (e.g. COW-A12)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchAnimal()}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={searchAnimal}
                disabled={loading}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-95 disabled:opacity-60 transition-all"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Pending Approvals
              <span className="ml-auto bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {PENDING_REQUESTS.length}
              </span>
            </h3>
            <div className="space-y-2">
              {PENDING_REQUESTS.map((req) => (
                <div key={req.id} className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold">{req.farmer}</p>
                      <p className="text-xs text-muted-foreground">{req.animal} · {req.drug}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{req.date}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => toast.success(`Approved for ${req.farmer}`)}
                      className="flex-1 py-1 text-[10px] font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => toast.error(`Rejected for ${req.farmer}`)}
                      className="flex-1 py-1 text-[10px] font-semibold border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Link */}
          <a
            href="/amu"
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">AMU Blockchain Ledger</p>
              <p className="text-xs text-muted-foreground">View full treatment history</p>
            </div>
          </a>
        </div>

        {/* ── Right column: Medical Records ── */}
        <div className="md:col-span-2">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Medical Records
              </h2>
              <span className="text-xs text-muted-foreground">
                {logs.length} record{logs.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-30 animate-pulse" />
                <p className="text-sm">Searching records…</p>
              </div>
            ) : !searched ? (
              <div className="p-16 text-center text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Enter an animal ID to search</p>
                <p className="text-xs mt-1 text-muted-foreground/70">
                  Search by livestock ID (e.g. COW-A12, GOAT-G7)
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No records found</p>
                <p className="text-xs mt-1">Check the animal ID and try again.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {logs.map((log) => {
                  const remaining = daysRemaining(log.treatmentDate, log.withdrawalDays);
                  const isSafe    = remaining <= 0;
                  return (
                    <div key={log._id} className="p-5 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                        <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{log.drugName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Dosage: {log.dosage} · Administered by {log.applicator}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 ml-3">
                            {new Date(log.treatmentDate).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Withdrawal: <span className="font-medium text-foreground">{log.withdrawalDays} days</span>
                          </div>
                          {isSafe ? (
                            <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-medium">Safe to consume</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">{remaining} day{remaining > 1 ? "s" : ""} remaining</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
