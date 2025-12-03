import { RequestHandler } from "express";
import { supabase } from "../supabase";

export const createFarmer: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("farmers")
      .insert(req.body)
      .select()
      .single();

    if (error) {
      console.error("[farmers] Error creating farmer:", error);
      return res.status(400).json({ error: "Invalid farmer data" });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error("[farmers] Error:", e);
    res.status(400).json({ error: "Invalid farmer data" });
  }
};

export const getFarmer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("farmers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(data);
  } catch (e) {
    console.error("[farmers] Error:", e);
    res.status(400).json({ error: "Invalid id" });
  }
};
