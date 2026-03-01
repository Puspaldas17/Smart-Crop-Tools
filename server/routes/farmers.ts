import { RequestHandler } from "express";
import { Farmer, Consultation, VetAdvisory } from "../db";

export const createFarmer: RequestHandler = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone are required" });
    }
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
    if (!data) return res.status(404).json({ error: "Farmer not found" });
    res.json(data);
  } catch (e) {
    console.error("[farmers] Error:", e);
    res.status(400).json({ error: "Invalid id" });
  }
};

// ─── POST /api/farmers/consult ─────────────────────────────────────────────
// Farmer submits a vet consultation request
export const requestConsultation: RequestHandler = async (req, res) => {
  try {
    const { farmerId, animalId, disease, message } = req.body;
    if (!farmerId || !disease || !message) {
      return res.status(400).json({ error: "farmerId, disease and message are required" });
    }
    // Assign to first available vet (if any)
    const vets = (await Farmer.find({})) as any[];
    const vet = vets.find((f) => f.role === "vet");
    const consultation = await Consultation.create({
      farmerId,
      vetId: vet?._id || null,
      animalId: animalId || "",
      disease,
      message,
      status: "pending",
    });
    res.status(201).json({ ok: true, consultation });
  } catch (e) {
    console.error("[farmers] requestConsultation:", e);
    res.status(500).json({ error: "Failed to create consultation" });
  }
};

// ─── GET /api/farmers/:id/consultations ───────────────────────────────────
export const getFarmerConsultations: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const all = (await Consultation.find({})) as any[];
    const mine = all
      .filter((c) => String(c.farmerId) === id)
      .map((c) => (typeof c.toObject === "function" ? c.toObject() : { ...c }));
    mine.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(mine);
  } catch (e) {
    console.error("[farmers] getFarmerConsultations:", e);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
};

// ─── GET /api/farmers/:id/vet-advisories ───────────────────────────────────
// Returns advisories addressed to this farmer OR all farmers
export const getFarmerVetAdvisories: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const all = (await VetAdvisory.find({})) as any[];
    const relevant = all.filter(
      (a) => !a.farmerId || String(a.farmerId) === id,
    );
    // Enrich with vet name — convert to plain object first to get all fields
    const farmers = (await Farmer.find({})) as any[];
    const farmerMap: Record<string, string> = {};
    farmers.forEach((f) => { farmerMap[String(f._id)] = f.name; });
    const enriched = relevant.map((a) => {
      const obj = typeof a.toObject === "function" ? a.toObject() : { ...a };
      return {
        ...obj,
        vetName: farmerMap[String(obj.vetId)] || "Vet Officer",
      };
    });
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(enriched);
  } catch (e) {
    console.error("[farmers] getFarmerVetAdvisories:", e);
    res.status(500).json({ error: "Failed to fetch vet advisories" });
  }
};

