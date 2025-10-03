import {
  consumeStream,
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

function getTodaysDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  const { messages, data }: { messages: UIMessage[]; data?: any } =
    await request.json();

  const location = data?.location?.coordinates;
  const todaysDate = getTodaysDate();

  const result = streamText({
    model: "openai/gpt-5",
    messages: convertToModelMessages(messages),
    temperature: 0.2,
    maxRetries: 4,
    stopWhen: stepCountIs(5), // Stop at step 5 if tools were called
    abortSignal: request.signal, // Forward the abort signal

    system: `
      You are an AI designed to help users with their queries. You can perform tools like searching the web,
      help users find information from the web, get the weather or find out the latest news.
      Today's date is ${todaysDate}.
      If asked to describe an image or asked about an image that the user has been provided, assume the user is visually impaired and provide a description of the image.
      `,

    onFinish: async ({ response }) => {
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
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("Stream was aborted");
        // Handle abort-specific cleanup
      } else {
        console.log("Stream completed normally");
        // Handle normal completion
      }
    },
    consumeSseStream: consumeStream,
  });
}
