import type { PostHogSpanProcessor } from "@posthog/ai/otel";

declare global {
  var posthogSpanProcessor: PostHogSpanProcessor | undefined;
}

// Spans are batched, so flush them before the request lifecycle ends.
// The processor is created in instrumentation.node.ts.
export async function flushAiTelemetry() {
  await globalThis.posthogSpanProcessor?.forceFlush();
}
