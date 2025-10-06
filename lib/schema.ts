export type Units = "metric" | "imperial";
export type CountryCode = string;

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
