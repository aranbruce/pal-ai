"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, LightBulbIcon } from "@heroicons/react/16/solid";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type { ComponentProps } from "react";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Response } from "./response";

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number;
  hasContent: boolean;
  setHasContent: (hasContent: boolean) => void;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = false,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const [duration, setDuration] = useControllableState({
      prop: durationProp,
      defaultProp: 0,
    });

    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [hasContent, setHasContent] = useState(false);

    // Track duration when streaming starts and ends, and update live while streaming
    useEffect(() => {
      if (isStreaming) {
        if (startTimeRef.current === null) {
          startTimeRef.current = Date.now();
        }
        intervalRef.current = setInterval(() => {
          setDuration(
            Math.ceil((Date.now() - startTimeRef.current!) / MS_IN_S),
          );
        }, 100);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (startTimeRef.current !== null) {
          setDuration(Math.ceil((Date.now() - startTimeRef.current) / MS_IN_S));
          startTimeRef.current = null;
        }
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [isStreaming, setDuration]);

    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    useEffect(() => {
      if (defaultOpen && !isStreaming && isOpen && !hasAutoClosed) {
        // Add a small delay before closing to allow user to see the content
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosed(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosed]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
    };

    return (
      <ReasoningContext.Provider
        value={{
          isStreaming,
          isOpen,
          setIsOpen,
          duration,
          hasContent,
          setHasContent,
        }}
      >
        <Collapsible
          className={cn("not-prose mb-4", className)}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  },
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger>;

const getThinkingMessage = (isStreaming: boolean, duration?: number) => {
  if (isStreaming) {
    if (duration === undefined) {
      return <p>Thinking...</p>;
    }
    return <p>Thinking for {duration}s</p>;
  }
  if (duration === 0) {
    return <p>Thinking...</p>;
  }
  if (duration === undefined) {
    return <p>Thought for a few seconds</p>;
  }
  return <p>Thought for {duration} seconds</p>;
};

export const ReasoningTrigger = memo(
  ({ className, children, ...props }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration, hasContent } = useReasoning();

    return (
      <CollapsibleTrigger
        className={cn(
          "text-muted-foreground flex w-full items-center gap-2 text-sm transition-colors",
          hasContent
            ? "hover:text-muted-foreground/80 cursor-pointer"
            : "cursor-default",
          className,
        )}
        disabled={!hasContent}
        {...props}
      >
        {children ?? (
          <>
            <LightBulbIcon className="size-4" />
            {getThinkingMessage(isStreaming, duration)}
            {hasContent && (
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform",
                  isOpen ? "rotate-180" : "rotate-0",
                )}
              />
            )}
          </>
        )}
      </CollapsibleTrigger>
    );
  },
);

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => {
    const { setHasContent } = useReasoning();

    useEffect(() => {
      // Check if there's actual content (not just whitespace)
      const hasActualContent = Boolean(children && children.trim().length > 0);
      setHasContent(hasActualContent);
    }, [children, setHasContent]);

    return (
      <CollapsibleContent
        className={cn(
          "mt-4 text-sm",
          "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground data-[state=closed]:animate-out data-[state=open]:animate-in outline-none",
          className,
        )}
        {...props}
      >
        <Response className="grid gap-2">{children}</Response>
      </CollapsibleContent>
    );
  },
);

Reasoning.displayName = "Reasoning";
ReasoningTrigger.displayName = "ReasoningTrigger";
ReasoningContent.displayName = "ReasoningContent";
