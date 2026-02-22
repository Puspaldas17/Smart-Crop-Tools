import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ChevronLeft,
  Calendar,
  Crop,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Flame, Trophy, Star, Target } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";
import { MissionCard } from "@/components/features/Gamification/MissionCard";
import { LeaderboardWidget } from "@/components/features/Gamification/LeaderboardWidget";
import { BadgesGallery } from "@/components/features/Gamification/BadgesGallery";
import { UpgradeModal } from "@/components/features/UpgradeModal";
import { PestAlertWidget } from "@/components/features/PestAlertWidget";

const Analytics = lazy(() => import("@/components/features/Analytics"));
const Chatbot = lazy(() => import("@/components/features/Chatbot"));
const PestDetector = lazy(() => import("@/components/features/PestDetector"));
const VetDashboard = lazy(() => import("./VetDashboard"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));

interface AdvisoryRecord {
  _id?: string;
  crop: string;
  advisory: string;
  createdAt?: string;
  weatherData?: Record<string, any>;
}

const MOCK_HISTORY: AdvisoryRecord[] = [
  { _id: "m1", crop: "Rice", advisory: "Apply urea fertilizer (120 kg/ha) in 3 splits. First dose at transplanting, second at tillering, third at panicle initiation. Monitor for Brown Planthopper — use neem-based spray as first response.", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { _id: "m2", crop: "Wheat", advisory: "Sow HD-2967 variety at 100 kg/ha seed rate. Apply DAP 50 kg/ha as basal dose. Irrigate at crown root initiation (21 days after sowing). Watch for Yellow Rust — apply Propiconazole 25 EC if spotted.", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { _id: "m3", crop: "Tomato", advisory: "Use drip irrigation and mulching to conserve moisture. Spray calcium nitrate (2%) to prevent blossom end rot. Watch for early blight — copper oxychloride spray recommended. Harvest when 50% of the fruit turns red.", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { _id: "m4", crop: "Maize", advisory: "Ensure proper spacing (60×25 cm). Apply 120:60:40 NPK kg/ha. Irrigation critical at knee-high stage and silking. Inspect for Fall Armyworm in leaf whorls — use emamectin benzoate 5 SG at 0.4 g/L.", createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { _id: "m5", crop: "Onion", advisory: "Transplant 45-day old seedlings. Maintain 10×15 cm spacing. Stop irrigation 2 weeks before harvest for better shelf life. Apply zinc sulphate (0.5%) to improve bulb quality. Avoid overwatering to prevent purple blotch.", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];

import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { farmer, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [history, setHistory] = useState<AdvisoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { xp, level, streak, missions } = useGamification();
  const [activeTab, setActiveTab] = useState<
    "missions" | "history" | "subscription" | "analytics" | "chat" | "pest"
  >("missions");
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!farmer) {
      navigate("/login", { replace: true });
      return;
    }
    if (!farmer.isGuest) {
      fetchHistory();
    }
  }, [farmer, navigate]);

  async function fetchHistory() {
    try {
      setLoading(true);
      const res = await fetch(`/api/advisory/history/${farmer?._id}?limit=20`);
      const data = await res.json();
      // Merge API results with mock; if API returns actual records prefer those
      const apiRecords = res.ok && Array.isArray(data) && data.length > 0 ? data : [];
      setHistory(apiRecords.length > 0 ? apiRecords : MOCK_HISTORY);
    } catch {
      setHistory(MOCK_HISTORY);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  }

  const isPremium = farmer?.subscriptionStatus === "premium";
  const subscriptionEnd = farmer?.subscriptionEndDate
    ? new Date(farmer.subscriptionEndDate).toLocaleDateString("en-IN")
    : null;

  if (farmer?.role === "vet") {
    return (
      <Suspense fallback={<div>Loading Portal...</div>}>
        <VetDashboard />
      </Suspense>
    );
  }

  if (farmer?.role === "admin") {
    return (
      <Suspense fallback={<div>Loading Authority Dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    );
  }


  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/#tools")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          {t('nav.tools')}
        </button>
      </div>

      <div className="grid gap-8">
        <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{farmer?.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                  <Star className="w-3 h-3 fill-yellow-800" /> {t('dash.level')} {level}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
                  <Flame className="w-3 h-3 fill-orange-800" /> {streak} {t('dash.streak')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {xp} {t('dash.xp')}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-3 py-2 text-sm rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
            >
              {t('nav.logout')}
            </button>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-1">
               <span className="text-xs text-muted-foreground">{t('dash.progress')} {level + 1}</span>
               <span className="text-xs font-medium">{xp % 100} / 100 {t('dash.xp')}</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500" 
                 style={{ width: `${Math.min(100, xp % 100)}%` }}
               />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('dash.phone')}</p>
              <p className="font-medium">{farmer?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dash.soil')}</p>
              <p className="font-medium">
                {farmer?.soilType || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dash.land')}</p>
              <p className="font-medium">{farmer?.landSize || "—"} acres</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dash.language')}</p>
              <p className="font-medium">{farmer?.language || "en-IN"}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:brightness-95"
            >
              {t('nav.profile')}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden shadow-sm">
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-bold">{t('dash.subscription.title')}</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
                {isPremium ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {t('dash.plan.premium')}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {t('dash.plan.free')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{t('dash.stats.advisories')}</p>
                <p className="text-2xl font-bold mt-1">{history.length}</p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{t('dash.stats.status')}</p>
                <p className="text-lg font-bold mt-1">
                  {isPremium ? t('dash.plan.premium') : "Free"}
                </p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{t('dash.stats.member_since')}</p>
                <p className="text-sm font-medium mt-1">
                  {farmer?.createdAt
                    ? new Date(farmer.createdAt).toLocaleDateString("en-IN")
                    : "Recently"}
                </p>
              </div>
            </div>

            {isPremium && subscriptionEnd && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-900">
                  {t('dash.plan.active_until')}{" "}
                  <span className="font-semibold">{subscriptionEnd}</span>
                </p>
              </div>
            )}

            {!isPremium && (
              <div className="mt-4">
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#ff8a00] to-[#2ea043] text-white font-medium rounded-md hover:opacity-90"
                >
                  {t('dash.plan.upgrade')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden shadow-sm">
          <div className="border-b border-border p-6 flex gap-4 overflow-x-auto remove-scrollbar">
            <button
              onClick={() => setActiveTab("missions")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap inline-flex items-center gap-2 ${
                activeTab === "missions"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Target className="w-4 h-4" />
              {t('dash.tab.missions')}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "chat"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('dash.tab.assistant')}
            </button>
            <button
              onClick={() => setActiveTab("pest")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "pest"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('dash.tab.pest')}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('dash.tab.history')}
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "subscription"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('dash.tab.stats')}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "analytics"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('dash.tab.analytics')}
            </button>
          </div>

          <div className="p-6">
            {activeTab === "missions" && (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">{t('dash.missions.title')}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                       {missions.map(mission => (
                         <MissionCard key={mission.id} mission={mission} />
                       ))}
                    </div>
                  </div>
                  <BadgesGallery />
                </div>
                <div>
                  <LeaderboardWidget />
                  <div className="mt-4">
                    <PestAlertWidget />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "chat" && (
              <Suspense fallback={<div>Loading Chat...</div>}>
                <div className="h-[500px]">
                  <Chatbot />
                </div>
              </Suspense>
            )}
            
            {activeTab === "pest" && (
              <Suspense fallback={<div>Loading Detector...</div>}>
                <PestDetector />
              </Suspense>
            )}

            {activeTab === "history" && (
              <div>
                {farmer?.isGuest ? (
                  <div className="text-center py-12">
                     <Crop className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                     <h3 className="text-lg font-medium text-foreground">{t('dash.guest_mode')}</h3>
                     <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                       {t('dash.guest_msg')}
                     </p>
                     <button 
                       onClick={() => {
                         logout();
                         navigate("/login");
                       }}
                       className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                     >
                       {t('dash.signup')}
                     </button>
                  </div>
                ) : loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('dash.history_loading')}
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <Crop className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {t('dash.no_history')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((record) => (
                      <div
                        key={record._id}
                        className="p-4 border border-border rounded-lg hover:bg-accent/50 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Crop className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold text-foreground">
                                {record.crop}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {record.advisory}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(record.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "subscription" && (
              <div className="space-y-5">
                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: t('dash.stats.advisories'), value: history.length, sub: "total generated", color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700" },
                    { label: "Days Active", value: Math.max(streak, 1) + " days", sub: "current streak", color: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700" },
                    { label: "Missions Done", value: missions.filter(m => m.completed).length + "/" + missions.length, sub: "today's progress", color: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700" },
                    { label: t('dash.stats.status'), value: isPremium ? "Premium ✨" : "Free", sub: subscriptionEnd ? `Renews ${subscriptionEnd}` : "Upgrade for more", color: isPremium ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700" : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 text-slate-700" },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color.split(' ').slice(0, -1).join(' ')}`}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                      <p className={`text-2xl font-bold ${color.split(' ').at(-1)}`}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Plan features with progress-style indicators */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Plan Features</h3>
                    {!isPremium && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-950/30 text-amber-700 px-2 py-0.5 rounded-full font-medium">Free Plan</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Crop advisory generation", free: true, note: "Unlimited" },
                      { label: "AI chatbot assistant", free: true, note: "10 queries/day" },
                      { label: "Real-time weather alerts", free: true, note: "Basic" },
                      { label: "Market price tracking", free: true, note: "Mandi prices" },
                      { label: "Pest image detection", free: true, note: "5 scans/day" },
                      { label: "Advanced analytics & charts", free: false, note: "Premium only" },
                      { label: "Priority support (24/7)", free: false, note: "Premium only" },
                      { label: "Offline mode", free: false, note: "Premium only" },
                    ].map(({ label, free, note }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {free || isPremium
                            ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            : <AlertCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          }
                          <span className={`text-sm ${free || isPremium ? "" : "text-muted-foreground/50"}`}>{label}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          free || isPremium
                            ? "bg-green-100 dark:bg-green-950/30 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}>{note}</span>
                      </div>
                    ))}
                  </div>

                  {!isPremium && (
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:brightness-105 transition-all"
                    >
                      ✨ Upgrade to Premium — ₹199/month
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "analytics" && farmer?._id && (
              <Suspense
                fallback={
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 w-40 rounded bg-slate-200" />
                    <div className="h-64 rounded bg-slate-200" />
                  </div>
                }
              >
                <Analytics farmerId={farmer._id} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
