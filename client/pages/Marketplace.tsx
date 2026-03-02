import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Filter, Phone, ShoppingCart,
  MapPin, Plus, X, Leaf, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Listing {
  _id: string;
  crop: string;
  emoji: string;
  quantity: number;
  unit: string;
  price: number;
  seller: string;
  location: string;
  state: string;
  phone: string;
  category: string;
  isOrganic: boolean;
  createdAt: string;
}

const CATEGORIES = ["All", "Grain", "Vegetable", "Fruit", "Spice", "Pulse", "Other"];

const CROP_EMOJIS: Record<string, string> = {
  rice: "🍚", wheat: "🌾", potato: "🥔", tomato: "🍅", onion: "🧅",
  mango: "🥭", banana: "🍌", apple: "🍎", grape: "🍇", coconut: "🥥",
  chilli: "🌶️", garlic: "🧄", ginger: "🫚", turmeric: "🟡", coffee: "☕",
  sugarcane: "🎋", soybean: "🫘", groundnut: "🥜", pepper: "⚫",
  mustard: "🌿", cumin: "🌿", jute: "🌿", cotton: "🌿", bajra: "🌾",
};

function guessEmoji(crop: string): string {
  const lower = crop.toLowerCase();
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🌾";
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-6 w-14 bg-muted rounded" />
      </div>
      <div className="h-8 bg-muted rounded-lg mt-4" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Marketplace() {
  const { t } = useTranslation();
  const { farmer, authHeaders } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stateFilter, setStateFilter] = useState("All States");
  const [allStates, setAllStates] = useState<string[]>(["All States"]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({
    crop: "", quantity: "", price: "", unit: "kg",
    location: "", state: "", phone: "",
    category: "Vegetable", isOrganic: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Fetch listings from API ───────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "All") params.set("category", category);
      if (stateFilter !== "All States") params.set("state", stateFilter);
      const res = await fetch(`/api/listings?${params}`);
      if (!res.ok) throw new Error("Failed to load listings");
      const data: Listing[] = await res.json();
      setListings(data);
      // Update state list from API data when no filter active
      if (!stateFilter || stateFilter === "All States") {
        const states = Array.from(new Set(data.map((l) => l.state))).sort();
        setAllStates(["All States", ...states]);
      }
    } catch {
      toast.error("Could not load marketplace listings");
    } finally {
      setLoading(false);
    }
  }, [search, category, stateFilter]);

  // Auto-seed on first load, then fetch
  useEffect(() => {
    fetch("/api/listings/seed").finally(() => fetchListings());
  }, []);

  // Re-fetch when filters change (debounced for search)
  useEffect(() => {
    const t = setTimeout(() => fetchListings(), search ? 350 : 0);
    return () => clearTimeout(t);
  }, [search, category, stateFilter]);

  // ── Post new listing ──────────────────────────────────────────────────────
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.crop.trim())     errors.crop     = "Crop name is required";
    if (!form.quantity.trim()) errors.quantity = "Quantity is required";
    else if (isNaN(Number(form.quantity))) errors.quantity = "Enter a valid number";
    if (!form.price.trim())    errors.price    = "Price is required";
    else if (isNaN(Number(form.price)))    errors.price    = "Enter a valid number";
    if (!form.location.trim()) errors.location = "City / District is required";
    if (!form.state.trim())    errors.state    = "State is required";
    if (!form.phone.trim())    errors.phone    = "Phone number is required";
    else if (!/^[0-9\s]{10,}$/.test(form.phone)) errors.phone = "Enter a valid 10-digit phone";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setPosting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price),
          emoji: guessEmoji(form.crop),
          seller: farmer?.name || "Anonymous",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to post listing");
      }
      toast.success("✅ Listing posted & saved to database!");
      setShowPostForm(false);
      setForm({ crop: "", quantity: "", price: "", unit: "kg", location: "", state: "", phone: "", category: "Vegetable", isOrganic: false });
      setFormErrors({});
      fetchListings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  // ── Relative time helper ──────────────────────────────────────────────────
  function relativeTime(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "1d ago";
    return `${diff}d ago`;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              {t("market.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("market.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchListings}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-input rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh listings"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => {
              if (!farmer) { toast.error("Please login to post a listing"); return; }
              setShowPostForm(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> {t("market.post")}
          </button>
        </div>
      </div>

      {/* ── Search + State filter ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("market.search_ph")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 sm:min-w-[150px]"
          >
            {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-all font-medium whitespace-nowrap",
                category === cat ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <div className="flex gap-4 mb-5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{listings.length}</span> listings found
        <span>·</span>
        <Leaf className="h-4 w-4 text-green-600 inline" /> {listings.filter(l => l.isOrganic).length} organic
      </div>

      {/* ── Listings Grid ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t("market.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <div key={listing._id} className="glass-card gradient-border rounded-2xl hover:shadow-lg transition-all duration-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{listing.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{listing.crop}</h3>
                      {listing.isOrganic && (
                        <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-medium dark:bg-green-950/40 dark:border-green-800 dark:text-green-400">
                          Organic
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {listing.location}, <span className="font-medium text-foreground/70">{listing.state}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">₹{listing.price}</p>
                  <p className="text-xs text-muted-foreground">per {listing.unit}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                <div>
                  <p className="text-sm font-medium">{listing.seller}</p>
                  <p className="text-xs text-muted-foreground">
                    {listing.quantity} {listing.unit} available · {relativeTime(listing.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setContactListing(listing)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium"
                >
                  <Phone className="h-3.5 w-3.5" /> {t("market.contact")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Contact Modal ───────────────────────────────────────────────── */}
      {contactListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-80">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-lg">{contactListing.seller}</p>
                <p className="text-sm text-muted-foreground">{contactListing.crop} · {contactListing.location}</p>
              </div>
              <button onClick={() => setContactListing(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
              <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold tracking-wide">{contactListing.phone}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("market.call_note")}</p>
            </div>
            <a
              href={`https://wa.me/91${contactListing.phone.replace(/\s/g, "")}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setContactListing(null)}
              className="mt-4 block w-full py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl font-medium text-sm transition-colors text-center"
            >
              {t("market.whatsapp")}
            </a>
            <a
              href={`upi://pay?pa=${contactListing.phone.replace(/\s/g, "")}@ybl&pn=${encodeURIComponent(contactListing.seller)}&am=${contactListing.price}&cu=INR&tn=${encodeURIComponent(contactListing.crop + " - AgriVerse")}`}
              onClick={() => setContactListing(null)}
              className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors text-center"
            >
              <span className="font-bold">₹</span> Pay via UPI · ₹{contactListing.price}/{contactListing.unit}
            </a>
            <p className="text-[10px] text-center text-muted-foreground mt-1">Opens PhonePe / GPay / BHIM automatically</p>
          </div>
        </div>
      )}

      {/* ── Post Listing Modal ──────────────────────────────────────────── */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{t("market.post_title")}</h2>
              <button onClick={() => setShowPostForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePost} className="space-y-3">
              {[
                { label: t("market.field.crop"),     key: "crop",     placeholder: "e.g., Tomatoes" },
                { label: t("market.field.quantity"), key: "quantity", placeholder: "e.g., 200" },
                { label: t("market.field.price"),    key: "price",    placeholder: "₹ per unit" },
                { label: "Unit",                     key: "unit",     placeholder: "kg / dozen / litre" },
                { label: t("market.field.city"),     key: "location", placeholder: "e.g., Nashik" },
                { label: t("market.field.state"),    key: "state",    placeholder: "e.g., Maharashtra" },
                { label: t("market.field.phone"),    key: "phone",    placeholder: "e.g., 98765 43210" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setFormErrors((err) => ({ ...err, [key]: "" })); }}
                    className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background ${formErrors[key] ? "border-red-400 focus:ring-red-300" : "border-input"}`}
                  />
                  {formErrors[key] && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors[key]}
                    </p>
                  )}
                </div>
              ))}

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {["Grain","Vegetable","Fruit","Spice","Pulse","Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Organic toggle */}
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={form.isOrganic}
                  onChange={(e) => setForm((f) => ({ ...f, isOrganic: e.target.checked }))}
                  className="h-4 w-4 accent-green-600"
                />
                <span className="text-sm text-foreground/80 flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-green-600" /> Organic produce
                </span>
              </label>

              <button
                type="submit"
                disabled={posting}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors mt-2"
              >
                {posting ? "Saving to Database…" : t("market.submit")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
