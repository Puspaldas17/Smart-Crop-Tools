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

    return res.json(farmer);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "auth error" });
  }
};

export const guestLogin: RequestHandler = async (req, res) => {
  try {
    const guest = {
      _id: "guest_" + Date.now(),
      name: "Guest User",
      phone: "",
      soilType: undefined,
      landSize: 0,
      language: req.body?.language || "en-IN",
      isGuest: true,
      subscriptionStatus: "free" as const,
    };
    return res.status(200).json(guest);
  } catch (e) {
    console.error("Guest login error:", e);
    return res.status(500).json({ error: "guest login error" });
  }
};
