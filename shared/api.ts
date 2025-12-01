/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface FarmerDTO {
  _id?: string;
  name: string;
  phone?: string;
  soilType?: string;
  landSize?: number;
  language?: string;
  location?: { lat?: number; lon?: number; village?: string; state?: string };
  isGuest?: boolean;
  subscriptionStatus?: "free" | "premium";
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdvisoryHistoryDTO {
  _id?: string;
  farmerId: string;
  crop: string;
  advisory: string;
  timestamp: Date;
  weatherData?: Record<string, any>;
  soilData?: Record<string, any>;
}

export interface AnalyticsDataDTO {
  _id?: string;
  farmerId: string;
  crop: string;
  date: Date;
  cropHealthScore?: number;
  yield?: number;
  soilMoisture?: number;
  soilNitrogen?: number;
  soilPH?: number;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  pestPressure?: number;
  diseaseRisk?: number;
}

export interface AnalyticsSummaryDTO {
  totalAdvisories: number;
  cropPerformance: Array<{ crop: string; count: number; avgScore: number }>;
  soilHealthTrend: Array<{ date: string; moisture: number; nitrogen: number; pH: number }>;
  weatherImpact: { temperature: number; humidity: number; rainfall: number };
  pestAnalysis: Array<{ type: string; risk: number; frequency: number }>;
}

export interface AdvisoryDTO {
  _id?: string;
  farmerId?: string;
  crop?: string;
  summary: string;
  fertilizer: string;
  irrigation: string;
  pest: string;
}

export interface WeatherDTO {
  tempC?: number;
  humidity?: number;
  windKph?: number;
  conditions?: string;
}
