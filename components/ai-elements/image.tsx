import { cn } from "@/lib/utils";
import type { Experimental_GeneratedImage } from "ai";
import NextImage from "next/image";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export function Image({
  base64,
  mediaType,
  alt,
  className,
}: Omit<ImageProps, "uint8Array">) {
  return (
    <NextImage
      alt={alt || ""}
      className={cn(
        "h-auto max-w-full overflow-hidden rounded-lg border",
        className,
      )}
      src={`data:${mediaType};base64,${base64}`}
      width={500}
      height={500}
    />
  );
}
