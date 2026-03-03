import mongoose, { Schema, Document } from "mongoose";

export interface IListing extends Document {
  crop: string;
  emoji: string;
  quantity: number;
  unit: string;
  price: number;
  seller: string;
  location: string;
  state: string;
  phone: string;
  category: string;
  isOrganic: boolean;
  createdAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    crop:      { type: String, required: true, trim: true },
    emoji:     { type: String, default: "🌾" },
    quantity:  { type: Number, required: true, min: 1 },
    unit:      { type: String, default: "kg" },
    price:     { type: Number, required: true, min: 0 },
    seller:    { type: String, required: true, trim: true },
    location:  { type: String, required: true, trim: true },
    state:     { type: String, required: true, trim: true },
    phone:     { type: String, required: true, trim: true },
    category:  { type: String, default: "Other" },
    isOrganic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for fast filtering
ListingSchema.index({ state: 1 });
ListingSchema.index({ category: 1 });
ListingSchema.index({ createdAt: -1 });

export const Listing =
  (mongoose.models.Listing as mongoose.Model<IListing>) || mongoose.model<IListing>("Listing", ListingSchema);
