import { Router, Request, Response } from "express";
import { Listing } from "../models/Listing";

const router = Router();

// ── Seed data (the 24 original listings) ─────────────────────────────────────
const SEED_LISTINGS = [
  { crop: "Rice (Basmati)",       emoji: "🍚", quantity: 1000, unit: "kg",    price: 60,  seller: "Suresh Kumar",     location: "Puri",          state: "Odisha",           phone: "97890 12345", category: "Grain",     isOrganic: true  },
  { crop: "Tomatoes",             emoji: "🍅", quantity: 200,  unit: "kg",    price: 22,  seller: "Anita Devi",       location: "Cuttack",       state: "Odisha",           phone: "91234 56789", category: "Vegetable", isOrganic: true  },
  { crop: "Wheat",                emoji: "🌾", quantity: 2000, unit: "kg",    price: 26,  seller: "Gurpreet Singh",   location: "Ludhiana",      state: "Punjab",           phone: "98140 33210", category: "Grain",     isOrganic: false },
  { crop: "Mustard",              emoji: "🌿", quantity: 800,  unit: "kg",    price: 55,  seller: "Harjit Kaur",      location: "Amritsar",      state: "Punjab",           phone: "98720 11234", category: "Grain",     isOrganic: false },
  { crop: "Potato",               emoji: "🥔", quantity: 3000, unit: "kg",    price: 12,  seller: "Rambharose Yadav", location: "Agra",          state: "Uttar Pradesh",    phone: "94156 78901", category: "Vegetable", isOrganic: false },
  { crop: "Sugarcane",            emoji: "🎋", quantity: 5000, unit: "kg",    price: 4,   seller: "Shyam Lal",        location: "Muzaffarnagar", state: "Uttar Pradesh",    phone: "99350 22345", category: "Grain",     isOrganic: false },
  { crop: "Onion",                emoji: "🧅", quantity: 1500, unit: "kg",    price: 20,  seller: "Pandurang Shinde", location: "Nashik",        state: "Maharashtra",      phone: "98220 44567", category: "Vegetable", isOrganic: false },
  { crop: "Grapes",               emoji: "🍇", quantity: 600,  unit: "kg",    price: 95,  seller: "Sujata Kale",      location: "Sangli",        state: "Maharashtra",      phone: "97300 55678", category: "Fruit",     isOrganic: true  },
  { crop: "Chilli (Red)",         emoji: "🌶️", quantity: 700,  unit: "kg",    price: 140, seller: "Venkatesh Rao",    location: "Guntur",        state: "Andhra Pradesh",   phone: "94401 66789", category: "Vegetable", isOrganic: false },
  { crop: "Mango (Alphonso)",     emoji: "🥭", quantity: 300,  unit: "kg",    price: 180, seller: "Radha Krishna",    location: "Vijayawada",    state: "Andhra Pradesh",   phone: "99890 77890", category: "Fruit",     isOrganic: true  },
  { crop: "Coffee (Arabica)",     emoji: "☕", quantity: 200,  unit: "kg",    price: 350, seller: "Mahesh Gowda",     location: "Coorg",         state: "Karnataka",        phone: "98440 88901", category: "Grain",     isOrganic: true  },
  { crop: "Coconut",              emoji: "🥥", quantity: 500,  unit: "dozen", price: 40,  seller: "Lakshmi Narayana", location: "Tumkur",        state: "Karnataka",        phone: "97420 99012", category: "Fruit",     isOrganic: false },
  { crop: "Banana (Nendran)",     emoji: "🍌", quantity: 400,  unit: "dozen", price: 48,  seller: "Murugesan P.",     location: "Thanjavur",     state: "Tamil Nadu",       phone: "98430 10123", category: "Fruit",     isOrganic: true  },
  { crop: "Turmeric",             emoji: "🟡", quantity: 500,  unit: "kg",    price: 120, seller: "Selvaraj M.",      location: "Erode",         state: "Tamil Nadu",       phone: "95000 21234", category: "Vegetable", isOrganic: false },
  { crop: "Soybean",              emoji: "🫘", quantity: 1200, unit: "kg",    price: 45,  seller: "Bhagwandas Jain",  location: "Indore",        state: "Madhya Pradesh",   phone: "98260 32345", category: "Grain",     isOrganic: false },
  { crop: "Garlic",               emoji: "🧄", quantity: 600,  unit: "kg",    price: 90,  seller: "Sunita Patidar",   location: "Mandsaur",      state: "Madhya Pradesh",   phone: "94250 43456", category: "Vegetable", isOrganic: false },
  { crop: "Bajra (Pearl Millet)", emoji: "🌾", quantity: 900,  unit: "kg",    price: 22,  seller: "Manohar Meena",    location: "Jaipur",        state: "Rajasthan",        phone: "98290 54567", category: "Grain",     isOrganic: false },
  { crop: "Cumin (Jeera)",        emoji: "🌿", quantity: 300,  unit: "kg",    price: 220, seller: "Hemant Sharma",    location: "Jodhpur",       state: "Rajasthan",        phone: "97290 65678", category: "Spice",     isOrganic: true  },
  { crop: "Groundnut",            emoji: "🥜", quantity: 1000, unit: "kg",    price: 65,  seller: "Naresh Patel",     location: "Rajkot",        state: "Gujarat",          phone: "99090 76789", category: "Pulse",     isOrganic: false },
  { crop: "Cotton (Raw)",         emoji: "🌿", quantity: 2000, unit: "kg",    price: 62,  seller: "Ashaben Parmar",   location: "Surat",         state: "Gujarat",          phone: "94270 87890", category: "Grain",     isOrganic: false },
  { crop: "Jute",                 emoji: "🌿", quantity: 1500, unit: "kg",    price: 55,  seller: "Subrata Ghosh",    location: "Murshidabad",   state: "West Bengal",      phone: "98310 98901", category: "Grain",     isOrganic: false },
  { crop: "Hilsa Fish",           emoji: "🐟", quantity: 50,   unit: "kg",    price: 900, seller: "Tapas Mandal",     location: "Kolkata",       state: "West Bengal",      phone: "97310 09012", category: "Other",     isOrganic: true  },
  { crop: "Apple",                emoji: "🍎", quantity: 400,  unit: "kg",    price: 130, seller: "Deepak Thakur",    location: "Shimla",        state: "Himachal Pradesh", phone: "98160 11345", category: "Fruit",     isOrganic: true  },
  { crop: "Black Pepper",         emoji: "⚫", quantity: 150,  unit: "kg",    price: 450, seller: "Rajan Nair",       location: "Wayanad",       state: "Kerala",           phone: "94470 22456", category: "Spice",     isOrganic: true  },
];

// ── GET /api/listings — fetch all with optional filters ───────────────────────
export async function getListings(req: Request, res: Response) {
  try {
    const { search = "", category, state } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (category && category !== "all" && category !== "All")
      query.category = category;
    if (state && state !== "All States")
      query.state = state;
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      query.$or = [{ crop: re }, { location: re }, { state: re }, { seller: re }];
    }

    const listings = await Listing.find(query as any).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/listings — create a new listing ─────────────────────────────────
export async function createListing(req: Request, res: Response) {
  try {
    const { crop, quantity, price, unit, location, state, phone, category, isOrganic, emoji, seller } = req.body;
    if (!crop || !quantity || !price || !location || !state || !phone)
      return res.status(400).json({ error: "Missing required fields" });

    const listing = await Listing.create({
      crop, quantity: Number(quantity), price: Number(price),
      unit: unit || "kg", location, state, phone,
      category: category || "Other",
      isOrganic: isOrganic === true || isOrganic === "true",
      emoji: emoji || "🌾",
      seller: seller || "Anonymous",
    });
    res.status(201).json(listing);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/listings/seed — seed the DB with the 24 original listings ────────
export async function seedListings(_req: Request, res: Response) {
  try {
    const count = await Listing.countDocuments();
    if (count > 0)
      return res.json({ message: `Already seeded — ${count} listings exist.` });
    await (Listing.insertMany as any)(SEED_LISTINGS);
    res.json({ message: `Seeded ${SEED_LISTINGS.length} listings successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export default router;
