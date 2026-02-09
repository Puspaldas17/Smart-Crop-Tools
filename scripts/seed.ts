
import "dotenv/config";
import mongoose from "mongoose";
import { Farmer, AdvisoryHistory, AnalyticsData, DrugLog } from "../server/db";

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  console.log("Clearing existing data...");
  await Farmer.deleteMany({});
  await AdvisoryHistory.deleteMany({});
  await AnalyticsData.deleteMany({});
  await DrugLog.deleteMany({});

  console.log("Seeding Farmers...");
  const farmers = await Farmer.create([
    {
      name: "Ramesh Kumar",
      phone: "9876543210",
      password: "password123", // In a real app, hash this!
      role: "farmer",
      language: "hi-IN",
      location: { lat: 20.2961, lon: 85.8245, village: "Bhubaneswar", state: "Odisha" },
      soilType: "Alluvial",
      landSize: 2.5,
      subscriptionStatus: "premium",
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      name: "Sita Devi",
      phone: "9876543211",
      password: "password123",
      role: "farmer",
      language: "or-IN",
      location: { lat: 19.8135, lon: 85.8312, village: "Puri", state: "Odisha" },
      soilType: "Red Soil",
      landSize: 1.2,
      subscriptionStatus: "free",
    },
    {
      name: "Dr. Rajesh Singh",
      phone: "9876543212",
      password: "password123",
      role: "vet",
      language: "en-IN",
      location: { lat: 20.2961, lon: 85.8245, village: "Bhubaneswar", state: "Odisha" },
    },
  ]);

  const ramesh = farmers[0];
  const sita = farmers[1];

  console.log("Seeding Advisory History...");
  await AdvisoryHistory.create([
    {
      farmerId: ramesh._id,
      crop: "Rice",
      advisory: "Apply Urea at 20kg/acre. Monitor for stem borer.",
      weatherData: { temp: 30, humidity: 80 },
    },
    {
      farmerId: ramesh._id,
      crop: "Wheat",
      advisory: "Watering needed. Soil moisture is low.",
      weatherData: { temp: 25, humidity: 60 },
    },
    {
      farmerId: sita._id,
      crop: "Brinjal",
      advisory: "Pest alert: Fruit and shoot borer active.",
      weatherData: { temp: 28, humidity: 75 },
    },
  ]);

  console.log("Seeding Analytics Data...");
  const today = new Date();
  const analytics = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    analytics.push({
      farmerId: ramesh._id,
      crop: "Rice",
      date: date,
      cropHealthScore: 80 + Math.random() * 10,
      soilMoisture: 40 + Math.random() * 20,
      temperature: 28 + Math.random() * 5,
    });
  }
  await AnalyticsData.create(analytics);

  console.log("Seeding AMU Data...");
  await DrugLog.create([
    {
      animalId: "COW-101",
      drugName: "Oxytetracycline",
      dosage: "10ml",
      withdrawalDays: 7,
      applicator: "Dr. Rajesh Singh",
      treatmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      animalId: "GOAT-202",
      drugName: "Ivermectin",
      dosage: "2ml",
      withdrawalDays: 14,
      applicator: "Dr. Rajesh Singh",
      treatmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  ]);

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
