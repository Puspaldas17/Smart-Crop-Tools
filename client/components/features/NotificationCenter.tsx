import React, { useState } from "react";
import { Bell, X, TrendingUp, CloudRain, Bug, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type NotifType = "pest" | "market" | "weather" | "mission" | "system";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  { id: 1, type: "pest", title: "High Pest Risk: Rice", body: "Brown Planthopper outbreak risk is HIGH in your region this week. Apply neem spray immediately.", time: "2h ago", read: false },
  { id: 2, type: "market", title: "Tomato Price Up 18%", body: "Mandi prices for Tomato rose to ₹28/kg today in Bhubaneswar markets. Good time to sell.", time: "4h ago", read: false },
  { id: 3, type: "weather", title: "Heavy Rain Expected", body: "IMD forecasts heavy rainfall (65mm) in your district over the next 48 hours. Cover stored crops.", time: "6h ago", read: true },
  { id: 4, type: "mission", title: "Daily Missions Reset!", body: "Your 8 daily missions have been refreshed. Complete them today to earn up to 350 XP.", time: "Today, 12:00am", read: true },
  { id: 5, type: "market", title: "Wheat Price Drop Alert", body: "Wheat prices dropped by 8% in Cuttack mandi. Consider holding stock for 2–3 more days.", time: "Yesterday", read: true },
  { id: 6, type: "system", title: "New Feature: Marketplace", body: "You can now list your produce directly for consumers! Visit the Marketplace tab to post a listing.", time: "2 days ago", read: true },
  { id: 7, type: "pest", title: "Maize Armyworm Sighting", body: "Fall Armyworm spotted in 3 nearby farms. Inspect your maize whorls and apply emamectin benzoate.", time: "3 days ago", read: true },
];

const NOTIF_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  pest:    { icon: Bug,          color: "text-red-600",    bg: "bg-red-100 dark:bg-red-950/30"    },
  market:  { icon: TrendingUp,   color: "text-green-600",  bg: "bg-green-100 dark:bg-green-950/30" },
  weather: { icon: CloudRain,    color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-950/30"  },
  mission: { icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950/30" },
  system:  { icon: Bell,         color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950/30" },
};

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifs: Notification[];
  setNotifs: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export function NotificationCenter({ open, onClose, notifs, setNotifs }: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotifType | "all">("all");

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifs((prev) => prev.filter((n) => n.id !== id));
  const markRead = (id: number) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const displayed = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-sm h-full bg-background border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-4 py-3 border-b border-border overflow-x-auto">
          {(["all", "pest", "market", "weather", "mission", "system"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border capitalize",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No notifications here.</p>
            </div>
          ) : (
            displayed.map((notif) => {
              const { icon: Icon, color, bg } = NOTIF_CONFIG[notif.type];
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={cn(
                    "group flex gap-3 px-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors relative",
                    !notif.read && "bg-primary/5",
                  )}
                >
                  {!notif.read && (
                    <span className="absolute left-2 top-5 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", bg)}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold leading-snug", !notif.read && "text-foreground")}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{notif.time}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                    className="shrink-0 text-muted-foreground hover:text-foreground p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Bell button to embed in nav — owns shared state so badge updates reactively
export function NotificationBell() {
  // FIX: state lives here so unread count and panel are always in sync
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [open, setOpen] = useState(false);

  // FIX: computed from reactive state, not stale INITIAL_NOTIFS constant
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
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
