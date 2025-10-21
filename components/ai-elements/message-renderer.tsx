import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { ChatImage } from "@/components/ai-elements/chat-image";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { isToolUIPart } from "@/lib/chat-utils";
import { LightbulbIcon } from "lucide-react";
import { Fragment } from "react";
import { GeneratedImageRenderer, ToolRenderer } from "./tool-renderer";

interface MessagePart {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
  image?: any;
}

interface Message {
  id: string;
  role: string;
  parts: MessagePart[];
}

interface MessageRendererProps {
  message: Message;
  messageIndex: number;
  messages: Message[];
  status: string;
}

export function MessageRenderer({
  message,
  messageIndex,
  messages,
  status,
}: MessageRendererProps) {
  // Separate images from other content for user messages
  const imageParts =
    message.role === "user"
      ? message.parts.filter(
          (part: any) =>
            part.type === "file" && part.mediaType?.startsWith("image/"),
        )
      : [];

  // Check if this is the latest message and currently streaming
  const isLatestMessage = message.id === messages.at(-1)?.id;
  const isStreaming = status === "streaming" && isLatestMessage;

  // Render all parts, grouping reasoning and tools into Chain of Thought
  const reasoningAndToolParts: React.ReactNode[] = [];
  const otherParts: React.ReactNode[] = [];

  message.parts.forEach((part: MessagePart, i: number) => {
    switch (part.type) {
      case "reasoning":
        const isCurrentlyStreaming =
          isStreaming && i === message.parts.length - 1;
        const thinkingLabel = isCurrentlyStreaming
          ? "Thinking..."
          : "Thought for a few seconds";

        reasoningAndToolParts.push(
          <ChainOfThoughtStep
            key={`${message.id}-reasoning-${i}`}
            icon={LightbulbIcon}
            label={thinkingLabel}
            status={isCurrentlyStreaming ? "active" : "complete"}
          >
            <div className="text-muted-foreground text-sm">{part.text}</div>
          </ChainOfThoughtStep>,
        );
        break;

      case "text":
        // Skip empty text parts
        if (!part.text || part.text.trim() === "") {
          break;
        }
        otherParts.push(
          <Response key={`${message.id}-${part.type}-${i}`}>
            {part.text}
          </Response>,
        );
        break;

      case "file":
        // For user messages, images are rendered above, so skip here
        if (message.role === "user" && part.mediaType?.startsWith("image/")) {
          break;
        }
        // For assistant messages, render images inline
        if (part.mediaType?.startsWith("image/")) {
          otherParts.push(
            <ChatImage
              key={`${message.id}-${part.type}-${i}`}
              src={part.url || ""}
              alt={part.filename || "Uploaded image"}
            />,
          );
        }
        break;

      default:
        // Handle tool calls
        if (isToolUIPart(part)) {
          reasoningAndToolParts.push(
            <ToolRenderer
              key={`${message.id}-tool-${i}`}
              part={part}
              messageId={message.id}
              index={i}
            />,
          );
        } else if (
          "image" in part &&
          part.image &&
          typeof part.image === "object" &&
          "base64" in part.image
        ) {
          // Handle experimental image parts
          otherParts.push(
            <GeneratedImageRenderer
              key={`${message.id}-${part.type}-${i}`}
              part={part}
              messageId={message.id}
              index={i}
            />,
          );
        }
        break;
    }
  });

  return (
    <Fragment key={message.id}>
      {/* Render user images outside and above the message */}
      {message.role === "user" && imageParts.length > 0 && (
        <div className="-mb-2 flex w-full justify-end">
          <div className="flex max-w-60 flex-wrap gap-2">
            {imageParts.map(
              (part: MessagePart, i: number) =>
                part.type === "file" && (
                  <ChatImage
                    key={`${message.id}-img-${i}`}
                    src={part.url || ""}
                    alt={part.filename || "Uploaded image"}
                  />
                ),
            )}
          </div>
        </div>
      )}

      <Message from={message.role as "system" | "user" | "assistant"}>
        <MessageContent variant="flat">
          <>
            {reasoningAndToolParts.length > 0 && (
              <ChainOfThought defaultOpen={isStreaming}>
                <ChainOfThoughtHeader />
                <ChainOfThoughtContent>
                  {reasoningAndToolParts}
                </ChainOfThoughtContent>
              </ChainOfThought>
            )}
            {otherParts}
          </>
        </MessageContent>
      </Message>
    </Fragment>
  );
}
