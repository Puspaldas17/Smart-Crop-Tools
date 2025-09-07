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
