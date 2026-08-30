import { RequestHandler } from "express";
import { Farmer, Appointment } from "../db";

// ─── GET /api/appointments ───────────────────────────────────────────────────
// Farmers see their own; vets/admins see all (filterable by ?vetId or ?farmerId)
export const getBookings: RequestHandler = async (req: any, res) => {
  try {
    const user = req.user;
    const all = (await Appointment.find({})) as any[];
    let relevant = all;

    if (user.role === "farmer") {
      relevant = all.filter((a) => String(a.farmerId) === user.id);
    } else if (req.query.farmerId) {
      relevant = all.filter((a) => String(a.farmerId) === req.query.farmerId);
    } else if (req.query.vetId) {
      relevant = all.filter((a) => String(a.vetId) === req.query.vetId);
    }

    // Enrich with names
    const farmers = (await Farmer.find({})) as any[];
    const nameMap: Record<string, string> = {};
    farmers.forEach((f) => { nameMap[String(f._id)] = f.name; });

    const enriched = relevant.map((a) => {
      const obj = typeof a.toObject === "function" ? a.toObject() : { ...a };
      return {
        ...obj,
        farmerName: nameMap[String(obj.farmerId)] || "Unknown Farmer",
        vetName: obj.vetId ? (nameMap[String(obj.vetId)] || "Unassigned Vet") : "Unassigned",
      };
    });
    enriched.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    res.json(enriched);
  } catch (e) {
    console.error("[appointments] getBookings:", e);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// ─── POST /api/appointments ──────────────────────────────────────────────────
export const createBooking: RequestHandler = async (req: any, res) => {
  try {
    const { farmerId, vetId, scheduledAt, reason, animalId } = req.body;
    if (!farmerId || !scheduledAt || !reason) {
      return res.status(400).json({ error: "farmerId, scheduledAt, and reason are required" });
    }

    // If vetId not provided, auto-assign first available vet
    let assignedVet = vetId;
    if (!assignedVet) {
      const farmers = (await Farmer.find({})) as any[];
      const vet = farmers.find((f) => f.role === "vet");
      assignedVet = vet?._id || null;
    }

    const booking = await Appointment.create({
      farmerId,
      vetId: assignedVet,
      scheduledAt: new Date(scheduledAt),
      reason,
      animalId: animalId || "",
      status: "pending",
    });
    res.status(201).json({ ok: true, booking });
  } catch (e) {
    console.error("[appointments] createBooking:", e);
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

// ─── PATCH /api/appointments/:id ─────────────────────────────────────────────
export const updateBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vetNote, scheduledAt } = req.body;
    const update: any = {};
    if (status) {
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      update.status = status;
    }
    if (vetNote !== undefined) update.vetNote = vetNote;
    if (scheduledAt) update.scheduledAt = new Date(scheduledAt);

    const result = await Appointment.findByIdAndUpdate(id, update, { new: true });
    if (!result) return res.status(404).json({ error: "Appointment not found" });
    res.json({ ok: true, appointment: result });
  } catch (e) {
    console.error("[appointments] updateBooking:", e);
    res.status(500).json({ error: "Failed to update appointment" });
  }
};
