"use server";

import { WebSearchRequestSchema } from "@/lib/schema";

interface WebSearchRequest {
  query: string;
  country?: string;
  freshness?: "past-day" | "past-week" | "past-month" | "past-year";
  units?: string;
  count?: number;
  offset?: number;
}

interface WebSearchResult {
  id: number;
  title: string;
  url: string;
  description: string;
  date?: string;
  author?: string;
  imageURL?: string;
  extra?: string[];
}

export async function getWebResults(
  request: WebSearchRequest,
): Promise<WebSearchResult[]> {
  // Validate input using Zod schema
  const validatedRequest = WebSearchRequestSchema.parse(request);
  const {
    query,
    country,
    freshness,
    units,
    count = 8,
    offset,
  } = validatedRequest;
  let freshnessParam = "";

  if (freshness) {
    if (freshness === "past-day") {
      freshnessParam = "pd";
    } else if (freshness === "past-week") {
      freshnessParam = "pw";
    } else if (freshness === "past-month") {
      freshnessParam = "pm";
    } else if (freshness === "past-year") {
      freshnessParam = "py";
    }
  }

  try {
    const url = new URL(
      `https://api.search.brave.com/res/v1/web/search?q=${query}&text_decorations=0&count=${count}&result_filter=web`,
    );

    // add optional parameters
    if (country) {
      url.searchParams.append("country", country);
    }
    if (freshnessParam) {
      url.searchParams.append("freshness", freshnessParam);
    }
    if (units) {
      url.searchParams.append("units", units);
    }
    if (offset) {
      url.searchParams.append("offset", offset.toString());
    }

    const headers = {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY || "",
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    let results = data?.web?.results;

    if (!results) {
      throw new Error("No results found");
    }

    results = results.map(
      (
        result: {
          title: string;
          url: string;
          description: string;
          page_age?: string;
          profile?: { name?: string; img?: string };
          extra_snippets?: string[];
        },
        index: number,
      ) => ({
        id: index + 1,
        title: result.title,
        url: result.url,
        description: result.description,
        date: result.page_age,
        author: result.profile?.name,
        imageURL: result.profile?.img,
        extra: result.extra_snippets,
      }),
    );

    return results;
  } catch (error) {
    console.error("Error:", error);
    throw new Error(
      `Failed to fetch web results: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
