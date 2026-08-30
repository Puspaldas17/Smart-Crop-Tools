import { RequestHandler } from "express";
import { Listing } from "../db";

export const getListings: RequestHandler = async (req, res) => {
  try {
    const { search, category, state } = req.query;
    const filter: any = {};

    if (category && category !== "All") filter.category = category;
    if (state && state !== "All States") filter.state = state;

    let query = Listing.find(filter).sort({ createdAt: -1 });
    
    // Execute query
    let results = await query;

    // In-memory sort/filter for search if needed since search is a simple text match
    if (search) {
      const s = String(search).toLowerCase();
      results = results.filter((item: any) => 
        item.crop.toLowerCase().includes(s) || 
        item.seller.toLowerCase().includes(s) ||
        item.location.toLowerCase().includes(s)
      );
    }

    res.json(results);
  } catch (e) {
    console.error("[listings] getListings error:", e);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

export const createListing: RequestHandler = async (req, res) => {
  try {
    const payload = req.body;
    
    // Minimal validation
    if (!payload.crop || !payload.price || !payload.seller || !payload.phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const data = await Listing.create(payload);
    res.status(201).json(data);
  } catch (e) {
    console.error("[listings] createListing error:", e);
    res.status(500).json({ error: "Failed to create listing" });
  }
};

export const seedListings: RequestHandler = async (req, res) => {
  try {
    const count = await Listing.countDocuments();
    if (count === 0) {
      const seedData = [
        { crop: "Tomatoes", emoji: "🍅", quantity: 50, unit: "kg", price: 40, seller: "Ramesh Kumar", location: "Pune", state: "Maharashtra", phone: "9876543210", category: "Vegetable", isOrganic: true },
        { crop: "Wheat", emoji: "🌾", quantity: 500, unit: "kg", price: 28, seller: "Suresh Singh", location: "Ludhiana", state: "Punjab", phone: "9876543211", category: "Grain", isOrganic: false },
        { crop: "Apples", emoji: "🍎", quantity: 100, unit: "kg", price: 120, seller: "Amit Sharma", location: "Shimla", state: "Himachal Pradesh", phone: "9876543212", category: "Fruit", isOrganic: true },
        { crop: "Onions", emoji: "🧅", quantity: 200, unit: "kg", price: 25, seller: "Vikram Patil", location: "Nashik", state: "Maharashtra", phone: "9876543213", category: "Vegetable", isOrganic: false },
        { crop: "Potatoes", emoji: "🥔", quantity: 300, unit: "kg", price: 20, seller: "Rahul Gupta", location: "Agra", state: "Uttar Pradesh", phone: "9876543214", category: "Vegetable", isOrganic: false },
      ];
      
      for (const item of seedData) {
        await Listing.create(item);
      }
      return res.json({ message: "Seeded listings successfully", count: seedData.length });
    }
    res.json({ message: "Listings already exist", count });
  } catch (e) {
    console.error("[listings] seed error:", e);
    res.status(500).json({ error: "Failed to seed listings" });
  }
};
