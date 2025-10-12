"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HandThumbDownIcon, HandThumbUpIcon } from "@heroicons/react/16/solid";
import { usePostHog } from "posthog-js/react";
import type { ComponentProps } from "react";
import { useState } from "react";

export type ActionsProps = ComponentProps<"div">;

export function Actions({ className, children, ...props }: ActionsProps) {
  return (
    <div className={cn("flex items-center gap-0", className)} {...props}>
      {children}
    </div>
  );
}

export type ActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

export function Action({
  tooltip,
  children,
  label,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ActionProps) {
  const button = (
    <Button
      className={cn(
        "text-muted-foreground hover:text-foreground relative size-9 p-1.5",
        "[&>svg]:size-5",
        className,
      )}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
      <span className="sr-only" aria-label={label || tooltip}>
        {label || tooltip}
      </span>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

export type FeedbackActionsProps = {
  messageId: string;
};

export function FeedbackActions({ messageId }: FeedbackActionsProps) {
  const posthog = usePostHog();
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(
    null,
  );
  const userId = posthog.get_distinct_id();

  const handleFeedback = (type: "positive" | "negative") => {
    if (feedback === type) {
      // If clicking the same button again, remove feedback
      setFeedback(null);
      posthog.capture("message_feedback_removed", {
        messageId,
        feedbackType: type,
        distinctId: userId,
      });
    } else {
      setFeedback(type);
      posthog.capture("message_feedback", {
        messageId,
        feedbackType: type,
        distinctId: userId,
      });
    }
  };

  return (
    <>
      <Action
        onClick={() => handleFeedback("positive")}
        label="Thumbs up"
        tooltip="Good response"
        aria-label="Give positive feedback"
        className={cn(
          feedback === "positive" && "text-green-600 dark:text-green-400",
        )}
      >
        <HandThumbUpIcon />
      </Action>
      <Action
        onClick={() => handleFeedback("negative")}
        label="Thumbs down"
        tooltip="Poor response"
        aria-label="Give negative feedback"
        className={cn(
          feedback === "negative" && "text-red-600 dark:text-red-400",
        )}
      >
        <HandThumbDownIcon />
      </Action>
    </>
  );
}
