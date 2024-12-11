"use client";

import { generateId } from "ai";
import { useAIState, useActions, useUIState } from "ai/rsc";
import { useEffect, useState } from "react";

import type { AIState, ClientMessage } from "@/app/ai";
import EmptyScreen from "@/components/empty-screen";
import MessageList from "@/components/message-list";
import PromptForm from "@/components/prompt-form";

import useFileUpload from "@/libs/hooks/use-file-upload";
import useLocation from "@/libs/hooks/use-location";
import { useScrollAnchor } from "@/libs/hooks/use-scroll-anchor";

export default function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useUIState();
  const [aiState, setAIState] = useAIState();

  const { continueConversation } = useActions();

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor();

  // eslint-disable-next-line
  const { location } = useLocation();

  const { fileUpload, setFileUpload, handleFileUpload, inputFileRef } =
    useFileUpload();

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function resetFileUpload() {
    setFileUpload(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  }

  function addMessage(message: ClientMessage) {
    setMessages((messages: ClientMessage[]) => [...messages, message]);
  }

  async function sendMessage(message: string) {
    if (!aiState.isFinished || !message || fileUpload?.isUploading) return;

    resetFileUpload();
    setInputValue("");

    setAIState((AIState: AIState) => ({ ...AIState, isFinished: false }));

    addMessage({
      id: generateId(),
      role: "user",
      content: message,
      file: fileUpload
        ? {
            url: fileUpload.url,
            downloadUrl: fileUpload.downloadUrl,
            pathname: fileUpload.pathname,
            contentType: fileUpload.contentType || "",
            contentDisposition: fileUpload.contentDisposition || "",
          }
        : undefined,
      model: aiState.currentModelVariable,
    });
    const response = await continueConversation(message, fileUpload);
    // wait 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));

    addMessage(response);
  }

  return (
    <div className="h-svh w-full overflow-scroll" ref={scrollRef}>
      <div
        ref={messagesRef}
        className="mx-auto max-w-2xl px-3 pb-[256px] pt-32"
      >
        {messages.length ? (
          <MessageList messages={messages} visibilityRef={visibilityRef} />
        ) : (
          <EmptyScreen />
        )}
      </div>
      <PromptForm
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={sendMessage}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        handleFileUpload={handleFileUpload}
        inputFileRef={inputFileRef}
        fileUpload={fileUpload}
        setFileUpload={setFileUpload}
      />
    </div>
  );
}
