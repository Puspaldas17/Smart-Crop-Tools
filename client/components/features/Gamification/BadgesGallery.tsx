import React from "react";
import { Lock } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function BadgesGallery() {
  const { badges } = useGamification();

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6 pb-4">
        <h3 className="flex items-center gap-2 font-semibold tracking-tight">
          🏅 Achievements
        </h3>
      </div>
      <div className="p-6 pt-0">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-4">
          {badges.map((badge) => (
            <HoverCard key={badge.id}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-105",
                    badge.unlocked
                      ? "border-primary/20 bg-primary/5"
                      : "border-muted bg-muted/40 opacity-70 grayscale",
                  )}
                >
                  <span className="text-2xl sm:text-3xl">{badge.icon}</span>
                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-[1px]">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h4 className="font-semibold leading-none">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {badge.unlocked ? "Unlocked!" : "Locked"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {badge.description}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  );
}
