import {
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { Image } from "@/components/ai-elements/image";
import WeatherDisplay from "@/components/weather-display";
import WeatherForecastCard, {
  WeatherForecastCardProps,
} from "@/components/weather-forecast-card";
import type { Experimental_GeneratedImage } from "ai";
import { Cloud, Globe, Search } from "lucide-react";

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

interface ToolPart {
  type: string;
  state?: string;
  output?: unknown;
}

interface ToolRendererProps {
  part: ToolPart;
  messageId: string;
  index: number;
}

function getLucideToolIcon(toolType: string) {
  if (
    toolType.includes("get_current_weather") ||
    toolType.includes("get_weather_forecast")
  ) {
    return Cloud;
  }
  if (toolType.includes("search_web")) {
    return Search;
  }
  if (toolType.includes("get_webpage_contents")) {
    return Globe;
  }
  return Search; // Default icon
}

function formatToolName(toolType: string): string {
  const toolName = toolType.split("-").slice(1).join("-");
  return toolName
    .split("_")
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(" ");
}

function getStepStatus(part: ToolPart): "pending" | "active" | "complete" {
  switch (part.state) {
    case "input-streaming":
      return "pending";
    case "input-available":
      return "active";
    case "output-available":
      return "complete";
    case "output-error":
      return "complete"; // Show as complete but with error styling
    default:
      return "complete";
  }
}

function renderSearchResults(part: ToolPart, messageId: string) {
  if (
    !part.type.includes("search_web") ||
    !part.output ||
    !Array.isArray(part.output) ||
    part.output.length === 0
  ) {
    return null;
  }

  return (
    <ChainOfThoughtSearchResults>
      {part.output
        .slice(0, 3)
        .map((result: { url: string; title: string }, idx: number) => (
          <ChainOfThoughtSearchResult
            key={`${messageId}-search-result-${idx}`}
            onClick={() => window.open(result.url, "_blank")}
          >
            {String(result.title || result.url)}
          </ChainOfThoughtSearchResult>
        ))}
    </ChainOfThoughtSearchResults>
  );
}

function renderWeatherDisplay(part: ToolPart) {
  const isWeatherTool =
    part.type.includes("get_current_weather") &&
    part.output &&
    typeof part.output === "object" &&
    "current" in part.output;

  if (!isWeatherTool) return null;

  return <WeatherDisplay data={part.output as WeatherResult} />;
}

function renderWeatherForecast(part: ToolPart) {
  const isWeatherForecastTool =
    part.type.includes("get_weather_forecast") &&
    part.output &&
    typeof part.output === "object" &&
    "daily" in part.output;

  if (!isWeatherForecastTool) return null;

  return (
    <WeatherForecastCard
      data={part.output as WeatherForecastCardProps["data"]}
    />
  );
}

function renderCoordinates(part: ToolPart) {
  const isCoordinateTool =
    part.type.includes("get_coordinates") &&
    part.output &&
    typeof part.output === "object" &&
    ("latitude" in part.output || "lat" in part.output);

  if (!isCoordinateTool) return null;

  const coordOutput = part.output as {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    location?: string;
  };

  return (
    <div className="text-muted-foreground mt-2 text-sm">
      <div className="font-medium">Coordinates:</div>
      <div className="mt-1 space-y-1">
        {coordOutput.latitude && coordOutput.longitude ? (
          <>
            <div>Latitude: {coordOutput.latitude}</div>
            <div>Longitude: {coordOutput.longitude}</div>
          </>
        ) : coordOutput.lat && coordOutput.lng ? (
          <>
            <div>Latitude: {coordOutput.lat}</div>
            <div>Longitude: {coordOutput.lng}</div>
          </>
        ) : null}
        {coordOutput.location && (
          <div className="text-xs opacity-75">
            Location: {coordOutput.location}
          </div>
        )}
      </div>
    </div>
  );
}

function renderLocation(part: ToolPart) {
  const isLocationTool =
    part.type.includes("get_location") &&
    part.output &&
    typeof part.output === "object" &&
    ("location" in part.output ||
      "address" in part.output ||
      "city" in part.output);

  if (!isLocationTool) return null;

  const locationOutput = part.output as {
    location?: string;
    address?: string;
    city?: string;
    country?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  };

  return (
    <div className="text-muted-foreground mt-2 text-sm">
      <div className="font-medium">Location:</div>
      <div className="mt-1 space-y-1">
        {locationOutput.location ? (
          <div className="font-medium">{locationOutput.location}</div>
        ) : locationOutput.address ? (
          <div className="font-medium">{locationOutput.address}</div>
        ) : locationOutput.city ? (
          <div className="font-medium">
            {locationOutput.city}
            {locationOutput.state && `, ${locationOutput.state}`}
            {locationOutput.country && `, ${locationOutput.country}`}
          </div>
        ) : null}
        {locationOutput.latitude && locationOutput.longitude ? (
          <div className="text-xs opacity-75">
            Coordinates: {locationOutput.latitude}, {locationOutput.longitude}
          </div>
        ) : locationOutput.lat && locationOutput.lng ? (
          <div className="text-xs opacity-75">
            Coordinates: {locationOutput.lat}, {locationOutput.lng}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ToolRenderer({ part, messageId, index }: ToolRendererProps) {
  const toolName = formatToolName(part.type);
  const stepStatus = getStepStatus(part);
  const Icon = getLucideToolIcon(part.type);

  return (
    <ChainOfThoughtStep
      key={`${messageId}-tool-${index}`}
      icon={Icon}
      label={toolName}
      status={stepStatus}
    >
      {renderSearchResults(part, messageId)}
      {renderWeatherDisplay(part)}
      {renderWeatherForecast(part)}
      {renderCoordinates(part)}
      {renderLocation(part)}
    </ChainOfThoughtStep>
  );
}

export function GeneratedImageRenderer({
  part,
  messageId,
  index,
}: {
  part: ToolPart;
  messageId: string;
  index: number;
}) {
  if (
    !("image" in part) ||
    !part.image ||
    typeof part.image !== "object" ||
    !("base64" in part.image)
  ) {
    return null;
  }

  const imageData = part.image as Experimental_GeneratedImage;

  return (
    <Image
      key={`${messageId}-${part.type}-${index}`}
      base64={imageData.base64}
      mediaType={imageData.mediaType}
      alt="Generated image"
    />
  );
}
