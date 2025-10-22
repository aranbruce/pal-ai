export interface WeatherResult {
  location?: string;
  latitude: number;
  longitude: number;
  units: "metric" | "imperial";
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

export interface WeatherDisplayProps {
  data: WeatherResult;
}
