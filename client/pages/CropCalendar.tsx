import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Sprout, Clock, CheckCircle2, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";

interface CropEntry {
  crop: string;
  emoji: string;
  sowingMonths: number[];   // 0-indexed months
  harvestMonths: number[];
  duration: string;
  waterNeed: "Low" | "Medium" | "High";
  soilTypes: string[];
  tip: string;
}

const CROPS: CropEntry[] = [
  { crop: "Rice (Kharif)", emoji: "🍚", sowingMonths: [5, 6], harvestMonths: [9, 10], duration: "90–120 days", waterNeed: "High", soilTypes: ["Alluvial", "Black (Regur)"], tip: "Transplant seedlings 25–30 days after sowing." },
  { crop: "Wheat (Rabi)", emoji: "🌾", sowingMonths: [10, 11], harvestMonths: [2, 3], duration: "120–150 days", waterNeed: "Medium", soilTypes: ["Alluvial", "Black (Regur)"], tip: "Sow when temp drops below 25°C for best germination." },
  { crop: "Maize", emoji: "🌽", sowingMonths: [5, 6, 10], harvestMonths: [8, 9, 1], duration: "80–110 days", waterNeed: "Medium", soilTypes: ["Alluvial", "Red & Laterite"], tip: "Requires well-drained loamy soil. Avoid waterlogging." },
  { crop: "Tomato", emoji: "🍅", sowingMonths: [1, 6, 10], harvestMonths: [3, 8, 12], duration: "60–80 days", waterNeed: "Medium", soilTypes: ["Alluvial", "Red & Laterite"], tip: "Stake plants at 30cm height for better support." },
  { crop: "Onion", emoji: "🧅", sowingMonths: [9, 10, 11], harvestMonths: [1, 2, 3], duration: "120–150 days", waterNeed: "Low", soilTypes: ["Alluvial", "Black (Regur)"], tip: "Stop irrigation 2 weeks before harvest to improve shelf life." },
  { crop: "Potato", emoji: "🥔", sowingMonths: [9, 10], harvestMonths: [0, 1], duration: "90–120 days", waterNeed: "Medium", soilTypes: ["Alluvial"], tip: "Hill up soil around plants when 15–20cm tall." },
  { crop: "Soybean", emoji: "🫘", sowingMonths: [5, 6], harvestMonths: [9, 10], duration: "90–110 days", waterNeed: "Medium", soilTypes: ["Black (Regur)", "Alluvial"], tip: "Inoculate seeds with Rhizobium for nitrogen fixation." },
  { crop: "Sunflower", emoji: "🌻", sowingMonths: [1, 2, 9, 10], harvestMonths: [4, 5, 12, 1], duration: "85–100 days", waterNeed: "Low", soilTypes: ["Alluvial", "Red & Laterite"], tip: "Grows best in full sun with well-drained soil." },
  { crop: "Sugarcane", emoji: "🎋", sowingMonths: [0, 1, 9, 10], harvestMonths: [9, 10, 11], duration: "10–12 months", waterNeed: "High", soilTypes: ["Alluvial", "Black (Regur)"], tip: "Ratoon crop possible for 2–3 cycles after first harvest." },
  { crop: "Mango (planting)", emoji: "🥭", sowingMonths: [6, 7], harvestMonths: [3, 4, 5], duration: "3–5 years to fruit", waterNeed: "Low", soilTypes: ["Alluvial", "Red & Laterite"], tip: "Plant in monsoon; needs dry weather during flowering." },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WATER_COLOR: Record<string, string> = { Low: "text-green-700 bg-green-100", Medium: "text-amber-700 bg-amber-100", High: "text-blue-700 bg-blue-100" };

export default function CropCalendar() {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterWater, setFilterWater] = useState<string>("All");

  const displayMonth = filterMonth !== null ? filterMonth : currentMonth;

  const filtered = CROPS.filter((c) => {
    const monthMatch = filterMonth === null
      ? c.sowingMonths.includes(currentMonth) || c.harvestMonths.includes(currentMonth)
      : c.sowingMonths.includes(filterMonth) || c.harvestMonths.includes(filterMonth);
    const waterMatch = filterWater === "All" || c.waterNeed === filterWater;
    return monthMatch && waterMatch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-green-600" />
            Crop Sowing Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Best sowing & harvest windows for your crops</p>
        </div>
      </div>

      {/* Month Strip */}
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground mb-2">Select Month</p>
        <div className="flex gap-1.5 flex-wrap">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setFilterMonth(filterMonth === i ? null : i)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                i === currentMonth && filterMonth === null
                  ? "bg-primary text-primary-foreground border-primary shadow"
                  : filterMonth === i
                    ? "bg-primary text-primary-foreground border-primary shadow"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Water filter */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs font-medium text-muted-foreground">Water need:</span>
        {["All", "Low", "Medium", "High"].map((w) => (
          <button
            key={w}
            onClick={() => setFilterWater(w)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              filterWater === w
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Current month banner */}
      <div className="flex items-center gap-2 mb-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-2.5">
        <CloudSun className="h-4 w-4 text-green-600" />
        <p className="text-sm text-green-800 dark:text-green-300 font-medium">
          Showing crops for <span className="font-bold">{MONTHS[displayMonth]}</span>
          {filterMonth === null && <span className="font-normal text-green-600"> (current month)</span>}
        </p>
      </div>

      {/* Crop Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Sprout className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No crops match for this month/filter combination.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((crop) => {
            const isSowing = crop.sowingMonths.includes(displayMonth);
            const isHarvest = crop.harvestMonths.includes(displayMonth);
            return (
              <div
                key={crop.crop}
                className={cn(
                  "rounded-2xl border p-4 transition-all hover:shadow-md",
                  isSowing && isHarvest
                    ? "border-purple-200 bg-purple-50/50 dark:bg-purple-950/10"
                    : isSowing
                      ? "border-green-200 bg-green-50/50 dark:bg-green-950/10"
                      : "border-orange-200 bg-orange-50/50 dark:bg-orange-950/10",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{crop.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{crop.crop}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isSowing && (
                          <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Sprout className="h-2.5 w-2.5" /> SOW NOW
                          </span>
                        )}
                        {isHarvest && (
                          <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> HARVEST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", WATER_COLOR[crop.waterNeed])}>
                    💧 {crop.waterNeed}
                  </span>
                </div>

                {/* Month bar */}
                <div className="grid grid-cols-12 gap-0.5 mb-3">
                  {MONTHS.map((m, i) => (
                    <div
                      key={m}
                      title={m}
                      className={cn(
                        "h-1.5 rounded-full",
                        crop.sowingMonths.includes(i)
                          ? "bg-green-500"
                          : crop.harvestMonths.includes(i)
                            ? "bg-orange-400"
                            : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Sowing</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" /> Harvest</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Clock className="h-3.5 w-3.5" /> Duration: <span className="font-medium text-foreground">{crop.duration}</span>
                </div>
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-1">
                  💡 {crop.tip}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 rounded-xl bg-muted/30 border border-border px-4 py-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Sowing months: {CROPS.find(c => filtered.includes(c))?.sowingMonths.map(m => MONTHS[m]).join(", ") || "—"}</span>
        <span>·</span>
        <span>Green bar = sowing window · Orange bar = harvest window</span>
      </div>
    </div>
  );
}
