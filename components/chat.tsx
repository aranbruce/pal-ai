"use client";

import { Action, Actions } from "@/components/ai-elements/actions";
import { ChatImage } from "@/components/ai-elements/chat-image";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Image } from "@/components/ai-elements/image";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToggleButton,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import WeatherDisplay from "@/components/weather-display";
import WeatherForecastCard from "@/components/weather-forecast-card";
import { useChat } from "@ai-sdk/react";
import {
  CalendarDaysIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  Square2StackIcon,
} from "@heroicons/react/16/solid";
import {
  ArrowPathIcon,
  GlobeEuropeAfricaIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import type { Experimental_GeneratedImage, ToolUIPart } from "ai";
import { DefaultChatTransport } from "ai";
import { Fragment, useState } from "react";

interface Model {
  provider: string;
  name: string;
  id: string;
}

interface ConversationDemoProps {
  models: Model[];
  defaultModel?: string;
}

// Helper function to check if a part is a ToolUIPart
function isToolUIPart(part: any): part is ToolUIPart {
  return (
    part.type && typeof part.type === "string" && part.type.startsWith("tool-")
  );
}

// Helper function to get the icon for a tool based on its type
function getToolIcon(
  toolType: string,
): React.ComponentType<{ className?: string }> | undefined {
  if (toolType.includes("get_current_weather")) {
    return CloudIcon;
  }
  if (toolType.includes("get_weather_forecast")) {
    return CalendarDaysIcon;
  }
  if (toolType.includes("search_web")) {
    return GlobeAltIcon;
  }
  if (toolType.includes("get_webpage_contents")) {
    return DevicePhoneMobileIcon;
  }
  return undefined; // Will use default WrenchIcon
}

// Safely stringify objects, handling circular references
function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]";
        }
        seen.add(value);
      }
      return value;
    },
    2,
  );
}

// Format tool output for better display
function formatToolOutput(toolType: string, output: any): string {
  if (!output) return "No output";

  // Handle array of webpage results
  if (Array.isArray(output)) {
    return output
      .map((item, idx) => {
        if (item.url && item.rawContent) {
          return `**Source ${idx + 1}: ${item.url}**\n\n${item.rawContent}\n\n---\n`;
        }
        try {
          return safeStringify(item);
        } catch (e) {
          return `Error formatting item ${idx + 1}`;
        }
      })
      .join("\n");
  }

  // Handle object output
  if (typeof output === "object") {
    try {
      return safeStringify(output);
    } catch (e) {
      return "Error: Could not format output";
    }
  }

  // Handle string output
  return String(output);
}

const ConversationDemo = ({ models, defaultModel }: ConversationDemoProps) => {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(
    defaultModel || models[0]?.id || "",
  );

  const suggestions = [
    "What are the latest trends in AI?",
    "How does machine learning work?",
    "Explain quantum computing",
    "Best practices for React development",
  ];

  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  const { messages, status, sendMessage, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    // Prevent submission while streaming
    if (status === "streaming") {
      return;
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: useWebSearch,
        },
      },
    );
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      { text: suggestion },
      {
        body: {
          model: model,
          webSearch: useWebSearch,
        },
      },
    );
  };

  return (
    <div className="relative size-full pb-2 md:pb-4">
      <div className="flex h-full flex-col items-center">
        <Conversation className="w-full">
          <ConversationContent className="mx-auto w-full max-w-3xl pt-20">
            {messages.length === 0 ? (
              <>
                <ConversationEmptyState
                  title="Hi I'm Pal AI"
                  description="How can I assist you today?"
                />
                <Suggestions className="mt-6">
                  {suggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion}
                      onClick={handleSuggestionClick}
                      suggestion={suggestion}
                    />
                  ))}
                </Suggestions>
              </>
            ) : (
              messages.map((message, messageIndex) => {
                // Separate images from other content for user messages
                const imageParts =
                  message.role === "user"
                    ? message.parts.filter(
                        (part) =>
                          part.type === "file" &&
                          part.mediaType?.startsWith("image/"),
                      )
                    : [];

                return (
                  <Fragment key={message.id}>
                    {/* Render user images outside and above the message */}
                    {message.role === "user" && imageParts.length > 0 && (
                      <div className="-mb-2 flex w-full justify-end">
                        <div className="flex max-w-60 flex-wrap gap-2">
                          {imageParts.map(
                            (part, i) =>
                              part.type === "file" && (
                                <ChatImage
                                  key={`${message.id}-img-${i}`}
                                  src={part.url}
                                  alt={part.filename || "Uploaded image"}
                                />
                              ),
                          )}
                        </div>
                      </div>
                    )}

                    <Message from={message.role}>
                      <MessageContent variant="flat">
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "reasoning":
                              return (
                                <Reasoning
                                  key={`${message.id}-${i}`}
                                  className="w-full"
                                  isStreaming={
                                    status === "streaming" &&
                                    i === message.parts.length - 1 &&
                                    message.id === messages.at(-1)?.id
                                  }
                                >
                                  <ReasoningTrigger />
                                  <ReasoningContent>
                                    {part.text}
                                  </ReasoningContent>
                                </Reasoning>
                              );
                            case "text":
                              // Skip empty text parts
                              if (!part.text || part.text.trim() === "") {
                                return null;
                              }

                              return (
                                <Response
                                  key={`${message.id}-${part.type}-${i}`}
                                >
                                  {part.text}
                                </Response>
                              );
                            case "file":
                              // For user messages, images are rendered above, so skip here
                              if (
                                message.role === "user" &&
                                part.mediaType?.startsWith("image/")
                              ) {
                                return null;
                              }
                              // For assistant messages, render images inline
                              if (part.mediaType?.startsWith("image/")) {
                                return (
                                  <ChatImage
                                    key={`${message.id}-${part.type}-${i}`}
                                    src={part.url}
                                    alt={part.filename || "Uploaded image"}
                                  />
                                );
                              }
                              return null;
                            default:
                              // Handle tool calls
                              if (isToolUIPart(part)) {
                                // Check if this is a weather tool with valid output
                                const isWeatherTool =
                                  part.type.includes("get_current_weather") &&
                                  part.output &&
                                  typeof part.output === "object" &&
                                  "current" in part.output;

                                // Check if this is a weather forecast tool with valid output
                                const isWeatherForecastTool =
                                  part.type.includes("get_weather_forecast") &&
                                  part.output &&
                                  typeof part.output === "object" &&
                                  "daily" in part.output;

                                // If it's a weather tool, render the weather card beneath the tool component
                                if (isWeatherTool) {
                                  return (
                                    <Fragment
                                      key={`${message.id}-${part.type}-${i}`}
                                    >
                                      <Tool defaultOpen={false}>
                                        <ToolHeader
                                          type={part.type}
                                          state={part.state}
                                          icon={getToolIcon(part.type)}
                                        />
                                        <ToolContent>
                                          <ToolInput input={part.input} />
                                          <ToolOutput
                                            output={part.output}
                                            errorText={part.errorText}
                                          />
                                        </ToolContent>
                                      </Tool>
                                      <WeatherDisplay
                                        data={part.output as any}
                                      />
                                    </Fragment>
                                  );
                                }

                                // If it's a weather forecast tool, render the weather forecast card beneath the tool component
                                if (isWeatherForecastTool) {
                                  return (
                                    <Fragment
                                      key={`${message.id}-${part.type}-${i}`}
                                    >
                                      <Tool defaultOpen={false}>
                                        <ToolHeader
                                          type={part.type}
                                          state={part.state}
                                          icon={getToolIcon(part.type)}
                                        />
                                        <ToolContent>
                                          <ToolInput input={part.input} />
                                          <ToolOutput
                                            output={part.output}
                                            errorText={part.errorText}
                                          />
                                        </ToolContent>
                                      </Tool>
                                      <WeatherForecastCard
                                        data={part.output as any}
                                      />
                                    </Fragment>
                                  );
                                }

                                // For other tools, render normally
                                return (
                                  <Tool
                                    key={`${message.id}-${part.type}-${i}`}
                                    defaultOpen={false}
                                  >
                                    <ToolHeader
                                      type={part.type}
                                      state={part.state}
                                      icon={getToolIcon(part.type)}
                                    />
                                    <ToolContent>
                                      <ToolInput input={part.input} />
                                      <ToolOutput
                                        output={part.output}
                                        errorText={part.errorText}
                                      />
                                    </ToolContent>
                                  </Tool>
                                );
                              }
                              // Handle experimental image parts
                              if (
                                "image" in part &&
                                part.image &&
                                typeof part.image === "object" &&
                                "base64" in part.image
                              ) {
                                const imageData =
                                  part.image as Experimental_GeneratedImage;
                                return (
                                  <Image
                                    key={`${message.id}-${part.type}-${i}`}
                                    base64={imageData.base64}
                                    uint8Array={imageData.uint8Array}
                                    mediaType={imageData.mediaType}
                                    alt="Generated image"
                                  />
                                );
                              }
                              return null;
                          }
                        })}
                      </MessageContent>
                    </Message>
                    {message.role === "assistant" &&
                      (messageIndex !== messages.length - 1 ||
                        status !== "streaming") && (
                        <Actions>
                          <Action
                            onClick={() => {
                              const textContent = message.parts
                                .filter((part) => part.type === "text")
                                .map((part) => part.text)
                                .join("\n");
                              navigator.clipboard.writeText(textContent);
                            }}
                            label="Copy"
                            tooltip="Copy message"
                          >
                            <Square2StackIcon />
                          </Action>
                          {messageIndex === messages.length - 1 && (
                            <Action
                              onClick={() => {
                                // Find the last user message to regenerate
                                const lastUserMessage = messages
                                  .slice(0, messageIndex)
                                  .reverse()
                                  .find((m) => m.role === "user");

                                if (lastUserMessage) {
                                  // Remove both the last assistant message and last user message
                                  const messagesWithoutLastTwo = messages.slice(
                                    0,
                                    -2,
                                  );
                                  setMessages(messagesWithoutLastTwo);

                                  const textContent = lastUserMessage.parts
                                    .filter((part) => part.type === "text")
                                    .map((part) => part.text)
                                    .join("\n");

                                  sendMessage(
                                    { text: textContent },
                                    {
                                      body: {
                                        model: model,
                                        webSearch: useWebSearch,
                                      },
                                    },
                                  );
                                }
                              }}
                              label="Regenerate"
                              tooltip="Regenerate response"
                            >
                              <ArrowPathIcon />
                            </Action>
                          )}
                        </Actions>
                      )}
                  </Fragment>
                );
              })
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mx-3 w-[calc(100%-1.5rem)] max-w-3xl"
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputToggleButton
                active={useWebSearch}
                onClick={() => setUseWebSearch(!useWebSearch)}
                activeIcon={
                  <>
                    <GlobeEuropeAfricaIcon className="size-4 group-hover:hidden" />
                    <XCircleIcon className="group:text-primary/40 text-muted-foreground hidden size-4 group-hover:block" />
                    <span>Search</span>
                  </>
                }
                inactiveIcon={
                  <>
                    <GlobeEuropeAfricaIcon className="size-4" />
                    <span>Search</span>
                  </>
                }
              />
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue placeholder="Select model" />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((m) => (
                    <PromptInputModelSelectItem key={m.id} value={m.id}>
                      {m.provider} - {m.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!text && status !== "streaming"}
              status={status}
              onStop={stop}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ConversationDemo;
