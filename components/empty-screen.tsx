"use client";

import { useAIState, useActions } from "ai/rsc";
import { useEffect, useState } from "react";

import { AIState } from "@/app/ai";

import { modelVariableOptions } from "@/libs/models";

import ExampleMessageCardGroup from "./example-message/example-message-group";
import Select from "./select";

export default function EmptyScreen() {
  const [examplesUI, setExamplesUI] = useState(null);
  const { createExampleMessages } = useActions();
  const [AIState, setAIState] = useAIState();

  useEffect(() => {
    async function fetchExamples() {
      const exampleMessagesUI = await createExampleMessages();
      setExamplesUI(exampleMessagesUI);
    }
    fetchExamples();
  });

  function setSelectedValue(value: string) {
    setAIState((AIState: AIState) => {
      return { ...AIState, currentModelVariable: value };
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-between gap-16">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-300">
          Select a model
        </p>
        <Select
          variant="primary"
          options={modelVariableOptions}
          selectedValue={AIState.currentModelVariable}
          setSelectedValue={setSelectedValue}
        />
      </div>
      <div className="flex h-full flex-col content-center items-center justify-center gap-8 text-center">
        <div className="flex w-full flex-col items-center justify-center gap-2 text-center">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100">
            Hi I&apos;m Pal
          </h1>
          <p className="text-muted-foreground leading-normal text-zinc-500 dark:text-zinc-400">
            How can I help today?
          </p>
        </div>
        {!examplesUI ? (
          <ExampleMessageCardGroup exampleMessages={[]} />
        ) : (
          examplesUI
        )}
      </div>
    </div>
  );
}
