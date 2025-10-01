import { UserPlus, Cloud, Wand2, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create profile",
      desc: "Language, soil type and field details.",
    },
    {
      icon: Cloud,
      title: "Gather data",
      desc: "Weather, soil and crop history.",
    },
    {
      icon: Wand2,
      title: "Generate advice",
      desc: "Personalized crop, irrigation and input plan.",
    },
    {
      icon: CheckCircle2,
      title: "Act & improve",
      desc: "Track outcomes and refine recommendations.",
    },
  ];
  return (
    <section
      aria-labelledby="how-title"
      className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 md:p-10"
    >
      <h2 id="how-title" className="text-2xl font-bold tracking-tight">
        How it works
      </h2>
      <ol className="mt-6 grid gap-6 sm:gap-7 md:gap-8 min-[577px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <li
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 md:p-7"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                {i + 1}
              </span>
              Step {i + 1}
            </div>
            <Icon className="mt-4 h-5 w-5 text-emerald-600" />
            <div className="mt-3 text-base font-semibold text-slate-900">
              {title}
            </div>
            <div className="mt-1 text-sm text-slate-600">{desc}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
