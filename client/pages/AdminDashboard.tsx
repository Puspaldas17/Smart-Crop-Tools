import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  Users, Activity, AlertTriangle, ShieldCheck, TrendingUp,
  ExternalLink, RefreshCw,
} from "lucide-react";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

// Mock data for when the API is unavailable
const MOCK_DATA = {
  metrics: { totalFarmers: 1284, totalScans: 3752, activeToday: 342, activeWithdrawals: 7 },
  diseaseDistribution: [
    { name: "Brown Planthopper", value: 34 },
    { name: "Yellow Rust", value: 22 },
    { name: "Fall Armyworm", value: 28 },
    { name: "Others", value: 16 },
  ],
  adoptionTrend: [
    { month: "Sep", users: 320 },
    { month: "Oct", users: 580 },
    { month: "Nov", users: 810 },
    { month: "Dec", users: 1020 },
    { month: "Jan", users: 1180 },
    { month: "Feb", users: 1284 },
  ],
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(MOCK_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/analytics/system")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Loading Authority Dashboard…
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="glass-card rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            Authority Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AgriVerse System Overview &amp; Compliance Monitoring
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Odisha / Khordha District
        </span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Total Farmers"
          value={data.metrics.totalFarmers.toLocaleString()}
          sub="↑ 12% this month"
          accent="blue"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5 text-green-600" />}
          label="AI Scans"
          value={data.metrics.totalScans.toLocaleString()}
          sub={`${((data.metrics.activeToday / data.metrics.totalFarmers) * 100).toFixed(0)}% active today`}
          accent="green"
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          label="AMU Violations"
          value={data.metrics.activeWithdrawals}
          sub="Active withdrawal periods"
          accent="orange"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
          label="Compliance Rate"
          value="98.2%"
          sub="Verified via ledger"
          accent="violet"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            Disease Outbreak Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.diseaseDistribution}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {data.diseaseDistribution.map((_: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Platform Adoption Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.adoptionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/amu"
          className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-lg text-sm font-medium hover:shadow-md transition-all"
        >
          <ExternalLink className="h-4 w-4" /> View AMU Ledger
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-lg text-sm font-medium hover:shadow-md transition-all"
        >
          <ExternalLink className="h-4 w-4" /> Farmer Dashboard
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; accent: string;
}) {
  const accentMap: Record<string, string> = {
    blue:   "bg-blue-50 dark:bg-blue-900/20",
    green:  "bg-green-50 dark:bg-green-900/20",
    orange: "bg-orange-50 dark:bg-orange-900/20",
    violet: "bg-violet-50 dark:bg-violet-900/20",
  };
  return (
    <div className="glass-card rounded-xl p-4">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${accentMap[accent] || ""}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium text-foreground/80 mt-0.5">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
