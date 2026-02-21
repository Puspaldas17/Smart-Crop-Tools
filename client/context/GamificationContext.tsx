import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  icon?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  missions: Mission[];
  badges: Badge[];
  nextResetHours: number;
}

interface GamificationContextType extends GamificationState {
  completeMission: (id: string) => void;
  addXP: (amount: number) => void;
}

// 8 Daily Missions
const BASE_MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "missions.m1.title",
    description: "missions.m1.desc",
    xpReward: 50,
    completed: false,
    icon: "📸",
  },
  {
    id: "m2",
    title: "missions.m2.title",
    description: "missions.m2.desc",
    xpReward: 20,
    completed: false,
    icon: "💰",
  },
  {
    id: "m3",
    title: "missions.m3.title",
    description: "missions.m3.desc",
    xpReward: 30,
    completed: false,
    icon: "🌦️",
  },
  {
    id: "m4",
    title: "missions.m4.title",
    description: "missions.m4.desc",
    xpReward: 40,
    completed: false,
    icon: "🤖",
  },
  {
    id: "m5",
    title: "missions.m5.title",
    description: "missions.m5.desc",
    xpReward: 25,
    completed: false,
    icon: "🌱",
  },
  {
    id: "m6",
    title: "missions.m6.title",
    description: "missions.m6.desc",
    xpReward: 35,
    completed: false,
    icon: "🐄",
  },
  {
    id: "m7",
    title: "missions.m7.title",
    description: "missions.m7.desc",
    xpReward: 15,
    completed: false,
    icon: "📊",
  },
  {
    id: "m8",
    title: "missions.m8.title",
    description: "missions.m8.desc",
    xpReward: 60,
    completed: false,
    icon: "🏆",
  },
];

const BASE_BADGES: Badge[] = [
  {
    id: "b1",
    name: "Green Thumb",
    icon: "🌱",
    description: "Completed your first 5 missions!",
    unlocked: false,
  },
  {
    id: "b2",
    name: "Weather Watcher",
    icon: "🌪️",
    description: "Checked weather for 7 days in a row.",
    unlocked: false,
  },
  {
    id: "b3",
    name: "Market Guru",
    icon: "💰",
    description: "Checked market prices consistently.",
    unlocked: false,
  },
  {
    id: "b4",
    name: "Mission Master",
    icon: "🎯",
    description: "Completed all daily missions in a single day!",
    unlocked: false,
  },
  {
    id: "b5",
    name: "AI Pioneer",
    icon: "🤖",
    description: "Used the AI Chatbot assistant 5 times.",
    unlocked: false,
  },
  {
    id: "b6",
    name: "XP Legend",
    icon: "⭐",
    description: "Earned over 500 XP total.",
    unlocked: false,
  },
];

// Calculates hours until midnight (next reset)
function getHoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined,
);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem("agriverse_xp");
    return saved ? parseInt(saved) : 0;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const savedDate = localStorage.getItem("agriverse_mission_date");
    const today = new Date().toDateString();
    // Auto-reset if it's a new day
    if (savedDate !== today) {
      localStorage.setItem("agriverse_mission_date", today);
      localStorage.removeItem("agriverse_missions");
      return BASE_MISSIONS;
    }
    const saved = localStorage.getItem("agriverse_missions");
    return saved ? JSON.parse(saved) : BASE_MISSIONS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem("agriverse_badges");
    return saved ? JSON.parse(saved) : BASE_BADGES;
  });

  const [streak] = useState<number>(() => {
    const saved = localStorage.getItem("agriverse_streak");
    return saved ? parseInt(saved) : 3;
  });

  const level = Math.floor(xp / 100) + 1;
  const nextResetHours = getHoursUntilMidnight();

  useEffect(() => {
    localStorage.setItem("agriverse_xp", xp.toString());
    localStorage.setItem("agriverse_missions", JSON.stringify(missions));
    localStorage.setItem("agriverse_badges", JSON.stringify(badges));
  }, [xp, missions, badges]);

  const addXP = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const completeMission = (id: string) => {
    let earnedXp = 0;
    let updatedMissions: Mission[] = [];

    setMissions((prev) => {
      updatedMissions = prev.map((m) => {
        if (m.id === id && !m.completed) {
          earnedXp = m.xpReward;
          return { ...m, completed: true };
        }
        return m;
      });
      return updatedMissions;
    });

    if (earnedXp > 0) {
      setXp((prev) => {
        const newXp = prev + earnedXp;

        // Update badges based on new XP (using newXp, not stale xp)
        setBadges((prevBadges) =>
          prevBadges.map((b) => {
            if (b.id === "b6" && newXp >= 500) return { ...b, unlocked: true };
            return b;
          }),
        );

        return newXp;
      });
    }

    // Check mission-based badges after state flush
    setTimeout(() => {
      setMissions((prev) => {
        const completedCount = prev.filter((m) => m.completed).length;
        setBadges((prevBadges) =>
          prevBadges.map((b) => {
            if (b.id === "b1" && completedCount >= 5)
              return { ...b, unlocked: true };
            if (b.id === "b4" && completedCount === BASE_MISSIONS.length)
              return { ...b, unlocked: true };
            return b;
          }),
        );
        return prev;
      });
    }, 100);
  };

  return (
    <GamificationContext.Provider
      value={{
        xp,
        level,
        streak,
        missions,
        badges,
        completeMission,
        addXP,
        nextResetHours,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error(
      "useGamification must be used within a GamificationProvider",
    );
  }
  return context;
};
