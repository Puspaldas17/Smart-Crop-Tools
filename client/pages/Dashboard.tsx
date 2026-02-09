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

const Analytics = lazy(() => import("@/components/features/Analytics"));
const Chatbot = lazy(() => import("@/components/features/Chatbot"));
const PestDetector = lazy(() => import("@/components/features/PestDetector"));

interface AdvisoryRecord {
  _id?: string;
  crop: string;
  advisory: string;
  createdAt?: string;
  weatherData?: Record<string, any>;
}

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

  useEffect(() => {
    if (!farmer || farmer.isGuest) {
      navigate("/login", { replace: true });
      return;
    }
    fetchHistory();
  }, [farmer, navigate]);

  // ... (keeping existing functions fetchHistory, formatDate, etc. unchanged)

  async function fetchHistory() {
    try {
      setLoading(true);
      const res = await fetch(`/api/advisory/history/${farmer?._id}?limit=20`);
      const data = await res.json();
      if (res.ok) {
        setHistory(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load history");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/#tools")}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-5 w-5" />
          {t('nav.tools')}
        </button>
      </div>

      <div className="grid gap-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{farmer?.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                  <Star className="w-3 h-3 fill-yellow-800" /> Lvl {level}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
                  <Flame className="w-3 h-3 fill-orange-800" /> {streak} Day Streak
                </span>
                <span className="text-sm text-slate-500">
                  {xp} XP
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-3 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50"
            >
              {t('nav.logout')}
            </button>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-1">
               <span className="text-xs text-muted-foreground">Progress to Level {level + 1}</span>
               <span className="text-xs font-medium">{xp % 100} / 100 XP</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500" 
                 style={{ width: `${Math.min(100, xp % 100)}%` }}
               />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Phone</p>
              <p className="font-medium">{farmer?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Soil Type</p>
              <p className="font-medium">
                {farmer?.soilType || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Land Size</p>
              <p className="font-medium">{farmer?.landSize || "—"} acres</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Language</p>
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

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold">{t('dash.subscription.title')}</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100">
                {isPremium ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Premium
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Free Plan
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Advisories Generated</p>
                <p className="text-2xl font-bold mt-1">{history.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-lg font-bold mt-1">
                  {isPremium ? "Premium Active" : "Free"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Member Since</p>
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
                  Your premium subscription is active until{" "}
                  <span className="font-semibold">{subscriptionEnd}</span>
                </p>
              </div>
            )}

            {!isPremium && (
              <div className="mt-4">
                <button className="px-4 py-2 bg-gradient-to-r from-[#ff8a00] to-[#2ea043] text-white font-medium rounded-md hover:opacity-90">
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 p-6 flex gap-4 overflow-x-auto remove-scrollbar">
            <button
              onClick={() => setActiveTab("missions")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap inline-flex items-center gap-2 ${
                activeTab === "missions"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
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
                  : "border-transparent text-slate-600"
              }`}
            >
              {t('dash.tab.assistant')}
            </button>
            <button
              onClick={() => setActiveTab("pest")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "pest"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
              }`}
            >
              {t('dash.tab.pest')}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
              }`}
            >
              {t('dash.tab.history')}
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "subscription"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
              }`}
            >
              {t('dash.tab.stats')}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "analytics"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
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
                    <h3 className="font-semibold text-lg mb-3">Daily Missions</h3>
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
                {loading ? (
                  <div className="text-center py-8 text-slate-500">
                    Loading history...
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <Crop className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                      No advisories yet. Get started by generating your first
                      advisory!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((record) => (
                      <div
                        key={record._id}
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Crop className="h-4 w-4 text-slate-500" />
                              <p className="font-semibold text-slate-900">
                                {record.crop}
                              </p>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {record.advisory}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
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
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">
                      Total Advisories
                    </p>
                    <p className="text-3xl font-bold">{history.length}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Status</p>
                    <p className="text-xl font-bold text-blue-900">
                      {isPremium ? "Premium" : "Free"}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h3 className="font-semibold mb-3">Plan Features</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Crop advisory generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Weather tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Market insights</span>
                    </div>
                    {!isPremium && (
                      <>
                        <div className="flex items-center gap-2 opacity-50">
                          <AlertCircle className="h-4 w-4 text-slate-400" />
                          <span>Priority support</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-50">
                          <AlertCircle className="h-4 w-4 text-slate-400" />
                          <span>Advanced analytics</span>
                        </div>
                      </>
                    )}
                  </div>
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
    </div>
  );
}
