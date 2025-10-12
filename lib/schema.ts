import { z } from "zod";

export type Units = "metric" | "imperial";
export type CountryCode = string;

// Zod schemas for validation
export const WebSearchRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  country: z.string().optional(),
  freshness: z
    .enum(["past-day", "past-week", "past-month", "past-year"])
    .optional(),
  units: z.string().optional(),
  count: z.number().min(1).max(20).default(8),
  offset: z.number().min(0).optional(),
});

export const WebpageContentsRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1, "At least one URL is required"),
});

export const GetCurrentWeatherRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  units: z.enum(["metric", "imperial"]).optional().default("metric"),
});

export const GetWeatherForecastRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  forecastDays: z.number().min(1).max(7),
  units: z.enum(["metric", "imperial"]).optional().default("metric"),
});

export const GetCoordinatesRequestSchema = z.object({
  location: z.string().min(1, "Location is required"),
  countryCode: z.string().optional(),
});

export const GetLocationFromCoordinatesRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Weather request interfaces
export interface GetCurrentWeatherRequest {
  latitude: number;
  longitude: number;
  units?: Units;
}

export interface GetWeatherForecastRequest {
  latitude: number;
  longitude: number;
  forecastDays: number;
  units?: Units;
}

// Weather response interfaces
export interface CurrentWeatherResponse {
  latitude: number;
  longitude: number;
  units: Units;
  currentDate: number;
  currentHour: number;
  current: {
    temp: number;
    weather: string;
  };
  hourly: Array<{
    temp: number;
    weather: string;
  }>;
}

export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_offset: number;
  forecastDays: number;
  units: Units;
  daily: Array<{
    dayIndex: number;
    temperatureMain: number;
    temperatureMin: number;
    temperatureMax: number;
    weather: string;
  }>;
}

// Geocoding interfaces
export interface GetCoordinatesRequest {
  location: string;
  countryCode?: CountryCode;
}

export interface CoordinatesResponse {
  latitude: number;
  longitude: number;
}

export interface GetLocationFromCoordinatesRequest {
  latitude: number;
  longitude: number;
}

export interface LocationResponse {
  location: string;
  country: string;
}
