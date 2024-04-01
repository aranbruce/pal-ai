import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { functions, runFunction } from "./functions";
import { Pinecone } from '@pinecone-database/pinecone';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || ""
});

const index = pc.index("sample-movies")

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  console.log('POST request received for chat route')
  // Customise your system messages here
  const { messages } = await req.json();

  // remove id from messages
  const messagesWithoutIds = messages.map(({ id, ...rest }: { id: string, [key: string]: any }) => rest);

  try {
    const initialResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: messagesWithoutIds,
      stream: true,
      functions,
      function_call: "auto",
    });

    const stream = OpenAIStream(initialResponse, {
      experimental_onFunctionCall: async (
        { name, arguments: args },
        createFunctionCallMessages,
      ) => {
        const result = await runFunction(name, args);
        const newMessages = createFunctionCallMessages(result);
        return openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          stream: true,
          messages: [...messagesWithoutIds, ...newMessages],
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({message: `Internal Server Error: ${error}`}), { status: 500 });
  }

}
