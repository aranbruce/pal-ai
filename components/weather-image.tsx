import Image from "next/image";

export type WeatherType =
  | "Clear"
  | "Clouds"
  | "Rain"
  | "Drizzle"
  | "Thunderstorm"
  | "Snow"
  | "Mist"
  | "Smoke"
  | "Haze"
  | "Dust"
  | "Fog"
  | "Sand"
  | "Ash"
  | "Squall"
  | "Tornado";

interface WeatherImageProps {
  weather: WeatherType;
  width?: number;
  height?: number;
  className?: string;
}

export default function WeatherImage({
  weather,
  width = 64,
  height = 64,
  className,
}: WeatherImageProps) {
  const weatherIconMap: Record<WeatherType, string> = {
    Clear: "/images/weather/clear.svg",
    Clouds: "/images/weather/clouds.svg",
    Rain: "/images/weather/rain.svg",
    Drizzle: "/images/weather/drizzle.svg",
    Thunderstorm: "/images/weather/thunderstorm.svg",
    Snow: "/images/weather/snow.svg",
    Mist: "/images/weather/mist.svg",
    Smoke: "/images/weather/smoke.svg",
    Haze: "/images/weather/haze.svg",
    Dust: "/images/weather/dust.svg",
    Fog: "/images/weather/fog.svg",
    Sand: "/images/weather/sand.svg",
    Ash: "/images/weather/ash.svg",
    Squall: "/images/weather/squall.svg",
    Tornado: "/images/weather/tornado.svg",
  };

  return (
    <Image
      src={weatherIconMap[weather] || weatherIconMap.Clear}
      alt={`${weather} weather icon`}
      width={width}
      height={height}
      className={className}
    />
  );
}
