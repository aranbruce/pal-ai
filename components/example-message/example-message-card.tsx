"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export interface ExampleMessageCardProps {
  index: number;
  heading?: string;
  subheading?: string;
  modelVariable?: string;
  onClick?: (message: string) => void;
}

export default function ExampleMessageCard({
  index,
  heading,
  subheading,
  modelVariable,
  onClick,
}: ExampleMessageCardProps) {
  async function sendMessage() {
    if (subheading && onClick) {
      onClick(subheading);
    }
  }

  return (
    <SkeletonTheme baseColor="#d4d4d8" highlightColor="#f4f4f5">
      <button
        className={`flex cursor-pointer flex-col content-stretch rounded-xl border border-zinc-200/70 bg-white p-4 text-left shadow-sm transition hover:bg-zinc-100 focus-visible:border-zinc-400 focus-visible:ring-[3px] focus-visible:ring-slate-950/20 active:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 hover:dark:border-zinc-700 hover:dark:bg-zinc-800 dark:focus-visible:border-zinc-800 dark:focus-visible:ring-white/40 ${index > 1 && "hidden md:flex"}`}
        onClick={() => sendMessage()}
        disabled={!subheading || !heading}
      >
        <div className="flex flex-col text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {heading || (
            <>
              <Skeleton width={96} height={15} />
              <Skeleton width={64} height={15} />
            </>
          )}
        </div>
      </button>
    </SkeletonTheme>
  );
}
