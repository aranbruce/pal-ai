"use client";

import { useState } from "react";

import { modelVariableOptions } from "@/libs/models";

import ExampleMessageCardGroup from "./example-message/example-message-group";
import Select from "./select";

// Static example messages
const exampleMessages = [
  {
    index: 0,
    heading: "🗞️ Latest News",
    subheading: "What's happening in the world today?",
  },
  {
    index: 1,
    heading: "🌤️ Weather",
    subheading: "What's the weather like in San Francisco?",
  },
  {
    index: 2,
    heading: "🍿 Movies",
    subheading: "What are the top rated movies right now?",
  },
  {
    index: 3,
    heading: "🔎 Search",
    subheading: "Tell me about the history of artificial intelligence",
  },
];

export default function EmptyScreen({
  onExampleClick,
}: {
  onExampleClick?: (message: string) => void;
}) {
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

  function setSelectedValue(value: string) {
    setSelectedModel(value);
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
          selectedValue={selectedModel}
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
        <ExampleMessageCardGroup
          exampleMessages={exampleMessages}
          onExampleClick={onExampleClick}
        />
      </div>
    </div>
  );
}
