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
