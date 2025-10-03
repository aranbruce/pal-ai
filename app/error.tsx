"use client";

import { GeistSans } from "geist/font/sans";
import Link from "next/link";

import { Button } from "@/components//ui/button";
import Header from "@/components/ui/header";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className={`${GeistSans.className} bg-background`}>
        <Header />
        <div className="flex h-full flex-col items-center p-4">
          <div className="flex h-full max-w-56 flex-col justify-center gap-4 pb-12 text-center">
            <h2 className="text-primary text-xl font-medium">
              Something went wrong!
            </h2>
            <div className="flex flex-col gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Button variant="secondary" asChild>
                <Link href="/">Go back to home</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
