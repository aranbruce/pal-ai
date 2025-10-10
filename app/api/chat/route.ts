import { getCoordinatesFromLocation } from "@/app/actions/get-coordinates-from-location";
import { getCurrentWeather } from "@/app/actions/get-current-weather";
import { getLocationFromCoordinates } from "@/app/actions/get-location-from-coordinates";
import { getWeatherForecast } from "@/app/actions/get-weather-forecast";
import { getWebResults } from "@/app/actions/get-web-results";
import { getWebpageContents } from "@/app/actions/get-webpage-contents";
import { createGateway } from "@ai-sdk/gateway";
import { withTracing } from "@posthog/ai";

import {
  consumeStream,
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { PostHog } from "posthog-node";
import { z } from "zod";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1/ai",
});

const phClient = new PostHog(
  "phc_7DDJRJb09qbR0TXIqI5HcU13J2eMx4rEB1ZknovWyDI",
  { host: "https://eu.i.posthog.com" },
);

function getTodaysDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    const {
      messages,
      model,
      traceId, // Add this for client-provided trace ID
      webSearch,
      data,
    }: {
      messages: UIMessage[];
      model?: string;
      traceId?: string; // Add this type
      webSearch?: boolean;
      data?: {
        location?: { coordinates?: { latitude: number; longitude: number } };
      };
    } = await request.json();

    const location = data?.location?.coordinates;
    const todaysDate = getTodaysDate();
    const selectedModel = model || "openai/gpt-5"; // Use the model from request or default to gpt-5
    console.log("traceId: ", traceId);

    const actualModel = withTracing(gateway(selectedModel), phClient, {
      posthogTraceId: traceId || crypto.randomUUID(),
      posthogProperties: {
        conversationId: traceId || "unknown",
        paid: false,
      },
      posthogPrivacyMode: false,
    });

    const result = streamText({
      model: actualModel,
      messages: convertToModelMessages(messages),
      temperature: 0.2,
      maxRetries: 4,
      stopWhen: stepCountIs(20), // Stop after 20 steps
      abortSignal: request.signal, // Forward the abort signal
      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: "word", // optional: defaults to 'word'
      }),
      prepareStep: async ({ stepNumber }) => {
        // Force web search tool on the first step if webSearch is enabled
        if (stepNumber === 0 && webSearch) {
          return {
            toolChoice: { type: "tool", toolName: "search_web" },
          };
        }
        // Use default settings for other steps
      },
      tools: {
        search_web: tool({
          description:
            "Search the web for current information, news, articles, and other online content. Use this when you need up-to-date information or to find relevant web pages.",
          inputSchema: z.object({
            query: z.string().describe("The search query string"),
            country: z
              .string()
              .optional()
              .describe(
                "Country code for localized results (e.g., 'us', 'gb')",
              ),
            freshness: z
              .enum(["past-day", "past-week", "past-month", "past-year"])
              .optional()
              .describe("Filter results by how recent they are"),
            count: z
              .number()
              .min(1)
              .max(20)
              .optional()
              .default(8)
              .describe("Number of results to return (1-20)"),
          }),
          execute: async ({ query, country, freshness, count }) => {
            return await getWebResults({ query, country, freshness, count });
          },
        }),
        get_webpage_contents: tool({
          description:
            "Extract and return the contents of one or more web pages. Useful for reading articles, documentation, or any web content.",
          inputSchema: z.object({
            urls: z
              .array(z.url())
              .min(1)
              .describe("Array of URLs to extract content from"),
          }),
          execute: async ({ urls }) => {
            return await getWebpageContents(urls);
          },
        }),
        get_current_weather: tool({
          description:
            "Get the current weather and hourly forecast for a specific location using latitude and longitude coordinates. Returns temperature, weather conditions, and hourly forecast.",
          inputSchema: z.object({
            latitude: z
              .number()
              .min(-90)
              .max(90)
              .describe("Latitude of the location (-90 to 90)"),
            longitude: z
              .number()
              .min(-180)
              .max(180)
              .describe("Longitude of the location (-180 to 180)"),
            units: z
              .enum(["metric", "imperial"])
              .optional()
              .default("metric")
              .describe(
                "Temperature units: 'metric' for Celsius, 'imperial' for Fahrenheit",
              ),
          }),
          execute: async ({ latitude, longitude, units }) => {
            return await getCurrentWeather({ latitude, longitude, units });
          },
        }),
        get_weather_forecast: tool({
          description:
            "Get the weather forecast for a specific location for the next 1-7 days using latitude and longitude coordinates. Returns daily temperature and weather conditions.",
          inputSchema: z.object({
            latitude: z
              .number()
              .min(-90)
              .max(90)
              .describe("Latitude of the location (-90 to 90)"),
            longitude: z
              .number()
              .min(-180)
              .max(180)
              .describe("Longitude of the location (-180 to 180)"),
            forecastDays: z
              .number()
              .min(1)
              .max(7)
              .describe("Number of days to forecast (1-7)"),
            units: z
              .enum(["metric", "imperial"])
              .optional()
              .default("metric")
              .describe(
                "Temperature units: 'metric' for Celsius, 'imperial' for Fahrenheit",
              ),
          }),
          execute: async ({ latitude, longitude, forecastDays, units }) => {
            return await getWeatherForecast({
              latitude,
              longitude,
              forecastDays,
              units,
            });
          },
        }),
        get_coordinates_from_location: tool({
          description:
            "Convert a location name (city, town, etc.) to latitude and longitude coordinates. Useful for geocoding location names.",
          inputSchema: z.object({
            location: z
              .string()
              .describe("The name of the location (city, town, etc.)"),
            countryCode: z
              .string()
              .optional()
              .describe(
                "Optional ISO 3166 country code (e.g., 'US', 'GB', 'CA') for more accurate results",
              ),
          }),
          execute: async ({ location, countryCode }) => {
            return await getCoordinatesFromLocation({ location, countryCode });
          },
        }),
        get_location_from_coordinates: tool({
          description:
            "Convert latitude and longitude coordinates to a location name. Useful for reverse geocoding.",
          inputSchema: z.object({
            latitude: z
              .number()
              .min(-90)
              .max(90)
              .describe("Latitude of the location (-90 to 90)"),
            longitude: z
              .number()
              .min(-180)
              .max(180)
              .describe("Longitude of the location (-180 to 180)"),
          }),
          execute: async ({ latitude, longitude }) => {
            return await getLocationFromCoordinates({ latitude, longitude });
          },
        }),
      },

      system: `
      You are an AI designed to help users with their queries. You can perform tools like searching the web,
      help users find information from the web, get the weather or find out the latest news.
      IMPORTANT: Respond in markdown format
      Today's date is ${todaysDate}.
      ${location ? `The user's location is ${JSON.stringify(location)}.` : ""}
      The model you are using is ${selectedModel}.
      If asked to describe an image or asked about an image that the user has been provided, assume the user is visually impaired and provide a description of the image.
      When you finish thinking and have gathered all the information you need, provide a final answer to the user that is concise and informative.
      
      IMPORTANT TOOL USAGE GUIDELINES:
      - When calling any tool, call the tool before providing your final answer.
      - You have access to a "search_web" tool that can find current information from the internet. Use it when users ask about recent events, current information, or need to find online resources.
      - You have access to a "get_webpage_contents" tool that can extract and return the contents of web pages. Use it to read articles, documentation, or any web content the user is interested in.
      - You have access to a "get_current_weather" tool that gets current weather using latitude/longitude coordinates.
      - You have access to a "get_weather_forecast" tool that gets weather forecasts for 1-7 days using latitude/longitude coordinates.
      - You have access to a "get_coordinates_from_location" tool that converts location names to latitude/longitude coordinates (geocoding). Use this first when users provide location names.
      - You have access to a "get_location_from_coordinates" tool that converts latitude/longitude coordinates to location names (reverse geocoding).
      - For weather requests with location names, first use "get_coordinates_from_location" to get coordinates, then use the weather tools.
      - When you use the "search_web" tool, always provide a concise summary of the results you found, including titles, URLs, and brief descriptions.
      - When you use the "get_webpage_contents" tool, summarize the key points from the extracted content to answer the user's query effectively.
      - When you use the "get_current_weather" tool, a beautiful interactive weather card is automatically displayed to the user showing the temperature, conditions, and hourly forecast.      
      `,

      onFinish: async () => {
        // You can implement chat saving here if needed
        // console.log("Chat finished", response);
      },

      onAbort: ({ steps }) => {
        // Handle cleanup when stream is aborted
        console.log("Stream aborted after", steps.length, "steps");
        // You can add additional cleanup logic here, e.g.:
        // - Persist partial results to database
        // - Log abort events for analytics
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true, // Enable reasoning in UI messages
      sendSources: true, // Enable sources in UI messages
      onFinish: async () => {
        // Handle cleanup logic
        // You can add abort-specific or normal completion logic here
      },
      consumeSseStream: consumeStream,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Chat API Error:", error);

    // Return a structured error response
    return new Response(
      JSON.stringify({
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while processing your request.",
          type: "api_error",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
