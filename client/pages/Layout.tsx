import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

function useScrollTop(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslation } from "react-i18next";

function HeaderAuth() {
  const { farmer, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return farmer ? (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 dark:bg-black/20 px-3 py-1.5 text-sm hover:bg-white/20 hover:text-accent-foreground backdrop-blur-md transition-all">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xs font-semibold text-white shadow-neo">
              {farmer.name?.charAt(0)?.toUpperCase() || "F"}
            </span>
            <span className="max-w-[8rem] truncate font-medium">{farmer.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-panel border-white/20">
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">{t('nav.profile')}</Link>
          </DropdownMenuItem>
          {farmer.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer">Admin Panel</Link>
            </DropdownMenuItem>
          )}
          {farmer.role === "vet" && (
            <DropdownMenuItem asChild>
              <Link to="/vet" className="cursor-pointer">Vet Panel</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }} className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-500/10">
            {t('nav.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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
  const location = useLocation();

  const getNavLinks = () => {
    const isAdmin = farmer?.role === "admin";
    
    return [
      ...(farmer && !farmer.isGuest && !isAdmin ? [{ href: "/dashboard", label: t('nav.dashboard'), isRoute: true }] : []),
      ...(farmer && !isAdmin ? [{ href: "/tools", label: t('nav.tools'), isRoute: true }] : []),
      ...(farmer && !isAdmin ? [{ href: "/marketplace", label: t('market.title') || "Marketplace", isRoute: true }] : []),
      ...(!isAdmin ? [{ href: "/about", label: t('nav.about'), isRoute: true }] : []),
    ];
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow"
      >
        Skip to content
      </a>
      <header
        className={
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1200px] rounded-full border border-white/20 transition-all duration-300 " +
          (scrolled ? "bg-background/80 shadow-neo backdrop-blur-xl py-3" : "glass-panel py-4")
        }
      >
        <div className="px-6 md:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-white font-bold shadow-neo">
              SC
            </span>
            <span className="text-xl tracking-tight hidden sm:block">{t('app.title')}</span>
          </Link>
          <nav className="hidden gap-2 md:flex bg-white/10 dark:bg-black/20 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {getNavLinks().map((i) => {
              const isActive = i.isRoute && location.pathname.startsWith(i.href);
              return i.isRoute ? (
                <Link
                  key={i.href}
                  to={i.href}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-neo' : 'text-foreground/80 hover:text-primary hover:bg-white/5'}`}
                >
                  {i.label}
                </Link>
              ) : (
                <a
                  key={i.href}
                  href={i.href}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground/80 hover:text-primary hover:bg-white/5 transition-all duration-300"
                >
                  {i.label}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
             <LanguageSwitcher />
            <ModeToggle />
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full bg-white/20 border-white/20 backdrop-blur-md" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-4/5 sm:max-w-sm glass-panel border-l border-white/10">
                  <nav className="mt-8 grid gap-4">
                    {getNavLinks().map((i) => (
                      i.isRoute ? (
                        <Link
                          key={i.href}
                          to={i.href}
                          className={`text-lg font-medium transition-colors ${location.pathname.startsWith(i.href) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                        >
                          {i.label}
                        </Link>
                      ) : (
                        <a
                          key={i.href}
                          href={i.href}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {i.label}
                        </a>
                      )
                    ))}
                    {!farmer && (
                       <Link
                         to="/login"
                         className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                       >
                         {t('nav.login')}
                       </Link>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <HeaderAuth />
          </div>
        </div>
      </header>
      <div className="h-24"></div> {/* Spacer for fixed header */}
      <main
        id="content"
        className="container max-w-[1400px] px-4 md:px-8 py-8 md:py-16"
      >
        <Outlet />
      </main>
      <footer className="border-t border-border/60 bg-background/60 py-12">
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
