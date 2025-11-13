import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { ChatImage } from "@/components/ai-elements/chat-image";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { isToolUIPart } from "@/lib/chat-utils";
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai";
import { LightbulbIcon } from "lucide-react";
import { Fragment } from "react";
import { GeneratedImageRenderer, ToolRenderer } from "./tool-renderer";

interface MessageRendererProps {
  message: UIMessage;
  messages: UIMessage[];
  status: string;
}

export function MessageRenderer({
  message,
  messages,
  status,
}: MessageRendererProps) {
  // Separate images from other content for user messages
  const imageParts =
    message.role === "user"
      ? message.parts.filter(
          (part: UIMessagePart<UIDataTypes, UITools>) =>
            part.type === "file" && part.mediaType?.startsWith("image/"),
        )
      : [];

  // Check if this is the latest message and currently streaming
  const isLatestMessage = message.id === messages.at(-1)?.id;
  const isStreaming = status === "streaming" && isLatestMessage;

  // Render all parts, grouping reasoning and tools into Chain of Thought
  // Separate text parts that come before and after the chain of thought
  const reasoningAndToolParts: React.ReactNode[] = [];
  const textBeforeChainOfThought: React.ReactNode[] = [];
  const textAfterChainOfThought: React.ReactNode[] = [];
  const otherParts: React.ReactNode[] = [];

  // Find the indices of the first and last reasoning/tool parts
  let firstReasoningOrToolIndex = -1;
  let lastReasoningOrToolIndex = -1;

  message.parts.forEach(
    (part: UIMessagePart<UIDataTypes, UITools>, i: number) => {
      const isReasoningOrTool = part.type === "reasoning" || isToolUIPart(part);

      if (isReasoningOrTool) {
        if (firstReasoningOrToolIndex === -1) {
          firstReasoningOrToolIndex = i;
        }
        lastReasoningOrToolIndex = i;
      }
    },
  );

  message.parts.forEach(
    (part: UIMessagePart<UIDataTypes, UITools>, i: number) => {
      switch (part.type) {
        case "reasoning":
          const isCurrentlyStreaming =
            isStreaming && i === message.parts.length - 1;
          const thinkingLabel = isCurrentlyStreaming
            ? "Thinking..."
            : "Thought for a few seconds";

          // Reasoning parts should already be clean from extractReasoningMiddleware
          // Display the reasoning content directly in the ChainOfThought component
          const reasoningText = part.text || "";

          reasoningAndToolParts.push(
            <ChainOfThoughtStep
              key={`${message.id}-reasoning-${i}`}
              icon={LightbulbIcon}
              label={thinkingLabel}
              status={isCurrentlyStreaming ? "active" : "complete"}
            >
              <div className="text-muted-foreground text-sm wrap-break-word">
                {reasoningText}
              </div>
            </ChainOfThoughtStep>,
          );
          break;

        case "text":
          // Skip empty text parts
          if (!part.text || part.text.trim() === "") {
            break;
          }

          // Check if text contains incomplete reasoning tags during streaming
          // The middleware extracts complete <think>...</think> tags, but during streaming
          // we might see incomplete tags that haven't been extracted yet
          const hasOpeningTag = /<think[^>]*>/i.test(part.text);
          const hasClosingTag = /<\/think>/i.test(part.text);

          // During streaming, if we see an opening tag without a closing tag, skip this part
          // as it will be converted to a reasoning part once the closing tag arrives
          if (isStreaming && hasOpeningTag && !hasClosingTag) {
            break;
          }

          const textComponent = (
            <MessageResponse key={`${message.id}-${part.type}-${i}`}>
              {part.text}
            </MessageResponse>
          );

          // Determine if this text comes before or after the chain of thought
          if (firstReasoningOrToolIndex === -1) {
            // No chain of thought, put all text in "after" (which will render normally)
            textAfterChainOfThought.push(textComponent);
          } else if (i < firstReasoningOrToolIndex) {
            // Text comes before the chain of thought
            textBeforeChainOfThought.push(textComponent);
          } else if (i > lastReasoningOrToolIndex) {
            // Text comes after the chain of thought
            textAfterChainOfThought.push(textComponent);
          } else {
            // Text is between reasoning/tool parts, treat as after
            textAfterChainOfThought.push(textComponent);
          }
          break;

        case "file":
          // For user messages, images are rendered above, so skip here
          if (message.role === "user" && part.mediaType?.startsWith("image/")) {
            break;
          }
          // For assistant messages, render images inline
          if (part.mediaType?.startsWith("image/")) {
            // Determine if this image comes before or after the chain of thought
            if (
              firstReasoningOrToolIndex === -1 ||
              i > lastReasoningOrToolIndex
            ) {
              textAfterChainOfThought.push(
                <ChatImage
                  key={`${message.id}-${part.type}-${i}`}
                  src={part.url || ""}
                  alt={part.filename || "Uploaded image"}
                />,
              );
            } else if (i < firstReasoningOrToolIndex) {
              textBeforeChainOfThought.push(
                <ChatImage
                  key={`${message.id}-${part.type}-${i}`}
                  src={part.url || ""}
                  alt={part.filename || "Uploaded image"}
                />,
              );
            } else {
              otherParts.push(
                <ChatImage
                  key={`${message.id}-${part.type}-${i}`}
                  src={part.url || ""}
                  alt={part.filename || "Uploaded image"}
                />,
              );
            }
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
            // Determine if this image comes before or after the chain of thought
            if (
              firstReasoningOrToolIndex === -1 ||
              i > lastReasoningOrToolIndex
            ) {
              textAfterChainOfThought.push(
                <GeneratedImageRenderer
                  key={`${message.id}-${part.type}-${i}`}
                  part={part}
                  messageId={message.id}
                  index={i}
                />,
              );
            } else if (i < firstReasoningOrToolIndex) {
              textBeforeChainOfThought.push(
                <GeneratedImageRenderer
                  key={`${message.id}-${part.type}-${i}`}
                  part={part}
                  messageId={message.id}
                  index={i}
                />,
              );
            } else {
              otherParts.push(
                <GeneratedImageRenderer
                  key={`${message.id}-${part.type}-${i}`}
                  part={part}
                  messageId={message.id}
                  index={i}
                />,
              );
            }
          }
          break;
      }
    },
  );

  return (
    <Fragment key={message.id}>
      {/* Render user images outside and above the message */}
      {message.role === "user" && imageParts.length > 0 && (
        <div className="-mb-2 flex w-full justify-end">
          <div className="flex max-w-60 flex-wrap gap-2">
            {imageParts.map(
              (part: UIMessagePart<UIDataTypes, UITools>, i: number) =>
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
        <MessageContent>
          <>
            {textBeforeChainOfThought}
            {reasoningAndToolParts.length > 0 && (
              <ChainOfThought defaultOpen={isStreaming}>
                <ChainOfThoughtHeader />
                <ChainOfThoughtContent>
                  {reasoningAndToolParts}
                </ChainOfThoughtContent>
              </ChainOfThought>
            )}
            {textAfterChainOfThought}
            {otherParts}
          </>
        </MessageContent>
      </Message>
    </Fragment>
  );
}
