import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
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
import { useTranslation } from "react-i18next";

function HeaderAuth() {
  const { farmer, logout } = useAuth();
  const { t } = useTranslation();
  
  return farmer ? (
    <div className="flex items-center gap-2">
      <a
        href="/#tools"
        className="hidden rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:brightness-95 md:inline"
      >
        {t('nav.tools')}
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              {farmer.name?.charAt(0)?.toUpperCase() || "F"}
            </span>
            <span className="max-w-[10rem] truncate">{farmer.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href="/#tools">{t('nav.tools')}</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard">{t('nav.dashboard')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile">{t('nav.profile')}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>{t('nav.logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow"
      >
        Skip to content
      </a>
      <header
        className={
          "sticky top-0 z-40 w-full border-b border-slate-200/60 backdrop-blur " +
          (scrolled ? "bg-white/80 shadow-sm" : "bg-white/60")
        }
      >
        <div className="container max-w-[1400px] px-4 md:px-8 flex items-center justify-between py-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#ff8a00] to-[#2ea043] text-white font-bold">
              SC
            </span>
            <span className="text-lg">{t('app.title')}</span>
          </Link>
          <nav className="hidden gap-4 md:flex">
            {[
              ...(farmer ? [{ href: "/#tools", label: t('nav.tools') }] : []),
              { href: "/#about", label: t('nav.about') },
            ].map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {i.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
             <LanguageSwitcher />
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-4/5 sm:max-w-sm">
                  <nav className="mt-8 grid gap-4">
                    {[
                      ...(farmer ? [{ href: "/#tools", label: t('nav.tools') }] : []),
                      ...(farmer && !farmer.isGuest
                        ? [{ href: "/dashboard", label: t('nav.dashboard') }]
                        : []),
                      { href: "/#about", label: t('nav.about') },
                      {
                        href: farmer ? "/profile" : "/login",
                        label: farmer ? t('nav.profile') : t('nav.login'),
                      },
                    ].map((i) => (
                      <a
                        key={i.href}
                        href={i.href}
                        className="text-base font-medium text-slate-800"
                      >
                        {i.label}
                      </a>
                    ))}
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
        className="container max-w-[1400px] px-4 md:px-8 py-8 md:py-16"
      >
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/60 bg-white/60 py-12">
        <div className="container max-w-[1400px] px-4 md:px-8 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Smart Crop Advisory
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/#research"
              className="text-slate-600 hover:text-slate-900"
            >
              References
            </a>
            <a href="/#impact" className="text-slate-600 hover:text-slate-900">
              Benefits
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
