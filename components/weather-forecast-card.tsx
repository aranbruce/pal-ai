"use client";

import WeatherImage, { WeatherType } from "@/components/weather-image";
import { CountryCode, Units } from "@/lib/schema";

export interface WeatherForecastProps {
  location: string;
  forecastDays: number;
  countryCode?: CountryCode | undefined;
  daily: WeatherForecastDayProps[];
}

interface WeatherForecastDayProps {
  dayIndex: number;
  temperatureMain: number;
  temperatureMin: number;
  temperatureMax: number;
  weather: WeatherType;
  units: Units;
}

export interface WeatherForecastCardProps {
  data: {
    location: string;
    forecastDays: number;
    countryCode?: CountryCode;
    daily: WeatherForecastDayProps[];
  };
}

function getDayOfWeek(day: number) {
  if (day === 0) {
    return "Today";
  }
  const today = new Date().getDay();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[(today + day) % 7];
}

export default function WeatherForecastCard({
  data,
}: WeatherForecastCardProps) {
  return (
    <div className="not-prose flex w-full flex-col gap-2">
      <div className="text-weather-foreground flex max-w-full flex-col items-start gap-4 rounded-lg bg-[image:var(--weather-gradient)] p-3 md:p-4">
        <div className="flex flex-col gap-1">
          <h5 className="text-xs font-medium opacity-90">
            {data.forecastDays} Day Forecast for {data.location}
            {data.countryCode ? `, ${data.countryCode}` : ""}
          </h5>
        </div>

        <div className="grid w-full auto-cols-min grid-cols-7 gap-4">
          {data.daily.map((day: WeatherForecastDayProps, index: number) => (
            <div className="flex w-12 flex-col items-center gap-1" key={index}>
              <h5 className="text-xs opacity-90">{getDayOfWeek(index)}</h5>
              <WeatherImage
                height={32}
                width={32}
                weather={day.weather as WeatherType}
              />
              <div className="flex flex-col items-center gap-0">
                <div className="flex flex-row items-center gap-[0.125rem] font-semibold">
                  <h4 className="font-medium">
                    {Math.round(day.temperatureMain)}
                  </h4>
                  <h5 className="text-xs">°</h5>
                </div>
                <p className="text-[0.625rem] opacity-75">
                  {Math.round(day.temperatureMin)}° -{" "}
                  {Math.round(day.temperatureMax)}°
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
