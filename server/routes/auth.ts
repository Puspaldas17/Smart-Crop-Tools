import { RequestHandler } from "express";
import { Farmer } from "../db";

export const upsertFarmer: RequestHandler = async (req, res) => {
  try {
    const { name, phone, soilType, landSize, language, location } =
      req.body as any;
    if (!name || !phone)
      return res.status(400).json({ error: "name and phone required" });

    // Helper to standardise the update/create payload
    const updateData = {
      name,
      phone,
      soilType,
      landSize,
      language,
      location,
    };

    // Try to find and update, or create if not exists
    // new: true returns the modified document rather than the original
    // upsert: true creates the object if it doesn't exist.
    const data = await Farmer.findOneAndUpdate(
      { phone },
      updateData,
      { new: true, upsert: true }
    );

    res.json(data);
  } catch (e) {
    console.error("[auth] Unexpected error:", e);
    res.status(500).json({ error: "auth error" });
  }
};

export const guestLogin: RequestHandler = async (req, res) => {
  try {
    const guest = {
      id: "guest_" + Date.now(),
      name: "Guest User",
      phone: undefined,
      language: req.body?.language || "en-IN",
      isGuest: true,
    };
    return res.status(200).json(guest);
  } catch (e) {
    console.error("Guest login error:", e);
    return res.status(500).json({ error: "guest login error" });
  }
};
