import { RequestHandler } from "express";
import { Advisory, AdvisoryHistory } from "../db";

function generateAdvice({
  tempC,
  humidity,
  soilMoisture,
  ndvi
}: {
  tempC?: number;
  humidity?: number;
  soilMoisture?: number;
  ndvi?: number;
}) {
  const parts: string[] = [];
  const factors: string[] = [];
  const riskAlerts: string[] = [];
  
  if (tempC !== undefined) {
    if (tempC < 15) {
      parts.push("Low temperature: prefer wheat/mustard; reduce irrigation.");
      factors.push(`Temperature is low (${tempC}°C).`);
      riskAlerts.push("Frost risk for sensitive crops.");
    } else if (tempC < 28) {
      parts.push("Moderate temperature: paddy/vegetables suitable; standard irrigation schedule.");
      factors.push(`Temperature is optimal (${tempC}°C).`);
    } else {
      parts.push("High temperature: select drought‑tolerant crops; irrigate in early morning/evening.");
      factors.push(`Temperature is high (${tempC}°C).`);
      riskAlerts.push("Heat stress risk.");
    }
  }

  if (humidity !== undefined) {
    if (humidity > 80) {
      parts.push("High humidity: monitor fungal diseases; use preventive fungicide when needed.");
      factors.push(`Humidity is high (${humidity}%).`);
      riskAlerts.push("Fungal disease outbreak likely.");
    } else if (humidity < 30) {
      parts.push("Low humidity: mulch to retain soil moisture.");
      factors.push(`Humidity is low (${humidity}%).`);
    }
  }

  if (soilMoisture !== undefined) {
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

  if (ndvi !== undefined) {
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

export const createAdvisory: RequestHandler = async (req, res) => {
  try {
    const { farmerId, crop, lat, lon } = req.body as {
      farmerId?: string;
      crop?: string;
      lat?: number;
      lon?: number;
    };

    let weather: any = undefined;
    if (lat != null && lon != null) {
      const key = process.env.OPENWEATHER_API_KEY;
      if (key) {
        const resp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
        );
        if (resp.ok) weather = await resp.json();
      }
    }

    // Mock Digital Twin Data
    const mockSoilMoisture = Math.floor(Math.random() * 60) + 20; // 20-80%
    const mockNDVI = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)); // 0.1-0.9
    
    const advice = generateAdvice({
      tempC: weather?.main?.temp,
      humidity: weather?.main?.humidity,
      soilMoisture: mockSoilMoisture,
      ndvi: mockNDVI
    });
    
    const summary = advice.summary;
    const factors = advice.factors;
    const riskAlerts = advice.riskAlerts;

    // Confidence and Cost-Benefit
    const confidenceScore = Math.floor(Math.random() * 20) + 80; // 80-99%
    const isPaddy = crop?.toLowerCase().includes("paddy");
    
    const fertilizer = isPaddy
      ? "NPK 10:26:26 at sowing; urea split doses at tillering/PI."
      : "Balanced NPK based on soil test; apply compost/manure to improve organic matter.";
      
    const irrigation =
      (weather?.main?.temp && weather.main.temp > 30) || mockSoilMoisture < 30
        ? "Irrigate 2–3 times/week in short cycles."
        : "Irrigate weekly based on soil moisture.";
        
    const pest = "Scout weekly; use pheromone traps; prefer bio‑control where possible.";

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

export const submitFeedback: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    
    if (!['positive', 'negative'].includes(feedback)) {
      res.status(400).json({ error: "Invalid feedback value" });
      return;
    }
    
    // Check if it's an AdvisoryHistory or just Advisory (in case they use the Advisory ID directly in UI)
    // The history ID is generally what is rendered in the dashboard.
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
