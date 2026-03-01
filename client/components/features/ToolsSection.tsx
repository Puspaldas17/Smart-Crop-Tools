import React from "react";
import { useInView } from "@/hooks/useInView";
import { useHash } from "@/hooks/useHash";

import { useEffect } from "react";
import { getLastTool } from "@/hooks/useLastTool";

export default function ToolsSection({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  const hash = useHash();
  const { ref, inView } = useInView<HTMLDivElement>();
  const shouldMount = !!show && (hash === "#tools" || inView);

  useEffect(() => {
    if (!show) return;
    const id = getLastTool();
    if (!id) return;
    const el = document.getElementById(id);
    if (el)
      setTimeout(
        () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
  }, [show]);

  return (
    <section id="tools" className={`scroll-mt-24 ${!show ? "hidden" : ""}`}>
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Working Suite</h2>
        <p className="mt-2 max-w-prose text-slate-600">
          Chatbot, Market & Weather, Pest Detection, and Advisory demo — all
          together.
        </p>
      </header>
      <div ref={ref} />
      {shouldMount ? (
        children
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Scroll here or click Open Tools to load…
        </div>
      )}
    </section>
  );
}
