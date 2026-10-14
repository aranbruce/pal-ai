import { OpenTelemetry } from "@ai-sdk/otel";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PostHogSpanProcessor } from "@posthog/ai/otel";
import { registerTelemetry } from "ai";

// PostHog LLM analytics for Vercel AI SDK v7:
// https://posthog.com/docs/llm-analytics/installation/vercel-ai
export const posthogSpanProcessor = new PostHogSpanProcessor({
  projectToken: "phc_7DDJRJb09qbR0TXIqI5HcU13J2eMx4rEB1ZknovWyDI",
  host: "https://eu.i.posthog.com",
});

// Route handlers are bundled separately from this file, so they reach the
// processor through globalThis to flush it (see lib/flush-ai-telemetry.ts)
globalThis.posthogSpanProcessor = posthogSpanProcessor;

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    "service.name": "pal-ai",
  }),
  spanProcessors: [posthogSpanProcessor],
});

sdk.start();

registerTelemetry(
  new OpenTelemetry({
    enrichSpan: ({ runtimeContext }) => ({
      "posthog.distinct_id":
        typeof runtimeContext?.distinctId === "string"
          ? runtimeContext.distinctId
          : undefined,
      $ai_session_id:
        typeof runtimeContext?.sessionId === "string"
          ? runtimeContext.sessionId
          : undefined,
      $ai_trace_name:
        typeof runtimeContext?.traceName === "string"
          ? runtimeContext.traceName
          : undefined,
      $groups:
        typeof runtimeContext?.groups === "object" &&
        runtimeContext.groups !== null &&
        !Array.isArray(runtimeContext.groups)
          ? JSON.stringify(runtimeContext.groups)
          : undefined,
      conversationId:
        typeof runtimeContext?.properties === "object" &&
        runtimeContext.properties !== null &&
        "conversationId" in runtimeContext.properties &&
        typeof runtimeContext.properties.conversationId === "string"
          ? runtimeContext.properties.conversationId
          : undefined,
      paid:
        typeof runtimeContext?.properties === "object" &&
        runtimeContext.properties !== null &&
        "paid" in runtimeContext.properties &&
        typeof runtimeContext.properties.paid === "boolean"
          ? runtimeContext.properties.paid
          : undefined,
    }),
  }),
);
