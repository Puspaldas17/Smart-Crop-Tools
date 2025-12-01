import { RequestHandler } from "express";
import { Farmer, AdvisoryHistory } from "../db";

export const saveAdvisoryHistory: RequestHandler = async (req, res) => {
  try {
    const { farmerId, crop, advisory, weatherData, soilData } = req.body;
    
    if (!farmerId || !crop || !advisory) {
      return res.status(400).json({ error: "farmerId, crop, and advisory are required" });
    }

    const history = await (AdvisoryHistory as any).create({
      farmerId,
      crop,
      advisory,
      weatherData,
      soilData,
    });

    res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save advisory" });
  }
};

export const getAdvisoryHistory: RequestHandler = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const limit = Number(req.query.limit || 10);

    if (!farmerId) {
      return res.status(400).json({ error: "farmerId is required" });
    }

    let histories: any[] = [];
    if ((AdvisoryHistory as any).find) {
      histories = await (AdvisoryHistory as any).find({ farmerId });
    } else {
      histories = [];
    }

    const sorted = histories
      .sort((a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      .slice(0, limit);

    res.json(sorted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

export const getProfileData: RequestHandler = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!farmerId) {
      return res.status(400).json({ error: "farmerId is required" });
    }

    const farmer = await (Farmer as any).findById?.(farmerId);
    
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json({
      ...farmer,
      subscriptionStatus: farmer.subscriptionStatus || "free",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateSubscription: RequestHandler = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { subscriptionStatus } = req.body;

    if (!farmerId) {
      return res.status(400).json({ error: "farmerId is required" });
    }

    if (!["free", "premium"].includes(subscriptionStatus)) {
      return res.status(400).json({ error: "Invalid subscription status" });
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const farmer = await (Farmer as any).findOneAndUpdate(
      { _id: farmerId },
      {
        subscriptionStatus,
        subscriptionStartDate: now,
        subscriptionEndDate: subscriptionStatus === "premium" ? endDate : undefined,
      },
      { new: true, upsert: false }
    );

    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(farmer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};
