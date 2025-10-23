"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

const Suggestions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-wrap items-center justify-center gap-2",
      className,
    )}
    {...props}
  />
));
Suggestions.displayName = "Suggestions";

interface SuggestionProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  suggestion: string;
  onClick?: (suggestion: string) => void;
}

const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(
  ({ className, suggestion, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onClick?.(suggestion);
    };

    return (
      <button
        ref={ref}
        className={cn(
          "bg-secondary-gradient hover:bg-accent-gradient-hover hover:text-accent-foreground focus-visible:ring-ring border-input/60 inline-flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {suggestion}
      </button>
    );
  },
);
Suggestion.displayName = "Suggestion";

export { Suggestion, Suggestions };
