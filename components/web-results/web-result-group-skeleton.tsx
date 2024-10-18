import SourceCardSkeleton from "@/components/source-card/source-card-skeleton";

export default function WebResultCardGroupSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full flex-col gap-2 overflow-scroll">
        <div className="flex w-full animate-text_loading flex-row gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height={20}
            width={20}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
            />
          </svg>
          <h3 className="text-base font-semibold">Searching...</h3>
        </div>
        <div className="grid w-full grid-cols-1 flex-row gap-2 overflow-visible sm:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <SourceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
