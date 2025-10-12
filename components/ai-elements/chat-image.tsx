import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ComponentProps } from "react";

export type ChatImageProps = Omit<ComponentProps<typeof Image>, "alt"> & {
  alt?: string;
};

export function ChatImage({ className, alt = "", ...props }: ChatImageProps) {
  return (
    <Image
      className={cn("h-auto max-w-full rounded-lg border", className)}
      alt={alt}
      width={500}
      height={500}
      {...props}
    />
  );
}
