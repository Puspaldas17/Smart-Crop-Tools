import React, { useMemo } from "react";
import { AlertTriangle, ShieldCheck, Info, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

type RiskLevel = "high" | "medium" | "low";

interface PestAlert {
  crop: string;
  emoji: string;
  pest: string;
  risk: RiskLevel;
  reason: string;
  action: string;
}

// Simulates predictive logic based on current month + season
function getPredictiveAlerts(): PestAlert[] {
  const month = new Date().getMonth(); // 0-indexed
  // Feb-Apr = Spring; Jun-Sep = Monsoon; Oct-Jan = Winter

  const isMonsoon = month >= 5 && month <= 8;
  const isSpring = month >= 1 && month <= 3;

  return [
    {
      crop: "Rice",
      emoji: "🍚",
      pest: "Brown Planthopper",
      risk: isMonsoon ? "high" : "medium",
      reason: isMonsoon
        ? "High humidity & monsoon rainfall ideal for BPH outbreaks."
        : "Moderate risk — check for early nymphs on leaves.",
      action: "Spray neem-based insecticide; avoid excess nitrogen fertilizer.",
    },
    {
      crop: "Wheat",
      emoji: "🌾",
      pest: "Yellow Rust",
      risk: isSpring ? "high" : "low",
      reason: isSpring
        ? "Cool, moist spring conditions favour rust spore germination."
        : "Low risk in current season conditions.",
      action: "Apply propiconazole fungicide if yellow streaks appear on leaves.",
    },
    {
      crop: "Tomato",
      emoji: "🍅",
      pest: "Whitefly / Leaf Curl",
      risk: "medium",
      reason: "Whiteflies are active year-round; monitor frequently.",
      action: "Use yellow sticky traps; spray imidacloprid 0.5ml/L water.",
    },
    {
      crop: "Maize",
      emoji: "🌽",
      pest: "Fall Armyworm",
      risk: isMonsoon ? "high" : isSpring ? "medium" : "low",
      reason: isMonsoon
        ? "Warm wet nights accelerate FAW egg hatching in whorls."
        : "Moderate presence — inspect whorls every 3 days.",
      action: "Apply emamectin benzoate; install pheromone traps at 5/acre.",
    },
  ];
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  high: { label: "High Risk", color: "text-red-700", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", Icon: AlertTriangle },
  medium: { label: "Medium Risk", color: "text-amber-700", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", Icon: Info },
  low: { label: "Low Risk", color: "text-green-700", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", Icon: ShieldCheck },
};

export function PestAlertWidget() {
  const alerts = useMemo(() => getPredictiveAlerts(), []);
  const highCount = alerts.filter((a) => a.risk === "high").length;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6 pb-4">
        <h3 className="flex items-center gap-2 font-semibold tracking-tight">
          <Bug className="h-5 w-5 text-orange-500" />
          Predictive Pest Alerts
          {highCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-bold animate-pulse">
              {highCount} High
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          AI-forecasted outbreak risks for your region this season.
        </p>
      </div>
      <div className="p-6 pt-0 space-y-3">
        {alerts.map((alert) => {
          const { label, color, bg, border, Icon } = RISK_CONFIG[alert.risk];
          return (
            <div
              key={alert.crop}
              className={cn("rounded-xl border p-3 transition-all", bg, border)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{alert.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{alert.crop}</p>
                      <span className={cn("text-[10px] font-bold flex items-center gap-0.5", color)}>
                        <Icon className="h-3 w-3" /> {label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{alert.pest}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{alert.reason}</p>
              <div className="mt-2 flex items-start gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-green-700 dark:text-green-400">{alert.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
