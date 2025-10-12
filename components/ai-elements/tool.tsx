"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/solid";
import type { ToolUIPart } from "ai";
import type { ComponentProps, ReactNode } from "react";
import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;

export function Tool({ className, ...props }: ToolProps) {
  return (
    <Collapsible
      className={cn("not-prose mb-4 max-w-full", className)}
      {...props}
    />
  );
}

// Utility function to transform tool names from snake_case to sentence case
const formatToolName = (toolName: string): string => {
  return toolName
    .split("_")
    .map((word, index) => {
      // Capitalize first word, lowercase the rest
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(" ");
};

export type ToolHeaderProps = {
  title?: string;
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
};

const getStatusBadge = (status: ToolUIPart["state"]) => {
  const labels = {
    "input-streaming": "Pending",
    "input-available": "Running",
    "output-available": "Completed",
    "output-error": "Error",
  } as const;

  const icons = {
    "input-streaming": <EllipsisHorizontalCircleIcon className="size-4" />,
    "input-available": <ClockIcon className="size-4 animate-pulse" />,
    "output-available": <CheckCircleIcon className="size-4 text-green-600" />,
    "output-error": <XCircleIcon className="size-4 text-red-600" />,
  } as const;

  return (
    <Badge className="gap-1.5 rounded-full text-xs" variant="secondary">
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};

export function ToolHeader({
  className,
  title,
  type,
  state,
  icon: Icon,
  ...props
}: ToolHeaderProps) {
  // Extract tool name from type (e.g., "tool-call-search_web" -> "search_web")
  const toolName = type.split("-").slice(1).join("-");
  const displayName = title ?? formatToolName(toolName);
  const ToolIcon = Icon ?? WrenchIcon;

  return (
    <CollapsibleTrigger
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <ToolIcon className="text-muted-foreground size-4" />
        <span className="text-sm font-medium">{displayName}</span>
        {getStatusBadge(state)}
      </div>
      <ChevronDownIcon className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
}

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export function ToolContent({ className, ...props }: ToolContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in outline-none",
        className,
      )}
      {...props}
    />
  );
}

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export function ToolInput({ className, input, ...props }: ToolInputProps) {
  return (
    <div
      className={cn("space-y-2 overflow-hidden p-4 pl-6", className)}
      {...props}
    >
      <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Parameters
      </h4>
      <div className="bg-muted/50 rounded-md">
        <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
      </div>
    </div>
  );
}

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolUIPart["output"];
  errorText: ToolUIPart["errorText"];
};

export function ToolOutput({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) {
  if (!(output || errorText)) {
    return null;
  }

  let Output = <div>{output as ReactNode}</div>;

  if (typeof output === "object") {
    Output = (
      <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
    );
  } else if (typeof output === "string") {
    Output = <CodeBlock code={output} language="json" />;
  }

  return (
    <div className={cn("space-y-2 p-4 pl-6", className)} {...props}>
      <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {errorText ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto rounded-md text-xs [&_table]:w-full",
          errorText
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-foreground",
        )}
      >
        {errorText && <div>{errorText}</div>}
        {Output}
      </div>
    </div>
  );
}
