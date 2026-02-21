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
  location: string;
  phone: string;
  category: string;
  isOrganic: boolean;
  postedDaysAgo: number;
}

const LISTINGS: Listing[] = [
  { id: 1, crop: "Wheat", emoji: "🌾", quantity: 500, unit: "kg", price: 28, seller: "Ramesh Patel", location: "Bhubaneswar", phone: "98765 43210", category: "Grain", isOrganic: false, postedDaysAgo: 1 },
  { id: 2, crop: "Tomatoes", emoji: "🍅", quantity: 200, unit: "kg", price: 22, seller: "Anita Devi", location: "Cuttack", phone: "91234 56789", category: "Vegetable", isOrganic: true, postedDaysAgo: 0 },
  { id: 3, crop: "Rice (Basmati)", emoji: "🍚", quantity: 1000, unit: "kg", price: 60, seller: "Suresh Kumar", location: "Puri", phone: "97890 12345", category: "Grain", isOrganic: true, postedDaysAgo: 2 },
  { id: 4, crop: "Onion", emoji: "🧅", quantity: 800, unit: "kg", price: 18, seller: "Mohan Das", location: "Sambalpur", phone: "94567 89012", category: "Vegetable", isOrganic: false, postedDaysAgo: 3 },
  { id: 5, crop: "Mango", emoji: "🥭", quantity: 150, unit: "kg", price: 80, seller: "Priya Sharma", location: "Berhampur", phone: "98001 23456", category: "Fruit", isOrganic: true, postedDaysAgo: 0 },
  { id: 6, crop: "Potato", emoji: "🥔", quantity: 600, unit: "kg", price: 14, seller: "Vikram Singh", location: "Rourkela", phone: "99887 76543", category: "Vegetable", isOrganic: false, postedDaysAgo: 4 },
  { id: 7, crop: "Maize", emoji: "🌽", quantity: 400, unit: "kg", price: 20, seller: "Geeta Bai", location: "Balasore", phone: "93456 78901", category: "Grain", isOrganic: false, postedDaysAgo: 1 },
  { id: 8, crop: "Banana", emoji: "🍌", quantity: 300, unit: "dozen", price: 35, seller: "Ravi Nair", location: "Puri", phone: "92345 67890", category: "Fruit", isOrganic: true, postedDaysAgo: 2 },
];

const CATEGORIES = ["All", "Grain", "Vegetable", "Fruit"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showPostForm, setShowPostForm] = useState(false);
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [form, setForm] = useState({ crop: "", quantity: "", price: "", location: "", phone: "" });

  const filtered = LISTINGS.filter((l) => {
    const matchSearch = l.crop.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || l.category === category;
    return matchSearch && matchCat;
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPostForm(false);
    setForm({ crop: "", quantity: "", price: "", location: "", phone: "" });
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
            <p className="text-sm text-muted-foreground">Direct farm-to-consumer produce listings</p>
          </div>
        </div>
        <button
          onClick={() => setShowPostForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Post Listing
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search crop or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl">
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
          <div key={listing.id} className="rounded-2xl border border-border bg-card hover:shadow-md transition-all p-4">
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
                    <MapPin className="h-3 w-3" /> {listing.location}
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
                { label: "Your Location", key: "location", placeholder: "e.g., Bhubaneswar" },
                { label: "Phone Number", key: "phone", placeholder: "e.g., 98765 43210" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    required
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
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
