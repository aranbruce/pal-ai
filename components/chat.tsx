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
import { DEFAULT_SUGGESTIONS, GEOLOCATION_CONFIG } from "@/lib/chat-constants";
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
import { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function ConversationDemo({ models, defaultModel }: ConversationDemoProps) {
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
          enableHighAccuracy: GEOLOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
          timeout: GEOLOCATION_CONFIG.TIMEOUT,
          maximumAge: GEOLOCATION_CONFIG.MAXIMUM_AGE,
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

  const handleStop = useCallback(() => {
    stop();
    toast.info("Response stopped", {
      description: "The AI response has been stopped.",
      position: "top-center",
      dismissible: true,
    });
  }, [stop]);

  // Helper function to send messages with common body structure
  const sendMessageWithBody = useCallback(
    (
      message: { text: string; files?: PromptInputMessage["files"] },
      additionalBody?: Record<string, unknown>,
    ): void => {
      const userId = posthog.get_distinct_id();
      sendMessage(message, {
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
          ...additionalBody,
        },
      });
    },
    [model, traceId, useWebSearch, userLocation, sendMessage],
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage): void => {
      // Prevent submission while streaming
      if (status === "streaming") {
        return;
      }

      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      sendMessageWithBody({
        text: message.text || "Sent with attachments",
        files: message.files,
      });
      setText("");
    },
    [status, sendMessageWithBody],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string): void => {
      sendMessageWithBody({ text: suggestion });
    },
    [sendMessageWithBody],
  );

  const performRegenerate = useCallback(
    (messageIndex: number): void => {
      // Find the user message that precedes the assistant message at messageIndex
      // We need to look backwards from the current message to find the user message
      let userMessageIndex = -1;

      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messages[i]?.role === "user") {
          userMessageIndex = i;
          break;
        }
      }

      if (userMessageIndex === -1) {
        console.error("No previous user message found to regenerate from");
        return;
      }

      const userMessage = messages[userMessageIndex];
      if (!userMessage) {
        console.error("User message not found");
        return;
      }

      const userMessageParts = userMessage.parts;
      const textContent = userMessageParts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n");

      const filesContent = userMessageParts.filter(
        (part) => part.type === "file",
      );

      // Remove all messages from the user message onwards (including the user message itself)
      const newMessages = messages.slice(0, userMessageIndex);
      setMessages(newMessages);

      sendMessageWithBody({
        text: textContent,
        files: filesContent,
      });
    },
    [messages, setMessages, sendMessageWithBody],
  );

  const handleRegenerate = useCallback(
    (messageIndex: number): void => {
      // If streaming, stop the current stream first
      if (status === "streaming") {
        stop();

        // Use a more reliable approach - find the user message immediately
        // before the stream state changes
        const currentMessages = [...messages]; // Capture current state
        setTimeout(() => {
          performRegenerateWithMessages(messageIndex, currentMessages);
        }, 100);
        return;
      }

      performRegenerate(messageIndex);
    },
    [status, stop, performRegenerate],
  );

  const performRegenerateWithMessages = useCallback(
    (messageIndex: number, messagesSnapshot: typeof messages): void => {
      // Find the user message that precedes the assistant message at messageIndex
      let userMessageIndex = -1;

      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messagesSnapshot[i]?.role === "user") {
          userMessageIndex = i;
          break;
        }
      }

      if (userMessageIndex === -1) {
        console.error("No previous user message found to regenerate from");
        return;
      }

      const userMessage = messagesSnapshot[userMessageIndex];
      if (!userMessage) {
        console.error("User message not found");
        return;
      }

      const userMessageParts = userMessage.parts;
      const textContent = userMessageParts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n");

      const filesContent = userMessageParts.filter(
        (part) => part.type === "file",
      );

      // Remove all messages from the user message onwards (including the user message itself)
      const newMessages = messagesSnapshot.slice(0, userMessageIndex);
      setMessages(newMessages);

      sendMessageWithBody({
        text: textContent,
        files: filesContent,
      });
    },
    [setMessages, sendMessageWithBody],
  );

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
                            tooltip={
                              status === "streaming"
                                ? "Stop current response and regenerate"
                                : "Regenerate response"
                            }
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
}

export default ConversationDemo;
