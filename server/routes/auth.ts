import { RequestHandler } from "express";
import { Farmer } from "../db";

export const upsertFarmer: RequestHandler = async (req, res) => {
  try {
    const { name, phone, soilType, landSize, language, location } =
      req.body as any;
    if (!name || !phone)
      return res.status(400).json({ error: "name and phone required" });

    const farmer = await (Farmer as any).findOneAndUpdate(
      { phone },
      {
        $setOnInsert: { createdAt: new Date() },
        name,
        phone,
        soilType,
        landSize,
        language,
        location,
      },
      { new: true, upsert: true },
    );

    res.json(farmer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "auth error" });
  }
};

export const guestLogin: RequestHandler = async (req, res) => {
  try {
    const language = req.body?.language || "en-IN";
    const guest = {
      _id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: "Guest User",
      language,
      isGuest: true,
      createdAt: new Date(),
    };

    console.log("[auth] Guest login successful:", guest._id);
    res.status(200).json(guest);
  } catch (err) {
    console.error("[auth] Guest login error:", err);
    res.status(500).json({
      error: "guest login error",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
