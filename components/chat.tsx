"use client";

import {
  Action,
  Actions,
  FeedbackActions,
} from "@/components/ai-elements/actions";
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
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { getProviderLogo } from "@/components/provider-logos";
import { ToolRenderer } from "@/components/tool-renderer";
import { DEFAULT_SUGGESTIONS } from "@/lib/chat-constants";
import type { ConversationDemoProps, UserLocation } from "@/lib/chat-types";
import { extractSourcesFromMessage, isToolUIPart } from "@/lib/chat-utils";
import { useChat } from "@ai-sdk/react";
import {
  ArrowPathIcon,
  GlobeEuropeAfricaIcon,
  Square2StackIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import type { Experimental_GeneratedImage } from "ai";
import { DefaultChatTransport, generateId } from "ai";
import posthog from "posthog-js";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

const ConversationDemo = ({ models, defaultModel }: ConversationDemoProps) => {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(
    defaultModel || models[0]?.id || "",
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [traceId] = useState<string>(() => generateId()); // Generate once per conversation

  // Request user's location on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // Silently fail - location is optional
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // Cache for 5 minutes
        },
      );
    }
  }, []);

  const { messages, status, sendMessage, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api:
        process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
          ? "/api/chat-mock"
          : "/api/chat",
    }),
    onError: (error) => {
      // Display user-friendly error message
      console.error("Chat error:", error);

      // Check if it's a network error
      if (error.message.includes("fetch")) {
        toast.error("Network Error", {
          description:
            "Unable to connect to the chat service. Please check your connection.",
          position: "top-center",
          dismissible: true,
        });
      } else if (error.message.includes("abort")) {
        // Stream was aborted - this is handled separately
        return;
      } else {
        toast.error("Something went wrong", {
          description:
            error.message || "An unexpected error occurred. Please try again.",
          position: "top-center",
          dismissible: true,
        });
      }
    },
  });

  const handleStop = () => {
    stop();
    toast.info("Response stopped", {
      description: "The AI response has been stopped.",
      position: "top-center",
      dismissible: true,
    });
  };

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

    const userId = posthog.get_distinct_id();
    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          traceId: traceId,
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
        },
      },
    );
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userId = posthog.get_distinct_id();
    sendMessage(
      { text: suggestion },
      {
        body: {
          model: model,
          traceId: traceId,
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
        },
      },
    );
  };

  const handleRegenerate = (messageIndex: number) => {
    // Validate that there's a previous user message
    if (messageIndex <= 0) {
      console.error("No previous user message to regenerate from");
      return;
    }

    const previousUserMessage = messages[messageIndex - 1];
    if (!previousUserMessage || previousUserMessage.role !== "user") {
      console.error("Previous message is not a user message");
      return;
    }

    const previousUserMessageParts = previousUserMessage.parts;
    const textContent = previousUserMessageParts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");

    const filesContent = previousUserMessageParts.filter(
      (part) => part.type === "file",
    );

    // Remove all following messages
    const newMessages = messages.slice(0, messageIndex - 1);
    setMessages(newMessages);

    const userId = posthog.get_distinct_id();
    sendMessage(
      {
        text: textContent,
        files: filesContent,
      },
      {
        body: {
          model: model,
          traceId: traceId,
          webSearch: useWebSearch,
          ...(userId && { userId }),
          ...(userLocation && {
            data: {
              location: {
                coordinates: {
                  latitude: userLocation?.latitude,
                  longitude: userLocation?.longitude,
                },
              },
            },
          }),
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
                  {DEFAULT_SUGGESTIONS.map((suggestion) => (
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
                                return (
                                  <ToolRenderer
                                    key={`${message.id}-${part.type}-${i}`}
                                    part={part}
                                    messageId={message.id}
                                    partIndex={i}
                                  />
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

                    {/* Render sources for assistant messages */}
                    {message.role === "assistant" &&
                      (() => {
                        const sources = extractSourcesFromMessage(message);
                        if (sources.length > 0) {
                          return (
                            <Sources>
                              <SourcesTrigger count={sources.length} />
                              <SourcesContent>
                                {sources.map((source, idx) => (
                                  <Source
                                    key={`${message.id}-source-${idx}`}
                                    href={source.url}
                                    title={source.title}
                                  />
                                ))}
                              </SourcesContent>
                            </Sources>
                          );
                        }
                        return null;
                      })()}

                    {message.role === "assistant" &&
                      (messageIndex !== messages.length - 1 ||
                        status !== "streaming") && (
                        <Actions>
                          <FeedbackActions messageId={message.id} />
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
                          <Action
                            onClick={() => handleRegenerate(messageIndex)}
                            label="Regenerate"
                            tooltip="Regenerate response"
                          >
                            <ArrowPathIcon />
                          </Action>
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
          className="mx-auto w-[calc(100%-2rem)] max-w-3xl"
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
            <PromptInputTools className="min-w-0">
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger className="shrink-0" />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputToggleButton
                className="shrink-0"
                active={useWebSearch}
                onClick={() => setUseWebSearch(!useWebSearch)}
                activeIcon={
                  <>
                    <GlobeEuropeAfricaIcon className="size-4 group-hover:hidden" />
                    <XCircleIcon className="group:text-primary/40 text-muted-foreground hidden size-4 group-hover:block" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                }
                inactiveIcon={
                  <>
                    <GlobeEuropeAfricaIcon className="size-4" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                }
              />
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger className="min-w-0">
                  {(() => {
                    const selectedModel = models.find((m) => m.id === model);
                    if (!selectedModel) {
                      return (
                        <PromptInputModelSelectValue placeholder="Select model" />
                      );
                    }
                    const Logo = getProviderLogo(selectedModel.provider);
                    return (
                      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                        <Logo className="h-4 w-4 shrink-0" />
                        <span className="truncate">{selectedModel.name}</span>
                      </div>
                    );
                  })()}
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((m) => {
                    const Logo = getProviderLogo(m.provider);
                    return (
                      <PromptInputModelSelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Logo className="h-4 w-4 shrink-0" />
                          <span>{m.name}</span>
                        </div>
                      </PromptInputModelSelectItem>
                    );
                  })}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              className="shrink-0"
              disabled={!text && status !== "streaming"}
              status={status}
              onStop={handleStop}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ConversationDemo;
