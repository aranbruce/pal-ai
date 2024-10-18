import { z } from "zod";

export const exampleMessageSchema = z.object({
  heading: z
    .string()
    .describe("A short heading for the example message of 4-5 words"),
  subheading: z
    .string()
    .describe(
      "A short description of the example message. This is the message that will be sent to the LLM. This should be 12-15 words long.",
    ),
});

export const exampleMessagesSchema = z.array(exampleMessageSchema);

export const exampleMessageSchemaObject = z.object({
  examples: exampleMessagesSchema,
});

export type ExampleMessage = z.infer<typeof exampleMessageSchema>;

export const countryCodeSchema = z.enum([
  "AR",
  "AU",
  "AT",
  "BE",
  "BR",
  "CA",
  "CL",
  "DK",
  "FI",
  "FR",
  "DE",
  "HK",
  "IN",
  "ID",
  "IT",
  "JP",
  "KR",
  "MY",
  "MX",
  "NL",
  "NZ",
  "NO",
  "CN",
  "PL",
  "PT",
  "PH",
  "RU",
  "SA",
  "ZA",
  "ES",
  "SE",
  "CH",
  "TW",
  "TH",
  "TR",
  "GB",
  "US",
]);

export type CountryCode = z.infer<typeof countryCodeSchema>;

export const unitsSchema = z.enum(["metric", "imperial"]);

export type Units = z.infer<typeof unitsSchema>;

export const freshnessOptionsSchema = z.enum([
  "past-day",
  "past-week",
  "past-month",
  "past-year",
]);

export type FreshnessOptions = z.infer<typeof freshnessOptionsSchema>;

export const getCoordinatesFromLocationRequestSchema = z.object({
  location: z
    .string()
    .describe(
      "The location to get the current weather for, excluding the country",
    ),
  countryCode: countryCodeSchema
    .optional()
    .describe(
      "The country code of the location to get the coordinates for. This should be an ISO 3166 country code",
    ),
});

export type GetCoordinatesFromLocationRequest = z.infer<
  typeof getCoordinatesFromLocationRequestSchema
>;

export const getLocationFromCoordinatesRequestSchema = z.object({
  latitude: z
    .number()
    .describe("The latitude of the location to get the name of"),
  longitude: z
    .number()
    .describe("The longitude of the location to get the name of"),
});

export type GetLocationFromCoordinatesRequest = z.infer<
  typeof getLocationFromCoordinatesRequestSchema
>;

export const getCurrentWeatherRequestSchema = z.object({
  location: z
    .string()
    .describe(
      "The location to get the current weather for, excluding the country. This can also be inferred from the user's location if available.",
    ),
  countryCode: countryCodeSchema
    .optional()
    .describe(
      "The country code of the location to get the current weather for. This should be an ISO 3166 country code. This can also be inferred from the user's location if available.",
    ),
  units: unitsSchema
    .optional()
    .describe(
      "The units to display the temperature in. Can be 'metric' or 'imperial'. For celsius, use 'metric' and for fahrenheit, use 'imperial'. If no unit is provided by the user, infer the unit based on the location e.g. London would use metric.",
    ),
});

export type GetCurrentWeatherRequest = z.infer<
  typeof getCurrentWeatherRequestSchema
>;

export const getWeatherForecastRequestSchema = z.object({
  location: z
    .string()
    .describe(
      "The location to get the weather forecast for, excluding the country. This can also be inferred from the user's location if available.",
    ),
  forecastDays: z
    .number()
    .min(1)
    .max(7)
    .describe("The number of days to forecast the weather for. Max 7 days"),
  countryCode: countryCodeSchema
    .optional()
    .describe(
      "The country code of the location to get the weather forecast for. This should be an ISO 3166 country code",
    ),
  units: unitsSchema
    .optional()
    .describe(
      "The units to display the temperature in. Can be 'metric' or 'imperial'. For celsius, use 'metric' and for fahrenheit, use 'imperial'",
    ),
});

export type GetWeatherForecastRequest = z.infer<
  typeof getWeatherForecastRequestSchema
>;

export const getWebResultsRequestSchema = z.object({
  query: z
    .string()
    .describe(
      "The search query to search for news on. This should be a few words long",
    ),
  country: countryCodeSchema
    .optional()
    .describe(
      "The search query country, where the results come from. The country string is limited to 2 character country codes of supported countries.",
    ),
  freshness: freshnessOptionsSchema
    .optional()
    .describe(
      "The freshness of the search results. This filters search results by when they were discovered. Can be 'past-day', 'past-week', 'past-month', or 'past-year'.",
    ),
  units: unitsSchema
    .optional()
    .describe(
      "The units to display the temperature in. Can be 'metric' or 'imperial'. For celsius, use 'metric' and for fahrenheit, use 'imperial'",
    ),
  count: z
    .number()
    .optional()
    .describe("The number of search results to return"),
  offset: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .describe(
      "The number of pages of search results to skip. The number of results per page is equal to the count parameter.",
    ),
});

export type GetWebResultsRequest = z.infer<typeof getWebResultsRequestSchema>;

export const getNewsResultsRequestSchema = z.object({
  query: z
    .string()
    .describe(
      "The search query or topic to search for news on.  This should be a few words long",
    ),
  country: countryCodeSchema
    .optional()
    .describe(
      "The search query country, where the results come from. The country string is limited to 2 character country codes of supported countries.",
    ),
  freshness: freshnessOptionsSchema
    .optional()
    .describe(
      "The freshness of the search results. This filters search results by when they were discovered. Can be 'past-day', 'past-week', 'past-month', or 'past-year'.",
    ),
  units: unitsSchema
    .optional()
    .describe(
      "The units to display the temperature in. Can be 'metric' or 'imperial'. For celsius, use 'metric' and for fahrenheit, use 'imperial'",
    ),
  count: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("The number of search results to return"),
  offset: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe(
      "The number of pages of search results to skip. The number of results per page is equal to the count parameter.",
    ),
});

export type GetNewsResultsRequest = z.infer<typeof getNewsResultsRequestSchema>;

export const getWebpageContentRequestSchema = z.object({
  urls: z.array(
    z
      .string()
      .describe(
        "A complete list of URLs of the webpages to get the content for. All URLs should be contained in a single array.",
      ),
  ),
});

export type GetWebpageContentRequest = z.infer<
  typeof getWebpageContentRequestSchema
>;

export const getMovieGenresRequestSchema = z.object({});

export type GetMovieGenresRequest = z.infer<typeof getMovieGenresRequestSchema>;

export const getMovieRegionsRequestSchema = z.object({});

export type GetMovieRegionsRequest = z.infer<
  typeof getMovieRegionsRequestSchema
>;

export const searchForMoviesRequestSchema = z.object({
  page: z
    .number()
    .optional()
    .describe("The page of the search results to return"),
  region: z
    .string()
    .describe(
      "The country code of the region to get the movies for. If you know the user's location, you can use this to get the movies playing in their region. The string should match an option returned by the `get-movie-regions` action",
    ),
  minDate: z
    .date()
    .optional()
    .describe(
      "The release date of the movies to return. Only movies released after this date will be returned. This can be used to search for recent movies",
    ),
  maxDate: z
    .date()
    .optional()
    .describe(
      "The release date of the movies to return. Only movies released before this date will be returned",
    ),
  sortBy: z
    .enum([
      "popularity.asc",
      "popularity.desc",
      "revenue.asc",
      "revenue.desc",
      "primary_release_date.asc",
      "primary_release_date.desc",
      "original_title.asc",
      "original_title.desc",
      "vote_average.asc",
      "vote_average.desc",
      "vote_count.asc",
      "vote_count.desc",
    ])
    .optional()
    .describe("The sort order of the movies to return"),
  voteAverageGreaterThan: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .describe("The minimum vote average of the movies to return"),
  voteAverageLessThan: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .describe("The maximum vote average of the movies to return"),
  voteCountGreaterThan: z
    .number()
    .optional()
    .describe("The minimum vote count of the movies to return"),
  voteCountLessThan: z
    .number()
    .optional()
    .describe("The maximum vote count of the movies to return"),
  withGenres: z
    .array(z.number())
    .optional()
    .describe(
      "A list of genre IDs of the movies to include in the search results. These IDs can be found by calling the `get-movie-genres action`. When you want to return movies that cover multiple genres, you can include multiple genre IDs in the array",
    ),
  withoutGenres: z
    .array(z.number())
    .optional()
    .describe(
      "A list of genre IDs of the movies to exclude from the search results. These IDs can be found by calling the `get-movie-genres action`. When you want to exclude movies that cover multiple genres, you can include multiple genre IDs in the array",
    ),
  year: z.number().optional().describe("The year of the movies to return"),
});

export type SearchForMoviesRequest = z.infer<
  typeof searchForMoviesRequestSchema
>;

export const searchForNowPlayingMoviesRequestSchema = z.object({
  page: z
    .number()
    .optional()
    .describe("The page of the search results to return"),
  region: z
    .string()
    .describe(
      "The country code of the region to get the movies for. If you know the user's location, you can use this to get the movies playing in their region. The string should match an option returned by the `get-movie-regions` action",
    ),
});

export type SearchForNowPlayingMoviesRequest = z.infer<
  typeof searchForNowPlayingMoviesRequestSchema
>;

export const searchForGifsRequestSchema = z.object({
  query: z.string().describe("The search query or topic to search for gifs on"),
  limit: z.number().optional().describe("The number of gifs to return"),
  offset: z
    .number()
    .optional()
    .describe(
      "The offset of the gifs to return. Specifies the starting position of the results. Can be used to return the next set of gifs.",
    ),
  rating: z
    .enum(["g", "pg", "pg-13", "r"])
    .optional()
    .describe(
      "The rating of the gifs to return. Can be 'g', 'pg', 'pg-13', or 'r'.",
    ),
});

export type SearchForGifsRequest = z.infer<typeof searchForGifsRequestSchema>;

export const searchForImagesRequestSchema = z.object({
  query: z.string().describe("The search query or topic to search for news on"),
  country: countryCodeSchema
    .optional()
    .describe(
      "The search query country, where the results come from. The country string is limited to 2 character country codes of supported countries.",
    ),
  count: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("The number of search results to return"),
});

export type SearchForImagesRequest = z.infer<
  typeof searchForImagesRequestSchema
>;
