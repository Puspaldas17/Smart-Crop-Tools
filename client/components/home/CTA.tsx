import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="rounded-3xl bg-secondary px-4 py-12 text-center md:px-8 md:py-16 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10">
        <h2 className="mx-auto max-w-[20ch] text-3xl font-bold tracking-tight text-secondary-foreground md:text-4xl">
          Ready to modernize your farming?
        </h2>
        <p className="mx-auto mt-4 max-w-[60ch] text-secondary-foreground/80 md:text-lg">
          Join thousands of farmers using AgriVerse to make data-driven
          decisions and increase yields.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow hover:brightness-110"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/#about"
            className="inline-flex items-center gap-2 rounded-md bg-background/50 px-6 py-3 text-base font-semibold text-foreground hover:bg-background/80 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
