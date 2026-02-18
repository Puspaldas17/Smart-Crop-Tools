import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  icon?: string; // Emoji or icon name
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
}

interface GamificationContextType extends GamificationState {
  completeMission: (id: string) => void;
  addXP: (amount: number) => void;
}

// Initial Mock Data
const INITIAL_MISSIONS: Mission[] = [
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
];

const INITIAL_BADGES: Badge[] = [
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
    description: "Checked market prices 10 times.",
    unlocked: false,
  },
];

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined,
);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load from localStorage or default
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem("agriverse_xp");
    return saved ? parseInt(saved) : 0;
  });
  
  const [missions, setMissions] = useState<Mission[]>(() => {
     // Always reset daily missions for demo purposes, or load from local storage if persists
     const saved = localStorage.getItem("agriverse_missions");
     return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
      const saved = localStorage.getItem("agriverse_badges");
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [streak] = useState<number>(3); // Mock streak

  // Level calculation: Level 1 = 0-99 XP, Level 2 = 100-299 XP, etc.
  const level = Math.floor(xp / 100) + 1;

  useEffect(() => {
    localStorage.setItem("agriverse_xp", xp.toString());
    localStorage.setItem("agriverse_missions", JSON.stringify(missions));
    localStorage.setItem("agriverse_badges", JSON.stringify(badges));
  }, [xp, missions, badges]);

  const addXP = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const completeMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id && !m.completed) {
          addXP(m.xpReward);
          return { ...m, completed: true };
        }
        return m;
      }),
    );
    
    // Simple badge unlock logic (Demo)
    if (xp > 100) {
        setBadges(prev => prev.map(b => b.id === 'b1' ? {...b, unlocked: true} : b));
    }
  };

  return (
    <GamificationContext.Provider
      value={{ xp, level, streak, missions, badges, completeMission, addXP }}
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
