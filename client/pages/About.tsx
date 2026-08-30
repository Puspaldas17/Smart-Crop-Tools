import {
  CheckCircle2,
  Sprout,
  Mic,
  CloudSun,
  Brain,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function About() {
  const { farmer } = useAuth();
  
  return (
    <div className="space-y-8 md:space-y-16">
      {/* About / User Manual */}
      <section id="about" className="mb-24 mt-8">
        <div className="max-w-5xl mx-auto px-4 md:px-0">
          <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-white/20 mb-6">
              <Sprout className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm tracking-widest uppercase text-foreground/80">User Manual</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Master Your Smart Farm
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to AgriVerse. Here is everything you need to know to harness the power of AI, IoT, and satellite data for your fields.
            </p>
          </header>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/30 before:to-transparent">
            
            {/* Feature 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Brain className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel bento-card p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">1. AI Crop & Fertilizer Advisory</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Our core intelligence engine. Tell us about your soil and land, and our AI will generate personalized recommendations on what to plant, how to fertilize, and when to harvest.
                </p>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Data-driven crop selection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Exact NPK fertilizer dosing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cost-benefit analysis</li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-accent text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Shield className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel bento-card p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">2. Instant Pest Detection</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Spotted a strange spot on your leaves? Use the Pest Detector tool to upload a photo of the affected plant. Our vision model will instantly identify the disease.
                </p>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Millisecond image recognition</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Organic & chemical remedies</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Preventative measures</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CloudSun className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel bento-card p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                    <CloudSun className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">3. Live Market & Weather</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Never be caught off guard. Get hyper-local weather forecasts and real-time mandi prices for your specific crops directly on your dashboard.
                </p>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> 7-day weather forecasting</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Extreme weather alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Daily updated crop prices</li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Mic className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel bento-card p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                    <Mic className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">4. Multilingual Voice Assistant</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Not comfortable typing? Just tap the microphone and speak to our AgriBot in your native language. It understands farming terminology and will speak the answers back to you.
                </p>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Supports multiple regional languages</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Voice-to-text input</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Natural farming conversations</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
