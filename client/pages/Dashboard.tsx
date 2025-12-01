import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronLeft, Calendar, Crop, CheckCircle2, AlertCircle } from "lucide-react";

const Analytics = lazy(() => import("@/components/features/Analytics"));

interface AdvisoryRecord {
  _id?: string;
  crop: string;
  advisory: string;
  createdAt?: string;
  weatherData?: Record<string, any>;
}

export default function Dashboard() {
  const { farmer, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<AdvisoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"history" | "subscription" | "analytics">("history");

  useEffect(() => {
    if (!farmer || farmer.isGuest) {
      navigate("/login", { replace: true });
      return;
    }
    fetchHistory();
  }, [farmer, navigate]);

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
          Back to Tools
        </button>
      </div>

      <div className="grid gap-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{farmer?.name}</h1>
              <p className="text-slate-600 mt-1">Farmer Account</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-3 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Phone</p>
              <p className="font-medium">{farmer?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Soil Type</p>
              <p className="font-medium">{farmer?.soilType || "Not specified"}</p>
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
              Edit Profile
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold">Subscription & Usage</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100">
                {isPremium ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Premium</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Free Plan</span>
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
          <div className="border-b border-slate-200 p-6 flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("history")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
              }`}
            >
              Advisory History
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "subscription"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
              }`}
            >
              Usage Stats
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`font-medium pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "analytics"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600"
              }`}
            >
              Analytics & Insights
            </button>
          </div>

          <div className="p-6">
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
                    <p className="text-sm text-slate-600 mb-1">Total Advisories</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
