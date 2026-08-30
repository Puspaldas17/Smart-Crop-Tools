import { RequestHandler } from "express";
import { SystemAlert } from "../db";

export const getActiveAlerts: RequestHandler = async (req, res) => {
  try {
    const alerts = await SystemAlert.find({ active: true });
    res.json(alerts);
  } catch (e) {
    console.error("[alerts] Error fetching alerts:", e);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

export const createAlert: RequestHandler = async (req, res) => {
  try {
    const { message, type } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const alert = await SystemAlert.create({
      message,
      type: type || 'info',
      active: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24h expiration
    });

    res.status(201).json(alert);
  } catch (e) {
    console.error("[alerts] Error creating alert:", e);
    res.status(500).json({ error: "Failed to create alert" });
  }
};

export const deleteAlert: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    if (SystemAlert.deleteOne) {
      await SystemAlert.deleteOne({ _id: id });
    } else if (SystemAlert.items) {
      SystemAlert.items = SystemAlert.items.filter((a: any) => String(a._id) !== String(id));
    }
    res.json({ success: true });
  } catch (e) {
    console.error("[alerts] Error deleting:", e);
    res.status(500).json({ error: "Failed to delete alert" });
  }
};
