import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden rounded-3xl px-4 py-8 text-center md:px-8 md:py-14">
      {/* Animated gradient background */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/90 via-secondary/80 to-accent/70" />
      <div className="absolute inset-0 rounded-3xl" style={{
        backgroundImage: "radial-gradient(ellipse 60% 60% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 70%)",
      }} />

      {/* Glow blobs */}
      <div className="hero-glow -top-20 -left-20 h-64 w-64 bg-white/10 animate-float" />
      <div className="hero-glow -bottom-20 -right-20 h-64 w-64 bg-white/10 animate-float-slow" />

      {/* Spinning accent ring */}
      <div className="absolute top-4 right-4 h-24 w-24 rounded-full border-2 border-white/20 animate-spin-slow" />
      <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full border-2 border-white/20 animate-spin-slow" style={{ animationDirection: "reverse" }} />

      <div className="relative z-10">
        <div className="animate-fade-in inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-semibold text-white mb-4">
          <Sparkles className="h-4 w-4 animate-pulse-dot" />
          Join the revolution
        </div>
        <h2 className="animate-fade-in-up delay-100 mx-auto max-w-[22ch] text-3xl font-extrabold tracking-tight text-white md:text-4xl drop-shadow">
          Ready to modernize your farming?
        </h2>
        <p className="animate-fade-in-up delay-200 mx-auto mt-4 max-w-[58ch] text-white/85 md:text-lg">
          Join thousands of farmers using AgriVerse to make data-driven
          decisions and increase their yields season after season.
        </p>
        <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="btn-press inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-base font-bold text-primary shadow-lg hover:bg-white/90 transition-all"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/#about"
            className="btn-press inline-flex items-center gap-2 rounded-md border-2 border-white/50 px-6 py-3 text-base font-semibold text-white hover:bg-white/15 transition-all backdrop-blur"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
