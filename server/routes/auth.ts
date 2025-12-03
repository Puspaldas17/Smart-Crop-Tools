import { RequestHandler } from "express";
import { supabase } from "../supabase";

export const upsertFarmer: RequestHandler = async (req, res) => {
  try {
    const { name, phone, soilType, landSize, language, location } =
      req.body as any;
    if (!name || !phone)
      return res.status(400).json({ error: "name and phone required" });

    const { data: existing } = await supabase
      .from("farmers")
      .select("*")
      .eq("phone", phone)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("farmers")
        .update({
          name,
          soilType,
          landSize,
          language,
          location,
        })
        .eq("phone", phone)
        .select()
        .single();

      if (error) {
        console.error("[auth] Error updating farmer:", error);
        return res.status(500).json({ error: "auth error" });
      }

      return res.json(data);
    }

    const { data, error } = await supabase
      .from("farmers")
      .insert({
        name,
        phone,
        soilType,
        landSize,
        language,
        location,
      })
      .select()
      .single();

    if (error) {
      console.error("[auth] Error creating farmer:", error);
      return res.status(500).json({ error: "auth error" });
    }

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
      language: req.body?.language || "en-IN",
      isGuest: true,
    };
    return res.status(200).json(guest);
  } catch (e) {
    console.error("Guest login error:", e);
    return res.status(500).json({ error: "guest login error" });
  }
};
