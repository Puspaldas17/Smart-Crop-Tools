import React, { useMemo, useState } from "react";
import { AlertTriangle, ShieldCheck, Info, Bug, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type RiskLevel = "high" | "medium" | "low";
type Trend = "rising" | "falling" | "stable";

interface PestAlert {
  crop: string;
  emoji: string;
  pest: string;
  risk: RiskLevel;
  forecastRisk: RiskLevel;       // 2-week ahead prediction
  confidence: number;             // 0-100
  trend: Trend;
  reason: string;
  forecastReason: string;
  action: string;
}

function getRiskScore(risk: RiskLevel): number {
  return risk === "high" ? 3 : risk === "medium" ? 2 : 1;
}

function getPredictiveAlerts(): PestAlert[] {
  const month = new Date().getMonth(); // 0-indexed
  const isMonsoon = month >= 5 && month <= 8;
  const isSpring = month >= 1 && month <= 3;
  const isWinter = month === 11 || month === 0 || month === 1;
  const isPreMonsoon = month === 4 || month === 5;

  // 2 weeks ahead: approaching transitions elevate risk
  const isApproachingMonsoon = month === 4;  // May → monsoon next 2w
  const isApproachingSpring = month === 0;    // Jan → spring next 2w

  return [
    {
      crop: "Rice",      emoji: "🍚",
      pest: "Brown Planthopper",
      risk: isMonsoon ? "high" : isPreMonsoon ? "medium" : "low",
      forecastRisk: isMonsoon ? "high" : isApproachingMonsoon ? "high" : isPreMonsoon ? "medium" : "low",
      confidence: isMonsoon ? 91 : isPreMonsoon ? 74 : 62,
      trend: isApproachingMonsoon || isPreMonsoon ? "rising" : isMonsoon ? "stable" : "falling",
      reason: isMonsoon
        ? "High humidity & monsoon rainfall create ideal BPH breeding conditions."
        : isPreMonsoon
        ? "Pre-monsoon warmth beginning to favour nymph emergence."
        : "Low seasonal risk — monitor leaf undersides periodically.",
      forecastReason: isApproachingMonsoon
        ? "⚠️ Monsoon onset in 2 weeks likely to trigger BPH surge. Act now."
        : isMonsoon
        ? "Risk remains high through the rest of the monsoon season."
        : "Risk expected to remain low for the next 2 weeks.",
      action: "Spray neem-based insecticide; avoid excess nitrogen fertilizer.",
    },
    {
      crop: "Wheat",   emoji: "🌾",
      pest: "Yellow Rust",
      risk: isSpring ? "high" : isWinter ? "medium" : "low",
      forecastRisk: isApproachingSpring ? "high" : isSpring ? "medium" : isWinter ? "medium" : "low",
      confidence: isSpring ? 88 : isWinter ? 70 : 55,
      trend: isApproachingSpring ? "rising" : isSpring ? "falling" : "stable",
      reason: isSpring
        ? "Cool, moist spring conditions favour rust spore germination."
        : isWinter
        ? "Temperature inversion events during winter increase rust spread risk."
        : "Low risk in current season — warm dry conditions inhibit rust.",
      forecastReason: isApproachingSpring
        ? "⚠️ Spring transition in 2 weeks; rust pressure will increase rapidly."
        : isSpring
        ? "Risk easing as temperatures warm — continue monitoring."
        : "Risk expected to remain low for the next 14 days.",
      action: "Apply propiconazole 25EC if yellow streaks appear on leaves.",
    },
    {
      crop: "Tomato",  emoji: "🍅",
      pest: "Whitefly / Leaf Curl Virus",
      risk: "medium",
      forecastRisk: isMonsoon || isSpring ? "high" : "medium",
      confidence: 77,
      trend: isMonsoon || isSpring ? "rising" : "stable",
      reason: "Whiteflies are active year-round; hot dry periods increase vector pressure.",
      forecastReason: isMonsoon || isSpring
        ? "⚠️ Warm humid forecast expected to intensify whitefly activity."
        : "Risk expected to remain at moderate levels for the next 2 weeks.",
      action: "Deploy yellow sticky traps; spray imidacloprid 0.5 ml/L.",
    },
    {
      crop: "Maize",   emoji: "🌽",
      pest: "Fall Armyworm (FAW)",
      risk: isMonsoon ? "high" : isSpring ? "medium" : "low",
      forecastRisk: isApproachingMonsoon ? "high" : isMonsoon ? "high" : isSpring ? "medium" : "low",
      confidence: isMonsoon ? 94 : isSpring ? 72 : 60,
      trend: isApproachingMonsoon ? "rising" : isMonsoon ? "stable" : "falling",
      reason: isMonsoon
        ? "Warm wet nights accelerate FAW egg hatching in leaf whorls."
        : isSpring
        ? "FAW larvae active in whorls — inspect every 3 days."
        : "Low seasonal presence — routine monitoring sufficient.",
      forecastReason: isApproachingMonsoon
        ? "⚠️ FAW population expected to spike with monsoon onset in 2 weeks."
        : isMonsoon
        ? "High FAW pressure to continue through monsoon season."
        : "Risk expected to remain low for the next 2 weeks.",
      action: "Apply emamectin benzoate 5 SG; install pheromone traps at 5/acre.",
    },
  ];
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; dot: string; Icon: React.ElementType }> = {
  high:   { label: "High",   color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    dot: "bg-red-500",    Icon: AlertTriangle },
  medium: { label: "Medium", color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30",  dot: "bg-amber-500",  Icon: Info },
  low:    { label: "Low",    color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30",  dot: "bg-green-500",  Icon: ShieldCheck },
};

const TREND_ICON: Record<Trend, React.ElementType> = {
  rising: TrendingUp,
  falling: TrendingDown,
  stable: Minus,
};
const TREND_COLOR: Record<Trend, string> = {
  rising: "text-red-400",
  falling: "text-green-400",
  stable: "text-muted-foreground",
};

export function PestAlertWidget() {
  const alerts = useMemo(() => getPredictiveAlerts(), []);
  const [showForecast, setShowForecast] = useState(false);
  const highCount = alerts.filter((a) => a.risk === "high").length;
  const forecastHighCount = alerts.filter((a) => a.forecastRisk === "high").length;

  return (
    <div className="glass-card gradient-border rounded-xl text-card-foreground shadow-sm">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="flex items-center gap-2 font-semibold tracking-tight">
            <Bug className="h-5 w-5 text-orange-500" />
            Predictive Pest Alerts
            {highCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-bold animate-pulse">
                {highCount} High
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowForecast((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all",
              showForecast
                ? "bg-primary/20 border-primary/40 text-primary"
                : "border-white/10 hover:bg-white/5"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            {showForecast ? "Hide" : "▶ 14-Day"} Forecast
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {showForecast
            ? `14-day outbreak forecast for your region. ${forecastHighCount > 0 ? `⚠️ ${forecastHighCount} crop(s) at High risk.` : "Risk levels expected to remain stable."}`
            : "Current seasonal outbreak risks for your area."}
        </p>
      </div>

      {/* Alert cards */}
      <div className="p-6 pt-0 space-y-3">
        {alerts.map((alert) => {
          const displayRisk = showForecast ? alert.forecastRisk : alert.risk;
          const { label, color, bg, border, dot, Icon } = RISK_CONFIG[displayRisk];
          const TrendIcon = TREND_ICON[alert.trend];
          const riskChange = getRiskScore(alert.forecastRisk) - getRiskScore(alert.risk);

          return (
            <div key={alert.crop} className={cn("rounded-xl border p-4 transition-all", bg, border)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{alert.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{alert.crop}</p>
                      {/* Risk badge */}
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md", color)}>
                        <Icon className="h-3 w-3" />
                        {label}
                        {showForecast && riskChange !== 0 && (
                          <span className={riskChange > 0 ? "text-red-400 ml-0.5" : "text-green-400 ml-0.5"}>
                            {riskChange > 0 ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                      {/* Trend only in current view */}
                      {!showForecast && (
                        <span className={cn("inline-flex items-center gap-0.5 text-[10px]", TREND_COLOR[alert.trend])}>
                          <TrendIcon className="h-3 w-3" />
                          {alert.trend}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{alert.pest}</p>
                  </div>
                </div>
                {/* Confidence ring — only in forecast mode */}
                {showForecast && (
                  <div className="shrink-0 text-center">
                    <div className={cn("text-lg font-bold", color)}>{alert.confidence}%</div>
                    <div className="text-[10px] text-muted-foreground">confidence</div>
                  </div>
                )}
              </div>

              {/* Reason */}
              <p className="text-xs text-muted-foreground mt-2">
                {showForecast ? alert.forecastReason : alert.reason}
              </p>

              {/* Action */}
              <div className="mt-2 flex items-start gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-green-400">{alert.action}</p>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground flex-wrap">
          {(["high", "medium", "low"] as RiskLevel[]).map((r) => (
            <span key={r} className="flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", RISK_CONFIG[r].dot)} />
              {RISK_CONFIG[r].label}
            </span>
          ))}
          <span className="ml-auto">Updated: {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}
