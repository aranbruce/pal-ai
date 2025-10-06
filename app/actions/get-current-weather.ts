"use server";

interface WeatherResult {
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

export async function getCurrentWeather({
  latitude,
  longitude,
  units = "metric",
}: {
  latitude: number;
  longitude: number;
  units?: "metric" | "imperial";
}): Promise<WeatherResult> {
  console.log("Request received for get-current-weather action");
  console.log("Coordinates:", { latitude, longitude, units });

  try {
    const url = new URL(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&exclude=minutely,daily,alerts&units=${units}`,
    );
    const headers = {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
    };
    console.log(`Requesting weather data from ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseJson = await response.json();

    const weatherResult: WeatherResult = {
      latitude,
      longitude,
      currentHour: new Date().getHours(),
      currentDate: new Date().getTime(),
      units: units,
      current: {
        temp: Math.round(responseJson.current.temp),
        weather: responseJson.current.weather[0].main,
      },
      hourly: responseJson.hourly.slice(0, 24).map((hour: any) => ({
        temp: Math.round(hour.temp),
        weather: hour.weather[0].main,
      })),
    };

    return weatherResult;
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw new Error(
      `Failed to fetch weather data: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
