import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Mission, useGamification } from "@/context/GamificationContext";
import { cn } from "@/lib/utils";

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const { completeMission, nextResetHours } = useGamification();
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useTranslation();

  const handleComplete = () => {
    if (mission.completed) return;
    setIsAnimating(true);
    setTimeout(() => {
      completeMission(mission.id);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
        mission.completed
          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/20"
          : "border-border bg-card hover:shadow-md cursor-pointer",
      )}
      onClick={!mission.completed ? handleComplete : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-xl shrink-0",
              mission.completed ? "bg-green-100" : "bg-primary/10",
            )}
          >
            {mission.icon || "📋"}
          </div>
          <div className="space-y-1">
            <h3
              className={cn(
                "font-semibold leading-none tracking-tight text-sm",
                mission.completed && "text-muted-foreground line-through",
              )}
            >
              {t(mission.title)}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t(mission.description)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleComplete(); }}
          disabled={mission.completed}
          className={cn(
            "group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95",
            mission.completed
              ? "border-green-500 bg-green-500 text-white"
              : "border-muted-foreground/30 hover:border-primary hover:text-primary",
          )}
        >
          {mission.completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            mission.completed
              ? "bg-green-100 text-green-700"
              : "bg-primary/10 text-primary",
          )}
        >
          +{mission.xpReward} XP
        </span>
        {mission.completed ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {t("missions.completed")}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {t("missions.resets_in", { hours: nextResetHours })}
          </span>
        )}
      </div>

      {/* Animation effect overlay */}
      {isAnimating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl">
          <div className="scale-150 text-4xl animate-bounce">
            🎉 +{mission.xpReward} XP
          </div>
        </div>
      )}
    </div>
  );
}
