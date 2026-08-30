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
var USE_MEMORY, InMemoryCollection, _connected, farmerSchema, advisorySchema, advisoryHistorySchema, analyticsDataSchema, _inMemFarmer, _inMemAdvisory, _inMemAdvisoryHistory, _inMemAnalyticsData, _inMemDrugLog, _inMemSystemAlert, _inMemBlock, _inMemConsultation, _inMemVetAdvisory, _inMemAppointment, _mongoFarmer, _mongoAdvisory, _mongoAdvisoryHistory, _mongoAnalyticsData, drugLogSchema, _mongoDrugLog, systemAlertSchema, _mongoSystemAlert, blockSchema, _mongoBlock, consultationSchema, _mongoConsultation, vetAdvisorySchema, _mongoVetAdvisory, appointmentSchema, _mongoAppointment, Farmer, Advisory, AdvisoryHistory, AnalyticsData, DrugLog, SystemAlert, Block, Consultation, VetAdvisory, Appointment;
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
    _inMemConsultation = new InMemoryCollection("Consultation");
    _inMemVetAdvisory = new InMemoryCollection("VetAdvisory");
    _inMemAppointment = new InMemoryCollection("Appointment");
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
    consultationSchema = new mongoose.Schema(
      {
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
        vetId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
        animalId: { type: String },
        disease: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        vetNote: { type: String }
      },
      { timestamps: true }
    );
    _mongoConsultation = USE_MEMORY ? null : mongoose.models.Consultation || mongoose.model("Consultation", consultationSchema);
    vetAdvisorySchema = new mongoose.Schema(
      {
        vetId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
        title: { type: String, required: true },
        body: { type: String, required: true },
        crop: { type: String },
        targetRole: { type: String, enum: ["all", "farmer"], default: "all" }
      },
      { timestamps: true }
    );
    _mongoVetAdvisory = USE_MEMORY ? null : mongoose.models.VetAdvisory || mongoose.model("VetAdvisory", vetAdvisorySchema);
    appointmentSchema = new mongoose.Schema(
      {
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
        vetId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
        animalId: { type: String },
        reason: { type: String, required: true },
        scheduledAt: { type: Date, required: true },
        status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
        vetNote: { type: String }
      },
      { timestamps: true }
    );
    _mongoAppointment = USE_MEMORY ? null : mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
    Farmer = makeProxy(_mongoFarmer, _inMemFarmer);
    Advisory = makeProxy(_mongoAdvisory, _inMemAdvisory);
    AdvisoryHistory = makeProxy(_mongoAdvisoryHistory, _inMemAdvisoryHistory);
    AnalyticsData = makeProxy(_mongoAnalyticsData, _inMemAnalyticsData);
    DrugLog = makeProxy(_mongoDrugLog, _inMemDrugLog);
    SystemAlert = makeProxy(_mongoSystemAlert, _inMemSystemAlert);
    Block = makeProxy(_mongoBlock, _inMemBlock);
    Consultation = makeProxy(_mongoConsultation, _inMemConsultation);
    VetAdvisory = makeProxy(_mongoVetAdvisory, _inMemVetAdvisory);
    Appointment = makeProxy(_mongoAppointment, _inMemAppointment);
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

// server/routes/predict.ts
import multer from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/multer/index.js";
function getSoilInfo(name) {
  const lower = name.toLowerCase();
  if (lower.includes("rice") || lower.includes("paddy")) {
    return {
      type: "Clay / Loam",
      ph: "5.5 - 6.5",
      moisture: "High (Flooded)",
      temperature: "20-35\xB0C",
      notes: "Rice requires standing water during early growth stages. Ensure good water retention."
    };
  }
  if (lower.includes("corn") || lower.includes("maize")) {
    return {
      type: "Loamy / Sandy Loam",
      ph: "5.8 - 7.0",
      moisture: "Moderate",
      temperature: "18-27\xB0C",
      notes: "Corn needs well-drained soil rich in organic matter. Avoid waterlogging."
    };
  }
  if (lower.includes("potato")) {
    return {
      type: "Sandy Loam",
      ph: "4.8 - 5.5",
      moisture: "Consistent",
      temperature: "15-20\xB0C",
      notes: "Potatoes prefer loose soil for tuber development. Monitor moisture to prevent rot."
    };
  }
  return {
    type: "Loamy (Generic)",
    ph: "6.0 - 7.0",
    moisture: "Moderate",
    temperature: "20-25\xB0C",
    notes: "General best conditions for most crops. Test soil for specific needs."
  };
}
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
      const data = await res.json();
      const analysis = data.analysis || {};
      const predictions = [
        { className: `Status: ${analysis.status || "Unknown"}`, probability: 1 },
        { className: `Type: ${analysis.disease || "General"}`, probability: 1 },
        { className: `Details: ${analysis.recommendation || "No details"}`, probability: 1 }
      ];
      return {
        source: "local-ai-service",
        predictions,
        analysis: data.analysis
      };
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
    upload = multer();
    uploadMiddleware = upload.single("image");
    predictHandler = async (req, res) => {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "file required" });
      let predictions = [];
      let source = "server-mock";
      const localResult = await runLocalAIService(file);
      if (localResult && localResult.predictions) {
        source = localResult.source;
        predictions = localResult.predictions;
      } else if (localResult && localResult.analysis) {
        source = "local-ai-service";
        if (localResult.analysis.disease) {
          predictions = [{
            className: localResult.analysis.disease,
            probability: localResult.analysis.confidence
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

// server/middleware/auth.ts
import jwt from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/jsonwebtoken/index.js";
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
var JWT_SECRET, JWT_EXPIRES;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    JWT_SECRET = process.env.JWT_SECRET || "agriverse-secret-change-in-production";
    JWT_EXPIRES = "7d";
  }
});

// server/routes/auth.ts
import bcrypt from "file:///D:/PD17/GitHub_Projects/Smart-Crop-Tools/node_modules/bcryptjs/index.js";
var register, login, upsertFarmer, guestLogin, getDebugUsers, deleteDebugUser;
var init_auth2 = __esm({
  "server/routes/auth.ts"() {
    init_db();
    init_auth();
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
        const plain = newFarmer.toObject ? newFarmer.toObject() : { ...newFarmer };
        const { password: _, ...userWithoutPassword } = plain;
        const token = signToken({ id: String(plain._id), role: plain.role || "farmer", name: plain.name });
        res.status(201).json({ user: userWithoutPassword, token });
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
        const plain = farmer.toObject ? farmer.toObject() : { ...farmer };
        const { password: _, ...userWithoutPassword } = plain;
        const token = signToken({ id: String(plain._id), role: plain.role || "farmer", name: plain.name });
        res.json({ user: userWithoutPassword, token });
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
        const data = await Farmer.findOneAndUpdate({ phone }, updateData, { new: true, upsert: true });
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
          isGuest: true,
          role: "farmer"
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
        const safe = users.map((u) => {
          const obj = u.toObject ? u.toObject() : { ...u };
          delete obj.password;
          return obj;
        });
        res.json(safe);
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
    init_auth2();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic2VydmVyL3JvdXRlcy9kZW1vLnRzIiwgInNlcnZlci9kYi50cyIsICJzZXJ2ZXIvcm91dGVzL2Zhcm1lcnMudHMiLCAic2VydmVyL3V0aWxzL2NhY2hlLnRzIiwgInNlcnZlci91dGlscy9odHRwLnRzIiwgInNlcnZlci9yb3V0ZXMvd2VhdGhlci50cyIsICJzZXJ2ZXIvcm91dGVzL2Fkdmlzb3J5LnRzIiwgInNlcnZlci9yb3V0ZXMvbWFya2V0LnRzIiwgInNlcnZlci9yb3V0ZXMvY2hhdC50cyIsICJzZXJ2ZXIvcm91dGVzL3ByZWRpY3QudHMiLCAic2VydmVyL21pZGRsZXdhcmUvYXV0aC50cyIsICJzZXJ2ZXIvcm91dGVzL2F1dGgudHMiLCAic2VydmVyL3JvdXRlcy9wcm9maWxlLnRzIiwgInNlcnZlci9yb3V0ZXMvYW5hbHl0aWNzLnRzIiwgInNlcnZlci9yb3V0ZXMvbmVvbi50cyIsICJzZXJ2ZXIvbGliL2xlZGdlci50cyIsICJzZXJ2ZXIvcm91dGVzL2FtdS50cyIsICJzZXJ2ZXIvcm91dGVzL2FsZXJ0cy50cyIsICJzZXJ2ZXIvaW5kZXgudHMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1xcXFxkZW1vLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9yb3V0ZXMvZGVtby50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IHsgRGVtb1Jlc3BvbnNlIH0gZnJvbSBcIi4uLy4uL3NoYXJlZC9hcGlcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVEZW1vOiBSZXF1ZXN0SGFuZGxlciA9IChfcmVxLCByZXMpID0+IHtcclxuICBjb25zdCByZXNwb25zZTogRGVtb1Jlc3BvbnNlID0ge1xyXG4gICAgbWVzc2FnZTogXCJIZWxsbyBmcm9tIEV4cHJlc3Mgc2VydmVyXCIsXHJcbiAgfTtcclxuICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZSk7XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXGRiLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9kYi50c1wiO2ltcG9ydCBcImRvdGVudi9jb25maWdcIjtcclxuaW1wb3J0IG1vbmdvb3NlIGZyb20gXCJtb25nb29zZVwiO1xyXG5cclxuLy8gRGlzYWJsZSBidWZmZXJpbmc6IG9wZXJhdGlvbnMgZmFpbCBpbW1lZGlhdGVseSBpZiBub3QgY29ubmVjdGVkIChubyBpbmRlZmluaXRlIGhhbmcpXHJcbm1vbmdvb3NlLnNldChcImJ1ZmZlckNvbW1hbmRzXCIsIGZhbHNlKTtcclxuXHJcbmNvbnNvbGUubG9nKFwiW2RiXSBMb2FkaW5nIGRiLnRzLiBVUkk6XCIsIHByb2Nlc3MuZW52Lk1PTkdPREJfVVJJID8gXCJzZXRcIiA6IFwibm90IHNldFwiKTtcclxuY29uc3QgVVNFX01FTU9SWSA9ICFwcm9jZXNzLmVudi5NT05HT0RCX1VSSTtcclxuY29uc29sZS5sb2coXCJbZGJdIFVTRV9NRU1PUlk6XCIsIFVTRV9NRU1PUlkpO1xyXG5cclxudHlwZSBBbnlEb2MgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+ICYge1xyXG4gIF9pZD86IHN0cmluZztcclxuICBjcmVhdGVkQXQ/OiBEYXRlO1xyXG4gIHVwZGF0ZWRBdD86IERhdGU7XHJcbn07XHJcblxyXG5jbGFzcyBJbk1lbW9yeUNvbGxlY3Rpb248VCBleHRlbmRzIEFueURvYz4ge1xyXG4gIHByaXZhdGUgaXRlbXM6IFRbXSA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbmFtZTogc3RyaW5nKSB7IH1cclxuXHJcbiAgcHJpdmF0ZSBnZW5JZCgpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTApXHJcbiAgICApLnRvTG93ZXJDYXNlKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjcmVhdGUoZG9jOiBQYXJ0aWFsPFQ+KTogUHJvbWlzZTxUPiB7XHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY29uc3Qgb3V0ID0ge1xyXG4gICAgICAuLi4oZG9jIGFzIFQpLFxyXG4gICAgICBfaWQ6IHRoaXMuZ2VuSWQoKSxcclxuICAgICAgY3JlYXRlZEF0OiBub3csXHJcbiAgICAgIHVwZGF0ZWRBdDogbm93LFxyXG4gICAgfSBhcyBUO1xyXG4gICAgdGhpcy5pdGVtcy5wdXNoKG91dCk7XHJcbiAgICByZXR1cm4gc3RydWN0dXJlZENsb25lKG91dCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmaW5kQnlJZChpZDogc3RyaW5nKTogUHJvbWlzZTxUIHwgbnVsbD4ge1xyXG4gICAgY29uc3QgZm91bmQgPSB0aGlzLml0ZW1zLmZpbmQoKGQpID0+IFN0cmluZyhkLl9pZCkgPT09IFN0cmluZyhpZCkpO1xyXG4gICAgcmV0dXJuIGZvdW5kID8gKHN0cnVjdHVyZWRDbG9uZShmb3VuZCkgYXMgVCkgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY291bnREb2N1bWVudHMoZmlsdGVyOiBQYXJ0aWFsPFQ+ID0ge30pOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgY29uc3QgZmlsdGVyZWQgPSB0aGlzLml0ZW1zLmZpbHRlcigoZCkgPT5cclxuICAgICAgT2JqZWN0LmVudHJpZXMoZmlsdGVyKS5ldmVyeSgoW2ssIHZdKSA9PiAoZCBhcyBhbnkpW2tdID09PSB2KVxyXG4gICAgKTtcclxuICAgIHJldHVybiBmaWx0ZXJlZC5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBmaW5kKGZpbHRlcjogUGFydGlhbDxUPik6IGFueSB7XHJcbiAgICBjb25zdCBmaWx0ZXJlZCA9IHRoaXMuaXRlbXNcclxuICAgICAgLmZpbHRlcigoZCkgPT5cclxuICAgICAgICBPYmplY3QuZW50cmllcyhmaWx0ZXIpLmV2ZXJ5KChbaywgdl0pID0+IChkIGFzIGFueSlba10gPT09IHYpLFxyXG4gICAgICApXHJcbiAgICAgIC5tYXAoKGQpID0+IHN0cnVjdHVyZWRDbG9uZShkKSBhcyBUKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpdGVtczogZmlsdGVyZWQsXHJcbiAgICAgIHNvcnQoY3JpdGVyaWE6IFJlY29yZDxzdHJpbmcsIDEgfCAtMT4pIHtcclxuICAgICAgICBjb25zdCBba2V5LCBvcmRlcl0gPSBPYmplY3QuZW50cmllcyhjcml0ZXJpYSlbMF07XHJcbiAgICAgICAgdGhpcy5pdGVtcy5zb3J0KChhOiBhbnksIGI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgaWYgKGFba2V5XSA8IGJba2V5XSkgcmV0dXJuIG9yZGVyID09PSAxID8gLTEgOiAxO1xyXG4gICAgICAgICAgaWYgKGFba2V5XSA+IGJba2V5XSkgcmV0dXJuIG9yZGVyID09PSAxID8gMSA6IC0xO1xyXG4gICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbWl0KG46IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKDAsIG4pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9LFxyXG4gICAgICB0aGVuKHJlc29sdmU6ICh2YWx1ZTogVFtdKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgcmVzb2x2ZSh0aGlzLml0ZW1zKTtcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBhc3luYyBmaW5kT25lQW5kVXBkYXRlKFxyXG4gICAgZmlsdGVyOiBQYXJ0aWFsPFQ+LFxyXG4gICAgdXBkYXRlOiBhbnksXHJcbiAgICBvcHRpb25zOiB7IG5ldz86IGJvb2xlYW47IHVwc2VydD86IGJvb2xlYW4gfSA9IHt9LFxyXG4gICk6IFByb21pc2U8VCB8IG51bGw+IHtcclxuICAgIGNvbnN0IG1hdGNoID0gdGhpcy5pdGVtcy5maW5kKChkKSA9PlxyXG4gICAgICBPYmplY3QuZW50cmllcyhmaWx0ZXIpLmV2ZXJ5KChbaywgdl0pID0+IChkIGFzIGFueSlba10gPT09IHYpLFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY29uc3QgYXBwbHlVcGRhdGUgPSAoYmFzZTogVCkgPT4ge1xyXG4gICAgICBjb25zdCBjbG9uZSA9IHsgLi4uYmFzZSB9IGFzIFQ7XHJcbiAgICAgIGNvbnN0IHBsYWluID0gT2JqZWN0LmZyb21FbnRyaWVzKFxyXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHVwZGF0ZSkuZmlsdGVyKChba10pID0+IGsgIT09IFwiJHNldE9uSW5zZXJ0XCIpLFxyXG4gICAgICApO1xyXG4gICAgICBPYmplY3QuYXNzaWduKGNsb25lLCBwbGFpbik7XHJcbiAgICAgIGNsb25lLnVwZGF0ZWRBdCA9IG5vdztcclxuICAgICAgcmV0dXJuIGNsb25lO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgY29uc3QgdXBkYXRlZCA9IGFwcGx5VXBkYXRlKG1hdGNoKTtcclxuICAgICAgY29uc3QgaWR4ID0gdGhpcy5pdGVtcy5pbmRleE9mKG1hdGNoKTtcclxuICAgICAgdGhpcy5pdGVtc1tpZHhdID0gdXBkYXRlZDtcclxuICAgICAgcmV0dXJuIHN0cnVjdHVyZWRDbG9uZSh1cGRhdGVkKSBhcyBUO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zLnVwc2VydCkge1xyXG4gICAgICBjb25zdCBwbGFpbiA9IE9iamVjdC5mcm9tRW50cmllcyhcclxuICAgICAgICBPYmplY3QuZW50cmllcyh1cGRhdGUgfHwge30pLmZpbHRlcigoW2tdKSA9PiBrICE9PSBcIiRzZXRPbkluc2VydFwiKSxcclxuICAgICAgKTtcclxuICAgICAgY29uc3QgYmFzZTogVCA9IHtcclxuICAgICAgICAuLi4odXBkYXRlPy4kc2V0T25JbnNlcnQgfHwge30pLFxyXG4gICAgICAgIC4uLnBsYWluLFxyXG4gICAgICB9IGFzIFQ7XHJcblxyXG4gICAgICBjb25zdCBvdXQgPSB7XHJcbiAgICAgICAgLi4uYmFzZSxcclxuICAgICAgICBfaWQ6IHRoaXMuZ2VuSWQoKSxcclxuICAgICAgICBjcmVhdGVkQXQ6IChiYXNlIGFzIGFueSkuY3JlYXRlZEF0IHx8IG5vdyxcclxuICAgICAgICB1cGRhdGVkQXQ6IG5vdyxcclxuICAgICAgfSBhcyBUO1xyXG4gICAgICB0aGlzLml0ZW1zLnB1c2gob3V0KTtcclxuICAgICAgcmV0dXJuIHN0cnVjdHVyZWRDbG9uZShvdXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBhc3luYyBmaW5kT25lKGZpbHRlcjogUGFydGlhbDxUPik6IFByb21pc2U8VCB8IG51bGw+IHtcclxuICAgIGNvbnN0IGZvdW5kID0gdGhpcy5pdGVtcy5maW5kKChkKSA9PlxyXG4gICAgICBPYmplY3QuZW50cmllcyhmaWx0ZXIpLmV2ZXJ5KChbaywgdl0pID0+IChkIGFzIGFueSlba10gPT09IHYpLFxyXG4gICAgKTtcclxuICAgIHJldHVybiBmb3VuZCA/IChzdHJ1Y3R1cmVkQ2xvbmUoZm91bmQpIGFzIFQpIDogbnVsbDtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZpbmRCeUlkQW5kRGVsZXRlKGlkOiBzdHJpbmcpOiBQcm9taXNlPFQgfCBudWxsPiB7XHJcbiAgICBjb25zdCBpZHggPSB0aGlzLml0ZW1zLmZpbmRJbmRleCgoZCkgPT4gU3RyaW5nKGQuX2lkKSA9PT0gU3RyaW5nKGlkKSk7XHJcbiAgICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuIG51bGw7XHJcbiAgICBjb25zdCBbZGVsZXRlZF0gPSB0aGlzLml0ZW1zLnNwbGljZShpZHgsIDEpO1xyXG4gICAgcmV0dXJuIHN0cnVjdHVyZWRDbG9uZShkZWxldGVkKSBhcyBUO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZGVsZXRlT25lKGZpbHRlcjogUGFydGlhbDxUPik6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgY29uc3QgaWR4ID0gdGhpcy5pdGVtcy5maW5kSW5kZXgoKGQpID0+XHJcbiAgICAgIE9iamVjdC5lbnRyaWVzKGZpbHRlcikuZXZlcnkoKFtrLCB2XSkgPT4gKGQgYXMgYW55KVtrXSA9PT0gdiksXHJcbiAgICApO1xyXG4gICAgaWYgKGlkeCA9PT0gLTEpIHJldHVybiBmYWxzZTtcclxuICAgIHRoaXMuaXRlbXMuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmxldCBfY29ubmVjdGVkID0gZmFsc2U7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29ubmVjdERCKHVyaT86IHN0cmluZykge1xyXG4gIGNvbnN0IG1vbmdvVXJpID0gdXJpIHx8IHByb2Nlc3MuZW52Lk1PTkdPREJfVVJJO1xyXG4gIGlmICghbW9uZ29VcmkpIHtcclxuICAgIGNvbnNvbGUud2FybihcIltkYl0gTU9OR09EQl9VUkkgbm90IHNldC4gVXNpbmcgaW4tbWVtb3J5IHN0b3JhZ2UuXCIpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGlmIChtb25nb29zZS5jb25uZWN0aW9uLnJlYWR5U3RhdGUgPT09IDEpIHJldHVybiBtb25nb29zZS5jb25uZWN0aW9uO1xyXG5cclxuICAvLyBUcnkgb25jZSBxdWlja2x5IHNvIHdlIGRvbid0IGJsb2NrIHNlcnZlciBzdGFydHVwXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IG1vbmdvb3NlLmNvbm5lY3QobW9uZ29VcmksIHsgc2VydmVyU2VsZWN0aW9uVGltZW91dE1TOiA1MDAwIH0pO1xyXG4gICAgX2Nvbm5lY3RlZCA9IHRydWU7XHJcbiAgICBjb25zb2xlLmxvZyhcIltkYl0gQ29ubmVjdGVkIHRvIE1vbmdvREIgQXRsYXMgXHUyNzEzXCIpO1xyXG4gICAgcmV0dXJuIG1vbmdvb3NlLmNvbm5lY3Rpb247XHJcbiAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgIGNvbnNvbGUud2FybihcIltkYl0gSW5pdGlhbCBNb25nb0RCIGNvbm5lY3Rpb24gZmFpbGVkOlwiLCBlcnIubWVzc2FnZSk7XHJcbiAgICBjb25zb2xlLndhcm4oXCJbZGJdIFNlcnZlciB3aWxsIHN0YXJ0IGluIGluLW1lbW9yeSBtb2RlLiBSZXRyeWluZyBpbiBiYWNrZ3JvdW5kLi4uXCIpO1xyXG4gICAgLy8gUmV0cnkgaW4gYmFja2dyb3VuZCB3aXRob3V0IGJsb2NraW5nIHRoZSBzZXJ2ZXJcclxuICAgIHJldHJ5SW5CYWNrZ3JvdW5kKG1vbmdvVXJpKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmV0cnlJbkJhY2tncm91bmQobW9uZ29Vcmk6IHN0cmluZykge1xyXG4gIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKG1vbmdvb3NlLmNvbm5lY3Rpb24ucmVhZHlTdGF0ZSA9PT0gMSkgcmV0dXJuO1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgbW9uZ29vc2UuY29ubmVjdChtb25nb1VyaSwgeyBzZXJ2ZXJTZWxlY3Rpb25UaW1lb3V0TVM6IDgwMDAgfSk7XHJcbiAgICAgIF9jb25uZWN0ZWQgPSB0cnVlO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIltkYl0gQmFja2dyb3VuZCByZWNvbm5lY3QgdG8gTW9uZ29EQiBBdGxhcyBzdWNjZWVkZWQgXHUyNzEzXCIpO1xyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwiW2RiXSBCYWNrZ3JvdW5kIHJlY29ubmVjdCBmYWlsZWQsIHJldHJ5aW5nIGluIDMwcy4uLlwiLCBlcnIubWVzc2FnZSk7XHJcbiAgICAgIHJldHJ5SW5CYWNrZ3JvdW5kKG1vbmdvVXJpKTtcclxuICAgIH1cclxuICB9LCAzMDAwMCk7XHJcbn1cclxuXHJcblxyXG5jb25zdCBmYXJtZXJTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxyXG4gIHtcclxuICAgIG5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgZW1haWw6IHsgdHlwZTogU3RyaW5nLCB1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZSB9LFxyXG4gICAgcGFzc3dvcmQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgICBwaG9uZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIHNvaWxUeXBlOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgbGFuZFNpemU6IHsgdHlwZTogTnVtYmVyIH0sXHJcbiAgICBsYW5ndWFnZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIGxvY2F0aW9uOiB7XHJcbiAgICAgIGxhdDogTnVtYmVyLFxyXG4gICAgICBsb246IE51bWJlcixcclxuICAgICAgdmlsbGFnZTogU3RyaW5nLFxyXG4gICAgICBzdGF0ZTogU3RyaW5nLFxyXG4gICAgfSxcclxuICAgIHJvbGU6IHtcclxuICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICBlbnVtOiBbXCJmYXJtZXJcIiwgXCJ2ZXRcIiwgXCJhZG1pblwiXSxcclxuICAgICAgZGVmYXVsdDogXCJmYXJtZXJcIixcclxuICAgIH0sXHJcbiAgICBzdWJzY3JpcHRpb25TdGF0dXM6IHtcclxuICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICBkZWZhdWx0OiBcImZyZWVcIixcclxuICAgICAgZW51bTogW1wiZnJlZVwiLCBcInByZW1pdW1cIl0sXHJcbiAgICB9LFxyXG4gICAgc3Vic2NyaXB0aW9uU3RhcnREYXRlOiB7IHR5cGU6IERhdGUgfSxcclxuICAgIHN1YnNjcmlwdGlvbkVuZERhdGU6IHsgdHlwZTogRGF0ZSB9LFxyXG4gIH0sXHJcbiAgeyB0aW1lc3RhbXBzOiB0cnVlIH0sXHJcbik7XHJcblxyXG5jb25zdCBhZHZpc29yeVNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoXHJcbiAge1xyXG4gICAgZmFybWVySWQ6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLCByZWY6IFwiRmFybWVyXCIgfSxcclxuICAgIGNyb3A6IFN0cmluZyxcclxuICAgIHN1bW1hcnk6IFN0cmluZyxcclxuICAgIGZlcnRpbGl6ZXI6IFN0cmluZyxcclxuICAgIGlycmlnYXRpb246IFN0cmluZyxcclxuICAgIHBlc3Q6IFN0cmluZyxcclxuICAgIHdlYXRoZXI6IE9iamVjdCxcclxuICAgIGNvbmZpZGVuY2VTY29yZTogTnVtYmVyLFxyXG4gICAgY29zdEJlbmVmaXQ6IFN0cmluZyxcclxuICAgIGZhY3RvcnM6IFtTdHJpbmddLFxyXG4gICAgcmlza0FsZXJ0czogW1N0cmluZ10sXHJcbiAgICBmYXJtZXJGZWVkYmFjazogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsncG9zaXRpdmUnLCAnbmVnYXRpdmUnXSwgZGVmYXVsdDogbnVsbCB9XHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuXHJcbmNvbnN0IGFkdmlzb3J5SGlzdG9yeVNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoXHJcbiAge1xyXG4gICAgZmFybWVySWQ6IHtcclxuICAgICAgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLFxyXG4gICAgICByZWY6IFwiRmFybWVyXCIsXHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIGNyb3A6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgYWR2aXNvcnk6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgd2VhdGhlckRhdGE6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5NaXhlZCxcclxuICAgIHNvaWxEYXRhOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuTWl4ZWQsXHJcbiAgICBjb25maWRlbmNlU2NvcmU6IE51bWJlcixcclxuICAgIGNvc3RCZW5lZml0OiBTdHJpbmcsXHJcbiAgICBmYWN0b3JzOiBbU3RyaW5nXSxcclxuICAgIHJpc2tBbGVydHM6IFtTdHJpbmddLFxyXG4gICAgZmFybWVyRmVlZGJhY2s6IHsgdHlwZTogU3RyaW5nLCBlbnVtOiBbJ3Bvc2l0aXZlJywgJ25lZ2F0aXZlJ10sIGRlZmF1bHQ6IG51bGwgfVxyXG4gIH0sXHJcbiAgeyB0aW1lc3RhbXBzOiB0cnVlIH0sXHJcbik7XHJcblxyXG5jb25zdCBhbmFseXRpY3NEYXRhU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcclxuICB7XHJcbiAgICBmYXJtZXJJZDoge1xyXG4gICAgICB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuT2JqZWN0SWQsXHJcbiAgICAgIHJlZjogXCJGYXJtZXJcIixcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgY3JvcDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBkYXRlOiB7IHR5cGU6IERhdGUsIGRlZmF1bHQ6IERhdGUubm93IH0sXHJcbiAgICBjcm9wSGVhbHRoU2NvcmU6IHsgdHlwZTogTnVtYmVyLCBtaW46IDAsIG1heDogMTAwIH0sXHJcbiAgICB5aWVsZDogeyB0eXBlOiBOdW1iZXIgfSxcclxuICAgIHNvaWxNb2lzdHVyZTogeyB0eXBlOiBOdW1iZXIsIG1pbjogMCwgbWF4OiAxMDAgfSxcclxuICAgIHNvaWxOaXRyb2dlbjogeyB0eXBlOiBOdW1iZXIsIG1pbjogMCwgbWF4OiAxMDAgfSxcclxuICAgIHNvaWxQSDogeyB0eXBlOiBOdW1iZXIsIG1pbjogMCwgbWF4OiAxNCB9LFxyXG4gICAgdGVtcGVyYXR1cmU6IHsgdHlwZTogTnVtYmVyIH0sXHJcbiAgICBodW1pZGl0eTogeyB0eXBlOiBOdW1iZXIsIG1pbjogMCwgbWF4OiAxMDAgfSxcclxuICAgIHJhaW5mYWxsOiB7IHR5cGU6IE51bWJlciB9LFxyXG4gICAgcGVzdFByZXNzdXJlOiB7IHR5cGU6IE51bWJlciwgbWluOiAwLCBtYXg6IDEwMCB9LFxyXG4gICAgZGlzZWFzZVJpc2s6IHsgdHlwZTogTnVtYmVyLCBtaW46IDAsIG1heDogMTAwIH0sXHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuXHJcbi8vIC0tLSBJbi1tZW1vcnkgZmFsbGJhY2sgaW5zdGFuY2VzIChhbHdheXMgY3JlYXRlZCBhcyBiYWNrdXApIC0tLVxyXG5jb25zdCBfaW5NZW1GYXJtZXIgPSBuZXcgSW5NZW1vcnlDb2xsZWN0aW9uPGFueT4oXCJGYXJtZXJcIik7XHJcbmNvbnN0IF9pbk1lbUFkdmlzb3J5ID0gbmV3IEluTWVtb3J5Q29sbGVjdGlvbjxhbnk+KFwiQWR2aXNvcnlcIik7XHJcbmNvbnN0IF9pbk1lbUFkdmlzb3J5SGlzdG9yeSA9IG5ldyBJbk1lbW9yeUNvbGxlY3Rpb248YW55PihcIkFkdmlzb3J5SGlzdG9yeVwiKTtcclxuY29uc3QgX2luTWVtQW5hbHl0aWNzRGF0YSA9IG5ldyBJbk1lbW9yeUNvbGxlY3Rpb248YW55PihcIkFuYWx5dGljc0RhdGFcIik7XHJcbmNvbnN0IF9pbk1lbURydWdMb2cgPSBuZXcgSW5NZW1vcnlDb2xsZWN0aW9uPGFueT4oXCJEcnVnTG9nXCIpO1xyXG5jb25zdCBfaW5NZW1TeXN0ZW1BbGVydCA9IG5ldyBJbk1lbW9yeUNvbGxlY3Rpb248YW55PihcIlN5c3RlbUFsZXJ0XCIpO1xyXG5jb25zdCBfaW5NZW1CbG9jayA9IG5ldyBJbk1lbW9yeUNvbGxlY3Rpb248YW55PihcIkJsb2NrXCIpO1xyXG5jb25zdCBfaW5NZW1Db25zdWx0YXRpb24gPSBuZXcgSW5NZW1vcnlDb2xsZWN0aW9uPGFueT4oXCJDb25zdWx0YXRpb25cIik7XHJcbmNvbnN0IF9pbk1lbVZldEFkdmlzb3J5ID0gbmV3IEluTWVtb3J5Q29sbGVjdGlvbjxhbnk+KFwiVmV0QWR2aXNvcnlcIik7XHJcbmNvbnN0IF9pbk1lbUFwcG9pbnRtZW50ID0gbmV3IEluTWVtb3J5Q29sbGVjdGlvbjxhbnk+KFwiQXBwb2ludG1lbnRcIik7XHJcblxyXG4vLyAtLS0gTW9uZ29vc2UgbW9kZWxzIChvbmx5IGNyZWF0ZWQgd2hlbiBVUkkgaXMgc2V0KSAtLS1cclxuY29uc3QgX21vbmdvRmFybWVyID0gVVNFX01FTU9SWSA/IG51bGwgOiAobW9uZ29vc2UubW9kZWxzLkZhcm1lciB8fCBtb25nb29zZS5tb2RlbChcIkZhcm1lclwiLCBmYXJtZXJTY2hlbWEpKTtcclxuY29uc3QgX21vbmdvQWR2aXNvcnkgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuQWR2aXNvcnkgfHwgbW9uZ29vc2UubW9kZWwoXCJBZHZpc29yeVwiLCBhZHZpc29yeVNjaGVtYSkpO1xyXG5jb25zdCBfbW9uZ29BZHZpc29yeUhpc3RvcnkgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuQWR2aXNvcnlIaXN0b3J5IHx8IG1vbmdvb3NlLm1vZGVsKFwiQWR2aXNvcnlIaXN0b3J5XCIsIGFkdmlzb3J5SGlzdG9yeVNjaGVtYSkpO1xyXG5jb25zdCBfbW9uZ29BbmFseXRpY3NEYXRhID0gVVNFX01FTU9SWSA/IG51bGwgOiAobW9uZ29vc2UubW9kZWxzLkFuYWx5dGljc0RhdGEgfHwgbW9uZ29vc2UubW9kZWwoXCJBbmFseXRpY3NEYXRhXCIsIGFuYWx5dGljc0RhdGFTY2hlbWEpKTtcclxuXHJcbmNvbnN0IGRydWdMb2dTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxyXG4gIHtcclxuICAgIGFuaW1hbElkOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGRydWdOYW1lOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGRvc2FnZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICB3aXRoZHJhd2FsRGF5czogeyB0eXBlOiBOdW1iZXIsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBhcHBsaWNhdG9yOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogXCJGYXJtZXJcIiB9LFxyXG4gICAgdHJlYXRtZW50RGF0ZTogeyB0eXBlOiBEYXRlLCBkZWZhdWx0OiBEYXRlLm5vdyB9LFxyXG4gIH0sXHJcbiAgeyB0aW1lc3RhbXBzOiB0cnVlIH0sXHJcbik7XHJcbmNvbnN0IF9tb25nb0RydWdMb2cgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuRHJ1Z0xvZyB8fCBtb25nb29zZS5tb2RlbChcIkRydWdMb2dcIiwgZHJ1Z0xvZ1NjaGVtYSkpO1xyXG5cclxuY29uc3Qgc3lzdGVtQWxlcnRTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxyXG4gIHtcclxuICAgIG1lc3NhZ2U6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgdHlwZTogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsnaW5mbycsICd3YXJuaW5nJywgJ2NyaXRpY2FsJ10sIGRlZmF1bHQ6ICdpbmZvJyB9LFxyXG4gICAgYWN0aXZlOiB7IHR5cGU6IEJvb2xlYW4sIGRlZmF1bHQ6IHRydWUgfSxcclxuICAgIGV4cGlyZXNBdDogeyB0eXBlOiBEYXRlIH1cclxuICB9LFxyXG4gIHsgdGltZXN0YW1wczogdHJ1ZSB9XHJcbik7XHJcbmNvbnN0IF9tb25nb1N5c3RlbUFsZXJ0ID0gVVNFX01FTU9SWSA/IG51bGwgOiAobW9uZ29vc2UubW9kZWxzLlN5c3RlbUFsZXJ0IHx8IG1vbmdvb3NlLm1vZGVsKFwiU3lzdGVtQWxlcnRcIiwgc3lzdGVtQWxlcnRTY2hlbWEpKTtcclxuXHJcbmNvbnN0IGJsb2NrU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcclxuICB7XHJcbiAgICBpbmRleDogeyB0eXBlOiBOdW1iZXIsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICB0aW1lc3RhbXA6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgZGF0YTogeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuTWl4ZWQsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBwcmV2aW91c0hhc2g6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgaGFzaDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuY29uc3QgX21vbmdvQmxvY2sgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuQmxvY2sgfHwgbW9uZ29vc2UubW9kZWwoXCJCbG9ja1wiLCBibG9ja1NjaGVtYSkpO1xyXG5cclxuY29uc3QgY29uc3VsdGF0aW9uU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcclxuICB7XHJcbiAgICBmYXJtZXJJZDogeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuT2JqZWN0SWQsIHJlZjogXCJGYXJtZXJcIiwgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIHZldElkOiB7IHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCwgcmVmOiBcIkZhcm1lclwiIH0sXHJcbiAgICBhbmltYWxJZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIGRpc2Vhc2U6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgbWVzc2FnZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBzdGF0dXM6IHsgdHlwZTogU3RyaW5nLCBlbnVtOiBbXCJwZW5kaW5nXCIsIFwiYXBwcm92ZWRcIiwgXCJyZWplY3RlZFwiXSwgZGVmYXVsdDogXCJwZW5kaW5nXCIgfSxcclxuICAgIHZldE5vdGU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuY29uc3QgX21vbmdvQ29uc3VsdGF0aW9uID0gVVNFX01FTU9SWSA/IG51bGwgOiAobW9uZ29vc2UubW9kZWxzLkNvbnN1bHRhdGlvbiB8fCBtb25nb29zZS5tb2RlbChcIkNvbnN1bHRhdGlvblwiLCBjb25zdWx0YXRpb25TY2hlbWEpKTtcclxuXHJcbmNvbnN0IHZldEFkdmlzb3J5U2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcclxuICB7XHJcbiAgICB2ZXRJZDogeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuT2JqZWN0SWQsIHJlZjogXCJGYXJtZXJcIiwgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGZhcm1lcklkOiB7IHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCwgcmVmOiBcIkZhcm1lclwiIH0sXHJcbiAgICB0aXRsZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBib2R5OiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGNyb3A6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgICB0YXJnZXRSb2xlOiB7IHR5cGU6IFN0cmluZywgZW51bTogW1wiYWxsXCIsIFwiZmFybWVyXCJdLCBkZWZhdWx0OiBcImFsbFwiIH0sXHJcbiAgfSxcclxuICB7IHRpbWVzdGFtcHM6IHRydWUgfSxcclxuKTtcclxuY29uc3QgX21vbmdvVmV0QWR2aXNvcnkgPSBVU0VfTUVNT1JZID8gbnVsbCA6IChtb25nb29zZS5tb2RlbHMuVmV0QWR2aXNvcnkgfHwgbW9uZ29vc2UubW9kZWwoXCJWZXRBZHZpc29yeVwiLCB2ZXRBZHZpc29yeVNjaGVtYSkpO1xyXG5cclxuY29uc3QgYXBwb2ludG1lbnRTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxyXG4gIHtcclxuICAgIGZhcm1lcklkOiB7IHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCwgcmVmOiBcIkZhcm1lclwiLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgdmV0SWQ6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLCByZWY6IFwiRmFybWVyXCIgfSxcclxuICAgIGFuaW1hbElkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgcmVhc29uOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIHNjaGVkdWxlZEF0OiB7IHR5cGU6IERhdGUsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBzdGF0dXM6IHsgdHlwZTogU3RyaW5nLCBlbnVtOiBbXCJwZW5kaW5nXCIsIFwiY29uZmlybWVkXCIsIFwiY29tcGxldGVkXCIsIFwiY2FuY2VsbGVkXCJdLCBkZWZhdWx0OiBcInBlbmRpbmdcIiB9LFxyXG4gICAgdmV0Tm90ZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICB9LFxyXG4gIHsgdGltZXN0YW1wczogdHJ1ZSB9LFxyXG4pO1xyXG5jb25zdCBfbW9uZ29BcHBvaW50bWVudCA9IFVTRV9NRU1PUlkgPyBudWxsIDogKG1vbmdvb3NlLm1vZGVscy5BcHBvaW50bWVudCB8fCBtb25nb29zZS5tb2RlbChcIkFwcG9pbnRtZW50XCIsIGFwcG9pbnRtZW50U2NoZW1hKSk7XHJcblxyXG4vLyBIZWxwZXI6IHJldHVybnMgdHJ1ZSBpZiBNb25nb0RCIGlzIGFjdHVhbGx5IGNvbm5lY3RlZFxyXG5mdW5jdGlvbiBpc01vbmdvQ29ubmVjdGVkKCkge1xyXG4gIHJldHVybiBtb25nb29zZS5jb25uZWN0aW9uLnJlYWR5U3RhdGUgPT09IDE7XHJcbn1cclxuXHJcbi8vIFNtYXJ0IHByb3h5OiB1c2VzIE1vbmdvREIgd2hlbiBjb25uZWN0ZWQsIGZhbGxzIGJhY2sgdG8gaW4tbWVtb3J5IG90aGVyd2lzZVxyXG5mdW5jdGlvbiBtYWtlUHJveHkobW9uZ29Nb2RlbDogYW55LCBpbk1lbU1vZGVsOiBhbnkpOiBhbnkge1xyXG4gIHJldHVybiBuZXcgUHJveHkoe30sIHtcclxuICAgIGdldChfdGFyZ2V0LCBwcm9wKSB7XHJcbiAgICAgIGNvbnN0IG1vZGVsID0gKCFVU0VfTUVNT1JZICYmIGlzTW9uZ29Db25uZWN0ZWQoKSAmJiBtb25nb01vZGVsKSA/IG1vbmdvTW9kZWwgOiBpbk1lbU1vZGVsO1xyXG4gICAgICBjb25zdCB2YWwgPSBtb2RlbFtwcm9wIGFzIHN0cmluZ107XHJcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsID09PSBcImZ1bmN0aW9uXCIgPyB2YWwuYmluZChtb2RlbCkgOiB2YWw7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBGYXJtZXI6IGFueSA9IG1ha2VQcm94eShfbW9uZ29GYXJtZXIsIF9pbk1lbUZhcm1lcik7XHJcbmV4cG9ydCBjb25zdCBBZHZpc29yeTogYW55ID0gbWFrZVByb3h5KF9tb25nb0Fkdmlzb3J5LCBfaW5NZW1BZHZpc29yeSk7XHJcbmV4cG9ydCBjb25zdCBBZHZpc29yeUhpc3Rvcnk6IGFueSA9IG1ha2VQcm94eShfbW9uZ29BZHZpc29yeUhpc3RvcnksIF9pbk1lbUFkdmlzb3J5SGlzdG9yeSk7XHJcbmV4cG9ydCBjb25zdCBBbmFseXRpY3NEYXRhOiBhbnkgPSBtYWtlUHJveHkoX21vbmdvQW5hbHl0aWNzRGF0YSwgX2luTWVtQW5hbHl0aWNzRGF0YSk7XHJcbmV4cG9ydCBjb25zdCBEcnVnTG9nOiBhbnkgPSBtYWtlUHJveHkoX21vbmdvRHJ1Z0xvZywgX2luTWVtRHJ1Z0xvZyk7XHJcbmV4cG9ydCBjb25zdCBTeXN0ZW1BbGVydDogYW55ID0gbWFrZVByb3h5KF9tb25nb1N5c3RlbUFsZXJ0LCBfaW5NZW1TeXN0ZW1BbGVydCk7XHJcbmV4cG9ydCBjb25zdCBCbG9jazogYW55ID0gbWFrZVByb3h5KF9tb25nb0Jsb2NrLCBfaW5NZW1CbG9jayk7XHJcbmV4cG9ydCBjb25zdCBDb25zdWx0YXRpb246IGFueSA9IG1ha2VQcm94eShfbW9uZ29Db25zdWx0YXRpb24sIF9pbk1lbUNvbnN1bHRhdGlvbik7XHJcbmV4cG9ydCBjb25zdCBWZXRBZHZpc29yeTogYW55ID0gbWFrZVByb3h5KF9tb25nb1ZldEFkdmlzb3J5LCBfaW5NZW1WZXRBZHZpc29yeSk7XHJcbmV4cG9ydCBjb25zdCBBcHBvaW50bWVudDogYW55ID0gbWFrZVByb3h5KF9tb25nb0FwcG9pbnRtZW50LCBfaW5NZW1BcHBvaW50bWVudCk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcZmFybWVycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL2Zhcm1lcnMudHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcbmltcG9ydCB7IEZhcm1lciB9IGZyb20gXCIuLi9kYlwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZUZhcm1lcjogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEZhcm1lci5jcmVhdGUocmVxLmJvZHkpO1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oZGF0YSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIltmYXJtZXJzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIkludmFsaWQgZmFybWVyIGRhdGFcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0RmFybWVyOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBGYXJtZXIuZmluZEJ5SWQoaWQpO1xyXG5cclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJGYXJtZXIgbm90IGZvdW5kXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLmpzb24oZGF0YSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIltmYXJtZXJzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIkludmFsaWQgaWRcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0QWxsRmFybWVyczogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEZhcm1lci5maW5kKHt9KTtcclxuICAgIHJlcy5qc29uKGRhdGEpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbZmFybWVyc10gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZmV0Y2ggZmFybWVyc1wiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWxldGVGYXJtZXI6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcclxuICB0cnkge1xyXG4gICAgLy8gTm90ZTogSW5NZW1vcnlDb2xsZWN0aW9uIG5lZWRzIGEgZGVsZXRlIG1ldGhvZCwgb3Igd2UgaGFuZGxlIGl0IGdyYWNlZnVsbHkgaWYgbWlzc2luZ1xyXG4gICAgaWYgKEZhcm1lci5kZWxldGVPbmUpIHtcclxuICAgICAgYXdhaXQgRmFybWVyLmRlbGV0ZU9uZSh7IF9pZDogaWQgfSk7XHJcbiAgICB9IGVsc2UgaWYgKEZhcm1lci5pdGVtcykge1xyXG4gICAgICAvLyBJbi1tZW1vcnkgaGFjayBmb3Igbm93XHJcbiAgICAgIEZhcm1lci5pdGVtcyA9IEZhcm1lci5pdGVtcy5maWx0ZXIoKGY6IGFueSkgPT4gU3RyaW5nKGYuX2lkKSAhPT0gU3RyaW5nKGlkKSk7XHJcbiAgICB9XHJcbiAgICByZXMuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIltmYXJtZXJzXSBFcnJvciBkZWxldGluZzpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBkZWxldGUgZmFybWVyXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVwZGF0ZUZhcm1lclN0YXR1czogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG4gIGNvbnN0IHsgYWN0aW9uIH0gPSByZXEuYm9keTsgLy8gXCJzdXNwZW5kXCIsIFwiYWN0aXZhdGVcIiwgXCJwcmVtaXVtXCJcclxuICBcclxuICB0cnkge1xyXG4gICAgY29uc3QgZmFybWVyID0gYXdhaXQgRmFybWVyLmZpbmRCeUlkKGlkKTtcclxuICAgIGlmICghZmFybWVyKSByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJOb3QgZm91bmRcIiB9KTtcclxuICAgIFxyXG4gICAgbGV0IHVwZGF0ZTogYW55ID0ge307XHJcbiAgICBpZiAoYWN0aW9uID09PSBcInN1c3BlbmRcIikgdXBkYXRlID0geyByb2xlOiBcInN1c3BlbmRlZFwiIH07XHJcbiAgICBpZiAoYWN0aW9uID09PSBcImFjdGl2YXRlXCIpIHVwZGF0ZSA9IHsgcm9sZTogXCJmYXJtZXJcIiB9O1xyXG4gICAgaWYgKGFjdGlvbiA9PT0gXCJwcmVtaXVtXCIpIHtcclxuICAgICAgdXBkYXRlID0geyBcclxuICAgICAgICBzdWJzY3JpcHRpb25TdGF0dXM6IFwicHJlbWl1bVwiLCBcclxuICAgICAgICBzdWJzY3JpcHRpb25FbmREYXRlOiBuZXcgRGF0ZShEYXRlLm5vdygpICsgMzY1ICogMjQgKiA2MCAqIDYwICogMTAwMCkgXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgRmFybWVyLmZpbmRPbmVBbmRVcGRhdGUoeyBfaWQ6IGlkIH0sIHVwZGF0ZSk7XHJcbiAgICByZXMuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIltmYXJtZXJzXSBFcnJvciB1cGRhdGluZzpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byB1cGRhdGUgZmFybWVyXCIgfSk7XHJcbiAgfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFx1dGlsc1xcXFxjYWNoZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvdXRpbHMvY2FjaGUudHNcIjt0eXBlIEVudHJ5PFQ+ID0geyB2YWx1ZTogVDsgZXhwaXJlczogbnVtYmVyIH07XHJcbmNvbnN0IHN0b3JlID0gbmV3IE1hcDxzdHJpbmcsIEVudHJ5PGFueT4+KCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGU8VD4oa2V5OiBzdHJpbmcpOiBUIHwgbnVsbCB7XHJcbiAgY29uc3QgZSA9IHN0b3JlLmdldChrZXkpO1xyXG4gIGlmICghZSkgcmV0dXJuIG51bGw7XHJcbiAgaWYgKERhdGUubm93KCkgPiBlLmV4cGlyZXMpIHtcclxuICAgIHN0b3JlLmRlbGV0ZShrZXkpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHJldHVybiBlLnZhbHVlIGFzIFQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDYWNoZTxUPihrZXk6IHN0cmluZywgdmFsdWU6IFQsIHR0bE1zOiBudW1iZXIpIHtcclxuICBzdG9yZS5zZXQoa2V5LCB7IHZhbHVlLCBleHBpcmVzOiBEYXRlLm5vdygpICsgdHRsTXMgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYWtlS2V5KHBhcnRzOiAoc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbClbXSkge1xyXG4gIHJldHVybiBwYXJ0cy5tYXAoKHApID0+IFN0cmluZyhwID8/IFwiXCIpKS5qb2luKFwifFwiKTtcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFx1dGlsc1xcXFxodHRwLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci91dGlscy9odHRwLnRzXCI7ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aFRpbWVvdXQoXHJcbiAgdXJsOiBzdHJpbmcsXHJcbiAgaW5pdDogUmVxdWVzdEluaXQgPSB7fSxcclxuICB0aW1lb3V0TXMgPSA3MDAwLFxyXG4pIHtcclxuICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIHRpbWVvdXRNcyk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwgeyAuLi5pbml0LCBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9IGZpbmFsbHkge1xyXG4gICAgY2xlYXJUaW1lb3V0KGlkKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXRyeTxUPihcclxuICBmbjogKCkgPT4gUHJvbWlzZTxUPixcclxuICBhdHRlbXB0cyA9IDMsXHJcbiAgZGVsYXlNcyA9IDMwMCxcclxuKSB7XHJcbiAgbGV0IGxhc3RFcnI6IGFueSA9IG51bGw7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRlbXB0czsgaSsrKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgZm4oKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgbGFzdEVyciA9IGU7XHJcbiAgICAgIGlmIChpIDwgYXR0ZW1wdHMgLSAxKVxyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIGRlbGF5TXMgKiAoaSArIDEpKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHRocm93IGxhc3RFcnI7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1xcXFx3ZWF0aGVyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9yb3V0ZXMvd2VhdGhlci50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuXHJcbmltcG9ydCB7IGdldENhY2hlLCBzZXRDYWNoZSwgbWFrZUtleSB9IGZyb20gXCIuLi91dGlscy9jYWNoZVwiO1xyXG5pbXBvcnQgeyBmZXRjaFdpdGhUaW1lb3V0LCByZXRyeSB9IGZyb20gXCIuLi91dGlscy9odHRwXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0V2VhdGhlcjogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBsYXQsIGxvbiB9ID0gcmVxLnF1ZXJ5IGFzIHsgbGF0Pzogc3RyaW5nOyBsb24/OiBzdHJpbmcgfTtcclxuICAgIGlmICghbGF0IHx8ICFsb24pXHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcImxhdCBhbmQgbG9uIHJlcXVpcmVkXCIgfSk7XHJcblxyXG4gICAgLy8gQ2FjaGUgYnkgcm91bmRlZCBjb29yZHMgKFx1MjI0ODFrbSBncmFudWxhcml0eSkgZm9yIDEwIG1pbnV0ZXNcclxuICAgIGNvbnN0IGxhdFIgPSBNYXRoLnJvdW5kKE51bWJlcihsYXQpICogMTAwKSAvIDEwMDtcclxuICAgIGNvbnN0IGxvblIgPSBNYXRoLnJvdW5kKE51bWJlcihsb24pICogMTAwKSAvIDEwMDtcclxuICAgIGNvbnN0IGNhY2hlS2V5ID0gbWFrZUtleShbXCJ3ZWF0aGVyXCIsIGxhdFIsIGxvblJdKTtcclxuICAgIGNvbnN0IGNhY2hlZCA9IGdldENhY2hlPGFueT4oY2FjaGVLZXkpO1xyXG4gICAgaWYgKGNhY2hlZCkgcmV0dXJuIHJlcy5qc29uKHsgLi4uY2FjaGVkLCBjYWNoZWQ6IHRydWUgfSk7XHJcblxyXG4gICAgY29uc3Qga2V5ID0gcHJvY2Vzcy5lbnYuT1BFTldFQVRIRVJfQVBJX0tFWTtcclxuXHJcbiAgICBpZiAoa2V5KSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP2xhdD0ke2xhdFJ9Jmxvbj0ke2xvblJ9JmFwcGlkPSR7a2V5fSZ1bml0cz1tZXRyaWNgO1xyXG4gICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCByZXRyeSgoKSA9PiBmZXRjaFdpdGhUaW1lb3V0KHVybCwge30sIDcwMDApKTtcclxuICAgICAgICBpZiAocmVzcC5vaykge1xyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xyXG4gICAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgICAgICAgICAgdGVtcEM6IGRhdGEubWFpbj8udGVtcCxcclxuICAgICAgICAgICAgaHVtaWRpdHk6IGRhdGEubWFpbj8uaHVtaWRpdHksXHJcbiAgICAgICAgICAgIHdpbmRLcGg6IGRhdGEud2luZD8uc3BlZWQgPyBkYXRhLndpbmQuc3BlZWQgKiAzLjYgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGNvbmRpdGlvbnM6IGRhdGEud2VhdGhlcj8uWzBdPy5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgcmF3OiBkYXRhLFxyXG4gICAgICAgICAgICBzb3VyY2U6IFwib3BlbndlYXRoZXJcIixcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBzZXRDYWNoZShjYWNoZUtleSwgcGF5bG9hZCwgMTAgKiA2MCAqIDEwMDApO1xyXG4gICAgICAgICAgcmV0dXJuIHJlcy5qc29uKHBheWxvYWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7fVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEZhbGxiYWNrIHRvIE9wZW4tTWV0ZW8gKG5vIEFQSSBrZXkgcmVxdWlyZWQpXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBvbVVybCA9IGBodHRwczovL2FwaS5vcGVuLW1ldGVvLmNvbS92MS9mb3JlY2FzdD9sYXRpdHVkZT0ke2xhdFJ9JmxvbmdpdHVkZT0ke2xvblJ9JmN1cnJlbnQ9dGVtcGVyYXR1cmVfMm0scmVsYXRpdmVfaHVtaWRpdHlfMm0sd2luZF9zcGVlZF8xMG0sd2VhdGhlcl9jb2RlYDtcclxuICAgICAgY29uc3QgciA9IGF3YWl0IHJldHJ5KCgpID0+IGZldGNoV2l0aFRpbWVvdXQob21VcmwsIHt9LCA3MDAwKSk7XHJcbiAgICAgIGlmIChyLm9rKSB7XHJcbiAgICAgICAgY29uc3QgdyA9IGF3YWl0IHIuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IGN1ciA9IHcuY3VycmVudCB8fCB7fTtcclxuICAgICAgICBjb25zdCBjb2RlID0gY3VyLndlYXRoZXJfY29kZSBhcyBudW1iZXIgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB3ZWF0aGVyQ29kZVRvVGV4dChjb2RlKTtcclxuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICAgICAgdGVtcEM6IGN1ci50ZW1wZXJhdHVyZV8ybSxcclxuICAgICAgICAgIGh1bWlkaXR5OiBjdXIucmVsYXRpdmVfaHVtaWRpdHlfMm0sXHJcbiAgICAgICAgICB3aW5kS3BoOiBjdXIud2luZF9zcGVlZF8xMG0sXHJcbiAgICAgICAgICBjb25kaXRpb25zOiBkZXNjcmlwdGlvbixcclxuICAgICAgICAgIHJhdzogdyxcclxuICAgICAgICAgIHNvdXJjZTogXCJvcGVuLW1ldGVvXCIsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZXRDYWNoZShjYWNoZUtleSwgcGF5bG9hZCwgMTAgKiA2MCAqIDEwMDApO1xyXG4gICAgICAgIHJldHVybiByZXMuanNvbihwYXlsb2FkKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCB7fVxyXG5cclxuICAgIC8vIExhc3QtcmVzb3J0IGxvY2FsIHNhbXBsZSBzbyB0aGUgVUkgbmV2ZXIgc2hvd3MgNTAyXHJcbiAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICB0ZW1wQzogMjgsXHJcbiAgICAgIGh1bWlkaXR5OiA2NSxcclxuICAgICAgd2luZEtwaDogOCxcclxuICAgICAgY29uZGl0aW9uczogXCJQYXJ0bHkgY2xvdWR5XCIsXHJcbiAgICAgIHNvdXJjZTogXCJzYW1wbGVcIixcclxuICAgIH07XHJcbiAgICBzZXRDYWNoZShjYWNoZUtleSwgcGF5bG9hZCwgNSAqIDYwICogMTAwMCk7XHJcbiAgICByZXR1cm4gcmVzLmpzb24ocGF5bG9hZCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiSW50ZXJuYWwgZXJyb3JcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiB3ZWF0aGVyQ29kZVRvVGV4dChjb2RlPzogbnVtYmVyKSB7XHJcbiAgY29uc3QgbWFwOiBSZWNvcmQ8bnVtYmVyLCBzdHJpbmc+ID0ge1xyXG4gICAgMDogXCJDbGVhclwiLFxyXG4gICAgMTogXCJNYWlubHkgY2xlYXJcIixcclxuICAgIDI6IFwiUGFydGx5IGNsb3VkeVwiLFxyXG4gICAgMzogXCJPdmVyY2FzdFwiLFxyXG4gICAgNDU6IFwiRm9nXCIsXHJcbiAgICA0ODogXCJEZXBvc2l0aW5nIHJpbWUgZm9nXCIsXHJcbiAgICA1MTogXCJMaWdodCBkcml6emxlXCIsXHJcbiAgICA1MzogXCJEcml6emxlXCIsXHJcbiAgICA1NTogXCJEZW5zZSBkcml6emxlXCIsXHJcbiAgICA2MTogXCJTbGlnaHQgcmFpblwiLFxyXG4gICAgNjM6IFwiUmFpblwiLFxyXG4gICAgNjU6IFwiSGVhdnkgcmFpblwiLFxyXG4gICAgNzE6IFwiU2xpZ2h0IHNub3dcIixcclxuICAgIDczOiBcIlNub3dcIixcclxuICAgIDc1OiBcIkhlYXZ5IHNub3dcIixcclxuICAgIDgwOiBcIlJhaW4gc2hvd2Vyc1wiLFxyXG4gICAgODE6IFwiUmFpbiBzaG93ZXJzXCIsXHJcbiAgICA4MjogXCJWaW9sZW50IHJhaW4gc2hvd2Vyc1wiLFxyXG4gICAgOTU6IFwiVGh1bmRlcnN0b3JtXCIsXHJcbiAgICA5NjogXCJUaHVuZGVyc3Rvcm0gdy8gaGFpbFwiLFxyXG4gICAgOTk6IFwiVGh1bmRlcnN0b3JtIHcvIGhhaWxcIixcclxuICB9O1xyXG4gIHJldHVybiBjb2RlICE9IG51bGwgPyBtYXBbY29kZV0gfHwgXCJVbmtub3duXCIgOiB1bmRlZmluZWQ7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1xcXFxhZHZpc29yeS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL2Fkdmlzb3J5LnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBBZHZpc29yeSwgQWR2aXNvcnlIaXN0b3J5IH0gZnJvbSBcIi4uL2RiXCI7XHJcblxyXG5mdW5jdGlvbiBnZW5lcmF0ZUFkdmljZSh7XHJcbiAgdGVtcEMsXHJcbiAgaHVtaWRpdHksXHJcbiAgc29pbE1vaXN0dXJlLFxyXG4gIG5kdmlcclxufToge1xyXG4gIHRlbXBDPzogbnVtYmVyO1xyXG4gIGh1bWlkaXR5PzogbnVtYmVyO1xyXG4gIHNvaWxNb2lzdHVyZT86IG51bWJlcjtcclxuICBuZHZpPzogbnVtYmVyO1xyXG59KSB7XHJcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XHJcbiAgY29uc3QgZmFjdG9yczogc3RyaW5nW10gPSBbXTtcclxuICBjb25zdCByaXNrQWxlcnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIFxyXG4gIGlmICh0ZW1wQyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpZiAodGVtcEMgPCAxNSkge1xyXG4gICAgICBwYXJ0cy5wdXNoKFwiTG93IHRlbXBlcmF0dXJlOiBwcmVmZXIgd2hlYXQvbXVzdGFyZDsgcmVkdWNlIGlycmlnYXRpb24uXCIpO1xyXG4gICAgICBmYWN0b3JzLnB1c2goYFRlbXBlcmF0dXJlIGlzIGxvdyAoJHt0ZW1wQ31cdTAwQjBDKS5gKTtcclxuICAgICAgcmlza0FsZXJ0cy5wdXNoKFwiRnJvc3QgcmlzayBmb3Igc2Vuc2l0aXZlIGNyb3BzLlwiKTtcclxuICAgIH0gZWxzZSBpZiAodGVtcEMgPCAyOCkge1xyXG4gICAgICBwYXJ0cy5wdXNoKFwiTW9kZXJhdGUgdGVtcGVyYXR1cmU6IHBhZGR5L3ZlZ2V0YWJsZXMgc3VpdGFibGU7IHN0YW5kYXJkIGlycmlnYXRpb24gc2NoZWR1bGUuXCIpO1xyXG4gICAgICBmYWN0b3JzLnB1c2goYFRlbXBlcmF0dXJlIGlzIG9wdGltYWwgKCR7dGVtcEN9XHUwMEIwQykuYCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYXJ0cy5wdXNoKFwiSGlnaCB0ZW1wZXJhdHVyZTogc2VsZWN0IGRyb3VnaHRcdTIwMTF0b2xlcmFudCBjcm9wczsgaXJyaWdhdGUgaW4gZWFybHkgbW9ybmluZy9ldmVuaW5nLlwiKTtcclxuICAgICAgZmFjdG9ycy5wdXNoKGBUZW1wZXJhdHVyZSBpcyBoaWdoICgke3RlbXBDfVx1MDBCMEMpLmApO1xyXG4gICAgICByaXNrQWxlcnRzLnB1c2goXCJIZWF0IHN0cmVzcyByaXNrLlwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChodW1pZGl0eSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpZiAoaHVtaWRpdHkgPiA4MCkge1xyXG4gICAgICBwYXJ0cy5wdXNoKFwiSGlnaCBodW1pZGl0eTogbW9uaXRvciBmdW5nYWwgZGlzZWFzZXM7IHVzZSBwcmV2ZW50aXZlIGZ1bmdpY2lkZSB3aGVuIG5lZWRlZC5cIik7XHJcbiAgICAgIGZhY3RvcnMucHVzaChgSHVtaWRpdHkgaXMgaGlnaCAoJHtodW1pZGl0eX0lKS5gKTtcclxuICAgICAgcmlza0FsZXJ0cy5wdXNoKFwiRnVuZ2FsIGRpc2Vhc2Ugb3V0YnJlYWsgbGlrZWx5LlwiKTtcclxuICAgIH0gZWxzZSBpZiAoaHVtaWRpdHkgPCAzMCkge1xyXG4gICAgICBwYXJ0cy5wdXNoKFwiTG93IGh1bWlkaXR5OiBtdWxjaCB0byByZXRhaW4gc29pbCBtb2lzdHVyZS5cIik7XHJcbiAgICAgIGZhY3RvcnMucHVzaChgSHVtaWRpdHkgaXMgbG93ICgke2h1bWlkaXR5fSUpLmApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKHNvaWxNb2lzdHVyZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpZiAoc29pbE1vaXN0dXJlIDwgMzApIHtcclxuICAgICAgcGFydHMucHVzaChcIlNvaWwgaXMgZHJ5LiBJbW1lZGlhdGUgaXJyaWdhdGlvbiByZWNvbW1lbmRlZC5cIik7XHJcbiAgICAgIGZhY3RvcnMucHVzaChgU29pbCBtb2lzdHVyZSBpcyBjcml0aWNhbGx5IGxvdyAoJHtzb2lsTW9pc3R1cmV9JSkuYCk7XHJcbiAgICB9IGVsc2UgaWYgKHNvaWxNb2lzdHVyZSA+IDcwKSB7XHJcbiAgICAgIHBhcnRzLnB1c2goXCJTb2lsIGlzIHdhdGVybG9nZ2VkLiBQYXVzZSBpcnJpZ2F0aW9uLlwiKTtcclxuICAgICAgZmFjdG9ycy5wdXNoKGBTb2lsIG1vaXN0dXJlIGlzIGhpZ2ggKCR7c29pbE1vaXN0dXJlfSUpLmApO1xyXG4gICAgICByaXNrQWxlcnRzLnB1c2goXCJSb290IHJvdCByaXNrIGR1ZSB0byB3YXRlcmxvZ2dpbmcuXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZmFjdG9ycy5wdXNoKGBTb2lsIG1vaXN0dXJlIGlzIG9wdGltYWwgKCR7c29pbE1vaXN0dXJlfSUpLmApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKG5kdmkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKG5kdmkgPCAwLjMpIHtcclxuICAgICAgcGFydHMucHVzaChcIkNyb3AgaGVhbHRoIGlzIHBvb3IuIENvbnNpZGVyIHNvaWwgdGVzdGluZyBmb3IgbnV0cmllbnQgZGVmaWNpZW5jaWVzLlwiKTtcclxuICAgICAgZmFjdG9ycy5wdXNoKGBTYXRlbGxpdGUgTkRWSSBpcyBsb3cgKCR7bmR2aX0pLmApO1xyXG4gICAgfSBlbHNlIGlmIChuZHZpID4gMC42KSB7XHJcbiAgICAgIHBhcnRzLnB1c2goXCJDcm9wIGhlYWx0aCBpcyBleGNlbGxlbnQuXCIpO1xyXG4gICAgICBmYWN0b3JzLnB1c2goYFNhdGVsbGl0ZSBORFZJIGluZGljYXRlcyBoZWFsdGh5IGNhbm9weSAoJHtuZHZpfSkuYCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc3VtbWFyeTogcGFydHMuam9pbihcIiBcIikgfHwgXCJQcm92aWRlIGxvY2F0aW9uIHRvIGZldGNoIHdlYXRoZXIgZm9yIHBlcnNvbmFsaXplZCBhZHZpY2UuXCIsXHJcbiAgICBmYWN0b3JzLFxyXG4gICAgcmlza0FsZXJ0c1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVBZHZpc29yeTogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBmYXJtZXJJZCwgY3JvcCwgbGF0LCBsb24gfSA9IHJlcS5ib2R5IGFzIHtcclxuICAgICAgZmFybWVySWQ/OiBzdHJpbmc7XHJcbiAgICAgIGNyb3A/OiBzdHJpbmc7XHJcbiAgICAgIGxhdD86IG51bWJlcjtcclxuICAgICAgbG9uPzogbnVtYmVyO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgd2VhdGhlcjogYW55ID0gdW5kZWZpbmVkO1xyXG4gICAgaWYgKGxhdCAhPSBudWxsICYmIGxvbiAhPSBudWxsKSB7XHJcbiAgICAgIGNvbnN0IGtleSA9IHByb2Nlc3MuZW52Lk9QRU5XRUFUSEVSX0FQSV9LRVk7XHJcbiAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgICAgICBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/bGF0PSR7bGF0fSZsb249JHtsb259JmFwcGlkPSR7a2V5fSZ1bml0cz1tZXRyaWNgLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHJlc3Aub2spIHdlYXRoZXIgPSBhd2FpdCByZXNwLmpzb24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1vY2sgRGlnaXRhbCBUd2luIERhdGFcclxuICAgIGNvbnN0IG1vY2tTb2lsTW9pc3R1cmUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2MCkgKyAyMDsgLy8gMjAtODAlXHJcbiAgICBjb25zdCBtb2NrTkRWSSA9IHBhcnNlRmxvYXQoKE1hdGgucmFuZG9tKCkgKiAwLjggKyAwLjEpLnRvRml4ZWQoMikpOyAvLyAwLjEtMC45XHJcbiAgICBcclxuICAgIGNvbnN0IGFkdmljZSA9IGdlbmVyYXRlQWR2aWNlKHtcclxuICAgICAgdGVtcEM6IHdlYXRoZXI/Lm1haW4/LnRlbXAsXHJcbiAgICAgIGh1bWlkaXR5OiB3ZWF0aGVyPy5tYWluPy5odW1pZGl0eSxcclxuICAgICAgc29pbE1vaXN0dXJlOiBtb2NrU29pbE1vaXN0dXJlLFxyXG4gICAgICBuZHZpOiBtb2NrTkRWSVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGNvbnN0IHN1bW1hcnkgPSBhZHZpY2Uuc3VtbWFyeTtcclxuICAgIGNvbnN0IGZhY3RvcnMgPSBhZHZpY2UuZmFjdG9ycztcclxuICAgIGNvbnN0IHJpc2tBbGVydHMgPSBhZHZpY2Uucmlza0FsZXJ0cztcclxuXHJcbiAgICAvLyBDb25maWRlbmNlIGFuZCBDb3N0LUJlbmVmaXRcclxuICAgIGNvbnN0IGNvbmZpZGVuY2VTY29yZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDgwOyAvLyA4MC05OSVcclxuICAgIGNvbnN0IGlzUGFkZHkgPSBjcm9wPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKFwicGFkZHlcIik7XHJcbiAgICBcclxuICAgIGNvbnN0IGZlcnRpbGl6ZXIgPSBpc1BhZGR5XHJcbiAgICAgID8gXCJOUEsgMTA6MjY6MjYgYXQgc293aW5nOyB1cmVhIHNwbGl0IGRvc2VzIGF0IHRpbGxlcmluZy9QSS5cIlxyXG4gICAgICA6IFwiQmFsYW5jZWQgTlBLIGJhc2VkIG9uIHNvaWwgdGVzdDsgYXBwbHkgY29tcG9zdC9tYW51cmUgdG8gaW1wcm92ZSBvcmdhbmljIG1hdHRlci5cIjtcclxuICAgICAgXHJcbiAgICBjb25zdCBpcnJpZ2F0aW9uID1cclxuICAgICAgKHdlYXRoZXI/Lm1haW4/LnRlbXAgJiYgd2VhdGhlci5tYWluLnRlbXAgPiAzMCkgfHwgbW9ja1NvaWxNb2lzdHVyZSA8IDMwXHJcbiAgICAgICAgPyBcIklycmlnYXRlIDJcdTIwMTMzIHRpbWVzL3dlZWsgaW4gc2hvcnQgY3ljbGVzLlwiXHJcbiAgICAgICAgOiBcIklycmlnYXRlIHdlZWtseSBiYXNlZCBvbiBzb2lsIG1vaXN0dXJlLlwiO1xyXG4gICAgICAgIFxyXG4gICAgY29uc3QgcGVzdCA9IFwiU2NvdXQgd2Vla2x5OyB1c2UgcGhlcm9tb25lIHRyYXBzOyBwcmVmZXIgYmlvXHUyMDExY29udHJvbCB3aGVyZSBwb3NzaWJsZS5cIjtcclxuXHJcbiAgICBjb25zdCBjb3N0QmVuZWZpdCA9IGBFc3RpbWF0ZWQgUk9JOiArJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyA1fSUgeWllbGQgaW5jcmVhc2Ugd2l0aCByZWNvbW1lbmRlZCBwcmFjdGljZXMuYDtcclxuXHJcbiAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICBmYXJtZXJJZCxcclxuICAgICAgY3JvcDogY3JvcCB8fCBcIlVua25vd25cIixcclxuICAgICAgc3VtbWFyeSxcclxuICAgICAgZmVydGlsaXplcixcclxuICAgICAgaXJyaWdhdGlvbixcclxuICAgICAgcGVzdCxcclxuICAgICAgd2VhdGhlcixcclxuICAgICAgY29uZmlkZW5jZVNjb3JlLFxyXG4gICAgICBjb3N0QmVuZWZpdCxcclxuICAgICAgZmFjdG9ycyxcclxuICAgICAgcmlza0FsZXJ0c1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgQWR2aXNvcnkuY3JlYXRlKHBheWxvYWQpO1xyXG4gICAgXHJcbiAgICBpZiAoZmFybWVySWQpIHtcclxuICAgICAgIGF3YWl0IEFkdmlzb3J5SGlzdG9yeS5jcmVhdGUoe1xyXG4gICAgICAgICBmYXJtZXJJZCxcclxuICAgICAgICAgY3JvcDogY3JvcCB8fCBcIlVua25vd25cIixcclxuICAgICAgICAgYWR2aXNvcnk6IHN1bW1hcnksXHJcbiAgICAgICAgIHdlYXRoZXJEYXRhOiB3ZWF0aGVyLFxyXG4gICAgICAgICBjb25maWRlbmNlU2NvcmUsXHJcbiAgICAgICAgIGNvc3RCZW5lZml0LFxyXG4gICAgICAgICBmYWN0b3JzLFxyXG4gICAgICAgICByaXNrQWxlcnRzXHJcbiAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbihkYXRhKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2Fkdmlzb3J5XSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBjcmVhdGUgYWR2aXNvcnlcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3VibWl0RmVlZGJhY2s6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XHJcbiAgICBjb25zdCB7IGZlZWRiYWNrIH0gPSByZXEuYm9keTtcclxuICAgIFxyXG4gICAgaWYgKCFbJ3Bvc2l0aXZlJywgJ25lZ2F0aXZlJ10uaW5jbHVkZXMoZmVlZGJhY2spKSB7XHJcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiSW52YWxpZCBmZWVkYmFjayB2YWx1ZVwiIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIGl0J3MgYW4gQWR2aXNvcnlIaXN0b3J5IG9yIGp1c3QgQWR2aXNvcnkgKGluIGNhc2UgdGhleSB1c2UgdGhlIEFkdmlzb3J5IElEIGRpcmVjdGx5IGluIFVJKVxyXG4gICAgLy8gVGhlIGhpc3RvcnkgSUQgaXMgZ2VuZXJhbGx5IHdoYXQgaXMgcmVuZGVyZWQgaW4gdGhlIGRhc2hib2FyZC5cclxuICAgIGNvbnN0IHVwZGF0ZWQgPSBhd2FpdCBBZHZpc29yeUhpc3RvcnkuZmluZE9uZUFuZFVwZGF0ZShcclxuICAgICAgeyBfaWQ6IGlkIH0sXHJcbiAgICAgIHsgZmFybWVyRmVlZGJhY2s6IGZlZWRiYWNrIH0sXHJcbiAgICAgIHsgbmV3OiB0cnVlIH1cclxuICAgICk7XHJcbiAgICBcclxuICAgIGlmICghdXBkYXRlZCkge1xyXG4gICAgICByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiBcIkFkdmlzb3J5IGhpc3Rvcnkgbm90IGZvdW5kXCIgfSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmVzLmpzb24odXBkYXRlZCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthZHZpc29yeV0gRmVlZGJhY2sgZXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gc3VibWl0IGZlZWRiYWNrXCIgfSk7XHJcbiAgfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXG1hcmtldC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL21hcmtldC50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuXHJcbmNvbnN0IHNhbXBsZSA9IFtcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiV2hlYXRcIixcclxuICAgIHN0YXRlOiBcIlB1bmphYlwiLFxyXG4gICAgbWFuZGk6IFwiTHVkaGlhbmFcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogMjIwMCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJXaGVhdFwiLFxyXG4gICAgc3RhdGU6IFwiVXR0YXIgUHJhZGVzaFwiLFxyXG4gICAgbWFuZGk6IFwiS2FucHVyXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDIxNTAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiUmljZVwiLFxyXG4gICAgc3RhdGU6IFwiV2VzdCBCZW5nYWxcIixcclxuICAgIG1hbmRpOiBcIktvbGthdGFcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogMjQ1MCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJSaWNlXCIsXHJcbiAgICBzdGF0ZTogXCJUYW1pbCBOYWR1XCIsXHJcbiAgICBtYW5kaTogXCJUaGFuamF2dXJcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogMjQwMCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJPbmlvblwiLFxyXG4gICAgc3RhdGU6IFwiTWFoYXJhc2h0cmFcIixcclxuICAgIG1hbmRpOiBcIk5hc2hpa1wiLFxyXG4gICAgdW5pdDogXCJRdGxcIixcclxuICAgIHByaWNlOiAxNzAwLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgY29tbW9kaXR5OiBcIk9uaW9uXCIsXHJcbiAgICBzdGF0ZTogXCJLYXJuYXRha2FcIixcclxuICAgIG1hbmRpOiBcIkh1YmJhbGxpXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDE2NTAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiUG90YXRvXCIsXHJcbiAgICBzdGF0ZTogXCJVdHRhciBQcmFkZXNoXCIsXHJcbiAgICBtYW5kaTogXCJBZ3JhXCIsXHJcbiAgICB1bml0OiBcIlF0bFwiLFxyXG4gICAgcHJpY2U6IDEyMDAsXHJcbiAgfSxcclxuICB7XHJcbiAgICBjb21tb2RpdHk6IFwiUG90YXRvXCIsXHJcbiAgICBzdGF0ZTogXCJXZXN0IEJlbmdhbFwiLFxyXG4gICAgbWFuZGk6IFwiSG9vZ2hseVwiLFxyXG4gICAgdW5pdDogXCJRdGxcIixcclxuICAgIHByaWNlOiAxMjUwLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgY29tbW9kaXR5OiBcIlNveWJlYW5cIixcclxuICAgIHN0YXRlOiBcIk1hZGh5YSBQcmFkZXNoXCIsXHJcbiAgICBtYW5kaTogXCJJbmRvcmVcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogNDgwMCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJDb3R0b25cIixcclxuICAgIHN0YXRlOiBcIlRlbGFuZ2FuYVwiLFxyXG4gICAgbWFuZGk6IFwiV2FyYW5nYWxcIixcclxuICAgIHVuaXQ6IFwiUXRsXCIsXHJcbiAgICBwcmljZTogNjIwMCxcclxuICB9LFxyXG4gIHtcclxuICAgIGNvbW1vZGl0eTogXCJUdXJcIixcclxuICAgIHN0YXRlOiBcIk1haGFyYXNodHJhXCIsXHJcbiAgICBtYW5kaTogXCJMYXR1clwiLFxyXG4gICAgdW5pdDogXCJRdGxcIixcclxuICAgIHByaWNlOiA3MDAwLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgY29tbW9kaXR5OiBcIkNoaWxsaVwiLFxyXG4gICAgc3RhdGU6IFwiQW5kaHJhIFByYWRlc2hcIixcclxuICAgIG1hbmRpOiBcIkd1bnR1clwiLFxyXG4gICAgdW5pdDogXCJRdGxcIixcclxuICAgIHByaWNlOiA5MDAwLFxyXG4gIH0sXHJcbl07XHJcblxyXG5pbXBvcnQgeyBnZXRDYWNoZSwgc2V0Q2FjaGUsIG1ha2VLZXkgfSBmcm9tIFwiLi4vdXRpbHMvY2FjaGVcIjtcclxuaW1wb3J0IHsgZmV0Y2hXaXRoVGltZW91dCwgcmV0cnkgfSBmcm9tIFwiLi4vdXRpbHMvaHR0cFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1hcmtldFByaWNlczogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICBjb25zdCB7IGNvbW1vZGl0eSwgc3RhdGUgfSA9IHJlcS5xdWVyeSBhcyB7XHJcbiAgICBjb21tb2RpdHk/OiBzdHJpbmc7XHJcbiAgICBzdGF0ZT86IHN0cmluZztcclxuICB9O1xyXG4gIGNvbnN0IGFwaVVybCA9IHByb2Nlc3MuZW52Lk1BUktFVF9BUElfVVJMOyAvLyBvcHRpb25hbCBleHRlcm5hbCBwcm92aWRlciAoSlNPTiBhcnJheSlcclxuICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5NQVJLRVRfQVBJX0tFWTsgLy8gb3B0aW9uYWwgaGVhZGVyIGtleVxyXG5cclxuICAvLyBDYWNoZSBmb3IgNSBtaW51dGVzIGJ5IGNvbW1vZGl0eS9zdGF0ZVxyXG4gIGNvbnN0IGNhY2hlS2V5ID0gbWFrZUtleShbXHJcbiAgICBcIm1hcmtldFwiLFxyXG4gICAgKGNvbW1vZGl0eSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgKHN0YXRlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCksXHJcbiAgXSk7XHJcbiAgY29uc3QgY2FjaGVkID0gZ2V0Q2FjaGU8YW55PihjYWNoZUtleSk7XHJcbiAgaWYgKGNhY2hlZClcclxuICAgIHJldHVybiByZXMuanNvbih7XHJcbiAgICAgIHNvdXJjZTogY2FjaGVkLnNvdXJjZSxcclxuICAgICAgaXRlbXM6IGNhY2hlZC5pdGVtcyxcclxuICAgICAgY2FjaGVkOiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBpZiAoYXBpVXJsKSB7XHJcbiAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYXBpVXJsKTtcclxuICAgICAgaWYgKGNvbW1vZGl0eSkgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJjb21tb2RpdHlcIiwgY29tbW9kaXR5KTtcclxuICAgICAgaWYgKHN0YXRlKSB1cmwuc2VhcmNoUGFyYW1zLnNldChcInN0YXRlXCIsIHN0YXRlKTtcclxuICAgICAgY29uc3QgciA9IGF3YWl0IHJldHJ5KCgpID0+XHJcbiAgICAgICAgZmV0Y2hXaXRoVGltZW91dChcclxuICAgICAgICAgIHVybC50b1N0cmluZygpLFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBoZWFkZXJzOiBhcGlLZXkgPyB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCB9IDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDcwMDAsXHJcbiAgICAgICAgKSxcclxuICAgICAgKTtcclxuICAgICAgaWYgKHIub2spIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgci5qc29uKCk7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHsgc291cmNlOiBcImxpdmVcIiBhcyBjb25zdCwgaXRlbXM6IGRhdGEgfTtcclxuICAgICAgICBzZXRDYWNoZShjYWNoZUtleSwgcGF5bG9hZCwgNSAqIDYwICogMTAwMCk7XHJcbiAgICAgICAgcmV0dXJuIHJlcy5qc29uKHBheWxvYWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7fVxyXG5cclxuICBjb25zdCBpdGVtcyA9IHNhbXBsZS5maWx0ZXIoXHJcbiAgICAoaSkgPT5cclxuICAgICAgKCFjb21tb2RpdHkgfHxcclxuICAgICAgICBpLmNvbW1vZGl0eS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGNvbW1vZGl0eS50b0xvd2VyQ2FzZSgpKSkgJiZcclxuICAgICAgKCFzdGF0ZSB8fCBpLnN0YXRlLnRvTG93ZXJDYXNlKCkgPT09IHN0YXRlLnRvTG93ZXJDYXNlKCkpLFxyXG4gICk7XHJcbiAgY29uc3QgcGF5bG9hZCA9IHsgc291cmNlOiBcInNhbXBsZVwiIGFzIGNvbnN0LCBpdGVtcyB9O1xyXG4gIHNldENhY2hlKGNhY2hlS2V5LCBwYXlsb2FkLCA1ICogNjAgKiAxMDAwKTtcclxuICByZXMuanNvbihwYXlsb2FkKTtcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1xcXFxjaGF0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9yb3V0ZXMvY2hhdC50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBjaGF0SGFuZGxlcjogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBtZXNzYWdlLCBsYXQsIGxvbiwgbGFuZyA9IFwiZW5cIiB9ID0gcmVxLmJvZHkgYXMge1xyXG4gICAgICBtZXNzYWdlPzogc3RyaW5nO1xyXG4gICAgICBsYXQ/OiBudW1iZXI7XHJcbiAgICAgIGxvbj86IG51bWJlcjtcclxuICAgICAgbGFuZz86IHN0cmluZztcclxuICAgIH07XHJcbiAgICBpZiAoIW1lc3NhZ2UpIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIm1lc3NhZ2UgcmVxdWlyZWRcIiB9KTtcclxuXHJcbiAgICAvLyBOb3JtYWxpemUgbGFuZ3VhZ2UgY29kZSAoZS5nLiBcImhpLUlOXCIgLT4gXCJoaVwiKVxyXG4gICAgY29uc3Qgc2hvcnRMYW5nID0gbGFuZy5zcGxpdChcIi1cIilbMF07XHJcbiAgICBjb25zdCBpc0hpID0gc2hvcnRMYW5nID09PSBcImhpXCI7XHJcbiAgICBjb25zdCBpc09yID0gc2hvcnRMYW5nID09PSBcIm9yXCI7XHJcblxyXG4gICAgY29uc3QgbSA9IG1lc3NhZ2UudG9Mb3dlckNhc2UoKTtcclxuICAgIGNvbnN0IHJlcGxpZXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLy8gVHJhbnNsYXRpb24gRGljdGlvbmFyeVxyXG4gICAgY29uc3QgdCA9IHtcclxuICAgICAgd2VhdGhlcjoge1xyXG4gICAgICAgIGVuOiAoZGVzYzogc3RyaW5nLCB0ZW1wOiBudW1iZXIsIGh1bTogbnVtYmVyKSA9PiBgV2VhdGhlcjogJHtkZXNjfSwgVGVtcCAke3RlbXB9XHUwMEIwQywgSHVtaWRpdHkgJHtodW19JWAsXHJcbiAgICAgICAgaGk6IChkZXNjOiBzdHJpbmcsIHRlbXA6IG51bWJlciwgaHVtOiBudW1iZXIpID0+IGBcdTA5MkVcdTA5NENcdTA5MzhcdTA5MkU6ICR7ZGVzY30sIFx1MDkyNFx1MDkzRVx1MDkyQVx1MDkyRVx1MDkzRVx1MDkyOCAke3RlbXB9XHUwMEIwQywgXHUwOTI4XHUwOTJFXHUwOTQwICR7aHVtfSVgLFxyXG4gICAgICAgIG9yOiAoZGVzYzogc3RyaW5nLCB0ZW1wOiBudW1iZXIsIGh1bTogbnVtYmVyKSA9PiBgXHUwQjJBXHUwQjNFXHUwQjIzXHUwQjNGXHUwQjJBXHUwQjNFXHUwQjE3OiAke2Rlc2N9LCBcdTBCMjRcdTBCM0VcdTBCMkFcdTBCMkVcdTBCM0VcdTBCMjRcdTBCNERcdTBCMzBcdTBCM0UgJHt0ZW1wfVx1MDBCMEMsIFx1MEIwNlx1MEIzMFx1MEI0RFx1MEIyNlx1MEI0RFx1MEIzMFx1MEIyNFx1MEIzRSAke2h1bX0lYCxcclxuICAgICAgfSxcclxuICAgICAgbWFya2V0OiB7XHJcbiAgICAgICAgZW46IFwiRm9yIGxpdmUgbWFuZGkgcHJpY2VzLCBwbGVhc2UgY2hlY2sgdGhlICdNYXJrZXQnIHRhYi4gSSBjYW4gdGVsbCB5b3UgdGhhdCBXaGVhdCBpcyBjdXJyZW50bHkgdHJlbmRpbmcgdXAgaW4gUHVuamFiIG1hcmtldHMuXCIsXHJcbiAgICAgICAgaGk6IFwiXHUwOTMyXHUwOTNFXHUwOTA3XHUwOTM1IFx1MDkyRVx1MDkwMlx1MDkyMVx1MDk0MCBcdTA5MkRcdTA5M0VcdTA5MzUgXHUwOTE1XHUwOTQ3IFx1MDkzMlx1MDkzRlx1MDkwRiwgXHUwOTE1XHUwOTQzXHUwOTJBXHUwOTJGXHUwOTNFICdcdTA5MkVcdTA5MDJcdTA5MjFcdTA5NDAgXHUwOTJEXHUwOTNFXHUwOTM1JyBcdTA5MUZcdTA5NDhcdTA5MkMgXHUwOTI2XHUwOTQ3XHUwOTE2XHUwOTQ3XHUwOTAyXHUwOTY0IFx1MDkyQVx1MDkwMlx1MDkxQ1x1MDkzRVx1MDkyQyBcdTA5MTVcdTA5NDAgXHUwOTJFXHUwOTAyXHUwOTIxXHUwOTNGXHUwOTJGXHUwOTRCXHUwOTAyIFx1MDkyRVx1MDk0N1x1MDkwMiBcdTA5MTdcdTA5NDdcdTA5MzlcdTA5NDJcdTA5MDIgXHUwOTE1XHUwOTQ3IFx1MDkyNlx1MDkzRVx1MDkyRSBcdTA5MkNcdTA5MjJcdTA5M0MgXHUwOTMwXHUwOTM5XHUwOTQ3IFx1MDkzOVx1MDk0OFx1MDkwMlx1MDk2NFwiLFxyXG4gICAgICAgIG9yOiBcIlx1MEIzMlx1MEIzRVx1MEIwN1x1MEIyRCBcdTBCMkVcdTBCMjNcdTBCNERcdTBCMjFcdTBCM0YgXHUwQjJFXHUwQjQyXHUwQjMyXHUwQjREXHUwQjVGIFx1MEIyQVx1MEIzRVx1MEIwN1x1MEIwMSwgXHUwQjI2XHUwQjVGXHUwQjNFXHUwQjE1XHUwQjMwXHUwQjNGICdcdTBCMkNcdTBCMUNcdTBCM0VcdTBCMzAnIFx1MEIxRlx1MEI0RFx1MEI1Rlx1MEIzRVx1MEIyQ1x1MEI0RCBcdTBCMjZcdTBCNDdcdTBCMTZcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCBcdTBCMkFcdTBCMUVcdTBCNERcdTBCMUNcdTBCM0VcdTBCMkMgXHUwQjJDXHUwQjFDXHUwQjNFXHUwQjMwXHUwQjMwXHUwQjQ3IFx1MEIxN1x1MEIzOVx1MEIyRSBcdTBCMkVcdTBCNDJcdTBCMzJcdTBCNERcdTBCNUYgXHUwQjJDXHUwQjQzXHUwQjI2XHUwQjREXHUwQjI3XHUwQjNGIFx1MEIyQVx1MEIzRVx1MEIwOVx1MEIxQlx1MEIzRiB8XCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIHlpZWxkOiB7XHJcbiAgICAgICAgZW46IFwiVG8gaW1wcm92ZSB5aWVsZDogMS4gRW5zdXJlIHNvaWwgdGVzdGluZy4gMi4gVXNlIGNlcnRpZmllZCBzZWVkcy4gMy4gRm9sbG93IHRpbWVseSBpcnJpZ2F0aW9uLiA0LiBNYW5hZ2UgcGVzdHMgZWFybHkgd2l0aCBiaW8tcGVzdGljaWRlcy5cIixcclxuICAgICAgICBoaTogXCJcdTA5MkFcdTA5NDhcdTA5MjZcdTA5M0VcdTA5MzVcdTA5M0VcdTA5MzAgXHUwOTJDXHUwOTIyXHUwOTNDXHUwOTNFXHUwOTI4XHUwOTQ3IFx1MDkxNVx1MDk0NyBcdTA5MzJcdTA5M0ZcdTA5MEY6IDEuIFx1MDkyRVx1MDkzRlx1MDkxRlx1MDk0RFx1MDkxRlx1MDk0MCBcdTA5MTVcdTA5NDAgXHUwOTFDXHUwOTNFXHUwOTAyXHUwOTFBIFx1MDkxNVx1MDkzMFx1MDkzRVx1MDkwRlx1MDkwMlx1MDk2NCAyLiBcdTA5MkFcdTA5NERcdTA5MzBcdTA5MkVcdTA5M0VcdTA5MjNcdTA5M0ZcdTA5MjQgXHUwOTJDXHUwOTQwXHUwOTFDXHUwOTRCXHUwOTAyIFx1MDkxNVx1MDkzRSBcdTA5MDlcdTA5MkFcdTA5MkZcdTA5NEJcdTA5MTcgXHUwOTE1XHUwOTMwXHUwOTQ3XHUwOTAyXHUwOTY0IDMuIFx1MDkzOFx1MDkyRVx1MDkyRiBcdTA5MkFcdTA5MzAgXHUwOTM4XHUwOTNGXHUwOTAyXHUwOTFBXHUwOTNFXHUwOTA4IFx1MDkxNVx1MDkzMFx1MDk0N1x1MDkwMlx1MDk2NCA0LiBcdTA5MUNcdTA5NDhcdTA5MzUtXHUwOTE1XHUwOTQwXHUwOTFGXHUwOTI4XHUwOTNFXHUwOTM2XHUwOTE1XHUwOTRCXHUwOTAyIFx1MDkxNVx1MDk0NyBcdTA5MzhcdTA5M0VcdTA5MjUgXHUwOTE1XHUwOTQwXHUwOTFGXHUwOTRCXHUwOTAyIFx1MDkxNVx1MDkzRSBcdTA5MkFcdTA5NERcdTA5MzBcdTA5MkNcdTA5MDJcdTA5MjdcdTA5MjggXHUwOTE1XHUwOTMwXHUwOTQ3XHUwOTAyXHUwOTY0XCIsXHJcbiAgICAgICAgb3I6IFwiXHUwQjA1XHUwQjJFXHUwQjMzIFx1MEIyQ1x1MEI0M1x1MEIyNlx1MEI0RFx1MEIyN1x1MEIzRiBcdTBCMkFcdTBCM0VcdTBCMDdcdTBCMDE6IDEuIFx1MEIyRVx1MEIzRVx1MEIxRlx1MEIzRiBcdTBCMkFcdTBCMzBcdTBCNDBcdTBCMTVcdTBCNERcdTBCMzdcdTBCM0UgXHUwQjI4XHUwQjNGXHUwQjM2XHUwQjREXHUwQjFBXHUwQjNGXHUwQjI0IFx1MEIxNVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8IDIuIFx1MEIyQVx1MEI0RFx1MEIzMFx1MEIyRVx1MEIzRVx1MEIyM1x1MEIzRlx1MEIyNCBcdTBCMkNcdTBCM0ZcdTBCMzlcdTBCMjggXHUwQjJDXHUwQjREXHUwQjVGXHUwQjJDXHUwQjM5XHUwQjNFXHUwQjMwIFx1MEIxNVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8IDMuIFx1MEIyMFx1MEIzRlx1MEIxNVx1MEI0RCBcdTBCMzhcdTBCMkVcdTBCNUZcdTBCMzBcdTBCNDcgXHUwQjFDXHUwQjMzXHUwQjM4XHUwQjQ3XHUwQjFBXHUwQjI4IFx1MEIxNVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8IDQuIFx1MEIxQ1x1MEI0OFx1MEIyQyBcdTBCMTVcdTBCNDBcdTBCMUZcdTBCMjhcdTBCM0VcdTBCMzZcdTBCMTUgXHUwQjM4XHUwQjM5XHUwQjNGXHUwQjI0IFx1MEIzNlx1MEI0MFx1MEIxOFx1MEI0RFx1MEIzMCBcdTBCMkFcdTBCNEJcdTBCMTUgXHUwQjJBXHUwQjMwXHUwQjNGXHUwQjFBXHUwQjNFXHUwQjMzXHUwQjI4XHUwQjNFIFx1MEIxNVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8XCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGlycmlnYXRpb246IHtcclxuICAgICAgICBlbjogXCJJcnJpZ2F0aW9uIHRpcDogV2F0ZXIgZWFybHkgbW9ybmluZyBvciBsYXRlIGV2ZW5pbmcgdG8gcmVkdWNlIGV2YXBvcmF0aW9uLiBGb3IgcGFkZHksIG1haW50YWluIHN0YW5kaW5nIHdhdGVyIG9ubHkgYXQgY3JpdGljYWwgc3RhZ2VzLlwiLFxyXG4gICAgICAgIGhpOiBcIlx1MDkzOFx1MDkzRlx1MDkwMlx1MDkxQVx1MDkzRVx1MDkwOCBcdTA5MUZcdTA5M0ZcdTA5MkE6IFx1MDkzNVx1MDkzRVx1MDkzN1x1MDk0RFx1MDkyQVx1MDk0MFx1MDkxNVx1MDkzMFx1MDkyMyBcdTA5MTVcdTA5MkUgXHUwOTE1XHUwOTMwXHUwOTI4XHUwOTQ3IFx1MDkxNVx1MDk0NyBcdTA5MzJcdTA5M0ZcdTA5MEYgXHUwOTM4XHUwOTQxXHUwOTJDXHUwOTM5IFx1MDkxQ1x1MDkzMlx1MDk0RFx1MDkyNlx1MDk0MCBcdTA5MkZcdTA5M0UgXHUwOTI2XHUwOTQ3XHUwOTMwIFx1MDkzNlx1MDkzRVx1MDkyRSBcdTA5MTVcdTA5NEIgXHUwOTJBXHUwOTNFXHUwOTI4XHUwOTQwIFx1MDkyNlx1MDk0N1x1MDkwMlx1MDk2NCBcdTA5MjdcdTA5M0VcdTA5MjggXHUwOTE1XHUwOTQ3IFx1MDkzMlx1MDkzRlx1MDkwRiwgXHUwOTE1XHUwOTQ3XHUwOTM1XHUwOTMyIFx1MDkyRVx1MDkzOVx1MDkyNFx1MDk0RFx1MDkzNVx1MDkyQVx1MDk0Mlx1MDkzMFx1MDk0RFx1MDkyMyBcdTA5MUFcdTA5MzBcdTA5MjNcdTA5NEJcdTA5MDIgXHUwOTJFXHUwOTQ3XHUwOTAyIFx1MDkxNlx1MDkyMVx1MDkzQ1x1MDkzRSBcdTA5MkFcdTA5M0VcdTA5MjhcdTA5NDAgXHUwOTMwXHUwOTE2XHUwOTQ3XHUwOTAyXHUwOTY0XCIsXHJcbiAgICAgICAgb3I6IFwiXHUwQjFDXHUwQjMzXHUwQjM4XHUwQjQ3XHUwQjFBXHUwQjI4IFx1MEIxRlx1MEIzRlx1MEIyQVx1MEI0RFx1MEIyQVx1MEIyM1x1MEI0MDogXHUwQjJDXHUwQjNFXHUwQjM3XHUwQjREXHUwQjJBXHUwQjQwXHUwQjE1XHUwQjMwXHUwQjIzIFx1MEIzOVx1MEI0RFx1MEIzMFx1MEIzRVx1MEIzOCBcdTBCMTVcdTBCMzBcdTBCM0ZcdTBCMkNcdTBCM0VcdTBCMTVcdTBCNDEgXHUwQjJEXHUwQjRCXHUwQjMwIFx1MEIxNVx1MEIzRlx1MEIyRVx1MEI0RFx1MEIyQ1x1MEIzRSBcdTBCMkNcdTBCM0ZcdTBCMzNcdTBCMkVcdTBCNERcdTBCMkNcdTBCM0ZcdTBCMjQgXHUwQjM4XHUwQjI4XHUwQjREXHUwQjI3XHUwQjREXHUwQjVGXHUwQjNFXHUwQjMwXHUwQjQ3IFx1MEIyQVx1MEIzRVx1MEIyM1x1MEIzRiBcdTBCMjZcdTBCM0ZcdTBCMDVcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCBcdTBCMjdcdTBCM0VcdTBCMjggXHUwQjJBXHUwQjNFXHUwQjA3XHUwQjAxLCBcdTBCMTVcdTBCNDdcdTBCMkNcdTBCMzMgXHUwQjE3XHUwQjQxXHUwQjMwXHUwQjQxXHUwQjI0XHUwQjREXHUwQjcxXHUwQjJBXHUwQjQyXHUwQjMwXHUwQjREXHUwQjIzXHUwQjREXHUwQjIzIFx1MEIyQVx1MEIzMFx1MEI0RFx1MEIyRlx1MEI0RFx1MEI1Rlx1MEIzRVx1MEI1Rlx1MEIzMFx1MEI0NyBcdTBCMUJcdTBCM0ZcdTBCMjFcdTBCM0UgXHUwQjM5XHUwQjRCXHUwQjA3XHUwQjI1XHUwQjNGXHUwQjJDXHUwQjNFIFx1MEIyQVx1MEIzRVx1MEIyM1x1MEIzRiBcdTBCMzBcdTBCMTZcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfFwiLFxyXG4gICAgICB9LFxyXG4gICAgICB3aGVhdDoge1xyXG4gICAgICAgIGVuOiBcIldoZWF0IEFkdmlzb3J5OiBTb3dpbmcgdGltZSBpcyBOb3YgMS0xNS4gVXNlIE5QSyAxMjA6NjA6NDAuIElycmlnYXRlIGF0IENSSSBzdGFnZSAoMjEgZGF5cyBhZnRlciBzb3dpbmcpLlwiLFxyXG4gICAgICAgIGhpOiBcIlx1MDkxN1x1MDk0N1x1MDkzOVx1MDk0Mlx1MDkwMiBcdTA5MzhcdTA5MzJcdTA5M0VcdTA5Mzk6IFx1MDkyQ1x1MDk0MVx1MDkzNVx1MDkzRVx1MDkwOCBcdTA5MTVcdTA5M0UgXHUwOTM4XHUwOTJFXHUwOTJGIDEtMTUgXHUwOTI4XHUwOTM1XHUwOTAyXHUwOTJDXHUwOTMwIFx1MDkzOVx1MDk0OFx1MDk2NCBOUEsgMTIwOjYwOjQwIFx1MDkxNVx1MDkzRSBcdTA5MkFcdTA5NERcdTA5MzBcdTA5MkZcdTA5NEJcdTA5MTcgXHUwOTE1XHUwOTMwXHUwOTQ3XHUwOTAyXHUwOTY0IENSSSBcdTA5MDVcdTA5MzVcdTA5MzhcdTA5NERcdTA5MjVcdTA5M0UgKFx1MDkyQ1x1MDk0MVx1MDkzNVx1MDkzRVx1MDkwOCBcdTA5MTVcdTA5NDcgMjEgXHUwOTI2XHUwOTNGXHUwOTI4IFx1MDkyQ1x1MDkzRVx1MDkyNikgXHUwOTJBXHUwOTMwIFx1MDkzOFx1MDkzRlx1MDkwMlx1MDkxQVx1MDkzRVx1MDkwOCBcdTA5MTVcdTA5MzBcdTA5NDdcdTA5MDJcdTA5NjRcIixcclxuICAgICAgICBvcjogXCJcdTBCMTdcdTBCMzlcdTBCMkUgXHUwQjJBXHUwQjMwXHUwQjNFXHUwQjJFXHUwQjMwXHUwQjREXHUwQjM2OiBcdTBCMkNcdTBCNDFcdTBCMjNcdTBCM0ZcdTBCMkNcdTBCM0UgXHUwQjM4XHUwQjJFXHUwQjVGIFx1MEIyOFx1MEIyRFx1MEI0N1x1MEIyRVx1MEI0RFx1MEIyQ1x1MEIzMCAxLTE1IFx1MEIwNVx1MEIxRlx1MEI0NyB8IE5QSyAxMjA6NjA6NDAgXHUwQjJDXHUwQjREXHUwQjVGXHUwQjJDXHUwQjM5XHUwQjNFXHUwQjMwIFx1MEIxNVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8IENSSSBcdTBCMkFcdTBCMzBcdTBCNERcdTBCMkZcdTBCNERcdTBCNUZcdTBCM0VcdTBCNUZcdTBCMzBcdTBCNDcgXHUwQjFDXHUwQjMzXHUwQjM4XHUwQjQ3XHUwQjFBXHUwQjI4IChcdTBCMkNcdTBCNDFcdTBCMjNcdTBCM0ZcdTBCMkNcdTBCM0VcdTBCMzAgMjEgXHUwQjI2XHUwQjNGXHUwQjI4IFx1MEIyQVx1MEIzMFx1MEI0NykgfFwiLFxyXG4gICAgICB9LFxyXG4gICAgICByaWNlOiB7XHJcbiAgICAgICAgZW46IFwiUmljZSBBZHZpc29yeTogTWFpbnRhaW4gMi01Y20gd2F0ZXIgbGV2ZWwuIEFwcGx5IFVyZWEgaW4gc3BsaXRzLiBXYXRjaCBvdXQgZm9yIFN0ZW0gQm9yZXIgYW5kIEJsYXN0IGRpc2Vhc2UuXCIsXHJcbiAgICAgICAgaGk6IFwiXHUwOTI3XHUwOTNFXHUwOTI4IFx1MDkzOFx1MDkzMlx1MDkzRVx1MDkzOTogMi01IFx1MDkzOFx1MDk0N1x1MDkyRVx1MDk0MCBcdTA5MUNcdTA5MzIgXHUwOTM4XHUwOTREXHUwOTI0XHUwOTMwIFx1MDkyQ1x1MDkyOFx1MDkzRVx1MDkwRiBcdTA5MzBcdTA5MTZcdTA5NDdcdTA5MDJcdTA5NjQgXHUwOTJGXHUwOTQyXHUwOTMwXHUwOTNGXHUwOTJGXHUwOTNFIFx1MDkxNVx1MDk0QiBcdTA5MUZcdTA5NDFcdTA5MTVcdTA5MjFcdTA5M0NcdTA5NEJcdTA5MDIgXHUwOTJFXHUwOTQ3XHUwOTAyIFx1MDkyMVx1MDkzRVx1MDkzMlx1MDk0N1x1MDkwMlx1MDk2NCBcdTA5MjRcdTA5MjhcdTA5M0UgXHUwOTFCXHUwOTQ3XHUwOTI2XHUwOTE1IFx1MDkxNFx1MDkzMCBcdTA5MkNcdTA5NERcdTA5MzJcdTA5M0VcdTA5MzhcdTA5NERcdTA5MUYgXHUwOTMwXHUwOTRCXHUwOTE3IFx1MDkzOFx1MDk0NyBcdTA5MzhcdTA5M0VcdTA5MzVcdTA5MjdcdTA5M0VcdTA5MjggXHUwOTMwXHUwOTM5XHUwOTQ3XHUwOTAyXHUwOTY0XCIsXHJcbiAgICAgICAgb3I6IFwiXHUwQjI3XHUwQjNFXHUwQjI4IFx1MEIyQVx1MEIzMFx1MEIzRVx1MEIyRVx1MEIzMFx1MEI0RFx1MEIzNjogMi01IFx1MEIzOFx1MEI0N1x1MEIyRVx1MEIzRiBcdTBCMUNcdTBCMzMgXHUwQjM4XHUwQjREXHUwQjI0XHUwQjMwIFx1MEIyQ1x1MEIxQ1x1MEIzRVx1MEI1RiBcdTBCMzBcdTBCMTZcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCBcdTBCNUZcdTBCNDFcdTBCMzBcdTBCM0ZcdTBCMDZcdTBCMTVcdTBCNDEgXHUwQjJEXHUwQjNFXHUwQjE3IFx1MEIyRFx1MEIzRVx1MEIxNyBcdTBCMTVcdTBCMzBcdTBCM0YgXHUwQjJBXHUwQjREXHUwQjMwXHUwQjVGXHUwQjRCXHUwQjE3IFx1MEIxNVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8IFx1MEIzN1x1MEI0RFx1MEIxRlx1MEI0N1x1MEIyRVx1MEI0RCBcdTBCMkNcdTBCNEJcdTBCMzBcdTBCMzBcdTBCNEQgXHUwQjBGXHUwQjJDXHUwQjAyIFx1MEIyQ1x1MEI0RFx1MEIzMlx1MEIzRVx1MEIzN1x1MEI0RFx1MEIxRiBcdTBCMzBcdTBCNEJcdTBCMTcgXHUwQjJBXHUwQjREXHUwQjMwXHUwQjI0XHUwQjNGIFx1MEIzOFx1MEIzRVx1MEIyQ1x1MEIyN1x1MEIzRVx1MEIyOCBcdTBCMzBcdTBCNDFcdTBCMzlcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfFwiLFxyXG4gICAgICB9LFxyXG4gICAgICBnZW5lcmFsOiB7XHJcbiAgICAgICAgZW46IFwiR2VuZXJhbCBhZHZpc29yeTogY2hvb3NlIGNyb3BzIGJhc2VkIG9uIGxvY2FsIGNsaW1hdGUgYW5kIHNvaWwgdGVzdC4gTWFpbnRhaW4gYmFsYW5jZWQgTlBLIGFuZCB1c2UgY29tcG9zdC4gTW9uaXRvciBwZXN0cyB3ZWVrbHkgYW5kIGlycmlnYXRlIGJhc2VkIG9uIHNvaWwgbW9pc3R1cmUuXCIsXHJcbiAgICAgICAgaGk6IFwiXHUwOTM4XHUwOTNFXHUwOTJFXHUwOTNFXHUwOTI4XHUwOTREXHUwOTJGIFx1MDkzOFx1MDkzMlx1MDkzRVx1MDkzOTogXHUwOTM4XHUwOTREXHUwOTI1XHUwOTNFXHUwOTI4XHUwOTQwXHUwOTJGIFx1MDkxQ1x1MDkzMlx1MDkzNVx1MDkzRVx1MDkyRlx1MDk0MSBcdTA5MTRcdTA5MzAgXHUwOTJFXHUwOTNGXHUwOTFGXHUwOTREXHUwOTFGXHUwOTQwIFx1MDkyQVx1MDkzMFx1MDk0MFx1MDkxNVx1MDk0RFx1MDkzN1x1MDkyMyBcdTA5MTVcdTA5NDcgXHUwOTA2XHUwOTI3XHUwOTNFXHUwOTMwIFx1MDkyQVx1MDkzMCBcdTA5MkJcdTA5MzhcdTA5MzIgXHUwOTFBXHUwOTQxXHUwOTI4XHUwOTQ3XHUwOTAyXHUwOTY0IFx1MDkzOFx1MDkwMlx1MDkyNFx1MDk0MVx1MDkzMlx1MDkzRlx1MDkyNCBOUEsgXHUwOTJDXHUwOTI4XHUwOTNFXHUwOTBGIFx1MDkzMFx1MDkxNlx1MDk0N1x1MDkwMiBcdTA5MTRcdTA5MzAgXHUwOTE2XHUwOTNFXHUwOTI2IFx1MDkxNVx1MDkzRSBcdTA5MDlcdTA5MkFcdTA5MkZcdTA5NEJcdTA5MTcgXHUwOTE1XHUwOTMwXHUwOTQ3XHUwOTAyXHUwOTY0IFx1MDkzOFx1MDkzRVx1MDkyQVx1MDk0RFx1MDkyNFx1MDkzRVx1MDkzOVx1MDkzRlx1MDkxNSBcdTA5MTVcdTA5NDBcdTA5MUZcdTA5NEJcdTA5MDIgXHUwOTE1XHUwOTQwIFx1MDkyOFx1MDkzRlx1MDkxN1x1MDkzMFx1MDkzRVx1MDkyOFx1MDk0MCBcdTA5MTVcdTA5MzBcdTA5NDdcdTA5MDJcdTA5NjRcIixcclxuICAgICAgICBvcjogXCJcdTBCMzhcdTBCM0VcdTBCMjdcdTBCM0VcdTBCMzBcdTBCMjMgXHUwQjJBXHUwQjMwXHUwQjNFXHUwQjJFXHUwQjMwXHUwQjREXHUwQjM2OiBcdTBCMzhcdTBCNERcdTBCMjVcdTBCM0VcdTBCMjhcdTBCNDBcdTBCNUYgXHUwQjFDXHUwQjMzXHUwQjJDXHUwQjNFXHUwQjVGXHUwQjQxIFx1MEIwRlx1MEIyQ1x1MEIwMiBcdTBCMkVcdTBCNDNcdTBCMjRcdTBCNERcdTBCMjRcdTBCM0ZcdTBCMTVcdTBCM0UgXHUwQjJBXHUwQjMwXHUwQjQwXHUwQjE1XHUwQjREXHUwQjM3XHUwQjNFIFx1MEIwOVx1MEIyQVx1MEIzMFx1MEI0NyBcdTBCMDZcdTBCMjdcdTBCM0VcdTBCMzAgXHUwQjE1XHUwQjMwXHUwQjNGIFx1MEIyQlx1MEIzOFx1MEIzMiBcdTBCMkNcdTBCM0VcdTBCMUJcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgfCBcdTBCMzhcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDFcdTBCMzNcdTBCM0ZcdTBCMjQgTlBLIFx1MEIyQ1x1MEIxQ1x1MEIzRVx1MEI1RiBcdTBCMzBcdTBCMTZcdTBCMjhcdTBCNERcdTBCMjRcdTBCNDEgXHUwQjBGXHUwQjJDXHUwQjAyIFx1MEIxNVx1MEIyRVx1MEI0RFx1MEIyQVx1MEI0Qlx1MEIzN1x1MEI0RFx1MEIxRiBcdTBCMkNcdTBCNERcdTBCNUZcdTBCMkNcdTBCMzlcdTBCM0VcdTBCMzAgXHUwQjE1XHUwQjMwXHUwQjI4XHUwQjREXHUwQjI0XHUwQjQxIHwgXHUwQjM4XHUwQjNFXHUwQjJBXHUwQjREXHUwQjI0XHUwQjNFXHUwQjM5XHUwQjNGXHUwQjE1IFx1MEIyQVx1MEI0Qlx1MEIxNSBcdTBCMDlcdTBCMkFcdTBCMzBcdTBCNDcgXHUwQjI4XHUwQjFDXHUwQjMwIFx1MEIzMFx1MEIxNlx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8XCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGZhbGxiYWNrOiB7XHJcbiAgICAgICAgZW46IFwiSSBjYW4gaGVscCB3aXRoIHdlYXRoZXIsIG1hcmtldCBwcmljZXMsIGFuZCBjcm9wIGFkdmlzb3J5LiBBc2sgbWUgYWJvdXQgYW55IG9mIHRoZXNlLlwiLFxyXG4gICAgICAgIGhpOiBcIlx1MDkyRVx1MDk0OFx1MDkwMiBcdTA5MkVcdTA5NENcdTA5MzhcdTA5MkUsIFx1MDkyRVx1MDkwMlx1MDkyMVx1MDk0MCBcdTA5MkRcdTA5M0VcdTA5MzUgXHUwOTE0XHUwOTMwIFx1MDkyQlx1MDkzOFx1MDkzMiBcdTA5MzhcdTA5MzJcdTA5M0VcdTA5MzkgXHUwOTJFXHUwOTQ3XHUwOTAyIFx1MDkyRVx1MDkyNlx1MDkyNiBcdTA5MTVcdTA5MzAgXHUwOTM4XHUwOTE1XHUwOTI0XHUwOTNFIFx1MDkzOVx1MDk0Mlx1MDkwMlx1MDk2NCBcdTA5MkVcdTA5NDFcdTA5MURcdTA5MzhcdTA5NDcgXHUwOTA3XHUwOTI4XHUwOTJFXHUwOTQ3XHUwOTAyIFx1MDkzOFx1MDk0NyBcdTA5MTVcdTA5M0ZcdTA5MzhcdTA5NDAgXHUwOTE1XHUwOTQ3IFx1MDkyQ1x1MDkzRVx1MDkzMFx1MDk0NyBcdTA5MkVcdTA5NDdcdTA5MDIgXHUwOTJEXHUwOTQwIFx1MDkyQVx1MDk0Mlx1MDkxQlx1MDk0N1x1MDkwMlx1MDk2NFwiLFxyXG4gICAgICAgIG9yOiBcIlx1MEIyRVx1MEI0MVx1MEIwMSBcdTBCMkFcdTBCM0VcdTBCMjNcdTBCM0ZcdTBCMkFcdTBCM0VcdTBCMTcsIFx1MEIyQ1x1MEIxQ1x1MEIzRVx1MEIzMCBcdTBCMkVcdTBCNDJcdTBCMzJcdTBCNERcdTBCNUYgXHUwQjBGXHUwQjJDXHUwQjAyIFx1MEIyQlx1MEIzOFx1MEIzMiBcdTBCMkFcdTBCMzBcdTBCM0VcdTBCMkVcdTBCMzBcdTBCNERcdTBCMzZcdTBCMzBcdTBCNDcgXHUwQjM4XHUwQjNFXHUwQjM5XHUwQjNFXHUwQjJGXHUwQjREXHUwQjVGIFx1MEIxNVx1MEIzMFx1MEIzRlx1MEIyQVx1MEIzRVx1MEIzMFx1MEIzRlx1MEIyQ1x1MEIzRiB8IFx1MEIwRlx1MEIxN1x1MEI0MVx1MEIyMVx1MEIzRlx1MEIxNSBcdTBCMkNcdTBCM0ZcdTBCMzdcdTBCNUZcdTBCMzBcdTBCNDcgXHUwQjJFXHUwQjRCXHUwQjI0XHUwQjQ3IFx1MEIyQVx1MEIxQVx1MEIzRVx1MEIzMFx1MEIyOFx1MEI0RFx1MEIyNFx1MEI0MSB8XCIsXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gSGVscGVyIHRvIGdldCB0ZXh0IGJhc2VkIG9uIGxhbmdcclxuICAgIGNvbnN0IGdldFRleHQgPSAoa2V5OiBrZXlvZiB0eXBlb2YgdCkgPT4ge1xyXG4gICAgICBjb25zdCBlbnRyeSA9IHRba2V5XSBhcyBhbnk7XHJcbiAgICAgIGlmIChpc0hpKSByZXR1cm4gZW50cnkuaGk7XHJcbiAgICAgIGlmIChpc09yKSByZXR1cm4gZW50cnkub3I7XHJcbiAgICAgIHJldHVybiBlbnRyeS5lbjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoLyh3ZWF0aGVyfHRlbXB8cmFpbnxtYXVzYW18cGFhbmlwYWFnKS8udGVzdChtKSAmJiBsYXQgIT0gbnVsbCAmJiBsb24gIT0gbnVsbCkge1xyXG4gICAgICBjb25zdCBrZXkgPSBwcm9jZXNzLmVudi5PUEVOV0VBVEhFUl9BUElfS0VZO1xyXG4gICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAgY29uc3QgciA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP2xhdD0ke2xhdH0mbG9uPSR7bG9ufSZhcHBpZD0ke2tleX0mdW5pdHM9bWV0cmljYCxcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChyLm9rKSB7XHJcbiAgICAgICAgICBjb25zdCB3ID0gYXdhaXQgci5qc29uKCk7XHJcbiAgICAgICAgICBjb25zdCBnZXRXVGV4dCA9IHQud2VhdGhlcltpc0hpID8gJ2hpJyA6IGlzT3IgPyAnb3InIDogJ2VuJ107XHJcbiAgICAgICAgICByZXBsaWVzLnB1c2goZ2V0V1RleHQody53ZWF0aGVyPy5bMF0/LmRlc2NyaXB0aW9uIHx8IFwiXCIsIHcubWFpbj8udGVtcCA/PyBcIj9cIiwgdy5tYWluPy5odW1pZGl0eSA/PyBcIj9cIikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICgvKHByaWNlfG1hbmRpfG1hcmtldHxiaGF2fGRhYW18ZGFyKS8udGVzdChtKSkge1xyXG4gICAgICByZXBsaWVzLnB1c2goZ2V0VGV4dCgnbWFya2V0JykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgvKHlpZWxkfHByb2R1Y3Rpb258aGFydmVzdHxwZWRhdmFyfGFtYWwpLy50ZXN0KG0pKSB7XHJcbiAgICAgIHJlcGxpZXMucHVzaChnZXRUZXh0KCd5aWVsZCcpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoLyhpcnJpZ2F0aW9ufHdhdGVyfHNpbmNoYWl8cGFuaXxzZWNoYW4pLy50ZXN0KG0pKSB7XHJcbiAgICAgIHJlcGxpZXMucHVzaChnZXRUZXh0KCdpcnJpZ2F0aW9uJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgvKGNyb3B8ZmVydGlsaXplcnxhZHZpY2V8YWR2aXNvcnl8d2hlYXR8cmljZXxjb3JufGdlaHV8ZGhhbnxmYXNhbCkvLnRlc3QobSkpIHtcclxuICAgICAgaWYgKG0uaW5jbHVkZXMoXCJ3aGVhdFwiKSB8fCBtLmluY2x1ZGVzKFwiZ2VodVwiKSkge1xyXG4gICAgICAgIHJlcGxpZXMucHVzaChnZXRUZXh0KCd3aGVhdCcpKTtcclxuICAgICAgfSBlbHNlIGlmIChtLmluY2x1ZGVzKFwicmljZVwiKSB8fCBtLmluY2x1ZGVzKFwicGFkZHlcIikgfHwgbS5pbmNsdWRlcyhcImRoYW5cIikpIHtcclxuICAgICAgICByZXBsaWVzLnB1c2goZ2V0VGV4dCgncmljZScpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXBsaWVzLnB1c2goZ2V0VGV4dCgnZ2VuZXJhbCcpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVwbGllcy5sZW5ndGgpXHJcbiAgICAgIHJlcGxpZXMucHVzaChnZXRUZXh0KCdmYWxsYmFjaycpKTtcclxuXHJcbiAgICByZXMuanNvbih7IHJlcGx5OiByZXBsaWVzLmpvaW4oXCJcXG5cIikgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJjaGF0IGVycm9yXCIgfSk7XHJcbiAgfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXHByZWRpY3QudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9wcmVkaWN0LnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgbXVsdGVyIGZyb20gXCJtdWx0ZXJcIjtcclxuaW1wb3J0IHsgZmV0Y2hXaXRoVGltZW91dCwgcmV0cnkgfSBmcm9tIFwiLi4vdXRpbHMvaHR0cFwiO1xyXG5cclxuY29uc3QgdXBsb2FkID0gbXVsdGVyKCk7XHJcblxyXG5leHBvcnQgY29uc3QgdXBsb2FkTWlkZGxld2FyZSA9IHVwbG9hZC5zaW5nbGUoXCJpbWFnZVwiKTtcclxuXHJcbi8vIElubGluZSBoZWxwZXIgc2luY2UgdXRpbHMvc29pbERhdGEgbWlnaHQgYmUgbWlzc2luZy9jb25mbGljdGVkXHJcbmZ1bmN0aW9uIGdldFNvaWxJbmZvKG5hbWU6IHN0cmluZykge1xyXG4gIGNvbnN0IGxvd2VyID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gIFxyXG4gIGlmIChsb3dlci5pbmNsdWRlcyhcInJpY2VcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJwYWRkeVwiKSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogXCJDbGF5IC8gTG9hbVwiLFxyXG4gICAgICBwaDogXCI1LjUgLSA2LjVcIixcclxuICAgICAgbW9pc3R1cmU6IFwiSGlnaCAoRmxvb2RlZClcIixcclxuICAgICAgdGVtcGVyYXR1cmU6IFwiMjAtMzVcdTAwQjBDXCIsXHJcbiAgICAgIG5vdGVzOiBcIlJpY2UgcmVxdWlyZXMgc3RhbmRpbmcgd2F0ZXIgZHVyaW5nIGVhcmx5IGdyb3d0aCBzdGFnZXMuIEVuc3VyZSBnb29kIHdhdGVyIHJldGVudGlvbi5cIlxyXG4gICAgfTtcclxuICB9XHJcbiAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiY29yblwiKSB8fCBsb3dlci5pbmNsdWRlcyhcIm1haXplXCIpKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBcIkxvYW15IC8gU2FuZHkgTG9hbVwiLFxyXG4gICAgICBwaDogXCI1LjggLSA3LjBcIixcclxuICAgICAgbW9pc3R1cmU6IFwiTW9kZXJhdGVcIixcclxuICAgICAgdGVtcGVyYXR1cmU6IFwiMTgtMjdcdTAwQjBDXCIsXHJcbiAgICAgIG5vdGVzOiBcIkNvcm4gbmVlZHMgd2VsbC1kcmFpbmVkIHNvaWwgcmljaCBpbiBvcmdhbmljIG1hdHRlci4gQXZvaWQgd2F0ZXJsb2dnaW5nLlwiXHJcbiAgICB9O1xyXG4gIH1cclxuICBpZiAobG93ZXIuaW5jbHVkZXMoXCJwb3RhdG9cIikpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFwiU2FuZHkgTG9hbVwiLFxyXG4gICAgICBwaDogXCI0LjggLSA1LjVcIixcclxuICAgICAgbW9pc3R1cmU6IFwiQ29uc2lzdGVudFwiLFxyXG4gICAgICB0ZW1wZXJhdHVyZTogXCIxNS0yMFx1MDBCMENcIixcclxuICAgICAgbm90ZXM6IFwiUG90YXRvZXMgcHJlZmVyIGxvb3NlIHNvaWwgZm9yIHR1YmVyIGRldmVsb3BtZW50LiBNb25pdG9yIG1vaXN0dXJlIHRvIHByZXZlbnQgcm90LlwiXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICAvLyBEZWZhdWx0IC8gR2VuZXJpY1xyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiBcIkxvYW15IChHZW5lcmljKVwiLFxyXG4gICAgcGg6IFwiNi4wIC0gNy4wXCIsXHJcbiAgICBtb2lzdHVyZTogXCJNb2RlcmF0ZVwiLFxyXG4gICAgdGVtcGVyYXR1cmU6IFwiMjAtMjVcdTAwQjBDXCIsXHJcbiAgICBub3RlczogXCJHZW5lcmFsIGJlc3QgY29uZGl0aW9ucyBmb3IgbW9zdCBjcm9wcy4gVGVzdCBzb2lsIGZvciBzcGVjaWZpYyBuZWVkcy5cIlxyXG4gIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJ1bkh1Z2dpbmdGYWNlKGltYWdlOiBCdWZmZXIpIHtcclxuICBjb25zdCB0b2tlbiA9IHByb2Nlc3MuZW52LkhGX1RPS0VOIHx8IHByb2Nlc3MuZW52LkhVR0dJTkdGQUNFX1RPS0VOO1xyXG4gIGNvbnN0IG1vZGVsID0gcHJvY2Vzcy5lbnYuSEZfTU9ERUwgfHwgXCJtaWNyb3NvZnQvcmVzbmV0LTUwXCI7IC8vIGdlbmVyaWMgaW1hZ2UgY2xhc3NpZmllclxyXG4gIGlmICghdG9rZW4pIHJldHVybiBudWxsO1xyXG4gIGNvbnN0IHVybCA9IGBodHRwczovL2FwaS1pbmZlcmVuY2UuaHVnZ2luZ2ZhY2UuY28vbW9kZWxzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KG1vZGVsKX1gO1xyXG4gIGNvbnN0IGhlYWRlcnM6IEhlYWRlcnNJbml0ID0ge1xyXG4gICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAsXHJcbiAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxyXG4gIH07XHJcbiAgY29uc3QgcmVzID0gYXdhaXQgcmV0cnkoXHJcbiAgICAoKSA9PlxyXG4gICAgICBmZXRjaFdpdGhUaW1lb3V0KFxyXG4gICAgICAgIHVybCxcclxuICAgICAgICB7IG1ldGhvZDogXCJQT1NUXCIsIGhlYWRlcnMsIGJvZHk6IGltYWdlIGFzIGFueSB9LFxyXG4gICAgICAgIDEyMDAwLFxyXG4gICAgICApLFxyXG4gICAgMixcclxuICAgIDUwMCxcclxuICApO1xyXG4gIGlmICghcmVzLm9rKSByZXR1cm4gbnVsbDtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XHJcbiAgICAvLyBIRiByZXR1cm5zIGFuIGFycmF5IG9mIHsgbGFiZWwsIHNjb3JlIH1cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICAgIHJldHVybiBkYXRhXHJcbiAgICAgICAgLnNsaWNlKDAsIDUpXHJcbiAgICAgICAgLm1hcCgoZDogYW55KSA9PiAoeyBjbGFzc05hbWU6IGQubGFiZWwsIHByb2JhYmlsaXR5OiBkLnNjb3JlIH0pKTtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBydW5Mb2NhbEFJU2VydmljZShmaWxlOiBhbnkpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbZmlsZS5idWZmZXJdLCB7IHR5cGU6IGZpbGUubWltZXR5cGUgfSk7XHJcbiAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlXCIsIGJsb2IsIGZpbGUub3JpZ2luYWxuYW1lKTtcclxuXHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9wcmVkaWN0L2Rpc2Vhc2VcIiwge1xyXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICBib2R5OiBmb3JtRGF0YSxcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChyZXMub2spIHtcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XHJcbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gZGF0YS5hbmFseXNpcyB8fCB7fTtcclxuICAgICAgXHJcbiAgICAgIC8vIE1hcCBhbmFseXNpcyB0byBwcmVkaWN0aW9ucyBmb3JtYXQgZm9yIGZyb250ZW5kIChTb2lsIEFuYWx5c2lzKVxyXG4gICAgICAvLyBUaGUgZnJvbnRlbmQgZGlzcGxheXMgXCJjbGFzc05hbWVcIiBhbmQgXCJwcm9iYWJpbGl0eVwiIChhcyBwZXJjZW50YWdlKVxyXG4gICAgICBjb25zdCBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICB7IGNsYXNzTmFtZTogYFN0YXR1czogJHthbmFseXNpcy5zdGF0dXMgfHwgJ1Vua25vd24nfWAsIHByb2JhYmlsaXR5OiAxIH0sXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IGBUeXBlOiAke2FuYWx5c2lzLmRpc2Vhc2UgfHwgJ0dlbmVyYWwnfWAsIHByb2JhYmlsaXR5OiAxIH0sXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IGBEZXRhaWxzOiAke2FuYWx5c2lzLnJlY29tbWVuZGF0aW9uIHx8ICdObyBkZXRhaWxzJ31gLCBwcm9iYWJpbGl0eTogMSB9XHJcbiAgICAgIF07XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNvdXJjZTogXCJsb2NhbC1haS1zZXJ2aWNlXCIsXHJcbiAgICAgICAgcHJlZGljdGlvbnMsXHJcbiAgICAgICAgYW5hbHlzaXM6IGRhdGEuYW5hbHlzaXMsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiTG9jYWwgQUkgc2VydmljZSB1bnJlYWNoYWJsZSwgdXNpbmcgZmFsbGJhY2tcIik7XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgcHJlZGljdEhhbmRsZXI6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgY29uc3QgZmlsZSA9IChyZXEgYXMgYW55KS5maWxlO1xyXG4gIGlmICghZmlsZSkgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmlsZSByZXF1aXJlZFwiIH0pO1xyXG5cclxuICBsZXQgcHJlZGljdGlvbnM6IHsgY2xhc3NOYW1lOiBzdHJpbmc7IHByb2JhYmlsaXR5OiBudW1iZXIgfVtdID0gW107XHJcbiAgbGV0IHNvdXJjZSA9IFwic2VydmVyLW1vY2tcIjtcclxuICBcclxuICAvLyAxLiBUcnkgTG9jYWwgUHl0aG9uIEFJIFNlcnZpY2VcclxuICBjb25zdCBsb2NhbFJlc3VsdCA9IGF3YWl0IHJ1bkxvY2FsQUlTZXJ2aWNlKGZpbGUpO1xyXG5cclxuICBpZiAobG9jYWxSZXN1bHQgJiYgbG9jYWxSZXN1bHQucHJlZGljdGlvbnMpIHtcclxuICAgIHNvdXJjZSA9IGxvY2FsUmVzdWx0LnNvdXJjZTtcclxuICAgIHByZWRpY3Rpb25zID0gbG9jYWxSZXN1bHQucHJlZGljdGlvbnM7XHJcbiAgfSBlbHNlIGlmIChsb2NhbFJlc3VsdCAmJiBsb2NhbFJlc3VsdC5hbmFseXNpcykge1xyXG4gICAgIC8vIEZhbGxiYWNrIGlmIHByZWRpY3Rpb25zIHdlcmUgbm90IHByZS1jYWxjdWxhdGVkIChzaG91bGRuJ3QgaGFwcGVuIHdpdGggbmV3IGxvZ2ljKVxyXG4gICAgIHNvdXJjZSA9IFwibG9jYWwtYWktc2VydmljZVwiO1xyXG4gICAgIGlmIChsb2NhbFJlc3VsdC5hbmFseXNpcy5kaXNlYXNlKSB7XHJcbiAgICAgICBwcmVkaWN0aW9ucyA9IFt7XHJcbiAgICAgICAgIGNsYXNzTmFtZTogbG9jYWxSZXN1bHQuYW5hbHlzaXMuZGlzZWFzZSxcclxuICAgICAgICAgcHJvYmFiaWxpdHk6IGxvY2FsUmVzdWx0LmFuYWx5c2lzLmNvbmZpZGVuY2VcclxuICAgICAgIH1dO1xyXG4gICAgIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIFRyeSBIdWdnaW5nIEZhY2UgKGlmIGxvY2FsIGZhaWxlZClcclxuICBlbHNlIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGhmID0gYXdhaXQgcnVuSHVnZ2luZ0ZhY2UoZmlsZS5idWZmZXIgYXMgQnVmZmVyKTtcclxuICAgICAgaWYgKGhmKSB7XHJcbiAgICAgICAgc291cmNlID0gXCJodWdnaW5nZmFjZVwiO1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gaGY7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggeyB9XHJcbiAgfVxyXG5cclxuICAvLyAzLiBGYWxsYmFjayBNb2NrIExvZ2ljIChpZiBvdGhlcnMgZmFpbGVkIG9yIHJldHVybmVkIG5vdGhpbmcpXHJcbiAgaWYgKHByZWRpY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgY29uc3QgbmFtZSA9IGZpbGUub3JpZ2luYWxuYW1lIHx8IFwiaW1hZ2UuanBnXCI7XHJcbiAgICBjb25zdCBsb3dlciA9IG5hbWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAvLyBSaWNlXHJcbiAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJyaWNlXCIpIHx8IGxvd2VyLmluY2x1ZGVzKFwicGFkZHlcIikpIHtcclxuICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiYmxhc3RcIikpIHtcclxuICAgICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIlJpY2UgQmxhc3RcIiwgcHJvYmFiaWxpdHk6IDAuOTIgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkJyb3duIFNwb3RcIiwgcHJvYmFiaWxpdHk6IDAuMDUgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgUmljZVwiLCBwcm9iYWJpbGl0eTogMC4wMyB9LFxyXG4gICAgICAgIF07XHJcbiAgICAgIH0gZWxzZSBpZiAobG93ZXIuaW5jbHVkZXMoXCJicm93blwiKSkge1xyXG4gICAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiQnJvd24gU3BvdFwiLCBwcm9iYWJpbGl0eTogMC44OCB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiUmljZSBCbGFzdFwiLCBwcm9iYWJpbGl0eTogMC4wOCB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBSaWNlXCIsIHByb2JhYmlsaXR5OiAwLjA0IH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgUmljZVwiLCBwcm9iYWJpbGl0eTogMC45NSB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiRGVmaWNpZW5jeSAoWmluYylcIiwgcHJvYmFiaWxpdHk6IDAuMDMgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIlJpY2UgQmxhc3RcIiwgcHJvYmFiaWxpdHk6IDAuMDIgfSxcclxuICAgICAgICBdO1xyXG4gICAgICB9XHJcbiAgICB9IFxyXG4gICAgLy8gQ29ybiAvIE1haXplXHJcbiAgICBlbHNlIGlmIChsb3dlci5pbmNsdWRlcyhcImNvcm5cIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJtYWl6ZVwiKSkge1xyXG4gICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJydXN0XCIpKSB7XHJcbiAgICAgICAgcHJlZGljdGlvbnMgPSBbXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJDb21tb24gUnVzdFwiLCBwcm9iYWJpbGl0eTogMC45NCB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiR3JheSBMZWFmIFNwb3RcIiwgcHJvYmFiaWxpdHk6IDAuMDQgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgQ29yblwiLCBwcm9iYWJpbGl0eTogMC4wMiB9LFxyXG4gICAgICAgIF07XHJcbiAgICAgIH0gZWxzZSBpZiAobG93ZXIuaW5jbHVkZXMoXCJibGlnaHRcIikpIHtcclxuICAgICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIk5vcnRoZXJuIENvcm4gTGVhZiBCbGlnaHRcIiwgcHJvYmFiaWxpdHk6IDAuOTEgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkNvbW1vbiBSdXN0XCIsIHByb2JhYmlsaXR5OiAwLjA2IH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJIZWFsdGh5IENvcm5cIiwgcHJvYmFiaWxpdHk6IDAuMDMgfSxcclxuICAgICAgICBdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgQ29yblwiLCBwcm9iYWJpbGl0eTogMC45NiB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiQ29tbW9uIFJ1c3RcIiwgcHJvYmFiaWxpdHk6IDAuMDMgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkdyYXkgTGVhZiBTcG90XCIsIHByb2JhYmlsaXR5OiAwLjAxIH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gUG90YXRvXHJcbiAgICBlbHNlIGlmIChsb3dlci5pbmNsdWRlcyhcInBvdGF0b1wiKSkge1xyXG4gICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiZWFybHlcIikpIHtcclxuICAgICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkVhcmx5IEJsaWdodFwiLCBwcm9iYWJpbGl0eTogMC44OSB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiTGF0ZSBCbGlnaHRcIiwgcHJvYmFiaWxpdHk6IDAuMDcgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgUG90YXRvXCIsIHByb2JhYmlsaXR5OiAwLjA0IH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgfSBlbHNlIGlmIChsb3dlci5pbmNsdWRlcyhcImxhdGVcIikpIHtcclxuICAgICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkxhdGUgQmxpZ2h0XCIsIHByb2JhYmlsaXR5OiAwLjkzIH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJFYXJseSBCbGlnaHRcIiwgcHJvYmFiaWxpdHk6IDAuMDUgfSxcclxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgUG90YXRvXCIsIHByb2JhYmlsaXR5OiAwLjAyIH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgcHJlZGljdGlvbnMgPSBbXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJIZWFsdGh5IFBvdGF0b1wiLCBwcm9iYWJpbGl0eTogMC45NyB9LFxyXG4gICAgICAgICAgeyBjbGFzc05hbWU6IFwiRWFybHkgQmxpZ2h0XCIsIHByb2JhYmlsaXR5OiAwLjAyIH0sXHJcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJMYXRlIEJsaWdodFwiLCBwcm9iYWJpbGl0eTogMC4wMSB9LFxyXG4gICAgICAgIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEdlbmVyaWMgLyBEZWZhdWx0XHJcbiAgICBlbHNlIGlmIChcclxuICAgICAgbG93ZXIuaW5jbHVkZXMoXCJibGlnaHRcIikgfHxcclxuICAgICAgbG93ZXIuaW5jbHVkZXMoXCJmdW5ndXNcIikgfHxcclxuICAgICAgbG93ZXIuaW5jbHVkZXMoXCJsZWFmXCIpXHJcbiAgICApIHtcclxuICAgICAgcHJlZGljdGlvbnMgPSBbXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiTGVhZiBibGlnaHQgKGFwcHJveClcIiwgcHJvYmFiaWxpdHk6IDAuODYgfSxcclxuICAgICAgICB7IGNsYXNzTmFtZTogXCJTZXB0b3JpYS1saWtlXCIsIHByb2JhYmlsaXR5OiAwLjA4IH0sXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiSGVhbHRoeSBsZWFmXCIsIHByb2JhYmlsaXR5OiAwLjA2IH0sXHJcbiAgICAgIF07XHJcbiAgICB9IGVsc2UgaWYgKGxvd2VyLmluY2x1ZGVzKFwicnVzdFwiKSkge1xyXG4gICAgICBwcmVkaWN0aW9ucyA9IFtcclxuICAgICAgICB7IGNsYXNzTmFtZTogXCJSdXN0IGRpc2Vhc2UgKGFwcHJveClcIiwgcHJvYmFiaWxpdHk6IDAuNzggfSxcclxuICAgICAgICB7IGNsYXNzTmFtZTogXCJIZWFsdGh5IGxlYWZcIiwgcHJvYmFiaWxpdHk6IDAuMTUgfSxcclxuICAgICAgXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHByZWRpY3Rpb25zID0gW1xyXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcIkhlYWx0aHkgbGVhZlwiLCBwcm9iYWJpbGl0eTogMC43IH0sXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiVW5rbm93blwiLCBwcm9iYWJpbGl0eTogMC4yIH0sXHJcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiU29pbC9CYWNrZ3JvdW5kXCIsIHByb2JhYmlsaXR5OiAwLjA5IH0sXHJcbiAgICAgIF07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBEZXRlcm1pbmUgQ3JvcCBOYW1lIGZvciBTb2lsIEluZm9cclxuICAvLyBJZiB3ZSBoYXZlIGEgZmlsZW5hbWUsIHVzZSB0aGF0LiBJZiBub3QsIGNoZWNrIHRoZSB0b3AgcHJlZGljdGlvbiBjbGFzcyBuYW1lLlxyXG4gIGNvbnN0IG5hbWVUb0NoZWNrID0gZmlsZS5vcmlnaW5hbG5hbWUgKyBcIiBcIiArIChwcmVkaWN0aW9uc1swXT8uY2xhc3NOYW1lIHx8IFwiXCIpO1xyXG4gIGNvbnN0IHNvaWxJbmZvID0gZ2V0U29pbEluZm8obmFtZVRvQ2hlY2spO1xyXG5cclxuICByZXMuanNvbih7XHJcbiAgICBzb3VyY2UsXHJcbiAgICBwcmVkaWN0aW9ucyxcclxuICAgIHNvaWxJbmZvXHJcbiAgfSk7XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxcbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxcbWlkZGxld2FyZVxcXFxhdXRoLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9taWRkbGV3YXJlL2F1dGgudHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciwgUmVxdWVzdCwgUmVzcG9uc2UsIE5leHRGdW5jdGlvbiB9IGZyb20gXCJleHByZXNzXCI7XHJcbmltcG9ydCBqd3QgZnJvbSBcImpzb253ZWJ0b2tlblwiO1xyXG5cclxuY29uc3QgSldUX1NFQ1JFVCA9IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQgfHwgXCJhZ3JpdmVyc2Utc2VjcmV0LWNoYW5nZS1pbi1wcm9kdWN0aW9uXCI7XHJcbmNvbnN0IEpXVF9FWFBJUkVTID0gXCI3ZFwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBBdXRoUGF5bG9hZCB7XHJcbiAgaWQ6IHN0cmluZztcclxuICByb2xlOiBcImZhcm1lclwiIHwgXCJ2ZXRcIiB8IFwiYWRtaW5cIjtcclxuICBuYW1lOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBTaWduIGEgSldUIHRva2VuIGZvciBhIHVzZXIgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNpZ25Ub2tlbihwYXlsb2FkOiBBdXRoUGF5bG9hZCk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGp3dC5zaWduKHBheWxvYWQsIEpXVF9TRUNSRVQsIHsgZXhwaXJlc0luOiBKV1RfRVhQSVJFUyB9KTtcclxufVxyXG5cclxuLyoqIE1pZGRsZXdhcmU6IHZlcmlmeSBKV1QgdG9rZW4gZnJvbSBBdXRob3JpemF0aW9uIGhlYWRlciAqL1xyXG5leHBvcnQgY29uc3QgdmVyaWZ5VG9rZW46IFJlcXVlc3RIYW5kbGVyID0gKHJlcTogYW55LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcclxuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcclxuICBpZiAoIWF1dGhIZWFkZXIgfHwgIWF1dGhIZWFkZXIuc3RhcnRzV2l0aChcIkJlYXJlciBcIikpIHtcclxuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiBcIkF1dGhlbnRpY2F0aW9uIHJlcXVpcmVkLiBQbGVhc2UgbG9naW4uXCIgfSk7XHJcbiAgfVxyXG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5zbGljZSg3KTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZGVjb2RlZCA9IGp3dC52ZXJpZnkodG9rZW4sIEpXVF9TRUNSRVQpIGFzIEF1dGhQYXlsb2FkO1xyXG4gICAgcmVxLnVzZXIgPSBkZWNvZGVkO1xyXG4gICAgbmV4dCgpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiBcIkludmFsaWQgb3IgZXhwaXJlZCB0b2tlbi4gUGxlYXNlIGxvZ2luIGFnYWluLlwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKiBNaWRkbGV3YXJlIGZhY3Rvcnk6IHJlcXVpcmUgYSBzcGVjaWZpYyByb2xlIChvciBhbnkgb2YgbXVsdGlwbGUgcm9sZXMpICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlUm9sZSguLi5yb2xlczogc3RyaW5nW10pOiBSZXF1ZXN0SGFuZGxlciB7XHJcbiAgcmV0dXJuIChyZXE6IGFueSwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBpZiAoIXJlcS51c2VyKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiBcIkF1dGhlbnRpY2F0aW9uIHJlcXVpcmVkLlwiIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKCFyb2xlcy5pbmNsdWRlcyhyZXEudXNlci5yb2xlKSkge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLmpzb24oe1xyXG4gICAgICAgIGVycm9yOiBgQWNjZXNzIGRlbmllZC4gUmVxdWlyZWQgcm9sZTogJHtyb2xlcy5qb2luKFwiIG9yIFwiKX0uIFlvdXIgcm9sZTogJHtyZXEudXNlci5yb2xlfWAsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgbmV4dCgpO1xyXG4gIH07XHJcbn1cclxuXHJcbi8qKiBPcHRpb25hbCBhdXRoIFx1MjAxNCBhdHRhY2hlcyB1c2VyIGlmIHRva2VuIHByZXNlbnQgYnV0IGRvZXMgbm90IGJsb2NrICovXHJcbmV4cG9ydCBjb25zdCBvcHRpb25hbEF1dGg6IFJlcXVlc3RIYW5kbGVyID0gKHJlcTogYW55LCBfcmVzLCBuZXh0KSA9PiB7XHJcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb247XHJcbiAgaWYgKGF1dGhIZWFkZXIgJiYgYXV0aEhlYWRlci5zdGFydHNXaXRoKFwiQmVhcmVyIFwiKSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmVxLnVzZXIgPSBqd3QudmVyaWZ5KGF1dGhIZWFkZXIuc2xpY2UoNyksIEpXVF9TRUNSRVQpIGFzIEF1dGhQYXlsb2FkO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIGlnbm9yZSBpbnZhbGlkIHRva2VuIFx1MjAxNCB0cmVhdCBhcyBndWVzdFxyXG4gICAgfVxyXG4gIH1cclxuICBuZXh0KCk7XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcYXV0aC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL2F1dGgudHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcbmltcG9ydCB7IEZhcm1lciB9IGZyb20gXCIuLi9kYlwiO1xyXG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xyXG5pbXBvcnQgeyBzaWduVG9rZW4gfSBmcm9tIFwiLi4vbWlkZGxld2FyZS9hdXRoXCI7XHJcblxyXG4vLyAtLSBSRUdJU1RFUiAtLVxyXG5leHBvcnQgY29uc3QgcmVnaXN0ZXI6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgbmFtZSwgZW1haWwsIHBhc3N3b3JkLCBwaG9uZSwgc29pbFR5cGUsIGxhbmRTaXplLCBsYW5ndWFnZSwgbG9jYXRpb24sIHJvbGUgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgIGlmICghbmFtZSB8fCAhZW1haWwgfHwgIXBhc3N3b3JkIHx8ICFwaG9uZSkge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJOYW1lLCBlbWFpbCwgcGFzc3dvcmQsIGFuZCBwaG9uZSBhcmUgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IEZhcm1lci5maW5kT25lKHsgZW1haWwgfSk7XHJcbiAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiVXNlciB3aXRoIHRoaXMgZW1haWwgYWxyZWFkeSBleGlzdHNcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMCk7XHJcbiAgICBjb25zdCBuZXdGYXJtZXIgPSBhd2FpdCBGYXJtZXIuY3JlYXRlKHtcclxuICAgICAgbmFtZSwgZW1haWwsIHBhc3N3b3JkOiBoYXNoZWRQYXNzd29yZCwgcGhvbmUsXHJcbiAgICAgIHNvaWxUeXBlLCBsYW5kU2l6ZSwgbGFuZ3VhZ2U6IGxhbmd1YWdlIHx8IFwiZW4tSU5cIixcclxuICAgICAgbG9jYXRpb24sIHJvbGU6IHJvbGUgfHwgXCJmYXJtZXJcIixcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHBsYWluID0gbmV3RmFybWVyLnRvT2JqZWN0ID8gbmV3RmFybWVyLnRvT2JqZWN0KCkgOiB7IC4uLm5ld0Zhcm1lciB9O1xyXG4gICAgY29uc3QgeyBwYXNzd29yZDogXywgLi4udXNlcldpdGhvdXRQYXNzd29yZCB9ID0gcGxhaW47XHJcblxyXG4gICAgY29uc3QgdG9rZW4gPSBzaWduVG9rZW4oeyBpZDogU3RyaW5nKHBsYWluLl9pZCksIHJvbGU6IHBsYWluLnJvbGUgfHwgXCJmYXJtZXJcIiwgbmFtZTogcGxhaW4ubmFtZSB9KTtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHsgdXNlcjogdXNlcldpdGhvdXRQYXNzd29yZCwgdG9rZW4gfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthdXRoXSBSZWdpc3RlciBlcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIlJlZ2lzdHJhdGlvbiBmYWlsZWRcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG4vLyAtLSBMT0dJTiAtLVxyXG5leHBvcnQgY29uc3QgbG9naW46IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSByZXEuYm9keTtcclxuICAgIGlmICghZW1haWwgfHwgIXBhc3N3b3JkKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIkVtYWlsIGFuZCBwYXNzd29yZCBhcmUgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmYXJtZXIgPSBhd2FpdCBGYXJtZXIuZmluZE9uZSh7IGVtYWlsIH0pO1xyXG4gICAgaWYgKCFmYXJtZXIpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6IFwiSW52YWxpZCBjcmVkZW50aWFsc1wiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmYXJtZXIucGFzc3dvcmQpIHtcclxuICAgICAgY29uc3QgbWF0Y2ggPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgZmFybWVyLnBhc3N3b3JkKTtcclxuICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIiB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiUGxlYXNlIHVzZSBwaG9uZSBsb2dpbiBvciByZXNldCBwYXNzd29yZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBsYWluID0gZmFybWVyLnRvT2JqZWN0ID8gZmFybWVyLnRvT2JqZWN0KCkgOiB7IC4uLmZhcm1lciB9O1xyXG4gICAgY29uc3QgeyBwYXNzd29yZDogXywgLi4udXNlcldpdGhvdXRQYXNzd29yZCB9ID0gcGxhaW47XHJcblxyXG4gICAgY29uc3QgdG9rZW4gPSBzaWduVG9rZW4oeyBpZDogU3RyaW5nKHBsYWluLl9pZCksIHJvbGU6IHBsYWluLnJvbGUgfHwgXCJmYXJtZXJcIiwgbmFtZTogcGxhaW4ubmFtZSB9KTtcclxuICAgIHJlcy5qc29uKHsgdXNlcjogdXNlcldpdGhvdXRQYXNzd29yZCwgdG9rZW4gfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthdXRoXSBMb2dpbiBlcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkxvZ2luIGZhaWxlZFwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIC0tIExFR0FDWSBVUFNFUlQgKGJhY2t3YXJkIGNvbXBhdCkgLS1cclxuZXhwb3J0IGNvbnN0IHVwc2VydEZhcm1lcjogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBuYW1lLCBwaG9uZSwgc29pbFR5cGUsIGxhbmRTaXplLCBsYW5ndWFnZSwgbG9jYXRpb24gfSA9IHJlcS5ib2R5IGFzIGFueTtcclxuICAgIGlmICghbmFtZSB8fCAhcGhvbmUpXHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIm5hbWUgYW5kIHBob25lIHJlcXVpcmVkXCIgfSk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlRGF0YSA9IHsgbmFtZSwgcGhvbmUsIHNvaWxUeXBlLCBsYW5kU2l6ZSwgbGFuZ3VhZ2UsIGxvY2F0aW9uIH07XHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgRmFybWVyLmZpbmRPbmVBbmRVcGRhdGUoeyBwaG9uZSB9LCB1cGRhdGVEYXRhLCB7IG5ldzogdHJ1ZSwgdXBzZXJ0OiB0cnVlIH0pO1xyXG4gICAgcmVzLmpzb24oZGF0YSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthdXRoXSBVbmV4cGVjdGVkIGVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiYXV0aCBlcnJvclwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIC0tIEdVRVNUIExPR0lOIC0tXHJcbmV4cG9ydCBjb25zdCBndWVzdExvZ2luOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBndWVzdCA9IHtcclxuICAgICAgaWQ6IFwiZ3Vlc3RfXCIgKyBEYXRlLm5vdygpLFxyXG4gICAgICBuYW1lOiBcIkd1ZXN0IFVzZXJcIixcclxuICAgICAgcGhvbmU6IHVuZGVmaW5lZCxcclxuICAgICAgbGFuZ3VhZ2U6IHJlcS5ib2R5Py5sYW5ndWFnZSB8fCBcImVuLUlOXCIsXHJcbiAgICAgIGlzR3Vlc3Q6IHRydWUsXHJcbiAgICAgIHJvbGU6IFwiZmFybWVyXCIsXHJcbiAgICB9O1xyXG4gICAgLy8gTm8gSldUIGZvciBndWVzdCBcdTIwMTQgY2xpZW50IHVzZXMgZ3Vlc3Qgb2JqZWN0IGFzLWlzXHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oZ3Vlc3QpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJHdWVzdCBsb2dpbiBlcnJvcjpcIiwgZSk7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJndWVzdCBsb2dpbiBlcnJvclwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIC0tIERFQlVHIChkZXYgb25seSkgLS1cclxuZXhwb3J0IGNvbnN0IGdldERlYnVnVXNlcnM6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKF9yZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1c2VycyA9IChhd2FpdCBGYXJtZXIuZmluZCh7fSkpIGFzIGFueVtdO1xyXG4gICAgY29uc3Qgc2FmZSA9IHVzZXJzLm1hcCgodSkgPT4ge1xyXG4gICAgICBjb25zdCBvYmogPSB1LnRvT2JqZWN0ID8gdS50b09iamVjdCgpIDogeyAuLi51IH07XHJcbiAgICAgIGRlbGV0ZSBvYmoucGFzc3dvcmQ7XHJcbiAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9KTtcclxuICAgIHJlcy5qc29uKHNhZmUpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYXV0aF0gRGVidWcgdXNlcnMgZXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZmV0Y2ggdXNlcnNcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZGVsZXRlRGVidWdVc2VyOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgYXdhaXQgRmFybWVyLmZpbmRCeUlkQW5kRGVsZXRlKGlkKTtcclxuICAgIHJlcy5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2F1dGhdIERlbGV0ZSB1c2VyIGVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGRlbGV0ZSB1c2VyXCIgfSk7XHJcbiAgfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXHByb2ZpbGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9wcm9maWxlLnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBBZHZpc29yeUhpc3RvcnksIEZhcm1lciB9IGZyb20gXCIuLi9kYlwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHNhdmVBZHZpc29yeUhpc3Rvcnk6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZmFybWVySWQsIGNyb3AsIGFkdmlzb3J5LCB3ZWF0aGVyRGF0YSwgc29pbERhdGEgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgIGlmICghZmFybWVySWQgfHwgIWNyb3AgfHwgIWFkdmlzb3J5KSB7XHJcbiAgICAgIHJldHVybiByZXNcclxuICAgICAgICAuc3RhdHVzKDQwMClcclxuICAgICAgICAuanNvbih7IGVycm9yOiBcImZhcm1lcklkLCBjcm9wLCBhbmQgYWR2aXNvcnkgYXJlIHJlcXVpcmVkXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEFkdmlzb3J5SGlzdG9yeS5jcmVhdGUoe1xyXG4gICAgICBmYXJtZXJJZCxcclxuICAgICAgY3JvcCxcclxuICAgICAgYWR2aXNvcnksXHJcbiAgICAgIHdlYXRoZXJEYXRhLFxyXG4gICAgICBzb2lsRGF0YSxcclxuICAgIH0pO1xyXG5cclxuICAgIHJlcy5qc29uKGRhdGEpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbcHJvZmlsZV0gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gc2F2ZSBhZHZpc29yeVwiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRBZHZpc29yeUhpc3Rvcnk6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZmFybWVySWQgfSA9IHJlcS5wYXJhbXM7XHJcbiAgICBjb25zdCBsaW1pdCA9IE51bWJlcihyZXEucXVlcnkubGltaXQgfHwgMTApO1xyXG5cclxuICAgIGlmICghZmFybWVySWQpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgaXMgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgQWR2aXNvcnlIaXN0b3J5LmZpbmQoeyBmYXJtZXJJZCB9KVxyXG4gICAgICAuc29ydCh7IGNyZWF0ZWRBdDogLTEgfSlcclxuICAgICAgLmxpbWl0KGxpbWl0KTtcclxuXHJcbiAgICByZXMuanNvbihkYXRhIHx8IFtdKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW3Byb2ZpbGVdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIGhpc3RvcnlcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UHJvZmlsZURhdGE6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgZmFybWVySWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gICAgaWYgKCFmYXJtZXJJZCkge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJmYXJtZXJJZCBpcyByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBGYXJtZXIuZmluZEJ5SWQoZmFybWVySWQpO1xyXG5cclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiW3Byb2ZpbGVdIEZhcm1lciBub3QgZm91bmRcIik7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiBcIkZhcm1lciBub3QgZm91bmRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuanNvbih7XHJcbiAgICAgIC4uLmRhdGEsXHJcbiAgICAgIHN1YnNjcmlwdGlvblN0YXR1czogZGF0YS5zdWJzY3JpcHRpb25TdGF0dXMgfHwgXCJmcmVlXCIsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW3Byb2ZpbGVdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIHByb2ZpbGVcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlU3Vic2NyaXB0aW9uOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGZhcm1lcklkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgY29uc3QgeyBzdWJzY3JpcHRpb25TdGF0dXMgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgIGlmICghZmFybWVySWQpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgaXMgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIVtcImZyZWVcIiwgXCJwcmVtaXVtXCJdLmluY2x1ZGVzKHN1YnNjcmlwdGlvblN0YXR1cykpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiSW52YWxpZCBzdWJzY3JpcHRpb24gc3RhdHVzXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kRGF0ZS5zZXRGdWxsWWVhcihlbmREYXRlLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVQYXlsb2FkOiBhbnkgPSB7XHJcbiAgICAgIHN1YnNjcmlwdGlvblN0YXR1cyxcclxuICAgICAgc3Vic2NyaXB0aW9uU3RhcnREYXRlOiBub3csXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChzdWJzY3JpcHRpb25TdGF0dXMgPT09IFwicHJlbWl1bVwiKSB7XHJcbiAgICAgIHVwZGF0ZVBheWxvYWQuc3Vic2NyaXB0aW9uRW5kRGF0ZSA9IGVuZERhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEZhcm1lci5maW5kQnlJZEFuZFVwZGF0ZShmYXJtZXJJZCwgdXBkYXRlUGF5bG9hZCwge1xyXG4gICAgICBuZXc6IHRydWUsXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIltwcm9maWxlXSBGYXJtZXIgbm90IGZvdW5kXCIpO1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJGYXJtZXIgbm90IGZvdW5kXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLmpzb24oZGF0YSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIltwcm9maWxlXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byB1cGRhdGUgc3Vic2NyaXB0aW9uXCIgfSk7XHJcbiAgfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXFxcXGFuYWx5dGljcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL2FuYWx5dGljcy50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IHsgQW5hbHl0aWNzRGF0YSwgQWR2aXNvcnlIaXN0b3J5LCBGYXJtZXIgfSBmcm9tIFwiLi4vZGJcIjtcclxuXHJcbmV4cG9ydCBjb25zdCByZWNvcmRBbmFseXRpY3M6IFJlcXVlc3RIYW5kbGVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgZmFybWVySWQsXHJcbiAgICAgIGNyb3AsXHJcbiAgICAgIGNyb3BIZWFsdGhTY29yZSxcclxuICAgICAgc29pbE1vaXN0dXJlLFxyXG4gICAgICBzb2lsTml0cm9nZW4sXHJcbiAgICAgIHNvaWxQSCxcclxuICAgICAgdGVtcGVyYXR1cmUsXHJcbiAgICAgIGh1bWlkaXR5LFxyXG4gICAgICByYWluZmFsbCxcclxuICAgICAgcGVzdFByZXNzdXJlLFxyXG4gICAgICBkaXNlYXNlUmlzayxcclxuICAgIH0gPSByZXEuYm9keTtcclxuXHJcbiAgICBpZiAoIWZhcm1lcklkIHx8ICFjcm9wKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcImZhcm1lcklkIGFuZCBjcm9wIGFyZSByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBBbmFseXRpY3NEYXRhLmNyZWF0ZSh7XHJcbiAgICAgIGZhcm1lcklkLFxyXG4gICAgICBjcm9wLFxyXG4gICAgICBjcm9wSGVhbHRoU2NvcmUsXHJcbiAgICAgIHNvaWxNb2lzdHVyZSxcclxuICAgICAgc29pbE5pdHJvZ2VuLFxyXG4gICAgICBzb2lsUEgsXHJcbiAgICAgIHRlbXBlcmF0dXJlLFxyXG4gICAgICBodW1pZGl0eSxcclxuICAgICAgcmFpbmZhbGwsXHJcbiAgICAgIHBlc3RQcmVzc3VyZSxcclxuICAgICAgZGlzZWFzZVJpc2ssXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXMuanNvbihkYXRhKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2FuYWx5dGljc10gRXJyb3I6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gcmVjb3JkIGFuYWx5dGljc1wiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRBbmFseXRpY3NTdW1tYXJ5OiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGZhcm1lcklkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgY29uc3QgZGF5cyA9IE51bWJlcihyZXEucXVlcnkuZGF5cyB8fCAzMCk7XHJcblxyXG4gICAgaWYgKCFmYXJtZXJJZCkge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJmYXJtZXJJZCBpcyByZXF1aXJlZFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGN1dG9mZkRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY3V0b2ZmRGF0ZS5zZXREYXRlKGN1dG9mZkRhdGUuZ2V0RGF0ZSgpIC0gZGF5cyk7XHJcblxyXG4gICAgY29uc3QgYWxsQW5hbHl0aWNzID0gYXdhaXQgQW5hbHl0aWNzRGF0YS5maW5kKHtcclxuICAgICAgZmFybWVySWQsXHJcbiAgICAgIGNyZWF0ZWRBdDogeyAkZ3RlOiBjdXRvZmZEYXRlIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBhZHZpc29yaWVzID0gYXdhaXQgQWR2aXNvcnlIaXN0b3J5LmZpbmQoeyBmYXJtZXJJZCB9KTtcclxuXHJcbiAgICBjb25zdCByZWNlbnREYXRhID0gYWxsQW5hbHl0aWNzIHx8IFtdO1xyXG4gICAgY29uc3QgY3JvcFN0YXRzID0gbmV3IE1hcDxzdHJpbmcsIHsgY291bnQ6IG51bWJlcjsgc2NvcmVzOiBudW1iZXJbXSB9PigpO1xyXG5cclxuICAgIChhZHZpc29yaWVzIHx8IFtdKS5mb3JFYWNoKChhZHY6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoIWNyb3BTdGF0cy5oYXMoYWR2LmNyb3ApKSB7XHJcbiAgICAgICAgY3JvcFN0YXRzLnNldChhZHYuY3JvcCwgeyBjb3VudDogMCwgc2NvcmVzOiBbXSB9KTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBzdGF0cyA9IGNyb3BTdGF0cy5nZXQoYWR2LmNyb3ApITtcclxuICAgICAgc3RhdHMuY291bnQrKztcclxuICAgICAgc3RhdHMuc2NvcmVzLnB1c2goTWF0aC5yYW5kb20oKSAqIDMwICsgNzApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY3JvcFBlcmZvcm1hbmNlID0gQXJyYXkuZnJvbShjcm9wU3RhdHMuZW50cmllcygpKS5tYXAoXHJcbiAgICAgIChbY3JvcCwgc3RhdHNdKSA9PiAoe1xyXG4gICAgICAgIGNyb3AsXHJcbiAgICAgICAgY291bnQ6IHN0YXRzLmNvdW50LFxyXG4gICAgICAgIGF2Z1Njb3JlOlxyXG4gICAgICAgICAgc3RhdHMuc2NvcmVzLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgPyBzdGF0cy5zY29yZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyBzdGF0cy5zY29yZXMubGVuZ3RoXHJcbiAgICAgICAgICAgIDogMCxcclxuICAgICAgfSksXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNvaWxIZWFsdGhUcmVuZCA9IChyZWNlbnREYXRhIGFzIGFueVtdKVxyXG4gICAgICAuZmlsdGVyKFxyXG4gICAgICAgIChkOiBhbnkpID0+XHJcbiAgICAgICAgICBkLnNvaWxNb2lzdHVyZSAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICBkLnNvaWxOaXRyb2dlbiAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICBkLnNvaWxQSCAhPT0gdW5kZWZpbmVkLFxyXG4gICAgICApXHJcbiAgICAgIC5zbGljZSgtNylcclxuICAgICAgLm1hcCgoZDogYW55KSA9PiAoe1xyXG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKGQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICBtb2lzdHVyZTogZC5zb2lsTW9pc3R1cmUgfHwgTWF0aC5yYW5kb20oKSAqIDEwMCxcclxuICAgICAgICBuaXRyb2dlbjogZC5zb2lsTml0cm9nZW4gfHwgTWF0aC5yYW5kb20oKSAqIDEwMCxcclxuICAgICAgICBwSDogZC5zb2lsUEggfHwgNSArIE1hdGgucmFuZG9tKCkgKiAzLFxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgaWYgKHNvaWxIZWFsdGhUcmVuZC5sZW5ndGggPT09IDApIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDY7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gaSk7XHJcbiAgICAgICAgc29pbEhlYWx0aFRyZW5kLnB1c2goe1xyXG4gICAgICAgICAgZGF0ZTogZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICAgIG1vaXN0dXJlOiA0MCArIE1hdGgucmFuZG9tKCkgKiA0MCxcclxuICAgICAgICAgIG5pdHJvZ2VuOiAzMCArIE1hdGgucmFuZG9tKCkgKiA1MCxcclxuICAgICAgICAgIHBIOiA2ICsgTWF0aC5yYW5kb20oKSAqIDEuNSxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRlbXBzID0gcmVjZW50RGF0YVxyXG4gICAgICAuZmlsdGVyKChkOiBhbnkpID0+IGQudGVtcGVyYXR1cmUgIT09IHVuZGVmaW5lZClcclxuICAgICAgLm1hcCgoZDogYW55KSA9PiBkLnRlbXBlcmF0dXJlIGFzIG51bWJlcik7XHJcbiAgICBjb25zdCBodW1pZGl0aWVzID0gcmVjZW50RGF0YVxyXG4gICAgICAuZmlsdGVyKChkOiBhbnkpID0+IGQuaHVtaWRpdHkgIT09IHVuZGVmaW5lZClcclxuICAgICAgLm1hcCgoZDogYW55KSA9PiBkLmh1bWlkaXR5IGFzIG51bWJlcik7XHJcbiAgICBjb25zdCByYWluZmFsbHMgPSByZWNlbnREYXRhXHJcbiAgICAgIC5maWx0ZXIoKGQ6IGFueSkgPT4gZC5yYWluZmFsbCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAubWFwKChkOiBhbnkpID0+IGQucmFpbmZhbGwgYXMgbnVtYmVyKTtcclxuXHJcbiAgICBjb25zdCB3ZWF0aGVySW1wYWN0ID0ge1xyXG4gICAgICB0ZW1wZXJhdHVyZTpcclxuICAgICAgICB0ZW1wcy5sZW5ndGggPiAwXHJcbiAgICAgICAgICA/IHRlbXBzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gdGVtcHMubGVuZ3RoXHJcbiAgICAgICAgICA6IDI1ICsgTWF0aC5yYW5kb20oKSAqIDE1LFxyXG4gICAgICBodW1pZGl0eTpcclxuICAgICAgICBodW1pZGl0aWVzLmxlbmd0aCA+IDBcclxuICAgICAgICAgID8gaHVtaWRpdGllcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIGh1bWlkaXRpZXMubGVuZ3RoXHJcbiAgICAgICAgICA6IDUwICsgTWF0aC5yYW5kb20oKSAqIDMwLFxyXG4gICAgICByYWluZmFsbDpcclxuICAgICAgICByYWluZmFsbHMubGVuZ3RoID4gMFxyXG4gICAgICAgICAgPyByYWluZmFsbHMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyByYWluZmFsbHMubGVuZ3RoXHJcbiAgICAgICAgICA6IE1hdGgucmFuZG9tKCkgKiA1MCxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcGVzdEFuYWx5c2lzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJBcGhpZHNcIixcclxuICAgICAgICByaXNrOiBNYXRoLnJhbmRvbSgpICogODAsXHJcbiAgICAgICAgZnJlcXVlbmN5OiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1KSArIDEsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcIldoaXRlZmxpZXNcIixcclxuICAgICAgICByaXNrOiBNYXRoLnJhbmRvbSgpICogNjAsXHJcbiAgICAgICAgZnJlcXVlbmN5OiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KSArIDEsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcIkxlYWYgTWluZXJzXCIsXHJcbiAgICAgICAgcmlzazogTWF0aC5yYW5kb20oKSAqIDcwLFxyXG4gICAgICAgIGZyZXF1ZW5jeTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMykgKyAxLFxyXG4gICAgICB9LFxyXG4gICAgXTtcclxuXHJcbiAgICByZXMuanNvbih7XHJcbiAgICAgIHRvdGFsQWR2aXNvcmllczogKGFkdmlzb3JpZXMgfHwgW10pLmxlbmd0aCxcclxuICAgICAgY3JvcFBlcmZvcm1hbmNlLFxyXG4gICAgICBzb2lsSGVhbHRoVHJlbmQsXHJcbiAgICAgIHdlYXRoZXJJbXBhY3QsXHJcbiAgICAgIHBlc3RBbmFseXNpcyxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5hbHl0aWNzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCBhbmFseXRpY3NcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q3JvcFRyZW5kczogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBmYXJtZXJJZCB9ID0gcmVxLnBhcmFtcztcclxuICAgIGNvbnN0IHsgY3JvcCB9ID0gcmVxLnF1ZXJ5O1xyXG5cclxuICAgIGlmICghZmFybWVySWQgfHwgIWNyb3ApIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgYW5kIGNyb3AgYXJlIHJlcXVpcmVkXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEFuYWx5dGljc0RhdGEuZmluZCh7IGZhcm1lcklkLCBjcm9wIH0pXHJcbiAgICAgIC5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pXHJcbiAgICAgIC5saW1pdCgzMCk7XHJcblxyXG4gICAgY29uc3QgdHJlbmRzID0gKGRhdGEgfHwgW10pLnNsaWNlKC0zMCkubWFwKChkOiBhbnkpID0+ICh7XHJcbiAgICAgIGRhdGU6IG5ldyBEYXRlKGQuY3JlYXRlZEF0KS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgaGVhbHRoU2NvcmU6IGQuY3JvcEhlYWx0aFNjb3JlIHx8IDAsXHJcbiAgICAgIHlpZWxkOiBkLnlpZWxkIHx8IDAsXHJcbiAgICAgIHBlc3RQcmVzc3VyZTogZC5wZXN0UHJlc3N1cmUgfHwgMCxcclxuICAgICAgZGlzZWFzZVJpc2s6IGQuZGlzZWFzZVJpc2sgfHwgMCxcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZiAodHJlbmRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSAoMTUgLSBpKSk7XHJcbiAgICAgICAgdHJlbmRzLnB1c2goe1xyXG4gICAgICAgICAgZGF0ZTogZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICAgIGhlYWx0aFNjb3JlOiA2MCArIE1hdGgucmFuZG9tKCkgKiAzNSxcclxuICAgICAgICAgIHlpZWxkOiA1MCArIE1hdGgucmFuZG9tKCkgKiA0MCxcclxuICAgICAgICAgIHBlc3RQcmVzc3VyZTogTWF0aC5yYW5kb20oKSAqIDYwLFxyXG4gICAgICAgICAgZGlzZWFzZVJpc2s6IE1hdGgucmFuZG9tKCkgKiA1MCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcy5qc29uKHRyZW5kcyk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthbmFseXRpY3NdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIGNyb3AgdHJlbmRzXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNvaWxIZWFsdGhUcmVuZDogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBmYXJtZXJJZCB9ID0gcmVxLnBhcmFtcztcclxuXHJcbiAgICBpZiAoIWZhcm1lcklkKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcImZhcm1lcklkIGlzIHJlcXVpcmVkXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IEFuYWx5dGljc0RhdGEuZmluZCh7IGZhcm1lcklkIH0pXHJcbiAgICAgIC5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pXHJcbiAgICAgIC5saW1pdCgzMCk7XHJcblxyXG4gICAgY29uc3QgdHJlbmQgPSAoZGF0YSB8fCBbXSlcclxuICAgICAgLmZpbHRlcihcclxuICAgICAgICAoZDogYW55KSA9PlxyXG4gICAgICAgICAgZC5zb2lsTW9pc3R1cmUgIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgZC5zb2lsTml0cm9nZW4gIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgZC5zb2lsUEggIT09IHVuZGVmaW5lZCxcclxuICAgICAgKVxyXG4gICAgICAuc2xpY2UoLTMwKVxyXG4gICAgICAubWFwKChkOiBhbnkpID0+ICh7XHJcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoZC5jcmVhdGVkQXQpLnRvTG9jYWxlRGF0ZVN0cmluZyhcImVuLUlOXCIpLFxyXG4gICAgICAgIG1vaXN0dXJlOiBkLnNvaWxNb2lzdHVyZSB8fCAwLFxyXG4gICAgICAgIG5pdHJvZ2VuOiBkLnNvaWxOaXRyb2dlbiB8fCAwLFxyXG4gICAgICAgIHBIOiBkLnNvaWxQSCB8fCAwLFxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgaWYgKHRyZW5kLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSAoMTUgLSBpKSk7XHJcbiAgICAgICAgdHJlbmQucHVzaCh7XHJcbiAgICAgICAgICBkYXRlOiBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZyhcImVuLUlOXCIpLFxyXG4gICAgICAgICAgbW9pc3R1cmU6IDMwICsgTWF0aC5yYW5kb20oKSAqIDUwLFxyXG4gICAgICAgICAgbml0cm9nZW46IDIwICsgTWF0aC5yYW5kb20oKSAqIDYwLFxyXG4gICAgICAgICAgcEg6IDUuOCArIE1hdGgucmFuZG9tKCkgKiAxLjgsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXMuanNvbih0cmVuZCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthbmFseXRpY3NdIEVycm9yOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIHNvaWwgaGVhbHRoIHRyZW5kXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldFdlYXRoZXJJbXBhY3RBbmFseXNpczogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBmYXJtZXJJZCB9ID0gcmVxLnBhcmFtcztcclxuICAgIGNvbnN0IGRheXMgPSBOdW1iZXIocmVxLnF1ZXJ5LmRheXMgfHwgMzApO1xyXG5cclxuICAgIGlmICghZmFybWVySWQpIHtcclxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiZmFybWVySWQgaXMgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjdXRvZmZEYXRlID0gbmV3IERhdGUoKTtcclxuICAgIGN1dG9mZkRhdGUuc2V0RGF0ZShjdXRvZmZEYXRlLmdldERhdGUoKSAtIGRheXMpO1xyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBBbmFseXRpY3NEYXRhLmZpbmQoe1xyXG4gICAgICBmYXJtZXJJZCxcclxuICAgICAgY3JlYXRlZEF0OiB7ICRndGU6IGN1dG9mZkRhdGUgfSxcclxuICAgIH0pXHJcbiAgICAgIC5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pXHJcbiAgICAgIC5saW1pdCgxNSk7XHJcblxyXG4gICAgY29uc3QgYW5hbHlzaXMgPSAoZGF0YSB8fCBbXSlcclxuICAgICAgLmZpbHRlcihcclxuICAgICAgICAoZDogYW55KSA9PlxyXG4gICAgICAgICAgZC50ZW1wZXJhdHVyZSAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICBkLmh1bWlkaXR5ICE9PSB1bmRlZmluZWQgfHxcclxuICAgICAgICAgIGQucmFpbmZhbGwgIT09IHVuZGVmaW5lZCxcclxuICAgICAgKVxyXG4gICAgICAuc2xpY2UoLTE1KVxyXG4gICAgICAubWFwKChkOiBhbnkpID0+ICh7XHJcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoZC5jcmVhdGVkQXQpLnRvTG9jYWxlRGF0ZVN0cmluZyhcImVuLUlOXCIpLFxyXG4gICAgICAgIHRlbXBlcmF0dXJlOiBkLnRlbXBlcmF0dXJlIHx8IDAsXHJcbiAgICAgICAgaHVtaWRpdHk6IGQuaHVtaWRpdHkgfHwgMCxcclxuICAgICAgICByYWluZmFsbDogZC5yYWluZmFsbCB8fCAwLFxyXG4gICAgICAgIGNyb3BIZWFsdGhTY29yZTogZC5jcm9wSGVhbHRoU2NvcmUgfHwgMCxcclxuICAgICAgfSkpO1xyXG5cclxuICAgIGlmIChhbmFseXNpcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gKDE1IC0gaSkpO1xyXG4gICAgICAgIGFuYWx5c2lzLnB1c2goe1xyXG4gICAgICAgICAgZGF0ZTogZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1JTlwiKSxcclxuICAgICAgICAgIHRlbXBlcmF0dXJlOiAyMCArIE1hdGgucmFuZG9tKCkgKiAyMCxcclxuICAgICAgICAgIGh1bWlkaXR5OiA0MCArIE1hdGgucmFuZG9tKCkgKiA0MCxcclxuICAgICAgICAgIHJhaW5mYWxsOiBNYXRoLnJhbmRvbSgpICogMzAsXHJcbiAgICAgICAgICBjcm9wSGVhbHRoU2NvcmU6IDY1ICsgTWF0aC5yYW5kb20oKSAqIDMwLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLmpzb24oYW5hbHlzaXMpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5hbHl0aWNzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCB3ZWF0aGVyIGltcGFjdCBhbmFseXNpc1wiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRTeXN0ZW1PdmVydmlldzogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAoX3JlcSwgcmVzKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIEluIGEgcmVhbCBhcHAsIHRoZXNlIHdvdWxkIGJlIHNlcGFyYXRlIERCIHF1ZXJpZXNcclxuICAgIC8vIEZvciB0aGUgcGlsb3QvZGVtbywgd2Ugc2ltdWxhdGUgc3lzdGVtLXdpZGUgYWdncmVnYXRpb25zXHJcblxyXG4gICAgLy8gMS4gVXNlciBTdGF0c1xyXG4gICAgY29uc3QgdG90YWxGYXJtZXJzID0gYXdhaXQgRmFybWVyLmNvdW50RG9jdW1lbnRzKCk7XHJcbiAgICBjb25zdCBhY3RpdmVUb2RheSA9IDQ1OyAvLyBNb2NrIChyZXF1aXJlcyBzZXNzaW9uIHRyYWNraW5nKVxyXG5cclxuICAgIC8vIDIuIEFJIFVzYWdlIFN0YXRzXHJcbiAgICBjb25zdCB0b3RhbFNjYW5zID0gYXdhaXQgQW5hbHl0aWNzRGF0YS5jb3VudERvY3VtZW50cygpO1xyXG4gICAgY29uc3QgZGlzZWFzZURldGVjdGlvblJhdGUgPSAwLjE4OyAvLyAxOCUgb2Ygc2NhbnMgc2hvdyBkaXNlYXNlXHJcblxyXG4gICAgLy8gMy4gQU1VIENvbXBsaWFuY2UgKFNpbXVsYXRlZCBmcm9tIExlZGdlcilcclxuICAgIGNvbnN0IGFjdGl2ZVdpdGhkcmF3YWxzID0gMzsgLy8gTW9jayBjdXJyZW50IGFjdGl2ZSBhbGVydHNcclxuICAgIGNvbnN0IHRvdGFsVHJlYXRtZW50c0xvZ2dlZCA9IDg5O1xyXG5cclxuICAgIC8vIDQuIERpc2Vhc2UgVHJlbmRzIChmb3IgUGllIENoYXJ0KVxyXG4gICAgY29uc3QgZGlzZWFzZURpc3RyaWJ1dGlvbiA9IFtcclxuICAgICAgeyBuYW1lOiBcIkxlYWYgQmxpZ2h0XCIsIHZhbHVlOiA0NSB9LFxyXG4gICAgICB7IG5hbWU6IFwiWWVsbG93IFJ1c3RcIiwgdmFsdWU6IDI1IH0sXHJcbiAgICAgIHsgbmFtZTogXCJBcGhpZHNcIiwgdmFsdWU6IDIwIH0sXHJcbiAgICAgIHsgbmFtZTogXCJIZWFsdGh5XCIsIHZhbHVlOiAxMCB9LFxyXG4gICAgXTtcclxuXHJcbiAgICAvLyA1LiBBZG9wdGlvbiBUcmVuZCAoZm9yIExpbmUgQ2hhcnQpXHJcbiAgICBjb25zdCBhZG9wdGlvblRyZW5kID0gW1xyXG4gICAgICB7IG1vbnRoOiBcIkphblwiLCB1c2VyczogMjAgfSxcclxuICAgICAgeyBtb250aDogXCJGZWJcIiwgdXNlcnM6IDQ1IH0sXHJcbiAgICAgIHsgbW9udGg6IFwiTWFyXCIsIHVzZXJzOiA3OCB9LFxyXG4gICAgICB7IG1vbnRoOiBcIkFwclwiLCB1c2VyczogMTEwIH0sXHJcbiAgICAgIHsgbW9udGg6IFwiTWF5XCIsIHVzZXJzOiAxMjQgfSxcclxuICAgIF07XHJcblxyXG4gICAgcmVzLmpzb24oe1xyXG4gICAgICBtZXRyaWNzOiB7XHJcbiAgICAgICAgdG90YWxGYXJtZXJzLFxyXG4gICAgICAgIGFjdGl2ZVRvZGF5LFxyXG4gICAgICAgIHRvdGFsU2NhbnMsXHJcbiAgICAgICAgYWN0aXZlV2l0aGRyYXdhbHMsXHJcbiAgICAgICAgdG90YWxUcmVhdG1lbnRzTG9nZ2VkXHJcbiAgICAgIH0sXHJcbiAgICAgIGRpc2Vhc2VEaXN0cmlidXRpb24sXHJcbiAgICAgIGFkb3B0aW9uVHJlbmRcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW5hbHl0aWNzXSBFcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCBzeXN0ZW0gb3ZlcnZpZXdcIiB9KTtcclxuICB9XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcbmVvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUEQxNy9HaXRIdWJfUHJvamVjdHMvU21hcnQtQ3JvcC1Ub29scy9zZXJ2ZXIvcm91dGVzL25lb24udHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcblxyXG4vLyBOZW9uIHZpYSBOZXRsaWZ5OiByZXF1aXJlcyBORVRMSUZZX0RBVEFCQVNFX1VSTCBlbnYgdmFyIHRvIGJlIHNldCBpbiBOZXRsaWZ5XHJcbi8vIGh0dHBzOi8vZG9jcy5uZXRsaWZ5LmNvbS9mcmFtZXdvcmtzL25lb24vXHJcbmV4cG9ydCBjb25zdCBnZXRQb3N0QnlJZDogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcyBhcyB7IGlkPzogc3RyaW5nIH07XHJcbiAgICBpZiAoIWlkKSByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJpZCByZXF1aXJlZFwiIH0pO1xyXG5cclxuICAgIC8vIExhenkgaW1wb3J0IHRvIGF2b2lkIGxvY2FsIGRldiBkZXBlbmRlbmN5IGlmIG5vdCBuZWVkZWRcclxuICAgIGNvbnN0IHsgbmVvbiB9ID0gYXdhaXQgaW1wb3J0KFwiQG5ldGxpZnkvbmVvblwiKTtcclxuXHJcbiAgICBjb25zdCBzcWwgPSBuZW9uKCk7IC8vIHVzZXMgZW52IE5FVExJRllfREFUQUJBU0VfVVJMXHJcbiAgICBjb25zdCByb3dzID0gYXdhaXQgc3FsYFNFTEVDVCAqIEZST00gcG9zdHMgV0hFUkUgaWQgPSAke2lkfWA7XHJcblxyXG4gICAgaWYgKCFyb3dzIHx8IHJvd3MubGVuZ3RoID09PSAwKVxyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogXCJub3QgZm91bmRcIiB9KTtcclxuICAgIHJldHVybiByZXMuanNvbih7IHJvd3MgfSk7XHJcbiAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICBjb25zdCBtc2cgPSB0eXBlb2YgZT8ubWVzc2FnZSA9PT0gXCJzdHJpbmdcIiA/IGUubWVzc2FnZSA6IFwicXVlcnkgZmFpbGVkXCI7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogbXNnIH0pO1xyXG4gIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxsaWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXGxpYlxcXFxsZWRnZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL2xpYi9sZWRnZXIudHNcIjtpbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcclxuaW1wb3J0IHsgQmxvY2sgYXMgQmxvY2tNb2RlbCB9IGZyb20gXCIuLi9kYlwiO1xyXG5cclxuaW50ZXJmYWNlIEJsb2NrIHtcclxuICBpbmRleDogbnVtYmVyO1xyXG4gIHRpbWVzdGFtcDogc3RyaW5nO1xyXG4gIGRhdGE6IGFueTtcclxuICBwcmV2aW91c0hhc2g6IHN0cmluZztcclxuICBoYXNoOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBIYXNoQ2hhaW4ge1xyXG4gIHB1YmxpYyBjaGFpbjogQmxvY2tbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmNoYWluID0gW107XHJcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpIHtcclxuICAgIC8vIExvYWQgZnJvbSBEQiBvciBjcmVhdGUgR2VuZXNpc1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYmxvY2tzID0gYXdhaXQgQmxvY2tNb2RlbC5maW5kKHt9KS5zb3J0KHsgaW5kZXg6IDEgfSk7XHJcbiAgICAgIGlmIChibG9ja3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuY2hhaW4gPSBibG9ja3MubWFwKChiOiBhbnkpID0+ICh7XHJcbiAgICAgICAgICBpbmRleDogYi5pbmRleCxcclxuICAgICAgICAgIHRpbWVzdGFtcDogYi50aW1lc3RhbXAsXHJcbiAgICAgICAgICBkYXRhOiBiLmRhdGEsXHJcbiAgICAgICAgICBwcmV2aW91c0hhc2g6IGIucHJldmlvdXNIYXNoLFxyXG4gICAgICAgICAgaGFzaDogYi5oYXNoLFxyXG4gICAgICAgIH0pKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBnZW5lc2lzID0gdGhpcy5jcmVhdGVHZW5lc2lzQmxvY2soKTtcclxuICAgICAgICBhd2FpdCBCbG9ja01vZGVsLmNyZWF0ZShnZW5lc2lzKTtcclxuICAgICAgICB0aGlzLmNoYWluID0gW2dlbmVzaXNdO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBpbml0aWFsaXplIGxlZGdlcjpcIiwgZXJyb3IpO1xyXG4gICAgICAgLy8gRmFsbGJhY2sgdG8gbWVtb3J5IGdlbmVzaXMgaWYgREIgZmFpbHMgaW5pdGlhbGx5XHJcbiAgICAgICB0aGlzLmNoYWluID0gW3RoaXMuY3JlYXRlR2VuZXNpc0Jsb2NrKCldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVHZW5lc2lzQmxvY2soKTogQmxvY2sge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaW5kZXg6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICBkYXRhOiBcIkdlbmVzaXMgQmxvY2tcIixcclxuICAgICAgcHJldmlvdXNIYXNoOiBcIjBcIixcclxuICAgICAgaGFzaDogdGhpcy5jYWxjdWxhdGVIYXNoKDAsIFwiMFwiLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksIFwiR2VuZXNpcyBCbG9ja1wiKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbGN1bGF0ZUhhc2goXHJcbiAgICBpbmRleDogbnVtYmVyLFxyXG4gICAgcHJldmlvdXNIYXNoOiBzdHJpbmcsXHJcbiAgICB0aW1lc3RhbXA6IHN0cmluZyxcclxuICAgIGRhdGE6IGFueSxcclxuICApOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGNyeXB0b1xyXG4gICAgICAuY3JlYXRlSGFzaChcInNoYTI1NlwiKVxyXG4gICAgICAudXBkYXRlKGluZGV4ICsgcHJldmlvdXNIYXNoICsgdGltZXN0YW1wICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXHJcbiAgICAgIC5kaWdlc3QoXCJoZXhcIik7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0TGF0ZXN0QmxvY2soKTogQmxvY2sge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hhaW5bdGhpcy5jaGFpbi5sZW5ndGggLSAxXTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBhZGRCbG9jayhkYXRhOiBhbnkpOiBQcm9taXNlPEJsb2NrPiB7XHJcbiAgICBjb25zdCBsYXRlc3RCbG9jayA9IHRoaXMuZ2V0TGF0ZXN0QmxvY2soKTtcclxuICAgIGNvbnN0IGluZGV4ID0gbGF0ZXN0QmxvY2suaW5kZXggKyAxO1xyXG4gICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gICAgY29uc3QgcHJldmlvdXNIYXNoID0gbGF0ZXN0QmxvY2suaGFzaDtcclxuICAgIGNvbnN0IGhhc2ggPSB0aGlzLmNhbGN1bGF0ZUhhc2goaW5kZXgsIHByZXZpb3VzSGFzaCwgdGltZXN0YW1wLCBkYXRhKTtcclxuXHJcbiAgICBjb25zdCBuZXdCbG9jazogQmxvY2sgPSB7XHJcbiAgICAgIGluZGV4LFxyXG4gICAgICB0aW1lc3RhbXAsXHJcbiAgICAgIGRhdGEsXHJcbiAgICAgIHByZXZpb3VzSGFzaCxcclxuICAgICAgaGFzaCxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jaGFpbi5wdXNoKG5ld0Jsb2NrKTtcclxuICAgIFxyXG4gICAgLy8gUGVyc2lzdCB0byBEQlxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBCbG9ja01vZGVsLmNyZWF0ZShuZXdCbG9jayk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBwZXJzaXN0IGJsb2NrIHRvIERCXCIsIGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gbmV3QmxvY2s7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNDaGFpblZhbGlkKCk6IGJvb2xlYW4ge1xyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLmNoYWluLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRCbG9jayA9IHRoaXMuY2hhaW5baV07XHJcbiAgICAgIGNvbnN0IHByZXZpb3VzQmxvY2sgPSB0aGlzLmNoYWluW2kgLSAxXTtcclxuXHJcbiAgICAgIC8vIDEuIENoZWNrIGlmIHByZXNlcnZlZCBoYXNoIG1hdGNoZXMgY2FsY3VsYXRlZCBoYXNoXHJcbiAgICAgIGNvbnN0IHJlY2FsY3VsYXRlZEhhc2ggPSB0aGlzLmNhbGN1bGF0ZUhhc2goXHJcbiAgICAgICAgY3VycmVudEJsb2NrLmluZGV4LFxyXG4gICAgICAgIGN1cnJlbnRCbG9jay5wcmV2aW91c0hhc2gsXHJcbiAgICAgICAgY3VycmVudEJsb2NrLnRpbWVzdGFtcCxcclxuICAgICAgICBjdXJyZW50QmxvY2suZGF0YSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmIChjdXJyZW50QmxvY2suaGFzaCAhPT0gcmVjYWxjdWxhdGVkSGFzaCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gMi4gQ2hlY2sgaWYgcHJldmlvdXNIYXNoIG1hdGNoZXMgdGhlIGhhc2ggb2YgdGhlIHByZXZpb3VzIGJsb2NrXHJcbiAgICAgIGlmIChjdXJyZW50QmxvY2sucHJldmlvdXNIYXNoICE9PSBwcmV2aW91c0Jsb2NrLmhhc2gpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8gU2luZ2xldG9uIGluc3RhbmNlIGZvciB0aGUgYXBwXHJcbmV4cG9ydCBjb25zdCBsZWRnZXIgPSBuZXcgSGFzaENoYWluKCk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxccm91dGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcXFxcYW11LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3NlcnZlci9yb3V0ZXMvYW11LnRzXCI7aW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgeyBsZWRnZXIgfSBmcm9tIFwiLi4vbGliL2xlZGdlclwiO1xyXG5cclxuLy8gTWVtb3J5IHN0b3JlIHJlbW92ZWQgaW4gZmF2b3Igb2YgREJcclxuaW1wb3J0IHsgRHJ1Z0xvZyB9IGZyb20gXCIuLi9kYlwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvZ1RyZWF0bWVudDogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBhbmltYWxJZCwgZHJ1Z05hbWUsIGRvc2FnZSwgd2l0aGRyYXdhbERheXMsIGFwcGxpY2F0b3IgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgIGlmICghYW5pbWFsSWQgfHwgIWRydWdOYW1lIHx8ICF3aXRoZHJhd2FsRGF5cykge1xyXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJNaXNzaW5nIHJlcXVpcmVkIGZpZWxkc1wiIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRyZWF0bWVudERhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XHJcblxyXG4gICAgY29uc3QgbG9nRW50cnkgPSB7XHJcbiAgICAgIGFuaW1hbElkLFxyXG4gICAgICBkcnVnTmFtZSxcclxuICAgICAgZG9zYWdlLFxyXG4gICAgICB3aXRoZHJhd2FsRGF5czogTnVtYmVyKHdpdGhkcmF3YWxEYXlzKSxcclxuICAgICAgYXBwbGljYXRvcjogYXBwbGljYXRvciB8fCBcIkZhcm1lclwiLFxyXG4gICAgICB0cmVhdG1lbnREYXRlLFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyAxLiBBZGQgdG8gTGVkZ2VyIChCbG9ja2NoYWluKVxyXG4gICAgY29uc3QgYmxvY2sgPSBhd2FpdCBsZWRnZXIuYWRkQmxvY2sobG9nRW50cnkpO1xyXG5cclxuICAgIC8vIDIuIEFkZCB0byBMb2NhbCBEQiAoUGVyc2lzdGVudClcclxuICAgIGF3YWl0IERydWdMb2cuY3JlYXRlKGxvZ0VudHJ5KTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7XHJcbiAgICAgIG1lc3NhZ2U6IFwiVHJlYXRtZW50IGxvZ2dlZCBzdWNjZXNzZnVsbHlcIixcclxuICAgICAgYmxvY2tJbmRleDogYmxvY2suaW5kZXgsXHJcbiAgICAgIGJsb2NrSGFzaDogYmxvY2suaGFzaCxcclxuICAgICAgd2l0aGRyYXdhbEVuZHM6IGdldFdpdGhkcmF3YWxFbmREYXRlKHRyZWF0bWVudERhdGUsIE51bWJlcih3aXRoZHJhd2FsRGF5cykpLFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbYW11XSBMb2cgZXJyb3I6XCIsIGVycm9yKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGxvZyB0cmVhdG1lbnRcIiB9KTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0QW5pbWFsU3RhdHVzOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGFuaW1hbElkIH0gPSByZXEucGFyYW1zO1xyXG4gICAgXHJcbiAgICAvLyBGaWx0ZXIgaGlzdG9yeSBmb3IgdGhpcyBhbmltYWwgZnJvbSBEQlxyXG4gICAgY29uc3QgcmVjb3JkcyA9IGF3YWl0IERydWdMb2cuZmluZCh7IGFuaW1hbElkIH0pO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiBhbnkgd2l0aGRyYXdhbCBwZXJpb2QgaXMgc3RpbGwgYWN0aXZlXHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IGlzU2FmZSA9IHRydWU7XHJcbiAgICBsZXQgYWN0aXZlV2l0aGRyYXdhbCA9IG51bGw7XHJcblxyXG4gICAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVjb3Jkcykge1xyXG4gICAgICAvLyBtb25nb29zZSBkb2NzIG1pZ2h0IGJlIG9iamVjdHMgb3IgZG9jcywgaGFuZGxlIGFjY29yZGluZ2x5IGlmIG5lZWRlZFxyXG4gICAgICAvLyBzYWZlIHRvIGFzc3VtZSByZWNvcmQgc3RydWN0dXJlIG1hdGNoZXMgc2NoZW1hXHJcbiAgICAgIGNvbnN0IHREYXRlID0gbmV3IERhdGUocmVjb3JkLnRyZWF0bWVudERhdGUpO1xyXG4gICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUodERhdGUpO1xyXG4gICAgICBlbmREYXRlLnNldERhdGUoZW5kRGF0ZS5nZXREYXRlKCkgKyByZWNvcmQud2l0aGRyYXdhbERheXMpO1xyXG5cclxuICAgICAgaWYgKG5vdyA8IGVuZERhdGUpIHtcclxuICAgICAgICBpc1NhZmUgPSBmYWxzZTtcclxuICAgICAgICBhY3RpdmVXaXRoZHJhd2FsID0ge1xyXG4gICAgICAgICAgZHJ1ZzogcmVjb3JkLmRydWdOYW1lLFxyXG4gICAgICAgICAgZW5kc0F0OiBlbmREYXRlLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgfTtcclxuICAgICAgICBicmVhazsgXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXMuanNvbih7XHJcbiAgICAgIGFuaW1hbElkLFxyXG4gICAgICBzdGF0dXM6IGlzU2FmZSA/IFwiU0FGRVwiIDogXCJXSVRIRFJBV0FMX0FDVElWRVwiLFxyXG4gICAgICBhY3RpdmVXaXRoZHJhd2FsLFxyXG4gICAgICBoaXN0b3J5Q291bnQ6IHJlY29yZHMubGVuZ3RoLFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthbXVdIFN0YXR1cyBlcnJvcjpcIiwgZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBnZXQgc3RhdHVzXCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldExlZGdlcjogUmVxdWVzdEhhbmRsZXIgPSAoX3JlcSwgcmVzKSA9PiB7XHJcbiAgY29uc3QgaXNWYWxpZCA9IGxlZGdlci5pc0NoYWluVmFsaWQoKTtcclxuICByZXMuanNvbih7XHJcbiAgICBpc1ZhbGlkLFxyXG4gICAgY2hhaW5MZW5ndGg6IGxlZGdlci5jaGFpbi5sZW5ndGgsXHJcbiAgICBibG9ja3M6IGxlZGdlci5jaGFpbixcclxuICB9KTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGdldFdpdGhkcmF3YWxFbmREYXRlKHN0YXJ0RGF0ZTogc3RyaW5nLCBkYXlzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShzdGFydERhdGUpO1xyXG4gIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIGRheXMpO1xyXG4gIHJldHVybiBkYXRlLnRvSVNPU3RyaW5nKCk7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclxcXFxyb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBEMTdcXFxcR2l0SHViX1Byb2plY3RzXFxcXFNtYXJ0LUNyb3AtVG9vbHNcXFxcc2VydmVyXFxcXHJvdXRlc1xcXFxhbGVydHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL3JvdXRlcy9hbGVydHMudHNcIjtpbXBvcnQgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XHJcbmltcG9ydCB7IFN5c3RlbUFsZXJ0IH0gZnJvbSBcIi4uL2RiXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0QWN0aXZlQWxlcnRzOiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhbGVydHMgPSBhd2FpdCBTeXN0ZW1BbGVydC5maW5kKHsgYWN0aXZlOiB0cnVlIH0pO1xyXG4gICAgcmVzLmpzb24oYWxlcnRzKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2FsZXJ0c10gRXJyb3IgZmV0Y2hpbmcgYWxlcnRzOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIGFsZXJ0c1wiIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVBbGVydDogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBtZXNzYWdlLCB0eXBlIH0gPSByZXEuYm9keTtcclxuICAgIFxyXG4gICAgaWYgKCFtZXNzYWdlKSB7XHJcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiBcIk1lc3NhZ2UgaXMgcmVxdWlyZWRcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhbGVydCA9IGF3YWl0IFN5c3RlbUFsZXJ0LmNyZWF0ZSh7XHJcbiAgICAgIG1lc3NhZ2UsXHJcbiAgICAgIHR5cGU6IHR5cGUgfHwgJ2luZm8nLFxyXG4gICAgICBhY3RpdmU6IHRydWUsXHJcbiAgICAgIGV4cGlyZXNBdDogbmV3IERhdGUoRGF0ZS5ub3coKSArIDI0ICogNjAgKiA2MCAqIDEwMDApIC8vIERlZmF1bHQgMjRoIGV4cGlyYXRpb25cclxuICAgIH0pO1xyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKGFsZXJ0KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW2FsZXJ0c10gRXJyb3IgY3JlYXRpbmcgYWxlcnQ6XCIsIGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gY3JlYXRlIGFsZXJ0XCIgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGV0ZUFsZXJ0OiBSZXF1ZXN0SGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XHJcbiAgdHJ5IHtcclxuICAgIGlmIChTeXN0ZW1BbGVydC5kZWxldGVPbmUpIHtcclxuICAgICAgYXdhaXQgU3lzdGVtQWxlcnQuZGVsZXRlT25lKHsgX2lkOiBpZCB9KTtcclxuICAgIH0gZWxzZSBpZiAoU3lzdGVtQWxlcnQuaXRlbXMpIHtcclxuICAgICAgU3lzdGVtQWxlcnQuaXRlbXMgPSBTeXN0ZW1BbGVydC5pdGVtcy5maWx0ZXIoKGE6IGFueSkgPT4gU3RyaW5nKGEuX2lkKSAhPT0gU3RyaW5nKGlkKSk7XHJcbiAgICB9XHJcbiAgICByZXMuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlthbGVydHNdIEVycm9yIGRlbGV0aW5nOlwiLCBlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGRlbGV0ZSBhbGVydFwiIH0pO1xyXG4gIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHNlcnZlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUEQxN1xcXFxHaXRIdWJfUHJvamVjdHNcXFxcU21hcnQtQ3JvcC1Ub29sc1xcXFxzZXJ2ZXJcXFxcaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1BEMTcvR2l0SHViX1Byb2plY3RzL1NtYXJ0LUNyb3AtVG9vbHMvc2VydmVyL2luZGV4LnRzXCI7aW1wb3J0IFwiZG90ZW52L2NvbmZpZ1wiO1xyXG5pbXBvcnQgZXhwcmVzcyBmcm9tIFwiZXhwcmVzc1wiO1xyXG5pbXBvcnQgY29ycyBmcm9tIFwiY29yc1wiO1xyXG5pbXBvcnQgeyBoYW5kbGVEZW1vIH0gZnJvbSBcIi4vcm91dGVzL2RlbW9cIjtcclxuaW1wb3J0IHsgY29ubmVjdERCIH0gZnJvbSBcIi4vZGJcIjtcclxuaW1wb3J0IHsgY3JlYXRlRmFybWVyLCBnZXRGYXJtZXIsIGdldEFsbEZhcm1lcnMsIGRlbGV0ZUZhcm1lciwgdXBkYXRlRmFybWVyU3RhdHVzIH0gZnJvbSBcIi4vcm91dGVzL2Zhcm1lcnNcIjtcclxuaW1wb3J0IHsgRmFybWVyIH0gZnJvbSBcIi4vZGJcIjtcclxuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0anNcIjtcclxuaW1wb3J0IHsgZ2V0V2VhdGhlciB9IGZyb20gXCIuL3JvdXRlcy93ZWF0aGVyXCI7XHJcbmltcG9ydCB7IGNyZWF0ZUFkdmlzb3J5LCBzdWJtaXRGZWVkYmFjayB9IGZyb20gXCIuL3JvdXRlcy9hZHZpc29yeVwiO1xyXG5pbXBvcnQgeyBnZXRNYXJrZXRQcmljZXMgfSBmcm9tIFwiLi9yb3V0ZXMvbWFya2V0XCI7XHJcbmltcG9ydCB7IGNoYXRIYW5kbGVyIH0gZnJvbSBcIi4vcm91dGVzL2NoYXRcIjtcclxuaW1wb3J0IHsgcHJlZGljdEhhbmRsZXIsIHVwbG9hZE1pZGRsZXdhcmUgfSBmcm9tIFwiLi9yb3V0ZXMvcHJlZGljdFwiO1xyXG5pbXBvcnQgeyB1cHNlcnRGYXJtZXIsIGd1ZXN0TG9naW4sIHJlZ2lzdGVyLCBsb2dpbiwgZ2V0RGVidWdVc2VycywgZGVsZXRlRGVidWdVc2VyIH0gZnJvbSBcIi4vcm91dGVzL2F1dGhcIjtcclxuaW1wb3J0IHtcclxuICBzYXZlQWR2aXNvcnlIaXN0b3J5LFxyXG4gIGdldEFkdmlzb3J5SGlzdG9yeSxcclxuICBnZXRQcm9maWxlRGF0YSxcclxuICB1cGRhdGVTdWJzY3JpcHRpb24sXHJcbn0gZnJvbSBcIi4vcm91dGVzL3Byb2ZpbGVcIjtcclxuaW1wb3J0IHtcclxuICByZWNvcmRBbmFseXRpY3MsXHJcbiAgZ2V0QW5hbHl0aWNzU3VtbWFyeSxcclxuICBnZXRDcm9wVHJlbmRzLFxyXG4gIGdldFNvaWxIZWFsdGhUcmVuZCxcclxuICBnZXRXZWF0aGVySW1wYWN0QW5hbHlzaXMsXHJcbiAgZ2V0U3lzdGVtT3ZlcnZpZXcsXHJcbn0gZnJvbSBcIi4vcm91dGVzL2FuYWx5dGljc1wiO1xyXG5pbXBvcnQgeyBnZXRQb3N0QnlJZCB9IGZyb20gXCIuL3JvdXRlcy9uZW9uXCI7XHJcbmltcG9ydCB7IGxvZ1RyZWF0bWVudCwgZ2V0QW5pbWFsU3RhdHVzLCBnZXRMZWRnZXIgfSBmcm9tIFwiLi9yb3V0ZXMvYW11XCI7XHJcbmltcG9ydCB7IGdldEFjdGl2ZUFsZXJ0cywgY3JlYXRlQWxlcnQsIGRlbGV0ZUFsZXJ0IH0gZnJvbSBcIi4vcm91dGVzL2FsZXJ0c1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlcnZlcigpIHtcclxuICBjb25zdCBhcHAgPSBleHByZXNzKCk7XHJcblxyXG4gIC8vIE1pZGRsZXdhcmVcclxuICBhcHAudXNlKGNvcnMoKSk7XHJcbiAgYXBwLnVzZShleHByZXNzLmpzb24oKSk7XHJcbiAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSk7XHJcblxyXG4gIC8vIERCOiBlbnN1cmUgdGhlIGNvbm5lY3Rpb24gaXMgcmVhZHkgYmVmb3JlIGhhbmRsaW5nIGRvbWFpbiByb3V0ZXNcclxuICBjb25zdCBkYlJlYWR5ID0gY29ubmVjdERCKCk7XHJcbiAgXHJcbiAgZGJSZWFkeS50aGVuKGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFNlZWQgcGVybWFuZW50IGFkbWluIGlmIG5vdCBleGlzdHNcclxuICAgICAgY29uc3QgYWRtaW5FbWFpbCA9IFwiYWRtaW4uYWdyaUBhZ3JpdmVyc2UuaW5cIjtcclxuICAgICAgY29uc3QgZXhpc3RpbmdBZG1pbiA9IGF3YWl0IEZhcm1lci5maW5kT25lKHsgZW1haWw6IGFkbWluRW1haWwgfSk7XHJcbiAgICAgIGlmICghZXhpc3RpbmdBZG1pbikge1xyXG4gICAgICAgIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2goXCJBZG1pbkAyMDI3XCIsIDEwKTtcclxuICAgICAgICBhd2FpdCBGYXJtZXIuY3JlYXRlKHtcclxuICAgICAgICAgIG5hbWU6IFwiU3lzdGVtIEFkbWluXCIsXHJcbiAgICAgICAgICBlbWFpbDogYWRtaW5FbWFpbCxcclxuICAgICAgICAgIHBhc3N3b3JkOiBoYXNoZWRQYXNzd29yZCxcclxuICAgICAgICAgIHBob25lOiBcIjAwMDAwMDAwMDBcIixcclxuICAgICAgICAgIHNvaWxUeXBlOiBcIk5vbmVcIixcclxuICAgICAgICAgIGxhbmRTaXplOiAwLFxyXG4gICAgICAgICAgbG9jYXRpb246IFwiSGVhZHF1YXJ0ZXJzXCIsXHJcbiAgICAgICAgICByb2xlOiBcImFkbWluXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIltkYl0gU2VlZGVkIHBlcm1hbmVudCBhZG1pbiBhY2NvdW50OiBcIiArIGFkbWluRW1haWwpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIltkYl0gRXJyb3Igc2VlZGluZyBhZG1pbjpcIiwgZXJyKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgYXBwLnVzZShhc3luYyAoX3JlcSwgX3JlcywgbmV4dCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgZGJSZWFkeTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvLyBJZiBjb25uZWN0aW9uIGZhaWxzLCBjb250aW51ZTsgaW4tbWVtb3J5IG1vZGUgd2lsbCBzdGlsbCB3b3JrXHJcbiAgICB9XHJcbiAgICBuZXh0KCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIEV4YW1wbGUgQVBJIHJvdXRlc1xyXG4gIGFwcC5nZXQoXCIvYXBpL3BpbmdcIiwgKF9yZXEsIHJlcykgPT4ge1xyXG4gICAgY29uc3QgcGluZyA9IHByb2Nlc3MuZW52LlBJTkdfTUVTU0FHRSA/PyBcInBpbmdcIjtcclxuICAgIHJlcy5qc29uKHsgbWVzc2FnZTogcGluZyB9KTtcclxuICB9KTtcclxuXHJcbiAgYXBwLmdldChcIi9hcGkvZGVtb1wiLCBoYW5kbGVEZW1vKTtcclxuXHJcbiAgLy8gRG9tYWluIHJvdXRlc1xyXG4gIGFwcC5wb3N0KFwiL2FwaS9mYXJtZXJzXCIsIGNyZWF0ZUZhcm1lcik7XHJcbiAgYXBwLmdldChcIi9hcGkvZmFybWVyc1wiLCBnZXRBbGxGYXJtZXJzKTsgLy8gTkVXXHJcbiAgYXBwLmdldChcIi9hcGkvZmFybWVycy86aWRcIiwgZ2V0RmFybWVyKTtcclxuICBhcHAuZGVsZXRlKFwiL2FwaS9mYXJtZXJzLzppZFwiLCBkZWxldGVGYXJtZXIpO1xyXG4gIGFwcC5wYXRjaChcIi9hcGkvZmFybWVycy86aWQvc3RhdHVzXCIsIHVwZGF0ZUZhcm1lclN0YXR1cyk7XHJcbiAgYXBwLmdldChcIi9hcGkvd2VhdGhlclwiLCBnZXRXZWF0aGVyKTtcclxuICBhcHAucG9zdChcIi9hcGkvYWR2aXNvcmllc1wiLCBjcmVhdGVBZHZpc29yeSk7XHJcbiAgYXBwLmdldChcIi9hcGkvbWFya2V0XCIsIGdldE1hcmtldFByaWNlcyk7XHJcbiAgYXBwLnBvc3QoXCIvYXBpL2NoYXRcIiwgY2hhdEhhbmRsZXIpO1xyXG4gIGFwcC5wb3N0KFwiL2FwaS9wcmVkaWN0XCIsIHVwbG9hZE1pZGRsZXdhcmUsIHByZWRpY3RIYW5kbGVyKTtcclxuICBcclxuICAvLyBBbGVydHNcclxuICBhcHAuZ2V0KFwiL2FwaS9hbGVydHNcIiwgZ2V0QWN0aXZlQWxlcnRzKTtcclxuICBhcHAucG9zdChcIi9hcGkvYWxlcnRzXCIsIGNyZWF0ZUFsZXJ0KTtcclxuICBhcHAuZGVsZXRlKFwiL2FwaS9hbGVydHMvOmlkXCIsIGRlbGV0ZUFsZXJ0KTtcclxuICBcclxuICAvLyBBdXRoIHJvdXRlc1xyXG4gIGFwcC5wb3N0KFwiL2FwaS9hdXRoL3JlZ2lzdGVyXCIsIHJlZ2lzdGVyKTtcclxuICBhcHAucG9zdChcIi9hcGkvYXV0aC9sb2dpblwiLCBsb2dpbik7XHJcbiAgYXBwLnBvc3QoXCIvYXBpL2F1dGgvZmFybWVyXCIsIHVwc2VydEZhcm1lcik7IC8vIGxlZ2FjeVxyXG4gIGFwcC5wb3N0KFwiL2FwaS9hdXRoL2d1ZXN0XCIsIGd1ZXN0TG9naW4pO1xyXG4gIGFwcC5nZXQoXCIvYXBpL2RlYnVnL3VzZXJzXCIsIGdldERlYnVnVXNlcnMpO1xyXG4gIGFwcC5kZWxldGUoXCIvYXBpL2RlYnVnL3VzZXJzLzppZFwiLCBkZWxldGVEZWJ1Z1VzZXIpO1xyXG5cclxuICAvLyBBTVUgLyBCbG9ja2NoYWluIFJvdXRlc1xyXG4gIGFwcC5wb3N0KFwiL2FwaS9hbXUvbG9nXCIsIGxvZ1RyZWF0bWVudCk7XHJcbiAgYXBwLmdldChcIi9hcGkvYW11L3N0YXR1cy86YW5pbWFsSWRcIiwgZ2V0QW5pbWFsU3RhdHVzKTtcclxuICBhcHAuZ2V0KFwiL2FwaS9hbXUvbGVkZ2VyXCIsIGdldExlZGdlcik7XHJcblxyXG4gIGFwcC5wb3N0KFwiL2FwaS9hZHZpc29yeS9oaXN0b3J5XCIsIHNhdmVBZHZpc29yeUhpc3RvcnkpO1xyXG4gIGFwcC5nZXQoXCIvYXBpL2Fkdmlzb3J5L2hpc3RvcnkvOmZhcm1lcklkXCIsIGdldEFkdmlzb3J5SGlzdG9yeSk7XHJcbiAgYXBwLnBhdGNoKFwiL2FwaS9hZHZpc29yeS9oaXN0b3J5LzppZC9mZWVkYmFja1wiLCBzdWJtaXRGZWVkYmFjayk7XHJcbiAgXHJcbiAgYXBwLmdldChcIi9hcGkvcHJvZmlsZS86ZmFybWVySWRcIiwgZ2V0UHJvZmlsZURhdGEpO1xyXG4gIGFwcC5wdXQoXCIvYXBpL3Byb2ZpbGUvOmZhcm1lcklkL3N1YnNjcmlwdGlvblwiLCB1cGRhdGVTdWJzY3JpcHRpb24pO1xyXG5cclxuICBhcHAucG9zdChcIi9hcGkvYW5hbHl0aWNzL3JlY29yZFwiLCByZWNvcmRBbmFseXRpY3MpO1xyXG4gIGFwcC5nZXQoXCIvYXBpL2FuYWx5dGljcy9zdW1tYXJ5LzpmYXJtZXJJZFwiLCBnZXRBbmFseXRpY3NTdW1tYXJ5KTtcclxuICBhcHAuZ2V0KFwiL2FwaS9hbmFseXRpY3MvY3JvcC10cmVuZHMvOmZhcm1lcklkXCIsIGdldENyb3BUcmVuZHMpO1xyXG4gIGFwcC5nZXQoXCIvYXBpL2FuYWx5dGljcy9zb2lsLWhlYWx0aC86ZmFybWVySWRcIiwgZ2V0U29pbEhlYWx0aFRyZW5kKTtcclxuICBhcHAuZ2V0KFwiL2FwaS9hbmFseXRpY3Mvd2VhdGhlci1pbXBhY3QvOmZhcm1lcklkXCIsIGdldFdlYXRoZXJJbXBhY3RBbmFseXNpcyk7XHJcbiAgYXBwLmdldChcIi9hcGkvYW5hbHl0aWNzL3N5c3RlbVwiLCBnZXRTeXN0ZW1PdmVydmlldyk7XHJcblxyXG4gIC8vIE5lb24gZXhhbXBsZSAocmVxdWlyZXMgTkVUTElGWV9EQVRBQkFTRV9VUkwgb24gTmV0bGlmeSlcclxuICBhcHAuZ2V0KFwiL2FwaS9uZW9uL3Bvc3RzLzppZFwiLCBnZXRQb3N0QnlJZCk7XHJcblxyXG4gIHJldHVybiBhcHA7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQRDE3XFxcXEdpdEh1Yl9Qcm9qZWN0c1xcXFxTbWFydC1Dcm9wLVRvb2xzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QRDE3L0dpdEh1Yl9Qcm9qZWN0cy9TbWFydC1Dcm9wLVRvb2xzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xyXG5cclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICAvLyBBbGxvdyBvdmVycmlkaW5nIHBvcnQgdmlhIFBPUlQgZW52IHZhciAodXNlZnVsIHdoZW4gODA4MCBpcyBpbiB1c2UpXHJcbiAgICBwb3J0OiBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCkgfHwgODA4MCxcclxuICAgIC8vIEFsbG93IHNlcnZpbmcgZmlsZXMgZnJvbSBwcm9qZWN0IHJvb3QgKGluZGV4Lmh0bWwpIGFzIHdlbGwgYXMgY2xpZW50L3NoYXJlZFxyXG4gICAgZnM6IHtcclxuICAgICAgZGVueTogW1wiLmVudlwiLCBcIi5lbnYuKlwiLCBcIioue2NydCxwZW19XCIsIFwiKiovLmdpdC8qKlwiLCBcInNlcnZlci8qKlwiXSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiBcImRpc3Qvc3BhXCIsXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgZXhwcmVzc1BsdWdpbigpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFtcImZhdmljb24uaWNvXCIsIFwiaWNvbi5zdmdcIl0sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogXCJBZ3JpVmVyc2UgLSBTbWFydCBGYXJtaW5nXCIsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogXCJBZ3JpVmVyc2VcIixcclxuICAgICAgICBkZXNjcmlwdGlvbjogXCJBSS1wb3dlcmVkIHN1c3RhaW5hYmxlIGZhcm1pbmcgYXNzaXN0YW50XCIsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiIzE2YTM0YVwiLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogXCJpY29uLnN2Z1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2Uvc3ZnK3htbFwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiBcImljb24uc3ZnXCIsXHJcbiAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcclxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vY2xpZW50XCIpLFxyXG4gICAgICBcIkBzaGFyZWRcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NoYXJlZFwiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG5cclxuZnVuY3Rpb24gZXhwcmVzc1BsdWdpbigpOiBQbHVnaW4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiBcImV4cHJlc3MtcGx1Z2luXCIsXHJcbiAgICBhcHBseTogXCJzZXJ2ZVwiLCAvLyBPbmx5IGFwcGx5IGR1cmluZyBkZXZlbG9wbWVudCAoc2VydmUgbW9kZSlcclxuICAgIGFzeW5jIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuICAgICAgY29uc3QgeyBjcmVhdGVTZXJ2ZXIgfSA9IGF3YWl0IGltcG9ydChcIi4vc2VydmVyXCIpO1xyXG4gICAgICBjb25zdCBhcHAgPSBjcmVhdGVTZXJ2ZXIoKTtcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhcHApO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUEsSUFHYTtBQUhiO0FBQUE7QUFHTyxJQUFNLGFBQTZCLENBQUMsTUFBTSxRQUFRO0FBQ3ZELFlBQU0sV0FBeUI7QUFBQSxRQUM3QixTQUFTO0FBQUEsTUFDWDtBQUNBLFVBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxRQUFRO0FBQUEsSUFDL0I7QUFBQTtBQUFBOzs7QUNSdVQsT0FBTztBQUM5VCxPQUFPLGNBQWM7QUF1SnJCLGVBQXNCLFVBQVUsS0FBYztBQUM1QyxRQUFNLFdBQVcsT0FBTyxRQUFRLElBQUk7QUFDcEMsTUFBSSxDQUFDLFVBQVU7QUFDYixZQUFRLEtBQUssb0RBQW9EO0FBQ2pFLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxTQUFTLFdBQVcsZUFBZSxFQUFHLFFBQU8sU0FBUztBQUcxRCxNQUFJO0FBQ0YsVUFBTSxTQUFTLFFBQVEsVUFBVSxFQUFFLDBCQUEwQixJQUFL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
