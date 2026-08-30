import { useState } from "react";
import { Search, ExternalLink, CheckCircle2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Scheme {
  id: string;
  name: string;
  shortName: string;
  ministry: string;
  benefit: string;
  eligibility: string[];
  landLimit?: number; // max acres
  link: string;
  category: "subsidy" | "insurance" | "credit" | "market" | "welfare";
}

const SCHEMES: Scheme[] = [
  {
    id: "pmkisan",
    name: "Pradhan Mantri Kisan Samman Nidhi",
    shortName: "PM-KISAN",
    ministry: "Ministry of Agriculture",
    benefit: "₹6,000/year in 3 equal instalments directly to bank account",
    eligibility: ["Small/marginal farmer", "Own agricultural land", "Valid Aadhaar"],
    landLimit: 5,
    link: "https://pmkisan.gov.in",
    category: "welfare",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortName: "PMFBY",
    ministry: "Ministry of Agriculture",
    benefit: "Crop insurance covering natural calamities, pests & disease",
    eligibility: ["All farmers growing notified crops", "Applicable kharif/rabi season", "Loan farmers mandatorily covered"],
    link: "https://pmfby.gov.in",
    category: "insurance",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    shortName: "KCC",
    ministry: "Ministry of Finance",
    benefit: "Revolving credit up to ₹3 lakh at subsidised 4% interest rate",
    eligibility: ["All farmers, tenant farmers, sharecroppers", "Valid land records", "No default history in past 3 years"],
    link: "https://www.india.gov.in/spotlight/kisan-credit-card",
    category: "credit",
  },
  {
    id: "enam",
    name: "National Agriculture Market",
    shortName: "eNAM",
    ministry: "Ministry of Agriculture",
    benefit: "Online commodity trading across 1000+ mandis; better price discovery",
    eligibility: ["Registered farmer with Aadhaar", "Commodity available in your mandi", "Bank account linked"],
    link: "https://enam.gov.in",
    category: "market",
  },
  {
    id: "atma",
    name: "Agricultural Technology Management Agency",
    shortName: "ATMA",
    ministry: "State Agriculture Departments",
    benefit: "Free training, farm school, demonstration plots, exposure visits",
    eligibility: ["All farming households", "Priority to SC/ST/women farmers"],
    link: "https://atma-india.net",
    category: "welfare",
  },
  {
    id: "rkvy",
    name: "Rashtriya Krishi Vikas Yojana",
    shortName: "RKVY",
    ministry: "Ministry of Agriculture",
    benefit: "Subsidies on farm machinery, infrastructure, horticulture development",
    eligibility: ["Farmers in supported districts", "Via District Agriculture Office"],
    link: "https://rkvy.nic.in",
    category: "subsidy",
  },
  {
    id: "nfsm",
    name: "National Food Security Mission",
    shortName: "NFSM",
    ministry: "Ministry of Agriculture",
    benefit: "Subsidised HYV seeds, micronutrients, farm implements for rice/wheat/pulses",
    eligibility: ["Farmers in NFSM district", "Target crops only"],
    link: "https://nfsm.gov.in",
    category: "subsidy",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  subsidy:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  insurance: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  credit:    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  market:    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  welfare:   "bg-green-500/20 text-green-400 border-green-500/30",
};

export function SchemesFinder({ landSize }: { landSize?: number }) {
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = SCHEMES.filter((s) => {
    const matchQuery =
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.shortName.toLowerCase().includes(query.toLowerCase()) ||
      s.benefit.toLowerCase().includes(query.toLowerCase());
    const matchCat = filterCat === "all" || s.category === filterCat;
    return matchQuery && matchCat;
  });

  // Check eligibility based on land size
  function isEligible(s: Scheme): boolean {
    if (!landSize || !s.landLimit) return true;
    return landSize <= s.landLimit;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          Government Scheme Finder
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          {landSize ? `Showing eligibility for your farm (${landSize} acres).` : "Search government schemes for Indian farmers."}
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search schemes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus:outline-none"
        >
          <option value="all">All Types</option>
          {Object.keys(CATEGORY_COLORS).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} scheme{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="space-y-2">
        {filtered.map((s) => {
          const eligible = isEligible(s);
          const expanded = expandedId === s.id;
          return (
            <div key={s.id} className={cn("glass-card border rounded-xl overflow-hidden transition-all", eligible ? "border-white/10" : "border-red-500/20")}>
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
                onClick={() => setExpandedId(expanded ? null : s.id)}
              >
                <div className="flex items-center gap-3">
                  {eligible ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-red-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{s.shortName}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", CATEGORY_COLORS[s.category])}>
                        {s.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.benefit}</p>
                  </div>
                </div>
                {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>

              {expanded && (
                <div className="px-4 pb-4 space-y-2 border-t border-white/5">
                  <p className="text-sm text-muted-foreground mt-3">{s.name}</p>
                  <p className="text-xs"><span className="text-muted-foreground">Ministry:</span> {s.ministry}</p>
                  <div>
                    <p className="text-xs font-medium mb-1">Eligibility:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {s.eligibility.map((e) => <li key={e} className="text-xs text-muted-foreground">{e}</li>)}
                    </ul>
                  </div>
                  {!eligible && s.landLimit && (
                    <p className="text-xs text-red-400">⚠️ Your farm ({landSize} acres) exceeds the {s.landLimit}-acre limit for this scheme.</p>
                  )}
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    Apply / Learn More <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
