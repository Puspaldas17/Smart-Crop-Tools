import { RequestHandler } from "express";
import { Farmer } from "../db";

export const createFarmer: RequestHandler = async (req, res) => {
  try {
    const farmer = await Farmer.create(req.body);
    res.status(201).json(farmer);
  } catch (e) {
    res.status(400).json({ error: "Invalid farmer data" });
  }
};

export const getFarmer: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const farmer = await Farmer.findById(id);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    res.json(farmer);
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
};
