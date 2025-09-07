import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#ff8a00] to-[#2ea043] text-white font-bold">SC</span>
            <span className="text-lg">Smart Crop Advisory</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {[
              { href: "/#solution", label: "Solution" },
              { href: "/#tech", label: "Technical" },
              { href: "/#feasibility", label: "Feasibility" },
              { href: "/#impact", label: "Impact" },
              { href: "/#research", label: "Research" },
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
          <div className="flex items-center gap-2">
            <a
              href="#solution"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:brightness-95"
            >
              Explore
            </a>
          </div>
        </div>
      </header>
      <main id="content" className="container py-10 md:py-14">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/60 bg-white/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} The Compilers — Smart India Hackathon 2025
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a href="#research" className="text-slate-600 hover:text-slate-900">References</a>
            <a href="#impact" className="text-slate-600 hover:text-slate-900">Benefits</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
