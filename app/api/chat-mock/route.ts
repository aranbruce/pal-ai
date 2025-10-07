import type { UIMessage } from "ai";

// Helper to convert chunk objects to SSE format
function chunkToSSE(chunk: any): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

// Helper to create a readable stream from chunks
function createMockStream(chunks: any[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      // Initial delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunkToSSE(chunk)));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      webSearch,
    }: {
      messages: UIMessage[];
      model?: string;
      webSearch?: boolean;
    } = await req.json();

    const lastMessage = messages[messages.length - 1];
    const userText =
      lastMessage.parts.find((p) => p.type === "text")?.text || "Hello";

    // Simulate different responses based on the message content
    const isWeatherQuery = userText.toLowerCase().includes("weather");
    const isSearchQuery =
      webSearch || userText.toLowerCase().includes("search");
    const isError = userText.toLowerCase().includes("error");

    let chunks: any[];

    if (isError) {
      // Simulate a streaming error response
      chunks = [
        {
          type: "error",
          errorText: "This is a simulated error for testing purposes",
        },
      ];
    } else if (isWeatherQuery) {
      // Mock weather data for San Francisco
      const location = "San Francisco";
      const toolCallId = `tool-${Date.now()}`;

      const mockWeatherData = {
        latitude: 37.7749,
        longitude: -122.4194,
        currentHour: new Date().getHours(),
        currentDate: Date.now(),
        units: "imperial" as const,
        current: {
          temp: 72,
          weather: "Clear",
        },
        hourly: [
          { temp: 72, weather: "Clear" },
          { temp: 71, weather: "Clear" },
          { temp: 70, weather: "Clear" },
          { temp: 68, weather: "Clear" },
          { temp: 66, weather: "Clear" },
          { temp: 64, weather: "Clear" },
          { temp: 62, weather: "Clear" },
          { temp: 61, weather: "Clear" },
          { temp: 60, weather: "Clear" },
          { temp: 59, weather: "Clear" },
          { temp: 58, weather: "Clear" },
          { temp: 57, weather: "Clear" },
          { temp: 56, weather: "Clear" },
          { temp: 55, weather: "Clear" },
          { temp: 54, weather: "Clear" },
          { temp: 55, weather: "Clear" },
          { temp: 58, weather: "Clear" },
          { temp: 62, weather: "Clear" },
          { temp: 66, weather: "Clear" },
          { temp: 68, weather: "Clear" },
          { temp: 70, weather: "Clear" },
          { temp: 71, weather: "Clear" },
          { temp: 72, weather: "Clear" },
          { temp: 73, weather: "Clear" },
        ],
      };

      chunks = [
        {
          type: "tool-input-start",
          toolCallId,
          toolName: "get_current_weather",
        },
        {
          type: "tool-input-delta",
          toolCallId,
          inputTextDelta: JSON.stringify({
            latitude: mockWeatherData.latitude,
            longitude: mockWeatherData.longitude,
            units: mockWeatherData.units,
          }),
        },
        {
          type: "tool-input-available",
          toolCallId,
          toolName: "get_current_weather",
        },
        {
          type: "tool-output-available",
          toolCallId,
          output: JSON.stringify(mockWeatherData),
        },
        { type: "text-start", id: "text-1" },
        { type: "text-delta", id: "text-1", delta: "The" },
        { type: "text-delta", id: "text-1", delta: " current" },
        { type: "text-delta", id: "text-1", delta: " weather" },
        { type: "text-delta", id: "text-1", delta: " in" },
        { type: "text-delta", id: "text-1", delta: ` ${location}` },
        { type: "text-delta", id: "text-1", delta: " is" },
        {
          type: "text-delta",
          id: "text-1",
          delta: ` ${mockWeatherData.current.temp}°F`,
        },
        { type: "text-delta", id: "text-1", delta: " with" },
        {
          type: "text-delta",
          id: "text-1",
          delta: ` ${mockWeatherData.current.weather.toLowerCase()}`,
        },
        { type: "text-delta", id: "text-1", delta: " conditions" },
        { type: "text-delta", id: "text-1", delta: "." },
        { type: "text-end", id: "text-1" },
        { type: "finish" },
      ];
    } else if (isSearchQuery) {
      // Simulate web search response
      chunks = [
        { type: "text-start", id: "text-1" },
        { type: "text-delta", id: "text-1", delta: "Based" },
        { type: "text-delta", id: "text-1", delta: " on" },
        { type: "text-delta", id: "text-1", delta: " my" },
        { type: "text-delta", id: "text-1", delta: " search" },
        { type: "text-delta", id: "text-1", delta: "," },
        { type: "text-delta", id: "text-1", delta: " I" },
        { type: "text-delta", id: "text-1", delta: " found" },
        { type: "text-delta", id: "text-1", delta: " relevant" },
        { type: "text-delta", id: "text-1", delta: " information" },
        { type: "text-delta", id: "text-1", delta: " about" },
        { type: "text-delta", id: "text-1", delta: ` ${userText}` },
        { type: "text-delta", id: "text-1", delta: "." },
        { type: "text-end", id: "text-1" },
        { type: "finish" },
      ];
    } else {
      // Simulate regular text response
      const words = [
        "This",
        " is",
        " a",
        " mock",
        " response",
        " to",
        " your",
        " message:",
        ` "${userText}".`,
        " The",
        " mock",
        " API",
        " is",
        " working",
        " correctly",
        " and",
        " simulating",
        " a",
        " streaming",
        " response",
        " from",
        " the",
        " AI",
        " model.",
      ];

      chunks = [
        { type: "text-start", id: "text-1" },
        ...words.map((word) => ({
          type: "text-delta" as const,
          id: "text-1",
          delta: word,
        })),
        { type: "text-end", id: "text-1" },
        { type: "finish" },
      ];
    }

    return new Response(createMockStream(chunks), {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Mock API Error:", error);

    return new Response(
      JSON.stringify({
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred in the mock API.",
          type: "mock_api_error",
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
