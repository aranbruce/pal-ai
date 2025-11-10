"use client";

import { MessageAction } from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

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
      <MessageAction
        onClick={() => handleFeedback("positive")}
        label="Thumbs up"
        tooltip="Good response"
        aria-label="Give positive feedback"
        className={cn(
          feedback === "positive" && "text-green-600 dark:text-green-400",
        )}
      >
        <ThumbsUp />
      </MessageAction>
      <MessageAction
        onClick={() => handleFeedback("negative")}
        label="Thumbs down"
        tooltip="Poor response"
        aria-label="Give negative feedback"
        className={cn(
          feedback === "negative" && "text-red-600 dark:text-red-400",
        )}
      >
        <ThumbsDown />
      </MessageAction>
    </>
  );
}
