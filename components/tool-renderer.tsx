import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import WeatherDisplay from "@/components/weather-display";
import WeatherForecastCard, {
  WeatherForecastCardProps,
} from "@/components/weather-forecast-card";
import { getToolIcon, isToolUIPart } from "@/lib/chat-utils";
import type { ToolUIPart } from "ai";
import { Fragment } from "react";

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

interface ToolRendererProps {
  part: ToolUIPart;
  messageId: string;
  partIndex: number;
}

export function ToolRenderer({
  part,
  messageId,
  partIndex,
}: ToolRendererProps) {
  if (!isToolUIPart(part)) return null;

  // Check if this is a weather tool with valid output
  const isWeatherTool =
    part.type.includes("get_current_weather") &&
    part.output &&
    typeof part.output === "object" &&
    "current" in part.output;

  // Check if this is a weather forecast tool with valid output
  const isWeatherForecastTool =
    part.type.includes("get_weather_forecast") &&
    part.output &&
    typeof part.output === "object" &&
    "daily" in part.output;

  // If it's a weather tool, render the weather card beneath the tool component
  if (isWeatherTool) {
    return (
      <Fragment key={`${messageId}-${part.type}-${partIndex}`}>
        <Tool defaultOpen={false}>
          <ToolHeader
            type={part.type}
            state={part.state}
            icon={getToolIcon(part.type)}
          />
          <ToolContent>
            <ToolInput input={part.input} />
            <ToolOutput output={part.output} errorText={part.errorText} />
          </ToolContent>
        </Tool>
        <WeatherDisplay data={part.output as WeatherResult} />
      </Fragment>
    );
  }

  // If it's a weather forecast tool, render the weather forecast card beneath the tool component
  if (isWeatherForecastTool) {
    return (
      <Fragment key={`${messageId}-${part.type}-${partIndex}`}>
        <Tool defaultOpen={false}>
          <ToolHeader
            type={part.type}
            state={part.state}
            icon={getToolIcon(part.type)}
          />
          <ToolContent>
            <ToolInput input={part.input} />
            <ToolOutput output={part.output} errorText={part.errorText} />
          </ToolContent>
        </Tool>
        <WeatherForecastCard
          data={part.output as WeatherForecastCardProps["data"]}
        />
      </Fragment>
    );
  }

  // For other tools, render normally
  return (
    <Tool key={`${messageId}-${part.type}-${partIndex}`} defaultOpen={false}>
      <ToolHeader
        type={part.type}
        state={part.state}
        icon={getToolIcon(part.type)}
      />
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput output={part.output} errorText={part.errorText} />
      </ToolContent>
    </Tool>
  );
}
