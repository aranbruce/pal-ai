/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-children-prop */

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CodeContainer from "@/components/code-container";

export default function MarkdownContainer({ children }: { children: string }) {
  children = children ?? "";
  return (
    <Markdown
      children={children}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: "h2",
        h2: ({ node, children, ...props }): any => {
          return (
            <h2 className="text-xl font-semibold" {...props}>
              {children}
            </h2>
          );
        },
        h3: ({ node, children, ...props }): any => {
          return (
            <h3 className="text-lg font-semibold" {...props}>
              {children}
            </h3>
          );
        },
        h4: ({ node, children, ...props }): any => {
          return (
            <h4 className="text-md font-semibold" {...props}>
              {children}
            </h4>
          );
        },
        ol: ({ node, children, ...props }: any) => {
          return (
            <div
              className="flex flex-col flex-wrap gap-4 whitespace-normal"
              {...props}
            >
              {children}
            </div>
          );
        },

        ul: ({ node, children, ...props }: any) => {
          return (
            <div
              className="flex flex-col flex-wrap gap-4 whitespace-normal"
              {...props}
            >
              {children}
            </div>
          );
        },
        li: ({ node, children, ...props }: any) => {
          return (
            <div className="h-auto whitespace-normal" {...props}>
              {children}
            </div>
          );
        },
        strong: ({ node, children, ...props }: any) => {
          return (
            <span className="font-semibold" {...props}>
              {children}
            </span>
          );
        },
        hr: ({ node, ...props }): any => {
          return (
            <hr
              className="border-t border-zinc-200 dark:border-zinc-800"
              {...props}
            />
          );
        },
        a: ({ node, children, title, ...props }): any => {
          return (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={
                title === "source"
                  ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 p-2 text-xs font-semibold text-zinc-600 no-underline dark:bg-zinc-700 dark:text-zinc-300"
                  : "text-zinc-950 underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 dark:text-zinc-50 dark:ring-offset-zinc-900 dark:focus-visible:ring-zinc-300"
              }
              {...props}
            >
              {children}
            </a>
          );
        },
        pre: ({ node, children, ...props }): any => {
          return (
            <pre className="grid w-full" {...props}>
              {children}
            </pre>
          );
        },
        code: ({ node, className, children, ...props }): any => {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "text";
          const capitalizedLanguage =
            language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
          return match ? (
            <CodeContainer
              capitalizedLanguage={capitalizedLanguage}
              language={language}
              children={children}
            />
          ) : (
            <code {...props} className="contents text-sm font-semibold">
              {children}
            </code>
          );
        },
      }}
    />
  );
}
