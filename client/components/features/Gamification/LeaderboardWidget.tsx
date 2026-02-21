import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "@/context/GamificationContext";

const MOCK_FARMERS = [
  { rank: 1, name: "Ramesh Patel", xp: 2450 },
  { rank: 2, name: "Suresh Kumar", xp: 2100 },
  { rank: 3, name: "Anita Devi", xp: 1950 },
  { rank: 5, name: "Vikram Singh", xp: 1200 },
];

export function LeaderboardWidget() {
  const navigate = useNavigate();
  const { xp } = useGamification();

  // All entries including current user with real XP
  const allEntries = [
    ...MOCK_FARMERS.map((f) => ({ ...f, isCurrentUser: false })),
    { rank: 0, name: "You", xp, isCurrentUser: true },
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
    .slice(0, 5); // Show only top 5

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
        <div className="space-y-3">
          {allEntries.map((user) => (
            <div
              key={user.rank}
              className={cn(
                "flex items-center justify-between rounded-lg p-2.5 transition-colors",
                user.isCurrentUser
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
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
                    <Medal className="h-3.5 w-3.5" />
                  ) : (
                    <span>#{user.rank}</span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm font-medium leading-none",
                    user.isCurrentUser && "text-primary",
                  )}
                >
                  {user.name} {user.isCurrentUser && "(You)"}
                </p>
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                {user.xp} XP
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/leaderboard")}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-primary hover:underline"
        >
          View Full Leaderboard <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
