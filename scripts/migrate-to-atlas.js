/**
 * MongoDB Migration Script
 * Copies all collections from local MongoDB (Compass) → Atlas
 *
 * Usage: node scripts/migrate-to-atlas.js
 */

import { MongoClient } from "mongodb";

const LOCAL_URI = "mongodb://localhost:27017";
const ATLAS_URI =
  "mongodb+srv://agriverse:agri1234@agridata.9jziww3.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "smart-crops";

async function migrate() {
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    console.log("🔌 Connecting to local MongoDB (Compass)...");
    await localClient.connect();
    console.log("✅ Connected to local MongoDB");

    console.log("🔌 Connecting to MongoDB Atlas...");
    await atlasClient.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const localDb = localClient.db(DB_NAME);
    const atlasDb = atlasClient.db(DB_NAME);

    // Get all collections from local
    const collections = await localDb.listCollections().toArray();

    if (collections.length === 0) {
      console.log("⚠️  No collections found in local database:", DB_NAME);
      return;
    }

    console.log(
      `\n📦 Found ${collections.length} collection(s) to migrate: ${collections.map((c) => c.name).join(", ")}\n`
    );

    for (const collectionInfo of collections) {
      const collName = collectionInfo.name;

      const localColl = localDb.collection(collName);
      const atlasColl = atlasDb.collection(collName);

      const docs = await localColl.find({}).toArray();

      if (docs.length === 0) {
        console.log(`⏭️  Skipping '${collName}' (empty collection)`);
        continue;
      }

      // Drop existing collection in Atlas to avoid duplicates
      try {
        await atlasColl.drop();
        console.log(`🗑️  Cleared existing '${collName}' in Atlas`);
      } catch (e) {
        // Collection might not exist yet, that's fine
      }

      await atlasColl.insertMany(docs);
      console.log(
        `✅ Migrated '${collName}' → ${docs.length} document(s) copied`
      );
    }

    console.log("\n🎉 Migration complete! All data is now in Atlas.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrate();
