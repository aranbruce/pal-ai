"use server";

import {
  GetWeatherForecastRequest,
  WeatherForecastResponse,
} from "@/lib/schema";

export async function getWeatherForecast({
  latitude,
  longitude,
  forecastDays,
  units = "metric",
}: GetWeatherForecastRequest): Promise<WeatherForecastResponse> {
  if (forecastDays < 1) {
    throw new Error("forecastDays must be at least 1");
  }
  if (forecastDays > 7) {
    throw new Error("forecastDays must be no more than 7");
  }

  try {
    const url = new URL(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${process.env.OPENWEATHER_API_KEY}&units=${units}`,
    );

    const headers = {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseJson = await response.json();

    const weatherForecast: WeatherForecastResponse = {
      latitude,
      longitude,
      timezone: responseJson.timezone,
      timezone_offset: responseJson.timezone_offset,
      forecastDays,
      units,
      daily: responseJson.daily.slice(0, forecastDays).map(
        (
          day: {
            temp: { day: number; min: number; max: number };
            weather: { main: string }[];
          },
          index: number,
        ) => ({
          dayIndex: index,
          temperatureMain: Math.round(day.temp.day),
          temperatureMin: Math.round(day.temp.min),
          temperatureMax: Math.round(day.temp.max),
          weather: day.weather[0].main,
        }),
      ),
    };

    return weatherForecast;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw new Error(
      `Failed to fetch weather forecast: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
