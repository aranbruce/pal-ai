// Chat suggestions
export const DEFAULT_SUGGESTIONS = [
  "Weather in London today",
  "Latest news on artificial intelligence",
  "Current trends in web development?",
  "Weather forecast for New York this week",
];

// Geolocation constants
export const GEOLOCATION_CONFIG = {
  TIMEOUT: 5000, // 5 seconds
  MAXIMUM_AGE: 300000, // 5 minutes in milliseconds
  ENABLE_HIGH_ACCURACY: false,
} as const;

// Chat API constants
export const CHAT_CONFIG = {
  MAX_STEPS: 20,
  STREAM_DELAY_MS: 20,
  TEMPERATURE: 0.2,
  MAX_RETRIES: 4,
} as const;

// Web search constants
export const WEB_SEARCH_CONFIG = {
  DEFAULT_COUNT: 8,
  MAX_COUNT: 20,
  MIN_COUNT: 1,
} as const;

// Weather constants
export const WEATHER_CONFIG = {
  MAX_FORECAST_DAYS: 7,
  MIN_FORECAST_DAYS: 1,
  DEFAULT_UNITS: "metric" as const,
} as const;

// Coordinate validation constants
export const COORDINATE_LIMITS = {
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
} as const;
