"use server";

import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

interface WebpageResult {
  url: string;
  rawContent: string;
}

export async function getWebpageContents(urls: string[]) {
  try {
    if (!urls || urls.length === 0) {
      throw new Error("Invalid URL - at least one URL is required");
    }

    const response = await tvly.extract(urls);
    const results = response.results;

    // Return only the serializable fields we need, avoiding circular references
    const cleanResults: WebpageResult[] = results.map(
      (result: { url?: string; rawContent?: string }) => ({
        url: result.url || "",
        rawContent:
          result.rawContent && result.rawContent.length > 5000
            ? result.rawContent.substring(0, 5000)
            : result.rawContent || "",
      }),
    );

    return cleanResults;
  } catch (error) {
    console.error("Error failed to get webpage contents:", error);
    throw new Error(
      `Failed to extract webpage contents: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
