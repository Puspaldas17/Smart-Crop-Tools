import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AgriculturalBackground() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none w-full h-full">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMAX slice"
      >
        <defs>
          <linearGradient id="skyDay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#E0F7FA" />
          </linearGradient>
          <linearGradient id="skyNight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#14532D" : "#4ADE80"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isDark ? "#064E3B" : "#22C55E"} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="100%" height="100%" fill={`url(#${isDark ? 'skyNight' : 'skyDay'})`} />

        {/* Sun / Moon */}
        <circle
          cx="85%"
          cy="15%"
          r="40"
          fill={isDark ? "#E2E8F0" : "#FDB813"}
          opacity={isDark ? "0.8" : "1"}
          filter={isDark ? "url(#glow)" : ""}
        />

        {/* Far Hills */}
        <path
          d="M0,600 C300,550 600,650 900,600 C1200,550 1440,620 1440,620 V800 H0 Z"
          fill={isDark ? "#064E3B" : "#86EFAC"}
          opacity="0.6"
        />

        {/* Mid Hills */}
        <path
          d="M0,650 C400,600 800,700 1200,650 C1440,620 1440,800 1440,800 H0 Z"
          fill={isDark ? "#14532D" : "#4ADE80"}
          opacity="0.8"
        />

        {/* Foreground Field with Crop Rows */}
        <path
          d="M0,700 Q720,650 1440,700 V800 H0 Z"
          fill="url(#fieldGradient)"
        />

        {/* Farmer Silhouette */}
        <g transform="translate(100, 680) scale(0.6)">
           <path 
             d="M30 0 A 10 10 0 1 0 30 20 A 10 10 0 1 0 30 0 Z M25 20 L 35 20 L 40 40 L 50 35 L 55 45 L 35 55 L 35 90 L 45 130 L 35 135 L 25 90 L 15 135 L 5 130 L 15 90 L 15 55 L -5 45 L 0 35 L 10 40 L 15 20 Z" 
             fill={isDark ? "#022C22" : "#14532D"} 
           />
           {/* Simple Hat */}
           <path d="M15 5 L 45 5 L 50 10 L 10 10 Z" fill={isDark ? "#022C22" : "#14532D"} />
           {/* Tool (Hoe) */}
           <rect x="50" y="30" width="5" height="100" transform="rotate(15 50 30)" fill={isDark ? "#3f2e18" : "#5D4037"} />
           <rect x="40" y="120" width="30" height="10" transform="rotate(15 50 30)" fill="gray" />
        </g>
        
        {/* Simple Crop Suggestion (repeated) */}
         <g transform="translate(400, 720) scale(0.5)" opacity="0.7">
             <path d="M0 50 Q10 10 20 50 M10 50 V0" stroke={isDark ? "#064E3B" : "#166534"} strokeWidth="4" fill="none" />
          </g>
          <g transform="translate(450, 730) scale(0.6)" opacity="0.8">
             <path d="M0 50 Q10 10 20 50 M10 50 V0" stroke={isDark ? "#064E3B" : "#166534"} strokeWidth="4" fill="none" />
          </g>
          <g transform="translate(500, 725) scale(0.55)" opacity="0.75">
             <path d="M0 50 Q10 10 20 50 M10 50 V0" stroke={isDark ? "#064E3B" : "#166534"} strokeWidth="4" fill="none" />
          </g>

      </svg>
    </div>
  );
}
