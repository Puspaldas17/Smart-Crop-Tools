import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          isDark ? "rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0 absolute"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
