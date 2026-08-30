import { RequestHandler } from "express";
import { Farmer } from "../db";

export const createFarmer: RequestHandler = async (req, res) => {
  try {
    const data = await Farmer.create(req.body);
    res.status(201).json(data);
  } catch (e) {
    console.error("[farmers] Error:", e);
    res.status(400).json({ error: "Invalid farmer data" });
  }
};

export const getFarmer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Farmer.findById(id);

    if (!data) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(data);
  } catch (e) {
    console.error("[farmers] Error:", e);
    res.status(400).json({ error: "Invalid id" });
  }
};

export const getAllFarmers: RequestHandler = async (req, res) => {
  try {
    const data = await Farmer.find({});
    res.json(data);
  } catch (e) {
    console.error("[farmers] Error:", e);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};

export const deleteFarmer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    // Note: InMemoryCollection needs a delete method, or we handle it gracefully if missing
    if (Farmer.deleteOne) {
      await Farmer.deleteOne({ _id: id });
    } else if (Farmer.items) {
      // In-memory hack for now
      Farmer.items = Farmer.items.filter((f: any) => String(f._id) !== String(id));
    }
    res.json({ success: true });
  } catch (e) {
    console.error("[farmers] Error deleting:", e);
    res.status(500).json({ error: "Failed to delete farmer" });
  }
};

export const updateFarmerStatus: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // "suspend", "activate", "premium"
  
  try {
    const farmer = await Farmer.findById(id);
    if (!farmer) return res.status(404).json({ error: "Not found" });
    
    let update: any = {};
    if (action === "suspend") update = { role: "suspended" };
    if (action === "activate") update = { role: "farmer" };
    if (action === "premium") {
      update = { 
        subscriptionStatus: "premium", 
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
      };
    }

    await Farmer.findOneAndUpdate({ _id: id }, update);
    res.json({ success: true });
  } catch (e) {
    console.error("[farmers] Error updating:", e);
    res.status(500).json({ error: "Failed to update farmer" });
  }
};
