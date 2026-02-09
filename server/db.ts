import mongoose from "mongoose";

console.log("[db] Loading db.ts. URI:", process.env.MONGODB_URI);
const USE_MEMORY = !process.env.MONGODB_URI;
console.log("[db] USE_MEMORY:", USE_MEMORY);

type AnyDoc = Record<string, any> & {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

class InMemoryCollection<T extends AnyDoc> {
  private items: T[] = [];
  constructor(private name: string) {}

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

  async find(filter: Partial<T>): Promise<T[]> {
    return this.items
      .filter((d) =>
        Object.entries(filter).every(([k, v]) => (d as any)[k] === v),
      )
      .map((d) => structuredClone(d) as T);
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
}

export async function connectDB(uri?: string) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("[db] MONGODB_URI not set. Using in-memory storage.");
    return null;
  }
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(mongoUri);
  console.log("[db] Connected to MongoDB");
  return mongoose.connection;
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

export const Farmer: any = USE_MEMORY
  ? new InMemoryCollection("Farmer")
  : mongoose.models.Farmer || mongoose.model("Farmer", farmerSchema);

export const Advisory: any = USE_MEMORY
  ? new InMemoryCollection("Advisory")
  : mongoose.models.Advisory || mongoose.model("Advisory", advisorySchema);

export const AdvisoryHistory: any = USE_MEMORY
  ? new InMemoryCollection("AdvisoryHistory")
  : mongoose.models.AdvisoryHistory ||
    mongoose.model("AdvisoryHistory", advisoryHistorySchema);

export const AnalyticsData: any = USE_MEMORY
  ? new InMemoryCollection("AnalyticsData")
  : mongoose.models.AnalyticsData ||
    mongoose.model("AnalyticsData", analyticsDataSchema);
