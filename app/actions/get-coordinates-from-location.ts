"use server";

import { CoordinatesResponse, GetCoordinatesRequest } from "@/lib/schema";

export async function getCoordinatesFromLocation({
  location,
  countryCode,
}: GetCoordinatesRequest): Promise<CoordinatesResponse> {
  try {
    const query = countryCode ? `${location},${countryCode}` : location;
    const url = new URL(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`,
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`Location not found: ${location}`);
    }

    return {
      latitude: data[0].lat,
      longitude: data[0].lon,
    };
  } catch (error) {
    console.error("Error getting coordinates:", error);
    throw error;
  }
}
