import { RequestHandler } from "express";
import { Farmer, Advisory, AdvisoryHistory, AnalyticsData, DrugLog, Block, Consultation, VetAdvisory } from "../db";
import bcrypt from "bcryptjs";

// ─── POST /api/admin/create-user ──────────────────────────────────────────────
export const createUser: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, password, role, soilType, landSize, language, subscriptionStatus } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    const existing = await Farmer.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "A user with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Farmer.create({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: role || "farmer",
      soilType: soilType || "",
      landSize: landSize ? Number(landSize) : undefined,
      language: language || "en-IN",
      subscriptionStatus: subscriptionStatus || "free",
    });

    // Return without password
    const plain = user.toObject ? user.toObject() : { ...user };
    delete plain.password;
    res.status(201).json({ ok: true, user: plain });
  } catch (e) {
    console.error("[admin] createUser error:", e);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// ─── POST /api/admin/seed ─────────────────────────────────────────────────────
// Creates default admin and vet accounts in MongoDB (idempotent)
export const seedDefaultUsers: RequestHandler = async (_req, res) => {
  try {
    const defaults = [
      {
        name: "Authority Admin",
        email: "admin@agriverse.in",
        phone: "0000000001",
        password: "Admin@1234",
        role: "admin",
        subscriptionStatus: "premium",
      },
      {
        name: "Dr. Vet Officer",
        email: "vet@agriverse.in",
        phone: "0000000002",
        password: "Vet@1234",
        role: "vet",
        subscriptionStatus: "premium",
      },
    ];

    const results: any[] = [];
    for (const u of defaults) {
      const existing = await Farmer.findOne({ email: u.email });
      if (existing) {
        results.push({ email: u.email, status: "already_exists", _id: existing._id });
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 10);
      const created = await Farmer.create({ ...u, password: hashed, language: "en-IN" });
      const plain = created.toObject ? created.toObject() : { ...created };
      delete plain.password;
      results.push({ email: u.email, status: "created", _id: plain._id });
    }

    res.json({ ok: true, results });
  } catch (e) {
    console.error("[admin] seed error:", e);
    res.status(500).json({ error: "Seed failed" });
  }
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function monthLabel(d: Date) {
  return d.toLocaleString("en-IN", { month: "short" });
}

function last6Months() {
  const result: { month: string; users: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    result.push({ month: monthLabel(d), users: 0 });
  }
  return result;
}

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
export const getAdminOverview: RequestHandler = async (_req, res) => {
  try {
    const allFarmers = await Farmer.find({});
    const farmers = (allFarmers as any[]) || [];

    const totalFarmers = farmers.length;
    const premiumCount = farmers.filter((f: any) => f.subscriptionStatus === "premium").length;
    const freeCount = totalFarmers - premiumCount;

    // Active today: registered in last 24h (proxy; real session tracking needs Redis)
    const yesterday = new Date(Date.now() - 86_400_000);
    const activeToday = farmers.filter((f: any) => new Date(f.createdAt) > yesterday).length;

    const totalAdvisories = await AdvisoryHistory.find({}).then((d: any[]) => d.length);
    const totalScans = await AnalyticsData.find({}).then((d: any[]) => d.length);

    // AMU active withdrawal periods
    const allLogs = await DrugLog.find({});
    const now = Date.now();
    const activeWithdrawals = (allLogs as any[]).filter((l: any) => {
      const ends = new Date(l.treatmentDate).getTime() + l.withdrawalDays * 86_400_000;
      return ends > now;
    }).length;

    // Adoption trend — count farmer registrations per month
    const trend = last6Months();
    farmers.forEach((f: any) => {
      const m = monthLabel(new Date(f.createdAt));
      const slot = trend.find((t) => t.month === m);
      if (slot) slot.users++;
    });
    // Running cumulative
    let cum = 0;
    const adoptionTrend = trend.map((t) => { cum += t.users; return { month: t.month, users: cum }; });

    // Disease distribution from AMU logs (drug name as proxy)
    const diseaseMap: Record<string, number> = {};
    (allLogs as any[]).forEach((l: any) => {
      diseaseMap[l.drugName] = (diseaseMap[l.drugName] || 0) + 1;
    });
    const diseaseDistribution = Object.entries(diseaseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, value]) => ({ name, value }));

    if (diseaseDistribution.length === 0) {
      diseaseDistribution.push(
        { name: "Leaf Blight", value: 45 },
        { name: "Yellow Rust", value: 25 },
        { name: "Aphids", value: 20 },
        { name: "Healthy", value: 10 },
      );
    }

    res.json({
      metrics: {
        totalFarmers,
        activeToday: Math.max(activeToday, farmers.length > 0 ? 1 : 0),
        totalAdvisories,
        totalScans,
        premiumCount,
        freeCount,
        activeWithdrawals,
        complianceRate: totalFarmers > 0
          ? ((totalFarmers - activeWithdrawals) / totalFarmers * 100).toFixed(1)
          : "100.0",
      },
      adoptionTrend,
      diseaseDistribution,
    });
  } catch (e) {
    console.error("[admin] overview error:", e);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
};

// ─── GET /api/admin/farmers ───────────────────────────────────────────────────
export const listFarmers: RequestHandler = async (req, res) => {
  try {
    const { role, status, q } = req.query as Record<string, string>;
    let farmers = (await Farmer.find({})) as any[];

    if (role && role !== "all") farmers = farmers.filter((f) => f.role === role);
    if (status && status !== "all") farmers = farmers.filter((f) => f.subscriptionStatus === status);
    if (q) {
      const lq = q.toLowerCase();
      farmers = farmers.filter((f) =>
        (f.name || "").toLowerCase().includes(lq) ||
        (f.email || "").toLowerCase().includes(lq) ||
        (f.phone || "").toLowerCase().includes(lq),
      );
    }

    res.json(
      farmers.map((f) => ({
        _id: f._id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        role: f.role || "farmer",
        subscriptionStatus: f.subscriptionStatus || "free",
        soilType: f.soilType,
        language: f.language,
        createdAt: f.createdAt,
      })),
    );
  } catch (e) {
    console.error("[admin] listFarmers error:", e);
    res.status(500).json({ error: "Failed to list farmers" });
  }
};

// ─── PATCH /api/admin/farmers/:id ────────────────────────────────────────────
export const updateFarmer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, subscriptionStatus } = req.body;
    const farmer = await Farmer.findById(id);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });

    const updated = await Farmer.findOneAndUpdate(
      { _id: id },
      { role, subscriptionStatus, updatedAt: new Date() },
      { new: true },
    );
    res.json(updated);
  } catch (e) {
    console.error("[admin] updateFarmer error:", e);
    res.status(500).json({ error: "Failed to update farmer" });
  }
};

// ─── DELETE /api/admin/farmers/:id ───────────────────────────────────────────
export const deleteFarmer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Farmer.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Farmer not found" });
    res.json({ ok: true, deleted: deleted._id });
  } catch (e) {
    console.error("[admin] deleteFarmer error:", e);
    res.status(500).json({ error: "Failed to delete farmer" });
  }
};

// ─── GET /api/admin/amu ───────────────────────────────────────────────────────
export const getAmuLedger: RequestHandler = async (_req, res) => {
  try {
    const logs = (await DrugLog.find({})) as any[];
    const blocks = (await Block.find({})) as any[];
    const now = Date.now();

    const enriched = logs.map((l) => {
      const withdrawalEnd = new Date(l.treatmentDate).getTime() + l.withdrawalDays * 86_400_000;
      const daysLeft = Math.ceil((withdrawalEnd - now) / 86_400_000);
      return {
        _id: l._id,
        animalId: l.animalId,
        drugName: l.drugName,
        dosage: l.dosage,
        withdrawalDays: l.withdrawalDays,
        applicator: l.applicator,
        treatmentDate: l.treatmentDate,
        status: daysLeft > 0 ? "active" : "cleared",
        daysLeft: Math.max(daysLeft, 0),
      };
    });

    res.json({ logs: enriched, chainLength: blocks.length });
  } catch (e) {
    console.error("[admin] amuLedger error:", e);
    res.status(500).json({ error: "Failed to fetch AMU ledger" });
  }
};

// ─── POST /api/admin/broadcast ────────────────────────────────────────────────
// Stores notification in memory (demo); in production would push via FCM/SMS
const broadcasts: Array<{ id: string; title: string; body: string; target: string; ts: string }> = [];

export const sendBroadcast: RequestHandler = async (req, res) => {
  try {
    const { title, body, target } = req.body;
    if (!title || !body) return res.status(400).json({ error: "title and body required" });
    const entry = { id: Date.now().toString(36), title, body, target: target || "all", ts: new Date().toISOString() };
    broadcasts.unshift(entry);
    res.json({ ok: true, broadcast: entry });
  } catch (e) {
    res.status(500).json({ error: "Failed to send broadcast" });
  }
};

export const getBroadcasts: RequestHandler = (_req, res) => {
  res.json(broadcasts.slice(0, 20));
};

// ─── GET /api/admin/consultations ────────────────────────────────────────────
export const getAdminConsultations: RequestHandler = async (_req, res) => {
  try {
    const all = (await Consultation.find({})) as any[];
    const farmers = (await Farmer.find({})) as any[];
    const farmerMap: Record<string, string> = {};
    farmers.forEach((f) => { farmerMap[String(f._id)] = f.name; });
    const enriched = all.map((c) => {
      const obj = typeof c.toObject === "function" ? c.toObject() : { ...c };
      return {
        ...obj,
        farmerName: farmerMap[String(obj.farmerId)] || "Unknown",
        vetName: obj.vetId ? (farmerMap[String(obj.vetId)] || "Unassigned") : "Unassigned",
      };
    });
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(enriched);
  } catch (e) {
    console.error("[admin] getAdminConsultations:", e);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
};

