import mongoose from "mongoose";

export async function connectDB(uri?: string) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("[db] MONGODB_URI not set. Continuing without DB connection.");
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

export const Farmer = mongoose.models.Farmer || mongoose.model("Farmer", farmerSchema);

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

export const Advisory =
  mongoose.models.Advisory || mongoose.model("Advisory", advisorySchema);
