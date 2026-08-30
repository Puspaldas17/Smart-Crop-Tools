import "dotenv/config";
import mongoose from "mongoose";

// Disable buffering: operations fail immediately if not connected (no indefinite hang)
mongoose.set("bufferCommands", false);

console.log("[db] Loading db.ts. URI:", process.env.MONGODB_URI ? "set" : "not set");
const USE_MEMORY = !process.env.MONGODB_URI;
console.log("[db] USE_MEMORY:", USE_MEMORY);

type AnyDoc = Record<string, any> & {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

class InMemoryCollection<T extends AnyDoc> {
  private items: T[] = [];
  constructor(private name: string) { }

  private genId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
    ).toLowerCase();
  }

  async create(doc: Partial<T>): Promise<T> {
    const now = new Date();
    const out = {
      ...(doc as T),
      _id: this.genId(),
      createdAt: now,
      updatedAt: now,
    } as T;
    this.items.push(out);
    return structuredClone(out);
  }

  async findById(id: string): Promise<T | null> {
    const found = this.items.find((d) => String(d._id) === String(id));
    return found ? (structuredClone(found) as T) : null;
  }

  async countDocuments(filter: Partial<T> = {}): Promise<number> {
    const filtered = this.items.filter((d) =>
      Object.entries(filter).every(([k, v]) => (d as any)[k] === v)
    );
    return filtered.length;
  }

  find(filter: Partial<T>): any {
    const filtered = this.items
      .filter((d) =>
        Object.entries(filter).every(([k, v]) => (d as any)[k] === v),
      )
      .map((d) => structuredClone(d) as T);

    return {
      items: filtered,
      sort(criteria: Record<string, 1 | -1>) {
        const [key, order] = Object.entries(criteria)[0];
        this.items.sort((a: any, b: any) => {
          if (a[key] < b[key]) return order === 1 ? -1 : 1;
          if (a[key] > b[key]) return order === 1 ? 1 : -1;
          return 0;
        });
        return this;
      },
      limit(n: number) {
        this.items = this.items.slice(0, n);
        return this;
      },
      then(resolve: (value: T[]) => void) {
        resolve(this.items);
      },
    };
  }

  async findOneAndUpdate(
    filter: Partial<T>,
    update: any,
    options: { new?: boolean; upsert?: boolean } = {},
  ): Promise<T | null> {
    const match = this.items.find((d) =>
      Object.entries(filter).every(([k, v]) => (d as any)[k] === v),
    );

    const now = new Date();
    const applyUpdate = (base: T) => {
      const clone = { ...base } as T;
      const plain = Object.fromEntries(
        Object.entries(update).filter(([k]) => k !== "$setOnInsert"),
      );
      Object.assign(clone, plain);
      clone.updatedAt = now;
      return clone;
    };

    if (match) {
      const updated = applyUpdate(match);
      const idx = this.items.indexOf(match);
      this.items[idx] = updated;
      return structuredClone(updated) as T;
    }

    if (options.upsert) {
      const plain = Object.fromEntries(
        Object.entries(update || {}).filter(([k]) => k !== "$setOnInsert"),
      );
      const base: T = {
        ...(update?.$setOnInsert || {}),
        ...plain,
      } as T;

      const out = {
        ...base,
        _id: this.genId(),
        createdAt: (base as any).createdAt || now,
        updatedAt: now,
      } as T;
      this.items.push(out);
      return structuredClone(out);
    }

    return null;
  }
  async findOne(filter: Partial<T>): Promise<T | null> {
    const found = this.items.find((d) =>
      Object.entries(filter).every(([k, v]) => (d as any)[k] === v),
    );
    return found ? (structuredClone(found) as T) : null;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const idx = this.items.findIndex((d) => String(d._id) === String(id));
    if (idx === -1) return null;
    const [deleted] = this.items.splice(idx, 1);
    return structuredClone(deleted) as T;
  }

  async deleteOne(filter: Partial<T>): Promise<boolean> {
    const idx = this.items.findIndex((d) =>
      Object.entries(filter).every(([k, v]) => (d as any)[k] === v),
    );
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}

let _connected = false;

export async function connectDB(uri?: string) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("[db] MONGODB_URI not set. Using in-memory storage.");
    return null;
  }
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  // Try once quickly so we don't block server startup
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    _connected = true;
    console.log("[db] Connected to MongoDB Atlas ✓");
    return mongoose.connection;
  } catch (err: any) {
    console.warn("[db] Initial MongoDB connection failed:", err.message);
    console.warn("[db] Server will start in in-memory mode. Retrying in background...");
    // Retry in background without blocking the server
    retryInBackground(mongoUri);
    return null;
  }
}

function retryInBackground(mongoUri: string) {
  setTimeout(async () => {
    if (mongoose.connection.readyState === 1) return;
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
      _connected = true;
      console.log("[db] Background reconnect to MongoDB Atlas succeeded ✓");
    } catch (err: any) {
      console.warn("[db] Background reconnect failed, retrying in 30s...", err.message);
      retryInBackground(mongoUri);
    }
  }, 30000);
}


const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    phone: { type: String },
    soilType: { type: String },
    landSize: { type: Number },
    language: { type: String },
    location: {
      lat: Number,
      lon: Number,
      village: String,
      state: String,
    },
    role: {
      type: String,
      enum: ["farmer", "vet", "admin"],
      default: "farmer",
    },
    subscriptionStatus: {
      type: String,
      default: "free",
      enum: ["free", "premium"],
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
  },
  { timestamps: true },
);

const advisorySchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
    crop: String,
    summary: String,
    fertilizer: String,
    irrigation: String,
    pest: String,
    weather: Object,
    confidenceScore: Number,
    costBenefit: String,
    factors: [String],
    riskAlerts: [String],
    farmerFeedback: { type: String, enum: ['positive', 'negative'], default: null }
  },
  { timestamps: true },
);

const advisoryHistorySchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    crop: { type: String, required: true },
    advisory: { type: String, required: true },
    weatherData: mongoose.Schema.Types.Mixed,
    soilData: mongoose.Schema.Types.Mixed,
    confidenceScore: Number,
    costBenefit: String,
    factors: [String],
    riskAlerts: [String],
    farmerFeedback: { type: String, enum: ['positive', 'negative'], default: null }
  },
  { timestamps: true },
);

const analyticsDataSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    crop: { type: String, required: true },
    date: { type: Date, default: Date.now },
    cropHealthScore: { type: Number, min: 0, max: 100 },
    yield: { type: Number },
    soilMoisture: { type: Number, min: 0, max: 100 },
    soilNitrogen: { type: Number, min: 0, max: 100 },
    soilPH: { type: Number, min: 0, max: 14 },
    temperature: { type: Number },
    humidity: { type: Number, min: 0, max: 100 },
    rainfall: { type: Number },
    pestPressure: { type: Number, min: 0, max: 100 },
    diseaseRisk: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true },
);

// --- In-memory fallback instances (always created as backup) ---
const _inMemFarmer = new InMemoryCollection<any>("Farmer");
const _inMemAdvisory = new InMemoryCollection<any>("Advisory");
const _inMemAdvisoryHistory = new InMemoryCollection<any>("AdvisoryHistory");
const _inMemAnalyticsData = new InMemoryCollection<any>("AnalyticsData");
const _inMemDrugLog = new InMemoryCollection<any>("DrugLog");
const _inMemSystemAlert = new InMemoryCollection<any>("SystemAlert");
const _inMemBlock = new InMemoryCollection<any>("Block");

// --- Mongoose models (only created when URI is set) ---
const _mongoFarmer = USE_MEMORY ? null : (mongoose.models.Farmer || mongoose.model("Farmer", farmerSchema));
const _mongoAdvisory = USE_MEMORY ? null : (mongoose.models.Advisory || mongoose.model("Advisory", advisorySchema));
const _mongoAdvisoryHistory = USE_MEMORY ? null : (mongoose.models.AdvisoryHistory || mongoose.model("AdvisoryHistory", advisoryHistorySchema));
const _mongoAnalyticsData = USE_MEMORY ? null : (mongoose.models.AnalyticsData || mongoose.model("AnalyticsData", analyticsDataSchema));

const drugLogSchema = new mongoose.Schema(
  {
    animalId: { type: String, required: true },
    drugName: { type: String, required: true },
    dosage: { type: String, required: true },
    withdrawalDays: { type: Number, required: true },
    applicator: { type: String, default: "Farmer" },
    treatmentDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
const _mongoDrugLog = USE_MEMORY ? null : (mongoose.models.DrugLog || mongoose.model("DrugLog", drugLogSchema));

const systemAlertSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);
const _mongoSystemAlert = USE_MEMORY ? null : (mongoose.models.SystemAlert || mongoose.model("SystemAlert", systemAlertSchema));

const blockSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    timestamp: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true },
  },
  { timestamps: true },
);
const _mongoBlock = USE_MEMORY ? null : (mongoose.models.Block || mongoose.model("Block", blockSchema));

// Helper: returns true if MongoDB is actually connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Smart proxy: uses MongoDB when connected, falls back to in-memory otherwise
function makeProxy(mongoModel: any, inMemModel: any): any {
  return new Proxy({}, {
    get(_target, prop) {
      const model = (!USE_MEMORY && isMongoConnected() && mongoModel) ? mongoModel : inMemModel;
      const val = model[prop as string];
      return typeof val === "function" ? val.bind(model) : val;
    }
  });
}

export const Farmer: any = makeProxy(_mongoFarmer, _inMemFarmer);
export const Advisory: any = makeProxy(_mongoAdvisory, _inMemAdvisory);
export const AdvisoryHistory: any = makeProxy(_mongoAdvisoryHistory, _inMemAdvisoryHistory);
export const AnalyticsData: any = makeProxy(_mongoAnalyticsData, _inMemAnalyticsData);
export const DrugLog: any = makeProxy(_mongoDrugLog, _inMemDrugLog);
export const SystemAlert: any = makeProxy(_mongoSystemAlert, _inMemSystemAlert);
export const Block: any = makeProxy(_mongoBlock, _inMemBlock);
