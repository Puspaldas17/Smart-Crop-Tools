import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/context/GamificationContext";
import { toast } from "sonner";
import {
  User, Phone, Sprout, Ruler, Globe, Save, ArrowLeft,
  Flame, Star, Trophy, CheckCircle2, Lock, LogOut, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_OPTIONS = [
  { value: "en-IN", label: "🇮🇳 English" },
  { value: "hi-IN", label: "🇮🇳 Hindi" },
  { value: "or-IN", label: "🇮🇳 Odia" },
];

const SOIL_OPTIONS = ["Alluvial", "Black (Regur)", "Red & Laterite", "Arid & Desert", "Forest & Hill", "Saline"];

export default function Profile() {
  const { farmer, login, logout } = useAuth();
  const { xp, level, streak, badges, missions } = useGamification();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!farmer) navigate("/login", { replace: true });
  }, [farmer, navigate]);

  const [form, setForm] = useState(() => ({
    name: farmer?.name || "",
    phone: farmer?.phone || "",
    soilType: farmer?.soilType || "",
    landSize: farmer?.landSize?.toString() || "",
    language: farmer?.language || "en-IN",
    location: farmer?.location || { lat: null, lon: null },
  }));

  useEffect(() => {
    setForm({
      name: farmer?.name || "",
      phone: farmer?.phone || "",
      soilType: farmer?.soilType || "",
      landSize: farmer?.landSize?.toString() || "",
      language: farmer?.language || "en-IN",
      location: farmer?.location || { lat: null, lon: null },
    });
  }, [farmer]);

  const [detectingLoc, setDetectingLoc] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [searchingLoc, setSearchingLoc] = useState(false);

  async function searchLocation() {
    if (!locationQuery.trim()) return;
    setSearchingLoc(true);
    const toastId = toast.loading("Searching for location...");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`, {
        headers: { "User-Agent": "SmartCropTools" }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const place = data[0];
        setForm(f => ({
          ...f,
          location: { 
            ...f.location, 
            lat: parseFloat(place.lat), 
            lon: parseFloat(place.lon),
            village: place.name,
            state: place.display_name.split(",").slice(-2)[0]?.trim() || "Location detected"
          }
        }));
        toast.success("Location found!");
      } else {
        toast.error("Unable to determine coordinates for this location.");
      }
    } catch (e) {
      toast.error("Network error during location search.");
    } finally {
      toast.dismiss(toastId);
      setSearchingLoc(false);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLoc(true);
    const toastId = toast.loading("Detecting your farm location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(toastId);
        setForm(f => ({
          ...f,
          location: { ...f.location, lat: pos.coords.latitude, lon: pos.coords.longitude, village: "", state: "Current Location" }
        }));
        toast.success("Location coordinates detected successfully!");
        setDetectingLoc(false);
      },
      (err) => {
        toast.dismiss(toastId);
        toast.error("Failed to detect location. Please enable location access in your browser.");
        setDetectingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const fetchWithTimeout = useMemo(
    () =>
      async (input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) => {
        const { timeoutMs = 8000, ...rest } = init;
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          return await fetch(input, { ...rest, signal: ctrl.signal });
        } finally {
          clearTimeout(id);
        }
      },
    [],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetchWithTimeout("/api/auth/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          soilType: form.soilType || undefined,
          landSize: Number(form.landSize || 0),
          language: form.language || "en-IN",
          location: form.location?.lat ? form.location : undefined,
        }),
        timeoutMs: 8000,
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        login(data as any);
        toast.success("✅ Profile saved successfully!");
      } else {
        toast.error(data?.error || "Failed to save profile.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  const completedMissions = missions.filter((m) => m.completed).length;
  const unlockedBadges = badges.filter((b) => b.unlocked).length;
  const xpToNext = 100 - (xp % 100);
  const xpProgress = ((xp % 100) / 100) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your farm details and account</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Edit Form */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Farm Details
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  required
                  inputMode="tel"
                  disabled={submitting}
                  className="w-full rounded-xl border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </div>

              {/* Soil Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sprout className="h-3.5 w-3.5" /> Soil Type
                </label>
                <select
                  value={form.soilType}
                  onChange={(e) => setForm((f) => ({ ...f, soilType: e.target.value }))}
                  disabled={submitting}
                  className="w-full rounded-xl border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                >
                  <option value="">Select soil type (optional)</option>
                  {SOIL_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Land Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5" /> Land Size (acres)
                </label>
                <input
                  name="landSize"
                  value={form.landSize}
                  onChange={(e) => setForm((f) => ({ ...f, landSize: e.target.value }))}
                  placeholder="e.g., 5"
                  type="number"
                  min="0"
                  disabled={submitting}
                  className="w-full rounded-xl border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Preferred Language
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  disabled={submitting}
                  className="w-full rounded-xl border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                >
                  {LANG_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Farm Location
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="e.g. Bhubaneswar, Odisha"
                      disabled={searchingLoc || submitting}
                      className="flex-1 rounded-xl border border-input px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          searchLocation();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={searchLocation}
                      disabled={!locationQuery.trim() || searchingLoc || submitting}
                      className="px-4 rounded-xl border border-input text-sm bg-muted/50 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 transition-all font-medium whitespace-nowrap"
                    >
                      {searchingLoc ? "Searching..." : "Search"}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">OR</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>

                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLoc || submitting}
                    className="w-full rounded-xl border border-input px-3 py-2.5 text-sm bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    {detectingLoc ? (
                      <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4 text-blue-500" />
                    )}
                    Use my current location
                  </button>
                </div>
                
                {form.location?.lat && (
                  <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-green-800 dark:text-green-300">
                        {form.location.village ? form.location.village + ", " : ""}{form.location.state || "Location saved"}
                      </p>
                      <p className="text-[10px] text-green-600 dark:text-green-400">
                        Lat {form.location.lat.toFixed(5)}, Lon {form.location.lon.toFixed(5)}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-95 disabled:opacity-60 transition-all"
                >
                  {submitting ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); navigate("/"); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Stats Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Avatar + Level Card */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/20 p-5 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl font-bold shadow-lg">
              {farmer?.name?.charAt(0)?.toUpperCase() || "F"}
            </div>
            <p className="font-bold text-lg">{farmer?.name || "Farmer"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {farmer?.soilType ? `${farmer.soilType} soil` : "Farmer"} · {farmer?.landSize ? `${farmer.landSize} acres` : ""}
            </p>

            {/* Level + XP bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-primary">Level {level}</span>
                <span className="text-muted-foreground">{xp} XP · {xpToNext} to next</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Flame, label: "Streak", value: `${streak}d`, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
              { icon: Trophy, label: "Badges", value: `${unlockedBadges}/${badges.length}`, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
              { icon: CheckCircle2, label: "Today", value: `${completedMissions}/${missions.length}`, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={cn("rounded-xl border border-border p-3 text-center", bg)}>
                <Icon className={cn("h-5 w-5 mx-auto mb-1", color)} />
                <p className="text-base font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Badges showcase */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> Badges Earned
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  title={badge.unlocked ? badge.name : `Locked: ${badge.description}`}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition-all",
                    badge.unlocked
                      ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 shadow-sm"
                      : "border-border bg-muted opacity-30 grayscale",
                  )}
                >
                  {badge.unlocked ? badge.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
