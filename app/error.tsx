"use client";

import { GeistSans } from "geist/font/sans";

import Button from "@/components/button";
import Header from "@/components/header";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        className={`${GeistSans.className} bg:white h-screen dark:bg-zinc-950`}
      >
        <Header />
        <div className="flex h-full flex-col items-center p-4">
          <div className="flex h-full max-w-56 flex-col justify-center gap-4 pb-12 text-center">
            <h2 className="text-xl font-medium text-zinc-950 dark:text-white">
              Something went wrong!
            </h2>
            <div className="flex flex-col gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Button variant="secondary" href="/">
                Go back to home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
