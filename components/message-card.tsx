import { ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { useState } from "react";

import { modelVariableOptions } from "@/libs/models";
import { GifResult } from "@/server/search-for-gifs";
import { ImageResult } from "@/server/search-for-images";

import CurrentWeatherCard from "@/components/current-weather/current-weather-card";
import MarkdownContainer from "@/components/markdown";
import MovieCardGroup from "@/components/movie-card/movie-card-group";
import ProviderImage from "@/components/provider-image";
import Select from "@/components/select";
import Spinner from "@/components/spinner";
import WeatherForecastCard from "@/components/weather-forecast/weather-forecast-card";
import WebResultGroup from "@/components/web-results/web-result-group";

interface MessageProps {
  id: string;
  role: string;
  content: string;
  toolInvocations?: ToolInvocation[];
}

export default function MessageCard({
  id,
  role,
  content,
  toolInvocations,
}: MessageProps) {
  const [selectModel, setSelectModel] = useState<string>("gpt-4o-mini");

  const selectedModel = modelVariableOptions.find(
    (option) => option.value === selectModel,
  );

  function setSelectedValue(value: string) {
    setSelectModel(value);
  }

  return (
    <motion.div
      key={id}
      className="flex animate-message_appear flex-row items-start gap-2 whitespace-pre-wrap pb-8"
    >
      <div className="flex flex-row items-center gap-4">
        {role !== "user" && (
          <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50">
            {selectedModel?.provider && (
              <ProviderImage provider={selectedModel?.provider} />
            )}
          </div>
        )}
      </div>
      <div
        className={`flex w-full min-w-0 max-w-full flex-col gap-2 ${role === "user" && "items-end"}`}
      >
        {role !== "user" && (
          <h5 className="text-md pt-1 font-semibold text-zinc-950 dark:text-zinc-300">
            {selectedModel?.label.toString()}
          </h5>
        )}
        <div
          className={`flex flex-col gap-4 text-zinc-950 dark:text-zinc-300 ${role === "user" && "w-auto rounded-xl bg-zinc-200/60 px-4 py-2 dark:bg-zinc-800"}`}
        >
          {content && <MarkdownContainer>{content}</MarkdownContainer>}

          {/* Render tool invocations */}
          {toolInvocations && toolInvocations.length > 0 && (
            <div className="flex flex-col gap-8">
              {toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  switch (toolName) {
                    case "get_current_weather":
                      return (
                        <div key={toolCallId}>
                          <CurrentWeatherCard
                            location={result.location}
                            countryCode={result.countryCode}
                            units={result.units}
                          />
                        </div>
                      );

                    case "get_weather_forecast":
                      return (
                        <div key={toolCallId}>
                          <WeatherForecastCard
                            location={result.location}
                            forecastDays={result.forecastDays}
                            countryCode={result.countryCode}
                            units={result.units}
                          />
                        </div>
                      );

                    case "get_web_results":
                    case "get_news_web_results":
                      return (
                        <div key={toolCallId}>
                          <WebResultGroup
                            query={result.query}
                            country={result.country}
                            freshness={result.freshness}
                            units={result.units}
                            count={result.count}
                            offset={result.offset}
                          />
                        </div>
                      );

                    case "search_for_images":
                      return (
                        <div
                          key={toolCallId}
                          className="grid grid-cols-2 gap-4 md:grid-cols-4"
                        >
                          {Array.isArray(result) ? (
                            result.map((image: ImageResult) => (
                              <a
                                key={image.imageSrc}
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
                            <div>{result.error}</div>
                          )}
                        </div>
                      );

                    case "search_for_gifs":
                      return (
                        <div
                          key={toolCallId}
                          className="grid grid-cols-2 gap-4 md:grid-cols-4"
                        >
                          {Array.isArray(result) ? (
                            result.map((gif: GifResult) => (
                              <a
                                key={gif.websiteUrl}
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
                            <div>{result.error}</div>
                          )}
                        </div>
                      );

                    case "search_for_movies":
                    case "search_for_now_playing_movies":
                      return (
                        <div key={toolCallId}>
                          {Array.isArray(result) ? (
                            <MovieCardGroup movies={result} />
                          ) : (
                            <div>{result.error}</div>
                          )}
                        </div>
                      );

                    default:
                      return null;
                  }
                } else {
                  // Loading state
                  return (
                    <div key={toolCallId}>
                      {toolName === "search_for_images" && (
                        <div className="animate-text_loading">
                          Searching for images...
                        </div>
                      )}
                      {toolName === "search_for_gifs" && (
                        <div className="animate-text_loading">
                          Searching for gifs...
                        </div>
                      )}
                      {toolName === "search_for_movies" && (
                        <h4 className="animate-text_loading">
                          Searching for movies...
                        </h4>
                      )}
                      {toolName === "search_for_now_playing_movies" && (
                        <h4 className="animate-text_loading">
                          Searching for movies now playing...
                        </h4>
                      )}
                      {toolName === "get_web_results" && (
                        <h4 className="animate-text_loading">
                          Reviewing search results...
                        </h4>
                      )}
                      {toolName === "get_news_web_results" && (
                        <h4 className="animate-text_loading">
                          Reviewing news results...
                        </h4>
                      )}
                      {![
                        "search_for_images",
                        "search_for_gifs",
                        "search_for_movies",
                        "search_for_now_playing_movies",
                        "get_web_results",
                        "get_news_web_results",
                      ].includes(toolName) && <Spinner />}
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
        {role === "assistant" && (
          <div className="mt-2 flex flex-row gap-1">
            <Select
              variant="secondary"
              options={modelVariableOptions}
              selectedValue={selectModel}
              setSelectedValue={setSelectedValue}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
