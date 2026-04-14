"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      {...props}
    />
  );
}

export type ButtonGroupTextProps = HTMLAttributes<HTMLSpanElement>;

export function ButtonGroupText({ className, ...props }: ButtonGroupTextProps) {
  return (
    <span
      className={cn(
        "border-input bg-background inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium",
        className,
      )}
      {...props}
    />
  );
}
