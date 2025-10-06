import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export type ChatImageProps = ComponentProps<"img">;

export const ChatImage = ({ className, ...props }: ChatImageProps) => (
  <img
    className={cn("h-auto max-w-full rounded-lg border", className)}
    {...props}
  />
);
