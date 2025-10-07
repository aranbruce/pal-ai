"use client";

import WeatherImage, { WeatherType } from "@/components/weather-image";

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

interface WeatherDisplayProps {
  data: WeatherResult;
}

export default function WeatherDisplay({ data }: WeatherDisplayProps) {
  const unitSymbol = data.units === "metric" ? "°C" : "°F";

  return (
    <div className="not-prose flex w-full flex-col items-start gap-2">
      <div
        className="text-weather-foreground flex w-full flex-col items-start gap-4 rounded-lg p-3 md:p-4"
        style={{ background: "var(--weather-gradient)" }}
      >
        <div className="flex flex-col gap-1">
          <h5 className="text-xs font-medium opacity-90">
            {new Date(data.currentDate).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h5>
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-row gap-1">
              <h2 className="text-2xl font-semibold">{data.current.temp}</h2>
              <h5>{unitSymbol}</h5>
            </div>
            <WeatherImage
              height={48}
              width={48}
              weather={data.current.weather as WeatherType}
            />
          </div>
          <p className="text-sm opacity-90">{data.current.weather}</p>
        </div>

        <div className="grid w-full auto-cols-min grid-cols-7 gap-4">
          {data.hourly.slice(0, 7).map((hour, index) => (
            <div className="flex w-8 flex-col items-center gap-1" key={index}>
              <h5 className="text-xs opacity-90">
                {index === 0
                  ? "Now"
                  : ((data.currentHour + index) % 24)
                      .toString()
                      .padStart(2, "0")}
              </h5>
              <WeatherImage
                height={32}
                width={32}
                weather={hour.weather as WeatherType}
              />
              <div className="flex flex-row items-center gap-[0.125rem] font-semibold">
                <h4 className="font-medium">{Math.round(hour.temp)}</h4>
                <h5 className="text-xs">°</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-muted-foreground text-xs">
        Location: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
      </div>
    </div>
  );
}
