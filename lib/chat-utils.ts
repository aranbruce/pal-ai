import {
  CalendarDaysIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from "@heroicons/react/16/solid";
import type { ToolUIPart } from "ai";

// Helper function to check if a part is a ToolUIPart with improved type narrowing
export function isToolUIPart(part: unknown): part is ToolUIPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    typeof part.type === "string" &&
    part.type.startsWith("tool-") &&
    "state" in part &&
    typeof part.state === "string"
  );
}

// Helper function to get the icon for a tool based on its type
export function getToolIcon(
  toolType: string,
): React.ComponentType<{ className?: string }> {
  if (toolType.includes("get_current_weather")) {
    return CloudIcon;
  }
  if (toolType.includes("get_weather_forecast")) {
    return CalendarDaysIcon;
  }
  if (toolType.includes("search_web")) {
    return GlobeAltIcon;
  }
  if (toolType.includes("get_webpage_contents")) {
    return DevicePhoneMobileIcon;
  }
  // Return a default icon component instead of undefined
  return () => null; // Default fallback component
}

// Helper function to extract sources from web search results
export function extractSourcesFromMessage(message: {
  parts?: unknown[];
}): Array<{ url: string; title: string }> {
  const sources: Array<{ url: string; title: string }> = [];

  if (!message.parts) return sources;

  for (const part of message.parts) {
    // Check if this is a web search tool with results
    if (
      isToolUIPart(part) &&
      part.type.includes("search_web") &&
      part.output &&
      Array.isArray(part.output)
    ) {
      for (const result of part.output) {
        if (result.url && result.title) {
          sources.push({
            url: result.url,
            title: result.title,
          });
        }
      }
    }

    // Check for source-url parts (from AI SDK's native source support)
    if (
      typeof part === "object" &&
      part !== null &&
      "type" in part &&
      part.type === "source-url" &&
      "url" in part &&
      typeof part.url === "string"
    ) {
      sources.push({
        url: part.url,
        title:
          "title" in part && typeof part.title === "string"
            ? part.title
            : part.url,
      });
    }
  }

  return sources;
}
