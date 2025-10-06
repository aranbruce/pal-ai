"use server";

import {
  GetLocationFromCoordinatesRequest,
  LocationResponse,
} from "@/lib/schema";

export async function getLocationFromCoordinates({
  latitude,
  longitude,
}: GetLocationFromCoordinatesRequest): Promise<LocationResponse> {
  try {
    const url = new URL(
      `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&limit=1`,
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
      throw new Error(
        `Location not found for coordinates: ${latitude}, ${longitude}`,
      );
    }

    return {
      location: data[0].name,
      country: data[0].country,
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
