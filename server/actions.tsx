"use server";

import { openai, createOpenAI } from "@ai-sdk/openai";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

import {
  CoreMessage,
  LanguageModelV1,
  streamObject,
  streamText,
  tool,
  generateId,
} from "ai";
import { createStreamableUI, getAIState, getMutableAIState } from "ai/rsc";

import { AI, ClientMessage } from "@/app/ai";

import getCoordinatesFromLocation from "@/server/get-coordinates-from-location";
import getLocationFromCoordinates from "@/server/get-location-from-coordinates";
import getCurrentWeather from "@/server/get-current-weather";
import getWeatherForecast from "@/server/get-weather-forecast";
import getWebResults from "@/server/get-web-results";
import getNewsResults from "@/server/get-news-results";
import searchForImages, { ImageResult } from "./search-for-images";
import searchForMovies from "@/server/search-for-movies";
import searchForNowPlayingMovies from "@/server/search-for-now-playing-movies";
import getMovieGenres from "@/server/get-movie-genres";
import getMovieRegions from "@/server/get-movie-regions";
import searchForGifs, { GifResult } from "@/server/search-for-gifs";
import getWebpageContents from "@/server/get-webpage-content";

import CurrentWeatherCard from "@/components/current-weather/current-weather-card";
import Spinner from "@/components/spinner";
import WebResultGroup from "@/components/web-results/web-result-group";
import WeatherForecastCard from "@/components/weather-forecast/weather-forecast-card";
import MovieCardGroup from "@/components/movie-card/movie-card-group";
import MarkdownContainer from "@/components/markdown";
import ExampleMessageCardGroup from "@/components/example-message/example-message-group";

import { ExampleMessageCardProps } from "@/components/example-message/example-message-card";

import {
  CountryCode,
  exampleMessageSchema,
  getCoordinatesFromLocationRequestSchema,
  getLocationFromCoordinatesRequestSchema,
  getCurrentWeatherRequestSchema,
  getWeatherForecastRequestSchema,
  getWebpageContentRequestSchema,
  searchForGifsRequestSchema,
  searchForImagesRequestSchema,
  searchForMoviesRequestSchema,
  getWebResultsRequestSchema,
  getNewsResultsRequestSchema,
  Units,
  getMovieGenresRequestSchema,
  getMovieRegionsRequestSchema,
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

export async function continueConversation(
  content: string,
  attachment?: any,
): Promise<ClientMessage> {
  "use server";

  const aiState = getMutableAIState<typeof AI>();
  const contentStream = createStreamableUI();
  const displayStream = createStreamableUI();
  const spinnerStream = createStreamableUI(<Spinner />);
  const modelVariable = aiState.get().currentModelVariable;
  const model: LanguageModelV1 = getModelFromModelVariable(modelVariable);
  const location = aiState.get().location?.coordinates;
  const todaysDate = getTodaysDate();

  if (attachment) {
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: content,
            },
            {
              type: "image",
              image: attachment.url,
            },
          ],
        },
      ],
    });
  } else {
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          role: "user",
          content: content,
        },
      ],
    });
  }

  const history = aiState.get().messages.map((message: CoreMessage) => ({
    role: message.role,
    content: message.content,
  }));

  (async () => {
    try {
      const result = await streamText({
        model: model,
        temperature: 0.2,
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
        messages: history as CoreMessage[],
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
            description:
              "Search for images on the web for a given topic or query",
            parameters: searchForImagesRequestSchema,
            execute: async function ({ query, country, count }) {
              contentStream.update(
                <div className="animate-text_loading">
                  Searching for images of {query}...
                </div>,
              );
              const result = await searchForImages({ query, country, count });
              return result;
            },
          }),
          search_for_gifs: tool({
            description:
              "Search for gifs on the web for a given topic or query",
            parameters: searchForGifsRequestSchema,
            execute: async function ({ query, limit, offset, rating }) {
              contentStream.update(
                <div className="animate-text_loading">
                  Searching for gifs of {query}...
                </div>,
              );
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
              contentStream.update(
                <div className="animate-text_loading">
                  Searching for movies...
                </div>,
              );
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
              contentStream.update(
                <div className="animate-text_loading">
                  Searching for movies now playing...
                </div>,
              );
              const result = await searchForNowPlayingMovies({
                page,
                region,
              });
              return result;
            },
          }),
        },
        maxSteps: 10,

        onStepFinish({ toolCalls, toolResults, usage }) {
          console.log("step finished");
          // console.log("Tool Calls: ", toolCalls);
          if (toolCalls.length === 0) {
            return;
          }

          aiState.update({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                role: "assistant",
                content: toolCalls,
              },
              {
                role: "tool",
                content: toolResults,
              },
            ],
          });
          // console.log("Tool Calls: ", toolCalls);
          // console.log("Tool Results: ", toolResults);
          // console.log("Usage: ", usage);

          // Add error handling
        },
        onFinish({ finishReason, usage, text }) {
          console.log("finish reason", finishReason);
          console.log("usage", usage);
          // console.log("text", text);
        },
      });
      spinnerStream.update(null);
      let textContent = "";
      let displayContent: React.ReactNode = <></>;

      for await (const part of result.fullStream) {
        switch (part.type) {
          case "text-delta": {
            textContent += part.textDelta;
            contentStream.update(<MarkdownContainer children={textContent} />);
            break;
          }
          case "tool-call": {
            switch (part.toolName) {
              case "get_current_weather": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}
                    <CurrentWeatherCard
                      location={part.args.location}
                      countryCode={part.args.countryCode}
                      units={part.args.units}
                    />
                  </div>
                );
                displayStream.update(displayContent);
                break;
              }
              case "get_weather_forecast": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}
                    <WeatherForecastCard
                      location={part.args.location}
                      forecastDays={part.args.forecastDays}
                      countryCode={undefined}
                      units={undefined}
                    />
                  </div>
                );
                displayStream.update(displayContent);
                break;
              }
              case "get_web_results": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}
                    <WebResultGroup
                      query={part.args.query}
                      country={part.args.country}
                      freshness={part.args.freshness}
                      units={part.args.units}
                      count={part.args.count}
                      offset={part.args.offset}
                    />
                  </div>
                );
                contentStream.update(
                  <h4 className="animate-text_loading">
                    Reviewing search results...
                  </h4>,
                );
                displayStream.update(displayContent);
                break;
              }
              case "get_news_web_results": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}
                    <WebResultGroup
                      query={part.args.query}
                      country={part.args.country}
                      freshness={part.args.freshness}
                      units={part.args.units}
                      count={part.args.count}
                      offset={part.args.offset}
                    />
                  </div>
                );
                contentStream.update(
                  <h4 className="animate-text_loading">
                    Reviewing news results...
                  </h4>,
                );
                displayStream.update(displayContent);
                break;
              }
            }
            break;
          }
          case "tool-result": {
            switch (part.toolName) {
              case "search_for_images": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {Array.isArray(part.result) ? (
                        part.result.map((image: ImageResult) => (
                          <a
                            href={image.imageSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col gap-2"
                          >
                            <img
                              className="h-auto max-w-full rounded-lg"
                              src={image.imageSrc}
                              alt={image.imageTitle}
                            />
                            <h5 className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
                              {image.imageTitle}
                            </h5>
                          </a>
                        ))
                      ) : (
                        <div>{part.result.error}</div>
                      )}
                    </div>
                  </div>
                );
                contentStream.update(<Spinner />);
                displayStream.update(displayContent);
                break;
              }
              case "search_for_gifs": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {Array.isArray(part.result) ? (
                        part.result.map((gif: GifResult) => (
                          <a
                            href={gif.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              className="h-auto max-w-full rounded-lg"
                              src={gif.imageSrc}
                              alt={gif.imageTitle}
                            />
                          </a>
                        ))
                      ) : (
                        <div>{part.result.error}</div>
                      )}
                    </div>
                  </div>
                );
                contentStream.update(<Spinner />);
                displayStream.update(displayContent);
                break;
              }
              case "search_for_movies": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}
                    {Array.isArray(part.result) ? (
                      <MovieCardGroup movies={part.result} />
                    ) : (
                      <div>{part.result.error}</div>
                    )}
                  </div>
                );
                contentStream.update(
                  <h4 className="animate-text_loading">
                    Reviewing the top movies...
                  </h4>,
                );
                displayStream.update(displayContent);
                break;
              }
              case "search_for_now_playing_movies": {
                displayContent = (
                  <div className="flex flex-col gap-8">
                    {displayContent}

                    {Array.isArray(part.result) ? (
                      <MovieCardGroup movies={part.result} />
                    ) : (
                      <div>{part.result.error}</div>
                    )}
                  </div>
                );
                contentStream.update(
                  <h4 className="animate-text_loading">
                    Reviewing the top movies...
                  </h4>,
                );
                displayStream.update(displayContent);
                break;
              }
            }
          }
        }
      }

      aiState.update({
        ...aiState.get(),
        isFinished: true,
        messages: [
          ...aiState.get().messages,
          {
            role: "assistant",
            content: textContent,
          },
        ],
      });
    } catch (error) {
      console.log(error);
      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            role: "assistant",
            content: "Sorry, there was an error",
          },
        ],
      });
      contentStream.update("Sorry, there was an error");
      // displayStream.update(null);
    } finally {
      aiState.done({ ...aiState.get(), isFinished: true });
      contentStream.done();
      displayStream.done();
      spinnerStream.done(null);
    }
  })();

  return {
    id: generateId(),
    role: "assistant",
    content: contentStream.value,
    display: displayStream.value,
    spinner: spinnerStream.value,
    model: modelVariable,
  };
}

export async function createExampleMessages() {
  "use server";
  const aiState = getMutableAIState<typeof AI>();
  const todaysDate = getTodaysDate();

  const modelVariable = aiState.get().currentModelVariable;
  const model: LanguageModelV1 = getModelFromModelVariable(modelVariable);

  const exampleMessagesUI = createStreamableUI(
    <ExampleMessageCardGroup exampleMessages={[]} />,
  );

  (async () => {
    try {
      const { elementStream: examples } = await streamObject({
        model: model,
        output: "array",
        system: `
        You generate fun and engaging examples messages to inspire the user to start a conversation with the LLM assistant.
        Today's date is ${todaysDate}.
        The LLM assistant has the following capabilities:
        - 🗞️ Search for news on the web for a given topic
        - 🔎 Search the web for information on a given topic or for a specific query
        - 🌄 Display multiple fun or entertaining gifs
        - 🌤️ Get the current weather for a location
        - ⛅️ Get the weather forecast for a location
        - 🍿 Get movies from a database based on an input
        - 📸 Search for images on the web for a given topic or query
        `,
        prompt: `Generate 4 example messages to inspire the user to start a conversation with the LLM assistant using.
        Select randomly for the capabilities of the LLM assistant.
        Include emojis at the start of each example message to make them more engaging.`,
        temperature: 0.5,
        schema: exampleMessageSchema,
      });
      const exampleArray: ExampleMessageCardProps[] = [];
      for await (const example of examples) {
        // update example to include model variable
        const generatedExample: ExampleMessageCardProps = {
          ...example,
          index: exampleArray.length,
          modelVariable: modelVariable,
        };
        exampleArray.push(generatedExample);
        exampleMessagesUI.update(
          <ExampleMessageCardGroup exampleMessages={exampleArray} />,
        );
      }
    } catch (error) {
      console.error(error);
      exampleMessagesUI.update("Sorry, there was an error");
    } finally {
      exampleMessagesUI.done();
    }
  })();
  return exampleMessagesUI.value;
}

export async function getWeatherForecastUI(
  location: string,
  forecastDays: number,
  countryCode?: CountryCode,
  units?: Units,
) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();
  const contentStream = createStreamableUI(
    `Fetching the weather forecast for ${location}`,
  );
  const displayStream = createStreamableUI(
    <WeatherForecastCard
      location={location}
      forecastDays={forecastDays}
      units={units}
      countryCode={countryCode}
    />,
  );
  const spinnerStream = createStreamableUI(<Spinner />);

  const toolCallId = generateId();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: "user",
        content: `Fetch the weather forecast at ${location}, ${countryCode}  for ${forecastDays} days, in ${units} units`,
      },
    ],
  });

  (async () => {
    try {
      const response = await getWeatherForecast({
        location,
        forecastDays,
        countryCode,
        units,
      });
      aiState.update({
        ...aiState.get(),
        isFinished: true,
        messages: [
          ...aiState.get().messages,
          {
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolCallId: toolCallId,
                toolName: "get_weather_forecast",
                args: { location, forecastDays, countryCode, units },
              },
            ],
          },
          {
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolCallId: toolCallId,
                toolName: "get_weather_forecast",
                result: {
                  ...response,
                  location,
                  forecastDays,
                  units,
                },
              },
            ],
          },
          {
            role: "assistant",
            content: `Here's the ${forecastDays} day forecast for ${location}: ${JSON.stringify(response)}`,
          },
        ],
      });
      contentStream.update(
        `Here's the ${forecastDays} day forecast for ${location}`,
      );
    } catch (error) {
      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolCallId: toolCallId,
                toolName: "get_weather_forecast",
                args: { location, forecastDays, countryCode, units },
              },
            ],
          },
          {
            role: "assistant",
            content: `Sorry, there was an error getting the weather forecast for ${location}`,
          },
        ],
      });
      contentStream.update(
        <>
          Sorry, there was an error getting the weather forecast for {location}
        </>,
      );
      displayStream.update(null);
    } finally {
      aiState.done({ ...aiState.get(), isFinished: true });
      contentStream.done();
      displayStream.done();
      spinnerStream.done(null);
    }
  })();

  return {
    id: generateId(),
    role: "assistant",
    content: contentStream.value,
    display: displayStream.value,
    spinner: spinnerStream.value,
    model: getAIState().currentModelVariable,
  };
}

export async function getCurrentWeatherUI(
  location: string,
  countryCode?: CountryCode,
  units?: Units,
) {
  "use server";

  if (units === undefined) {
    units = "metric";
  }

  const aiState = getMutableAIState<typeof AI>();
  const contentStream = createStreamableUI(
    `Fetching the current weather for ${location}`,
  );
  const displayStream = createStreamableUI(
    <CurrentWeatherCard
      location={location}
      countryCode={countryCode as CountryCode}
      units={units}
    />,
  );
  const spinnerStream = createStreamableUI(<Spinner />);
  const toolCallId = generateId();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: "user",
        content: `Fetch the current weather for ${location}, ${countryCode} in ${units} units`,
      },
    ],
  });

  (async () => {
    try {
      const response = await getCurrentWeather({
        location,
        countryCode,
        units,
      });
      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolCallId: toolCallId,
                toolName: "get_current_weather",
                args: { location, countryCode, units },
              },
            ],
          },
          {
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolCallId: toolCallId,
                toolName: "get_current_weather",
                result: {
                  ...response,
                  location,
                  countryCode,
                  units,
                },
              },
            ],
          },
          {
            role: "assistant",
            content: `Here's the current weather for ${location}: ${JSON.stringify(response)}`,
          },
        ],
      });
      contentStream.update(`Here's the current weather for ${location}`);
    } catch (error) {
      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolCallId: toolCallId,
                toolName: "get_current_weather",
                args: { location, countryCode, units },
              },
            ],
          },
          {
            role: "assistant",
            content: `Sorry, there was an error getting the current weather for ${location}`,
          },
        ],
      });
      contentStream.update(
        <>
          Sorry, there was an error getting the current weather for {location}
        </>,
      );
      displayStream.update(null);
    } finally {
      aiState.done({ ...aiState.get(), isFinished: true });
      contentStream.done();
      displayStream.done();
      spinnerStream.done(null);
    }
  })();

  return {
    id: generateId(),
    role: "assistant",
    content: contentStream.value,
    display: displayStream.value,
    spinner: spinnerStream.value,
    model: getAIState().currentModelVariable,
  };
}
