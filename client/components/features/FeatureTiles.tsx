import React, { startTransition } from "react";
import { CloudSun, Languages, Brain, Sprout, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FeatureTiles() {
  const { t } = useTranslation();
  
  const tiles = [
    {
      icon: Sprout,
      label: t('tiles.advice'),
      action: () =>
        startTransition(() =>
          document
            .getElementById("advisory")
            ?.scrollIntoView({ behavior: "smooth" }),
        ),
    },
    {
      icon: CloudSun,
      label: t('tiles.weather'),
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
      label: t('tiles.insights'),
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
      label: t('tiles.multilingual'),
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
      label: t('tiles.voice'),
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
