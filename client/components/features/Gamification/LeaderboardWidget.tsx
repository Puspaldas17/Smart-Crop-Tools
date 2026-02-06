import React from "react";
import { Trophy, Medal, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
}

// Mock Data
const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "Ramesh Farmer", xp: 2450 },
  { rank: 2, name: "Suresh P.", xp: 2100 },
  { rank: 3, name: "Anita Devi", xp: 1950 },
  { rank: 4, name: "You", xp: 1500, isCurrentUser: true }, // Dynamic later
  { rank: 5, name: "Vikram S.", xp: 1200 },
];

export function LeaderboardWidget() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6 pb-4">
        <h3 className="flex items-center gap-2 font-semibold tracking-tight">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Village Leaderboard
        </h3>
        <p className="text-sm text-muted-foreground">
          Top farmers in your area this week.
        </p>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-4">
          {MOCK_LEADERBOARD.map((user) => (
            <div
              key={user.rank}
              className={cn(
                "flex items-center justify-between rounded-lg p-3 transition-colors",
                user.isCurrentUser
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    user.rank === 1
                      ? "bg-yellow-100 text-yellow-700"
                      : user.rank === 2
                        ? "bg-gray-100 text-gray-700"
                        : user.rank === 3
                          ? "bg-orange-100 text-orange-800"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  {user.rank <= 3 ? (
                    <Medal className="h-4 w-4" />
                  ) : (
                    <span>#{user.rank}</span>
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium leading-none",
                      user.isCurrentUser && "text-primary",
                    )}
                  >
                    {user.name} {user.isCurrentUser && "(You)"}
                  </p>
                </div>
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                {user.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
