# Pal AI Chat Bot

This chatbot example shows how to use the [Vercel AI SDK](https://sdk.vercel.ai/docs) with [Next.js](https://nextjs.org/) and [Vercel AI Gateway](https://vercel.com/docs/ai/ai-gateway) to use functions
and react server components to create a chat bot.

## How to use

To run the example locally you need to:

1. Set up [Vercel AI Gateway](https://vercel.com/docs/ai/ai-gateway) and get your API key.
2. Set the required environment variables as shown [the example env file](./.env.local.example) but in a new file called `.env.local`:
   - `AI_GATEWAY_API_KEY` - Your Vercel AI Gateway API key
   - Other provider API keys as needed
3. `pnpm install` to install the required dependencies.
4. `pnpm run dev` to launch the development server.

## Learn More

To learn more about OpenAI, Next.js, Vercel AI Gateway, and the Vercel AI SDK take a look at the following resources:

- [Vercel AI SDK docs](https://sdk.vercel.ai/docs)
- [Vercel AI Gateway docs](https://vercel.com/docs/ai/ai-gateway) - learn about Vercel AI Gateway features and API.
- [OpenAI Documentation](https://platform.openai.com/docs) - learn about OpenAI features and API.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
