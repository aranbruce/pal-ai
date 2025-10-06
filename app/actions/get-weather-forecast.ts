"use server";

import { GetWeatherForecastRequest } from "@/lib/schema";
import getCoordinatesFromLocation from "./get-coordinates-from-location";

export async function getWeatherForecast({
  location,
  forecastDays,
  countryCode,
  units = "metric",
}: GetWeatherForecastRequest) {
  console.log("Request received for the weather-forecast action");

  if (!units || (units !== "metric" && units !== "imperial")) {
    units = "metric";
  }

  if (forecastDays < 1) {
    throw new Error("forecastDays must be at least 1");
  }
  if (forecastDays > 7) {
    throw new Error("forecastDays must be no more than 7");
  }

  const { latitude, longitude } = await getCoordinatesFromLocation({
    location,
    countryCode,
  });

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
    let responseJson = await response.json();

    // make the response array the same length as the forecastDays
    responseJson.daily = responseJson.daily.slice(0, forecastDays);

    responseJson = {
      lat: responseJson.lat,
      lon: responseJson.lon,
      timezone: responseJson.timezone,
      timezone_offset: responseJson.timezone_offset,
      location: location,
      forecastDays: forecastDays,
      countryCode: countryCode,
      daily: responseJson.daily.map((day: any, index: number) => ({
        dayIndex: index,
        temperatureMain: day.temp.day,
        temperatureMin: day.temp.min,
        temperatureMax: day.temp.max,
        weather: day.weather[0].main,
        units: units,
      })),
    };

    return responseJson;
  } catch (error) {
    console.error("Error:", error);
    return { error: `Error occurred: ${error}` };
  }
}
