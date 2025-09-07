import { RequestHandler } from "express";
import { Farmer } from "../db";

export const upsertFarmer: RequestHandler = async (req, res) => {
  try {
    const { name, phone, soilType, landSize, language, location } =
      req.body as any;
    if (!name || !phone)
      return res.status(400).json({ error: "name and phone required" });

    const farmer = await Farmer.findOneAndUpdate(
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
