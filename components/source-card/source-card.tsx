export interface SourceCardProps {
  title: string;
  description: string;
  url: string;
  imageURL: string;
  author: string;
  date: string;
}

export default function SourceCard({
  title,
  description,
  url,
  imageURL,
  author,
  date,
}: SourceCardProps) {
  return (
    <div className="group relative flex">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full min-w-0 flex-col justify-between gap-3 rounded-md border border-zinc-100 bg-zinc-50 p-2 hover:border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-700"
      >
        <div className="flex w-full flex-col gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold">{title}</h3>
        </div>
        <div className="flex w-full flex-row gap-2">
          <img
            src={imageURL}
            alt={title}
            width={16}
            height={16}
            className="h-4 w-4 rounded-full"
          />
          <h5 className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
            {author}
          </h5>
        </div>
      </a>
      <div className="absolute left-0 top-full z-10 mt-2 hidden w-64 flex-col gap-2 rounded-md bg-white p-4 shadow-lg transition group-hover:flex dark:bg-zinc-700">
        <h4 className="text-sm font-semibold">{title}</h4>
        {date && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(date).toLocaleDateString()}
          </p>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
