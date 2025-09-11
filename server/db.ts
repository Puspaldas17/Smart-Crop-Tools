import mongoose from "mongoose";

const USE_MEMORY = !process.env.MONGODB_URI;

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
      // Apply $setOnInsert only if it exists and when creating; handled separately
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
      const base: T = {
        ...(update?.$setOnInsert || {}),
        ...(Object.fromEntries(
          Object.entries(update || {}).filter(([k]) => k !== "$setOnInsert"),
        ) as any),
      } as T;
      const created = await this.create(base);
      return created;
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

export const Farmer: any = USE_MEMORY
  ? new InMemoryCollection("Farmer")
  : mongoose.models.Farmer || mongoose.model("Farmer", farmerSchema);

export const Advisory: any = USE_MEMORY
  ? new InMemoryCollection("Advisory")
  : mongoose.models.Advisory || mongoose.model("Advisory", advisorySchema);
