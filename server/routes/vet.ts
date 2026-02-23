import { RequestHandler } from "express";
import { Farmer, Consultation, VetAdvisory } from "../db";

// ─── GET /api/vet/farmers ─────────────────────────────────────────────────────
// Returns all farmers (role=farmer) so vet can browse their patient list
export const getVetFarmers: RequestHandler = async (_req, res) => {
  try {
    const farmers = (await Farmer.find({})) as any[];
    const farmerList = farmers
      .filter((f) => f.role === "farmer" || !f.role)
      .map((f) => ({
        _id: f._id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        soilType: f.soilType,
        landSize: f.landSize,
        subscriptionStatus: f.subscriptionStatus || "free",
        createdAt: f.createdAt,
      }));
    res.json(farmerList);
  } catch (e) {
    console.error("[vet] getVetFarmers:", e);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};

// ─── GET /api/vet/consultations ───────────────────────────────────────────────
// Returns all consultations (vet sees everything; filtered by ?status=)
export const getVetConsultations: RequestHandler = async (req, res) => {
  try {
    const { status } = req.query as Record<string, string>;
    let consultations = (await Consultation.find({})) as any[];
    if (status && status !== "all") {
      consultations = consultations.filter((c) => c.status === status);
    }
    // Enrich with farmer name
    const farmers = (await Farmer.find({})) as any[];
    const farmerMap: Record<string, string> = {};
    farmers.forEach((f) => { farmerMap[String(f._id)] = f.name; });

    const enriched = consultations.map((c) => ({
      ...c,
      farmerName: farmerMap[String(c.farmerId)] || "Unknown Farmer",
    }));
    // Newest first
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(enriched);
  } catch (e) {
    console.error("[vet] getVetConsultations:", e);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
};

// ─── PATCH /api/vet/consultations/:id ────────────────────────────────────────
// Vet approves or rejects a consultation and optionally adds a note
export const updateConsultation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vetNote, vetId } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be approved or rejected" });
    }
    const updated = await Consultation.findOneAndUpdate(
      { _id: id },
      { status, vetNote: vetNote || "", vetId: vetId || null, updatedAt: new Date() },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "Consultation not found" });
    res.json({ ok: true, consultation: updated });
  } catch (e) {
    console.error("[vet] updateConsultation:", e);
    res.status(500).json({ error: "Failed to update consultation" });
  }
};

// ─── POST /api/vet/advisory ───────────────────────────────────────────────────
// Vet writes an advisory — either for a specific farmer or broadcast to all
export const createVetAdvisory: RequestHandler = async (req, res) => {
  try {
    const { vetId, farmerId, title, body, crop, targetRole } = req.body;
    if (!vetId || !title || !body) {
      return res.status(400).json({ error: "vetId, title and body are required" });
    }
    const advisory = await VetAdvisory.create({
      vetId,
      farmerId: farmerId || null,
      title,
      body,
      crop: crop || "",
      targetRole: targetRole || "all",
    });
    res.status(201).json({ ok: true, advisory });
  } catch (e) {
    console.error("[vet] createVetAdvisory:", e);
    res.status(500).json({ error: "Failed to create advisory" });
  }
};

// ─── GET /api/vet/advisories ──────────────────────────────────────────────────
// Returns all vet advisories (optionally filter by ?vetId=)
export const getVetAdvisories: RequestHandler = async (req, res) => {
  try {
    const { vetId } = req.query as Record<string, string>;
    let advisories = (await VetAdvisory.find({})) as any[];
    if (vetId) advisories = advisories.filter((a) => String(a.vetId) === vetId);
    // Enrich with vet name
    const farmers = (await Farmer.find({})) as any[];
    const farmerMap: Record<string, string> = {};
    farmers.forEach((f) => { farmerMap[String(f._id)] = f.name; });
    const enriched = advisories.map((a) => ({
      ...a,
      vetName: farmerMap[String(a.vetId)] || "Unknown Vet",
      farmerName: a.farmerId ? (farmerMap[String(a.farmerId)] || "Unknown") : "All Farmers",
    }));
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(enriched);
  } catch (e) {
    console.error("[vet] getVetAdvisories:", e);
    res.status(500).json({ error: "Failed to fetch advisories" });
  }
};
