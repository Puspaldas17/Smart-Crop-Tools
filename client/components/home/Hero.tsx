import { ArrowRight, Sprout, CloudSun, Bot, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-secondary/10 px-4 md:px-8 py-12 md:py-24 min-h-[50vh] lg:min-h-[75vh] border border-white/20 shadow-neo">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-[2.5rem]">
        <div className="absolute -top-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-[100px] mix-blend-multiply opacity-70 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-[100px] mix-blend-multiply opacity-70" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-secondary/20 blur-[120px] opacity-50 pointer-events-none" />
      </div>

      <div className="relative z-10 grid items-center gap-12 grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto h-full">
        {/* Left Content */}
        <div className="mx-auto max-w-[min(70vw,600px)] text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/40 dark:bg-black/40 px-4 py-1.5 text-xs font-bold text-primary shadow-glass backdrop-blur-md mb-6 animate-fade-in-up">
            <Sprout className="h-4 w-4" />
            <span>SIH26131: Early Disease & Pest Management</span>
          </div>
          
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-foreground md:text-7xl drop-shadow-sm animate-fade-in-up delay-100">
            Early <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent to-primary">Detection</span>,
            <br className="hidden lg:block" /> Smarter <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">Protection</span>
          </h1>
          
          <p className="mt-6 mx-auto lg:mx-0 max-w-[55ch] text-muted-foreground md:text-xl leading-relaxed font-medium animate-fade-in-up delay-200">
            Empowering every harvest with precision data. Scan leaves for instant disease diagnosis, get 14-day predictive pest alerts, and access smart crop advisory—all in your local language.
          </p>
          
          <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-300">
            <Link
              to="/login"
              className="neo-button inline-flex items-center gap-2 bg-gradient-to-br from-accent to-primary px-8 py-4 text-base font-bold text-white transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 dark:bg-black/20 px-8 py-4 text-base font-bold text-foreground hover:bg-white/40 dark:hover:bg-black/40 backdrop-blur-md transition-all hover:shadow-neo"
            >
              How it works
            </a>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-semibold text-muted-foreground animate-fade-in-up delay-400">
            <span className="inline-flex items-center gap-2 bg-white/10 dark:bg-black/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <CloudSun className="h-4 w-4 text-primary" /> Weather Aware
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 dark:bg-black/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <Bot className="h-4 w-4 text-primary" /> Voice & Chat AI
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 dark:bg-black/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <Activity className="h-4 w-4 text-primary" /> Real-time Data
            </span>
          </div>
        </div>

        {/* Right Content - Hero Image with floating elements */}
        <div className="order-first lg:order-none relative h-full min-h-[400px] flex items-center justify-center animate-fade-in-up delay-200">
          <div className="relative w-full max-w-lg aspect-square lg:aspect-auto lg:h-[80%] rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/20 animate-float-slow group">
            <img 
              src="/images/hero_bg.jpg" 
              alt="Futuristic Smart Farm" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
          
          {/* Floating Accents Over Image */}
          <div className="absolute top-10 right-0 lg:-right-4 glass-panel p-3 rounded-2xl flex items-center gap-3 animate-float-slow shadow-xl z-30" style={{ animationDelay: '1s' }}>
            <div className="bg-green-500/90 p-2 rounded-full text-white shadow-lg animate-pulse-glow">
               <Bot className="w-5 h-5" />
            </div>
            <div>
               <div className="text-xs font-bold text-foreground">AI Assistant</div>
               <div className="text-[10px] text-muted-foreground font-semibold">Active & Monitoring</div>
            </div>
          </div>

          <div className="absolute bottom-10 -left-6 lg:-left-10 glass-panel p-3 rounded-2xl flex items-center gap-3 animate-float-slow shadow-xl z-30 border-white/40" style={{ animationDelay: '2s' }}>
            <div className="bg-blue-500/90 p-2 rounded-full text-white shadow-lg">
               <Activity className="w-5 h-5" />
            </div>
            <div>
               <div className="text-xs font-bold text-foreground">Soil Health</div>
               <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">98% Optimal</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
