"use client";

import { FeedbackActions } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  MessageAction,
  MessageActions,
  MessageToolbar,
} from "@/components/ai-elements/message";
import { MessageRenderer } from "@/components/ai-elements/message-renderer";
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
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { getProviderLogo } from "@/components/provider-logos";
import { DEFAULT_SUGGESTIONS, GEOLOCATION_CONFIG } from "@/lib/chat-constants";
import {
  createMessageBody,
  createRegenerateMessage,
  extractTextFromMessage,
  findPreviousUserMessage,
  validateMessage,
} from "@/lib/chat-helpers";
import type { ConversationDemoProps, UserLocation } from "@/lib/chat-types";
import { extractSourcesFromMessage } from "@/lib/chat-utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import { CopyIcon, GlobeIcon, RefreshCcwIcon, XIcon } from "lucide-react";
import {
  Fragment,
  createElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

// Helper component to render provider logo (declared outside render to avoid ESLint error)
function ProviderLogo({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  return createElement(getProviderLogo(provider), { className });
}

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
      sendMessage(message, {
        body: createMessageBody(
          model,
          traceId,
          useWebSearch,
          userLocation,
          additionalBody,
        ),
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

      if (!validateMessage(message)) {
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
    (messageIndex: number, messagesSnapshot?: typeof messages): void => {
      const messagesToUse = messagesSnapshot || messages;
      const userMessageIndex = findPreviousUserMessage(
        messagesToUse,
        messageIndex,
      );

      if (userMessageIndex === -1) {
        console.error("No previous user message found to regenerate from");
        return;
      }

      const userMessage = messagesToUse[userMessageIndex];
      if (!userMessage) {
        console.error("User message not found");
        return;
      }

      // Remove all messages from the user message onwards
      const newMessages = messagesToUse.slice(0, userMessageIndex);
      setMessages(newMessages);

      // Create regenerate message and send
      const regenerateMessage = createRegenerateMessage(userMessage);
      sendMessageWithBody(regenerateMessage);
    },
    [messages, setMessages, sendMessageWithBody],
  );

  const handleRegenerate = useCallback(
    (messageIndex: number): void => {
      // If streaming, stop the current stream first
      if (status === "streaming") {
        stop();
        // Capture current state before stream changes
        const currentMessages = [...messages];
        setTimeout(() => {
          performRegenerate(messageIndex, currentMessages);
        }, 100);
        return;
      }

      performRegenerate(messageIndex);
    },
    [status, stop, performRegenerate, messages],
  );

  return (
    <div className="relative size-full overflow-hidden">
      <div className="flex h-full flex-col items-center">
        <Conversation className="w-full">
          <ConversationContent className="mx-auto w-full max-w-3xl space-y-4 pt-20">
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
              messages.map((message, messageIndex) => (
                <Fragment key={message.id}>
                  <MessageRenderer
                    message={message}
                    messages={messages}
                    status={status}
                  />

                  {/* Render sources for assistant messages */}
                  {message.role === "assistant" &&
                    (messageIndex !== messages.length - 1 ||
                      status !== "streaming") &&
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
                      <MessageToolbar>
                        <MessageActions>
                          <FeedbackActions messageId={message.id} />
                          <MessageAction
                            onClick={() => {
                              const textContent =
                                extractTextFromMessage(message);
                              navigator.clipboard.writeText(textContent);
                            }}
                            label="Copy"
                            tooltip="Copy message"
                          >
                            <CopyIcon />
                          </MessageAction>
                          <MessageAction
                            onClick={() => handleRegenerate(messageIndex)}
                            label="Regenerate"
                            tooltip={
                              status === "streaming"
                                ? "Stop current response and regenerate"
                                : status === "submitted"
                                  ? "Please wait for response to complete"
                                  : "Regenerate response"
                            }
                            disabled={status === "submitted"}
                          >
                            <RefreshCcwIcon />
                          </MessageAction>
                        </MessageActions>
                      </MessageToolbar>
                    )}
                </Fragment>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mx-auto mb-2 w-[calc(100%-2rem)] max-w-3xl md:mb-4"
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
                    <GlobeIcon className="size-4 group-hover:hidden" />
                    <XIcon className="group:text-primary/40 text-muted-foreground hidden size-4 group-hover:block" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                }
                inactiveIcon={
                  <>
                    <GlobeIcon className="size-4" />
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
                    return (
                      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                        <ProviderLogo
                          provider={selectedModel.provider}
                          className="h-4 w-4 shrink-0"
                        />
                        <span className="truncate">{selectedModel.name}</span>
                      </div>
                    );
                  })()}
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((m) => (
                    <PromptInputModelSelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <ProviderLogo
                          provider={m.provider}
                          className="h-4 w-4 shrink-0"
                        />
                        <span>{m.name}</span>
                      </div>
                    </PromptInputModelSelectItem>
                  ))}
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
