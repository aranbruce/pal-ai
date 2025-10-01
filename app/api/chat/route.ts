import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { createOpenAI, openai } from "@ai-sdk/openai";

import { convertToCoreMessages, streamText, tool } from "ai";

import getCoordinatesFromLocation from "@/server/get-coordinates-from-location";
import getCurrentWeather from "@/server/get-current-weather";
import getLocationFromCoordinates from "@/server/get-location-from-coordinates";
import getMovieGenres from "@/server/get-movie-genres";
import getMovieRegions from "@/server/get-movie-regions";
import getNewsResults from "@/server/get-news-results";
import getWeatherForecast from "@/server/get-weather-forecast";
import getWebResults from "@/server/get-web-results";
import getWebpageContents from "@/server/get-webpage-content";
import searchForGifs from "@/server/search-for-gifs";
import searchForImages from "@/server/search-for-images";
import searchForMovies from "@/server/search-for-movies";
import searchForNowPlayingMovies from "@/server/search-for-now-playing-movies";

import {
  getCoordinatesFromLocationRequestSchema,
  getCurrentWeatherRequestSchema,
  getLocationFromCoordinatesRequestSchema,
  getMovieGenresRequestSchema,
  getMovieRegionsRequestSchema,
  getNewsResultsRequestSchema,
  getWeatherForecastRequestSchema,
  getWebpageContentRequestSchema,
  getWebResultsRequestSchema,
  searchForGifsRequestSchema,
  searchForImagesRequestSchema,
  searchForMoviesRequestSchema,
  searchForNowPlayingMoviesRequestSchema,
} from "@/libs/schema";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

function getModelFromModelVariable(modelVariable: string) {
  if (!modelVariable) {
    throw new Error("MODEL environment variable is not set");
  } else if (modelVariable.startsWith("gpt-")) {
    return openai(modelVariable);
  } else if (modelVariable.startsWith("mistral-")) {
    return mistral(modelVariable);
  } else if (modelVariable.startsWith("claude-")) {
    return anthropic(modelVariable);
  } else if (modelVariable.includes("gemini-")) {
    return google("models/gemini-pro");
  } else if (modelVariable.includes("llama3-")) {
    return groq(modelVariable);
  } else {
    throw new Error("Model is not a supported model");
  }
}

function getTodaysDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  const { messages, data } = await request.json();

  const modelVariable = data?.model || "gpt-4o-mini";
  const model = getModelFromModelVariable(modelVariable);
  const location = data?.location?.coordinates;
  const todaysDate = getTodaysDate();

  const result = streamText({
    model: model,
    messages: convertToCoreMessages(messages),
    temperature: 0.2,
    maxSteps: 10,
    system: `
      You are an AI designed to help users with their queries. You can perform tools like searching the web,
      help users find information from the web, get the weather or find out the latest news.
      Today's date is ${todaysDate}.
      If asked to describe an image or asked about an image that the user has been provided, assume the user is visually impaired and provide a description of the image.
      If you need to get the coordinates of a location, you can use the tool \`get_coordinates_from_location\`.
      If you need to get the name of a location based on the latitude and longitude, you can use the tool \`get_location_from_coordinates\`.
      If you do not know a user's location, you can ask the user for their location.
      If someone asks you to get the current weather, you can use the tool \`get_current_weather\`.
      If someone asks you to get the weather forecast or how the weather will look in the future, you can use the tool \`get_weather_forecast\`.
      If someone asks you to get the current weather or the weather forecast and does not provide a unit, you can infer the unit based on the location.
      If someone asks you to get the content of a webpage, you can use the tool \`get_webpage_content\`.
      If someone asks you to search the web for information on a given topic, you can use the tool \`get_web_results\`. After getting the results, you should call the \`get_webpage_content\` tool.
      If someone asks you to search the web for news on a given topic, you can use the tool \`get_news_web_results\`. After getting the results, you should call the \`get_webpage_content\` tool.
      You should call the \`get_webpage_content\` after getting results from the \`get_web_results\` or \`get_news_web_results\` tools.
      If someone asks a question about movies, you can use the tool \`search_for_movies\`.
      If someone asks you about the top rated movies, you can use the tool \`search_for_movies\`.
      If someone asks you to search for movies that came out recently use the tool \`search_for_now_playing_movies\`.
      Use the tool \`get_movie_genres\` to get a mapping of movie genres to their respective IDs for use in the \`search_for_movies\` tool.
      If someone asks you to find a gif, you can use the tool \`search_for_gifs\`.
      When you have called the \`search_for_images\` tools, only reply with some suggested related search queries. Do not show each image in your response.
      When you have called the \`search_for_gifs\` tools, only reply with some suggested related search queries. Do not show each gif in your response.
      When you have called the \`search_for_movies\` tools, Recommend the top 3 movies. Do not show each movie in your response. Do not show images of the movie in your response
      Do not try to use any other tools that are not mentioned here.
      If it is appropriate to use a tool, you can use the tool to get the information. You do not need to explain the tool to the user.
      ${location ? `The user is located at ${location.latitude}, ${location.longitude}. You can find the name of the location by using the \`get_location_from_coordinates'\ tool` : ""}`,

    tools: {
      get_coordinates_from_location: tool({
        description:
          "Get the coordinates (latitude and longitude) of a location",
        parameters: getCoordinatesFromLocationRequestSchema,
        execute: async function ({ location, countryCode }) {
          const result = await getCoordinatesFromLocation({
            location,
            countryCode,
          });
          return result;
        },
      }),
      get_location_from_coordinates: tool({
        description:
          "Get the name of a location based on the latitude and longitude",
        parameters: getLocationFromCoordinatesRequestSchema,
        execute: async function ({ latitude, longitude }) {
          const result = await getLocationFromCoordinates({
            latitude,
            longitude,
          });
          return result;
        },
      }),
      get_current_weather: tool({
        description: "Get the current weather forecast for a location",
        parameters: getCurrentWeatherRequestSchema,
        execute: async function ({ location, countryCode, units }) {
          const result = await getCurrentWeather({
            location,
            countryCode,
            units,
          });
          return result;
        },
      }),
      get_weather_forecast: tool({
        description: "Get the weather forecast for a location",
        parameters: getWeatherForecastRequestSchema,
        execute: async function ({
          location,
          forecastDays,
          countryCode,
          units,
        }) {
          const result = await getWeatherForecast({
            location,
            forecastDays,
            countryCode,
            units,
          });
          return result;
        },
      }),
      get_webpage_content: tool({
        description: "Get the content of a webpage",
        parameters: getWebpageContentRequestSchema,
        execute: async function ({ urls }: { urls: string[] }) {
          const result = await getWebpageContents(urls);
          return result;
        },
      }),
      get_web_results: tool({
        description:
          "Returns a list of websites that contain information on a given topic. It should be used for web searches",
        parameters: getWebResultsRequestSchema,
        execute: async function ({
          query,
          country,
          freshness,
          units,
          count,
          offset,
        }) {
          const result = await getWebResults({
            query,
            country,
            freshness,
            units,
            count,
            offset,
          });
          return result;
        },
      }),
      get_news_web_results: tool({
        description:
          "Get a list of websites that contain news on a given topic. It should be used for news searches",
        parameters: getNewsResultsRequestSchema,
        execute: async function ({
          query,
          country,
          freshness,
          units,
          count,
          offset,
        }) {
          const result = await getNewsResults({
            query,
            country,
            freshness,
            units,
            count,
            offset,
          });
          return result;
        },
      }),
      search_for_images: tool({
        description: "Search for images on the web for a given topic or query",
        parameters: searchForImagesRequestSchema,
        execute: async function ({ query, country, count }) {
          const result = await searchForImages({ query, country, count });
          return result;
        },
      }),
      search_for_gifs: tool({
        description: "Search for gifs on the web for a given topic or query",
        parameters: searchForGifsRequestSchema,
        execute: async function ({ query, limit, offset, rating }) {
          const result = await searchForGifs({
            query,
            limit,
            offset,
            rating,
          });
          return result;
        },
      }),
      get_movie_genres: tool({
        description:
          "Get a mapping of movie genres to their respective IDs for use in the search_for_movies tool",
        parameters: getMovieGenresRequestSchema,
        execute: async function () {
          const result = await getMovieGenres();
          return result;
        },
      }),
      get_movie_regions: tool({
        description:
          "Get a list of the countries that can be used in the search_for_movies tool",
        parameters: getMovieRegionsRequestSchema,
        execute: async function () {
          const result = await getMovieRegions();
          return result;
        },
      }),
      search_for_movies: tool({
        description:
          "Search for movies based genres, release date, popularity, and more",
        parameters: searchForMoviesRequestSchema,
        execute: async function ({
          page,
          region,
          minDate,
          maxDate,
          sortBy,
          voteAverageGreaterThan,
          voteAverageLessThan,
          withGenres,
          withoutGenres,
          year,
        }) {
          const result = await searchForMovies({
            page,
            region,
            minDate,
            maxDate,
            sortBy,
            voteAverageGreaterThan,
            voteAverageLessThan,
            withGenres,
            withoutGenres,
            year,
          });
          return result;
        },
      }),
      search_for_now_playing_movies: tool({
        description: "Search for movies that are currently playing",
        parameters: searchForNowPlayingMoviesRequestSchema,
        execute: async function ({ page, region }) {
          const result = await searchForNowPlayingMovies({
            page,
            region,
          });
          return result;
        },
      }),
    },

    onFinish: async ({ response }) => {
      // You can implement chat saving here if needed
      console.log("Chat finished", response);
    },
  });

  return result.toDataStreamResponse();
}
