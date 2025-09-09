import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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

function HeaderAuth() {
  const { farmer, logout } = useAuth();
  return farmer ? (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-slate-600 md:inline">Farmer:</span>
      <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-800">
        {farmer.name}
      </span>
      <a
        href="#tools"
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:brightness-95"
      >
        Open Tools
      </a>
      <button
        onClick={logout}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        Farmer Login
      </Link>
      <Link
        to="/login"
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:brightness-95"
      >
        Get Started
      </Link>
    </div>
  );
}

export default function RootLayout() {
  const scrolled = useScrollTop(10);
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
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#ff8a00] to-[#2ea043] text-white font-bold">
              SC
            </span>
            <span className="text-lg">Smart Crop Advisory</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {[
              { href: "/#tools", label: "Tools" },
              { href: "/#about", label: "About" },
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
            <HeaderAuth />
          </div>
        </div>
      </header>
      <main id="content" className="container py-10 md:py-14">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/60 bg-white/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Smart Crop Advisory
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a href="#research" className="text-slate-600 hover:text-slate-900">
              References
            </a>
            <a href="#impact" className="text-slate-600 hover:text-slate-900">
              Benefits
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
