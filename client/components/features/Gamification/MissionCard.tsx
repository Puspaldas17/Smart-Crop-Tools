import React, { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Mission, useGamification } from "@/context/GamificationContext";
import { cn } from "@/lib/utils";

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const { completeMission } = useGamification();
  const [isAnimating, setIsAnimating] = useState(false);

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
          : "border-border bg-card hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-xl",
              mission.completed ? "bg-green-100" : "bg-primary/10",
            )}
          >
            {mission.icon || "📋"}
          </div>
          <div className="space-y-1">
            <h3
              className={cn(
                "font-semibold leading-none tracking-tight",
                mission.completed && "text-muted-foreground line-through",
              )}
            >
              {mission.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mission.description}
            </p>
          </div>
        </div>
        <button
          onClick={handleComplete}
          disabled={mission.completed}
          className={cn(
            "group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95",
            mission.completed
              ? "border-green-500 bg-green-500 text-white"
              : "border-muted-foreground/30 hover:border-primary hover:text-primary",
          )}
        >
          {mission.completed ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <Circle className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium",
            mission.completed ? "text-green-600" : "text-primary",
          )}
        >
          +{mission.xpReward} XP
        </span>
        {mission.completed && (
          <span className="text-xs font-medium text-green-600">Completed!</span>
        )}
      </div>

      {/* Animation effect overlay */}
      {isAnimating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
          <div className="scale-150 text-4xl animate-bounce">
            🎉 +{mission.xpReward} XP
          </div>
        </div>
      )}
    </div>
  );
}
