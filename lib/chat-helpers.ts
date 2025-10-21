import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { UserLocation } from "@/lib/chat-types";
import type { FileUIPart } from "ai";
import posthog from "posthog-js";

interface MessagePart {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
}

interface Message {
  role: string;
  parts: MessagePart[];
}

type MessagesArray = Message[];

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

export function extractTextFromMessage(message: Message): string {
  return message.parts
    .filter((part: MessagePart) => part.type === "text")
    .map((part: MessagePart) => part.text || "")
    .join("\n");
}

export function extractFilesFromMessage(message: Message): MessagePart[] {
  return message.parts.filter((part: MessagePart) => part.type === "file");
}

export function findPreviousUserMessage(
  messages: MessagesArray,
  currentIndex: number,
): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") {
      return i;
    }
  }
  return -1;
}

export function createRegenerateMessage(userMessage: Message): {
  text: string;
  files?: FileUIPart[];
} {
  const textContent = extractTextFromMessage(userMessage);
  const filesContent = extractFilesFromMessage(userMessage);

  // Convert MessagePart[] to FileUIPart[]
  const fileUIParts: FileUIPart[] = filesContent
    .filter((part) => part.type === "file" && part.url && part.mediaType)
    .map((part) => ({
      type: "file" as const,
      url: part.url!,
      mediaType: part.mediaType!,
      name: part.filename || "file",
    }));

  return {
    text: textContent || "Sent with attachments",
    files: fileUIParts.length > 0 ? fileUIParts : undefined,
  };
}
