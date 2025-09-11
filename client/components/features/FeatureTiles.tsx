import React, { startTransition } from "react";
import { CloudSun, Languages, Brain, Sprout, Mic } from "lucide-react";

export default function FeatureTiles() {
  const tiles = [
    {
      icon: Sprout,
      label: "Crop advice",
      action: () =>
        startTransition(() =>
          document
            .getElementById("advisory")
            ?.scrollIntoView({ behavior: "smooth" }),
        ),
    },
    {
      icon: CloudSun,
      label: "Weather alerts",
      action: () =>
        startTransition(() => {
          document
            .getElementById("market")
            ?.scrollIntoView({ behavior: "smooth" });
          window.dispatchEvent(new Event("weather:refresh"));
        }),
    },
    {
      icon: Brain,
      label: "Insights",
      action: () =>
        startTransition(() => {
          document
            .getElementById("chat")
            ?.scrollIntoView({ behavior: "smooth" });
          window.dispatchEvent(new Event("chat:focus"));
        }),
    },
    {
      icon: Languages,
      label: "Multilingual",
      action: () =>
        startTransition(() => {
          document
            .getElementById("chat")
            ?.scrollIntoView({ behavior: "smooth" });
          const evt = new CustomEvent("chat:set-language", { detail: "hi-IN" });
          window.dispatchEvent(evt);
        }),
    },
    {
      icon: Mic,
      label: "Voice Mode",
      action: () =>
        startTransition(() => {
          document
            .getElementById("chat")
            ?.scrollIntoView({ behavior: "smooth" });
          window.dispatchEvent(new Event("chat:voice-mode"));
        }),
    },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-left hover:bg-slate-50"
          >
            <Icon className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
