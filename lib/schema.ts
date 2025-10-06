export type Units = "metric" | "imperial";
export type CountryCode = string;

export interface GetWeatherForecastRequest {
  location: string;
  forecastDays: number;
  countryCode?: CountryCode;
  units?: Units;
}

export interface GetCoordinatesRequest {
  location: string;
  countryCode?: CountryCode;
}

export interface CoordinatesResponse {
  latitude: number;
  longitude: number;
}
