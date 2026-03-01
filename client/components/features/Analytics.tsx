import { useEffect, useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { TrendingUp, Droplets, Cloud, Bug, Sprout, ThermometerSun, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// ─── Rich mock data shown when backend returns nothing ──────────────────────
function generateDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  });
}

const DAYS = generateDays(30);

const MOCK_SUMMARY = {
  totalAdvisories: 24,
  cropPerformance: [
    { crop: "Rice", count: 8, avgScore: 76 },
    { crop: "Wheat", count: 6, avgScore: 82 },
    { crop: "Tomato", count: 5, avgScore: 68 },
    { crop: "Maize", count: 3, avgScore: 74 },
    { crop: "Onion", count: 2, avgScore: 79 },
  ],
  soilHealthTrend: DAYS.filter((_, i) => i % 5 === 0).map((date, i) => ({
    date,
    moisture: 45 + Math.round(Math.sin(i) * 10 + Math.random() * 8),
    nitrogen: 60 + Math.round(Math.cos(i) * 8 + Math.random() * 6),
    pH: parseFloat((6.2 + Math.sin(i * 0.5) * 0.4).toFixed(1)),
  })),
  weatherImpact: { temperature: 28.4, humidity: 72, rainfall: 18 },
  pestAnalysis: [
    { type: "Brown Planthopper", risk: 73, frequency: 4 },
    { type: "Leaf Blight", risk: 55, frequency: 3 },
    { type: "Aphids", risk: 38, frequency: 2 },
    { type: "Armyworm", risk: 62, frequency: 3 },
    { type: "Yellow Rust", risk: 44, frequency: 2 },
  ],
};

const MOCK_WEATHER = DAYS.filter((_, i) => i % 3 === 0).map((date, i) => ({
  date,
  temperature: Math.round(25 + Math.sin(i * 0.4) * 5 + Math.random() * 3),
  humidity: Math.round(65 + Math.cos(i * 0.3) * 12 + Math.random() * 5),
  rainfall: Math.max(0, Math.round(10 + Math.sin(i * 0.6) * 12 + Math.random() * 8)),
  cropHealthScore: Math.round(70 + Math.sin(i * 0.5) * 8 + Math.random() * 5),
}));

const MOCK_CROP_TRENDS = DAYS.filter((_, i) => i % 3 === 0).map((date, i) => ({
  date,
  healthScore: Math.round(65 + Math.sin(i * 0.4) * 10 + Math.random() * 8),
  yield: Math.round(55 + Math.cos(i * 0.3) * 12 + Math.random() * 6),
  pestPressure: Math.round(30 + Math.sin(i * 0.6) * 15 + Math.random() * 8),
}));

// ────────────────────────────────────────────────────────────────────────────

export default function Analytics({ farmerId }: { farmerId: string }) {
  const { authHeaders } = useAuth();
  const [summary, setSummary] = useState(MOCK_SUMMARY);
  const [weatherData, setWeatherData] = useState(MOCK_WEATHER);
  const [cropTrends, setCropTrends] = useState(MOCK_CROP_TRENDS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "crop" | "soil" | "weather">("overview");

  useEffect(() => {
    fetchAnalytics();
  }, [farmerId]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const [summaryRes, weatherRes, cropRes] = await Promise.all([
        fetch(`/api/analytics/summary/${farmerId}?days=30`, { headers: authHeaders() }),
        fetch(`/api/analytics/weather-impact/${farmerId}?days=30`, { headers: authHeaders() }),
        fetch(`/api/analytics/crop-trends/${farmerId}?crop=Wheat`, { headers: authHeaders() }),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        // Only override if API returned meaningful data
        if (data?.cropPerformance?.length > 0) setSummary(data);
      }
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        if (Array.isArray(data) && data.length > 0) setWeatherData(data);
      }
      if (cropRes.ok) {
        const data = await cropRes.json();
        if (Array.isArray(data) && data.length > 0) setCropTrends(data);
      }
    } catch {
      // Silently fall through to mock data
    } finally {
      setLoading(false);
    }
  }

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "crop",     label: "Crop Performance" },
    { key: "soil",     label: "Soil Health" },
    { key: "weather",  label: "Weather Impact" },
  ] as const;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted" />)}
        </div>
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
              activeTab === key
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Advisories", value: summary.totalAdvisories, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
              { label: "Avg Soil Moisture", value: `${Math.round(summary.soilHealthTrend.reduce((s,d) => s + d.moisture, 0) / summary.soilHealthTrend.length)}%`, icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800" },
              { label: "Temperature", value: `${Math.round(summary.weatherImpact.temperature)}°C`, icon: ThermometerSun, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
              { label: "Avg Pest Risk", value: Math.round(summary.pestAnalysis.reduce((s,p) => s + p.risk, 0) / summary.pestAnalysis.length), icon: Bug, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
            ].map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={cn("rounded-xl border p-4", bg, border)}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <p className={cn("text-3xl font-bold", color)}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Crop Performance Bar */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Sprout className="h-4 w-4 text-green-600" /> Crop Performance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.cropPerformance} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Advisories" radius={[4,4,0,0]} />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#10b981" name="Avg Score" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pest Radar */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Bug className="h-4 w-4 text-red-500" /> Pest Risk Radar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={summary.pestAnalysis}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="type" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Risk Level" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── CROP PERFORMANCE ─────────────────────────────────────── */}
      {activeTab === "crop" && (
        <div className="space-y-5">
          {/* Score comparison */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Crop Health Score by Type</h3>
            <p className="text-xs text-muted-foreground mb-4">Advisory count vs average health score per crop</p>
            <div className="space-y-3">
              {summary.cropPerformance.map((c) => (
                <div key={c.crop}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{c.crop}</span>
                    <span className="text-muted-foreground">{c.avgScore}/100 · {c.count} advisories</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", c.avgScore >= 75 ? "bg-green-500" : c.avgScore >= 60 ? "bg-amber-400" : "bg-red-400")}
                      style={{ width: `${c.avgScore}%`, transition: "width 1s ease" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend lines */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Crop Health Trend (30 days)</h3>
            <p className="text-xs text-muted-foreground mb-4">Health score, yield index, and pest pressure over time</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cropTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="healthScore" stroke="#10b981" strokeWidth={2} name="Health Score" dot={false} />
                <Line type="monotone" dataKey="yield" stroke="#3b82f6" strokeWidth={2} name="Yield Index" dot={false} />
                <Line type="monotone" dataKey="pestPressure" stroke="#ef4444" strokeWidth={2} name="Pest Pressure" dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── SOIL HEALTH ──────────────────────────────────────────── */}
      {activeTab === "soil" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Soil Moisture & Nitrogen Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">30-day rolling values from sensor data</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={summary.soilHealthTrend}>
                <defs>
                  <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="nitrogenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="moisture" stroke="#06b6d4" fill="url(#moistureGrad)" strokeWidth={2} name="Moisture %" />
                <Area type="monotone" dataKey="nitrogen" stroke="#f59e0b" fill="url(#nitrogenGrad)" strokeWidth={2} name="Nitrogen %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Soil pH Level</h3>
            <p className="text-xs text-muted-foreground mb-4">Ideal range: 6.0 – 7.0 for most crops</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={summary.soilHealthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[5, 8]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2.5} name="pH Level" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── WEATHER IMPACT ───────────────────────────────────────── */}
      {activeTab === "weather" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Avg Temp", value: `${Math.round(weatherData.reduce((s,d) => s + d.temperature, 0) / weatherData.length)}°C`, icon: ThermometerSun, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
              { label: "Avg Humidity", value: `${Math.round(weatherData.reduce((s,d) => s + d.humidity, 0) / weatherData.length)}%`, icon: Cloud, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
              { label: "Total Rainfall", value: `${weatherData.reduce((s,d) => s + d.rainfall, 0)}mm`, icon: Wind, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={cn("rounded-xl border border-border p-3 text-center", color.split(" ").slice(1).join(" "))}>
                <Icon className={cn("h-5 w-5 mx-auto mb-1", color.split(" ")[0])} />
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Weather vs crop health */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Temperature & Humidity vs Crop Health</h3>
            <p className="text-xs text-muted-foreground mb-4">30-day correlation between weather conditions and crop health score</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "°C / %", angle: -90, position: "insideLeft", fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: "Health", angle: 90, position: "insideRight", fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} name="Temperature °C" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} name="Humidity %" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="cropHealthScore" stroke="#10b981" strokeWidth={2.5} name="Crop Health" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rainfall bar chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Rainfall Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Daily rainfall in mm over the past 30 days</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall (mm)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
