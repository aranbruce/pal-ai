"use client";

import { ActionButton } from "../action-button";
import { CurrentWeatherCardProps } from "./current-weather-card";

export default function CurrentWeatherButtons({
  currentWeather,
}: {
  currentWeather: CurrentWeatherCardProps;
}) {
  // Note: Interactive weather buttons are temporarily disabled during migration to AI SDK UI
  // These can be re-enabled by using useChat with the append function
  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      <ActionButton
        onClick={() => {
          // TODO: Implement with useChat append
          console.log("Get 3 day forecast for", currentWeather.location);
        }}
        label="3 day forecast"
      />
      <ActionButton
        onClick={() => {
          // TODO: Implement with useChat append
          console.log("Get 5 day forecast for", currentWeather.location);
        }}
        label="5 day forecast"
      />
      <ActionButton
        onClick={() => {
          // TODO: Implement with useChat append
          const newLocation =
            currentWeather.location === "New York" ? "London" : "New York";
          console.log("Get weather for", newLocation);
        }}
        label={`Weather in ${
          currentWeather.location === "New York" ? "London" : "New York"
        }`}
      />
    </div>
  );
}
