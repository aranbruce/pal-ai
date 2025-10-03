"use client";

import { Action, Actions } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Image } from "@/components/ai-elements/image";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { MicrophoneIcon } from "@heroicons/react/16/solid";
import {
  ArrowPathIcon,
  GlobeEuropeAfricaIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import {
  ChatBubbleLeftIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import type { Experimental_GeneratedImage } from "ai";
import { DefaultChatTransport } from "ai";
import { Fragment, useEffect, useState } from "react";

interface Model {
  provider: string;
  name: string;
  id: string;
}

interface ConversationDemoProps {
  models: Model[];
  defaultModel?: string;
}

const ConversationDemo = ({ models, defaultModel }: ConversationDemoProps) => {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(
    defaultModel || models[0]?.id || "",
  );

  useEffect(() => {
    console.log("Model ID changed to:", model);
  }, [model]);

  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  const { messages, status, sendMessage, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
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

  return (
    <div className="relative size-full h-full pb-4">
      <div className="flex h-full flex-col items-center">
        <Conversation className="w-full">
          <ConversationContent className="mx-auto w-full max-w-3xl px-6 pt-20">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<ChatBubbleLeftIcon className="size-12" />}
                title="Hi I'm Pal AI"
                description="How can I assist you today?"
              />
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
                                <img
                                  key={`${message.id}-img-${i}`}
                                  src={part.url}
                                  alt={part.filename || "Uploaded image"}
                                  className="h-auto max-w-full rounded-lg border"
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
                            case "text":
                              return (
                                <Response key={`${message.id}-${i}`}>
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
                                  <img
                                    key={`${message.id}-${i}`}
                                    src={part.url}
                                    alt={part.filename || "Uploaded image"}
                                    className="h-auto max-w-full rounded-lg border"
                                  />
                                );
                              }
                              return null;
                            default:
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
                                    key={`${message.id}-${i}`}
                                    base64={imageData.base64}
                                    uint8Array={imageData.uint8Array}
                                    mediaType={imageData.mediaType}
                                    alt="Generated image"
                                    className="h-auto max-w-full rounded-lg border"
                                  />
                                );
                              }
                              return null;
                          }
                        })}
                      </MessageContent>
                      {message.role === "assistant" && (
                        <MessageAvatar
                          src="/images/logo-mark.svg"
                          name="Pal AI"
                        />
                      )}
                    </Message>
                    {message.role === "assistant" && (
                      <Actions className="">
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
                          <Square2StackIcon className="size-5" />
                        </Action>
                        {messageIndex === messages.length - 1 && (
                          <Action
                            onClick={() => {
                              // Regenerate by resubmitting the last user message
                              const lastUserMessage = messages
                                .slice(0, messageIndex)
                                .reverse()
                                .find((m) => m.role === "user");
                              if (lastUserMessage) {
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
                            <ArrowPathIcon className="size-5" />
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
          className="mx-6 w-[calc(100%-3rem)] max-w-3xl"
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
                <PromptInputActionMenuTrigger className="size-8" />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                size="icon"
                onClick={() => setUseMicrophone(!useMicrophone)}
                variant="ghost"
                className={cn(
                  "border hover:border-transparent focus-visible:border-transparent",
                  useMicrophone ? "bg-background/60" : "border-transparent",
                )}
              >
                <MicrophoneIcon className="size-4" />
                <span className="sr-only">Microphone</span>
              </PromptInputButton>
              <PromptInputButton
                size="sm"
                // variant={useWebSearch ? "default" : "ghost"}
                variant="ghost"
                onClick={() => setUseWebSearch(!useWebSearch)}
                className={cn(
                  "group border hover:border-transparent focus-visible:border-transparent",
                  useWebSearch ? "bg-background/60" : "border-transparent",
                )}
              >
                {useWebSearch ? (
                  <>
                    <GlobeEuropeAfricaIcon className="size-4 group-hover:hidden" />
                    <XCircleIcon className="group:text-primary/40 text-muted-foreground hidden size-4 group-hover:block" />
                  </>
                ) : (
                  <GlobeEuropeAfricaIcon className="size-4" />
                )}
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger className="cursor-pointer">
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
              disabled={!text && !status}
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
