import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, Droplets, Cloud, Bug } from "lucide-react";

interface CropPerformance {
  crop: string;
  count: number;
  avgScore: number;
}

interface SoilHealthData {
  date: string;
  moisture: number;
  nitrogen: number;
  pH: number;
}

interface WeatherImpact {
  temperature: number;
  humidity: number;
  rainfall: number;
}

interface PestAnalysis {
  type: string;
  risk: number;
  frequency: number;
}

interface AnalyticsSummaryData {
  totalAdvisories: number;
  cropPerformance: CropPerformance[];
  soilHealthTrend: SoilHealthData[];
  weatherImpact: WeatherImpact;
  pestAnalysis: PestAnalysis[];
}

interface WeatherAnalysisData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  cropHealthScore: number;
}

export default function Analytics({ farmerId }: { farmerId: string }) {
  const [summary, setSummary] = useState<AnalyticsSummaryData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherAnalysisData[]>([]);
  const [cropTrends, setCropTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "crop" | "soil" | "weather"
  >("overview");

  useEffect(() => {
    fetchAnalytics();
  }, [farmerId]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const [summaryRes, weatherRes, cropRes] = await Promise.all([
        fetch(`/api/analytics/summary/${farmerId}?days=30`),
        fetch(`/api/analytics/weather-impact/${farmerId}?days=30`),
        fetch(`/api/analytics/crop-trends/${farmerId}?crop=Wheat`),
      ]);

      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }

      if (weatherRes.ok) {
        setWeatherData(await weatherRes.json());
      }

      if (cropRes.ok) {
        setCropTrends(await cropRes.json());
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-40 rounded bg-slate-200" />
          <div className="h-60 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 flex gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 font-medium ${
            activeTab === "overview"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-600"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("crop")}
          className={`pb-3 font-medium ${
            activeTab === "crop"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-600"
          }`}
        >
          Crop Performance
        </button>
        <button
          onClick={() => setActiveTab("soil")}
          className={`pb-3 font-medium ${
            activeTab === "soil"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-600"
          }`}
        >
          Soil Health
        </button>
        <button
          onClick={() => setActiveTab("weather")}
          className={`pb-3 font-medium ${
            activeTab === "weather"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-600"
          }`}
        >
          Weather Impact
        </button>
      </div>

      {activeTab === "overview" && summary && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Advisories</p>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {summary.totalAdvisories}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Avg Soil Health</p>
                <Droplets className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">
                {summary.soilHealthTrend.length > 0
                  ? Math.round(
                      summary.soilHealthTrend.reduce(
                        (sum, d) => sum + d.moisture,
                        0,
                      ) / summary.soilHealthTrend.length,
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Temperature</p>
                <Cloud className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {Math.round(summary.weatherImpact.temperature)}°C
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-gradient-to-br from-red-50 to-red-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Pest Risk</p>
                <Bug className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-900">
                {summary.pestAnalysis.length > 0
                  ? Math.round(
                      summary.pestAnalysis.reduce((sum, p) => sum + p.risk, 0) /
                        summary.pestAnalysis.length,
                    )
                  : 0}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h3 className="font-semibold mb-4">Crop Performance</h3>
              {summary.cropPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={summary.cropPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis
                      yAxisId="left"
                      label={{
                        value: "Count",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: "Score",
                        angle: 90,
                        position: "insideRight",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      fill="#3b82f6"
                      name="Advisories"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="avgScore"
                      fill="#10b981"
                      name="Avg Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No crop data available
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h3 className="font-semibold mb-4">Pest Risk Analysis</h3>
              {summary.pestAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={summary.pestAnalysis}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="type" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Risk Level"
                      dataKey="risk"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No pest data available
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "crop" && cropTrends.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4 bg-white">
          <h3 className="font-semibold mb-4">Crop Health Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={cropTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="healthScore"
                stroke="#10b981"
                name="Health Score"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="yield"
                stroke="#3b82f6"
                name="Yield"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pestPressure"
                stroke="#ef4444"
                name="Pest Pressure"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "soil" &&
        summary &&
        summary.soilHealthTrend.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h3 className="font-semibold mb-4">
                Soil Moisture & Nitrogen Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={summary.soilHealthTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="moisture"
                    fill="#06b6d4"
                    stroke="#06b6d4"
                    name="Moisture %"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="nitrogen"
                    fill="#f59e0b"
                    stroke="#f59e0b"
                    name="Nitrogen %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h3 className="font-semibold mb-4">Soil pH Level</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={summary.soilHealthTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[4, 8]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pH"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="pH Level"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      {activeTab === "weather" && weatherData.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-4 bg-white">
            <h3 className="font-semibold mb-4">Weather vs Crop Health</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "°C / %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Health Score",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  name="Temperature °C"
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#06b6d4"
                  name="Humidity %"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cropHealthScore"
                  stroke="#10b981"
                  name="Crop Health"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 bg-white">
            <h3 className="font-semibold mb-4">Rainfall Impact</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
