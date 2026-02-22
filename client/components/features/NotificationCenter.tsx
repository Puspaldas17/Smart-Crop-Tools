import React, { useState } from "react";
import {
  Bell, X, TrendingUp, CloudRain, Bug,
  CheckCircle2, Info, BellOff, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifType = "pest" | "market" | "weather" | "mission" | "system";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_NOTIFS: Notification[] = [
  {
    id: 1, type: "pest",
    title: "High Pest Risk: Rice",
    body: "Brown Planthopper outbreak risk is HIGH in your region this week. Apply neem spray immediately.",
    time: "2 hours ago", read: false,
  },
  {
    id: 2, type: "market",
    title: "Tomato Price Up 18%",
    body: "Mandi prices for Tomato rose to ₹28/kg today in Bhubaneswar. Good time to sell your stock.",
    time: "4 hours ago", read: false,
  },
  {
    id: 3, type: "weather",
    title: "Heavy Rain Expected",
    body: "IMD forecasts heavy rainfall (65mm) in your district over the next 48 hours. Cover stored crops.",
    time: "6 hours ago", read: true,
  },
  {
    id: 4, type: "mission",
    title: "Daily Missions Reset",
    body: "Your 8 daily missions have been refreshed. Complete them today to earn up to 350 XP.",
    time: "Today, 12:00 am", read: true,
  },
  {
    id: 5, type: "market",
    title: "Wheat Price Drop Alert",
    body: "Wheat prices dropped 8% in Cuttack mandi. Consider holding stock for 2–3 more days.",
    time: "Yesterday", read: true,
  },
  {
    id: 6, type: "system",
    title: "All-India Marketplace Live",
    body: "You can now list your produce for buyers across all of India! Visit the Marketplace tab.",
    time: "2 days ago", read: true,
  },
  {
    id: 7, type: "pest",
    title: "Maize Armyworm Sighting",
    body: "Fall Armyworm spotted in 3 nearby farms. Inspect your maize whorls and apply emamectin benzoate.",
    time: "3 days ago", read: true,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<NotifType, {
  icon: React.ElementType;
  label: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  pest: {
    icon: Bug,
    label: "Pest Alert",
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-l-red-500",
    badgeBg: "bg-red-100 dark:bg-red-900/30",
    badgeText: "text-red-700 dark:text-red-400",
  },
  market: {
    icon: TrendingUp,
    label: "Market",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-l-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/30",
    badgeText: "text-emerald-700 dark:text-emerald-400",
  },
  weather: {
    icon: CloudRain,
    label: "Weather",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-l-sky-500",
    badgeBg: "bg-sky-100 dark:bg-sky-900/30",
    badgeText: "text-sky-700 dark:text-sky-400",
  },
  mission: {
    icon: CheckCircle2,
    label: "Mission",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-l-violet-500",
    badgeBg: "bg-violet-100 dark:bg-violet-900/30",
    badgeText: "text-violet-700 dark:text-violet-400",
  },
  system: {
    icon: Info,
    label: "System",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-l-amber-500",
    badgeBg: "bg-amber-100 dark:bg-amber-900/30",
    badgeText: "text-amber-700 dark:text-amber-400",
  },
};

const FILTER_TABS = [
  { key: "all",     label: "All"     },
  { key: "pest",    label: "Pest"    },
  { key: "market",  label: "Market"  },
  { key: "weather", label: "Weather" },
  { key: "mission", label: "Mission" },
  { key: "system",  label: "System"  },
] as const;
type FilterKey = (typeof FILTER_TABS)[number]["key"];

// ─── NotificationCenter panel ─────────────────────────────────────────────────
interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifs: Notification[];
  setNotifs: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export function NotificationCenter({
  open, onClose, notifs, setNotifs,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const unread    = notifs.filter((n) => !n.read).length;
  const displayed = filter === "all"
    ? notifs
    : notifs.filter((n) => n.type === (filter as NotifType));

  const markAllRead    = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const dismissAll     = () => setNotifs([]);
  const dismiss        = (id: number) => setNotifs((p) => p.filter((n) => n.id !== id));
  const markRead       = (id: number) =>
    setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  const countFor = (k: FilterKey) =>
    k === "all" ? notifs.length : notifs.filter((n) => n.type === k).length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">

      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Drawer ── */}
      <div className="relative flex flex-col w-full max-w-[400px] h-full shadow-2xl">

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-emerald-600 px-5 pt-6 pb-5 shrink-0">
          {/* Background orbs */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-20 w-36 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <div className="relative flex items-start justify-between">
            {/* Left: title + unread */}
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">Notifications</h2>
                  <p className="text-white/70 text-xs">Stay updated on your farm</p>
                </div>
              </div>
              {unread > 0 ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-xs font-semibold">
                    {unread} unread notification{unread > 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                  <span className="text-white text-xs font-semibold">All caught up!</span>
                </div>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 mt-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1.5 text-white text-[11px] font-semibold transition-colors backdrop-blur-sm"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ══ FILTER TABS ═════════════════════════════════════════════════════ */}
        <div className="bg-background border-b border-border shrink-0">
          <div className="flex overflow-x-auto remove-scrollbar px-4 py-2 gap-1">
            {FILTER_TABS.map(({ key, label }) => {
              const count = countFor(key);
              const cfg = key !== "all" ? TYPE_CONFIG[key as NotifType] : null;
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {cfg && <cfg.icon className="h-3 w-3" />}
                  {label}
                  {count > 0 && (
                    <span className={cn(
                      "inline-flex items-center justify-center h-4 min-w-[16px] rounded-full text-[10px] font-bold px-1",
                      active
                        ? "bg-white/25 text-primary-foreground"
                        : "bg-muted-foreground/15 text-muted-foreground",
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ NOTIFICATION LIST ════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto bg-background">
          {displayed.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20 px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <BellOff className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "all"
                    ? "You're all caught up! Check back later."
                    : `No ${label(filter)} alerts at the moment.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {displayed.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={cn(
                      "group relative flex gap-4 px-5 py-4 cursor-pointer transition-colors border-l-[3px]",
                      notif.read
                        ? "border-l-transparent hover:bg-muted/40"
                        : cn("hover:bg-muted/30", cfg.borderColor),
                      !notif.read && "bg-primary/[0.03]",
                    )}
                  >
                    {/* Unread pulse dot */}
                    {!notif.read && (
                      <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "shrink-0 flex h-10 w-10 items-center justify-center rounded-xl mt-0.5",
                      cfg.iconBg,
                    )}>
                      <Icon className={cn("h-5 w-5", cfg.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      {/* Category + time */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide",
                          cfg.badgeBg, cfg.badgeText,
                        )}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                      </div>

                      {/* Title */}
                      <p className={cn(
                        "text-sm leading-snug mb-1",
                        notif.read
                          ? "font-medium text-foreground/80"
                          : "font-bold text-foreground",
                      )}>
                        {notif.title}
                      </p>

                      {/* Body */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>
                    </div>

                    {/* Dismiss ✕ */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                      className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
        <div className="shrink-0 bg-background border-t border-border px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{notifs.length}</span> total ·{" "}
            <span className={cn("font-semibold", unread > 0 ? "text-primary" : "text-foreground")}>
              {unread}
            </span>{" "}
            unread
          </p>
          {notifs.length > 0 && (
            <button
              onClick={dismissAll}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────────
function label(key: string) {
  const t = FILTER_TABS.find((f) => f.key === key);
  return t ? t.label.toLowerCase() : key;
}

// ─── Bell button (nav) ─────────────────────────────────────────────────────────
export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [open, setOpen]     = useState(false);
  const unread              = notifs.filter((n) => !n.read).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 min-w-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow ring-2 ring-background px-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <NotificationCenter
        open={open}
        onClose={() => setOpen(false)}
        notifs={notifs}
        setNotifs={setNotifs}
      />
    </>
  );
}
