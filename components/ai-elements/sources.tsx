"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { BookOpenIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import type { ComponentProps } from "react";

export type SourcesProps = ComponentProps<"div">;

export function Sources({ className, ...props }: SourcesProps) {
  return (
    <Collapsible
      className={cn("not-prose text-primary mb-4 text-xs", className)}
      {...props}
    />
  );
}

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export function SourcesTrigger({
  className,
  count,
  children,
  ...props
}: SourcesTriggerProps) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group focus-visible:ring-ring/50 flex cursor-pointer items-center gap-2 rounded-sm outline-none focus-visible:ring-[3px]",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <p className="font-medium">Used {count} sources</p>
          <ChevronDownIcon className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </>
      )}
    </CollapsibleTrigger>
  );
}

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export function SourcesContent({ className, ...props }: SourcesContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "mt-3 flex w-fit flex-col gap-2",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in outline-none",
        className,
      )}
      {...props}
    />
  );
}

export type SourceProps = ComponentProps<"a">;

export function Source({ href, title, children, ...props }: SourceProps) {
  return (
    <a
      className="text-muted-foreground flex items-center gap-2"
      href={href}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children ?? (
        <>
          <BookOpenIcon className="h-4 w-4" />
          <span className="block font-medium">{title}</span>
        </>
      )}
    </a>
  );
}
