"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeContainerProps = {
  capitalizedLanguage: string;
  language: string;
  children: React.ReactNode;
};

export default function CodeContainer({
  capitalizedLanguage,
  language,
  children,
}: CodeContainerProps) {
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(String(children));
    setIsCopied(true);
  }

  setTimeout(() => {
    setIsCopied(false);
  }, 4000);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-zinc-300 bg-zinc-900 text-zinc-200 dark:border-zinc-800">
      <div className="text-zinc:600 relative flex justify-between bg-zinc-700 px-4 py-2 text-xs">
        <div>{capitalizedLanguage}</div>
        <button onClick={handleCopy}>{isCopied ? "Copied" : "Copy"}</button>
      </div>
      <SyntaxHighlighter
        PreTag="div"
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: "0", background: "none" }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}
