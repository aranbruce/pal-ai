const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export default async function getWebpageContents(urls: string[]) {
  console.log("Request received for get webpage contents action");
  console.log("URLs: ", urls);

  try {
    if (!urls || urls.length === 0) {
      throw new Error("Invalid URL");
    }

    const response = await tvly.extract(urls);
    const results = response.results;

    // trim the content to 5000 characters
    results.forEach((result: { rawContent: string }) => {
      if (result.rawContent.length > 5000) {
        result.rawContent = result.rawContent.substring(0, 5000);
      }
    });

    return results;
  } catch (error) {
    console.log("Error failed to get webpage contents");
    return null;
  }
}
