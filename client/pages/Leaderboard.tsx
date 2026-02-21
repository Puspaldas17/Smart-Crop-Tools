import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Crown, Star, ArrowLeft, TrendingUp } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  badge: string;
  isCurrentUser?: boolean;
}

type FilterType = "week" | "month" | "alltime";

const MOCK_FARMERS: Omit<LeaderboardEntry, "rank">[] = [
  { name: "Ramesh Patel", xp: 2450, level: 25, badge: "🥇" },
  { name: "Suresh Kumar", xp: 2100, level: 22, badge: "🥈" },
  { name: "Anita Devi", xp: 1950, level: 20, badge: "🥉" },
  { name: "Vikram Singh", xp: 1200, level: 13, badge: "🌾" },
  { name: "Priya Sharma", xp: 980, level: 10, badge: "🌱" },
  { name: "Mohan Das", xp: 840, level: 9, badge: "🌱" },
  { name: "Geeta Bai", xp: 720, level: 8, badge: "🌱" },
];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { xp, level } = useGamification();
  const [filter, setFilter] = useState<FilterType>("week");

  // Build leaderboard with real user XP and auto-compute rank
  const buildLeaderboard = (): LeaderboardEntry[] => {
    const multiplier = filter === "week" ? 1 : filter === "month" ? 1.3 : 1.6;
    const allEntries = [
      ...MOCK_FARMERS.map((f) => ({
        ...f,
        xp: Math.floor(f.xp * multiplier),
        level: f.level,
      })),
      { name: "You", xp, level, badge: "⭐", isCurrentUser: true },
    ];

    return allEntries
      .sort((a, b) => b.xp - a.xp)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  };

  const leaderboard = buildLeaderboard();
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]]; // Silver, Gold, Bronze order for podium

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "from-green-500 to-green-700";
  };

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return "h-28";
    if (rank === 2) return "h-20";
    return "h-16";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">Top farmers in your region</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 bg-muted/40 p-1 rounded-lg w-fit">
        {(["week", "month", "alltime"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              filter === f
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "week" ? "This Week" : f === "month" ? "This Month" : "All Time"}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/30 p-6 mb-6">
        <div className="flex items-end justify-center gap-4">
          {podiumOrder.map((entry, i) => {
            if (!entry) return null;
            return (
              <div key={entry.rank} className="flex flex-col items-center gap-2">
                {/* Avatar */}
                <div
                  className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg border-4",
                    entry.rank === 1
                      ? "border-yellow-400 bg-yellow-50"
                      : entry.rank === 2
                        ? "border-gray-300 bg-gray-50"
                        : "border-orange-400 bg-orange-50",
                    entry.isCurrentUser && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  {entry.badge}
                  {entry.rank === 1 && (
                    <Crown className="absolute -top-3 h-5 w-5 text-yellow-500 fill-yellow-400" />
                  )}
                </div>
                <p className={cn("text-xs font-semibold text-center max-w-[70px] truncate", entry.isCurrentUser && "text-primary")}>
                  {entry.name}
                </p>
                <span className="text-xs text-muted-foreground">{entry.xp} XP</span>
                {/* Podium block */}
                <div
                  className={cn(
                    "w-20 rounded-t-lg flex items-center justify-center bg-gradient-to-b text-white font-bold text-lg shadow-md",
                    getPodiumHeight(entry.rank),
                    getRankColor(entry.rank),
                  )}
                >
                  #{entry.rank}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rest of Leaderboard */}
      <div className="space-y-2">
        {rest.map((entry) => (
          <div
            key={entry.rank}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 transition-all",
              entry.isCurrentUser
                ? "border-primary/30 bg-primary/5 shadow-sm"
                : "border-border bg-card hover:bg-muted/30",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  entry.isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                #{entry.rank}
              </span>
              <span className="text-xl">{entry.badge}</span>
              <div>
                <p className={cn("text-sm font-medium", entry.isCurrentUser && "text-primary")}>
                  {entry.name} {entry.isCurrentUser && "(You)"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" /> Level {entry.level}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold">{entry.xp} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
