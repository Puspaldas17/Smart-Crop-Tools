import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary to-accent p-[2px] shadow-2xl">
        {/* Inner Glass Layer */}
        <div className="relative h-full w-full rounded-[2.9rem] bg-black/40 backdrop-blur-3xl px-6 py-20 text-center md:px-12 md:py-32 overflow-hidden">
          
          {/* Decorative patterns */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-overlay opacity-30">
            <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-black rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md mb-8">
              <Sparkles className="h-4 w-4 text-accent" />
              Join the revolution
            </div>
            
            <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl mb-6 drop-shadow-sm">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">modernize</span> your farming?
            </h2>
            
            <p className="mx-auto max-w-[50ch] text-white/80 md:text-xl font-medium mb-12">
              Join thousands of farmers using AgriVerse to make data-driven
              decisions and increase yields effortlessly.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/login"
                className="neo-button inline-flex items-center gap-2 bg-white text-primary px-8 py-4 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
