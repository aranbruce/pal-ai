"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  function Response({ className, ...props }: ResponseProps) {
    return (
      <Streamdown
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:min-w-0",
          className,
        )}
        {...props}
      />
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
