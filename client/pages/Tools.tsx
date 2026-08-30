import React, { Suspense, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { setLastTool } from "@/hooks/useLastTool";
import ToolsSection from "@/components/features/ToolsSection";

const Chatbot = React.lazy(() => import("@/components/features/Chatbot"));
const MarketCard = React.lazy(() => import("@/components/features/MarketCard"));
const WeatherCard = React.lazy(() => import("@/components/features/WeatherCard"));
const PestDetector = React.lazy(() => import("@/components/features/PestDetector"));
const FeatureTiles = React.lazy(() => import("@/components/features/FeatureTiles"));
const AdvisoryWidget = React.lazy(() => import("@/components/features/AdvisoryWidget"));
const UnifiedOverview = React.lazy(() => import("@/components/features/UnifiedOverview"));

function ToolsSuiteInner() {
  return (
    <div className="grid gap-8">
      <Suspense
        fallback={
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>
        }
      >
        <FeatureTiles />
      </Suspense>
      <Suspense
        fallback={
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-48 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>
        }
      >
        <UnifiedOverview />
      </Suspense>
      <div id="advisory">
        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Loading…
            </div>
          }
        >
          <AdvisoryWidget />
        </Suspense>
      </div>
      <div className="grid gap-8 min-[577px]:grid-cols-3">
        <div id="chat">
          <Suspense
            fallback={
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 w-32 rounded bg-muted" />
                  <div className="h-24 rounded bg-muted" />
                </div>
              </div>
            }
          >
            <Chatbot />
          </Suspense>
        </div>
        <div id="market" className="contents">
          <Suspense
            fallback={
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading market…
              </div>
            }
          >
            <MarketCard />
          </Suspense>
          <Suspense
            fallback={
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading weather…
              </div>
            }
          >
            <WeatherCard />
          </Suspense>
        </div>
      </div>
      <div id="pest">
        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Loading detector…
            </div>
          }
        >
          <PestDetector />
        </Suspense>
      </div>
    </div>
  );
}

export default function Tools() {
  const { farmer } = useAuth();
  
  useEffect(() => {
    if (!farmer) return;
    const ids = ["advisory", "chat", "market", "pest"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setLastTool(e.target.id as any);
        });
      },
      { rootMargin: "0px 0px -40% 0px", threshold: 0.6 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [farmer]);

  if (!farmer) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Access Denied</h2>
        <p className="mt-4 text-muted-foreground">Please log in to access the Tools Suite.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-16">
      <section id="tools" className="mt-8">
        <ToolsSection show={true}>
          <ToolsSuiteInner />
        </ToolsSection>
      </section>
    </div>
  );
}
