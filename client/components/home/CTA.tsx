import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function CTA() {
  const { farmer } = useAuth();
  const href = farmer ? "/#tools" : "/login";
  const label = farmer ? "Open Tools" : "Get Started";
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 p-8 text-white">
      <div className="absolute -inset-12 opacity-20 [background:radial-gradient(circle_at_center,white_0,transparent_60%)]" />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Ready to try Smart Crop Advisory?</h3>
          <p className="mt-1 text-white/90">Personalized guidance, market prices and weather alerts at your fingertips.</p>
        </div>
        <a
          href={href}
          className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow hover:bg-white/90"
        >
          {label}
        </a>
      </div>
    </section>
  );
}
