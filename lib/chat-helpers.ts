import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { UserLocation } from "@/lib/chat-types";
import type {
  FileUIPart,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from "ai";
import posthog from "posthog-js";

export function createMessageBody(
  model: string,
  traceId: string,
  useWebSearch: boolean,
  userLocation: UserLocation | null,
  additionalBody?: Record<string, unknown>,
) {
  const userId = posthog.get_distinct_id();

  return {
    model,
    traceId,
    webSearch: useWebSearch,
    ...(userId && { userId }),
    data: userLocation
      ? {
          location: {
            coordinates: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        }
      : undefined,
    ...additionalBody,
  };
}

export function validateMessage(message: PromptInputMessage): boolean {
  const hasText = Boolean(message.text?.trim());
  const hasAttachments = Boolean(message.files?.length);
  return hasText || hasAttachments;
}

export function extractTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part: UIMessagePart<UIDataTypes, UITools>) => part.type === "text")
    .map((part: UIMessagePart<UIDataTypes, UITools>) => {
      if (part.type === "text") {
        return part.text || "";
      }
      return "";
    })
    .join("\n");
}

export function extractFilesFromMessage(
  message: UIMessage,
): UIMessagePart<UIDataTypes, UITools>[] {
  return message.parts.filter(
    (part: UIMessagePart<UIDataTypes, UITools>) => part.type === "file",
  );
}

export function findPreviousUserMessage(
  messages: UIMessage[],
  currentIndex: number,
): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") {
      return i;
    }
  }
  return -1;
}

export function createRegenerateMessage(userMessage: UIMessage): {
  text: string;
  files?: FileUIPart[];
} {
  const textContent = extractTextFromMessage(userMessage);
  const filesContent = extractFilesFromMessage(userMessage);

  // Convert UIMessagePart[] to FileUIPart[]
  const fileUIParts: FileUIPart[] = [];

  for (const part of filesContent) {
    if (part.type === "file" && "url" in part && "mediaType" in part) {
      fileUIParts.push({
        type: "file" as const,
        url: part.url!,
        mediaType: part.mediaType!,
        filename: ("filename" in part ? part.filename : undefined) || "file",
      });
    }
  }

  return {
    text: textContent || "Sent with attachments",
    files: fileUIParts.length > 0 ? fileUIParts : undefined,
  };
}
