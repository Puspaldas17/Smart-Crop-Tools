import { RequestHandler } from "express";
import { supabase } from "../supabase";

export const saveAdvisoryHistory: RequestHandler = async (req, res) => {
  try {
    const { farmerId, crop, advisory, weatherData, soilData } = req.body;

    if (!farmerId || !crop || !advisory) {
      return res
        .status(400)
        .json({ error: "farmerId, crop, and advisory are required" });
    }

    const { data, error } = await supabase
      .from("advisory_histories")
      .insert({
        farmer_id: farmerId,
        crop,
        advisory,
        weather_data: weatherData,
        soil_data: soilData,
      })
      .select()
      .single();

    if (error) {
      console.error("[profile] Error saving advisory history:", error);
      return res.status(500).json({ error: "Failed to save advisory" });
    }

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

    const { data, error } = await supabase
      .from("advisory_histories")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[profile] Error fetching history:", error);
      return res.status(500).json({ error: "Failed to fetch history" });
    }

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

    const { data, error } = await supabase
      .from("farmers")
      .select("*")
      .eq("id", farmerId)
      .single();

    if (error || !data) {
      console.error("[profile] Error fetching farmer:", error);
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json({
      ...data,
      subscriptionStatus: data.subscription_status || "free",
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
      subscription_status: subscriptionStatus,
      subscription_start_date: now,
    };

    if (subscriptionStatus === "premium") {
      updatePayload.subscription_end_date = endDate;
    }

    const { data, error } = await supabase
      .from("farmers")
      .update(updatePayload)
      .eq("id", farmerId)
      .select()
      .single();

    if (error || !data) {
      console.error("[profile] Error updating subscription:", error);
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(data);
  } catch (e) {
    console.error("[profile] Error:", e);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};
