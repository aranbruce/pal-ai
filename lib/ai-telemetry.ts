import { OpenTelemetry } from "@ai-sdk/otel";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";
import { PostHogSpanProcessor } from "@posthog/ai/otel";

// Sends AI SDK spans to PostHog, which turns them into $ai_generation events.
// Spans are batched, so call flushAiTelemetry() before the request ends.
const posthogSpanProcessor = new PostHogSpanProcessor({
  projectToken: "phc_7DDJRJb09qbR0TXIqI5HcU13J2eMx4rEB1ZknovWyDI",
  host: "https://eu.i.posthog.com",
});

// A dedicated provider (not registered globally) so AI spans stay separate
// from any tracing Next.js does on its own.
const tracerProvider = new BasicTracerProvider({
  resource: resourceFromAttributes({ "service.name": "pal-ai" }),
  spanProcessors: [posthogSpanProcessor],
});

export type AiTelemetryContext = {
  distinctId?: string;
  sessionId?: string;
  properties?: Record<string, string | number | boolean>;
};

export const posthogTelemetry = new OpenTelemetry({
  tracer: tracerProvider.getTracer("pal-ai"),
  enrichSpan: ({ runtimeContext }) => {
    const ctx = runtimeContext as AiTelemetryContext | undefined;
    return {
      "posthog.distinct_id": ctx?.distinctId,
      $ai_session_id: ctx?.sessionId,
      ...ctx?.properties,
    };
  },
});

export function flushAiTelemetry() {
  return posthogSpanProcessor.forceFlush();
}
