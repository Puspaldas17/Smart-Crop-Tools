var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/routes/demo.ts
var handleDemo;
var init_demo = __esm({
  "server/routes/demo.ts"() {
    handleDemo = (_req, res) => {
      const response = {
        message: "Hello from Express server"
      };
      res.status(200).json(response);
    };
  }
});

// server/db.ts
import "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/dotenv/config.js";
import mongoose from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/mongoose/index.js";
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("[db] MONGODB_URI not set. Using in-memory storage.");
    return null;
  }
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5e3 });
    _connected = true;
    console.log("[db] Connected to MongoDB Atlas \u2713");
    return mongoose.connection;
  } catch (err) {
    console.warn("[db] Initial MongoDB connection failed:", err.message);
    console.warn("[db] Server will start in in-memory mode. Retrying in background...");
    retryInBackground(mongoUri);
    return null;
  }
}
function retryInBackground(mongoUri) {
  setTimeout(async () => {
    if (mongoose.connection.readyState === 1) return;
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8e3 });
      _connected = true;
      console.log("[db] Background reconnect to MongoDB Atlas succeeded \u2713");
    } catch (err) {
      console.warn("[db] Background reconnect failed, retrying in 30s...", err.message);
      retryInBackground(mongoUri);
    }
  }, 3e4);
}
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}
function makeProxy(mongoModel, inMemModel) {
  return new Proxy({}, {
    get(_target, prop) {
      const model = !USE_MEMORY && isMongoConnected() && mongoModel ? mongoModel : inMemModel;
      const val = model[prop];
      return typeof val === "function" ? val.bind(model) : val;
    }
  });
}
var USE_MEMORY, InMemoryCollection, _connected, farmerSchema, advisorySchema, advisoryHistorySchema, analyticsDataSchema, _inMemFarmer, _inMemAdvisory, _inMemAdvisoryHistory, _inMemAnalyticsData, _inMemDrugLog, _inMemSystemAlert, _inMemBlock, _mongoFarmer, _mongoAdvisory, _mongoAdvisoryHistory, _mongoAnalyticsData, drugLogSchema, _mongoDrugLog, systemAlertSchema, _mongoSystemAlert, blockSchema, _mongoBlock, Farmer, Advisory, AdvisoryHistory, AnalyticsData, DrugLog, SystemAlert, Block;
var init_db = __esm({
  "server/db.ts"() {
    mongoose.set("bufferCommands", false);
    console.log("[db] Loading db.ts. URI:", process.env.MONGODB_URI ? "set" : "not set");
    USE_MEMORY = !process.env.MONGODB_URI;
    console.log("[db] USE_MEMORY:", USE_MEMORY);
    InMemoryCollection = class {
      constructor(name) {
        this.name = name;
      }
      items = [];
      genId() {
        return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).toLowerCase();
      }
      async create(doc) {
        const now = /* @__PURE__ */ new Date();
        const out = {
          ...doc,
          _id: this.genId(),
          createdAt: now,
          updatedAt: now
        };
        this.items.push(out);
        return structuredClone(out);
      }
      async findById(id) {
        const found = this.items.find((d) => String(d._id) === String(id));
        return found ? structuredClone(found) : null;
      }
      async countDocuments(filter = {}) {
        const filtered = this.items.filter(
          (d) => Object.entries(filter).every(([k, v]) => d[k] === v)
        );
        return filtered.length;
      }
      find(filter) {
        const filtered = this.items.filter(
          (d) => Object.entries(filter).every(([k, v]) => d[k] === v)
        ).map((d) => structuredClone(d));
        return {
          items: filtered,
          sort(criteria) {
            const [key, order] = Object.entries(criteria)[0];
            this.items.sort((a, b) => {
              if (a[key] < b[key]) return order === 1 ? -1 : 1;
              if (a[key] > b[key]) return order === 1 ? 1 : -1;
              return 0;
            });
            return this;
          },
          limit(n) {
            this.items = this.items.slice(0, n);
            return this;
          },
          then(resolve) {
            resolve(this.items);
          }
        };
      }
      async findOneAndUpdate(filter, update, options = {}) {
        const match = this.items.find(
          (d) => Object.entries(filter).every(([k, v]) => d[k] === v)
        );
        const now = /* @__PURE__ */ new Date();
        const applyUpdate = (base) => {
          const clone = { ...base };
          const plain = Object.fromEntries(
            Object.entries(update).filter(([k]) => k !== "$setOnInsert")
          );
          Object.assign(clone, plain);
          clone.updatedAt = now;
          return clone;
        };
        if (match) {
          const updated = applyUpdate(match);
          const idx = this.items.indexOf(match);
          this.items[idx] = updated;
          return structuredClone(updated);
        }
        if (options.upsert) {
          const plain = Object.fromEntries(
            Object.entries(update || {}).filter(([k]) => k !== "$setOnInsert")
          );
          const base = {
            ...update?.$setOnInsert || {},
            ...plain
          };
          const out = {
            ...base,
            _id: this.genId(),
            createdAt: base.createdAt || now,
            updatedAt: now
          };
          this.items.push(out);
          return structuredClone(out);
        }
        return null;
      }
      async findOne(filter) {
        const found = this.items.find(
          (d) => Object.entries(filter).every(([k, v]) => d[k] === v)
        );
        return found ? structuredClone(found) : null;
      }
      async findByIdAndDelete(id) {
        const idx = this.items.findIndex((d) => String(d._id) === String(id));
        if (idx === -1) return null;
        const [deleted] = this.items.splice(idx, 1);
        return structuredClone(deleted);
      }
      async deleteOne(filter) {
        const idx = this.items.findIndex(
          (d) => Object.entries(filter).every(([k, v]) => d[k] === v)
        );
        if (idx === -1) return false;
        this.items.splice(idx, 1);
        return true;
      }
    };
    _connected = false;
    farmerSchema = new mongoose.Schema(
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
          state: String
        },
        role: {
          type: String,
          enum: ["farmer", "vet", "admin"],
          default: "farmer"
        },
        subscriptionStatus: {
          type: String,
          default: "free",
          enum: ["free", "premium"]
        },
        subscriptionStartDate: { type: Date },
        subscriptionEndDate: { type: Date }
      },
      { timestamps: true }
    );
    advisorySchema = new mongoose.Schema(
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
        farmerFeedback: { type: String, enum: ["positive", "negative"], default: null }
      },
      { timestamps: true }
    );
    advisoryHistorySchema = new mongoose.Schema(
      {
        farmerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Farmer",
          required: true
        },
        crop: { type: String, required: true },
        advisory: { type: String, required: true },
        weatherData: mongoose.Schema.Types.Mixed,
        soilData: mongoose.Schema.Types.Mixed,
        confidenceScore: Number,
        costBenefit: String,
        factors: [String],
        riskAlerts: [String],
        farmerFeedback: { type: String, enum: ["positive", "negative"], default: null }
      },
      { timestamps: true }
    );
    analyticsDataSchema = new mongoose.Schema(
      {
        farmerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Farmer",
          required: true
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
        diseaseRisk: { type: Number, min: 0, max: 100 }
      },
      { timestamps: true }
    );
    _inMemFarmer = new InMemoryCollection("Farmer");
    _inMemAdvisory = new InMemoryCollection("Advisory");
    _inMemAdvisoryHistory = new InMemoryCollection("AdvisoryHistory");
    _inMemAnalyticsData = new InMemoryCollection("AnalyticsData");
    _inMemDrugLog = new InMemoryCollection("DrugLog");
    _inMemSystemAlert = new InMemoryCollection("SystemAlert");
    _inMemBlock = new InMemoryCollection("Block");
    _mongoFarmer = USE_MEMORY ? null : mongoose.models.Farmer || mongoose.model("Farmer", farmerSchema);
    _mongoAdvisory = USE_MEMORY ? null : mongoose.models.Advisory || mongoose.model("Advisory", advisorySchema);
    _mongoAdvisoryHistory = USE_MEMORY ? null : mongoose.models.AdvisoryHistory || mongoose.model("AdvisoryHistory", advisoryHistorySchema);
    _mongoAnalyticsData = USE_MEMORY ? null : mongoose.models.AnalyticsData || mongoose.model("AnalyticsData", analyticsDataSchema);
    drugLogSchema = new mongoose.Schema(
      {
        animalId: { type: String, required: true },
        drugName: { type: String, required: true },
        dosage: { type: String, required: true },
        withdrawalDays: { type: Number, required: true },
        applicator: { type: String, default: "Farmer" },
        treatmentDate: { type: Date, default: Date.now }
      },
      { timestamps: true }
    );
    _mongoDrugLog = USE_MEMORY ? null : mongoose.models.DrugLog || mongoose.model("DrugLog", drugLogSchema);
    systemAlertSchema = new mongoose.Schema(
      {
        message: { type: String, required: true },
        type: { type: String, enum: ["info", "warning", "critical"], default: "info" },
        active: { type: Boolean, default: true },
        expiresAt: { type: Date }
      },
      { timestamps: true }
    );
    _mongoSystemAlert = USE_MEMORY ? null : mongoose.models.SystemAlert || mongoose.model("SystemAlert", systemAlertSchema);
    blockSchema = new mongoose.Schema(
      {
        index: { type: Number, required: true },
        timestamp: { type: String, required: true },
        data: { type: mongoose.Schema.Types.Mixed, required: true },
        previousHash: { type: String, required: true },
        hash: { type: String, required: true }
      },
      { timestamps: true }
    );
    _mongoBlock = USE_MEMORY ? null : mongoose.models.Block || mongoose.model("Block", blockSchema);
    Farmer = makeProxy(_mongoFarmer, _inMemFarmer);
    Advisory = makeProxy(_mongoAdvisory, _inMemAdvisory);
    AdvisoryHistory = makeProxy(_mongoAdvisoryHistory, _inMemAdvisoryHistory);
    AnalyticsData = makeProxy(_mongoAnalyticsData, _inMemAnalyticsData);
    DrugLog = makeProxy(_mongoDrugLog, _inMemDrugLog);
    SystemAlert = makeProxy(_mongoSystemAlert, _inMemSystemAlert);
    Block = makeProxy(_mongoBlock, _inMemBlock);
  }
});

// server/routes/farmers.ts
var createFarmer, getFarmer, getAllFarmers, deleteFarmer, updateFarmerStatus;
var init_farmers = __esm({
  "server/routes/farmers.ts"() {
    init_db();
    createFarmer = async (req, res) => {
      try {
        const data = await Farmer.create(req.body);
        res.status(201).json(data);
      } catch (e) {
        console.error("[farmers] Error:", e);
        res.status(400).json({ error: "Invalid farmer data" });
      }
    };
    getFarmer = async (req, res) => {
      const { id } = req.params;
      try {
        const data = await Farmer.findById(id);
        if (!data) {
          return res.status(404).json({ error: "Farmer not found" });
        }
        res.json(data);
      } catch (e) {
        console.error("[farmers] Error:", e);
        res.status(400).json({ error: "Invalid id" });
      }
    };
    getAllFarmers = async (req, res) => {
      try {
        const data = await Farmer.find({});
        res.json(data);
      } catch (e) {
        console.error("[farmers] Error:", e);
        res.status(500).json({ error: "Failed to fetch farmers" });
      }
    };
    deleteFarmer = async (req, res) => {
      const { id } = req.params;
      try {
        if (Farmer.deleteOne) {
          await Farmer.deleteOne({ _id: id });
        } else if (Farmer.items) {
          Farmer.items = Farmer.items.filter((f) => String(f._id) !== String(id));
        }
        res.json({ success: true });
      } catch (e) {
        console.error("[farmers] Error deleting:", e);
        res.status(500).json({ error: "Failed to delete farmer" });
      }
    };
    updateFarmerStatus = async (req, res) => {
      const { id } = req.params;
      const { action } = req.body;
      try {
        const farmer = await Farmer.findById(id);
        if (!farmer) return res.status(404).json({ error: "Not found" });
        let update = {};
        if (action === "suspend") update = { role: "suspended" };
        if (action === "activate") update = { role: "farmer" };
        if (action === "premium") {
          update = {
            subscriptionStatus: "premium",
            subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
          };
        }
        await Farmer.findOneAndUpdate({ _id: id }, update);
        res.json({ success: true });
      } catch (e) {
        console.error("[farmers] Error updating:", e);
        res.status(500).json({ error: "Failed to update farmer" });
      }
    };
  }
});

// server/utils/cache.ts
function getCache(key) {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) {
    store.delete(key);
    return null;
  }
  return e.value;
}
function setCache(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}
function makeKey(parts) {
  return parts.map((p) => String(p ?? "")).join("|");
}
var store;
var init_cache = __esm({
  "server/utils/cache.ts"() {
    store = /* @__PURE__ */ new Map();
  }
});

// server/utils/http.ts
async function fetchWithTimeout(url, init = {}, timeoutMs = 7e3) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}
async function retry(fn, attempts = 3, delayMs = 300) {
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1)
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}
var init_http = __esm({
  "server/utils/http.ts"() {
  }
});

// server/routes/weather.ts
function weatherCodeToText(code) {
  const map = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm w/ hail",
    99: "Thunderstorm w/ hail"
  };
  return code != null ? map[code] || "Unknown" : void 0;
}
var getWeather;
var init_weather = __esm({
  "server/routes/weather.ts"() {
    init_cache();
    init_http();
    getWeather = async (req, res) => {
      try {
        const { lat, lon } = req.query;
        if (!lat || !lon)
          return res.status(400).json({ error: "lat and lon required" });
        const latR = Math.round(Number(lat) * 100) / 100;
        const lonR = Math.round(Number(lon) * 100) / 100;
        const cacheKey = makeKey(["weather", latR, lonR]);
        const cached = getCache(cacheKey);
        if (cached) return res.json({ ...cached, cached: true });
        const key = process.env.OPENWEATHER_API_KEY;
        if (key) {
          try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latR}&lon=${lonR}&appid=${key}&units=metric`;
            const resp = await retry(() => fetchWithTimeout(url, {}, 7e3));
            if (resp.ok) {
              const data = await resp.json();
              const payload2 = {
                tempC: data.main?.temp,
                humidity: data.main?.humidity,
                windKph: data.wind?.speed ? data.wind.speed * 3.6 : void 0,
                conditions: data.weather?.[0]?.description,
                raw: data,
                source: "openweather"
              };
              setCache(cacheKey, payload2, 10 * 60 * 1e3);
              return res.json(payload2);
            }
          } catch {
          }
        }
        try {
          const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latR}&longitude=${lonR}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
          const r = await retry(() => fetchWithTimeout(omUrl, {}, 7e3));
          if (r.ok) {
            const w = await r.json();
            const cur = w.current || {};
            const code = cur.weather_code;
            const description = weatherCodeToText(code);
            const payload2 = {
              tempC: cur.temperature_2m,
              humidity: cur.relative_humidity_2m,
              windKph: cur.wind_speed_10m,
              conditions: description,
              raw: w,
              source: "open-meteo"
            };
            setCache(cacheKey, payload2, 10 * 60 * 1e3);
            return res.json(payload2);
          }
        } catch {
        }
        const payload = {
          tempC: 28,
          humidity: 65,
          windKph: 8,
          conditions: "Partly cloudy",
          source: "sample"
        };
        setCache(cacheKey, payload, 5 * 60 * 1e3);
        return res.json(payload);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
      }
    };
  }
});

// server/routes/advisory.ts
function generateAdvice({
  tempC,
  humidity,
  soilMoisture,
  ndvi
}) {
  const parts = [];
  const factors = [];
  const riskAlerts = [];
  if (tempC !== void 0) {
    if (tempC < 15) {
      parts.push("Low temperature: prefer wheat/mustard; reduce irrigation.");
      factors.push(`Temperature is low (${tempC}\xB0C).`);
      riskAlerts.push("Frost risk for sensitive crops.");
    } else if (tempC < 28) {
      parts.push("Moderate temperature: paddy/vegetables suitable; standard irrigation schedule.");
      factors.push(`Temperature is optimal (${tempC}\xB0C).`);
    } else {
      parts.push("High temperature: select drought\u2011tolerant crops; irrigate in early morning/evening.");
      factors.push(`Temperature is high (${tempC}\xB0C).`);
      riskAlerts.push("Heat stress risk.");
    }
  }
  if (humidity !== void 0) {
    if (humidity > 80) {
      parts.push("High humidity: monitor fungal diseases; use preventive fungicide when needed.");
      factors.push(`Humidity is high (${humidity}%).`);
      riskAlerts.push("Fungal disease outbreak likely.");
    } else if (humidity < 30) {
      parts.push("Low humidity: mulch to retain soil moisture.");
      factors.push(`Humidity is low (${humidity}%).`);
    }
  }
  if (soilMoisture !== void 0) {
    if (soilMoisture < 30) {
      parts.push("Soil is dry. Immediate irrigation recommended.");
      factors.push(`Soil moisture is critically low (${soilMoisture}%).`);
    } else if (soilMoisture > 70) {
      parts.push("Soil is waterlogged. Pause irrigation.");
      factors.push(`Soil moisture is high (${soilMoisture}%).`);
      riskAlerts.push("Root rot risk due to waterlogging.");
    } else {
      factors.push(`Soil moisture is optimal (${soilMoisture}%).`);
    }
  }
  if (ndvi !== void 0) {
    if (ndvi < 0.3) {
      parts.push("Crop health is poor. Consider soil testing for nutrient deficiencies.");
      factors.push(`Satellite NDVI is low (${ndvi}).`);
    } else if (ndvi > 0.6) {
      parts.push("Crop health is excellent.");
      factors.push(`Satellite NDVI indicates healthy canopy (${ndvi}).`);
    }
  }
  return {
    summary: parts.join(" ") || "Provide location to fetch weather for personalized advice.",
    factors,
    riskAlerts
  };
}
var createAdvisory, submitFeedback;
var init_advisory = __esm({
  "server/routes/advisory.ts"() {
    init_db();
    createAdvisory = async (req, res) => {
      try {
        const { farmerId, crop, lat, lon } = req.body;
        let weather = void 0;
        if (lat != null && lon != null) {
          const key = process.env.OPENWEATHER_API_KEY;
          if (key) {
            const resp = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
            );
            if (resp.ok) weather = await resp.json();
          }
        }
        const mockSoilMoisture = Math.floor(Math.random() * 60) + 20;
        const mockNDVI = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2));
        const advice = generateAdvice({
          tempC: weather?.main?.temp,
          humidity: weather?.main?.humidity,
          soilMoisture: mockSoilMoisture,
          ndvi: mockNDVI
        });
        const summary = advice.summary;
        const factors = advice.factors;
        const riskAlerts = advice.riskAlerts;
        const confidenceScore = Math.floor(Math.random() * 20) + 80;
        const isPaddy = crop?.toLowerCase().includes("paddy");
        const fertilizer = isPaddy ? "NPK 10:26:26 at sowing; urea split doses at tillering/PI." : "Balanced NPK based on soil test; apply compost/manure to improve organic matter.";
        const irrigation = weather?.main?.temp && weather.main.temp > 30 || mockSoilMoisture < 30 ? "Irrigate 2\u20133 times/week in short cycles." : "Irrigate weekly based on soil moisture.";
        const pest = "Scout weekly; use pheromone traps; prefer bio\u2011control where possible.";
        const costBenefit = `Estimated ROI: +${Math.floor(Math.random() * 15) + 5}% yield increase with recommended practices.`;
        const payload = {
          farmerId,
          crop: crop || "Unknown",
          summary,
          fertilizer,
          irrigation,
          pest,
          weather,
          confidenceScore,
          costBenefit,
          factors,
          riskAlerts
        };
        const data = await Advisory.create(payload);
        if (farmerId) {
          await AdvisoryHistory.create({
            farmerId,
            crop: crop || "Unknown",
            advisory: summary,
            weatherData: weather,
            confidenceScore,
            costBenefit,
            factors,
            riskAlerts
          });
        }
        res.status(201).json(data);
      } catch (e) {
        console.error("[advisory] Error:", e);
        res.status(400).json({ error: "Failed to create advisory" });
      }
    };
    submitFeedback = async (req, res) => {
      try {
        const { id } = req.params;
        const { feedback } = req.body;
        if (!["positive", "negative"].includes(feedback)) {
          res.status(400).json({ error: "Invalid feedback value" });
          return;
        }
        const updated = await AdvisoryHistory.findOneAndUpdate(
          { _id: id },
          { farmerFeedback: feedback },
          { new: true }
        );
        if (!updated) {
          res.status(404).json({ error: "Advisory history not found" });
          return;
        }
        res.json(updated);
      } catch (e) {
        console.error("[advisory] Feedback error:", e);
        res.status(500).json({ error: "Failed to submit feedback" });
      }
    };
  }
});

// server/routes/market.ts
var sample, getMarketPrices;
var init_market = __esm({
  "server/routes/market.ts"() {
    init_cache();
    init_http();
    sample = [
      {
        commodity: "Wheat",
        state: "Punjab",
        mandi: "Ludhiana",
        unit: "Qtl",
        price: 2200
      },
      {
        commodity: "Wheat",
        state: "Uttar Pradesh",
        mandi: "Kanpur",
        unit: "Qtl",
        price: 2150
      },
      {
        commodity: "Rice",
        state: "West Bengal",
        mandi: "Kolkata",
        unit: "Qtl",
        price: 2450
      },
      {
        commodity: "Rice",
        state: "Tamil Nadu",
        mandi: "Thanjavur",
        unit: "Qtl",
        price: 2400
      },
      {
        commodity: "Onion",
        state: "Maharashtra",
        mandi: "Nashik",
        unit: "Qtl",
        price: 1700
      },
      {
        commodity: "Onion",
        state: "Karnataka",
        mandi: "Hubballi",
        unit: "Qtl",
        price: 1650
      },
      {
        commodity: "Potato",
        state: "Uttar Pradesh",
        mandi: "Agra",
        unit: "Qtl",
        price: 1200
      },
      {
        commodity: "Potato",
        state: "West Bengal",
        mandi: "Hooghly",
        unit: "Qtl",
        price: 1250
      },
      {
        commodity: "Soybean",
        state: "Madhya Pradesh",
        mandi: "Indore",
        unit: "Qtl",
        price: 4800
      },
      {
        commodity: "Cotton",
        state: "Telangana",
        mandi: "Warangal",
        unit: "Qtl",
        price: 6200
      },
      {
        commodity: "Tur",
        state: "Maharashtra",
        mandi: "Latur",
        unit: "Qtl",
        price: 7e3
      },
      {
        commodity: "Chilli",
        state: "Andhra Pradesh",
        mandi: "Guntur",
        unit: "Qtl",
        price: 9e3
      }
    ];
    getMarketPrices = async (req, res) => {
      const { commodity, state } = req.query;
      const apiUrl = process.env.MARKET_API_URL;
      const apiKey = process.env.MARKET_API_KEY;
      const cacheKey = makeKey([
        "market",
        (commodity || "").toLowerCase(),
        (state || "").toLowerCase()
      ]);
      const cached = getCache(cacheKey);
      if (cached)
        return res.json({
          source: cached.source,
          items: cached.items,
          cached: true
        });
      try {
        if (apiUrl) {
          const url = new URL(apiUrl);
          if (commodity) url.searchParams.set("commodity", commodity);
          if (state) url.searchParams.set("state", state);
          const r = await retry(
            () => fetchWithTimeout(
              url.toString(),
              {
                headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : void 0
              },
              7e3
            )
          );
          if (r.ok) {
            const data = await r.json();
            const payload2 = { source: "live", items: data };
            setCache(cacheKey, payload2, 5 * 60 * 1e3);
            return res.json(payload2);
          }
        }
      } catch {
      }
      const items = sample.filter(
        (i) => (!commodity || i.commodity.toLowerCase().includes(commodity.toLowerCase())) && (!state || i.state.toLowerCase() === state.toLowerCase())
      );
      const payload = { source: "sample", items };
      setCache(cacheKey, payload, 5 * 60 * 1e3);
      res.json(payload);
    };
  }
});

// server/routes/chat.ts
var chatHandler;
var init_chat = __esm({
  "server/routes/chat.ts"() {
    chatHandler = async (req, res) => {
      try {
        const { message, lat, lon, lang = "en" } = req.body;
        if (!message) return res.status(400).json({ error: "message required" });
        const shortLang = lang.split("-")[0];
        const isHi = shortLang === "hi";
        const isOr = shortLang === "or";
        const m = message.toLowerCase();
        const replies = [];
        const t = {
          weather: {
            en: (desc, temp, hum) => `Weather: ${desc}, Temp ${temp}\xB0C, Humidity ${hum}%`,
            hi: (desc, temp, hum) => `\u092E\u094C\u0938\u092E: ${desc}, \u0924\u093E\u092A\u092E\u093E\u0928 ${temp}\xB0C, \u0928\u092E\u0940 ${hum}%`,
            or: (desc, temp, hum) => `\u0B2A\u0B3E\u0B23\u0B3F\u0B2A\u0B3E\u0B17: ${desc}, \u0B24\u0B3E\u0B2A\u0B2E\u0B3E\u0B24\u0B4D\u0B30\u0B3E ${temp}\xB0C, \u0B06\u0B30\u0B4D\u0B26\u0B4D\u0B30\u0B24\u0B3E ${hum}%`
          },
          market: {
            en: "For live mandi prices, please check the 'Market' tab. I can tell you that Wheat is currently trending up in Punjab markets.",
            hi: "\u0932\u093E\u0907\u0935 \u092E\u0902\u0921\u0940 \u092D\u093E\u0935 \u0915\u0947 \u0932\u093F\u090F, \u0915\u0943\u092A\u092F\u093E '\u092E\u0902\u0921\u0940 \u092D\u093E\u0935' \u091F\u0948\u092C \u0926\u0947\u0916\u0947\u0902\u0964 \u092A\u0902\u091C\u093E\u092C \u0915\u0940 \u092E\u0902\u0921\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u0917\u0947\u0939\u0942\u0902 \u0915\u0947 \u0926\u093E\u092E \u092C\u0922\u093C \u0930\u0939\u0947 \u0939\u0948\u0902\u0964",
            or: "\u0B32\u0B3E\u0B07\u0B2D \u0B2E\u0B23\u0B4D\u0B21\u0B3F \u0B2E\u0B42\u0B32\u0B4D\u0B5F \u0B2A\u0B3E\u0B07\u0B01, \u0B26\u0B5F\u0B3E\u0B15\u0B30\u0B3F '\u0B2C\u0B1C\u0B3E\u0B30' \u0B1F\u0B4D\u0B5F\u0B3E\u0B2C\u0B4D \u0B26\u0B47\u0B16\u0B28\u0B4D\u0B24\u0B41 | \u0B2A\u0B1E\u0B4D\u0B1C\u0B3E\u0B2C \u0B2C\u0B1C\u0B3E\u0B30\u0B30\u0B47 \u0B17\u0B39\u0B2E \u0B2E\u0B42\u0B32\u0B4D\u0B5F \u0B2C\u0B43\u0B26\u0B4D\u0B27\u0B3F \u0B2A\u0B3E\u0B09\u0B1B\u0B3F |"
          },
          yield: {
            en: "To improve yield: 1. Ensure soil testing. 2. Use certified seeds. 3. Follow timely irrigation. 4. Manage pests early with bio-pesticides.",
            hi: "\u092A\u0948\u0926\u093E\u0935\u093E\u0930 \u092C\u0922\u093C\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F: 1. \u092E\u093F\u091F\u094D\u091F\u0940 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u093E\u090F\u0902\u0964 2. \u092A\u094D\u0930\u092E\u093E\u0923\u093F\u0924 \u092C\u0940\u091C\u094B\u0902 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964 3. \u0938\u092E\u092F \u092A\u0930 \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u0930\u0947\u0902\u0964 4. \u091C\u0948\u0935-\u0915\u0940\u091F\u0928\u093E\u0936\u0915\u094B\u0902 \u0915\u0947 \u0938\u093E\u0925 \u0915\u0940\u091F\u094B\u0902 \u0915\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u0928 \u0915\u0930\u0947\u0902\u0964",
            or: "\u0B05\u0B2E\u0B33 \u0B2C\u0B43\u0B26\u0B4D\u0B27\u0B3F \u0B2A\u0B3E\u0B07\u0B01: 1. \u0B2E\u0B3E\u0B1F\u0B3F \u0B2A\u0B30\u0B40\u0B15\u0B4D\u0B37\u0B3E \u0B28\u0B3F\u0B36\u0B4D\u0B1A\u0B3F\u0B24 \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41 | 2. \u0B2A\u0B4D\u0B30\u0B2E\u0B3E\u0B23\u0B3F\u0B24 \u0B2C\u0B3F\u0B39\u0B28 \u0B2C\u0B4D\u0B5F\u0B2C\u0B39\u0B3E\u0B30 \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41 | 3. \u0B20\u0B3F\u0B15\u0B4D \u0B38\u0B2E\u0B5F\u0B30\u0B47 \u0B1C\u0B33\u0B38\u0B47\u0B1A\u0B28 \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41 | 4. \u0B1C\u0B48\u0B2C \u0B15\u0B40\u0B1F\u0B28\u0B3E\u0B36\u0B15 \u0B38\u0B39\u0B3F\u0B24 \u0B36\u0B40\u0B18\u0B4D\u0B30 \u0B2A\u0B4B\u0B15 \u0B2A\u0B30\u0B3F\u0B1A\u0B3E\u0B33\u0B28\u0B3E \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41 |"
          },
          irrigation: {
            en: "Irrigation tip: Water early morning or late evening to reduce evaporation. For paddy, maintain standing water only at critical stages.",
            hi: "\u0938\u093F\u0902\u091A\u093E\u0908 \u091F\u093F\u092A: \u0935\u093E\u0937\u094D\u092A\u0940\u0915\u0930\u0923 \u0915\u092E \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u0941\u092C\u0939 \u091C\u0932\u094D\u0926\u0940 \u092F\u093E \u0926\u0947\u0930 \u0936\u093E\u092E \u0915\u094B \u092A\u093E\u0928\u0940 \u0926\u0947\u0902\u0964 \u0927\u093E\u0928 \u0915\u0947 \u0932\u093F\u090F, \u0915\u0947\u0935\u0932 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u091A\u0930\u0923\u094B\u0902 \u092E\u0947\u0902 \u0916\u0921\u093C\u093E \u092A\u093E\u0928\u0940 \u0930\u0916\u0947\u0902\u0964",
            or: "\u0B1C\u0B33\u0B38\u0B47\u0B1A\u0B28 \u0B1F\u0B3F\u0B2A\u0B4D\u0B2A\u0B23\u0B40: \u0B2C\u0B3E\u0B37\u0B4D\u0B2A\u0B40\u0B15\u0B30\u0B23 \u0B39\u0B4D\u0B30\u0B3E\u0B38 \u0B15\u0B30\u0B3F\u0B2C\u0B3E\u0B15\u0B41 \u0B2D\u0B4B\u0B30 \u0B15\u0B3F\u0B2E\u0B4D\u0B2C\u0B3E \u0B2C\u0B3F\u0B33\u0B2E\u0B4D\u0B2C\u0B3F\u0B24 \u0B38\u0B28\u0B4D\u0B27\u0B4D\u0B5F\u0B3E\u0B30\u0B47 \u0B2A\u0B3E\u0B23\u0B3F \u0B26\u0B3F\u0B05\u0B28\u0B4D\u0B24\u0B41 | \u0B27\u0B3E\u0B28 \u0B2A\u0B3E\u0B07\u0B01, \u0B15\u0B47\u0B2C\u0B33 \u0B17\u0B41\u0B30\u0B41\u0B24\u0B4D\u0B71\u0B2A\u0B42\u0B30\u0B4D\u0B23\u0B4D\u0B23 \u0B2A\u0B30\u0B4D\u0B2F\u0B4D\u0B5F\u0B3E\u0B5F\u0B30\u0B47 \u0B1B\u0B3F\u0B21\u0B3E \u0B39\u0B4B\u0B07\u0B25\u0B3F\u0B2C\u0B3E \u0B2A\u0B3E\u0B23\u0B3F \u0B30\u0B16\u0B28\u0B4D\u0B24\u0B41 |"
          },
          wheat: {
            en: "Wheat Advisory: Sowing time is Nov 1-15. Use NPK 120:60:40. Irrigate at CRI stage (21 days after sowing).",
            hi: "\u0917\u0947\u0939\u0942\u0902 \u0938\u0932\u093E\u0939: \u092C\u0941\u0935\u093E\u0908 \u0915\u093E \u0938\u092E\u092F 1-15 \u0928\u0935\u0902\u092C\u0930 \u0939\u0948\u0964 NPK 120:60:40 \u0915\u093E \u092A\u094D\u0930\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964 CRI \u0905\u0935\u0938\u094D\u0925\u093E (\u092C\u0941\u0935\u093E\u0908 \u0915\u0947 21 \u0926\u093F\u0928 \u092C\u093E\u0926) \u092A\u0930 \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u0930\u0947\u0902\u0964",
            or: "\u0B17\u0B39\u0B2E \u0B2A\u0B30\u0B3E\u0B2E\u0B30\u0B4D\u0B36: \u0B2C\u0B41\u0B23\u0B3F\u0B2C\u0B3E \u0B38\u0B2E\u0B5F \u0B28\u0B2D\u0B47\u0B2E\u0B4D\u0B2C\u0B30 1-15 \u0B05\u0B1F\u0B47 | NPK 120:60:40 \u0B2C\u0B4D\u0B5F\u0B2C\u0B39\u0B3E\u0B30 \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41 | CRI \u0B2A\u0B30\u0B4D\u0B2F\u0B4D\u0B5F\u0B3E\u0B5F\u0B30\u0B47 \u0B1C\u0B33\u0B38\u0B47\u0B1A\u0B28 (\u0B2C\u0B41\u0B23\u0B3F\u0B2C\u0B3E\u0B30 21 \u0B26\u0B3F\u0B28 \u0B2A\u0B30\u0B47) |"
          },
          rice: {
            en: "Rice Advisory: Maintain 2-5cm water level. Apply Urea in splits. Watch out for Stem Borer and Blast disease.",
            hi: "\u0927\u093E\u0928 \u0938\u0932\u093E\u0939: 2-5 \u0938\u0947\u092E\u0940 \u091C\u0932 \u0938\u094D\u0924\u0930 \u092C\u0928\u093E\u090F \u0930\u0916\u0947\u0902\u0964 \u092F\u0942\u0930\u093F\u092F\u093E \u0915\u094B \u091F\u0941\u0915\u0921\u093C\u094B\u0902 \u092E\u0947\u0902 \u0921\u093E\u0932\u0947\u0902\u0964 \u0924\u0928\u093E \u091B\u0947\u0926\u0915 \u0914\u0930 \u092C\u094D\u0932\u093E\u0938\u094D\u091F \u0930\u094B\u0917 \u0938\u0947 \u0938\u093E\u0935\u0927\u093E\u0928 \u0930\u0939\u0947\u0902\u0964",
            or: "\u0B27\u0B3E\u0B28 \u0B2A\u0B30\u0B3E\u0B2E\u0B30\u0B4D\u0B36: 2-5 \u0B38\u0B47\u0B2E\u0B3F \u0B1C\u0B33 \u0B38\u0B4D\u0B24\u0B30 \u0B2C\u0B1C\u0B3E\u0B5F \u0B30\u0B16\u0B28\u0B4D\u0B24\u0B41 | \u0B5F\u0B41\u0B30\u0B3F\u0B06\u0B15\u0B41 \u0B2D\u0B3E\u0B17 \u0B2D\u0B3E\u0B17 \u0B15\u0B30\u0B3F \u0B2A\u0B4D\u0B30\u0B5F\u0B4B\u0B17 \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41 | \u0B37\u0B4D\u0B1F\u0B47\u0B2E\u0B4D \u0B2C\u0B4B\u0B30\u0B30\u0B4D \u0B0F\u0B2C\u0B02 \u0B2C\u0B4D\u0B32\u0B3E\u0B37\u0B4D\u0B1F \u0B30\u0B4B\u0B17 \u0B2A\u0B4D\u0B30\u0B24\u0B3F \u0B38\u0B3E\u0B2C\u0B27\u0B3E\u0B28 \u0B30\u0B41\u0B39\u0B28\u0B4D\u0B24\u0B41 |"
          },
          general: {
            en: "General advisory: choose crops based on local climate and soil test. Maintain balanced NPK and use compost. Monitor pests weekly and irrigate based on soil moisture.",
            hi: "\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u0932\u093E\u0939: \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u091C\u0932\u0935\u093E\u092F\u0941 \u0914\u0930 \u092E\u093F\u091F\u094D\u091F\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u092B\u0938\u0932 \u091A\u0941\u0928\u0947\u0902\u0964 \u0938\u0902\u0924\u0941\u0932\u093F\u0924 NPK \u092C\u0928\u093E\u090F \u0930\u0916\u0947\u0902 \u0914\u0930 \u0916\u093E\u0926 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964 \u0938\u093E\u092A\u094D\u0924\u093E\u0939\u093F\u0915 \u0915\u0940\u091F\u094B\u0902 \u0915\u0940 \u0928\u093F\u0917\u0930\u093E\u0928\u0940 \u0915\u0930\u0947\u0902\u0964",
            or: "\u0B38\u0B3E\u0B27\u0B3E\u0B30\u0B23 \u0B2A\u0B30\u0B3E\u0B2E\u0B30\u0B4D\u0B36: \u0B38\u0B4D\u0B25\u0B3E\u0B28\u0B40\u0B5F \u0B1C\u0B33\u0B2C\u0B3E\u0B5F\u0B41 \u0B0F\u0B2C\u0B02 \u0B2E\u0B43\u0B24\u0B4D\u0B24\u0B3F\u0B15\u0B3E \u0B2A\u0B30\u0B40\u0B15\u0B4D\u0B37\u0B3E \u0B09\u0B2A\u0B30\u0B47 \u0B06\u0B27\u0B3E\u0B30 \u0B15\u0B30\u0B3F \u0B2B\u0B38\u0B32 \u0B2C\u0B3E\u0B1B\u0B28\u0B4D\u0B24\u0B41 | \u0B38\u0B28\u0B4D\u0B24\u0B41\u0B33\u0B3F\u0B24 NPK \u0B2C\u0B1C\u0B3E\u0B5F \u0B30\u0B16\u0B28\u0B4D\u0B24\u0B41 \u0B0F\u0B2C\u0B02 \u0B15\u0B2E\u0B4D\u0B2A\u0B4B\u0B37\u0B4D\u0B1F \u0B2C\u0B4D\u0B5F\u0B2C\u0B39\u0B3E\u0B30 \u0B15\u0B30\u0B28\u0B4D\u0B24\u0B41 | \u0B38\u0B3E\u0B2A\u0B4D\u0B24\u0B3E\u0B39\u0B3F\u0B15 \u0B2A\u0B4B\u0B15 \u0B09\u0B2A\u0B30\u0B47 \u0B28\u0B1C\u0B30 \u0B30\u0B16\u0B28\u0B4D\u0B24\u0B41 |"
          },
          fallback: {
            en: "I can help with weather, market prices, and crop advisory. Ask me about any of these.",
            hi: "\u092E\u0948\u0902 \u092E\u094C\u0938\u092E, \u092E\u0902\u0921\u0940 \u092D\u093E\u0935 \u0914\u0930 \u092B\u0938\u0932 \u0938\u0932\u093E\u0939 \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0942\u0902\u0964 \u092E\u0941\u091D\u0938\u0947 \u0907\u0928\u092E\u0947\u0902 \u0938\u0947 \u0915\u093F\u0938\u0940 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092D\u0940 \u092A\u0942\u091B\u0947\u0902\u0964",
            or: "\u0B2E\u0B41\u0B01 \u0B2A\u0B3E\u0B23\u0B3F\u0B2A\u0B3E\u0B17, \u0B2C\u0B1C\u0B3E\u0B30 \u0B2E\u0B42\u0B32\u0B4D\u0B5F \u0B0F\u0B2C\u0B02 \u0B2B\u0B38\u0B32 \u0B2A\u0B30\u0B3E\u0B2E\u0B30\u0B4D\u0B36\u0B30\u0B47 \u0B38\u0B3E\u0B39\u0B3E\u0B2F\u0B4D\u0B5F \u0B15\u0B30\u0B3F\u0B2A\u0B3E\u0B30\u0B3F\u0B2C\u0B3F | \u0B0F\u0B17\u0B41\u0B21\u0B3F\u0B15 \u0B2C\u0B3F\u0B37\u0B5F\u0B30\u0B47 \u0B2E\u0B4B\u0B24\u0B47 \u0B2A\u0B1A\u0B3E\u0B30\u0B28\u0B4D\u0B24\u0B41 |"
          }
        };
        const getText = (key) => {
          const entry = t[key];
          if (isHi) return entry.hi;
          if (isOr) return entry.or;
          return entry.en;
        };
        if (/(weather|temp|rain|mausam|paanipaag)/.test(m) && lat != null && lon != null) {
          const key = process.env.OPENWEATHER_API_KEY;
          if (key) {
            const r = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
            );
            if (r.ok) {
              const w = await r.json();
              const getWText = t.weather[isHi ? "hi" : isOr ? "or" : "en"];
              replies.push(getWText(w.weather?.[0]?.description || "", w.main?.temp ?? "?", w.main?.humidity ?? "?"));
            }
          }
        }
        if (/(price|mandi|market|bhav|daam|dar)/.test(m)) {
          replies.push(getText("market"));
        }
        if (/(yield|production|harvest|pedavar|amal)/.test(m)) {
          replies.push(getText("yield"));
        }
        if (/(irrigation|water|sinchai|pani|sechan)/.test(m)) {
          replies.push(getText("irrigation"));
        }
        if (/(crop|fertilizer|advice|advisory|wheat|rice|corn|gehu|dhan|fasal)/.test(m)) {
          if (m.includes("wheat") || m.includes("gehu")) {
            replies.push(getText("wheat"));
          } else if (m.includes("rice") || m.includes("paddy") || m.includes("dhan")) {
            replies.push(getText("rice"));
          } else {
            replies.push(getText("general"));
          }
        }
        if (!replies.length)
          replies.push(getText("fallback"));
        res.json({ reply: replies.join("\n") });
      } catch (e) {
        res.status(500).json({ error: "chat error" });
      }
    };
  }
});

// server/utils/soilData.ts
function getSoilInfo(cropName) {
  const lower = cropName.toLowerCase();
  for (const key of Object.keys(soilDatabase)) {
    if (lower.includes(key)) {
      return soilDatabase[key];
    }
  }
  return soilDatabase.default;
}
var soilDatabase;
var init_soilData = __esm({
  "server/utils/soilData.ts"() {
    soilDatabase = {
      rice: {
        ph: "5.5 - 7.0",
        moisture: "High (Flooded)",
        temperature: "20\xB0C - 35\xB0C",
        type: "Clay or Clay Loam",
        notes: "Rice require standing water for part of its growth cycle."
      },
      corn: {
        ph: "5.8 - 7.0",
        moisture: "Moderate",
        temperature: "18\xB0C - 27\xB0C",
        type: "Well-drained Loam",
        notes: "Requires nitrogen-rich soil."
      },
      maize: {
        ph: "5.8 - 7.0",
        moisture: "Moderate",
        temperature: "18\xB0C - 27\xB0C",
        type: "Well-drained Loam",
        notes: "Same as corn; nitrogen-rich soil preferred."
      },
      potato: {
        ph: "4.8 - 5.5",
        moisture: "Steady/Consistent",
        temperature: "15\xB0C - 20\xB0C",
        type: "Sandy Loam",
        notes: "Acidic soil helps prevent scab disease."
      },
      wheat: {
        ph: "6.0 - 7.0",
        moisture: "Low - Moderate",
        temperature: "15\xB0C - 25\xB0C",
        type: "Loam or Clay Loam",
        notes: "Does not tolerate waterlogging well."
      },
      tomato: {
        ph: "6.0 - 6.8",
        moisture: "Regular/Even",
        temperature: "20\xB0C - 25\xB0C",
        type: "Sandy Loam",
        notes: "Needs calcium to prevent blossom end rot."
      },
      default: {
        ph: "6.0 - 7.0",
        moisture: "Moderate",
        temperature: "20\xB0C - 25\xB0C",
        type: "Loam",
        notes: "Standard agricultural soil conditions."
      }
    };
  }
});

// server/routes/predict.ts
import multer from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/multer/index.js";
async function runHuggingFace(image) {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  const model = process.env.HF_MODEL || "microsoft/resnet-50";
  if (!token) return null;
  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/octet-stream"
  };
  const res = await retry(
    () => fetchWithTimeout(
      url,
      { method: "POST", headers, body: image },
      12e3
    ),
    2,
    500
  );
  if (!res.ok) return null;
  try {
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.slice(0, 5).map((d) => ({ className: d.label, probability: d.score }));
    }
    return null;
  } catch {
    return null;
  }
}
async function runLocalAIService(file) {
  try {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("file", blob, file.originalname);
    const res = await fetch("http://localhost:8000/predict/disease", {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.log("Local AI service unreachable, using fallback");
  }
  return null;
}
var upload, uploadMiddleware, predictHandler;
var init_predict = __esm({
  "server/routes/predict.ts"() {
    init_http();
    init_soilData();
    upload = multer();
    uploadMiddleware = upload.single("image");
    predictHandler = async (req, res) => {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "file required" });
      let predictions = [];
      let source = "server-mock";
      let detectedCrop = "unknown";
      const localResult = await runLocalAIService(file);
      if (localResult && localResult.analysis) {
        source = "local-ai-service";
        if (localResult.analysis.disease) {
          predictions = [{
            className: localResult.analysis.disease,
            probability: localResult.analysis.confidence
          }];
        } else {
          predictions = [{
            className: localResult.analysis.status || "Healthy",
            probability: localResult.analysis.confidence || 0.99
          }];
        }
      } else {
        try {
          const hf = await runHuggingFace(file.buffer);
          if (hf) {
            source = "huggingface";
            predictions = hf;
          }
        } catch {
        }
      }
      if (predictions.length === 0) {
        const name = file.originalname || "image.jpg";
        const lower = name.toLowerCase();
        if (lower.includes("rice") || lower.includes("paddy")) {
          if (lower.includes("blast")) {
            predictions = [
              { className: "Rice Blast", probability: 0.92 },
              { className: "Brown Spot", probability: 0.05 },
              { className: "Healthy Rice", probability: 0.03 }
            ];
          } else if (lower.includes("brown")) {
            predictions = [
              { className: "Brown Spot", probability: 0.88 },
              { className: "Rice Blast", probability: 0.08 },
              { className: "Healthy Rice", probability: 0.04 }
            ];
          } else {
            predictions = [
              { className: "Healthy Rice", probability: 0.95 },
              { className: "Deficiency (Zinc)", probability: 0.03 },
              { className: "Rice Blast", probability: 0.02 }
            ];
          }
        } else if (lower.includes("corn") || lower.includes("maize")) {
          if (lower.includes("rust")) {
            predictions = [
              { className: "Common Rust", probability: 0.94 },
              { className: "Gray Leaf Spot", probability: 0.04 },
              { className: "Healthy Corn", probability: 0.02 }
            ];
          } else if (lower.includes("blight")) {
            predictions = [
              { className: "Northern Corn Leaf Blight", probability: 0.91 },
              { className: "Common Rust", probability: 0.06 },
              { className: "Healthy Corn", probability: 0.03 }
            ];
          } else {
            predictions = [
              { className: "Healthy Corn", probability: 0.96 },
              { className: "Common Rust", probability: 0.03 },
              { className: "Gray Leaf Spot", probability: 0.01 }
            ];
          }
        } else if (lower.includes("potato")) {
          if (lower.includes("early")) {
            predictions = [
              { className: "Early Blight", probability: 0.89 },
              { className: "Late Blight", probability: 0.07 },
              { className: "Healthy Potato", probability: 0.04 }
            ];
          } else if (lower.includes("late")) {
            predictions = [
              { className: "Late Blight", probability: 0.93 },
              { className: "Early Blight", probability: 0.05 },
              { className: "Healthy Potato", probability: 0.02 }
            ];
          } else {
            predictions = [
              { className: "Healthy Potato", probability: 0.97 },
              { className: "Early Blight", probability: 0.02 },
              { className: "Late Blight", probability: 0.01 }
            ];
          }
        } else if (lower.includes("blight") || lower.includes("fungus") || lower.includes("leaf")) {
          predictions = [
            { className: "Leaf blight (approx)", probability: 0.86 },
            { className: "Septoria-like", probability: 0.08 },
            { className: "Healthy leaf", probability: 0.06 }
          ];
        } else if (lower.includes("rust")) {
          predictions = [
            { className: "Rust disease (approx)", probability: 0.78 },
            { className: "Healthy leaf", probability: 0.15 }
          ];
        } else {
          predictions = [
            { className: "Healthy leaf", probability: 0.7 },
            { className: "Unknown", probability: 0.2 },
            { className: "Soil/Background", probability: 0.09 }
          ];
        }
      }
      const nameToCheck = file.originalname + " " + (predictions[0]?.className || "");
      const soilInfo = getSoilInfo(nameToCheck);
      res.json({
        source,
        predictions,
        soilInfo
      });
    };
  }
});

// server/routes/auth.ts
import bcrypt from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/bcryptjs/index.js";
var register, login, upsertFarmer, guestLogin, getDebugUsers, deleteDebugUser;
var init_auth = __esm({
  "server/routes/auth.ts"() {
    init_db();
    register = async (req, res) => {
      try {
        const { name, email, password, phone, soilType, landSize, language, location, role } = req.body;
        if (!name || !email || !password || !phone) {
          return res.status(400).json({ error: "Name, email, password, and phone are required" });
        }
        const existing = await Farmer.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: "User with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newFarmer = await Farmer.create({
          name,
          email,
          password: hashedPassword,
          phone,
          soilType,
          landSize,
          language: language || "en-IN",
          location,
          role: role || "farmer"
        });
        const { password: _, ...userWithoutPassword } = newFarmer.toObject ? newFarmer.toObject() : newFarmer;
        res.status(201).json(userWithoutPassword);
      } catch (e) {
        console.error("[auth] Register error:", e);
        res.status(500).json({ error: "Registration failed" });
      }
    };
    login = async (req, res) => {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ error: "Email and password are required" });
        }
        const farmer = await Farmer.findOne({ email });
        if (!farmer) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        if (farmer.password) {
          const match = await bcrypt.compare(password, farmer.password);
          if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
          }
        } else {
          return res.status(400).json({ error: "Please use phone login or reset password" });
        }
        const { password: _, ...userWithoutPassword } = farmer.toObject ? farmer.toObject() : farmer;
        res.json(userWithoutPassword);
      } catch (e) {
        console.error("[auth] Login error:", e);
        res.status(500).json({ error: "Login failed" });
      }
    };
    upsertFarmer = async (req, res) => {
      try {
        const { name, phone, soilType, landSize, language, location } = req.body;
        if (!name || !phone)
          return res.status(400).json({ error: "name and phone required" });
        const updateData = { name, phone, soilType, landSize, language, location };
        const data = await Farmer.findOneAndUpdate(
          { phone },
          updateData,
          { new: true, upsert: true }
        );
        res.json(data);
      } catch (e) {
        console.error("[auth] Unexpected error:", e);
        res.status(500).json({ error: "auth error" });
      }
    };
    guestLogin = async (req, res) => {
      try {
        const guest = {
          id: "guest_" + Date.now(),
          name: "Guest User",
          phone: void 0,
          language: req.body?.language || "en-IN",
          isGuest: true
        };
        return res.status(200).json(guest);
      } catch (e) {
        console.error("Guest login error:", e);
        return res.status(500).json({ error: "guest login error" });
      }
    };
    getDebugUsers = async (_req, res) => {
      try {
        const users = await Farmer.find({});
        res.json(users);
      } catch (e) {
        console.error("[auth] Debug users error:", e);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    };
    deleteDebugUser = async (req, res) => {
      try {
        const { id } = req.params;
        await Farmer.findByIdAndDelete(id);
        res.json({ success: true });
      } catch (e) {
        console.error("[auth] Delete user error:", e);
        res.status(500).json({ error: "Failed to delete user" });
      }
    };
  }
});

// server/routes/profile.ts
var saveAdvisoryHistory, getAdvisoryHistory, getProfileData, updateSubscription;
var init_profile = __esm({
  "server/routes/profile.ts"() {
    init_db();
    saveAdvisoryHistory = async (req, res) => {
      try {
        const { farmerId, crop, advisory, weatherData, soilData } = req.body;
        if (!farmerId || !crop || !advisory) {
          return res.status(400).json({ error: "farmerId, crop, and advisory are required" });
        }
        const data = await AdvisoryHistory.create({
          farmerId,
          crop,
          advisory,
          weatherData,
          soilData
        });
        res.json(data);
      } catch (e) {
        console.error("[profile] Error:", e);
        res.status(500).json({ error: "Failed to save advisory" });
      }
    };
    getAdvisoryHistory = async (req, res) => {
      try {
        const { farmerId } = req.params;
        const limit = Number(req.query.limit || 10);
        if (!farmerId) {
          return res.status(400).json({ error: "farmerId is required" });
        }
        const data = await AdvisoryHistory.find({ farmerId }).sort({ createdAt: -1 }).limit(limit);
        res.json(data || []);
      } catch (e) {
        console.error("[profile] Error:", e);
        res.status(500).json({ error: "Failed to fetch history" });
      }
    };
    getProfileData = async (req, res) => {
      try {
        const { farmerId } = req.params;
        if (!farmerId) {
          return res.status(400).json({ error: "farmerId is required" });
        }
        const data = await Farmer.findById(farmerId);
        if (!data) {
          console.error("[profile] Farmer not found");
          return res.status(404).json({ error: "Farmer not found" });
        }
        res.json({
          ...data,
          subscriptionStatus: data.subscriptionStatus || "free"
        });
      } catch (e) {
        console.error("[profile] Error:", e);
        res.status(500).json({ error: "Failed to fetch profile" });
      }
    };
    updateSubscription = async (req, res) => {
      try {
        const { farmerId } = req.params;
        const { subscriptionStatus } = req.body;
        if (!farmerId) {
          return res.status(400).json({ error: "farmerId is required" });
        }
        if (!["free", "premium"].includes(subscriptionStatus)) {
          return res.status(400).json({ error: "Invalid subscription status" });
        }
        const now = /* @__PURE__ */ new Date();
        const endDate = /* @__PURE__ */ new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        const updatePayload = {
          subscriptionStatus,
          subscriptionStartDate: now
        };
        if (subscriptionStatus === "premium") {
          updatePayload.subscriptionEndDate = endDate;
        }
        const data = await Farmer.findByIdAndUpdate(farmerId, updatePayload, {
          new: true
        });
        if (!data) {
          console.error("[profile] Farmer not found");
          return res.status(404).json({ error: "Farmer not found" });
        }
        res.json(data);
      } catch (e) {
        console.error("[profile] Error:", e);
        res.status(500).json({ error: "Failed to update subscription" });
      }
    };
  }
});

// server/routes/analytics.ts
var recordAnalytics, getAnalyticsSummary, getCropTrends, getSoilHealthTrend, getWeatherImpactAnalysis, getSystemOverview;
var init_analytics = __esm({
  "server/routes/analytics.ts"() {
    init_db();
    recordAnalytics = async (req, res) => {
      try {
        const {
          farmerId,
          crop,
          cropHealthScore,
          soilMoisture,
          soilNitrogen,
          soilPH,
          temperature,
          humidity,
          rainfall,
          pestPressure,
          diseaseRisk
        } = req.body;
        if (!farmerId || !crop) {
          return res.status(400).json({ error: "farmerId and crop are required" });
        }
        const data = await AnalyticsData.create({
          farmerId,
          crop,
          cropHealthScore,
          soilMoisture,
          soilNitrogen,
          soilPH,
          temperature,
          humidity,
          rainfall,
          pestPressure,
          diseaseRisk
        });
        res.json(data);
      } catch (e) {
        console.error("[analytics] Error:", e);
        res.status(500).json({ error: "Failed to record analytics" });
      }
    };
    getAnalyticsSummary = async (req, res) => {
      try {
        const { farmerId } = req.params;
        const days = Number(req.query.days || 30);
        if (!farmerId) {
          return res.status(400).json({ error: "farmerId is required" });
        }
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const allAnalytics = await AnalyticsData.find({
          farmerId,
          createdAt: { $gte: cutoffDate }
        });
        const advisories = await AdvisoryHistory.find({ farmerId });
        const recentData = allAnalytics || [];
        const cropStats = /* @__PURE__ */ new Map();
        (advisories || []).forEach((adv) => {
          if (!cropStats.has(adv.crop)) {
            cropStats.set(adv.crop, { count: 0, scores: [] });
          }
          const stats = cropStats.get(adv.crop);
          stats.count++;
          stats.scores.push(Math.random() * 30 + 70);
        });
        const cropPerformance = Array.from(cropStats.entries()).map(
          ([crop, stats]) => ({
            crop,
            count: stats.count,
            avgScore: stats.scores.length > 0 ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length : 0
          })
        );
        const soilHealthTrend = recentData.filter(
          (d) => d.soilMoisture !== void 0 || d.soilNitrogen !== void 0 || d.soilPH !== void 0
        ).slice(-7).map((d) => ({
          date: new Date(d.createdAt).toLocaleDateString("en-IN"),
          moisture: d.soilMoisture || Math.random() * 100,
          nitrogen: d.soilNitrogen || Math.random() * 100,
          pH: d.soilPH || 5 + Math.random() * 3
        }));
        if (soilHealthTrend.length === 0) {
          for (let i = 6; i >= 0; i--) {
            const date = /* @__PURE__ */ new Date();
            date.setDate(date.getDate() - i);
            soilHealthTrend.push({
              date: date.toLocaleDateString("en-IN"),
              moisture: 40 + Math.random() * 40,
              nitrogen: 30 + Math.random() * 50,
              pH: 6 + Math.random() * 1.5
            });
          }
        }
        const temps = recentData.filter((d) => d.temperature !== void 0).map((d) => d.temperature);
        const humidities = recentData.filter((d) => d.humidity !== void 0).map((d) => d.humidity);
        const rainfalls = recentData.filter((d) => d.rainfall !== void 0).map((d) => d.rainfall);
        const weatherImpact = {
          temperature: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 25 + Math.random() * 15,
          humidity: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 50 + Math.random() * 30,
          rainfall: rainfalls.length > 0 ? rainfalls.reduce((a, b) => a + b, 0) / rainfalls.length : Math.random() * 50
        };
        const pestAnalysis = [
          {
            type: "Aphids",
            risk: Math.random() * 80,
            frequency: Math.floor(Math.random() * 5) + 1
          },
          {
            type: "Whiteflies",
            risk: Math.random() * 60,
            frequency: Math.floor(Math.random() * 4) + 1
          },
          {
            type: "Leaf Miners",
            risk: Math.random() * 70,
            frequency: Math.floor(Math.random() * 3) + 1
          }
        ];
        res.json({
          totalAdvisories: (advisories || []).length,
          cropPerformance,
          soilHealthTrend,
          weatherImpact,
          pestAnalysis
        });
      } catch (e) {
        console.error("[analytics] Error:", e);
        res.status(500).json({ error: "Failed to fetch analytics" });
      }
    };
    getCropTrends = async (req, res) => {
      try {
        const { farmerId } = req.params;
        const { crop } = req.query;
        if (!farmerId || !crop) {
          return res.status(400).json({ error: "farmerId and crop are required" });
        }
        const data = await AnalyticsData.find({ farmerId, crop }).sort({ createdAt: 1 }).limit(30);
        const trends = (data || []).slice(-30).map((d) => ({
          date: new Date(d.createdAt).toLocaleDateString("en-IN"),
          healthScore: d.cropHealthScore || 0,
          yield: d.yield || 0,
          pestPressure: d.pestPressure || 0,
          diseaseRisk: d.diseaseRisk || 0
        }));
        if (trends.length === 0) {
          for (let i = 0; i < 15; i++) {
            const date = /* @__PURE__ */ new Date();
            date.setDate(date.getDate() - (15 - i));
            trends.push({
              date: date.toLocaleDateString("en-IN"),
              healthScore: 60 + Math.random() * 35,
              yield: 50 + Math.random() * 40,
              pestPressure: Math.random() * 60,
              diseaseRisk: Math.random() * 50
            });
          }
        }
        res.json(trends);
      } catch (e) {
        console.error("[analytics] Error:", e);
        res.status(500).json({ error: "Failed to fetch crop trends" });
      }
    };
    getSoilHealthTrend = async (req, res) => {
      try {
        const { farmerId } = req.params;
        if (!farmerId) {
          return res.status(400).json({ error: "farmerId is required" });
        }
        const data = await AnalyticsData.find({ farmerId }).sort({ createdAt: 1 }).limit(30);
        const trend = (data || []).filter(
          (d) => d.soilMoisture !== void 0 || d.soilNitrogen !== void 0 || d.soilPH !== void 0
        ).slice(-30).map((d) => ({
          date: new Date(d.createdAt).toLocaleDateString("en-IN"),
          moisture: d.soilMoisture || 0,
          nitrogen: d.soilNitrogen || 0,
          pH: d.soilPH || 0
        }));
        if (trend.length === 0) {
          for (let i = 0; i < 15; i++) {
            const date = /* @__PURE__ */ new Date();
            date.setDate(date.getDate() - (15 - i));
            trend.push({
              date: date.toLocaleDateString("en-IN"),
              moisture: 30 + Math.random() * 50,
              nitrogen: 20 + Math.random() * 60,
              pH: 5.8 + Math.random() * 1.8
            });
          }
        }
        res.json(trend);
      } catch (e) {
        console.error("[analytics] Error:", e);
        res.status(500).json({ error: "Failed to fetch soil health trend" });
      }
    };
    getWeatherImpactAnalysis = async (req, res) => {
      try {
        const { farmerId } = req.params;
        const days = Number(req.query.days || 30);
        if (!farmerId) {
          return res.status(400).json({ error: "farmerId is required" });
        }
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const data = await AnalyticsData.find({
          farmerId,
          createdAt: { $gte: cutoffDate }
        }).sort({ createdAt: 1 }).limit(15);
        const analysis = (data || []).filter(
          (d) => d.temperature !== void 0 || d.humidity !== void 0 || d.rainfall !== void 0
        ).slice(-15).map((d) => ({
          date: new Date(d.createdAt).toLocaleDateString("en-IN"),
          temperature: d.temperature || 0,
          humidity: d.humidity || 0,
          rainfall: d.rainfall || 0,
          cropHealthScore: d.cropHealthScore || 0
        }));
        if (analysis.length === 0) {
          for (let i = 0; i < 15; i++) {
            const date = /* @__PURE__ */ new Date();
            date.setDate(date.getDate() - (15 - i));
            analysis.push({
              date: date.toLocaleDateString("en-IN"),
              temperature: 20 + Math.random() * 20,
              humidity: 40 + Math.random() * 40,
              rainfall: Math.random() * 30,
              cropHealthScore: 65 + Math.random() * 30
            });
          }
        }
        res.json(analysis);
      } catch (e) {
        console.error("[analytics] Error:", e);
        res.status(500).json({ error: "Failed to fetch weather impact analysis" });
      }
    };
    getSystemOverview = async (_req, res) => {
      try {
        const totalFarmers = await Farmer.countDocuments();
        const activeToday = 45;
        const totalScans = await AnalyticsData.countDocuments();
        const diseaseDetectionRate = 0.18;
        const activeWithdrawals = 3;
        const totalTreatmentsLogged = 89;
        const diseaseDistribution = [
          { name: "Leaf Blight", value: 45 },
          { name: "Yellow Rust", value: 25 },
          { name: "Aphids", value: 20 },
          { name: "Healthy", value: 10 }
        ];
        const adoptionTrend = [
          { month: "Jan", users: 20 },
          { month: "Feb", users: 45 },
          { month: "Mar", users: 78 },
          { month: "Apr", users: 110 },
          { month: "May", users: 124 }
        ];
        res.json({
          metrics: {
            totalFarmers,
            activeToday,
            totalScans,
            activeWithdrawals,
            totalTreatmentsLogged
          },
          diseaseDistribution,
          adoptionTrend
        });
      } catch (e) {
        console.error("[analytics] Error:", e);
        res.status(500).json({ error: "Failed to fetch system overview" });
      }
    };
  }
});

// server/routes/neon.ts
var getPostById;
var init_neon = __esm({
  "server/routes/neon.ts"() {
    getPostById = async (req, res) => {
      try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "id required" });
        const { neon } = await import("file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/@netlify/neon/dist/index.js");
        const sql = neon();
        const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;
        if (!rows || rows.length === 0)
          return res.status(404).json({ error: "not found" });
        return res.json({ rows });
      } catch (e) {
        const msg = typeof e?.message === "string" ? e.message : "query failed";
        return res.status(500).json({ error: msg });
      }
    };
  }
});

// server/lib/ledger.ts
import crypto from "crypto";
var HashChain, ledger;
var init_ledger = __esm({
  "server/lib/ledger.ts"() {
    init_db();
    HashChain = class {
      chain;
      constructor() {
        this.chain = [];
        this.initialize();
      }
      async initialize() {
        try {
          const blocks = await Block.find({}).sort({ index: 1 });
          if (blocks.length > 0) {
            this.chain = blocks.map((b) => ({
              index: b.index,
              timestamp: b.timestamp,
              data: b.data,
              previousHash: b.previousHash,
              hash: b.hash
            }));
          } else {
            const genesis = this.createGenesisBlock();
            await Block.create(genesis);
            this.chain = [genesis];
          }
        } catch (error) {
          console.error("Failed to initialize ledger:", error);
          this.chain = [this.createGenesisBlock()];
        }
      }
      createGenesisBlock() {
        return {
          index: 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          data: "Genesis Block",
          previousHash: "0",
          hash: this.calculateHash(0, "0", (/* @__PURE__ */ new Date()).toISOString(), "Genesis Block")
        };
      }
      calculateHash(index, previousHash, timestamp, data) {
        return crypto.createHash("sha256").update(index + previousHash + timestamp + JSON.stringify(data)).digest("hex");
      }
      getLatestBlock() {
        return this.chain[this.chain.length - 1];
      }
      async addBlock(data) {
        const latestBlock = this.getLatestBlock();
        const index = latestBlock.index + 1;
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const previousHash = latestBlock.hash;
        const hash = this.calculateHash(index, previousHash, timestamp, data);
        const newBlock = {
          index,
          timestamp,
          data,
          previousHash,
          hash
        };
        this.chain.push(newBlock);
        try {
          await Block.create(newBlock);
        } catch (e) {
          console.error("Failed to persist block to DB", e);
        }
        return newBlock;
      }
      isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
          const currentBlock = this.chain[i];
          const previousBlock = this.chain[i - 1];
          const recalculatedHash = this.calculateHash(
            currentBlock.index,
            currentBlock.previousHash,
            currentBlock.timestamp,
            currentBlock.data
          );
          if (currentBlock.hash !== recalculatedHash) {
            return false;
          }
          if (currentBlock.previousHash !== previousBlock.hash) {
            return false;
          }
        }
        return true;
      }
    };
    ledger = new HashChain();
  }
});

// server/routes/amu.ts
function getWithdrawalEndDate(startDate, days) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
var logTreatment, getAnimalStatus, getLedger;
var init_amu = __esm({
  "server/routes/amu.ts"() {
    init_ledger();
    init_db();
    logTreatment = async (req, res) => {
      try {
        const { animalId, drugName, dosage, withdrawalDays, applicator } = req.body;
        if (!animalId || !drugName || !withdrawalDays) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        const treatmentDate = (/* @__PURE__ */ new Date()).toISOString();
        const logEntry = {
          animalId,
          drugName,
          dosage,
          withdrawalDays: Number(withdrawalDays),
          applicator: applicator || "Farmer",
          treatmentDate
        };
        const block = await ledger.addBlock(logEntry);
        await DrugLog.create(logEntry);
        res.status(201).json({
          message: "Treatment logged successfully",
          blockIndex: block.index,
          blockHash: block.hash,
          withdrawalEnds: getWithdrawalEndDate(treatmentDate, Number(withdrawalDays))
        });
      } catch (error) {
        console.error("[amu] Log error:", error);
        res.status(500).json({ error: "Failed to log treatment" });
      }
    };
    getAnimalStatus = async (req, res) => {
      try {
        const { animalId } = req.params;
        const records = await DrugLog.find({ animalId });
        const now = /* @__PURE__ */ new Date();
        let isSafe = true;
        let activeWithdrawal = null;
        for (const record of records) {
          const tDate = new Date(record.treatmentDate);
          const endDate = new Date(tDate);
          endDate.setDate(endDate.getDate() + record.withdrawalDays);
          if (now < endDate) {
            isSafe = false;
            activeWithdrawal = {
              drug: record.drugName,
              endsAt: endDate.toISOString()
            };
            break;
          }
        }
        res.json({
          animalId,
          status: isSafe ? "SAFE" : "WITHDRAWAL_ACTIVE",
          activeWithdrawal,
          historyCount: records.length
        });
      } catch (e) {
        console.error("[amu] Status error:", e);
        res.status(500).json({ error: "Failed to get status" });
      }
    };
    getLedger = (_req, res) => {
      const isValid = ledger.isChainValid();
      res.json({
        isValid,
        chainLength: ledger.chain.length,
        blocks: ledger.chain
      });
    };
  }
});

// server/routes/alerts.ts
var getActiveAlerts, createAlert, deleteAlert;
var init_alerts = __esm({
  "server/routes/alerts.ts"() {
    init_db();
    getActiveAlerts = async (req, res) => {
      try {
        const alerts = await SystemAlert.find({ active: true });
        res.json(alerts);
      } catch (e) {
        console.error("[alerts] Error fetching alerts:", e);
        res.status(500).json({ error: "Failed to fetch alerts" });
      }
    };
    createAlert = async (req, res) => {
      try {
        const { message, type } = req.body;
        if (!message) {
          return res.status(400).json({ error: "Message is required" });
        }
        const alert = await SystemAlert.create({
          message,
          type: type || "info",
          active: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
          // Default 24h expiration
        });
        res.status(201).json(alert);
      } catch (e) {
        console.error("[alerts] Error creating alert:", e);
        res.status(500).json({ error: "Failed to create alert" });
      }
    };
    deleteAlert = async (req, res) => {
      const { id } = req.params;
      try {
        if (SystemAlert.deleteOne) {
          await SystemAlert.deleteOne({ _id: id });
        } else if (SystemAlert.items) {
          SystemAlert.items = SystemAlert.items.filter((a) => String(a._id) !== String(id));
        }
        res.json({ success: true });
      } catch (e) {
        console.error("[alerts] Error deleting:", e);
        res.status(500).json({ error: "Failed to delete alert" });
      }
    };
  }
});

// server/index.ts
var server_exports = {};
__export(server_exports, {
  createServer: () => createServer
});
import "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/dotenv/config.js";
import express from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/express/index.js";
import cors from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/cors/lib/index.js";
import bcrypt2 from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/bcryptjs/index.js";
function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const dbReady = connectDB();
  dbReady.then(async () => {
    try {
      const adminEmail = "admin.agri@agriverse.in";
      const existingAdmin = await Farmer.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt2.hash("Admin@2027", 10);
        await Farmer.create({
          name: "System Admin",
          email: adminEmail,
          password: hashedPassword,
          phone: "0000000000",
          soilType: "None",
          landSize: 0,
          location: "Headquarters",
          role: "admin"
        });
        console.log("[db] Seeded permanent admin account: " + adminEmail);
      }
    } catch (err) {
      console.error("[db] Error seeding admin:", err);
    }
  });
  app.use(async (_req, _res, next) => {
    try {
      await dbReady;
    } catch {
    }
    next();
  });
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);
  app.post("/api/farmers", createFarmer);
  app.get("/api/farmers", getAllFarmers);
  app.get("/api/farmers/:id", getFarmer);
  app.delete("/api/farmers/:id", deleteFarmer);
  app.patch("/api/farmers/:id/status", updateFarmerStatus);
  app.get("/api/weather", getWeather);
  app.post("/api/advisories", createAdvisory);
  app.get("/api/market", getMarketPrices);
  app.post("/api/chat", chatHandler);
  app.post("/api/predict", uploadMiddleware, predictHandler);
  app.get("/api/alerts", getActiveAlerts);
  app.post("/api/alerts", createAlert);
  app.delete("/api/alerts/:id", deleteAlert);
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/farmer", upsertFarmer);
  app.post("/api/auth/guest", guestLogin);
  app.get("/api/debug/users", getDebugUsers);
  app.delete("/api/debug/users/:id", deleteDebugUser);
  app.post("/api/amu/log", logTreatment);
  app.get("/api/amu/status/:animalId", getAnimalStatus);
  app.get("/api/amu/ledger", getLedger);
  app.post("/api/advisory/history", saveAdvisoryHistory);
  app.get("/api/advisory/history/:farmerId", getAdvisoryHistory);
  app.patch("/api/advisory/history/:id/feedback", submitFeedback);
  app.get("/api/profile/:farmerId", getProfileData);
  app.put("/api/profile/:farmerId/subscription", updateSubscription);
  app.post("/api/analytics/record", recordAnalytics);
  app.get("/api/analytics/summary/:farmerId", getAnalyticsSummary);
  app.get("/api/analytics/crop-trends/:farmerId", getCropTrends);
  app.get("/api/analytics/soil-health/:farmerId", getSoilHealthTrend);
  app.get("/api/analytics/weather-impact/:farmerId", getWeatherImpactAnalysis);
  app.get("/api/analytics/system", getSystemOverview);
  app.get("/api/neon/posts/:id", getPostById);
  return app;
}
var init_server = __esm({
  "server/index.ts"() {
    init_demo();
    init_db();
    init_farmers();
    init_db();
    init_weather();
    init_advisory();
    init_market();
    init_chat();
    init_predict();
    init_auth();
    init_profile();
    init_analytics();
    init_neon();
    init_amu();
    init_alerts();
  }
});

// vite.config.ts
import { defineConfig } from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/vite/dist/node/index.js";
import react from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { VitePWA } from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "D:\\PD17\\GitHub_Projects\\Smart-Crop-Tools";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    // Allow overriding port via PORT env var (useful when 8080 is in use)
    port: Number(process.env.PORT) || 8080,
    // Allow serving files from project root (index.html) as well as client/shared
    fs: {
      allow: ["./", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"]
    }
  },
  build: {
    outDir: "dist/spa",
    chunkSizeWarningLimit: 1e3
  },
  plugins: [
    react(),
    expressPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon.svg"],
      manifest: {
        name: "AgriVerse - Smart Farming",
        short_name: "AgriVerse",
        description: "AI-powered sustainable farming assistant",
        theme_color: "#16a34a",
        icons: [
          {
            src: "icon.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "icon.svg",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./client"),
      "@shared": path.resolve(__vite_injected_original_dirname, "./shared")
    }
  }
}));
function expressPlugin() {
  return {
    name: "express-plugin",
    apply: "serve",
    // Only apply during development (serve mode)
    async configureServer(server) {
      const { createServer: createServer2 } = await Promise.resolve().then(() => (init_server(), server_exports));
      const app = createServer2();
      server.middlewares.use(app);
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic2VydmVyL3JvdXRlcy9kZW1vLnRzIiwgInNlcnZlci9kYi50cyIsICJzZXJ2ZXIvcm91dGVzL2Zhcm1lcnMudHMiLCAic2VydmVyL3V0aWxzL2NhY2hlLnRzIiwgInNlcnZlci91dGlscy9odHRwLnRzIiwgInNlcnZlci9yb3V0ZXMvd2VhdGhlci50cyIsICJzZXJ2ZXIvcm91dGVzL2Fkdmlzb3J5LnRzIiwgInNlcnZlci9yb3V0ZXMvbWFya2V0LnRzIiwgInNlcnZlci9yb3V0ZXMvY2hhdC50cyIsICJzZXJ2ZXIvdXRpbHMvc29pbERhdGEudHMiLCAic2VydmVyL3JvdXRlcy9wcmVkaWN0LnRzIiwgInNlcnZlci9yb3V0ZXMvYXV0aC50cyIsICJzZXJ2ZXIvcm91dGVzL3Byb2ZpbGUudHMiLCAic2VydmVyL3JvdXRlcy9hbmFseXRpY3MudHMiLCAic2VydmVyL3JvdXRlcy9uZW9uLnRzIiwgInNlcnZlci9saWIvbGVkZ2VyLnRzIiwgInNlcnZlci9yb3V0ZXMvYW11LnRzIiwgInNlcnZlci9yb3V0ZXMvYWxlcnRzLnRzIiwgInNlcnZlci9pbmRleC50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXGRlbW8udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9kZW1vLnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBEZW1vUmVzcG9uc2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL2FwaVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZURlbW86IFJlcXVlc3RIYW5kbGVyID0gKF9yZXEsIHJlcykgPT4ge1xyXG4gIGNvbnN0IHJlc3BvbnNlOiBEZW1vUmVzcG9uc2UgPSB7XHJcbiAgICBtZXNzYWdlOiBcIkhlbGxvIGZyb20gRXhwcmVzcyBzZXJ2ZXJcIixcclxuICB9O1xyXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3BvbnNlKTtcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxcZGIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL2RiLnRzXCI7aW1wb3J0IFwiZG90ZW52L2NvbmZpZ1wiO1xyXG5pbXBvcnQgbW9uZ29vc2UgZnJvbSBcIm1vbmdvb3NlXCI7XHJcblxyXG4vLyBEaXNhYmxlIGJ1ZmZlcmluZzogb3BlcmF0aW9ucyBmYWlsIGltbWVkaWF0ZWx5IGlmIG5vdCBjb25uZWN0ZWQgKG5vIGluZGVmaW5pdGUgaGFuZylcclxubW9uZ29vc2Uuc2V0KFwiYnVmZmVyQ29tbWFuZHNcIiwgZmFsc2UpO1xyXG5cclxuY29uc29sZS5sb2coXCJbZGJdIExvYWRpbmcgZGIudHMuIFVSSTpcIiwgcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkkgPyBcInNldFwiIDogXCJub3Qgc2V0XCIpO1xyXG5jb25zdCBVU0VfTUVNT1JZID0gIXByb2Nlc3MuZW52Lk1PTkdPREJfVVJJO1xyXG5jb25zb2xlLmxvZyhcIltkYl0gVVNFX01FTU9SWTpcIiwgVVNFX01FTU9SWSk7XHJcblxyXG50eXBlIEFueURvYyA9IFJlY29yZDxzdHJpbmcsIGFueT4gJiB7XHJcbiAgX2lkPzogc3RyaW5nO1xyXG4gIGNyZWF0ZWRBdD86IERhdGU7XHJcbiAgdXBkYXRlZEF0PzogRGF0ZTtcclxufTtcclxuXHJcbmNsYXNzIEluTWVtb3J5Q29sbGVjdGlvbjxUIGV4dGVuZHMgQW55RG9jPiB7XHJcbiAgcHJpdmF0ZSBpdGVtczogVFtdID0gW107XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuYW1lOiBzdHJpbmcpIHsgfVxyXG5cclxuICBwcml2YXRlIGdlbklkKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMClcclxuICAgICkudG9Mb3dlckNhc2UoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNyZWF0ZShkb2M6IFBhcnRpYWw8VD4pOiBQcm9taXNlPFQ+IHtcclxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICBjb25zdCBvdXQgPSB7XHJcbiAgICAgIC4uLihkb2MgYXMgVCksXHJcbiAgICAgIF9pZDogdGhpcy5nZW5JZCgpLFxyXG4gICAgICBjcmVhdGVkQXQ6IG5vdyxcclxuICAgICAgdXBkYXRlZEF0OiBub3csXHJcbiAgICB9IGFzIFQ7XHJcbiAgICB0aGlzLml0ZW1zLnB1c2gob3V0KTtcclxuICAgIHJldHVybiBzdHJ1Y3R1cmVkQ2xvbmUob3V0KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZpbmRCeUlkKGlkOiBzdHJpbmcpOiBQcm9taXNlPFQgfCBudWxsPiB7XHJcbiAgICBjb25zdCBmb3VuZCA9IHRoaXMuaXRlbXMuZmluZCgoZCkgPT4gU3RyaW5nKGQuX2lkKSA9PT0gU3RyaW5nKGlkKSk7XHJcbiAgICByZXR1cm4gZm91bmQgPyAoc3RydWN0dXJlZENsb25lKGZvdW5kKSBhcyBUKSA6IG51bGw7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjb3VudERvY3VtZW50cyhmaWx0ZXI6IFBhcnRpYWw8VD4gPSB7fSk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICBjb25zdCBmaWx0ZXJlZCA9IHRoaXMuaXRlbXMuZmlsdGVyKChkKSA9PlxyXG4gICAgICBPYmplY3QuZW50cmllcyhmaWx0ZXIpLmV2ZXJ5KChbaywgdl0pID0+IChkIGFzIGFueSlba10gPT09IHYpXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGZpbHRlcmVkLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIGZpbmQoZmlsdGVyOiBQYXJ0aWFsPFQ+KTogYW55IHtcclxuICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5pdGVtc1xyXG4gICAgICAuZmlsdGVyKChkKSA9PlxyXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGZpbHRlcikuZXZlcnkoKFtrLCB2XSkgPT4gKGQgYXMgYW55KVtrXSA9PT0gdiksXHJcbiAgICAgIClcclxuICAgICAgLm1hcCgoZCkgPT4gc3RydWN0dXJlZENsb25lKGQpIGFzIFQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGl0ZW1zOiBmaWx0ZXJlZCxcclxuICAgICAgc29ydChjcml0ZXJpYTogUmVjb3JkPHN0cmluZywgMSB8IC0xPikge1xyXG4gICAgICAgIGNvbnN0IFtrZXksIG9yZGVyXSA9IE9iamVjdC5lbnRyaWVzKGNyaXRlcmlhKVswXTtcclxuICAgICAgICB0aGlzLml0ZW1zLnNvcnQoKGE6IGFueSwgYjogYW55KSA9PiB7XHJcbiAgICAgICAgICBpZiAoYVtrZXldIDwgYltrZXldKSByZXR1cm4gb3JkZXIgPT09IDEgPyAtMSA6IDE7XHJcbiAgICAgICAgICBpZiAoYVtrZXldID4gYltrZXldKSByZXR1cm4gb3JkZXIgPT09IDEgPyAxIDogLTE7XHJcbiAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSxcclxuICAgICAgbGltaXQobjogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoMCwgbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRoZW4ocmVzb2x2ZTogKHZhbHVlOiBUW10pID0+IHZvaWQpIHtcclxuICAgICAgICByZXNvbHZlKHRoaXMuaXRlbXMpO1xyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZpbmRPbmVBbmRVcGRhdGUoXHJcbiAgICBmaWx0ZXI6IFBhcnRpYWw8VD4sXHJcbiAgICB1cGRhdGU6IGFueSxcclxuICAgIG9wdGlvbnM6IHsgbmV3PzogYm9vbGVhbjsgdXBzZXJ0PzogYm9vbGVhbiB9ID0ge30sXHJcbiAgKTogUHJvbWlzZTxUIHwgbnVsbD4ge1xyXG4gICAgY29uc3QgbWF0Y2ggPSB0aGlzLml0ZW1zLmZpbmQoKGQpID0+XHJcbiAgICAgIE9iamVjdC5lbnRyaWVzKGZpbHRlcikuZXZlcnkoKFtrLCB2XSkgPT4gKGQgYXMgYW55KVtrXSA9PT0gdiksXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICBjb25zdCBhcHBseVVwZGF0ZSA9IChiYXNlOiBUKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNsb25lID0geyAuLi5iYXNlIH0gYXMgVDtcclxuICAgICAgY29uc3QgcGxhaW4gPSBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICAgICAgT2JqZWN0LmVudHJpZXModXBkYXRlKS5maWx0ZXIoKFtrXSkgPT4gayAhPT0gXCIkc2V0T25JbnNlcnRcIiksXHJcbiAgICAgICk7XHJcbiAgICAgIE9iamVjdC5hc3NpZ24oY2xvbmUsIHBsYWluKTtcclxuICAgICAgY2xvbmUudXBkYXRlZEF0ID0gbm93O1xyXG4gICAgICByZXR1cm4gY2xvbmU7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChtYXRjaCkge1xyXG4gICAgICBjb25zdCB1cGRhdGVkID0gYXBwbHlVcGRhdGUobWF0Y2gpO1xyXG4gICAgICBjb25zdCBpZHggPSB0aGlzLml0ZW1zLmluZGV4T2YobWF0Y2gpO1xyXG4gICAgICB0aGlzLml0ZW1zW2lkeF0gPSB1cGRhdGVkO1xyXG4gICAgICByZXR1cm4gc3RydWN0dXJlZENsb25lKHVwZGF0ZWQpIGFzIFQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnMudXBzZXJ0KSB7XHJcbiAgICAgIGNvbnN0IHBsYWluID0gT2JqZWN0LmZyb21FbnRyaWVzKFxyXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHVwZGF0ZSB8fCB7fSkuZmlsdGVyKChba10pID0+IGsgIT09IFwiJHNldE9uSW5zZXJ0XCIpLFxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBiYXNlOiBUID0ge1xyXG4gICAgICAgIC4uLih1cGRhdGU/LiRzZXRPbkluc2VydCB8fCB7fSksXHJcbiAgICAgICAgLi4ucGxhaW4sXHJcbiAgICAgIH0gYXMgVDtcclxuXHJcbiAgICAgIGNvbnN0IG91dCA9IHtcclxuICAgICAgICAuLi5iYXNlLFxyXG4gICAgICAgIF9pZDogdGhpcy5nZW5JZCgpLFxyXG4gICAgICAgIGNyZWF0ZWRBdDogKGJhc2UgYXMgYW55KS5jcmVhdGVkQXQgfHwgbm93LFxyXG4gICAgICAgIHVwZGF0ZWRBdDogbm93LFxyXG4gICAgICB9IGFzIFQ7XHJcbiAgICAgIHRoaXMuaXRlbXMucHVzaChvdXQpO1xyXG4gICAgICByZXR1cm4gc3RydWN0dXJlZENsb25lKG91dCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGFzeW5jIGZpbmRPbmUoZmlsdGVyOiBQYXJ0aWFsPFQ+KTogUHJvbWlzZTxUIHwgbnVsbD4ge1xyXG4gICAgY29uc3QgZm91bmQgPSB0aGlzLml0ZW1zLmZpbmQoKGQpID0+XHJcbiAgICAgIE9iamVjdC5lbnRyaWVzKGZpbHRlcikuZXZlcnkoKFtrLCB2XSkgPT4gKGQgYXMgYW55KVtrXSA9PT0gdiksXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGZvdW5kID8gKHN0cnVjdHVyZWRDbG9uZShmb3VuZCkgYXMgVCkgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZmluZEJ5SWRBbmREZWxldGUoaWQ6IHN0cmluZyk6IFByb21pc2U8VCB8IG51bGw+IHtcclxuICAgIGNvbnN0IGlkeCA9IHRoaXMuaXRlbXMuZmluZEluZGV4KChkKSA9PiBTdHJpbmcoZC5faWQpID09PSBTdHJpbmcoaWQpKTtcclxuICAgIGlmIChpZHggPT09IC0xKSByZXR1cm4gbnVsbDtcclxuICAgIGNvbnN0IFtkZWxldGVkXSA9IHRoaXMuaXRlbXMuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICByZXR1cm4gc3RydWN0dXJlZENsb25lKGRlbGV0ZWQpIGFzIFQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkZWxldGVPbmUoZmlsdGVyOiBQYXJ0aWFsPFQ+KTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICBjb25zdCBpZHggPSB0aGlzLml0ZW1zLmZpbmRJbmRleCgoZCkgPT5cclxuICAgICAgT2JqZWN0LmVudHJpZXMoZmlsdGVyKS5ldmVyeSgoW2ssIHZdKSA9PiAoZCBhcyBhbnkpW2tdID09PSB2KSxcclxuICAgICk7XHJcbiAgICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgdGhpcy5pdGVtcy5zcGxpY2UoaWR4LCAxKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxubGV0IF9jb25uZWN0ZWQgPSBmYWxzZTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25uZWN0REIodXJpPzogc3RyaW5nKSB7XHJcbiAgY29uc3QgbW9uZ29VcmkgPSB1cmkgfHwgcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkk7XHJcbiAgaWYgKCFtb25nb1VyaSkge1xyXG4gICAgY29uc29sZS53YXJuKFwiW2RiXSBNT05HT0RCX1VSSSBub3Qgc2V0LiBVc2luZyBpbi1tZW1vcnkgc3RvcmFnZS5cIik7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgaWYgKG1vbmdvb3NlLmNvbm5lY3Rpb24ucmVhZHlTdGF0ZSA9PT0gMSkgcmV0dXJuIG1vbmdvb3NlLmNvbm5lY3Rpb247XHJcblxyXG4gIC8vIFRyeSBvbmNlIHF1aWNrbHkgc28gd2UgZG9uJ3QgYmxvY2sgc2VydmVyIHN0YXJ0dXBcclxuICB0cnkge1xyXG4gICAgYXdhaXQgbW9uZ29vc2UuY29ubmVjdChtb25nb1VyaSwgeyBzZXJ2ZXJTZWxlY3Rpb25UaW1lb3V0TVM6IDUwMDAgfSk7XHJcbiAgICBfY29ubmVjdGVkID0gdHJ1ZTtcclxuICAgIGNvbnNvbGUubG9nKFwiW2RiXSBDb25uZWN0ZWQgdG8gTW9uZ29EQiBBdGxhcyBcdTI3MTNcIik7XHJcbiAgICByZXR1cm4gbW9uZ29vc2UuY29ubmVjdGlvbjtcclxuICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgY29uc29sZS53YXJuKFwiW2RiXSBJbml0aWFsIE1vbmdvREIgY29ubmVjdGlvbiBmYWlsZWQ6XCIsIGVyci5tZXNzYWdlKTtcclxuICAgIGNvbnNvbGUud2FybihcIltkYl0gU2VydmVyIHdpbGwgc3RhcnQgaW4gaW4tbWVtb3J5IG1vZGUuIFJldHJ5aW5nIGluIGJhY2tncm91bmQuLi5cIik7XHJcbiAgICAvLyBSZXRyeSBpbiBiYWNrZ3JvdW5kIHdpdGhvdXQgYmxvY2tpbmcgdGhlIHNlcnZlclxyXG4gICAgcmV0cnlJbkJhY2tncm91bmQobW9uZ29VcmkpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXRyeUluQmFja2dyb3VuZChtb25nb1VyaTogc3RyaW5nKSB7XHJcbiAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAobW9uZ29vc2UuY29ubmVjdGlvbi5yZWFkeVN0YXRlID09PSAxKSByZXR1cm47XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBtb25nb29zZS5jb25uZWN0KG1vbmdvVXJpLCB7IHNlcnZlclNlbGVjdGlvblRpbWVvdXRNUzogODAwMCB9KTtcclxuICAgICAgX2Nvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiW2RiXSBCYWNrZ3JvdW5kIHJlY29ubmVjdCB0byBNb25nb0RCIEF0bGFzIHN1Y2NlZWRlZCBcdTI3MTNcIik7XHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJbZGJdIEJhY2tncm91bmQgcmVjb25uZWN0IGZhaWxlZCwgcmV0cnlpbmcgaW4gMzBzLi4uXCIsIGVyci5tZXNzYWdlKTtcclxuICAgICAgcmV0cnlJbkJhY2tncm91bmQobW9uZ29VcmkpO1xyXG4gICAgfVxyXG4gIH0sIDMwMDAwKTtcclxufVxyXG5cclxuXHJcbmNvbnN0IGZhcm1lclNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoXHJcbiAge1xyXG4gICAgbmFtZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBlbWFpbDogeyB0eXBlOiBTdHJpbmcsIHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0sXHJcbiAgICBwYXNzd29yZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIHBob25lOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgc29pbFR5cGU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgICBsYW5kU2l6ZTogeyB0eXBlOiBOdW1iZXIgfSxcclxuICAgIGxhbmd1YWdlOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgbG9jYXRpb246IHtcclxuICAgICAgbGF0OiBOdW1iZXIsXHJcbiAgICAgIGxvbjogTnVtYmVyLFxyXG4gICAgICB2aWxsYWdlOiBTdHJpbmcsXHJcbiAgICAgIHN0YXRlOiBTdHJpbmcsXHJcbiAgICB9LFxyXG4gICAgcm9sZToge1xyXG4gICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgIGVudW06IFtcImZhcm1lclwiLCBcInZldFwiLCBcImFkbWluXCJdLFxyXG4gICAgICBkZWZhdWx0OiBcImZhcm1lclwiLFxyXG4gICAgfSxcclxuICAgIHN1YnNjcmlwdGlvblN0YXR1czoge1xyXG4gICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgIGRlZmF1bHQ6IFwiZnJlZVwiLFxyXG4gICAgICBlbnVtOiBbXCJmcmVlXCIsIFwicHJlbWl1bVwiXSxcclxuICAgIH0sXHJcbiAgICBzdWJzY3JpcHRpb25TdGFydERhdGU6IHsgdHlwZTogRGF0ZSB9LFxyXG4gICAgc3Vic2NyaXB0aW9uRW5kRGF0ZTogeyB0eXBlOiBEYXRlIH0sXHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuXHJcbmNvbnN0IGFkdmlzb3J5U2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcclxuICB7XHJcbiAgICBmYXJtZXJJZDogeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuT2JqZWN0SWQsIHJlZjogXCJGYXJtZXJcIiB9LFxyXG4gICAgY3JvcDogU3RyaW5nLFxyXG4gICAgc3VtbWFyeTogU3RyaW5nLFxyXG4gICAgZmVydGlsaXplcjogU3RyaW5nLFxyXG4gICAgaXJyaWdhdGlvbjogU3RyaW5nLFxyXG4gICAgcGVzdDogU3RyaW5nLFxyXG4gICAgd2VhdGhlcjogT2JqZWN0LFxyXG4gICAgY29uZmlkZW5jZVNjb3JlOiBOdW1iZXIsXHJcbiAgICBjb3N0QmVuZWZpdDogU3RyaW5nLFxyXG4gICAgZmFjdG9yczogW1N0cmluZ10sXHJcbiAgICByaXNrQWxlcnRzOiBbU3RyaW5nXSxcclxuICAgIGZhcm1lckZlZWRiYWNrOiB7IHR5cGU6IFN0cmluZywgZW51bTogWydwb3NpdGl2ZScsICduZWdhdGl2ZSddLCBkZWZhdWx0OiBudWxsIH1cclxuICB9LFxyXG4gIHsgdGltZXN0YW1wczogdHJ1ZSB9LFxyXG4pO1xyXG5cclxuY29uc3QgYWR2aXNvcnlIaXN0b3J5U2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcclxuICB7XHJcbiAgICBmYXJtZXJJZDoge1xyXG4gICAgICB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuT2JqZWN0SWQsXHJcbiAgICAgIHJlZjogXCJGYXJtZXJcIixcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgY3JvcDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBhZHZpc29yeTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICB3ZWF0aGVyRGF0YTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk1peGVkLFxyXG4gICAgc29pbERhdGE6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5NaXhlZCxcclxuICAgIGNvbmZpZGVuY2VTY29yZTogTnVtYmVyLFxyXG4gICAgY29zdEJlbmVmaXQ6IFN0cmluZyxcclxuICAgIGZhY3RvcnM6IFtTdHJpbmddLFxyXG4gICAgcmlza0FsZXJ0czogW1N0cmluZ10sXHJcbiAgICBmYXJtZXJGZWVkYmFjazogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsncG9zaXRpdmUnLCAnbmVnYXRpdmUnXSwgZGVmYXVsdDogbnVsbCB9XHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuXHJcbmNvbnN0IGFuYWx5dGljc0RhdGFTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxyXG4gIHtcclxuICAgIGZhcm1lcklkOiB7XHJcbiAgICAgIHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCxcclxuICAgICAgcmVmOiBcIkZhcm1lclwiLFxyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBjcm9wOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGRhdGU6IHsgdHlwZTogRGF0ZSwgZGVmYXVsdDogRGF0ZS5ub3cgfSxcclxuICAgIGNyb3BIZWFsdGhTY29yZTogeyB0eXBlOiBOdW1iZXIsIG1pbjogMCwgbWF4OiAxMDAgfSxcclxuICAgIHlpZWxkOiB7IHR5cGU6IE51bWJlciB9LFxyXG4gICAgc29pbE1vaXN0dXJlOiB7IHR5cGU6IE51bWJlciwgbWluOiAwLCBtYXg6IDEwMCB9LFxyXG4gICAgc29pbE5pdHJvZ2VuOiB7IHR5cGU6IE51bWJlciwgbWluOiAwLCBtYXg6IDEwMCB9LFxyXG4gICAgc29pbFBIOiB7IHR5cGU6IE51bWJlciwgbWluOiAwLCBtYXg6IDE0IH0sXHJcbiAgICB0ZW1wZXJhdHVyZTogeyB0eXBlOiBOdW1iZXIgfSxcclxuICAgIGh1bWlkaXR5OiB7IHR5cGU6IE51bWJlciwgbWluOiAwLCBtYXg6IDEwMCB9LFxyXG4gICAgcmFpbmZhbGw6IHsgdHlwZTogTnVtYmVyIH0sXHJcbiAgICBwZXN0UHJlc3N1cmU6IHsgdHlwZTogTnVtYmVyLCBtaW46IDAsIG1heDogMTAwIH0sXHJcbiAgICBkaXNlYXNlUmlzazogeyB0eXBlOiBOdW1iZXIsIG1pbjogMCwgbWF4OiAxMDAgfSxcclxuICB9LFxyXG4gIHsgdGltZXN0YW1wczogdHJ1ZSB9LFxyXG4pO1xyXG5cclxuLy8gLS0tIEluLW1lbW9yeSBmYWxsYmFjayBpbnN0YW5jZXMgKGFsd2F5cyBjcmVhdGVkIGFzIGJhY2t1cCkgLS0tXHJcbmNvbnN0IF9pbk1lbUZhcm1lciA9IG5ldyBJbk1lbW9yeUNvbGxlY3Rpb248YW55PihcIkZhcm1lclwiKTtcclxuY29uc3QgX2luTWVtQWR2aXNvcnkgPSBuZXcgSW5NZW1vcnlDb2xsZWN0aW9uPGFueT4oXCJBZHZpc29yeVwiKTtcclxuY29uc3QgX2luTWVtQWR2aXNvcnlIaXN0b3J5ID0gbmV3IEluTWVtb3J5Q29sbGVjdGlvbjxhbnk+KFwiQWR2aXNvcnlIaXN0b3J5XCIpO1xyXG5jb25zdCBfaW5NZW1BbmFseXRpY3NEYXRhID0gbmV3IEluTWVtb3J5Q29sbGVjdGlvbjxhbnk+KFwiQW5hbHl0aWNzRGF0YVwiKTtcclxuY29uc3QgX2luTWVtRHJ1Z0xvZyA9IG5ldyBJbk1lbW9yeUNvbGxlY3Rpb248YW55PihcIkRydWdMb2dcIik7XHJcbmNvbnN0IF9pbk1lbVN5c3RlbUFsZXJ0ID0gbmV3IEluTWVtb3J5Q29sbGVjdGlvbjxhbnk+KFwiU3lzdGVtQWxlcnRcIik7XHJcbmNvbnN0IF9pbk1lbUJsb2NrID0gbmV3IEluTWVtb3J5Q29sbGVjdGlvbjxhbnk+KFwiQmxvY2tcIik7XHJcblxyXG4vLyAtLS0gTW9uZ29vc2UgbW9kZWxzIChvbmx5IGNyZWF0ZWQgd2hlbiBVUkkgaXMgc2V0KSAtLS1cclxuY29uc3QgX21vbmdvRmFybWVyID0gVVNFX01FTU9SWSA/IG51bGwgOiAobW9uZ29vc2UubW9kZWxzLkZhcm1lciB8fCBtb25nb29zZS5tb2RlbChcIkZhcm1lclwiLCBmYXJtZXJTY2hlbWEpKTtcclxuY29uc3QgX21vbmdvQWR2aXNvcnkgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuQWR2aXNvcnkgfHwgbW9uZ29vc2UubW9kZWwoXCJBZHZpc29yeVwiLCBhZHZpc29yeVNjaGVtYSkpO1xyXG5jb25zdCBfbW9uZ29BZHZpc29yeUhpc3RvcnkgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuQWR2aXNvcnlIaXN0b3J5IHx8IG1vbmdvb3NlLm1vZGVsKFwiQWR2aXNvcnlIaXN0b3J5XCIsIGFkdmlzb3J5SGlzdG9yeVNjaGVtYSkpO1xyXG5jb25zdCBfbW9uZ29BbmFseXRpY3NEYXRhID0gVVNFX01FTU9SWSA/IG51bGwgOiAobW9uZ29vc2UubW9kZWxzLkFuYWx5dGljc0RhdGEgfHwgbW9uZ29vc2UubW9kZWwoXCJBbmFseXRpY3NEYXRhXCIsIGFuYWx5dGljc0RhdGFTY2hlbWEpKTtcclxuXHJcbmNvbnN0IGRydWdMb2dTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxyXG4gIHtcclxuICAgIGFuaW1hbElkOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGRydWdOYW1lOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGRvc2FnZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICB3aXRoZHJhd2FsRGF5czogeyB0eXBlOiBOdW1iZXIsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBhcHBsaWNhdG9yOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogXCJGYXJtZXJcIiB9LFxyXG4gICAgdHJlYXRtZW50RGF0ZTogeyB0eXBlOiBEYXRlLCBkZWZhdWx0OiBEYXRlLm5vdyB9LFxyXG4gIH0sXHJcbiAgeyB0aW1lc3RhbXBzOiB0cnVlIH0sXHJcbik7XHJcbmNvbnN0IF9tb25nb0RydWdMb2cgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuRHJ1Z0xvZyB8fCBtb25nb29zZS5tb2RlbChcIkRydWdMb2dcIiwgZHJ1Z0xvZ1NjaGVtYSkpO1xyXG5cclxuY29uc3Qgc3lzdGVtQWxlcnRTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxyXG4gIHtcclxuICAgIG1lc3NhZ2U6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgdHlwZTogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsnaW5mbycsICd3YXJuaW5nJywgJ2NyaXRpY2FsJ10sIGRlZmF1bHQ6ICdpbmZvJyB9LFxyXG4gICAgYWN0aXZlOiB7IHR5cGU6IEJvb2xlYW4sIGRlZmF1bHQ6IHRydWUgfSxcclxuICAgIGV4cGlyZXNBdDogeyB0eXBlOiBEYXRlIH1cclxuICB9LFxyXG4gIHsgdGltZXN0YW1wczogdHJ1ZSB9XHJcbik7XHJcbmNvbnN0IF9tb25nb1N5c3RlbUFsZXJ0ID0gVVNFX01FTU9SWSA/IG51bGwgOiAobW9uZ29vc2UubW9kZWxzLlN5c3RlbUFsZXJ0IHx8IG1vbmdvb3NlLm1vZGVsKFwiU3lzdGVtQWxlcnRcIiwgc3lzdGVtQWxlcnRTY2hlbWEpKTtcclxuXHJcbmNvbnN0IGJsb2NrU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcclxuICB7XHJcbiAgICBpbmRleDogeyB0eXBlOiBOdW1iZXIsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICB0aW1lc3RhbXA6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgZGF0YTogeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuTWl4ZWQsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBwcmV2aW91c0hhc2g6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgaGFzaDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuY29uc3QgX21vbmdvQmxvY2sgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuQmxvY2sgfHwgbW9uZ29vc2UubW9kZWwoXCJCbG9ja1wiLCBibG9ja1NjaGVtYSkpO1xyXG5cclxuLy8gSGVscGVyOiByZXR1cm5zIHRydWUgaWYgTW9uZ29EQiBpcyBhY3R1YWxseSBjb25uZWN0ZWRcclxuZnVuY3Rpb24gaXNNb25nb0Nvbm5lY3RlZCgpIHtcclxuICByZXR1cm4gbW9uZ29vc2UuY29ubmVjdGlvbi5yZWFkeVN0YXRlID09PSAxO1xyXG59XHJcblxyXG4vLyBTbWFydCBwcm94eTogdXNlcyBNb25nb0RCIHdoZW4gY29ubmVjdGVkLCBmYWxscyBiYWNrIHRvIGluLW1lbW9yeSBvdGhlcndpc2VcclxuZnVuY3Rpb24gbWFrZVByb3h5KG1vbmdvTW9kZWw6IGFueSwgaW5NZW1Nb2RlbDogYW55KTogYW55IHtcclxuICByZXR1cm4gbmV3IFByb3h5KHt9LCB7XHJcbiAgICBnZXQoX3RhcmdldCwgcHJvcCkge1xyXG4gICAgICBjb25zdCBtb2RlbCA9ICghVVNFX01FTU9SWSAmJiBpc01vbmdvQ29ubmVjdGVkKCkgJiYgbW9uZ29Nb2RlbCkgPyBtb25nb01vZGVsIDogaW5NZW1Nb2RlbDtcclxuICAgICAgY29uc3QgdmFsID0gbW9kZWxbcHJvcCBhcyBzdHJpbmddO1xyXG4gICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiID8gdmFsLmJpbmQobW9kZWwpIDogdmFsO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgRmFybWVyOiBhbnkgPSBtYWtlUHJveHkoX21vbmdvRmFybWVyLCBfaW5NZW1GYXJtZXIpO1xyXG5leHBvcnQgY29uc3QgQWR2aXNvcnk6IGFueSA9IG1ha2VQcm94eShfbW9uZ29BZHZpc29yeSwgX2luTWVtQWR2aXNvcnkpO1xyXG5leHBvcnQgY29uc3QgQWR2aXNvcnlIaXN0b3J5OiBhbnkgPSBtYWtlUHJveHkoX21vbmdvQWR2aXNvcnlIaXN0b3J5LCBfaW5NZW1BZHZpc29yeUhpc3RvcnkpO1xyXG5leHBvcnQgY29uc3QgQW5hbHl0aWNzRGF0YTogYW55ID0gbWFrZVByb3h5KF9tb25nb0FuYWx5dGljc0RhdGEsIF9pbk1lbUFuYWx5dGljc0RhdGEpO1xyXG5leHBvcnQgY29uc3QgRHJ1Z0xvZzogYW55ID0gbWFrZVByb3h5KF9tb25nb0RydWdMb2csIF9pbk1lbURydWdMb2cpO1xyXG5leHBvcnQgY29uc3QgU3lzdGVtQWxlcnQ6IGFueSA9IG1ha2VQcm94eShfbW9uZ29TeXN0ZW1BbGVydCwgX2luTWVtU3lzdGVtQWxlcnQpO1xyXG5leHBvcnQgY29uc3QgQmxvY2s6IGFueSA9IG1ha2VQcm94eShfbW9uZ29CbG9jaywgX2luTWVtQmxvY2spO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXGZhcm1lcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9mYXJtZXJzLnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBGYXJtZXIgfSBmcm9tIFwiLi4vZGJcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVGYXJtZXI6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBGYXJtZXIuY3JlYXRlKHJlcS5ib2R5KTtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKGRhdGEpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbZmFybWVyc10gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJJbnZhbGlkIGZhcm1lciBkYXRhXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldEZhcm1lcjogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgRmFybWVyLmZpbmRCeUlkKGlkKTtcclxuXHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6IFwiRmFybWVyIG5vdCBmb3VuZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5qc29uKGRhdGEpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbZmFybWVyc10gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJJbnZhbGlkIGlkXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldEFsbEZhcm1lcnM6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBGYXJtZXIuZmluZCh7fSk7XHJcbiAgICByZXMuanNvbihkYXRhKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2Zhcm1lcnNdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIGZhcm1lcnNcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZGVsZXRlRmFybWVyOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XHJcbiAgdHJ5IHtcclxuICAgIC8vIE5vdGU6IEluTWVtb3J5Q29sbGVjdGlvbiBuZWVkcyBhIGRlbGV0ZSBtZXRob2QsIG9yIHdlIGhhbmRsZSBpdCBncmFjZWZ1bGx5IGlmIG1pc3NpbmdcclxuICAgIGlmIChGYXJtZXIuZGVsZXRlT25lKSB7XHJcbiAgICAgIGF3YWl0IEZhcm1lci5kZWxldGVPbmUoeyBfaWQ6IGlkIH0pO1xyXG4gICAgfSBlbHNlIGlmIChGYXJtZXIuaXRlbXMpIHtcclxuICAgICAgLy8gSW4tbWVtb3J5IGhhY2sgZm9yIG5vd1xyXG4gICAgICBGYXJtZXIuaXRlbXMgPSBGYXJtZXIuaXRlbXMuZmlsdGVyKChmOiBhbnkpID0+IFN0cmluZyhmLl9pZCkgIT09IFN0cmluZyhpZCkpO1xyXG4gICAgfVxyXG4gICAgcmVzLmpzb24oeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbZmFybWVyc10gRXJyb3IgZGVsZXRpbmc6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZGVsZXRlIGZhcm1lclwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB1cGRhdGVGYXJtZXJTdGF0dXM6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcclxuICBjb25zdCB7IGFjdGlvbiB9ID0gcmVxLmJvZHk7IC8vIFwic3VzcGVuZFwiLCBcImFjdGl2YXRlXCIsIFwicHJlbWl1bVwiXHJcbiAgXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZhcm1lciA9IGF3YWl0IEZhcm1lci5maW5kQnlJZChpZCk7XHJcbiAgICBpZiAoIWZhcm1lcikgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6IFwiTm90IGZvdW5kXCIgfSk7XHJcbiAgICBcclxuICAgIGxldCB1cGRhdGU6IGFueSA9IHt9O1xyXG4gICAgaWYgKGFjdGlvbiA9PT0gXCJzdXNwZW5kXCIpIHVwZGF0ZSA9IHsgcm9sZTogXCJzdXNwZW5kZWRcIiB9O1xyXG4gICAgaWYgKGFjdGlvbiA9PT0gXCJhY3RpdmF0ZVwiKSB1cGRhdGUgPSB7IHJvbGU6IFwiZmFybWVyXCIgfTtcclxuICAgIGlmIChhY3Rpb24gPT09IFwicHJlbWl1bVwiKSB7XHJcbiAgICAgIHVwZGF0ZSA9IHsgXHJcbiAgICAgICAgc3Vic2NyaXB0aW9uU3RhdHVzOiBcInByZW1pdW1cIiwgXHJcbiAgICAgICAgc3Vic2NyaXB0aW9uRW5kRGF0ZTogbmV3IERhdGUoRGF0ZS5ub3coKSArIDM2NSAqIDI0ICogNjAgKiA2MCAqIDEwMDApIFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IEZhcm1lci5maW5kT25lQW5kVXBkYXRlKHsgX2lkOiBpZCB9LCB1cGRhdGUpO1xyXG4gICAgcmVzLmpzb24oeyBzdWNjZXNzOiB0cnVlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbZmFybWVyc10gRXJyb3IgdXBkYXRpbmc6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gdXBkYXRlIGZhcm1lclwiIH0pO1xyXG4gIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxcdXRpbHNcXFxcY2FjaGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3V0aWxzL2NhY2hlLnRzXCI7dHlwZSBFbnRyeTxUPiA9IHsgdmFsdWU6IFQ7IGV4cGlyZXM6IG51bWJlciB9O1xyXG5jb25zdCBzdG9yZSA9IG5ldyBNYXA8c3RyaW5nLCBFbnRyeTxhbnk+PigpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlPFQ+KGtleTogc3RyaW5nKTogVCB8IG51bGwge1xyXG4gIGNvbnN0IGUgPSBzdG9yZS5nZXQoa2V5KTtcclxuICBpZiAoIWUpIHJldHVybiBudWxsO1xyXG4gIGlmIChEYXRlLm5vdygpID4gZS5leHBpcmVzKSB7XHJcbiAgICBzdG9yZS5kZWxldGUoa2V5KTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICByZXR1cm4gZS52YWx1ZSBhcyBUO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2FjaGU8VD4oa2V5OiBzdHJpbmcsIHZhbHVlOiBULCB0dGxNczogbnVtYmVyKSB7XHJcbiAgc3RvcmUuc2V0KGtleSwgeyB2YWx1ZSwgZXhwaXJlczogRGF0ZS5ub3coKSArIHR0bE1zIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZUtleShwYXJ0czogKHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwpW10pIHtcclxuICByZXR1cm4gcGFydHMubWFwKChwKSA9PiBTdHJpbmcocCA/PyBcIlwiKSkuam9pbihcInxcIik7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxcdXRpbHNcXFxcaHR0cC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvdXRpbHMvaHR0cC50c1wiO2V4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFdpdGhUaW1lb3V0KFxyXG4gIHVybDogc3RyaW5nLFxyXG4gIGluaXQ6IFJlcXVlc3RJbml0ID0ge30sXHJcbiAgdGltZW91dE1zID0gNzAwMCxcclxuKSB7XHJcbiAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcclxuICBjb25zdCBpZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCB0aW1lb3V0TXMpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHsgLi4uaW5pdCwgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCB9KTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGNsZWFyVGltZW91dChpZCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmV0cnk8VD4oXHJcbiAgZm46ICgpID0+IFByb21pc2U8VD4sXHJcbiAgYXR0ZW1wdHMgPSAzLFxyXG4gIGRlbGF5TXMgPSAzMDAsXHJcbikge1xyXG4gIGxldCBsYXN0RXJyOiBhbnkgPSBudWxsO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0ZW1wdHM7IGkrKykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIGF3YWl0IGZuKCk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGxhc3RFcnIgPSBlO1xyXG4gICAgICBpZiAoaSA8IGF0dGVtcHRzIC0gMSlcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCBkZWxheU1zICogKGkgKyAxKSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICB0aHJvdyBsYXN0RXJyO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcd2VhdGhlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL3dlYXRoZXIudHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcblxyXG5pbXBvcnQgeyBnZXRDYWNoZSwgc2V0Q2FjaGUsIG1ha2VLZXkgfSBmcm9tIFwiLi4vdXRpbHMvY2FjaGVcIjtcclxuaW1wb3J0IHsgZmV0Y2hXaXRoVGltZW91dCwgcmV0cnkgfSBmcm9tIFwiLi4vdXRpbHMvaHR0cFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldFdlYXRoZXI6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgbGF0LCBsb24gfSA9IHJlcS5xdWVyeSBhcyB7IGxhdD86IHN0cmluZzsgbG9uPzogc3RyaW5nIH07XHJcbiAgICBpZiAoIWxhdCB8fCAhbG9uKVxyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJsYXQgYW5kIGxvbiByZXF1aXJlZFwiIH0pO1xyXG5cclxuICAgIC8vIENhY2hlIGJ5IHJvdW5kZWQgY29vcmRzIChcdTIyNDgxa20gZ3JhbnVsYXJpdHkpIGZvciAxMCBtaW51dGVzXHJcbiAgICBjb25zdCBsYXRSID0gTWF0aC5yb3VuZChOdW1iZXIobGF0KSAqIDEwMCkgLyAxMDA7XHJcbiAgICBjb25zdCBsb25SID0gTWF0aC5yb3VuZChOdW1iZXIobG9uKSAqIDEwMCkgLyAxMDA7XHJcbiAgICBjb25zdCBjYWNoZUtleSA9IG1ha2VLZXkoW1wid2VhdGhlclwiLCBsYXRSLCBsb25SXSk7XHJcbiAgICBjb25zdCBjYWNoZWQgPSBnZXRDYWNoZTxhbnk+KGNhY2hlS2V5KTtcclxuICAgIGlmIChjYWNoZWQpIHJldHVybiByZXMuanNvbih7IC4uLmNhY2hlZCwgY2FjaGVkOiB0cnVlIH0pO1xyXG5cclxuICAgIGNvbnN0IGtleSA9IHByb2Nlc3MuZW52Lk9QRU5XRUFUSEVSX0FQSV9LRVk7XHJcblxyXG4gICAgaWYgKGtleSkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9sYXQ9JHtsYXRSfSZsb249JHtsb25SfSZhcHBpZD0ke2tleX0mdW5pdHM9bWV0cmljYDtcclxuICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgcmV0cnkoKCkgPT4gZmV0Y2hXaXRoVGltZW91dCh1cmwsIHt9LCA3MDAwKSk7XHJcbiAgICAgICAgaWYgKHJlc3Aub2spIHtcclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcclxuICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICAgICAgICAgIHRlbXBDOiBkYXRhLm1haW4/LnRlbXAsXHJcbiAgICAgICAgICAgIGh1bWlkaXR5OiBkYXRhLm1haW4/Lmh1bWlkaXR5LFxyXG4gICAgICAgICAgICB3aW5kS3BoOiBkYXRhLndpbmQ/LnNwZWVkID8gZGF0YS53aW5kLnNwZWVkICogMy42IDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICBjb25kaXRpb25zOiBkYXRhLndlYXRoZXI/LlswXT8uZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIHJhdzogZGF0YSxcclxuICAgICAgICAgICAgc291cmNlOiBcIm9wZW53ZWF0aGVyXCIsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgc2V0Q2FjaGUoY2FjaGVLZXksIHBheWxvYWQsIDEwICogNjAgKiAxMDAwKTtcclxuICAgICAgICAgIHJldHVybiByZXMuanNvbihwYXlsb2FkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge31cclxuICAgIH1cclxuXHJcbiAgICAvLyBGYWxsYmFjayB0byBPcGVuLU1ldGVvIChubyBBUEkga2V5IHJlcXVpcmVkKVxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgb21VcmwgPSBgaHR0cHM6Ly9hcGkub3Blbi1tZXRlby5jb20vdjEvZm9yZWNhc3Q/bGF0aXR1ZGU9JHtsYXRSfSZsb25naXR1ZGU9JHtsb25SfSZjdXJyZW50PXRlbXBlcmF0dXJlXzJtLHJlbGF0aXZlX2h1bWlkaXR5XzJtLHdpbmRfc3BlZWRfMTBtLHdlYXRoZXJfY29kZWA7XHJcbiAgICAgIGNvbnN0IHIgPSBhd2FpdCByZXRyeSgoKSA9PiBmZXRjaFdpdGhUaW1lb3V0KG9tVXJsLCB7fSwgNzAwMCkpO1xyXG4gICAgICBpZiAoci5vaykge1xyXG4gICAgICAgIGNvbnN0IHcgPSBhd2FpdCByLmpzb24oKTtcclxuICAgICAgICBjb25zdCBjdXIgPSB3LmN1cnJlbnQgfHwge307XHJcbiAgICAgICAgY29uc3QgY29kZSA9IGN1ci53ZWF0aGVyX2NvZGUgYXMgbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gd2VhdGhlckNvZGVUb1RleHQoY29kZSk7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgICAgICAgIHRlbXBDOiBjdXIudGVtcGVyYXR1cmVfMm0sXHJcbiAgICAgICAgICBodW1pZGl0eTogY3VyLnJlbGF0aXZlX2h1bWlkaXR5XzJtLFxyXG4gICAgICAgICAgd2luZEtwaDogY3VyLndpbmRfc3BlZWRfMTBtLFxyXG4gICAgICAgICAgY29uZGl0aW9uczogZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICByYXc6IHcsXHJcbiAgICAgICAgICBzb3VyY2U6IFwib3Blbi1tZXRlb1wiLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2V0Q2FjaGUoY2FjaGVLZXksIHBheWxvYWQsIDEwICogNjAgKiAxMDAwKTtcclxuICAgICAgICByZXR1cm4gcmVzLmpzb24ocGF5bG9hZCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge31cclxuXHJcbiAgICAvLyBMYXN0LXJlc29ydCBsb2NhbCBzYW1wbGUgc28gdGhlIFVJIG5ldmVyIHNob3dzIDUwMlxyXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgICAgdGVtcEM6IDI4LFxyXG4gICAgICBodW1pZGl0eTogNjUsXHJcbiAgICAgIHdpbmRLcGg6IDgsXHJcbiAgICAgIGNvbmRpdGlvbnM6IFwiUGFydGx5IGNsb3VkeVwiLFxyXG4gICAgICBzb3VyY2U6IFwic2FtcGxlXCIsXHJcbiAgICB9O1xyXG4gICAgc2V0Q2FjaGUoY2FjaGVLZXksIHBheWxvYWQsIDUgKiA2MCAqIDEwMDApO1xyXG4gICAgcmV0dXJuIHJlcy5qc29uKHBheWxvYWQpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkludGVybmFsIGVycm9yXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gd2VhdGhlckNvZGVUb1RleHQoY29kZT86IG51bWJlcikge1xyXG4gIGNvbnN0IG1hcDogUmVjb3JkPG51bWJlciwgc3RyaW5nPiA9IHtcclxuICAgIDA6IFwiQ2xlYXJcIixcclxuICAgIDE6IFwiTWFpbmx5IGNsZWFyXCIsXHJcbiAgICAyOiBcIlBhcnRseSBjbG91ZHlcIixcclxuICAgIDM6IFwiT3ZlcmNhc3RcIixcclxuICAgIDQ1OiBcIkZvZ1wiLFxyXG4gICAgNDg6IFwiRGVwb3NpdGluZyByaW1lIGZvZ1wiLFxyXG4gICAgNTE6IFwiTGlnaHQgZHJpenpsZVwiLFxyXG4gICAgNTM6IFwiRHJpenpsZVwiLFxyXG4gICAgNTU6IFwiRGVuc2UgZHJpenpsZVwiLFxyXG4gICAgNjE6IFwiU2xpZ2h0IHJhaW5cIixcclxuICAgIDYzOiBcIlJhaW5cIixcclxuICAgIDY1OiBcIkhlYXZ5IHJhaW5cIixcclxuICAgIDcxOiBcIlNsaWdodCBzbm93XCIsXHJcbiAgICA3MzogXCJTbm93XCIsXHJcbiAgICA3NTogXCJIZWF2eSBzbm93XCIsXHJcbiAgICA4MDogXCJSYWluIHNob3dlcnNcIixcclxuICAgIDgxOiBcIlJhaW4gc2hvd2Vyc1wiLFxyXG4gICAgODI6IFwiVmlvbGVudCByYWluIHNob3dlcnNcIixcclxuICAgIDk1OiBcIlRodW5kZXJzdG9ybVwiLFxyXG4gICAgOTY6IFwiVGh1bmRlcnN0b3JtIHcvIGhhaWxcIixcclxuICAgIDk5OiBcIlRodW5kZXJzdG9ybSB3LyBoYWlsXCIsXHJcbiAgfTtcclxuICByZXR1cm4gY29kZSAhPSBudWxsID8gbWFwW2NvZGVdIHx8IFwiVW5rbm93blwiIDogdW5kZWZpbmVkO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcYWR2aXNvcnkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9hZHZpc29yeS50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IHsgQWR2aXNvcnksIEFkdmlzb3J5SGlzdG9yeSB9IGZyb20gXCIuLi9kYlwiO1xyXG5cclxuZnVuY3Rpb24gZ2VuZXJhdGVBZHZpY2Uoe1xyXG4gIHRlbXBDLFxyXG4gIGh1bWlkaXR5LFxyXG4gIHNvaWxNb2lzdHVyZSxcclxuICBuZHZpXHJcbn06IHtcclxuICB0ZW1wQz86IG51bWJlcjtcclxuICBodW1pZGl0eT86IG51bWJlcjtcclxuICBzb2lsTW9pc3R1cmU/OiBudW1iZXI7XHJcbiAgbmR2aT86IG51bWJlcjtcclxufSkge1xyXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIGNvbnN0IGZhY3RvcnM6IHN0cmluZ1tdID0gW107XHJcbiAgY29uc3Qgcmlza0FsZXJ0czogc3RyaW5nW10gPSBbXTtcclxuICBcclxuICBpZiAodGVtcEMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKHRlbXBDIDwgMTUpIHtcclxuICAgICAgcGFydHMucHVzaChcIkxvdyB0ZW1wZXJhdHVyZTogcHJlZmVyIHdoZWF0L211c3RhcmQ7IHJlZHVjZSBpcnJpZ2F0aW9uLlwiKTtcclxuICAgICAgZmFjdG9ycy5wdXNoKGBUZW1wZXJhdHVyZSBpcyBsb3cgKCR7dGVtcEN9XHUwMEIwQykuYCk7XHJcbiAgICAgIHJpc2tBbGVydHMucHVzaChcIkZyb3N0IHJpc2sgZm9yIHNlbnNpdGl2ZSBjcm9wcy5cIik7XHJcbiAgICB9IGVsc2UgaWYgKHRlbXBDIDwgMjgpIHtcclxuICAgICAgcGFydHMucHVzaChcIk1vZGVyYXRlIHRlbXBlcmF0dXJlOiBwYWRkeS92ZWdldGFibGVzIHN1aXRhYmxlOyBzdGFuZGFyZCBpcnJpZ2F0aW9uIHNjaGVkdWxlLlwiKTtcclxuICAgICAgZmFjdG9ycy5wdXNoKGBUZW1wZXJhdHVyZSBpcyBvcHRpbWFsICgke3RlbXBDfVx1MDBCMEMpLmApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcGFydHMucHVzaChcIkhpZ2ggdGVtcGVyYXR1cmU6IHNlbGVjdCBkcm91Z2h0XHUyMDExdG9sZXJhbnQgY3JvcHM7IGlycmlnYXRlIGluIGVhcmx5IG1vcm5pbmcvZXZlbmluZy5cIik7XHJcbiAgICAgIGZhY3RvcnMucHVzaChgVGVtcGVyYXR1cmUgaXMgaGlnaCAoJHt0ZW1wQ31cdTAwQjBDKS5gKTtcclxuICAgICAgcmlza0FsZXJ0cy5wdXNoKFwiSGVhdCBzdHJlc3Mgcmlzay5cIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoaHVtaWRpdHkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKGh1bWlkaXR5ID4gODApIHtcclxuICAgICAgcGFydHMucHVzaChcIkhpZ2ggaHVtaWRpdHk6IG1vbml0b3IgZnVuZ2FsIGRpc2Vhc2VzOyB1c2UgcHJldmVudGl2ZSBmdW5naWNpZGUgd2hlbiBuZWVkZWQuXCIpO1xyXG4gICAgICBmYWN0b3JzLnB1c2goYEh1bWlkaXR5IGlzIGhpZ2ggKCR7aHVtaWRpdHl9JSkuYCk7XHJcbiAgICAgIHJpc2tBbGVydHMucHVzaChcIkZ1bmdhbCBkaXNlYXNlIG91dGJyZWFrIGxpa2VseS5cIik7XHJcbiAgICB9IGVsc2UgaWYgKGh1bWlkaXR5IDwgMzApIHtcclxuICAgICAgcGFydHMucHVzaChcIkxvdyBodW1pZGl0eTogbXVsY2ggdG8gcmV0YWluIHNvaWwgbW9pc3R1cmUuXCIpO1xyXG4gICAgICBmYWN0b3JzLnB1c2goYEh1bWlkaXR5IGlzIGxvdyAoJHtodW1pZGl0eX0lKS5gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChzb2lsTW9pc3R1cmUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKHNvaWxNb2lzdHVyZSA8IDMwKSB7XHJcbiAgICAgIHBhcnRzLnB1c2goXCJTb2lsIGlzIGRyeS4gSW1tZWRpYXRlIGlycmlnYXRpb24gcmVjb21tZW5kZWQuXCIpO1xyXG4gICAgICBmYWN0b3JzLnB1c2goYFNvaWwgbW9pc3R1cmUgaXMgY3JpdGljYWxseSBsb3cgKCR7c29pbE1vaXN0dXJlfSUpLmApO1xyXG4gICAgfSBlbHNlIGlmIChzb2lsTW9pc3R1cmUgPiA3MCkge1xyXG4gICAgICBwYXJ0cy5wdXNoKFwiU29pbCBpcyB3YXRlcmxvZ2dlZC4gUGF1c2UgaXJyaWdhdGlvbi5cIik7XHJcbiAgICAgIGZhY3RvcnMucHVzaChgU29pbCBtb2lzdHVyZSBpcyBoaWdoICgke3NvaWxNb2lzdHVyZX0lKS5gKTtcclxuICAgICAgcmlza0FsZXJ0cy5wdXNoKFwiUm9vdCByb3QgcmlzayBkdWUgdG8gd2F0ZXJsb2dnaW5nLlwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZhY3RvcnMucHVzaChgU29pbCBtb2lzdHVyZSBpcyBvcHRpbWFsICgke3NvaWxNb2lzdHVyZX0lKS5gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChuZHZpICE9PSB1bmRlZmluZWQpIHtcclxuICAgIGlmIChuZHZpIDwgMC4zKSB7XHJcbiAgICAgIHBhcnRzLnB1c2goXCJDcm9wIGhlYWx0aCBpcyBwb29yLiBDb25zaWRlciBzb2lsIHRlc3RpbmcgZm9yIG51dHJpZW50IGRlZmljaWVuY2llcy5cIik7XHJcbiAgICAgIGZhY3RvcnMucHVzaChgU2F0ZWxsaXRlIE5EVkkgaXMgbG93ICgke25kdml9KS5gKTtcclxuICAgIH0gZWxzZSBpZiAobmR2aSA+IDAuNikge1xyXG4gICAgICBwYXJ0cy5wdXNoKFwiQ3JvcCBoZWFsdGggaXMgZXhjZWxsZW50LlwiKTtcclxuICAgICAgZmFjdG9ycy5wdXNoKGBTYXRlbGxpdGUgTkRWSSBpbmRpY2F0ZXMgaGVhbHRoeSBjYW5vcHkgKCR7bmR2aX0pLmApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHN1bW1hcnk6IHBhcnRzLmpvaW4oXCIgXCIpIHx8IFwiUHJvdmlkZSBsb2NhdGlvbiB0byBmZXRjaCB3ZWF0aGVyIGZvciBwZXJzb25hbGl6ZWQgYWR2aWNlLlwiLFxyXG4gICAgZmFjdG9ycyxcclxuICAgIHJpc2tBbGVydHNcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY3JlYXRlQWR2aXNvcnk6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZmFybWVySWQsIGNyb3AsIGxhdCwgbG9uIH0gPSByZXEuYm9keSBhcyB7XHJcbiAgICAgIGZhcm1lcklkPzogc3RyaW5nO1xyXG4gICAgICBjcm9wPzogc3RyaW5nO1xyXG4gICAgICBsYXQ/OiBudW1iZXI7XHJcbiAgICAgIGxvbj86IG51bWJlcjtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IHdlYXRoZXI6IGFueSA9IHVuZGVmaW5lZDtcclxuICAgIGlmIChsYXQgIT0gbnVsbCAmJiBsb24gIT0gbnVsbCkge1xyXG4gICAgICBjb25zdCBrZXkgPSBwcm9jZXNzLmVudi5PUEVOV0VBVEhFUl9BUElfS0VZO1xyXG4gICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP2xhdD0ke2xhdH0mbG9uPSR7bG9ufSZhcHBpZD0ke2tleX0mdW5pdHM9bWV0cmljYCxcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChyZXNwLm9rKSB3ZWF0aGVyID0gYXdhaXQgcmVzcC5qc29uKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNb2NrIERpZ2l0YWwgVHdpbiBEYXRhXHJcbiAgICBjb25zdCBtb2NrU29pbE1vaXN0dXJlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjApICsgMjA7IC8vIDIwLTgwJVxyXG4gICAgY29uc3QgbW9ja05EVkkgPSBwYXJzZUZsb2F0KChNYXRoLnJhbmRvbSgpICogMC44ICsgMC4xKS50b0ZpeGVkKDIpKTsgLy8gMC4xLTAuOVxyXG4gICAgXHJcbiAgICBjb25zdCBhZHZpY2UgPSBnZW5lcmF0ZUFkdmljZSh7XHJcbiAgICAgIHRlbXBDOiB3ZWF0aGVyPy5tYWluPy50ZW1wLFxyXG4gICAgICBodW1pZGl0eTogd2VhdGhlcj8ubWFpbj8uaHVtaWRpdHksXHJcbiAgICAgIHNvaWxNb2lzdHVyZTogbW9ja1NvaWxNb2lzdHVyZSxcclxuICAgICAgbmR2aTogbW9ja05EVklcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBjb25zdCBzdW1tYXJ5ID0gYWR2aWNlLnN1bW1hcnk7XHJcbiAgICBjb25zdCBmYWN0b3JzID0gYWR2aWNlLmZhY3RvcnM7XHJcbiAgICBjb25zdCByaXNrQWxlcnRzID0gYWR2aWNlLnJpc2tBbGVydHM7XHJcblxyXG4gICAgLy8gQ29uZmlkZW5jZSBhbmQgQ29zdC1CZW5lZml0XHJcbiAgICBjb25zdCBjb25maWRlbmNlU2NvcmUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCkgKyA4MDsgLy8gODAtOTklXHJcbiAgICBjb25zdCBpc1BhZGR5ID0gY3JvcD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcInBhZGR5XCIpO1xyXG4gICAgXHJcbiAgICBjb25zdCBmZXJ0aWxpemVyID0gaXNQYWRkeVxyXG4gICAgICA/IFwiTlBLIDEwOjI2OjI2IGF0IHNvd2luZzsgdXJlYSBzcGxpdCBkb3NlcyBhdCB0aWxsZXJpbmcvUEkuXCJcclxuICAgICAgOiBcIkJhbGFuY2VkIE5QSyBiYXNlZCBvbiBzb2lsIHRlc3Q7IGFwcGx5IGNvbXBvc3QvbWFudXJlIHRvIGltcHJvdmUgb3JnYW5pYyBtYXR0ZXIuXCI7XHJcbiAgICAgIFxyXG4gICAgY29uc3QgaXJyaWdhdGlvbiA9XHJcbiAgICAgICh3ZWF0aGVyPy5tYWluPy50ZW1wICYmIHdlYXRoZXIubWFpbi50ZW1wID4gMzApIHx8IG1vY2tTb2lsTW9pc3R1cmUgPCAzMFxyXG4gICAgICAgID8gXCJJcnJpZ2F0ZSAyXHUyMDEzMyB0aW1lcy93ZWVrIGluIHNob3J0IGN5Y2xlcy5cIlxyXG4gICAgICAgIDogXCJJcnJpZ2F0ZSB3ZWVrbHkgYmFzZWQgb24gc29pbCBtb2lzdHVyZS5cIjtcclxuICAgICAgICBcclxuICAgIGNvbnN0IHBlc3QgPSBcIlNjb3V0IHdlZWtseTsgdXNlIHBoZXJvbW9uZSB0cmFwczsgcHJlZmVyIGJpb1x1MjAxMWNvbnRyb2wgd2hlcmUgcG9zc2libGUuXCI7XHJcblxyXG4gICAgY29uc3QgY29zdEJlbmVmaXQgPSBgRXN0aW1hdGVkIFJPSTogKyR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgNX0lIHlpZWxkIGluY3JlYXNlIHdpdGggcmVjb21tZW5kZWQgcHJhY3RpY2VzLmA7XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgICAgZmFybWVySWQsXHJcbiAgICAgIGNyb3A6IGNyb3AgfHwgXCJVbmtub3duXCIsXHJcbiAgICAgIHN1bW1hcnksXHJcbiAgICAgIGZlcnRpbGl6ZXIsXHJcbiAgICAgIGlycmlnYXRpb24sXHJcbiAgICAgIHBlc3QsXHJcbiAgICAgIHdlYXRoZXIsXHJcbiAgICAgIGNvbmZpZGVuY2VTY29yZSxcclxuICAgICAgY29zdEJlbmVmaXQsXHJcbiAgICAgIGZhY3RvcnMsXHJcbiAgICAgIHJpc2tBbGVydHNcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEFkdmlzb3J5LmNyZWF0ZShwYXlsb2FkKTtcclxuICAgIFxyXG4gICAgaWYgKGZhcm1lcklkKSB7XHJcbiAgICAgICBhd2FpdCBBZHZpc29yeUhpc3RvcnkuY3JlYXRlKHtcclxuICAgICAgICAgZmFybWVySWQsXHJcbiAgICAgICAgIGNyb3A6IGNyb3AgfHwgXCJVbmtub3duXCIsXHJcbiAgICAgICAgIGFkdmlzb3J5OiBzdW1tYXJ5LFxyXG4gICAgICAgICB3ZWF0aGVyRGF0YTogd2VhdGhlcixcclxuICAgICAgICAgY29uZmlkZW5jZVNjb3JlLFxyXG4gICAgICAgICBjb3N0QmVuZWZpdCxcclxuICAgICAgICAgZmFjdG9ycyxcclxuICAgICAgICAgcmlza0FsZXJ0c1xyXG4gICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oZGF0YSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthZHZpc29yeV0gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gY3JlYXRlIGFkdmlzb3J5XCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN1Ym1pdEZlZWRiYWNrOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgY29uc3QgeyBmZWVkYmFjayB9ID0gcmVxLmJvZHk7XHJcbiAgICBcclxuICAgIGlmICghWydwb3NpdGl2ZScsICduZWdhdGl2ZSddLmluY2x1ZGVzKGZlZWRiYWNrKSkge1xyXG4gICAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIkludmFsaWQgZmVlZGJhY2sgdmFsdWVcIiB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiBpdCdzIGFuIEFkdmlzb3J5SGlzdG9yeSBvciBqdXN0IEFkdmlzb3J5IChpbiBjYXNlIHRoZXkgdXNlIHRoZSBBZHZpc29yeSBJRCBkaXJlY3RseSBpbiBVSSlcclxuICAgIC8vIFRoZSBoaXN0b3J5IElEIGlzIGdlbmVyYWxseSB3aGF0IGlzIHJlbmRlcmVkIGluIHRoZSBkYXNoYm9hcmQuXHJcbiAgICBjb25zdCB1cGRhdGVkID0gYXdhaXQgQWR2aXNvcnlIaXN0b3J5LmZpbmRPbmVBbmRVcGRhdGUoXHJcbiAgICAgIHsgX2lkOiBpZCB9LFxyXG4gICAgICB7IGZhcm1lckZlZWRiYWNrOiBmZWVkYmFjayB9LFxyXG4gICAgICB7IG5ldzogdHJ1ZSB9XHJcbiAgICApO1xyXG4gICAgXHJcbiAgICBpZiAoIXVwZGF0ZWQpIHtcclxuICAgICAgcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJBZHZpc29yeSBoaXN0b3J5IG5vdCBmb3VuZFwiIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlcy5qc29uKHVwZGF0ZWQpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYWR2aXNvcnldIEZlZWRiYWNrIGVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIHN1Ym1pdCBmZWVkYmFja1wiIH0pO1xyXG4gIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1xcXFxtYXJrZXQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9tYXJrZXQudHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcblxyXG5jb25zdCBzYW1wbGUgPSBbXHJcbiAge1xyXG4gICAgY29tbW9kaXR5OiBcIldoZWF0XCIsXHJcbiAgICBzdGF0ZTogXCJQdW5qYWJcIixcclxuICAgIG1hbmRpOiBcIkx1ZGhpYW5hXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDIyMDAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiV2hlYXRcIixcclxuICAgIHN0YXRlOiBcIlV0dGFyIFByYWRlc2hcIixcclxuICAgIG1hbmRpOiBcIkthbnB1clwiLFxyXG4gICAgdW5pdDogXCJRdGxcIixcclxuICAgIHByaWNlOiAyMTUwLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgY29tbW9kaXR5OiBcIlJpY2VcIixcclxuICAgIHN0YXRlOiBcIldlc3QgQmVuZ2FsXCIsXHJcbiAgICBtYW5kaTogXCJLb2xrYXRhXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDI0NTAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiUmljZVwiLFxyXG4gICAgc3RhdGU6IFwiVGFtaWwgTmFkdVwiLFxyXG4gICAgbWFuZGk6IFwiVGhhbmphdnVyXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDI0MDAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiT25pb25cIixcclxuICAgIHN0YXRlOiBcIk1haGFyYXNodHJhXCIsXHJcbiAgICBtYW5kaTogXCJOYXNoaWtcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogMTcwMCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJPbmlvblwiLFxyXG4gICAgc3RhdGU6IFwiS2FybmF0YWthXCIsXHJcbiAgICBtYW5kaTogXCJIdWJiYWxsaVwiLFxyXG4gICAgdW5pdDogXCJRdGxcIixcclxuICAgIHByaWNlOiAxNjUwLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgY29tbW9kaXR5OiBcIlBvdGF0b1wiLFxyXG4gICAgc3RhdGU6IFwiVXR0YXIgUHJhZGVzaFwiLFxyXG4gICAgbWFuZGk6IFwiQWdyYVwiLFxyXG4gICAgdW5pdDogXCJRdGxcIixcclxuICAgIHByaWNlOiAxMjAwLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgY29tbW9kaXR5OiBcIlBvdGF0b1wiLFxyXG4gICAgc3RhdGU6IFwiV2VzdCBCZW5nYWxcIixcclxuICAgIG1hbmRpOiBcIkhvb2dobHlcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogMTI1MCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJTb3liZWFuXCIsXHJcbiAgICBzdGF0ZTogXCJNYWRoeWEgUHJhZGVzaFwiLFxyXG4gICAgbWFuZGk6IFwiSW5kb3JlXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDQ4MDAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiQ290dG9uXCIsXHJcbiAgICBzdGF0ZTogXCJUZWxhbmdhbmFcIixcclxuICAgIG1hbmRpOiBcIldhcmFuZ2FsXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDYyMDAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiVHVyXCIsXHJcbiAgICBzdGF0ZTogXCJNYWhhcmFzaHRyYVwiLFxyXG4gICAgbWFuZGk6IFwiTGF0dXJcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogNzAwMCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJDaGlsbGlcIixcclxuICAgIHN0YXRlOiBcIkFuZGhyYSBQcmFkZXNoXCIsXHJcbiAgICBtYW5kaTogXCJHdW50dXJcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogOTAwMCxcclxuICB9LFxyXG5dO1xyXG5cclxuaW1wb3J0IHsgZ2V0Q2FjaGUsIHNldENhY2hlLCBtYWtlS2V5IH0gZnJvbSBcIi4uL3V0aWxzL2NhY2hlXCI7XHJcbmltcG9ydCB7IGZldGNoV2l0aFRpbWVvdXQsIHJldHJ5IH0gZnJvbSBcIi4uL3V0aWxzL2h0dHBcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRNYXJrZXRQcmljZXM6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgY29uc3QgeyBjb21tb2RpdHksIHN0YXRlIH0gPSByZXEucXVlcnkgYXMge1xyXG4gICAgY29tbW9kaXR5Pzogc3RyaW5nO1xyXG4gICAgc3RhdGU/OiBzdHJpbmc7XHJcbiAgfTtcclxuICBjb25zdCBhcGlVcmwgPSBwcm9jZXNzLmVudi5NQVJLRVRfQVBJX1VSTDsgLy8gb3B0aW9uYWwgZXh0ZXJuYWwgcHJvdmlkZXIgKEpTT04gYXJyYXkpXHJcbiAgY29uc3QgYXBpS2V5ID0gcHJvY2Vzcy5lbnYuTUFSS0VUX0FQSV9LRVk7IC8vIG9wdGlvbmFsIGhlYWRlciBrZXlcclxuXHJcbiAgLy8gQ2FjaGUgZm9yIDUgbWludXRlcyBieSBjb21tb2RpdHkvc3RhdGVcclxuICBjb25zdCBjYWNoZUtleSA9IG1ha2VLZXkoW1xyXG4gICAgXCJtYXJrZXRcIixcclxuICAgIChjb21tb2RpdHkgfHwgXCJcIikudG9Mb3dlckNhc2UoKSxcclxuICAgIChzdGF0ZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLFxyXG4gIF0pO1xyXG4gIGNvbnN0IGNhY2hlZCA9IGdldENhY2hlPGFueT4oY2FjaGVLZXkpO1xyXG4gIGlmIChjYWNoZWQpXHJcbiAgICByZXR1cm4gcmVzLmpzb24oe1xyXG4gICAgICBzb3VyY2U6IGNhY2hlZC5zb3VyY2UsXHJcbiAgICAgIGl0ZW1zOiBjYWNoZWQuaXRlbXMsXHJcbiAgICAgIGNhY2hlZDogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgaWYgKGFwaVVybCkge1xyXG4gICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGFwaVVybCk7XHJcbiAgICAgIGlmIChjb21tb2RpdHkpIHVybC5zZWFyY2hQYXJhbXMuc2V0KFwiY29tbW9kaXR5XCIsIGNvbW1vZGl0eSk7XHJcbiAgICAgIGlmIChzdGF0ZSkgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJzdGF0ZVwiLCBzdGF0ZSk7XHJcbiAgICAgIGNvbnN0IHIgPSBhd2FpdCByZXRyeSgoKSA9PlxyXG4gICAgICAgIGZldGNoV2l0aFRpbWVvdXQoXHJcbiAgICAgICAgICB1cmwudG9TdHJpbmcoKSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaGVhZGVyczogYXBpS2V5ID8geyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YXBpS2V5fWAgfSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICA3MDAwLFxyXG4gICAgICAgICksXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChyLm9rKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHIuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSB7IHNvdXJjZTogXCJsaXZlXCIgYXMgY29uc3QsIGl0ZW1zOiBkYXRhIH07XHJcbiAgICAgICAgc2V0Q2FjaGUoY2FjaGVLZXksIHBheWxvYWQsIDUgKiA2MCAqIDEwMDApO1xyXG4gICAgICAgIHJldHVybiByZXMuanNvbihwYXlsb2FkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gY2F0Y2gge31cclxuXHJcbiAgY29uc3QgaXRlbXMgPSBzYW1wbGUuZmlsdGVyKFxyXG4gICAgKGkpID0+XHJcbiAgICAgICghY29tbW9kaXR5IHx8XHJcbiAgICAgICAgaS5jb21tb2RpdHkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhjb21tb2RpdHkudG9Mb3dlckNhc2UoKSkpICYmXHJcbiAgICAgICghc3RhdGUgfHwgaS5zdGF0ZS50b0xvd2VyQ2FzZSgpID09PSBzdGF0ZS50b0xvd2VyQ2FzZSgpKSxcclxuICApO1xyXG4gIGNvbnN0IHBheWxvYWQgPSB7IHNvdXJjZTogXCJzYW1wbGVcIiBhcyBjb25zdCwgaXRlbXMgfTtcclxuICBzZXRDYWNoZShjYWNoZUtleSwgcGF5bG9hZCwgNSAqIDYwICogMTAwMCk7XHJcbiAgcmVzLmpzb24ocGF5bG9hZCk7XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcY2hhdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL2NoYXQudHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgY2hhdEhhbmRsZXI6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgbWVzc2FnZSwgbGF0LCBsb24sIGxhbmcgPSBcImVuXCIgfSA9IHJlcS5ib2R5IGFzIHtcclxuICAgICAgbWVzc2FnZT86IHN0cmluZztcclxuICAgICAgbGF0PzogbnVtYmVyO1xyXG4gICAgICBsb24/OiBudW1iZXI7XHJcbiAgICAgIGxhbmc/OiBzdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgaWYgKCFtZXNzYWdlKSByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJtZXNzYWdlIHJlcXVpcmVkXCIgfSk7XHJcblxyXG4gICAgLy8gTm9ybWFsaXplIGxhbmd1YWdlIGNvZGUgKGUuZy4gXCJoaS1JTlwiIC0+IFwiaGlcIilcclxuICAgIGNvbnN0IHNob3J0TGFuZyA9IGxhbmcuc3BsaXQoXCItXCIpWzBdO1xyXG4gICAgY29uc3QgaXNIaSA9IHNob3J0TGFuZyA9PT0gXCJoaVwiO1xyXG4gICAgY29uc3QgaXNPciA9IHNob3J0TGFuZyA9PT0gXCJvclwiO1xyXG5cclxuICAgIGNvbnN0IG0gPSBtZXNzYWdlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBjb25zdCByZXBsaWVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIC8vIFRyYW5zbGF0aW9uIERpY3Rpb25hcnlcclxuICAgIGNvbnN0IHQgPSB7XHJcbiAgICAgIHdlYXRoZXI6IHtcclxuICAgICAgICBlbjogKGRlc2M6IHN0cmluZywgdGVtcDogbnVtYmVyLCBodW06IG51bWJlcikgPT4gYFdlYXRoZXI6ICR7ZGVzY30sIFRlbXAgJHt0ZW1wfVx1MDBCMEMsIEh1bWlkaXR5ICR7aHVtfSVgLFxyXG4gICAgICAgIGhpOiAoZGVzYzogc3RyaW5nLCB0ZW1wOiBudW1iZXIsIGh1bTogbnVtYmVyKSA9PiBgXHUwOTJFXHUwOTRDXHUwOTM4XHUwOTJFOiAke2Rlc2N9LCBcdTA5MjRcdTA5M0VcdTA5MkFcdTA5MkVcdTA5M0VcdTA5MjggJHt0ZW1wfVx1MDBCMEMsIFx1MDkyOFx1MDkyRVx1MDk0MCAke2h1bX0lYCxcclxuICAgICAgICBvcjogKGRlc2M6IHN0cmluZywgdGVtcDogbnVtYmVyLCBodW06IG51bWJlcikgPT4gYFx1MEIyQVx1MEIzRVx1MEIyM1x1MEIzRlx1MEIyQVx1MEIzRVx1MEIxNzogJHtkZXNjfSwgXHUwQjI0XHUwQjNFXHUwQjJBXHUwQjJFXHUwQjNFXHUwQjI0XHUwQjREXHUwQjMwXHUwQjNFICR7dGVtcH1cdTAwQjBDLCBcdTBCMDZcdTBCMzBcdTBCNERcdTBCMjZcdTBCNERcdTBCMzBcdTBCMjRcdTBCM0UgJHtodW19JWAsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1hcmtldDoge1xyXG4gICAgICAgIGVuOiBcIkZvciBsaXZlIG1hbmRpIHByaWNlcywgcGxlYXNlIGNoZWNrIHRoZSAnTWFya2V0JyB0YWIuIEkgY2FuIHRlbGwgeW91IHRoYXQgV2hlYXQgaXMgY3VycmVudGx5IHRyZW5kaW5nIHVwIGluIFB1bmphYiBtYXJrZXRzLlwiLFxyXG4gICAgICAgIGhpOiBcIlx1MDkzMlx1MDkzRVx1MDkwN1x1MDkzNSBcdTA5MkVcdTA5MDJcdTA5MjFcdTA5NDAgXHUwOTJEXHUwOTNFXHUwOTM1IFx1MDkxNVx1MDk0NyBcdTA5MzJcdTA5M0ZcdTA5MEYsIFx1MDkxNVx1MDk0M1x1MDkyQVx1MDkyRlx1MDkzRSAnXHUwOTJFXHUwOTAyXHUwOTIxXHUwOTQwIFx1MDkyRFx1MDkzRVx1MDkzNScgXHUwOTFGXHUwOTQ4XHUwOTJDIFx1MDkyNlx1MDk0N1x1MDkxNlx1MDk0N1x1MDkwMlx1MDk2NCBcdTA5MkFcdTA5MDJcdTA5MUNcdTA5M0VcdTA5MkMgXHUwOTE1XHUwOTQwIFx1MDkyRVx1MDkwMlx1MDkyMVx1MDkzRlx1MDkyRlx1MDk0Qlx1MDkwMiBcdTA5MkVcdTA5NDdcdTA5MDIgXHUwOTE3XHUwOTQ3XHUwOTM5XHUwOTQyXHUwOTAyIFx1MDkxNVx1MDk0NyBcdTA5MjZcdTA5M0VcdTA5MkUgXHUwOTJDXHUwOTIyXHUwOTNDIFx1MDkzMFx1MDkzOVx1MDk0NyBcdTA5MzlcdTA5NDhcdTA5MDJcdTA5NjRcIixcclxuICAgICAgICBvcjogXCJcdTBCMzJcdTBCM0VcdTBCMDdcdTBCMkQgXHUwQjJFXHUwQjIzXHUwQjREXHUwQjIxXHUwQjNGIFx1MEIyRVx1MEI0Mlx1MEIzMlx1MEI0RFx1MEI1RiBcdTBCMkFcdTBCM0VcdTBCMDdcdTBCMDEsIFx1MEIyNlx1MEI1Rlx1MEIzRVx1MEIxNVx1MEIzMFx1MEIzRiAnXHUwQjJDXHUwQjFDXHUwQjNFXHUwQjMwJyBcdTBCMUZcdTBCNERcdTBCNUZcdTBCM0VcdTBCMkNcdTBCNEQgXHUwQjI2XHUwQjQ3XHUwQjE2XHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIHwgXHUwQjJBXHUwQjFFXHUwQjREXHUwQjFDXHUwQjNFXHUwQjJDIFx1MEIyQ1x1MEIxQ1x1MEIzRVx1MEIzMFx1MEIzMFx1MEI0NyBcdTBCMTdcdTBCMzlcdTBCMkUgXHUwQjJFXHUwQjQyXHUwQjMyXHUwQjREXHUwQjVGIFx1MEIyQ1x1MEI0M1x1MEIyNlx1MEI0RFx1MEIyN1x1MEIzRiBcdTBCMkFcdTBCM0VcdTBCMDlcdTBCMUJcdTBCM0YgfFwiLFxyXG4gICAgICB9LFxyXG4gICAgICB5aWVsZDoge1xyXG4gICAgICAgIGVuOiBcIlRvIGltcHJvdmUgeWllbGQ6IDEuIEVuc3VyZSBzb2lsIHRlc3RpbmcuIDIuIFVzZSBjZXJ0aWZpZWQgc2VlZHMuIDMuIEZvbGxvdyB0aW1lbHkgaXJyaWdhdGlvbi4gNC4gTWFuYWdlIHBlc3RzIGVhcmx5IHdpdGggYmlvLXBlc3RpY2lkZXMuXCIsXHJcbiAgICAgICAgaGk6IFwiXHUwOTJBXHUwOTQ4XHUwOTI2XHUwOTNFXHUwOTM1XHUwOTNFXHUwOTMwIFx1MDkyQ1x1MDkyMlx1MDkzQ1x1MDkzRVx1MDkyOFx1MDk0NyBcdTA5MTVcdTA5NDcgXHUwOTMyXHUwOTNGXHUwOTBGOiAxLiBcdTA5MkVcdTA5M0ZcdTA5MUZcdTA5NERcdTA5MUZcdTA5NDAgXHUwOTE1XHUwOTQwIFx1MDkxQ1x1MDkzRVx1MDkwMlx1MDkxQSBcdTA5MTVcdTA5MzBcdTA5M0VcdTA5MEZcdTA5MDJcdTA5NjQgMi4gXHUwOTJBXHUwOTREXHUwOTMwXHUwOTJFXHUwOTNFXHUwOTIzXHUwOTNGXHUwOTI0IFx1MDkyQ1x1MDk0MFx1MDkxQ1x1MDk0Qlx1MDkwMiBcdTA5MTVcdTA5M0UgXHUwOTA5XHUwOTJBXHUwOTJGXHUwOTRCXHUwOTE3IFx1MDkxNVx1MDkzMFx1MDk0N1x1MDkwMlx1MDk2NCAzLiBcdTA5MzhcdTA5MkVcdTA5MkYgXHUwOTJBXHUwOTMwIFx1MDkzOFx1MDkzRlx1MDkwMlx1MDkxQVx1MDkzRVx1MDkwOCBcdTA5MTVcdTA5MzBcdTA5NDdcdTA5MDJcdTA5NjQgNC4gXHUwOTFDXHUwOTQ4XHUwOTM1LVx1MDkxNVx1MDk0MFx1MDkxRlx1MDkyOFx1MDkzRVx1MDkzNlx1MDkxNVx1MDk0Qlx1MDkwMiBcdTA5MTVcdTA5NDcgXHUwOTM4XHUwOTNFXHUwOTI1IFx1MDkxNVx1MDk0MFx1MDkxRlx1MDk0Qlx1MDkwMiBcdTA5MTVcdTA5M0UgXHUwOTJBXHUwOTREXHUwOTMwXHUwOTJDXHUwOTAyXHUwOTI3XHUwOTI4IFx1MDkxNVx1MDkzMFx1MDk0N1x1MDkwMlx1MDk2NFwiLFxyXG4gICAgICAgIG9yOiBcIlx1MEIwNVx1MEIyRVx1MEIzMyBcdTBCMkNcdTBCNDNcdTBCMjZcdTBCNERcdTBCMjdcdTBCM0YgXHUwQjJBXHUwQjNFXHUwQjA3XHUwQjAxOiAxLiBcdTBCMkVcdTBCM0VcdTBCMUZcdTBCM0YgXHUwQjJBXHUwQjMwXHUwQjQwXHUwQjE1XHUwQjREXHUwQjM3XHUwQjNFIFx1MEIyOFx1MEIzRlx1MEIzNlx1MEI0RFx1MEIxQVx1MEIzRlx1MEIyNCBcdTBCMTVcdTBCMzBcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCAyLiBcdTBCMkFcdTBCNERcdTBCMzBcdTBCMkVcdTBCM0VcdTBCMjNcdTBCM0ZcdTBCMjQgXHUwQjJDXHUwQjNGXHUwQjM5XHUwQjI4IFx1MEIyQ1x1MEI0RFx1MEI1Rlx1MEIyQ1x1MEIzOVx1MEIzRVx1MEIzMCBcdTBCMTVcdTBCMzBcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCAzLiBcdTBCMjBcdTBCM0ZcdTBCMTVcdTBCNEQgXHUwQjM4XHUwQjJFXHUwQjVGXHUwQjMwXHUwQjQ3IFx1MEIxQ1x1MEIzM1x1MEIzOFx1MEI0N1x1MEIxQVx1MEIyOCBcdTBCMTVcdTBCMzBcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCA0LiBcdTBCMUNcdTBCNDhcdTBCMkMgXHUwQjE1XHUwQjQwXHUwQjFGXHUwQjI4XHUwQjNFXHUwQjM2XHUwQjE1IFx1MEIzOFx1MEIzOVx1MEIzRlx1MEIyNCBcdTBCMzZcdTBCNDBcdTBCMThcdTBCNERcdTBCMzAgXHUwQjJBXHUwQjRCXHUwQjE1IFx1MEIyQVx1MEIzMFx1MEIzRlx1MEIxQVx1MEIzRVx1MEIzM1x1MEIyOFx1MEIzRSBcdTBCMTVcdTBCMzBcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfFwiLFxyXG4gICAgICB9LFxyXG4gICAgICBpcnJpZ2F0aW9uOiB7XHJcbiAgICAgICAgZW46IFwiSXJyaWdhdGlvbiB0aXA6IFdhdGVyIGVhcmx5IG1vcm5pbmcgb3IgbGF0ZSBldmVuaW5nIHRvIHJlZHVjZSBldmFwb3JhdGlvbi4gRm9yIHBhZGR5LCBtYWludGFpbiBzdGFuZGluZyB3YXRlciBvbmx5IGF0IGNyaXRpY2FsIHN0YWdlcy5cIixcclxuICAgICAgICBoaTogXCJcdTA5MzhcdTA5M0ZcdTA5MDJcdTA5MUFcdTA5M0VcdTA5MDggXHUwOTFGXHUwOTNGXHUwOTJBOiBcdTA5MzVcdTA5M0VcdTA5MzdcdTA5NERcdTA5MkFcdTA5NDBcdTA5MTVcdTA5MzBcdTA5MjMgXHUwOTE1XHUwOTJFIFx1MDkxNVx1MDkzMFx1MDkyOFx1MDk0NyBcdTA5MTVcdTA5NDcgXHUwOTMyXHUwOTNGXHUwOTBGIFx1MDkzOFx1MDk0MVx1MDkyQ1x1MDkzOSBcdTA5MUNcdTA5MzJcdTA5NERcdTA5MjZcdTA5NDAgXHUwOTJGXHUwOTNFIFx1MDkyNlx1MDk0N1x1MDkzMCBcdTA5MzZcdTA5M0VcdTA5MkUgXHUwOTE1XHUwOTRCIFx1MDkyQVx1MDkzRVx1MDkyOFx1MDk0MCBcdTA5MjZcdTA5NDdcdTA5MDJcdTA5NjQgXHUwOTI3XHUwOTNFXHUwOTI4IFx1MDkxNVx1MDk0NyBcdTA5MzJcdTA5M0ZcdTA5MEYsIFx1MDkxNVx1MDk0N1x1MDkzNVx1MDkzMiBcdTA5MkVcdTA5MzlcdTA5MjRcdTA5NERcdTA5MzVcdTA5MkFcdTA5NDJcdTA5MzBcdTA5NERcdTA5MjMgXHUwOTFBXHUwOTMwXHUwOTIzXHUwOTRCXHUwOTAyIFx1MDkyRVx1MDk0N1x1MDkwMiBcdTA5MTZcdTA5MjFcdTA5M0NcdTA5M0UgXHUwOTJBXHUwOTNFXHUwOTI4XHUwOTQwIFx1MDkzMFx1MDkxNlx1MDk0N1x1MDkwMlx1MDk2NFwiLFxyXG4gICAgICAgIG9yOiBcIlx1MEIxQ1x1MEIzM1x1MEIzOFx1MEI0N1x1MEIxQVx1MEIyOCBcdTBCMUZcdTBCM0ZcdTBCMkFcdTBCNERcdTBCMkFcdTBCMjNcdTBCNDA6IFx1MEIyQ1x1MEIzRVx1MEIzN1x1MEI0RFx1MEIyQVx1MEI0MFx1MEIxNVx1MEIzMFx1MEIyMyBcdTBCMzlcdTBCNERcdTBCMzBcdTBCM0VcdTBCMzggXHUwQjE1XHUwQjMwXHUwQjNGXHUwQjJDXHUwQjNFXHUwQjE1XHUwQjQxIFx1MEIyRFx1MEI0Qlx1MEIzMCBcdTBCMTVcdTBCM0ZcdTBCMkVcdTBCNERcdTBCMkNcdTBCM0UgXHUwQjJDXHUwQjNGXHUwQjMzXHUwQjJFXHUwQjREXHUwQjJDXHUwQjNGXHUwQjI0IFx1MEIzOFx1MEIyOFx1MEI0RFx1MEIyN1x1MEI0RFx1MEI1Rlx1MEIzRVx1MEIzMFx1MEI0NyBcdTBCMkFcdTBCM0VcdTBCMjNcdTBCM0YgXHUwQjI2XHUwQjNGXHUwQjA1XHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIHwgXHUwQjI3XHUwQjNFXHUwQjI4IFx1MEIyQVx1MEIzRVx1MEIwN1x1MEIwMSwgXHUwQjE1XHUwQjQ3XHUwQjJDXHUwQjMzIFx1MEIxN1x1MEI0MVx1MEIzMFx1MEI0MVx1MEIyNFx1MEI0RFx1MEI3MVx1MEIyQVx1MEI0Mlx1MEIzMFx1MEI0RFx1MEIyM1x1MEI0RFx1MEIyMyBcdTBCMkFcdTBCMzBcdTBCNERcdTBCMkZcdTBCNERcdTBCNUZcdTBCM0VcdTBCNUZcdTBCMzBcdTBCNDcgXHUwQjFCXHUwQjNGXHUwQjIxXHUwQjNFIFx1MEIzOVx1MEI0Qlx1MEIwN1x1MEIyNVx1MEIzRlx1MEIyQ1x1MEIzRSBcdTBCMkFcdTBCM0VcdTBCMjNcdTBCM0YgXHUwQjMwXHUwQjE2XHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIHxcIixcclxuICAgICAgfSxcclxuICAgICAgd2hlYXQ6IHtcclxuICAgICAgICBlbjogXCJXaGVhdCBBZHZpc29yeTogU293aW5nIHRpbWUgaXMgTm92IDEtMTUuIFVzZSBOUEsgMTIwOjYwOjQwLiBJcnJpZ2F0ZSBhdCBDUkkgc3RhZ2UgKDIxIGRheXMgYWZ0ZXIgc293aW5nKS5cIixcclxuICAgICAgICBoaTogXCJcdTA5MTdcdTA5NDdcdTA5MzlcdTA5NDJcdTA5MDIgXHUwOTM4XHUwOTMyXHUwOTNFXHUwOTM5OiBcdTA5MkNcdTA5NDFcdTA5MzVcdTA5M0VcdTA5MDggXHUwOTE1XHUwOTNFIFx1MDkzOFx1MDkyRVx1MDkyRiAxLTE1IFx1MDkyOFx1MDkzNVx1MDkwMlx1MDkyQ1x1MDkzMCBcdTA5MzlcdTA5NDhcdTA5NjQgTlBLIDEyMDo2MDo0MCBcdTA5MTVcdTA5M0UgXHUwOTJBXHUwOTREXHUwOTMwXHUwOTJGXHUwOTRCXHUwOTE3IFx1MDkxNVx1MDkzMFx1MDk0N1x1MDkwMlx1MDk2NCBDUkkgXHUwOTA1XHUwOTM1XHUwOTM4XHUwOTREXHUwOTI1XHUwOTNFIChcdTA5MkNcdTA5NDFcdTA5MzVcdTA5M0VcdTA5MDggXHUwOTE1XHUwOTQ3IDIxIFx1MDkyNlx1MDkzRlx1MDkyOCBcdTA5MkNcdTA5M0VcdTA5MjYpIFx1MDkyQVx1MDkzMCBcdTA5MzhcdTA5M0ZcdTA5MDJcdTA5MUFcdTA5M0VcdTA5MDggXHUwOTE1XHUwOTMwXHUwOTQ3XHUwOTAyXHUwOTY0XCIsXHJcbiAgICAgICAgb3I6IFwiXHUwQjE3XHUwQjM5XHUwQjJFIFx1MEIyQVx1MEIzMFx1MEIzRVx1MEIyRVx1MEIzMFx1MEI0RFx1MEIzNjogXHUwQjJDXHUwQjQxXHUwQjIzXHUwQjNGXHUwQjJDXHUwQjNFIFx1MEIzOFx1MEIyRVx1MEI1RiBcdTBCMjhcdTBCMkRcdTBCNDdcdTBCMkVcdTBCNERcdTBCMkNcdTBCMzAgMS0xNSBcdTBCMDVcdTBCMUZcdTBCNDcgfCBOUEsgMTIwOjYwOjQwIFx1MEIyQ1x1MEI0RFx1MEI1Rlx1MEIyQ1x1MEIzOVx1MEIzRVx1MEIzMCBcdTBCMTVcdTBCMzBcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCBDUkkgXHUwQjJBXHUwQjMwXHUwQjREXHUwQjJGXHUwQjREXHUwQjVGXHUwQjNFXHUwQjVGXHUwQjMwXHUwQjQ3IFx1MEIxQ1x1MEIzM1x1MEIzOFx1MEI0N1x1MEIxQVx1MEIyOCAoXHUwQjJDXHUwQjQxXHUwQjIzXHUwQjNGXHUwQjJDXHUwQjNFXHUwQjMwIDIxIFx1MEIyNlx1MEIzRlx1MEIyOCBcdTBCMkFcdTBCMzBcdTBCNDcpIHxcIixcclxuICAgICAgfSxcclxuICAgICAgcmljZToge1xyXG4gICAgICAgIGVuOiBcIlJpY2UgQWR2aXNvcnk6IE1haW50YWluIDItNWNtIHdhdGVyIGxldmVsLiBBcHBseSBVcmVhIGluIHNwbGl0cy4gV2F0Y2ggb3V0IGZvciBTdGVtIEJvcmVyIGFuZCBCbGFzdCBkaXNlYXNlLlwiLFxyXG4gICAgICAgIGhpOiBcIlx1MDkyN1x1MDkzRVx1MDkyOCBcdTA5MzhcdTA5MzJcdTA5M0VcdTA5Mzk6IDItNSBcdTA5MzhcdTA5NDdcdTA5MkVcdTA5NDAgXHUwOTFDXHUwOTMyIFx1MDkzOFx1MDk0RFx1MDkyNFx1MDkzMCBcdTA5MkNcdTA5MjhcdTA5M0VcdTA5MEYgXHUwOTMwXHUwOTE2XHUwOTQ3XHUwOTAyXHUwOTY0IFx1MDkyRlx1MDk0Mlx1MDkzMFx1MDkzRlx1MDkyRlx1MDkzRSBcdTA5MTVcdTA5NEIgXHUwOTFGXHUwOTQxXHUwOTE1XHUwOTIxXHUwOTNDXHUwOTRCXHUwOTAyIFx1MDkyRVx1MDk0N1x1MDkwMiBcdTA5MjFcdTA5M0VcdTA5MzJcdTA5NDdcdTA5MDJcdTA5NjQgXHUwOTI0XHUwOTI4XHUwOTNFIFx1MDkxQlx1MDk0N1x1MDkyNlx1MDkxNSBcdTA5MTRcdTA5MzAgXHUwOTJDXHUwOTREXHUwOTMyXHUwOTNFXHUwOTM4XHUwOTREXHUwOTFGIFx1MDkzMFx1MDk0Qlx1MDkxNyBcdTA5MzhcdTA5NDcgXHUwOTM4XHUwOTNFXHUwOTM1XHUwOTI3XHUwOTNFXHUwOTI4IFx1MDkzMFx1MDkzOVx1MDk0N1x1MDkwMlx1MDk2NFwiLFxyXG4gICAgICAgIG9yOiBcIlx1MEIyN1x1MEIzRVx1MEIyOCBcdTBCMkFcdTBCMzBcdTBCM0VcdTBCMkVcdTBCMzBcdTBCNERcdTBCMzY6IDItNSBcdTBCMzhcdTBCNDdcdTBCMkVcdTBCM0YgXHUwQjFDXHUwQjMzIFx1MEIzOFx1MEI0RFx1MEIyNFx1MEIzMCBcdTBCMkNcdTBCMUNcdTBCM0VcdTBCNUYgXHUwQjMwXHUwQjE2XHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIHwgXHUwQjVGXHUwQjQxXHUwQjMwXHUwQjNGXHUwQjA2XHUwQjE1XHUwQjQxIFx1MEIyRFx1MEIzRVx1MEIxNyBcdTBCMkRcdTBCM0VcdTBCMTcgXHUwQjE1XHUwQjMwXHUwQjNGIFx1MEIyQVx1MEI0RFx1MEIzMFx1MEI1Rlx1MEI0Qlx1MEIxNyBcdTBCMTVcdTBCMzBcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCBcdTBCMzdcdTBCNERcdTBCMUZcdTBCNDdcdTBCMkVcdTBCNEQgXHUwQjJDXHUwQjRCXHUwQjMwXHUwQjMwXHUwQjREIFx1MEIwRlx1MEIyQ1x1MEIwMiBcdTBCMkNcdTBCNERcdTBCMzJcdTBCM0VcdTBCMzdcdTBCNERcdTBCMUYgXHUwQjMwXHUwQjRCXHUwQjE3IFx1MEIyQVx1MEI0RFx1MEIzMFx1MEIyNFx1MEIzRiBcdTBCMzhcdTBCM0VcdTBCMkNcdTBCMjdcdTBCM0VcdTBCMjggXHUwQjMwXHUwQjQxXHUwQjM5XHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIHxcIixcclxuICAgICAgfSxcclxuICAgICAgZ2VuZXJhbDoge1xyXG4gICAgICAgIGVuOiBcIkdlbmVyYWwgYWR2aXNvcnk6IGNob29zZSBjcm9wcyBiYXNlZCBvbiBsb2NhbCBjbGltYXRlIGFuZCBzb2lsIHRlc3QuIE1haW50YWluIGJhbGFuY2VkIE5QSyBhbmQgdXNlIGNvbXBvc3QuIE1vbml0b3IgcGVzdHMgd2Vla2x5IGFuZCBpcnJpZ2F0ZSBiYXNlZCBvbiBzb2lsIG1vaXN0dXJlLlwiLFxyXG4gICAgICAgIGhpOiBcIlx1MDkzOFx1MDkzRVx1MDkyRVx1MDkzRVx1MDkyOFx1MDk0RFx1MDkyRiBcdTA5MzhcdTA5MzJcdTA5M0VcdTA5Mzk6IFx1MDkzOFx1MDk0RFx1MDkyNVx1MDkzRVx1MDkyOFx1MDk0MFx1MDkyRiBcdTA5MUNcdTA5MzJcdTA5MzVcdTA5M0VcdTA5MkZcdTA5NDEgXHUwOTE0XHUwOTMwIFx1MDkyRVx1MDkzRlx1MDkxRlx1MDk0RFx1MDkxRlx1MDk0MCBcdTA5MkFcdTA5MzBcdTA5NDBcdTA5MTVcdTA5NERcdTA5MzdcdTA5MjMgXHUwOTE1XHUwOTQ3IFx1MDkwNlx1MDkyN1x1MDkzRVx1MDkzMCBcdTA5MkFcdTA5MzAgXHUwOTJCXHUwOTM4XHUwOTMyIFx1MDkxQVx1MDk0MVx1MDkyOFx1MDk0N1x1MDkwMlx1MDk2NCBcdTA5MzhcdTA5MDJcdTA5MjRcdTA5NDFcdTA5MzJcdTA5M0ZcdTA5MjQgTlBLIFx1MDkyQ1x1MDkyOFx1MDkzRVx1MDkwRiBcdTA5MzBcdTA5MTZcdTA5NDdcdTA5MDIgXHUwOTE0XHUwOTMwIFx1MDkxNlx1MDkzRVx1MDkyNiBcdTA5MTVcdTA5M0UgXHUwOTA5XHUwOTJBXHUwOTJGXHUwOTRCXHUwOTE3IFx1MDkxNVx1MDkzMFx1MDk0N1x1MDkwMlx1MDk2NCBcdTA5MzhcdTA5M0VcdTA5MkFcdTA5NERcdTA5MjRcdTA5M0VcdTA5MzlcdTA5M0ZcdTA5MTUgXHUwOTE1XHUwOTQwXHUwOTFGXHUwOTRCXHUwOTAyIFx1MDkxNVx1MDk0MCBcdTA5MjhcdTA5M0ZcdTA5MTdcdTA5MzBcdTA5M0VcdTA5MjhcdTA5NDAgXHUwOTE1XHUwOTMwXHUwOTQ3XHUwOTAyXHUwOTY0XCIsXHJcbiAgICAgICAgb3I6IFwiXHUwQjM4XHUwQjNFXHUwQjI3XHUwQjNFXHUwQjMwXHUwQjIzIFx1MEIyQVx1MEIzMFx1MEIzRVx1MEIyRVx1MEIzMFx1MEI0RFx1MEIzNjogXHUwQjM4XHUwQjREXHUwQjI1XHUwQjNFXHUwQjI4XHUwQjQwXHUwQjVGIFx1MEIxQ1x1MEIzM1x1MEIyQ1x1MEIzRVx1MEI1Rlx1MEI0MSBcdTBCMEZcdTBCMkNcdTBCMDIgXHUwQjJFXHUwQjQzXHUwQjI0XHUwQjREXHUwQjI0XHUwQjNGXHUwQjE1XHUwQjNFIFx1MEIyQVx1MEIzMFx1MEI0MFx1MEIxNVx1MEI0RFx1MEIzN1x1MEIzRSBcdTBCMDlcdTBCMkFcdTBCMzBcdTBCNDcgXHUwQjA2XHUwQjI3XHUwQjNFXHUwQjMwIFx1MEIxNVx1MEIzMFx1MEIzRiBcdTBCMkJcdTBCMzhcdTBCMzIgXHUwQjJDXHUwQjNFXHUwQjFCXHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIHwgXHUwQjM4XHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxXHUwQjMzXHUwQjNGXHUwQjI0IE5QSyBcdTBCMkNcdTBCMUNcdTBCM0VcdTBCNUYgXHUwQjMwXHUwQjE2XHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIFx1MEIwRlx1MEIyQ1x1MEIwMiBcdTBCMTVcdTBCMkVcdTBCNERcdTBCMkFcdTBCNEJcdTBCMzdcdTBCNERcdTBCMUYgXHUwQjJDXHUwQjREXHUwQjVGXHUwQjJDXHUwQjM5XHUwQjNFXHUwQjMwIFx1MEIxNVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8IFx1MEIzOFx1MEIzRVx1MEIyQVx1MEI0RFx1MEIyNFx1MEIzRVx1MEIzOVx1MEIzRlx1MEIxNSBcdTBCMkFcdTBCNEJcdTBCMTUgXHUwQjA5XHUwQjJBXHUwQjMwXHUwQjQ3IFx1MEIyOFx1MEIxQ1x1MEIzMCBcdTBCMzBcdTBCMTZcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfFwiLFxyXG4gICAgICB9LFxyXG4gICAgICBmYWxsYmFjazoge1xyXG4gICAgICAgIGVuOiBcIkkgY2FuIGhlbHAgd2l0aCB3ZWF0aGVyLCBtYXJrZXQgcHJpY2VzLCBhbmQgY3JvcCBhZHZpc29yeS4gQXNrIG1lIGFib3V0IGFueSBvZiB0aGVzZS5cIixcclxuICAgICAgICBoaTogXCJcdTA5MkVcdTA5NDhcdTA5MDIgXHUwOTJFXHUwOTRDXHUwOTM4XHUwOTJFLCBcdTA5MkVcdTA5MDJcdTA5MjFcdTA5NDAgXHUwOTJEXHUwOTNFXHUwOTM1IFx1MDkxNFx1MDkzMCBcdTA5MkJcdTA5MzhcdTA5MzIgXHUwOTM4XHUwOTMyXHUwOTNFXHUwOTM5IFx1MDkyRVx1MDk0N1x1MDkwMiBcdTA5MkVcdTA5MjZcdTA5MjYgXHUwOTE1XHUwOTMwIFx1MDkzOFx1MDkxNVx1MDkyNFx1MDkzRSBcdTA5MzlcdTA5NDJcdTA5MDJcdTA5NjQgXHUwOTJFXHUwOTQxXHUwOTFEXHUwOTM4XHUwOTQ3IFx1MDkwN1x1MDkyOFx1MDkyRVx1MDk0N1x1MDkwMiBcdTA5MzhcdTA5NDcgXHUwOTE1XHUwOTNGXHUwOTM4XHUwOTQwIFx1MDkxNVx1MDk0NyBcdTA5MkNcdTA5M0VcdTA5MzBcdTA5NDcgXHUwOTJFXHUwOTQ3XHUwOTAyIFx1MDkyRFx1MDk0MCBcdTA5MkFcdTA5NDJcdTA5MUJcdTA5NDdcdTA5MDJcdTA5NjRcIixcclxuICAgICAgICBvcjogXCJcdTBCMkVcdTBCNDFcdTBCMDEgXHUwQjJBXHUwQjNFXHUwQjIzXHUwQjNGXHUwQjJBXHUwQjNFXHUwQjE3LCBcdTBCMkNcdTBCMUNcdTBCM0VcdTBCMzAgXHUwQjJFXHUwQjQyXHUwQjMyXHUwQjREXHUwQjVGIFx1MEIwRlx1MEIyQ1x1MEIwMiBcdTBCMkJcdTBCMzhcdTBCMzIgXHUwQjJBXHUwQjMwXHUwQjNFXHUwQjJFXHUwQjMwXHUwQjREXHUwQjM2XHUwQjMwXHUwQjQ3IFx1MEIzOFx1MEIzRVx1MEIzOVx1MEIzRVx1MEIyRlx1MEI0RFx1MEI1RiBcdTBCMTVcdTBCMzBcdTBCM0ZcdTBCMkFcdTBCM0VcdTBCMzBcdTBCM0ZcdTBCMkNcdTBCM0YgfCBcdTBCMEZcdTBCMTdcdTBCNDFcdTBCMjFcdTBCM0ZcdTBCMTUgXHUwQjJDXHUwQjNGXHUwQjM3XHUwQjVGXHUwQjMwXHUwQjQ3IFx1MEIyRVx1MEI0Qlx1MEIyNFx1MEI0NyBcdTBCMkFcdTBCMUFcdTBCM0VcdTBCMzBcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfFwiLFxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEhlbHBlciB0byBnZXQgdGV4dCBiYXNlZCBvbiBsYW5nXHJcbiAgICBjb25zdCBnZXRUZXh0ID0gKGtleToga2V5b2YgdHlwZW9mIHQpID0+IHtcclxuICAgICAgY29uc3QgZW50cnkgPSB0W2tleV0gYXMgYW55O1xyXG4gICAgICBpZiAoaXNIaSkgcmV0dXJuIGVudHJ5LmhpO1xyXG4gICAgICBpZiAoaXNPcikgcmV0dXJuIGVudHJ5Lm9yO1xyXG4gICAgICByZXR1cm4gZW50cnkuZW47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKC8od2VhdGhlcnx0ZW1wfHJhaW58bWF1c2FtfHBhYW5pcGFhZykvLnRlc3QobSkgJiYgbGF0ICE9IG51bGwgJiYgbG9uICE9IG51bGwpIHtcclxuICAgICAgY29uc3Qga2V5ID0gcHJvY2Vzcy5lbnYuT1BFTldFQVRIRVJfQVBJX0tFWTtcclxuICAgICAgaWYgKGtleSkge1xyXG4gICAgICAgIGNvbnN0IHIgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICAgIGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9sYXQ9JHtsYXR9Jmxvbj0ke2xvbn0mYXBwaWQ9JHtrZXl9JnVuaXRzPW1ldHJpY2AsXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoci5vaykge1xyXG4gICAgICAgICAgY29uc3QgdyA9IGF3YWl0IHIuanNvbigpO1xyXG4gICAgICAgICAgY29uc3QgZ2V0V1RleHQgPSB0LndlYXRoZXJbaXNIaSA/ICdoaScgOiBpc09yID8gJ29yJyA6ICdlbiddO1xyXG4gICAgICAgICAgcmVwbGllcy5wdXNoKGdldFdUZXh0KHcud2VhdGhlcj8uWzBdPy5kZXNjcmlwdGlvbiB8fCBcIlwiLCB3Lm1haW4/LnRlbXAgPz8gXCI/XCIsIHcubWFpbj8uaHVtaWRpdHkgPz8gXCI/XCIpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoLyhwcmljZXxtYW5kaXxtYXJrZXR8YmhhdnxkYWFtfGRhcikvLnRlc3QobSkpIHtcclxuICAgICAgcmVwbGllcy5wdXNoKGdldFRleHQoJ21hcmtldCcpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoLyh5aWVsZHxwcm9kdWN0aW9ufGhhcnZlc3R8cGVkYXZhcnxhbWFsKS8udGVzdChtKSkge1xyXG4gICAgICByZXBsaWVzLnB1c2goZ2V0VGV4dCgneWllbGQnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKC8oaXJyaWdhdGlvbnx3YXRlcnxzaW5jaGFpfHBhbml8c2VjaGFuKS8udGVzdChtKSkge1xyXG4gICAgICByZXBsaWVzLnB1c2goZ2V0VGV4dCgnaXJyaWdhdGlvbicpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoLyhjcm9wfGZlcnRpbGl6ZXJ8YWR2aWNlfGFkdmlzb3J5fHdoZWF0fHJpY2V8Y29ybnxnZWh1fGRoYW58ZmFzYWwpLy50ZXN0KG0pKSB7XHJcbiAgICAgIGlmIChtLmluY2x1ZGVzKFwid2hlYXRcIikgfHwgbS5pbmNsdWRlcyhcImdlaHVcIikpIHtcclxuICAgICAgICByZXBsaWVzLnB1c2goZ2V0VGV4dCgnd2hlYXQnKSk7XHJcbiAgICAgIH0gZWxzZSBpZiAobS5pbmNsdWRlcyhcInJpY2VcIikgfHwgbS5pbmNsdWRlcyhcInBhZGR5XCIpIHx8IG0uaW5jbHVkZXMoXCJkaGFuXCIpKSB7XHJcbiAgICAgICAgcmVwbGllcy5wdXNoKGdldFRleHQoJ3JpY2UnKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVwbGllcy5wdXNoKGdldFRleHQoJ2dlbmVyYWwnKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlcGxpZXMubGVuZ3RoKVxyXG4gICAgICByZXBsaWVzLnB1c2goZ2V0VGV4dCgnZmFsbGJhY2snKSk7XHJcblxyXG4gICAgcmVzLmpzb24oeyByZXBseTogcmVwbGllcy5qb2luKFwiXFxuXCIpIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiY2hhdCBlcnJvclwiIH0pO1xyXG4gIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxcdXRpbHNcXFxcc29pbERhdGEudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3V0aWxzL3NvaWxEYXRhLnRzXCI7ZXhwb3J0IGludGVyZmFjZSBTb2lsSW5mbyB7XHJcbiAgICBwaDogc3RyaW5nO1xyXG4gICAgbW9pc3R1cmU6IHN0cmluZztcclxuICAgIHRlbXBlcmF0dXJlOiBzdHJpbmc7XHJcbiAgICB0eXBlOiBzdHJpbmc7XHJcbiAgICBub3Rlczogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc29pbERhdGFiYXNlOiBSZWNvcmQ8c3RyaW5nLCBTb2lsSW5mbz4gPSB7XHJcbiAgICByaWNlOiB7XHJcbiAgICAgICAgcGg6IFwiNS41IC0gNy4wXCIsXHJcbiAgICAgICAgbW9pc3R1cmU6IFwiSGlnaCAoRmxvb2RlZClcIixcclxuICAgICAgICB0ZW1wZXJhdHVyZTogXCIyMFx1MDBCMEMgLSAzNVx1MDBCMENcIixcclxuICAgICAgICB0eXBlOiBcIkNsYXkgb3IgQ2xheSBMb2FtXCIsXHJcbiAgICAgICAgbm90ZXM6IFwiUmljZSByZXF1aXJlIHN0YW5kaW5nIHdhdGVyIGZvciBwYXJ0IG9mIGl0cyBncm93dGggY3ljbGUuXCIsXHJcbiAgICB9LFxyXG4gICAgY29ybjoge1xyXG4gICAgICAgIHBoOiBcIjUuOCAtIDcuMFwiLFxyXG4gICAgICAgIG1vaXN0dXJlOiBcIk1vZGVyYXRlXCIsXHJcbiAgICAgICAgdGVtcGVyYXR1cmU6IFwiMThcdTAwQjBDIC0gMjdcdTAwQjBDXCIsXHJcbiAgICAgICAgdHlwZTogXCJXZWxsLWRyYWluZWQgTG9hbVwiLFxyXG4gICAgICAgIG5vdGVzOiBcIlJlcXVpcmVzIG5pdHJvZ2VuLXJpY2ggc29pbC5cIixcclxuICAgIH0sXHJcbiAgICBtYWl6ZToge1xyXG4gICAgICAgIHBoOiBcIjUuOCAtIDcuMFwiLFxyXG4gICAgICAgIG1vaXN0dXJlOiBcIk1vZGVyYXRlXCIsXHJcbiAgICAgICAgdGVtcGVyYXR1cmU6IFwiMThcdTAwQjBDIC0gMjdcdTAwQjBDXCIsXHJcbiAgICAgICAgdHlwZTogXCJXZWxsLWRyYWluZWQgTG9hbVwiLFxyXG4gICAgICAgIG5vdGVzOiBcIlNhbWUgYXMgY29ybjsgbml0cm9nZW4tcmljaCBzb2lsIHByZWZlcnJlZC5cIixcclxuICAgIH0sXHJcbiAgICBwb3RhdG86IHtcclxuICAgICAgICBwaDogXCI0LjggLSA1LjVcIixcclxuICAgICAgICBtb2lzdHVyZTogXCJTdGVhZHkvQ29uc2lzdGVudFwiLFxyXG4gICAgICAgIHRlbXBlcmF0dXJlOiBcIjE1XHUwMEIwQyAtIDIwXHUwMEIwQ1wiLFxyXG4gICAgICAgIHR5cGU6IFwiU2FuZHkgTG9hbVwiLFxyXG4gICAgICAgIG5vdGVzOiBcIkFjaWRpYyBzb2lsIGhlbHBzIHByZXZlbnQgc2NhYiBkaXNlYXNlLlwiLFxyXG4gICAgfSxcclxuICAgIHdoZWF0OiB7XHJcbiAgICAgICAgcGg6IFwiNi4wIC0gNy4wXCIsXHJcbiAgICAgICAgbW9pc3R1cmU6IFwiTG93IC0gTW9kZXJhdGVcIixcclxuICAgICAgICB0ZW1wZXJhdHVyZTogXCIxNVx1MDBCMEMgLSAyNVx1MDBCMENcIixcclxuICAgICAgICB0eXBlOiBcIkxvYW0gb3IgQ2xheSBMb2FtXCIsXHJcbiAgICAgICAgbm90ZXM6IFwiRG9lcyBub3QgdG9sZXJhdGUgd2F0ZXJsb2dnaW5nIHdlbGwuXCIsXHJcbiAgICB9LFxyXG4gICAgdG9tYXRvOiB7XHJcbiAgICAgICAgcGg6IFwiNi4wIC0gNi44XCIsXHJcbiAgICAgICAgbW9pc3R1cmU6IFwiUmVndWxhci9FdmVuXCIsXHJcbiAgICAgICAgdGVtcGVyYXR1cmU6IFwiMjBcdTAwQjBDIC0gMjVcdTAwQjBDXCIsXHJcbiAgICAgICAgdHlwZTogXCJTYW5keSBMb2FtXCIsXHJcbiAgICAgICAgbm90ZXM6IFwiTmVlZHMgY2FsY2l1bSB0byBwcmV2ZW50IGJsb3Nzb20gZW5kIHJvdC5cIixcclxuICAgIH0sXHJcbiAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgcGg6IFwiNi4wIC0gNy4wXCIsXHJcbiAgICAgICAgbW9pc3R1cmU6IFwiTW9kZXJhdGVcIixcclxuICAgICAgICB0ZW1wZXJhdHVyZTogXCIyMFx1MDBCMEMgLSAyNVx1MDBCMENcIixcclxuICAgICAgICB0eXBlOiBcIkxvYW1cIixcclxuICAgICAgICBub3RlczogXCJTdGFuZGFyZCBhZ3JpY3VsdHVyYWwgc29pbCBjb25kaXRpb25zLlwiLFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTb2lsSW5mbyhjcm9wTmFtZTogc3RyaW5nKTogU29pbEluZm8ge1xyXG4gICAgY29uc3QgbG93ZXIgPSBjcm9wTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc29pbERhdGFiYXNlKSkge1xyXG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcyhrZXkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzb2lsRGF0YWJhc2Vba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc29pbERhdGFiYXNlLmRlZmF1bHQ7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1xcXFxwcmVkaWN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9yb3V0ZXMvcHJlZGljdC50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IG11bHRlciBmcm9tIFwibXVsdGVyXCI7XHJcbmltcG9ydCB7IGZldGNoV2l0aFRpbWVvdXQsIHJldHJ5IH0gZnJvbSBcIi4uL3V0aWxzL2h0dHBcIjtcclxuaW1wb3J0IHsgZ2V0U29pbEluZm8gfSBmcm9tIFwiLi4vdXRpbHMvc29pbERhdGFcIjtcclxuXHJcbmNvbnN0IHVwbG9hZCA9IG11bHRlcigpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHVwbG9hZE1pZGRsZXdhcmUgPSB1cGxvYWQuc2luZ2xlKFwiaW1hZ2VcIik7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBydW5IdWdnaW5nRmFjZShpbWFnZTogQnVmZmVyKSB7XHJcbiAgY29uc3QgdG9rZW4gPSBwcm9jZXNzLmVudi5IRl9UT0tFTiB8fCBwcm9jZXNzLmVudi5IVUdHSU5HRkFDRV9UT0tFTjtcclxuICBjb25zdCBtb2RlbCA9IHByb2Nlc3MuZW52LkhGX01PREVMIHx8IFwibWljcm9zb2Z0L3Jlc25ldC01MFwiOyAvLyBnZW5lcmljIGltYWdlIGNsYXNzaWZpZXJcclxuICBpZiAoIXRva2VuKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGktaW5mZXJlbmNlLmh1Z2dpbmdmYWNlLmNvL21vZGVscy8ke2VuY29kZVVSSUNvbXBvbmVudChtb2RlbCl9YDtcclxuICBjb25zdCBoZWFkZXJzOiBIZWFkZXJzSW5pdCA9IHtcclxuICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0b2tlbn1gLFxyXG4gICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcclxuICB9O1xyXG4gIGNvbnN0IHJlcyA9IGF3YWl0IHJldHJ5KFxyXG4gICAgKCkgPT5cclxuICAgICAgZmV0Y2hXaXRoVGltZW91dChcclxuICAgICAgICB1cmwsXHJcbiAgICAgICAgeyBtZXRob2Q6IFwiUE9TVFwiLCBoZWFkZXJzLCBib2R5OiBpbWFnZSBhcyBhbnkgfSxcclxuICAgICAgICAxMjAwMCxcclxuICAgICAgKSxcclxuICAgIDIsXHJcbiAgICA1MDAsXHJcbiAgKTtcclxuICBpZiAoIXJlcy5vaykgcmV0dXJuIG51bGw7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xyXG4gICAgLy8gSEYgcmV0dXJucyBhbiBhcnJheSBvZiB7IGxhYmVsLCBzY29yZSB9XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xyXG4gICAgICByZXR1cm4gZGF0YVxyXG4gICAgICAgIC5zbGljZSgwLCA1KVxyXG4gICAgICAgIC5tYXAoKGQ6IGFueSkgPT4gKHsgY2xhc3NOYW1lOiBkLmxhYmVsLCBwcm9iYWJpbGl0eTogZC5zY29yZSB9KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLy8gVVBEQVRFOiBydW5Mb2NhbEFJU2VydmljZSBub3cgcmV0dXJucyB0aGUgcmF3IHJlc3VsdCwgaGFuZGxpbmcgbm9ybWFsaXphdGlvbiBpbiBtYWluIGhhbmRsZXJcclxuYXN5bmMgZnVuY3Rpb24gcnVuTG9jYWxBSVNlcnZpY2UoZmlsZTogYW55KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2ZpbGUuYnVmZmVyXSwgeyB0eXBlOiBmaWxlLm1pbWV0eXBlIH0pO1xyXG4gICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZVwiLCBibG9iLCBmaWxlLm9yaWdpbmFsbmFtZSk7XHJcblxyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goXCJodHRwOi8vbG9jYWxob3N0OjgwMDAvcHJlZGljdC9kaXNlYXNlXCIsIHtcclxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgYm9keTogZm9ybURhdGEsXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgIHJldHVybiBhd2FpdCByZXMuanNvbigpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkxvY2FsIEFJIHNlcnZpY2UgdW5yZWFjaGFibGUsIHVzaW5nIGZhbGxiYWNrXCIpO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHByZWRpY3RIYW5kbGVyOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIGNvbnN0IGZpbGUgPSAocmVxIGFzIGFueSkuZmlsZTtcclxuICBpZiAoIWZpbGUpIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcImZpbGUgcmVxdWlyZWRcIiB9KTtcclxuXHJcbiAgbGV0IHByZWRpY3Rpb25zOiB7IGNsYXNzTmFtZTogc3RyaW5nOyBwcm9iYWJpbGl0eTogbnVtYmVyIH1bXSA9IFtdO1xyXG4gIGxldCBzb3VyY2UgPSBcInNlcnZlci1tb2NrXCI7XHJcbiAgbGV0IGRldGVjdGVkQ3JvcCA9IFwidW5rbm93blwiO1xyXG5cclxuICAvLyAxLiBUcnkgTG9jYWwgUHl0aG9uIEFJIFNlcnZpY2VcclxuICBjb25zdCBsb2NhbFJlc3VsdCA9IGF3YWl0IHJ1bkxvY2FsQUlTZXJ2aWNlKGZpbGUpO1xyXG5cclxuICBpZiAobG9jYWxSZXN1bHQgJiYgbG9jYWxSZXN1bHQuYW5hbHlzaXMpIHtcclxuICAgIHNvdXJjZSA9IFwibG9jYWwtYWktc2VydmljZVwiO1xyXG4gICAgLy8gTm9ybWFsaXplIExvY2FsIEFJIHJlc3VsdCB0byBvdXIgc3RhbmRhcmQgbGlzdCBmb3JtYXQgZm9yIHRoZSBmcm9udGVuZFxyXG4gICAgLy8gVGhlIFB5dGhvbiBzZXJ2aWNlIHJldHVybnM6IHsgc3RhdHVzLCBkaXNlYXNlLCBjb25maWRlbmNlLCByZWNvbW1lbmRhdGlvbiB9XHJcbiAgICBpZiAobG9jYWxSZXN1bHQuYW5hbHlzaXMuZGlzZWFzZSkge1xyXG4gICAgICBwcmVkaWN0aW9ucyA9IFt7XHJcbiAgICAgICAgY2xhc3NOYW1lOiBsb2NhbFJlc3VsdC5hbmFseXNpcy5kaXNlYXNlLFxyXG4gICAgICAgIHByb2JhYmlsaXR5OiBsb2NhbFJlc3VsdC5hbmFseXNpcy5jb25maWRlbmNlXHJcbiAgICAgIH1dO1xyXG4gICAgICAvLyBUcnkgdG8gaW5mZXIgY3JvcCBmcm9tIGZpbGVuYW1lIG9yIGRpc2Vhc2UgbmFtZSBpZiBwb3NzaWJsZSwgXHJcbiAgICAgIC8vIGJ1dCBmb3Igbm93IHdlIG1pZ2h0IHJlbHkgb24gZmlsZW5hbWUgcGFzc2VkIG9yIGltcHJvdmUgUHl0aG9uIHNlcnZpY2UgdG8gcmV0dXJuIGNyb3AuXHJcbiAgICAgIC8vIExldCdzIHVzZSBmaWxlbmFtZSBhcyBhIGhpbnQgZm9yIHNvaWwgaW5mby5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHByZWRpY3Rpb25zID0gW3tcclxuICAgICAgICBjbGFzc05hbWU6IGxvY2FsUmVzdWx0LmFuYWx5c2lzLnN0YXR1cyB8fCBcIkhlYWx0aHlcIixcclxuICAgICAgICBwcm9iYWJpbGl0eTogbG9jYWxSZXN1bHQuYW5hbHlzaXMuY29uZmlkZW5jZSB8fCAwLjk5XHJcbiAgICAgIH1dO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gMi4gVHJ5IEh1Z2dpbmcgRmFjZSAoaWYgbG9jYWwgZmFpbGVkKVxyXG4gIGVsc2Uge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgaGYgPSBhd2FpdCBydW5IdWdnaW5nRmFjZShmaWxlLmJ1ZmZlciBhcyBCdWZmZXIpO1xyXG4gICAgICBpZiAoaGYpIHtcclxuICAgICAgICBzb3VyY2UgPSBcImh1Z2dpbmdmYWNlXCI7XHJcbiAgICAgICAgcHJlZGljdGlvbnMgPSBoZjtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCB7IH1cclxuICB9XHJcblxyXG4gIC8vIDMuIEZhbGxiYWNrIE1vY2sgTG9naWMgKGlmIG90aGVycyBmYWlsZWQgb3IgcmV0dXJuZWQgbm90aGluZylcclxuICBpZiAocHJlZGljdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICBjb25zdCBuYW1lID0gZmlsZS5vcmlnaW5hbG5hbWUgfHwgXCJpbWFnZS5qcGdcIjtcclxuICAgIGNvbnN0IGxvd2VyID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIC8vIFJpY2VcclxuICAgIGlmIChsb3dlci5pbmNsdWRlcyhcInJpY2VcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJwYWRkeVwiKSkge1xyXG4gICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJibGFzdFwiKSkge1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiUmljZSBCbGFzdFwiLCBwcm9iYWJpbGl0eTogMC45MiB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiQnJvd24gU3BvdFwiLCBwcm9iYWJpbGl0eTogMC4wNSB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBSaWNlXCIsIHByb2JhYmlsaXR5OiAwLjAzIH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgfSBlbHNlIGlmIChsb3dlci5pbmNsdWRlcyhcImJyb3duXCIpKSB7XHJcbiAgICAgICAgcHJlZGljdGlvbnMgPSBbXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJCcm93biBTcG90XCIsIHByb2JhYmlsaXR5OiAwLjg4IH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJSaWNlIEJsYXN0XCIsIHByb2JhYmlsaXR5OiAwLjA4IH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJIZWFsdGh5IFJpY2VcIiwgcHJvYmFiaWxpdHk6IDAuMDQgfSxcclxuICAgICAgICBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBSaWNlXCIsIHByb2JhYmlsaXR5OiAwLjk1IH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJEZWZpY2llbmN5IChaaW5jKVwiLCBwcm9iYWJpbGl0eTogMC4wMyB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiUmljZSBCbGFzdFwiLCBwcm9iYWJpbGl0eTogMC4wMiB9LFxyXG4gICAgICAgIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIENvcm4gLyBNYWl6ZVxyXG4gICAgZWxzZSBpZiAobG93ZXIuaW5jbHVkZXMoXCJjb3JuXCIpIHx8IGxvd2VyLmluY2x1ZGVzKFwibWFpemVcIikpIHtcclxuICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwicnVzdFwiKSkge1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiQ29tbW9uIFJ1c3RcIiwgcHJvYmFiaWxpdHk6IDAuOTQgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkdyYXkgTGVhZiBTcG90XCIsIHByb2JhYmlsaXR5OiAwLjA0IH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJIZWFsdGh5IENvcm5cIiwgcHJvYmFiaWxpdHk6IDAuMDIgfSxcclxuICAgICAgICBdO1xyXG4gICAgICB9IGVsc2UgaWYgKGxvd2VyLmluY2x1ZGVzKFwiYmxpZ2h0XCIpKSB7XHJcbiAgICAgICAgcHJlZGljdGlvbnMgPSBbXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJOb3J0aGVybiBDb3JuIExlYWYgQmxpZ2h0XCIsIHByb2JhYmlsaXR5OiAwLjkxIH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJDb21tb24gUnVzdFwiLCBwcm9iYWJpbGl0eTogMC4wNiB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBDb3JuXCIsIHByb2JhYmlsaXR5OiAwLjAzIH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgQ29yblwiLCBwcm9iYWJpbGl0eTogMC45NiB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiQ29tbW9uIFJ1c3RcIiwgcHJvYmFiaWxpdHk6IDAuMDMgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkdyYXkgTGVhZiBTcG90XCIsIHByb2JhYmlsaXR5OiAwLjAxIH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gUG90YXRvXHJcbiAgICBlbHNlIGlmIChsb3dlci5pbmNsdWRlcyhcInBvdGF0b1wiKSkge1xyXG4gICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJlYXJseVwiKSkge1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiRWFybHkgQmxpZ2h0XCIsIHByb2JhYmlsaXR5OiAwLjg5IH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJMYXRlIEJsaWdodFwiLCBwcm9iYWJpbGl0eTogMC4wNyB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBQb3RhdG9cIiwgcHJvYmFiaWxpdHk6IDAuMDQgfSxcclxuICAgICAgICBdO1xyXG4gICAgICB9IGVsc2UgaWYgKGxvd2VyLmluY2x1ZGVzKFwibGF0ZVwiKSkge1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiTGF0ZSBCbGlnaHRcIiwgcHJvYmFiaWxpdHk6IDAuOTMgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkVhcmx5IEJsaWdodFwiLCBwcm9iYWJpbGl0eTogMC4wNSB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBQb3RhdG9cIiwgcHJvYmFiaWxpdHk6IDAuMDIgfSxcclxuICAgICAgICBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBQb3RhdG9cIiwgcHJvYmFiaWxpdHk6IDAuOTcgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkVhcmx5IEJsaWdodFwiLCBwcm9iYWJpbGl0eTogMC4wMiB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiTGF0ZSBCbGlnaHRcIiwgcHJvYmFiaWxpdHk6IDAuMDEgfSxcclxuICAgICAgICBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBHZW5lcmljIC8gRGVmYXVsdFxyXG4gICAgZWxzZSBpZiAoXHJcbiAgICAgIGxvd2VyLmluY2x1ZGVzKFwiYmxpZ2h0XCIpIHx8XHJcbiAgICAgIGxvd2VyLmluY2x1ZGVzKFwiZnVuZ3VzXCIpIHx8XHJcbiAgICAgIGxvd2VyLmluY2x1ZGVzKFwibGVhZlwiKVxyXG4gICAgKSB7XHJcbiAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcIkxlYWYgYmxpZ2h0IChhcHByb3gpXCIsIHByb2JhYmlsaXR5OiAwLjg2IH0sXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiU2VwdG9yaWEtbGlrZVwiLCBwcm9iYWJpbGl0eTogMC4wOCB9LFxyXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgbGVhZlwiLCBwcm9iYWJpbGl0eTogMC4wNiB9LFxyXG4gICAgICBdO1xyXG4gICAgfSBlbHNlIGlmIChsb3dlci5pbmNsdWRlcyhcInJ1c3RcIikpIHtcclxuICAgICAgcHJlZGljdGlvbnMgPSBbXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiUnVzdCBkaXNlYXNlIChhcHByb3gpXCIsIHByb2JhYmlsaXR5OiAwLjc4IH0sXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBsZWFmXCIsIHByb2JhYmlsaXR5OiAwLjE1IH0sXHJcbiAgICAgIF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICB7IGNsYXNzTmFtZTogXCJIZWFsdGh5IGxlYWZcIiwgcHJvYmFiaWxpdHk6IDAuNyB9LFxyXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcIlVua25vd25cIiwgcHJvYmFiaWxpdHk6IDAuMiB9LFxyXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcIlNvaWwvQmFja2dyb3VuZFwiLCBwcm9iYWJpbGl0eTogMC4wOSB9LFxyXG4gICAgICBdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRGV0ZXJtaW5lIENyb3AgTmFtZSBmb3IgU29pbCBJbmZvXHJcbiAgLy8gSWYgd2UgaGF2ZSBhIGZpbGVuYW1lLCB1c2UgdGhhdC4gSWYgbm90LCBjaGVjayB0aGUgdG9wIHByZWRpY3Rpb24gY2xhc3MgbmFtZS5cclxuICBjb25zdCBuYW1lVG9DaGVjayA9IGZpbGUub3JpZ2luYWxuYW1lICsgXCIgXCIgKyAocHJlZGljdGlvbnNbMF0/LmNsYXNzTmFtZSB8fCBcIlwiKTtcclxuICBjb25zdCBzb2lsSW5mbyA9IGdldFNvaWxJbmZvKG5hbWVUb0NoZWNrKTtcclxuXHJcbiAgcmVzLmpzb24oe1xyXG4gICAgc291cmNlLFxyXG4gICAgcHJlZGljdGlvbnMsXHJcbiAgICBzb2lsSW5mb1xyXG4gIH0pO1xyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXGF1dGgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9hdXRoLnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBGYXJtZXIgfSBmcm9tIFwiLi4vZGJcIjtcclxuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0anNcIjtcclxuXHJcbi8vIC0tIFJFR0lTVEVSIC0tXHJcbmV4cG9ydCBjb25zdCByZWdpc3RlcjogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBuYW1lLCBlbWFpbCwgcGFzc3dvcmQsIHBob25lLCBzb2lsVHlwZSwgbGFuZFNpemUsIGxhbmd1YWdlLCBsb2NhdGlvbiwgcm9sZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgaWYgKCFuYW1lIHx8ICFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgIXBob25lKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIk5hbWUsIGVtYWlsLCBwYXNzd29yZCwgYW5kIHBob25lIGFyZSByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHVzZXIgZXhpc3RzXHJcbiAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IEZhcm1lci5maW5kT25lKHsgZW1haWwgfSk7XHJcbiAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiVXNlciB3aXRoIHRoaXMgZW1haWwgYWxyZWFkeSBleGlzdHNcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYXNoIHBhc3N3b3JkXHJcbiAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMCk7XHJcblxyXG4gICAgY29uc3QgbmV3RmFybWVyID0gYXdhaXQgRmFybWVyLmNyZWF0ZSh7XHJcbiAgICAgIG5hbWUsXHJcbiAgICAgIGVtYWlsLFxyXG4gICAgICBwYXNzd29yZDogaGFzaGVkUGFzc3dvcmQsXHJcbiAgICAgIHBob25lLFxyXG4gICAgICBzb2lsVHlwZSxcclxuICAgICAgbGFuZFNpemUsXHJcbiAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZSB8fCBcImVuLUlOXCIsXHJcbiAgICAgIGxvY2F0aW9uLFxyXG4gICAgICByb2xlOiByb2xlIHx8IFwiZmFybWVyXCIsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXR1cm4gdXNlciB3aXRob3V0IHBhc3N3b3JkXHJcbiAgICBjb25zdCB7IHBhc3N3b3JkOiBfLCAuLi51c2VyV2l0aG91dFBhc3N3b3JkIH0gPSBuZXdGYXJtZXIudG9PYmplY3QgPyBuZXdGYXJtZXIudG9PYmplY3QoKSA6IG5ld0Zhcm1lcjtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHVzZXJXaXRob3V0UGFzc3dvcmQpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYXV0aF0gUmVnaXN0ZXIgZXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJSZWdpc3RyYXRpb24gZmFpbGVkXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gLS0gTE9HSU4gLS1cclxuZXhwb3J0IGNvbnN0IGxvZ2luOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiRW1haWwgYW5kIHBhc3N3b3JkIGFyZSByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZhcm1lciA9IGF3YWl0IEZhcm1lci5maW5kT25lKHsgZW1haWwgfSk7XHJcbiAgICBpZiAoIWZhcm1lcikge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBlcnJvcjogXCJJbnZhbGlkIGNyZWRlbnRpYWxzXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgcGFzc3dvcmRcclxuICAgIGlmIChmYXJtZXIucGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgbWF0Y2ggPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgZmFybWVyLnBhc3N3b3JkKTtcclxuICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIiB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTGVnYWN5IHVzZXJzIHdpdGggbm8gcGFzc3dvcmQgY2Fubm90IGxvZ2luIHZpYSBlbWFpbC9wYXNzIHlldFxyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJQbGVhc2UgdXNlIHBob25lIGxvZ2luIG9yIHJlc2V0IHBhc3N3b3JkXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBwYXNzd29yZDogXywgLi4udXNlcldpdGhvdXRQYXNzd29yZCB9ID0gZmFybWVyLnRvT2JqZWN0ID8gZmFybWVyLnRvT2JqZWN0KCkgOiBmYXJtZXI7XHJcbiAgICByZXMuanNvbih1c2VyV2l0aG91dFBhc3N3b3JkKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2F1dGhdIExvZ2luIGVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiTG9naW4gZmFpbGVkXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gLS0gTEVHQUNZIC8gVVBTRVJUIChLZWVwIGZvciBiYWNrd2FyZCBjb21wYXQgaWYgbmVlZGVkLCBvciByZW1vdmUpIC0tXHJcbmV4cG9ydCBjb25zdCB1cHNlcnRGYXJtZXI6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgbmFtZSwgcGhvbmUsIHNvaWxUeXBlLCBsYW5kU2l6ZSwgbGFuZ3VhZ2UsIGxvY2F0aW9uIH0gPSByZXEuYm9keSBhcyBhbnk7XHJcbiAgICBpZiAoIW5hbWUgfHwgIXBob25lKVxyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJuYW1lIGFuZCBwaG9uZSByZXF1aXJlZFwiIH0pO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZURhdGEgPSB7IG5hbWUsIHBob25lLCBzb2lsVHlwZSwgbGFuZFNpemUsIGxhbmd1YWdlLCBsb2NhdGlvbiB9O1xyXG4gICAgXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgRmFybWVyLmZpbmRPbmVBbmRVcGRhdGUoXHJcbiAgICAgIHsgcGhvbmUgfSxcclxuICAgICAgdXBkYXRlRGF0YSxcclxuICAgICAgeyBuZXc6IHRydWUsIHVwc2VydDogdHJ1ZSB9XHJcbiAgICApO1xyXG4gICAgcmVzLmpzb24oZGF0YSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthdXRoXSBVbmV4cGVjdGVkIGVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiYXV0aCBlcnJvclwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBndWVzdExvZ2luOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBndWVzdCA9IHtcclxuICAgICAgaWQ6IFwiZ3Vlc3RfXCIgKyBEYXRlLm5vdygpLFxyXG4gICAgICBuYW1lOiBcIkd1ZXN0IFVzZXJcIixcclxuICAgICAgcGhvbmU6IHVuZGVmaW5lZCxcclxuICAgICAgbGFuZ3VhZ2U6IHJlcS5ib2R5Py5sYW5ndWFnZSB8fCBcImVuLUlOXCIsXHJcbiAgICAgIGlzR3Vlc3Q6IHRydWUsXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKGd1ZXN0KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiR3Vlc3QgbG9naW4gZXJyb3I6XCIsIGUpO1xyXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiZ3Vlc3QgbG9naW4gZXJyb3JcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG4vLyAtLSBERUJVRyAtLVxyXG5leHBvcnQgY29uc3QgZ2V0RGVidWdVc2VyczogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAoX3JlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHVzZXJzID0gYXdhaXQgRmFybWVyLmZpbmQoe30pO1xyXG4gICAgcmVzLmpzb24odXNlcnMpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYXV0aF0gRGVidWcgdXNlcnMgZXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZmV0Y2ggdXNlcnNcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZGVsZXRlRGVidWdVc2VyOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgYXdhaXQgRmFybWVyLmZpbmRCeUlkQW5kRGVsZXRlKGlkKTtcclxuICAgIHJlcy5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2F1dGhdIERlbGV0ZSB1c2VyIGVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGRlbGV0ZSB1c2VyXCIgfSk7XHJcbiAgfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXHByb2ZpbGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9wcm9maWxlLnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBBZHZpc29yeUhpc3RvcnksIEZhcm1lciB9IGZyb20gXCIuLi9kYlwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHNhdmVBZHZpc29yeUhpc3Rvcnk6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZmFybWVySWQsIGNyb3AsIGFkdmlzb3J5LCB3ZWF0aGVyRGF0YSwgc29pbERhdGEgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgIGlmICghZmFybWVySWQgfHwgIWNyb3AgfHwgIWFkdmlzb3J5KSB7XHJcbiAgICAgIHJldHVybiByZXNcclxuICAgICAgICAuc3RhdHVzKDQwMClcclxuICAgICAgICAuanNvbih7IGVycm9yOiBcImZhcm1lcklkLCBjcm9wLCBhbmQgYWR2aXNvcnkgYXJlIHJlcXVpcmVkXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEFkdmlzb3J5SGlzdG9yeS5jcmVhdGUoe1xyXG4gICAgICBmYXJtZXJJZCxcclxuICAgICAgY3JvcCxcclxuICAgICAgYWR2aXNvcnksXHJcbiAgICAgIHdlYXRoZXJEYXRhLFxyXG4gICAgICBzb2lsRGF0YSxcclxuICAgIH0pO1xyXG5cclxuICAgIHJlcy5qc29uKGRhdGEpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbcHJvZmlsZV0gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gc2F2ZSBhZHZpc29yeVwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRBZHZpc29yeUhpc3Rvcnk6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZmFybWVySWQgfSA9IHJlcS5wYXJhbXM7XHJcbiAgICBjb25zdCBsaW1pdCA9IE51bWJlcihyZXEucXVlcnkubGltaXQgfHwgMTApO1xyXG5cclxuICAgIGlmICghZmFybWVySWQpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgaXMgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgQWR2aXNvcnlIaXN0b3J5LmZpbmQoeyBmYXJtZXJJZCB9KVxyXG4gICAgICAuc29ydCh7IGNyZWF0ZWRBdDogLTEgfSlcclxuICAgICAgLmxpbWl0KGxpbWl0KTtcclxuXHJcbiAgICByZXMuanNvbihkYXRhIHx8IFtdKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW3Byb2ZpbGVdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIGhpc3RvcnlcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UHJvZmlsZURhdGE6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZmFybWVySWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gICAgaWYgKCFmYXJtZXJJZCkge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJmYXJtZXJJZCBpcyByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBGYXJtZXIuZmluZEJ5SWQoZmFybWVySWQpO1xyXG5cclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiW3Byb2ZpbGVdIEZhcm1lciBub3QgZm91bmRcIik7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiBcIkZhcm1lciBub3QgZm91bmRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuanNvbih7XHJcbiAgICAgIC4uLmRhdGEsXHJcbiAgICAgIHN1YnNjcmlwdGlvblN0YXR1czogZGF0YS5zdWJzY3JpcHRpb25TdGF0dXMgfHwgXCJmcmVlXCIsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW3Byb2ZpbGVdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIHByb2ZpbGVcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlU3Vic2NyaXB0aW9uOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGZhcm1lcklkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgY29uc3QgeyBzdWJzY3JpcHRpb25TdGF0dXMgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgIGlmICghZmFybWVySWQpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgaXMgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIVtcImZyZWVcIiwgXCJwcmVtaXVtXCJdLmluY2x1ZGVzKHN1YnNjcmlwdGlvblN0YXR1cykpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiSW52YWxpZCBzdWJzY3JpcHRpb24gc3RhdHVzXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kRGF0ZS5zZXRGdWxsWWVhcihlbmREYXRlLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVQYXlsb2FkOiBhbnkgPSB7XHJcbiAgICAgIHN1YnNjcmlwdGlvblN0YXR1cyxcclxuICAgICAgc3Vic2NyaXB0aW9uU3RhcnREYXRlOiBub3csXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChzdWJzY3JpcHRpb25TdGF0dXMgPT09IFwicHJlbWl1bVwiKSB7XHJcbiAgICAgIHVwZGF0ZVBheWxvYWQuc3Vic2NyaXB0aW9uRW5kRGF0ZSA9IGVuZERhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEZhcm1lci5maW5kQnlJZEFuZFVwZGF0ZShmYXJtZXJJZCwgdXBkYXRlUGF5bG9hZCwge1xyXG4gICAgICBuZXc6IHRydWUsXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIltwcm9maWxlXSBGYXJtZXIgbm90IGZvdW5kXCIpO1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJGYXJtZXIgbm90IGZvdW5kXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLmpzb24oZGF0YSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIltwcm9maWxlXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byB1cGRhdGUgc3Vic2NyaXB0aW9uXCIgfSk7XHJcbiAgfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXGFuYWx5dGljcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL2FuYWx5dGljcy50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IHsgQW5hbHl0aWNzRGF0YSwgQWR2aXNvcnlIaXN0b3J5LCBGYXJtZXIgfSBmcm9tIFwiLi4vZGJcIjtcclxuXHJcbmV4cG9ydCBjb25zdCByZWNvcmRBbmFseXRpY3M6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgZmFybWVySWQsXHJcbiAgICAgIGNyb3AsXHJcbiAgICAgIGNyb3BIZWFsdGhTY29yZSxcclxuICAgICAgc29pbE1vaXN0dXJlLFxyXG4gICAgICBzb2lsTml0cm9nZW4sXHJcbiAgICAgIHNvaWxQSCxcclxuICAgICAgdGVtcGVyYXR1cmUsXHJcbiAgICAgIGh1bWlkaXR5LFxyXG4gICAgICByYWluZmFsbCxcclxuICAgICAgcGVzdFByZXNzdXJlLFxyXG4gICAgICBkaXNlYXNlUmlzayxcclxuICAgIH0gPSByZXEuYm9keTtcclxuXHJcbiAgICBpZiAoIWZhcm1lcklkIHx8ICFjcm9wKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcImZhcm1lcklkIGFuZCBjcm9wIGFyZSByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBBbmFseXRpY3NEYXRhLmNyZWF0ZSh7XHJcbiAgICAgIGZhcm1lcklkLFxyXG4gICAgICBjcm9wLFxyXG4gICAgICBjcm9wSGVhbHRoU2NvcmUsXHJcbiAgICAgIHNvaWxNb2lzdHVyZSxcclxuICAgICAgc29pbE5pdHJvZ2VuLFxyXG4gICAgICBzb2lsUEgsXHJcbiAgICAgIHRlbXBlcmF0dXJlLFxyXG4gICAgICBodW1pZGl0eSxcclxuICAgICAgcmFpbmZhbGwsXHJcbiAgICAgIHBlc3RQcmVzc3VyZSxcclxuICAgICAgZGlzZWFzZVJpc2ssXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXMuanNvbihkYXRhKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2FuYWx5dGljc10gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gcmVjb3JkIGFuYWx5dGljc1wiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRBbmFseXRpY3NTdW1tYXJ5OiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGZhcm1lcklkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgY29uc3QgZGF5cyA9IE51bWJlcihyZXEucXVlcnkuZGF5cyB8fCAzMCk7XHJcblxyXG4gICAgaWYgKCFmYXJtZXJJZCkge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJmYXJtZXJJZCBpcyByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGN1dG9mZkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY3V0b2ZmRGF0ZS5zZXREYXRlKGN1dG9mZkRhdGUuZ2V0RGF0ZSgpIC0gZGF5cyk7XHJcblxyXG4gICAgY29uc3QgYWxsQW5hbHl0aWNzID0gYXdhaXQgQW5hbHl0aWNzRGF0YS5maW5kKHtcclxuICAgICAgZmFybWVySWQsXHJcbiAgICAgIGNyZWF0ZWRBdDogeyAkZ3RlOiBjdXRvZmZEYXRlIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBhZHZpc29yaWVzID0gYXdhaXQgQWR2aXNvcnlIaXN0b3J5LmZpbmQoeyBmYXJtZXJJZCB9KTtcclxuXHJcbiAgICBjb25zdCByZWNlbnREYXRhID0gYWxsQW5hbHl0aWNzIHx8IFtdO1xyXG4gICAgY29uc3QgY3JvcFN0YXRzID0gbmV3IE1hcDxzdHJpbmcsIHsgY291bnQ6IG51bWJlcjsgc2NvcmVzOiBudW1iZXJbXSB9PigpO1xyXG5cclxuICAgIChhZHZpc29yaWVzIHx8IFtdKS5mb3JFYWNoKChhZHY6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoIWNyb3BTdGF0cy5oYXMoYWR2LmNyb3ApKSB7XHJcbiAgICAgICAgY3JvcFN0YXRzLnNldChhZHYuY3JvcCwgeyBjb3VudDogMCwgc2NvcmVzOiBbXSB9KTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBzdGF0cyA9IGNyb3BTdGF0cy5nZXQoYWR2LmNyb3ApITtcclxuICAgICAgc3RhdHMuY291bnQrKztcclxuICAgICAgc3RhdHMuc2NvcmVzLnB1c2goTWF0aC5yYW5kb20oKSAqIDMwICsgNzApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY3JvcFBlcmZvcm1hbmNlID0gQXJyYXkuZnJvbShjcm9wU3RhdHMuZW50cmllcygpKS5tYXAoXHJcbiAgICAgIChbY3JvcCwgc3RhdHNdKSA9PiAoe1xyXG4gICAgICAgIGNyb3AsXHJcbiAgICAgICAgY291bnQ6IHN0YXRzLmNvdW50LFxyXG4gICAgICAgIGF2Z1Njb3JlOlxyXG4gICAgICAgICAgc3RhdHMuc2NvcmVzLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgPyBzdGF0cy5zY29yZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyBzdGF0cy5zY29yZXMubGVuZ3RoXHJcbiAgICAgICAgICAgIDogMCxcclxuICAgICAgfSksXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNvaWxIZWFsdGhUcmVuZCA9IChyZWNlbnREYXRhIGFzIGFueVtdKVxyXG4gICAgICAuZmlsdGVyKFxyXG4gICAgICAgIChkOiBhbnkpID0+XHJcbiAgICAgICAgICBkLnNvaWxNb2lzdHVyZSAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICBkLnNvaWxOaXRyb2dlbiAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICBkLnNvaWxQSCAhPT0gdW5kZWZpbmVkLFxyXG4gICAgICApXHJcbiAgICAgIC5zbGljZSgtNylcclxuICAgICAgLm1hcCgoZDogYW55KSA9PiAoe1xyXG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKGQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICBtb2lzdHVyZTogZC5zb2lsTW9pc3R1cmUgfHwgTWF0aC5yYW5kb20oKSAqIDEwMCxcclxuICAgICAgICBuaXRyb2dlbjogZC5zb2lsTml0cm9nZW4gfHwgTWF0aC5yYW5kb20oKSAqIDEwMCxcclxuICAgICAgICBwSDogZC5zb2lsUEggfHwgNSArIE1hdGgucmFuZG9tKCkgKiAzLFxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgaWYgKHNvaWxIZWFsdGhUcmVuZC5sZW5ndGggPT09IDApIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDY7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gaSk7XHJcbiAgICAgICAgc29pbEhlYWx0aFRyZW5kLnB1c2goe1xyXG4gICAgICAgICAgZGF0ZTogZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICAgIG1vaXN0dXJlOiA0MCArIE1hdGgucmFuZG9tKCkgKiA0MCxcclxuICAgICAgICAgIG5pdHJvZ2VuOiAzMCArIE1hdGgucmFuZG9tKCkgKiA1MCxcclxuICAgICAgICAgIHBIOiA2ICsgTWF0aC5yYW5kb20oKSAqIDEuNSxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRlbXBzID0gcmVjZW50RGF0YVxyXG4gICAgICAuZmlsdGVyKChkOiBhbnkpID0+IGQudGVtcGVyYXR1cmUgIT09IHVuZGVmaW5lZClcclxuICAgICAgLm1hcCgoZDogYW55KSA9PiBkLnRlbXBlcmF0dXJlIGFzIG51bWJlcik7XHJcbiAgICBjb25zdCBodW1pZGl0aWVzID0gcmVjZW50RGF0YVxyXG4gICAgICAuZmlsdGVyKChkOiBhbnkpID0+IGQuaHVtaWRpdHkgIT09IHVuZGVmaW5lZClcclxuICAgICAgLm1hcCgoZDogYW55KSA9PiBkLmh1bWlkaXR5IGFzIG51bWJlcik7XHJcbiAgICBjb25zdCByYWluZmFsbHMgPSByZWNlbnREYXRhXHJcbiAgICAgIC5maWx0ZXIoKGQ6IGFueSkgPT4gZC5yYWluZmFsbCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAubWFwKChkOiBhbnkpID0+IGQucmFpbmZhbGwgYXMgbnVtYmVyKTtcclxuXHJcbiAgICBjb25zdCB3ZWF0aGVySW1wYWN0ID0ge1xyXG4gICAgICB0ZW1wZXJhdHVyZTpcclxuICAgICAgICB0ZW1wcy5sZW5ndGggPiAwXHJcbiAgICAgICAgICA/IHRlbXBzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gdGVtcHMubGVuZ3RoXHJcbiAgICAgICAgICA6IDI1ICsgTWF0aC5yYW5kb20oKSAqIDE1LFxyXG4gICAgICBodW1pZGl0eTpcclxuICAgICAgICBodW1pZGl0aWVzLmxlbmd0aCA+IDBcclxuICAgICAgICAgID8gaHVtaWRpdGllcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIGh1bWlkaXRpZXMubGVuZ3RoXHJcbiAgICAgICAgICA6IDUwICsgTWF0aC5yYW5kb20oKSAqIDMwLFxyXG4gICAgICByYWluZmFsbDpcclxuICAgICAgICByYWluZmFsbHMubGVuZ3RoID4gMFxyXG4gICAgICAgICAgPyByYWluZmFsbHMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyByYWluZmFsbHMubGVuZ3RoXHJcbiAgICAgICAgICA6IE1hdGgucmFuZG9tKCkgKiA1MCxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcGVzdEFuYWx5c2lzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJBcGhpZHNcIixcclxuICAgICAgICByaXNrOiBNYXRoLnJhbmRvbSgpICogODAsXHJcbiAgICAgICAgZnJlcXVlbmN5OiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1KSArIDEsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcIldoaXRlZmxpZXNcIixcclxuICAgICAgICByaXNrOiBNYXRoLnJhbmRvbSgpICogNjAsXHJcbiAgICAgICAgZnJlcXVlbmN5OiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KSArIDEsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcIkxlYWYgTWluZXJzXCIsXHJcbiAgICAgICAgcmlzazogTWF0aC5yYW5kb20oKSAqIDcwLFxyXG4gICAgICAgIGZyZXF1ZW5jeTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMykgKyAxLFxyXG4gICAgICB9LFxyXG4gICAgXTtcclxuXHJcbiAgICByZXMuanNvbih7XHJcbiAgICAgIHRvdGFsQWR2aXNvcmllczogKGFkdmlzb3JpZXMgfHwgW10pLmxlbmd0aCxcclxuICAgICAgY3JvcFBlcmZvcm1hbmNlLFxyXG4gICAgICBzb2lsSGVhbHRoVHJlbmQsXHJcbiAgICAgIHdlYXRoZXJJbXBhY3QsXHJcbiAgICAgIHBlc3RBbmFseXNpcyxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5hbHl0aWNzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCBhbmFseXRpY3NcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q3JvcFRyZW5kczogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBmYXJtZXJJZCB9ID0gcmVxLnBhcmFtcztcclxuICAgIGNvbnN0IHsgY3JvcCB9ID0gcmVxLnF1ZXJ5O1xyXG5cclxuICAgIGlmICghZmFybWVySWQgfHwgIWNyb3ApIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgYW5kIGNyb3AgYXJlIHJlcXVpcmVkXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEFuYWx5dGljc0RhdGEuZmluZCh7IGZhcm1lcklkLCBjcm9wIH0pXHJcbiAgICAgIC5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pXHJcbiAgICAgIC5saW1pdCgzMCk7XHJcblxyXG4gICAgY29uc3QgdHJlbmRzID0gKGRhdGEgfHwgW10pLnNsaWNlKC0zMCkubWFwKChkOiBhbnkpID0+ICh7XHJcbiAgICAgIGRhdGU6IG5ldyBEYXRlKGQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgaGVhbHRoU2NvcmU6IGQuY3JvcEhlYWx0aFNjb3JlIHx8IDAsXHJcbiAgICAgIHlpZWxkOiBkLnlpZWxkIHx8IDAsXHJcbiAgICAgIHBlc3RQcmVzc3VyZTogZC5wZXN0UHJlc3N1cmUgfHwgMCxcclxuICAgICAgZGlzZWFzZVJpc2s6IGQuZGlzZWFzZVJpc2sgfHwgMCxcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZiAodHJlbmRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSAoMTUgLSBpKSk7XHJcbiAgICAgICAgdHJlbmRzLnB1c2goe1xyXG4gICAgICAgICAgZGF0ZTogZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICAgIGhlYWx0aFNjb3JlOiA2MCArIE1hdGgucmFuZG9tKCkgKiAzNSxcclxuICAgICAgICAgIHlpZWxkOiA1MCArIE1hdGgucmFuZG9tKCkgKiA0MCxcclxuICAgICAgICAgIHBlc3RQcmVzc3VyZTogTWF0aC5yYW5kb20oKSAqIDYwLFxyXG4gICAgICAgICAgZGlzZWFzZVJpc2s6IE1hdGgucmFuZG9tKCkgKiA1MCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcy5qc29uKHRyZW5kcyk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthbmFseXRpY3NdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIGNyb3AgdHJlbmRzXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNvaWxIZWFsdGhUcmVuZDogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBmYXJtZXJJZCB9ID0gcmVxLnBhcmFtcztcclxuXHJcbiAgICBpZiAoIWZhcm1lcklkKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcImZhcm1lcklkIGlzIHJlcXVpcmVkXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEFuYWx5dGljc0RhdGEuZmluZCh7IGZhcm1lcklkIH0pXHJcbiAgICAgIC5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pXHJcbiAgICAgIC5saW1pdCgzMCk7XHJcblxyXG4gICAgY29uc3QgdHJlbmQgPSAoZGF0YSB8fCBbXSlcclxuICAgICAgLmZpbHRlcihcclxuICAgICAgICAoZDogYW55KSA9PlxyXG4gICAgICAgICAgZC5zb2lsTW9pc3R1cmUgIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgZC5zb2lsTml0cm9nZW4gIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgZC5zb2lsUEggIT09IHVuZGVmaW5lZCxcclxuICAgICAgKVxyXG4gICAgICAuc2xpY2UoLTMwKVxyXG4gICAgICAubWFwKChkOiBhbnkpID0+ICh7XHJcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoZC5jcmVhdGVkQXQpLnRvTG9jYWxlRGF0ZVN0cmluZyhcImVuLUlOXCIpLFxyXG4gICAgICAgIG1vaXN0dXJlOiBkLnNvaWxNb2lzdHVyZSB8fCAwLFxyXG4gICAgICAgIG5pdHJvZ2VuOiBkLnNvaWxOaXRyb2dlbiB8fCAwLFxyXG4gICAgICAgIHBIOiBkLnNvaWxQSCB8fCAwLFxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgaWYgKHRyZW5kLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSAoMTUgLSBpKSk7XHJcbiAgICAgICAgdHJlbmQucHVzaCh7XHJcbiAgICAgICAgICBkYXRlOiBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZyhcImVuLUlOXCIpLFxyXG4gICAgICAgICAgbW9pc3R1cmU6IDMwICsgTWF0aC5yYW5kb20oKSAqIDUwLFxyXG4gICAgICAgICAgbml0cm9nZW46IDIwICsgTWF0aC5yYW5kb20oKSAqIDYwLFxyXG4gICAgICAgICAgcEg6IDUuOCArIE1hdGgucmFuZG9tKCkgKiAxLjgsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXMuanNvbih0cmVuZCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthbmFseXRpY3NdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIHNvaWwgaGVhbHRoIHRyZW5kXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldFdlYXRoZXJJbXBhY3RBbmFseXNpczogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBmYXJtZXJJZCB9ID0gcmVxLnBhcmFtcztcclxuICAgIGNvbnN0IGRheXMgPSBOdW1iZXIocmVxLnF1ZXJ5LmRheXMgfHwgMzApO1xyXG5cclxuICAgIGlmICghZmFybWVySWQpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgaXMgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjdXRvZmZEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIGN1dG9mZkRhdGUuc2V0RGF0ZShjdXRvZmZEYXRlLmdldERhdGUoKSAtIGRheXMpO1xyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBBbmFseXRpY3NEYXRhLmZpbmQoe1xyXG4gICAgICBmYXJtZXJJZCxcclxuICAgICAgY3JlYXRlZEF0OiB7ICRndGU6IGN1dG9mZkRhdGUgfSxcclxuICAgIH0pXHJcbiAgICAgIC5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pXHJcbiAgICAgIC5saW1pdCgxNSk7XHJcblxyXG4gICAgY29uc3QgYW5hbHlzaXMgPSAoZGF0YSB8fCBbXSlcclxuICAgICAgLmZpbHRlcihcclxuICAgICAgICAoZDogYW55KSA9PlxyXG4gICAgICAgICAgZC50ZW1wZXJhdHVyZSAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICBkLmh1bWlkaXR5ICE9PSB1bmRlZmluZWQgfHxcclxuICAgICAgICAgIGQucmFpbmZhbGwgIT09IHVuZGVmaW5lZCxcclxuICAgICAgKVxyXG4gICAgICAuc2xpY2UoLTE1KVxyXG4gICAgICAubWFwKChkOiBhbnkpID0+ICh7XHJcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoZC5jcmVhdGVkQXQpLnRvTG9jYWxlRGF0ZVN0cmluZyhcImVuLUlOXCIpLFxyXG4gICAgICAgIHRlbXBlcmF0dXJlOiBkLnRlbXBlcmF0dXJlIHx8IDAsXHJcbiAgICAgICAgaHVtaWRpdHk6IGQuaHVtaWRpdHkgfHwgMCxcclxuICAgICAgICByYWluZmFsbDogZC5yYWluZmFsbCB8fCAwLFxyXG4gICAgICAgIGNyb3BIZWFsdGhTY29yZTogZC5jcm9wSGVhbHRoU2NvcmUgfHwgMCxcclxuICAgICAgfSkpO1xyXG5cclxuICAgIGlmIChhbmFseXNpcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gKDE1IC0gaSkpO1xyXG4gICAgICAgIGFuYWx5c2lzLnB1c2goe1xyXG4gICAgICAgICAgZGF0ZTogZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICAgIHRlbXBlcmF0dXJlOiAyMCArIE1hdGgucmFuZG9tKCkgKiAyMCxcclxuICAgICAgICAgIGh1bWlkaXR5OiA0MCArIE1hdGgucmFuZG9tKCkgKiA0MCxcclxuICAgICAgICAgIHJhaW5mYWxsOiBNYXRoLnJhbmRvbSgpICogMzAsXHJcbiAgICAgICAgICBjcm9wSGVhbHRoU2NvcmU6IDY1ICsgTWF0aC5yYW5kb20oKSAqIDMwLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLmpzb24oYW5hbHlzaXMpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5hbHl0aWNzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCB3ZWF0aGVyIGltcGFjdCBhbmFseXNpc1wiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRTeXN0ZW1PdmVydmlldzogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAoX3JlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEluIGEgcmVhbCBhcHAsIHRoZXNlIHdvdWxkIGJlIHNlcGFyYXRlIERCIHF1ZXJpZXNcclxuICAgIC8vIEZvciB0aGUgcGlsb3QvZGVtbywgd2Ugc2ltdWxhdGUgc3lzdGVtLXdpZGUgYWdncmVnYXRpb25zXHJcblxyXG4gICAgLy8gMS4gVXNlciBTdGF0c1xyXG4gICAgY29uc3QgdG90YWxGYXJtZXJzID0gYXdhaXQgRmFybWVyLmNvdW50RG9jdW1lbnRzKCk7XHJcbiAgICBjb25zdCBhY3RpdmVUb2RheSA9IDQ1OyAvLyBNb2NrIChyZXF1aXJlcyBzZXNzaW9uIHRyYWNraW5nKVxyXG5cclxuICAgIC8vIDIuIEFJIFVzYWdlIFN0YXRzXHJcbiAgICBjb25zdCB0b3RhbFNjYW5zID0gYXdhaXQgQW5hbHl0aWNzRGF0YS5jb3VudERvY3VtZW50cygpO1xyXG4gICAgY29uc3QgZGlzZWFzZURldGVjdGlvblJhdGUgPSAwLjE4OyAvLyAxOCUgb2Ygc2NhbnMgc2hvdyBkaXNlYXNlXHJcblxyXG4gICAgLy8gMy4gQU1VIENvbXBsaWFuY2UgKFNpbXVsYXRlZCBmcm9tIExlZGdlcilcclxuICAgIGNvbnN0IGFjdGl2ZVdpdGhkcmF3YWxzID0gMzsgLy8gTW9jayBjdXJyZW50IGFjdGl2ZSBhbGVydHNcclxuICAgIGNvbnN0IHRvdGFsVHJlYXRtZW50c0xvZ2dlZCA9IDg5O1xyXG5cclxuICAgIC8vIDQuIERpc2Vhc2UgVHJlbmRzIChmb3IgUGllIENoYXJ0KVxyXG4gICAgY29uc3QgZGlzZWFzZURpc3RyaWJ1dGlvbiA9IFtcclxuICAgICAgeyBuYW1lOiBcIkxlYWYgQmxpZ2h0XCIsIHZhbHVlOiA0NSB9LFxyXG4gICAgICB7IG5hbWU6IFwiWWVsbG93IFJ1c3RcIiwgdmFsdWU6IDI1IH0sXHJcbiAgICAgIHsgbmFtZTogXCJBcGhpZHNcIiwgdmFsdWU6IDIwIH0sXHJcbiAgICAgIHsgbmFtZTogXCJIZWFsdGh5XCIsIHZhbHVlOiAxMCB9LFxyXG4gICAgXTtcclxuXHJcbiAgICAvLyA1LiBBZG9wdGlvbiBUcmVuZCAoZm9yIExpbmUgQ2hhcnQpXHJcbiAgICBjb25zdCBhZG9wdGlvblRyZW5kID0gW1xyXG4gICAgICB7IG1vbnRoOiBcIkphblwiLCB1c2VyczogMjAgfSxcclxuICAgICAgeyBtb250aDogXCJGZWJcIiwgdXNlcnM6IDQ1IH0sXHJcbiAgICAgIHsgbW9udGg6IFwiTWFyXCIsIHVzZXJzOiA3OCB9LFxyXG4gICAgICB7IG1vbnRoOiBcIkFwclwiLCB1c2VyczogMTEwIH0sXHJcbiAgICAgIHsgbW9udGg6IFwiTWF5XCIsIHVzZXJzOiAxMjQgfSxcclxuICAgIF07XHJcblxyXG4gICAgcmVzLmpzb24oe1xyXG4gICAgICBtZXRyaWNzOiB7XHJcbiAgICAgICAgdG90YWxGYXJtZXJzLFxyXG4gICAgICAgIGFjdGl2ZVRvZGF5LFxyXG4gICAgICAgIHRvdGFsU2NhbnMsXHJcbiAgICAgICAgYWN0aXZlV2l0aGRyYXdhbHMsXHJcbiAgICAgICAgdG90YWxUcmVhdG1lbnRzTG9nZ2VkXHJcbiAgICAgIH0sXHJcbiAgICAgIGRpc2Vhc2VEaXN0cmlidXRpb24sXHJcbiAgICAgIGFkb3B0aW9uVHJlbmRcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5hbHl0aWNzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCBzeXN0ZW0gb3ZlcnZpZXdcIiB9KTtcclxuICB9XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcbmVvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL25lb24udHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcblxyXG4vLyBOZW9uIHZpYSBOZXRsaWZ5OiByZXF1aXJlcyBORVRMSUZZX0RBVEFCQVNFX1VSTCBlbnYgdmFyIHRvIGJlIHNldCBpbiBOZXRsaWZ5XHJcbi8vIGh0dHBzOi8vZG9jcy5uZXRsaWZ5LmNvbS9mcmFtZXdvcmtzL25lb24vXHJcbmV4cG9ydCBjb25zdCBnZXRQb3N0QnlJZDogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcyBhcyB7IGlkPzogc3RyaW5nIH07XHJcbiAgICBpZiAoIWlkKSByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJpZCByZXF1aXJlZFwiIH0pO1xyXG5cclxuICAgIC8vIExhenkgaW1wb3J0IHRvIGF2b2lkIGxvY2FsIGRldiBkZXBlbmRlbmN5IGlmIG5vdCBuZWVkZWRcclxuICAgIGNvbnN0IHsgbmVvbiB9ID0gYXdhaXQgaW1wb3J0KFwiQG5ldGxpZnkvbmVvblwiKTtcclxuXHJcbiAgICBjb25zdCBzcWwgPSBuZW9uKCk7IC8vIHVzZXMgZW52IE5FVExJRllfREFUQUJBU0VfVVJMXHJcbiAgICBjb25zdCByb3dzID0gYXdhaXQgc3FsYFNFTEVDVCAqIEZST00gcG9zdHMgV0hFUkUgaWQgPSAke2lkfWA7XHJcblxyXG4gICAgaWYgKCFyb3dzIHx8IHJvd3MubGVuZ3RoID09PSAwKVxyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJub3QgZm91bmRcIiB9KTtcclxuICAgIHJldHVybiByZXMuanNvbih7IHJvd3MgfSk7XHJcbiAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICBjb25zdCBtc2cgPSB0eXBlb2YgZT8ubWVzc2FnZSA9PT0gXCJzdHJpbmdcIiA/IGUubWVzc2FnZSA6IFwicXVlcnkgZmFpbGVkXCI7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogbXNnIH0pO1xyXG4gIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxsaWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXGxpYlxcXFxsZWRnZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL2xpYi9sZWRnZXIudHNcIjtpbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcclxuaW1wb3J0IHsgQmxvY2sgYXMgQmxvY2tNb2RlbCB9IGZyb20gXCIuLi9kYlwiO1xyXG5cclxuaW50ZXJmYWNlIEJsb2NrIHtcclxuICBpbmRleDogbnVtYmVyO1xyXG4gIHRpbWVzdGFtcDogc3RyaW5nO1xyXG4gIGRhdGE6IGFueTtcclxuICBwcmV2aW91c0hhc2g6IHN0cmluZztcclxuICBoYXNoOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBIYXNoQ2hhaW4ge1xyXG4gIHB1YmxpYyBjaGFpbjogQmxvY2tbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmNoYWluID0gW107XHJcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpIHtcclxuICAgIC8vIExvYWQgZnJvbSBEQiBvciBjcmVhdGUgR2VuZXNpc1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYmxvY2tzID0gYXdhaXQgQmxvY2tNb2RlbC5maW5kKHt9KS5zb3J0KHsgaW5kZXg6IDEgfSk7XHJcbiAgICAgIGlmIChibG9ja3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuY2hhaW4gPSBibG9ja3MubWFwKChiOiBhbnkpID0+ICh7XHJcbiAgICAgICAgICBpbmRleDogYi5pbmRleCxcclxuICAgICAgICAgIHRpbWVzdGFtcDogYi50aW1lc3RhbXAsXHJcbiAgICAgICAgICBkYXRhOiBiLmRhdGEsXHJcbiAgICAgICAgICBwcmV2aW91c0hhc2g6IGIucHJldmlvdXNIYXNoLFxyXG4gICAgICAgICAgaGFzaDogYi5oYXNoLFxyXG4gICAgICAgIH0pKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBnZW5lc2lzID0gdGhpcy5jcmVhdGVHZW5lc2lzQmxvY2soKTtcclxuICAgICAgICBhd2FpdCBCbG9ja01vZGVsLmNyZWF0ZShnZW5lc2lzKTtcclxuICAgICAgICB0aGlzLmNoYWluID0gW2dlbmVzaXNdO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBpbml0aWFsaXplIGxlZGdlcjpcIiwgZXJyb3IpO1xyXG4gICAgICAgLy8gRmFsbGJhY2sgdG8gbWVtb3J5IGdlbmVzaXMgaWYgREIgZmFpbHMgaW5pdGlhbGx5XHJcbiAgICAgICB0aGlzLmNoYWluID0gW3RoaXMuY3JlYXRlR2VuZXNpc0Jsb2NrKCldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVHZW5lc2lzQmxvY2soKTogQmxvY2sge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaW5kZXg6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICBkYXRhOiBcIkdlbmVzaXMgQmxvY2tcIixcclxuICAgICAgcHJldmlvdXNIYXNoOiBcIjBcIixcclxuICAgICAgaGFzaDogdGhpcy5jYWxjdWxhdGVIYXNoKDAsIFwiMFwiLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksIFwiR2VuZXNpcyBCbG9ja1wiKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbGN1bGF0ZUhhc2goXHJcbiAgICBpbmRleDogbnVtYmVyLFxyXG4gICAgcHJldmlvdXNIYXNoOiBzdHJpbmcsXHJcbiAgICB0aW1lc3RhbXA6IHN0cmluZyxcclxuICAgIGRhdGE6IGFueSxcclxuICApOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGNyeXB0b1xyXG4gICAgICAuY3JlYXRlSGFzaChcInNoYTI1NlwiKVxyXG4gICAgICAudXBkYXRlKGluZGV4ICsgcHJldmlvdXNIYXNoICsgdGltZXN0YW1wICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXHJcbiAgICAgIC5kaWdlc3QoXCJoZXhcIik7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0TGF0ZXN0QmxvY2soKTogQmxvY2sge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hhaW5bdGhpcy5jaGFpbi5sZW5ndGggLSAxXTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBhZGRCbG9jayhkYXRhOiBhbnkpOiBQcm9taXNlPEJsb2NrPiB7XHJcbiAgICBjb25zdCBsYXRlc3RCbG9jayA9IHRoaXMuZ2V0TGF0ZXN0QmxvY2soKTtcclxuICAgIGNvbnN0IGluZGV4ID0gbGF0ZXN0QmxvY2suaW5kZXggKyAxO1xyXG4gICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gICAgY29uc3QgcHJldmlvdXNIYXNoID0gbGF0ZXN0QmxvY2suaGFzaDtcclxuICAgIGNvbnN0IGhhc2ggPSB0aGlzLmNhbGN1bGF0ZUhhc2goaW5kZXgsIHByZXZpb3VzSGFzaCwgdGltZXN0YW1wLCBkYXRhKTtcclxuXHJcbiAgICBjb25zdCBuZXdCbG9jazogQmxvY2sgPSB7XHJcbiAgICAgIGluZGV4LFxyXG4gICAgICB0aW1lc3RhbXAsXHJcbiAgICAgIGRhdGEsXHJcbiAgICAgIHByZXZpb3VzSGFzaCxcclxuICAgICAgaGFzaCxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jaGFpbi5wdXNoKG5ld0Jsb2NrKTtcclxuICAgIFxyXG4gICAgLy8gUGVyc2lzdCB0byBEQlxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBCbG9ja01vZGVsLmNyZWF0ZShuZXdCbG9jayk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBwZXJzaXN0IGJsb2NrIHRvIERCXCIsIGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gbmV3QmxvY2s7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNDaGFpblZhbGlkKCk6IGJvb2xlYW4ge1xyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLmNoYWluLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRCbG9jayA9IHRoaXMuY2hhaW5baV07XHJcbiAgICAgIGNvbnN0IHByZXZpb3VzQmxvY2sgPSB0aGlzLmNoYWluW2kgLSAxXTtcclxuXHJcbiAgICAgIC8vIDEuIENoZWNrIGlmIHByZXNlcnZlZCBoYXNoIG1hdGNoZXMgY2FsY3VsYXRlZCBoYXNoXHJcbiAgICAgIGNvbnN0IHJlY2FsY3VsYXRlZEhhc2ggPSB0aGlzLmNhbGN1bGF0ZUhhc2goXHJcbiAgICAgICAgY3VycmVudEJsb2NrLmluZGV4LFxyXG4gICAgICAgIGN1cnJlbnRCbG9jay5wcmV2aW91c0hhc2gsXHJcbiAgICAgICAgY3VycmVudEJsb2NrLnRpbWVzdGFtcCxcclxuICAgICAgICBjdXJyZW50QmxvY2suZGF0YSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmIChjdXJyZW50QmxvY2suaGFzaCAhPT0gcmVjYWxjdWxhdGVkSGFzaCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gMi4gQ2hlY2sgaWYgcHJldmlvdXNIYXNoIG1hdGNoZXMgdGhlIGhhc2ggb2YgdGhlIHByZXZpb3VzIGJsb2NrXHJcbiAgICAgIGlmIChjdXJyZW50QmxvY2sucHJldmlvdXNIYXNoICE9PSBwcmV2aW91c0Jsb2NrLmhhc2gpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8gU2luZ2xldG9uIGluc3RhbmNlIGZvciB0aGUgYXBwXHJcbmV4cG9ydCBjb25zdCBsZWRnZXIgPSBuZXcgSGFzaENoYWluKCk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcYW11LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9yb3V0ZXMvYW11LnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBsZWRnZXIgfSBmcm9tIFwiLi4vbGliL2xlZGdlclwiO1xyXG5cclxuaW50ZXJmYWNlIERydWdMb2cge1xyXG4gIGFuaW1hbElkOiBzdHJpbmc7XHJcbiAgZHJ1Z05hbWU6IHN0cmluZztcclxuICBkb3NhZ2U6IHN0cmluZztcclxuICB3aXRoZHJhd2FsRGF5czogbnVtYmVyO1xyXG4gIGFwcGxpY2F0b3I6IHN0cmluZzsgLy8gJ0Zhcm1lcicgb3IgJ1ZldCdcclxuICB0cmVhdG1lbnREYXRlOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vIE1lbW9yeSBzdG9yZSByZW1vdmVkIGluIGZhdm9yIG9mIERCXHJcbmltcG9ydCB7IERydWdMb2cgfSBmcm9tIFwiLi4vZGJcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBsb2dUcmVhdG1lbnQ6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgYW5pbWFsSWQsIGRydWdOYW1lLCBkb3NhZ2UsIHdpdGhkcmF3YWxEYXlzLCBhcHBsaWNhdG9yIH0gPSByZXEuYm9keTtcclxuXHJcbiAgICBpZiAoIWFuaW1hbElkIHx8ICFkcnVnTmFtZSB8fCAhd2l0aGRyYXdhbERheXMpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiTWlzc2luZyByZXF1aXJlZCBmaWVsZHNcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmVhdG1lbnREYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG5cclxuICAgIGNvbnN0IGxvZ0VudHJ5ID0ge1xyXG4gICAgICBhbmltYWxJZCxcclxuICAgICAgZHJ1Z05hbWUsXHJcbiAgICAgIGRvc2FnZSxcclxuICAgICAgd2l0aGRyYXdhbERheXM6IE51bWJlcih3aXRoZHJhd2FsRGF5cyksXHJcbiAgICAgIGFwcGxpY2F0b3I6IGFwcGxpY2F0b3IgfHwgXCJGYXJtZXJcIixcclxuICAgICAgdHJlYXRtZW50RGF0ZSxcclxuICAgIH07XHJcblxyXG4gICAgLy8gMS4gQWRkIHRvIExlZGdlciAoQmxvY2tjaGFpbilcclxuICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgbGVkZ2VyLmFkZEJsb2NrKGxvZ0VudHJ5KTtcclxuXHJcbiAgICAvLyAyLiBBZGQgdG8gTG9jYWwgREIgKFBlcnNpc3RlbnQpXHJcbiAgICBhd2FpdCBEcnVnTG9nLmNyZWF0ZShsb2dFbnRyeSk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oe1xyXG4gICAgICBtZXNzYWdlOiBcIlRyZWF0bWVudCBsb2dnZWQgc3VjY2Vzc2Z1bGx5XCIsXHJcbiAgICAgIGJsb2NrSW5kZXg6IGJsb2NrLmluZGV4LFxyXG4gICAgICBibG9ja0hhc2g6IGJsb2NrLmhhc2gsXHJcbiAgICAgIHdpdGhkcmF3YWxFbmRzOiBnZXRXaXRoZHJhd2FsRW5kRGF0ZSh0cmVhdG1lbnREYXRlLCBOdW1iZXIod2l0aGRyYXdhbERheXMpKSxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2FtdV0gTG9nIGVycm9yOlwiLCBlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBsb2cgdHJlYXRtZW50XCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldEFuaW1hbFN0YXR1czogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBhbmltYWxJZCB9ID0gcmVxLnBhcmFtcztcclxuICAgIFxyXG4gICAgLy8gRmlsdGVyIGhpc3RvcnkgZm9yIHRoaXMgYW5pbWFsIGZyb20gREJcclxuICAgIGNvbnN0IHJlY29yZHMgPSBhd2FpdCBEcnVnTG9nLmZpbmQoeyBhbmltYWxJZCB9KTtcclxuICAgIFxyXG4gICAgLy8gQ2hlY2sgaWYgYW55IHdpdGhkcmF3YWwgcGVyaW9kIGlzIHN0aWxsIGFjdGl2ZVxyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgIGxldCBpc1NhZmUgPSB0cnVlO1xyXG4gICAgbGV0IGFjdGl2ZVdpdGhkcmF3YWwgPSBudWxsO1xyXG5cclxuICAgIGZvciAoY29uc3QgcmVjb3JkIG9mIHJlY29yZHMpIHtcclxuICAgICAgLy8gbW9uZ29vc2UgZG9jcyBtaWdodCBiZSBvYmplY3RzIG9yIGRvY3MsIGhhbmRsZSBhY2NvcmRpbmdseSBpZiBuZWVkZWRcclxuICAgICAgLy8gc2FmZSB0byBhc3N1bWUgcmVjb3JkIHN0cnVjdHVyZSBtYXRjaGVzIHNjaGVtYVxyXG4gICAgICBjb25zdCB0RGF0ZSA9IG5ldyBEYXRlKHJlY29yZC50cmVhdG1lbnREYXRlKTtcclxuICAgICAgY29uc3QgZW5kRGF0ZSA9IG5ldyBEYXRlKHREYXRlKTtcclxuICAgICAgZW5kRGF0ZS5zZXREYXRlKGVuZERhdGUuZ2V0RGF0ZSgpICsgcmVjb3JkLndpdGhkcmF3YWxEYXlzKTtcclxuXHJcbiAgICAgIGlmIChub3cgPCBlbmREYXRlKSB7XHJcbiAgICAgICAgaXNTYWZlID0gZmFsc2U7XHJcbiAgICAgICAgYWN0aXZlV2l0aGRyYXdhbCA9IHtcclxuICAgICAgICAgIGRydWc6IHJlY29yZC5kcnVnTmFtZSxcclxuICAgICAgICAgIGVuZHNBdDogZW5kRGF0ZS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7IFxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLmpzb24oe1xyXG4gICAgICBhbmltYWxJZCxcclxuICAgICAgc3RhdHVzOiBpc1NhZmUgPyBcIlNBRkVcIiA6IFwiV0lUSERSQVdBTF9BQ1RJVkVcIixcclxuICAgICAgYWN0aXZlV2l0aGRyYXdhbCxcclxuICAgICAgaGlzdG9yeUNvdW50OiByZWNvcmRzLmxlbmd0aCxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW11XSBTdGF0dXMgZXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZ2V0IHN0YXR1c1wiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRMZWRnZXI6IFJlcXVlc3RIYW5kbGVyID0gKF9yZXEsIHJlcykgPT4ge1xyXG4gIGNvbnN0IGlzVmFsaWQgPSBsZWRnZXIuaXNDaGFpblZhbGlkKCk7XHJcbiAgcmVzLmpzb24oe1xyXG4gICAgaXNWYWxpZCxcclxuICAgIGNoYWluTGVuZ3RoOiBsZWRnZXIuY2hhaW4ubGVuZ3RoLFxyXG4gICAgYmxvY2tzOiBsZWRnZXIuY2hhaW4sXHJcbiAgfSk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBnZXRXaXRoZHJhd2FsRW5kRGF0ZShzdGFydERhdGU6IHN0cmluZywgZGF5czogbnVtYmVyKTogc3RyaW5nIHtcclxuICBjb25zdCBkYXRlID0gbmV3IERhdGUoc3RhcnREYXRlKTtcclxuICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBkYXlzKTtcclxuICByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcYWxlcnRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9yb3V0ZXMvYWxlcnRzLnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xuaW1wb3J0IHsgU3lzdGVtQWxlcnQgfSBmcm9tIFwiLi4vZGJcIjtcblxuZXhwb3J0IGNvbnN0IGdldEFjdGl2ZUFsZXJ0czogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhbGVydHMgPSBhd2FpdCBTeXN0ZW1BbGVydC5maW5kKHsgYWN0aXZlOiB0cnVlIH0pO1xuICAgIHJlcy5qc29uKGFsZXJ0cyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiW2FsZXJ0c10gRXJyb3IgZmV0Y2hpbmcgYWxlcnRzOlwiLCBlKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCBhbGVydHNcIiB9KTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUFsZXJ0OiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgdHlwZSB9ID0gcmVxLmJvZHk7XG4gICAgXG4gICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJNZXNzYWdlIGlzIHJlcXVpcmVkXCIgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxlcnQgPSBhd2FpdCBTeXN0ZW1BbGVydC5jcmVhdGUoe1xuICAgICAgbWVzc2FnZSxcbiAgICAgIHR5cGU6IHR5cGUgfHwgJ2luZm8nLFxuICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgZXhwaXJlc0F0OiBuZXcgRGF0ZShEYXRlLm5vdygpICsgMjQgKiA2MCAqIDYwICogMTAwMCkgLy8gRGVmYXVsdCAyNGggZXhwaXJhdGlvblxuICAgIH0pO1xuXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oYWxlcnQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlthbGVydHNdIEVycm9yIGNyZWF0aW5nIGFsZXJ0OlwiLCBlKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBjcmVhdGUgYWxlcnRcIiB9KTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGRlbGV0ZUFsZXJ0OiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICB0cnkge1xuICAgIGlmIChTeXN0ZW1BbGVydC5kZWxldGVPbmUpIHtcbiAgICAgIGF3YWl0IFN5c3RlbUFsZXJ0LmRlbGV0ZU9uZSh7IF9pZDogaWQgfSk7XG4gICAgfSBlbHNlIGlmIChTeXN0ZW1BbGVydC5pdGVtcykge1xuICAgICAgU3lzdGVtQWxlcnQuaXRlbXMgPSBTeXN0ZW1BbGVydC5pdGVtcy5maWx0ZXIoKGE6IGFueSkgPT4gU3RyaW5nKGEuX2lkKSAhPT0gU3RyaW5nKGlkKSk7XG4gICAgfVxuICAgIHJlcy5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJbYWxlcnRzXSBFcnJvciBkZWxldGluZzpcIiwgZSk7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZGVsZXRlIGFsZXJ0XCIgfSk7XG4gIH1cbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxpbmRleC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvaW5kZXgudHNcIjtpbXBvcnQgXCJkb3RlbnYvY29uZmlnXCI7XHJcbmltcG9ydCBleHByZXNzIGZyb20gXCJleHByZXNzXCI7XHJcbmltcG9ydCBjb3JzIGZyb20gXCJjb3JzXCI7XHJcbmltcG9ydCB7IGhhbmRsZURlbW8gfSBmcm9tIFwiLi9yb3V0ZXMvZGVtb1wiO1xyXG5pbXBvcnQgeyBjb25uZWN0REIgfSBmcm9tIFwiLi9kYlwiO1xyXG5pbXBvcnQgeyBjcmVhdGVGYXJtZXIsIGdldEZhcm1lciwgZ2V0QWxsRmFybWVycywgZGVsZXRlRmFybWVyLCB1cGRhdGVGYXJtZXJTdGF0dXMgfSBmcm9tIFwiLi9yb3V0ZXMvZmFybWVyc1wiO1xyXG5pbXBvcnQgeyBGYXJtZXIgfSBmcm9tIFwiLi9kYlwiO1xyXG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xyXG5pbXBvcnQgeyBnZXRXZWF0aGVyIH0gZnJvbSBcIi4vcm91dGVzL3dlYXRoZXJcIjtcclxuaW1wb3J0IHsgY3JlYXRlQWR2aXNvcnksIHN1Ym1pdEZlZWRiYWNrIH0gZnJvbSBcIi4vcm91dGVzL2Fkdmlzb3J5XCI7XHJcbmltcG9ydCB7IGdldE1hcmtldFByaWNlcyB9IGZyb20gXCIuL3JvdXRlcy9tYXJrZXRcIjtcclxuaW1wb3J0IHsgY2hhdEhhbmRsZXIgfSBmcm9tIFwiLi9yb3V0ZXMvY2hhdFwiO1xyXG5pbXBvcnQgeyBwcmVkaWN0SGFuZGxlciwgdXBsb2FkTWlkZGxld2FyZSB9IGZyb20gXCIuL3JvdXRlcy9wcmVkaWN0XCI7XHJcbmltcG9ydCB7IHVwc2VydEZhcm1lciwgZ3Vlc3RMb2dpbiwgcmVnaXN0ZXIsIGxvZ2luLCBnZXREZWJ1Z1VzZXJzLCBkZWxldGVEZWJ1Z1VzZXIgfSBmcm9tIFwiLi9yb3V0ZXMvYXV0aFwiO1xyXG5pbXBvcnQge1xyXG4gIHNhdmVBZHZpc29yeUhpc3RvcnksXHJcbiAgZ2V0QWR2aXNvcnlIaXN0b3J5LFxyXG4gIGdldFByb2ZpbGVEYXRhLFxyXG4gIHVwZGF0ZVN1YnNjcmlwdGlvbixcclxufSBmcm9tIFwiLi9yb3V0ZXMvcHJvZmlsZVwiO1xyXG5pbXBvcnQge1xyXG4gIHJlY29yZEFuYWx5dGljcyxcclxuICBnZXRBbmFseXRpY3NTdW1tYXJ5LFxyXG4gIGdldENyb3BUcmVuZHMsXHJcbiAgZ2V0U29pbEhlYWx0aFRyZW5kLFxyXG4gIGdldFdlYXRoZXJJbXBhY3RBbmFseXNpcyxcclxuICBnZXRTeXN0ZW1PdmVydmlldyxcclxufSBmcm9tIFwiLi9yb3V0ZXMvYW5hbHl0aWNzXCI7XHJcbmltcG9ydCB7IGdldFBvc3RCeUlkIH0gZnJvbSBcIi4vcm91dGVzL25lb25cIjtcclxuaW1wb3J0IHsgbG9nVHJlYXRtZW50LCBnZXRBbmltYWxTdGF0dXMsIGdldExlZGdlciB9IGZyb20gXCIuL3JvdXRlcy9hbXVcIjtcclxuaW1wb3J0IHsgZ2V0QWN0aXZlQWxlcnRzLCBjcmVhdGVBbGVydCwgZGVsZXRlQWxlcnQgfSBmcm9tIFwiLi9yb3V0ZXMvYWxlcnRzXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2VydmVyKCkge1xyXG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcclxuXHJcbiAgLy8gTWlkZGxld2FyZVxyXG4gIGFwcC51c2UoY29ycygpKTtcclxuICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcclxuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKTtcclxuXHJcbiAgLy8gREI6IGVuc3VyZSB0aGUgY29ubmVjdGlvbiBpcyByZWFkeSBiZWZvcmUgaGFuZGxpbmcgZG9tYWluIHJvdXRlc1xyXG4gIGNvbnN0IGRiUmVhZHkgPSBjb25uZWN0REIoKTtcclxuICBcclxuICBkYlJlYWR5LnRoZW4oYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gU2VlZCBwZXJtYW5lbnQgYWRtaW4gaWYgbm90IGV4aXN0c1xyXG4gICAgICBjb25zdCBhZG1pbkVtYWlsID0gXCJhZG1pbi5hZ3JpQGFncml2ZXJzZS5pblwiO1xyXG4gICAgICBjb25zdCBleGlzdGluZ0FkbWluID0gYXdhaXQgRmFybWVyLmZpbmRPbmUoeyBlbWFpbDogYWRtaW5FbWFpbCB9KTtcclxuICAgICAgaWYgKCFleGlzdGluZ0FkbWluKSB7XHJcbiAgICAgICAgY29uc3QgaGFzaGVkUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaChcIkFkbWluQDIwMjdcIiwgMTApO1xyXG4gICAgICAgIGF3YWl0IEZhcm1lci5jcmVhdGUoe1xyXG4gICAgICAgICAgbmFtZTogXCJTeXN0ZW0gQWRtaW5cIixcclxuICAgICAgICAgIGVtYWlsOiBhZG1pbkVtYWlsLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6IGhhc2hlZFBhc3N3b3JkLFxyXG4gICAgICAgICAgcGhvbmU6IFwiMDAwMDAwMDAwMFwiLFxyXG4gICAgICAgICAgc29pbFR5cGU6IFwiTm9uZVwiLFxyXG4gICAgICAgICAgbGFuZFNpemU6IDAsXHJcbiAgICAgICAgICBsb2NhdGlvbjogXCJIZWFkcXVhcnRlcnNcIixcclxuICAgICAgICAgIHJvbGU6IFwiYWRtaW5cIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiW2RiXSBTZWVkZWQgcGVybWFuZW50IGFkbWluIGFjY291bnQ6IFwiICsgYWRtaW5FbWFpbCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiW2RiXSBFcnJvciBzZWVkaW5nIGFkbWluOlwiLCBlcnIpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBhcHAudXNlKGFzeW5jIChfcmVxLCBfcmVzLCBuZXh0KSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBkYlJlYWR5O1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIElmIGNvbm5lY3Rpb24gZmFpbHMsIGNvbnRpbnVlOyBpbi1tZW1vcnkgbW9kZSB3aWxsIHN0aWxsIHdvcmtcclxuICAgIH1cclxuICAgIG5leHQoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gRXhhbXBsZSBBUEkgcm91dGVzXHJcbiAgYXBwLmdldChcIi9hcGkvcGluZ1wiLCAoX3JlcSwgcmVzKSA9PiB7XHJcbiAgICBjb25zdCBwaW5nID0gcHJvY2Vzcy5lbnYuUElOR19NRVNTQUdFID8/IFwicGluZ1wiO1xyXG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiBwaW5nIH0pO1xyXG4gIH0pO1xyXG5cclxuICBhcHAuZ2V0KFwiL2FwaS9kZW1vXCIsIGhhbmRsZURlbW8pO1xyXG5cclxuICAvLyBEb21haW4gcm91dGVzXHJcbiAgYXBwLnBvc3QoXCIvYXBpL2Zhcm1lcnNcIiwgY3JlYXRlRmFybWVyKTtcclxuICBhcHAuZ2V0KFwiL2FwaS9mYXJtZXJzXCIsIGdldEFsbEZhcm1lcnMpOyAvLyBORVdcclxuICBhcHAuZ2V0KFwiL2FwaS9mYXJtZXJzLzppZFwiLCBnZXRGYXJtZXIpO1xyXG4gIGFwcC5kZWxldGUoXCIvYXBpL2Zhcm1lcnMvOmlkXCIsIGRlbGV0ZUZhcm1lcik7XHJcbiAgYXBwLnBhdGNoKFwiL2FwaS9mYXJtZXJzLzppZC9zdGF0dXNcIiwgdXBkYXRlRmFybWVyU3RhdHVzKTtcclxuICBhcHAuZ2V0KFwiL2FwaS93ZWF0aGVyXCIsIGdldFdlYXRoZXIpO1xyXG4gIGFwcC5wb3N0KFwiL2FwaS9hZHZpc29yaWVzXCIsIGNyZWF0ZUFkdmlzb3J5KTtcclxuICBhcHAuZ2V0KFwiL2FwaS9tYXJrZXRcIiwgZ2V0TWFya2V0UHJpY2VzKTtcclxuICBhcHAucG9zdChcIi9hcGkvY2hhdFwiLCBjaGF0SGFuZGxlcik7XHJcbiAgYXBwLnBvc3QoXCIvYXBpL3ByZWRpY3RcIiwgdXBsb2FkTWlkZGxld2FyZSwgcHJlZGljdEhhbmRsZXIpO1xyXG4gIFxyXG4gIC8vIEFsZXJ0c1xyXG4gIGFwcC5nZXQoXCIvYXBpL2FsZXJ0c1wiLCBnZXRBY3RpdmVBbGVydHMpO1xyXG4gIGFwcC5wb3N0KFwiL2FwaS9hbGVydHNcIiwgY3JlYXRlQWxlcnQpO1xyXG4gIGFwcC5kZWxldGUoXCIvYXBpL2FsZXJ0cy86aWRcIiwgZGVsZXRlQWxlcnQpO1xyXG4gIFxyXG4gIC8vIEF1dGggcm91dGVzXHJcbiAgYXBwLnBvc3QoXCIvYXBpL2F1dGgvcmVnaXN0ZXJcIiwgcmVnaXN0ZXIpO1xyXG4gIGFwcC5wb3N0KFwiL2FwaS9hdXRoL2xvZ2luXCIsIGxvZ2luKTtcclxuICBhcHAucG9zdChcIi9hcGkvYXV0aC9mYXJtZXJcIiwgdXBzZXJ0RmFybWVyKTsgLy8gbGVnYWN5XHJcbiAgYXBwLnBvc3QoXCIvYXBpL2F1dGgvZ3Vlc3RcIiwgZ3Vlc3RMb2dpbik7XHJcbiAgYXBwLmdldChcIi9hcGkvZGVidWcvdXNlcnNcIiwgZ2V0RGVidWdVc2Vycyk7XHJcbiAgYXBwLmRlbGV0ZShcIi9hcGkvZGVidWcvdXNlcnMvOmlkXCIsIGRlbGV0ZURlYnVnVXNlcik7XHJcblxyXG4gIC8vIEFNVSAvIEJsb2NrY2hhaW4gUm91dGVzXHJcbiAgYXBwLnBvc3QoXCIvYXBpL2FtdS9sb2dcIiwgbG9nVHJlYXRtZW50KTtcclxuICBhcHAuZ2V0KFwiL2FwaS9hbXUvc3RhdHVzLzphbmltYWxJZFwiLCBnZXRBbmltYWxTdGF0dXMpO1xyXG4gIGFwcC5nZXQoXCIvYXBpL2FtdS9sZWRnZXJcIiwgZ2V0TGVkZ2VyKTtcclxuXHJcbiAgYXBwLnBvc3QoXCIvYXBpL2Fkdmlzb3J5L2hpc3RvcnlcIiwgc2F2ZUFkdmlzb3J5SGlzdG9yeSk7XHJcbiAgYXBwLmdldChcIi9hcGkvYWR2aXNvcnkvaGlzdG9yeS86ZmFybWVySWRcIiwgZ2V0QWR2aXNvcnlIaXN0b3J5KTtcclxuICBhcHAucGF0Y2goXCIvYXBpL2Fkdmlzb3J5L2hpc3RvcnkvOmlkL2ZlZWRiYWNrXCIsIHN1Ym1pdEZlZWRiYWNrKTtcclxuICBcclxuICBhcHAuZ2V0KFwiL2FwaS9wcm9maWxlLzpmYXJtZXJJZFwiLCBnZXRQcm9maWxlRGF0YSk7XHJcbiAgYXBwLnB1dChcIi9hcGkvcHJvZmlsZS86ZmFybWVySWQvc3Vic2NyaXB0aW9uXCIsIHVwZGF0ZVN1YnNjcmlwdGlvbik7XHJcblxyXG4gIGFwcC5wb3N0KFwiL2FwaS9hbmFseXRpY3MvcmVjb3JkXCIsIHJlY29yZEFuYWx5dGljcyk7XHJcbiAgYXBwLmdldChcIi9hcGkvYW5hbHl0aWNzL3N1bW1hcnkvOmZhcm1lcklkXCIsIGdldEFuYWx5dGljc1N1bW1hcnkpO1xyXG4gIGFwcC5nZXQoXCIvYXBpL2FuYWx5dGljcy9jcm9wLXRyZW5kcy86ZmFybWVySWRcIiwgZ2V0Q3JvcFRyZW5kcyk7XHJcbiAgYXBwLmdldChcIi9hcGkvYW5hbHl0aWNzL3NvaWwtaGVhbHRoLzpmYXJtZXJJZFwiLCBnZXRTb2lsSGVhbHRoVHJlbmQpO1xyXG4gIGFwcC5nZXQoXCIvYXBpL2FuYWx5dGljcy93ZWF0aGVyLWltcGFjdC86ZmFybWVySWRcIiwgZ2V0V2VhdGhlckltcGFjdEFuYWx5c2lzKTtcclxuICBhcHAuZ2V0KFwiL2FwaS9hbmFseXRpY3Mvc3lzdGVtXCIsIGdldFN5c3RlbU92ZXJ2aWV3KTtcclxuXHJcbiAgLy8gTmVvbiBleGFtcGxlIChyZXF1aXJlcyBORVRMSUZZX0RBVEFCQVNFX1VSTCBvbiBOZXRsaWZ5KVxyXG4gIGFwcC5nZXQoXCIvYXBpL25lb24vcG9zdHMvOmlkXCIsIGdldFBvc3RCeUlkKTtcclxuXHJcbiAgcmV0dXJuIGFwcDtcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcblxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIC8vIEFsbG93IG92ZXJyaWRpbmcgcG9ydCB2aWEgUE9SVCBlbnYgdmFyICh1c2VmdWwgd2hlbiA4MDgwIGlzIGluIHVzZSlcclxuICAgIHBvcnQ6IE51bWJlcihwcm9jZXNzLmVudi5QT1JUKSB8fCA4MDgwLFxyXG4gICAgLy8gQWxsb3cgc2VydmluZyBmaWxlcyBmcm9tIHByb2plY3Qgcm9vdCAoaW5kZXguaHRtbCkgYXMgd2VsbCBhcyBjbGllbnQvc2hhcmVkXHJcbiAgICBmczoge1xyXG4gICAgICBhbGxvdzogW1wiLi9cIiwgXCIuL2NsaWVudFwiLCBcIi4vc2hhcmVkXCJdLFxyXG4gICAgICBkZW55OiBbXCIuZW52XCIsIFwiLmVudi4qXCIsIFwiKi57Y3J0LHBlbX1cIiwgXCIqKi8uZ2l0LyoqXCIsIFwic2VydmVyLyoqXCJdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6IFwiZGlzdC9zcGFcIixcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBleHByZXNzUGx1Z2luKCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcclxuICAgICAgaW5jbHVkZUFzc2V0czogW1wiZmF2aWNvbi5pY29cIiwgXCJpY29uLnN2Z1wiXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiBcIkFncmlWZXJzZSAtIFNtYXJ0IEZhcm1pbmdcIixcclxuICAgICAgICBzaG9ydF9uYW1lOiBcIkFncmlWZXJzZVwiLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkFJLXBvd2VyZWQgc3VzdGFpbmFibGUgZmFybWluZyBhc3Npc3RhbnRcIixcclxuICAgICAgICB0aGVtZV9jb2xvcjogXCIjMTZhMzRhXCIsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiBcImljb24uc3ZnXCIsXHJcbiAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcclxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiaWNvbi5zdmdcIixcclxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9jbGllbnRcIiksXHJcbiAgICAgIFwiQHNoYXJlZFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc2hhcmVkXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcblxyXG5mdW5jdGlvbiBleHByZXNzUGx1Z2luKCk6IFBsdWdpbiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6IFwiZXhwcmVzcy1wbHVnaW5cIixcclxuICAgIGFwcGx5OiBcInNlcnZlXCIsIC8vIE9ubHkgYXBwbHkgZHVyaW5nIGRldmVsb3BtZW50IChzZXJ2ZSBtb2RlKVxyXG4gICAgYXN5bmMgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xyXG4gICAgICBjb25zdCB7IGNyZWF0ZVNlcnZlciB9ID0gYXdhaXQgaW1wb3J0KFwiLi9zZXJ2ZXJcIik7XHJcbiAgICAgIGNvbnN0IGFwcCA9IGNyZWF0ZVNlcnZlcigpO1xyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFwcCk7XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBQSxJQUdhO0FBSGI7QUFBQTtBQUdPLElBQU0sYUFBNkIsQ0FBQyxNQUFNLFFBQVE7QUFDdkQsWUFBTSxXQUF5QjtBQUFBLFFBQzdCLFNBQVM7QUFBQSxNQUNYO0FBQ0EsVUFBSSxPQUFPLEdBQUcsRUFB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
