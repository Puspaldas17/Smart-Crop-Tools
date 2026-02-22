import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Filter, Phone, ShoppingCart,
  MapPin, Plus, X, Leaf,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Listing {
  id: number;
  crop: string;
  emoji: string;
  quantity: number;
  unit: string;
  price: number;
  seller: string;
  location: string;   // city / district
  state: string;      // Indian state
  phone: string;
  category: string;
  isOrganic: boolean;
  postedDaysAgo: number;
}

const LISTINGS: Listing[] = [
  // Odisha
  { id: 1,  crop: "Rice (Basmati)",  emoji: "🍚", quantity: 1000, unit: "kg",     price: 60,  seller: "Suresh Kumar",    location: "Puri",           state: "Odisha",         phone: "97890 12345", category: "Grain",     isOrganic: true,  postedDaysAgo: 0 },
  { id: 2,  crop: "Tomatoes",         emoji: "🍅", quantity: 200,  unit: "kg",     price: 22,  seller: "Anita Devi",      location: "Cuttack",        state: "Odisha",         phone: "91234 56789", category: "Vegetable", isOrganic: true,  postedDaysAgo: 1 },
  // Punjab
  { id: 3,  crop: "Wheat",            emoji: "🌾", quantity: 2000, unit: "kg",     price: 26,  seller: "Gurpreet Singh",  location: "Ludhiana",       state: "Punjab",         phone: "98140 33210", category: "Grain",     isOrganic: false, postedDaysAgo: 0 },
  { id: 4,  crop: "Mustard",          emoji: "🌿", quantity: 800,  unit: "kg",     price: 55,  seller: "Harjit Kaur",    location: "Amritsar",       state: "Punjab",         phone: "98720 11234", category: "Grain",     isOrganic: false, postedDaysAgo: 2 },
  // Uttar Pradesh
  { id: 5,  crop: "Potato",           emoji: "🥔", quantity: 3000, unit: "kg",     price: 12,  seller: "Rambharose Yadav",location: "Agra",           state: "Uttar Pradesh",  phone: "94156 78901", category: "Vegetable", isOrganic: false, postedDaysAgo: 1 },
  { id: 6,  crop: "Sugarcane",        emoji: "🎋", quantity: 5000, unit: "kg",     price: 4,   seller: "Shyam Lal",      location: "Muzaffarnagar",  state: "Uttar Pradesh",  phone: "99350 22345", category: "Grain",     isOrganic: false, postedDaysAgo: 3 },
  // Maharashtra
  { id: 7,  crop: "Onion",            emoji: "🧅", quantity: 1500, unit: "kg",     price: 20,  seller: "Pandurang Shinde",location: "Nashik",         state: "Maharashtra",    phone: "98220 44567", category: "Vegetable", isOrganic: false, postedDaysAgo: 0 },
  { id: 8,  crop: "Grapes",           emoji: "🍇", quantity: 600,  unit: "kg",     price: 95,  seller: "Sujata Kale",    location: "Sangli",         state: "Maharashtra",    phone: "97300 55678", category: "Fruit",     isOrganic: true,  postedDaysAgo: 1 },
  // Andhra Pradesh
  { id: 9,  crop: "Chilli (Red)",     emoji: "🌶️",quantity: 700,  unit: "kg",     price: 140, seller: "Venkatesh Rao",  location: "Guntur",         state: "Andhra Pradesh", phone: "94401 66789", category: "Vegetable", isOrganic: false, postedDaysAgo: 2 },
  { id: 10, crop: "Mango (Alphonso)", emoji: "🥭", quantity: 300,  unit: "kg",     price: 180, seller: "Radha Krishna",  location: "Vijayawada",     state: "Andhra Pradesh", phone: "99890 77890", category: "Fruit",     isOrganic: true,  postedDaysAgo: 0 },
  // Karnataka
  { id: 11, crop: "Coffee (Arabica)", emoji: "☕", quantity: 200,  unit: "kg",     price: 350, seller: "Mahesh Gowda",   location: "Coorg",          state: "Karnataka",      phone: "98440 88901", category: "Grain",     isOrganic: true,  postedDaysAgo: 3 },
  { id: 12, crop: "Coconut",          emoji: "🥥", quantity: 500,  unit: "dozen",  price: 40,  seller: "Lakshmi Narayana",location: "Tumkur",        state: "Karnataka",      phone: "97420 99012", category: "Fruit",     isOrganic: false, postedDaysAgo: 1 },
  // Tamil Nadu
  { id: 13, crop: "Banana (Nendran)", emoji: "🍌", quantity: 400,  unit: "dozen",  price: 48,  seller: "Murugesan P.",   location: "Thanjavur",      state: "Tamil Nadu",     phone: "98430 10123", category: "Fruit",     isOrganic: true,  postedDaysAgo: 0 },
  { id: 14, crop: "Turmeric",         emoji: "🟡", quantity: 500,  unit: "kg",     price: 120, seller: "Selvaraj M.",    location: "Erode",          state: "Tamil Nadu",     phone: "95000 21234", category: "Vegetable", isOrganic: false, postedDaysAgo: 2 },
  // Madhya Pradesh
  { id: 15, crop: "Soybean",          emoji: "🫘", quantity: 1200, unit: "kg",     price: 45,  seller: "Bhagwandas Jain",location: "Indore",         state: "Madhya Pradesh", phone: "98260 32345", category: "Grain",     isOrganic: false, postedDaysAgo: 1 },
  { id: 16, crop: "Garlic",           emoji: "🧄", quantity: 600,  unit: "kg",     price: 90,  seller: "Sunita Patidar", location: "Mandsaur",       state: "Madhya Pradesh", phone: "94250 43456", category: "Vegetable", isOrganic: false, postedDaysAgo: 4 },
  // Rajasthan
  { id: 17, crop: "Bajra (Pearl Millet)",emoji:"🌾",quantity: 900, unit: "kg",     price: 22,  seller: "Manohar Meena",  location: "Jaipur",         state: "Rajasthan",      phone: "98290 54567", category: "Grain",     isOrganic: false, postedDaysAgo: 2 },
  { id: 18, crop: "Cumin (Jeera)",    emoji: "🌿", quantity: 300,  unit: "kg",     price: 220, seller: "Hemant Sharma",  location: "Jodhpur",        state: "Rajasthan",      phone: "97290 65678", category: "Vegetable", isOrganic: true,  postedDaysAgo: 0 },
  // Gujarat
  { id: 19, crop: "Groundnut",        emoji: "🥜", quantity: 1000, unit: "kg",     price: 65,  seller: "Naresh Patel",   location: "Rajkot",         state: "Gujarat",        phone: "99090 76789", category: "Grain",     isOrganic: false, postedDaysAgo: 1 },
  { id: 20, crop: "Cotton (Raw)",      emoji: "🌿", quantity: 2000, unit: "kg",     price: 62,  seller: "Ashaben Parmar", location: "Surat",          state: "Gujarat",        phone: "94270 87890", category: "Grain",     isOrganic: false, postedDaysAgo: 3 },
  // West Bengal
  { id: 21, crop: "Jute",             emoji: "🌿", quantity: 1500, unit: "kg",     price: 55,  seller: "Subrata Ghosh",  location: "Murshidabad",    state: "West Bengal",    phone: "98310 98901", category: "Grain",     isOrganic: false, postedDaysAgo: 2 },
  { id: 22, crop: "Hilsa Fish",        emoji: "🐟", quantity: 50,   unit: "kg",     price: 900, seller: "Tapas Mandal",   location: "Kolkata",        state: "West Bengal",    phone: "97310 09012", category: "Vegetable", isOrganic: true,  postedDaysAgo: 0 },
  // Himachal Pradesh
  { id: 23, crop: "Apple",            emoji: "🍎", quantity: 400,  unit: "kg",     price: 130, seller: "Deepak Thakur",  location: "Shimla",         state: "Himachal Pradesh",phone: "98160 11345", category: "Fruit",     isOrganic: true,  postedDaysAgo: 1 },
  // Kerala
  { id: 24, crop: "Black Pepper",     emoji: "⚫", quantity: 150,  unit: "kg",     price: 450, seller: "Rajan Nair",     location: "Wayanad",        state: "Kerala",         phone: "94470 22456", category: "Vegetable", isOrganic: true,  postedDaysAgo: 2 },
];

// All Indian states present in listings (for state filter)
const ALL_STATES = ["All States", ...Array.from(new Set(LISTINGS.map((l) => l.state))).sort()];
const CATEGORIES = ["All", "Grain", "Vegetable", "Fruit"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stateFilter, setStateFilter] = useState("All States");
  const [showPostForm, setShowPostForm] = useState(false);
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [form, setForm] = useState({ crop: "", quantity: "", price: "", location: "", state: "", phone: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = LISTINGS.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = l.crop.toLowerCase().includes(q)
      || l.location.toLowerCase().includes(q)
      || l.state.toLowerCase().includes(q)
      || l.seller.toLowerCase().includes(q);
    const matchCat = category === "All" || l.category === category;
    const matchState = stateFilter === "All States" || l.state === stateFilter;
    return matchSearch && matchCat && matchState;
  });

  const handlePost = (e: React.FormEvent) => {
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
    setFormErrors({});
    setShowPostForm(false);
    setForm({ crop: "", quantity: "", price: "", location: "", state: "", phone: "" });
    toast.success("✅ Listing posted! Buyers can now find your produce.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              Farmer Marketplace
            </h1>
            <p className="text-sm text-muted-foreground">All-India direct farm-to-consumer produce listings 🇮🇳</p>
          </div>
        </div>
        <button
          onClick={() => setShowPostForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Post Listing
        </button>
      </div>

      {/* Search, State & Category Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search crop, city, state or seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* State filter dropdown */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[150px]"
          >
            {ALL_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {/* Category pills */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl w-fit">
          <Filter className="h-4 w-4 text-muted-foreground ml-2" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-all font-medium",
                category === cat ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span> listings found
        <span>·</span>
        <Leaf className="h-4 w-4 text-green-600 inline" /> {filtered.filter(l => l.isOrganic).length} organic
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((listing) => (
          <div key={listing.id} className="glass-card gradient-border rounded-2xl hover:shadow-lg transition-all duration-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{listing.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{listing.crop}</h3>
                    {listing.isOrganic && (
                      <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                        Organic
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {listing.location},
                    <span className="font-medium text-foreground/70">{listing.state}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-700">₹{listing.price}</p>
                <p className="text-xs text-muted-foreground">per {listing.unit}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
              <div>
                <p className="text-sm font-medium">{listing.seller}</p>
                <p className="text-xs text-muted-foreground">
                  {listing.quantity} {listing.unit} available ·{" "}
                  {listing.postedDaysAgo === 0 ? "Today" : `${listing.postedDaysAgo}d ago`}
                </p>
              </div>
              <button
                onClick={() => setContactListing(listing)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium"
              >
                <Phone className="h-3.5 w-3.5" /> Contact
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No listings match your search.</p>
        </div>
      )}

      {/* Contact Modal */}
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
              <p className="text-xs text-muted-foreground mt-1">Call or WhatsApp to negotiate directly</p>
            </div>
            <a
              href={`https://wa.me/91${contactListing.phone.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setContactListing(null)}
              className="mt-4 block w-full py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl font-medium text-sm transition-colors text-center"
            >
              Open in WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Post Listing Modal */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-96">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Post a Listing</h2>
              <button onClick={() => setShowPostForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePost} className="space-y-3">
              {[
                { label: "Crop Name", key: "crop", placeholder: "e.g., Tomatoes" },
                { label: "Quantity (kg/dozen)", key: "quantity", placeholder: "e.g., 200" },
                { label: "Price per unit (₹)", key: "price", placeholder: "e.g., 25" },
                { label: "City / District", key: "location", placeholder: "e.g., Nashik" },
                { label: "State", key: "state", placeholder: "e.g., Maharashtra" },
                { label: "Phone Number", key: "phone", placeholder: "e.g., 98765 43210" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setFormErrors((err) => ({ ...err, [key]: "" })); }}
                    className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background ${
                      formErrors[key] ? "border-red-400 focus:ring-red-300" : "border-input"
                    }`}
                  />
                  {formErrors[key] && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors[key]}
                    </p>
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors mt-2"
              >
                Post Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
