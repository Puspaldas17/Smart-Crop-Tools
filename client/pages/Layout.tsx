import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

function useScrollTop(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > offset));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [offset]);
  return scrolled;
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { NotificationBell } from "@/components/features/NotificationCenter";

// ── Dark / Light mode toggle ─────────────────────────────────────────────────
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Avoid hydration mismatch — only render the icon after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;
  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark
        ? <Sun  className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0" />
        : <Moon className="h-4 w-4 transition-transform duration-200 rotate-0" />}
    </button>
  );
}

function HeaderAuth() {
  const { farmer, logout } = useAuth();
  const { t } = useTranslation();

  return farmer ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {farmer.name?.charAt(0)?.toUpperCase() || "F"}
          </span>
          <span className="max-w-[7rem] sm:max-w-[10rem] truncate">{farmer.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/profile">{t('nav.profile')}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>{t('nav.logout')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
      >
        {t('btn.farmer_login')}
      </Link>
      <Link
        to="/login"
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:brightness-95"
      >
        {t('btn.get_started')}
      </Link>
    </div>
  );
}


export default function RootLayout() {
  const scrolled = useScrollTop(10);
  const { farmer } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      {/* Premium noise texture layer */}
      <div className="noise-overlay" aria-hidden />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow"
      >
        Skip to content
      </a>
      <header
        className={
          "sticky top-0 z-40 w-full border-b transition-all duration-300 " +
          (scrolled
            ? "border-border/50 bg-background/85 backdrop-blur-md shadow-[0_2px_20px_hsl(var(--primary)/0.08)]"
            : "border-transparent bg-background/40 backdrop-blur-sm")
        }
      >
        <div className="container max-w-[1400px] px-4 md:px-8 flex items-center justify-between py-3 md:py-5">
          <Link to="/" className="flex items-center gap-2 font-semibold group">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#ff8a00] to-[#2ea043] text-white font-bold animate-float shadow-lg group-hover:shadow-[0_0_16px_hsl(120_39%_40%/0.5)] transition-shadow duration-300">
              SC
            </span>
            <span className="text-lg font-bold tracking-tight gradient-text">{t('app.title')}</span>
          </Link>
          <nav className="hidden gap-1 md:flex items-center">
            {farmer ? (
              <>
                <a href="/#tools" className="px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground nav-link transition-colors rounded-md hover:bg-muted">
                  {t('nav.tools')}
                </a>
                {!farmer.isGuest && (
                  <>
                    <Link to="/dashboard" className="px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground nav-link transition-colors rounded-md hover:bg-muted">
                      {t('nav.dashboard')}
                    </Link>
                    <Link to="/leaderboard" className="px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground nav-link transition-colors rounded-md hover:bg-muted">
                      🏆 Leaderboard
                    </Link>
                    <Link to="/marketplace" className="px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground nav-link transition-colors rounded-md hover:bg-muted">
                      🛒 Marketplace
                    </Link>
                    <Link to="/calendar" className="px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground nav-link transition-colors rounded-md hover:bg-muted">
                      📅 Calendar
                    </Link>
                  </>
                )}
              </>
            ) : (
              <a href="/#about" className="px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground nav-link transition-colors rounded-md hover:bg-muted">
                {t('nav.about')}
              </a>
            )}
          </nav>
          <div className="flex items-center gap-3">
             <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-4/5 sm:max-w-sm">
                  <nav className="mt-8 grid gap-1">
                    {[
                      ...(farmer ? [{ href: "/#tools", label: t('nav.tools') }] : []),
                      ...(farmer && !farmer.isGuest
                        ? [
                            { href: "/dashboard", label: t('nav.dashboard') },
                            { href: "/leaderboard", label: "🏆 Leaderboard" },
                            { href: "/marketplace", label: "🛒 Marketplace" },
                            { href: "/calendar", label: "📅 Crop Calendar" },
                          ]
                        : []),
                      { href: "/#about", label: t('nav.about') },
                      {
                        href: farmer ? "/profile" : "/login",
                        label: farmer ? t('nav.profile') : t('nav.login'),
                      },
                    ].map((i) => {
                      const isActive = location.pathname === i.href;
                      return (
                        <Link
                          key={i.href}
                          to={i.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary border-l-2 border-primary pl-3"
                              : "text-foreground/80 hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {i.label}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <HeaderAuth />
          </div>
        </div>
      </header>
      <main
        id="content"
        className="container max-w-[1400px] px-4 md:px-8 py-5 md:py-8 animate-fade-in"
      >
        <Outlet />
      </main>
      <footer className="border-t border-border/60 bg-background/60 py-5">
        <div className="container max-w-[1400px] px-4 md:px-8 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AgriVerse
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/#research"
              className="text-muted-foreground hover:text-foreground"
            >
              References
            </a>
            <a href="/#impact" className="text-muted-foreground hover:text-foreground">
              Benefits
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
