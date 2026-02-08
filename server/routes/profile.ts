import { RequestHandler } from "express";
import { AdvisoryHistory, Farmer } from "../db";

export const saveAdvisoryHistory: RequestHandler = async (req, res) => {
  try {
    const { farmerId, crop, advisory, weatherData, soilData } = req.body;

    if (!farmerId || !crop || !advisory) {
      return res
        .status(400)
        .json({ error: "farmerId, crop, and advisory are required" });
    }

    const data = await AdvisoryHistory.create({
      farmerId,
      crop,
      advisory,
      weatherData,
      soilData,
    });

    res.json(data);
  } catch (e) {
    console.error("[profile] Error:", e);
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

    const data = await AdvisoryHistory.find({ farmerId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(data || []);
  } catch (e) {
    console.error("[profile] Error:", e);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

export const getProfileData: RequestHandler = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!farmerId) {
      return res.status(400).json({ error: "farmerId is required" });
    }

    const data = await Farmer.findById(farmerId);

    if (!data) {
      console.error("[profile] Farmer not found");
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json({
      ...data,
      subscriptionStatus: data.subscriptionStatus || "free",
    });
  } catch (e) {
    console.error("[profile] Error:", e);
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

    const updatePayload: any = {
      subscriptionStatus,
      subscriptionStartDate: now,
    };

    if (subscriptionStatus === "premium") {
      updatePayload.subscriptionEndDate = endDate;
    }

    const data = await Farmer.findByIdAndUpdate(farmerId, updatePayload, {
      new: true,
    });

    if (!data) {
      console.error("[profile] Farmer not found");
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(data);
  } catch (e) {
    console.error("[profile] Error:", e);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};
