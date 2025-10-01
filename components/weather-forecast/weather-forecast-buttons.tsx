"use client";

import { WeatherForecastProps } from "@/components/weather-forecast/weather-forecast-card";
import { ActionButton } from "../action-button";

export default function WeatherForecastButtons({
  weatherForecast,
}: {
  weatherForecast: WeatherForecastProps;
}) {
  // Note: Interactive weather buttons are temporarily disabled during migration to AI SDK UI
  // These can be re-enabled by using useChat with the append function
  return (
    <div className="flex flex-row items-center gap-2">
      <ActionButton
        onClick={() => {
          // TODO: Implement with useChat append
          console.log("Get current weather for", weatherForecast.location);
        }}
        label={`Current weather in ${weatherForecast.location}`}
      />
    </div>
  );
}
