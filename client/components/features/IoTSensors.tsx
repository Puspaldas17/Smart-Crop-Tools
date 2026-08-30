import { useState, useEffect } from "react";
import { Wifi, WifiOff, Thermometer, Droplets, FlaskConical, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensorReading {
  label: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  min: number;
  max: number;
  idealMin: number;
  idealMax: number;
  color: string;
}

function generateReadings(): SensorReading[] {
  const rand = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(1);
  return [
    {
      label: "Soil Moisture",
      value: rand(28, 68),
      unit: "%",
      icon: Droplets,
      min: 0, max: 100, idealMin: 40, idealMax: 70,
      color: "text-blue-400",
    },
    {
      label: "Soil Temperature",
      value: rand(18, 38),
      unit: "°C",
      icon: Thermometer,
      min: 0, max: 60, idealMin: 20, idealMax: 32,
      color: "text-orange-400",
    },
    {
      label: "Soil pH",
      value: rand(5.5, 8.0),
      unit: "pH",
      icon: FlaskConical,
      min: 0, max: 14, idealMin: 6.0, idealMax: 7.5,
      color: "text-purple-400",
    },
    {
      label: "Nitrogen (N)",
      value: rand(20, 85),
      unit: "mg/kg",
      icon: Zap,
      min: 0, max: 150, idealMin: 40, idealMax: 80,
      color: "text-green-400",
    },
  ];
}

function StatusDot({ value, idealMin, idealMax }: { value: number; idealMin: number; idealMax: number }) {
  const ok = value >= idealMin && value <= idealMax;
  const warning = !ok && (value >= idealMin * 0.8 && value <= idealMax * 1.2);

  return (
    <span className={cn(
      "inline-block h-2.5 w-2.5 rounded-full",
      ok ? "bg-green-500" : warning ? "bg-amber-500 animate-pulse" : "bg-red-500 animate-pulse"
    )} />
  );
}

export function IoTSensorDashboard() {
  const [readings, setReadings] = useState<SensorReading[]>(generateReadings());
  const [connected, setConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      setReadings(generateReadings());
      setLastUpdate(new Date());
      setRefreshing(false);
    }, 800);
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {connected ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
            IoT Soil Sensors
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            )}>
              {connected ? "Live" : "Offline"}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last updated: {lastUpdate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setConnected((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
          >
            Toggle Sensor
          </button>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition flex items-center gap-1"
          >
            <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {!connected ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <WifiOff className="h-10 w-10 mx-auto mb-2 text-red-400 opacity-60" />
          <p className="text-muted-foreground text-sm">Sensor offline. Check device power and WiFi connection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {readings.map((r) => {
            const pct = ((r.value - r.min) / (r.max - r.min)) * 100;
            const isIdeal = r.value >= r.idealMin && r.value <= r.idealMax;
            const Icon = r.icon;

            return (
              <div key={r.label} className="glass-card border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-4 w-4", r.color)} />
                    <span className="text-xs font-medium">{r.label}</span>
                  </div>
                  <StatusDot value={r.value} idealMin={r.idealMin} idealMax={r.idealMax} />
                </div>
                <div className={cn("text-2xl font-bold", r.color)}>
                  {r.value}<span className="text-sm font-normal text-muted-foreground ml-0.5">{r.unit}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", isIdeal ? "bg-green-500" : "bg-amber-500")}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  Ideal: {r.idealMin}–{r.idealMax} {r.unit}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Irrigation recommendation */}
      {connected && (() => {
        const moisture = readings.find((r) => r.label === "Soil Moisture");
        if (!moisture) return null;
        const isTooLow = moisture.value < moisture.idealMin;
        const isTooHigh = moisture.value > moisture.idealMax;
        if (!isTooLow && !isTooHigh) return null;
        return (
          <div className={cn(
            "rounded-xl border p-3 text-sm flex items-center gap-2",
            isTooLow ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-blue-500/30 bg-blue-500/10 text-blue-400"
          )}>
            <Droplets className="h-4 w-4 shrink-0" />
            {isTooLow
              ? `Soil moisture at ${moisture.value}% — below optimal. Consider irrigating now.`
              : `Soil moisture at ${moisture.value}% — above optimal. Hold irrigation for 2 days.`}
          </div>
        );
      })()}
    </div>
  );
}
