import Image from "next/image";

export type Movie = {
  adult: boolean;
  backdropPath: string;
  genreIds: number[];
  id: number;
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  popularity: number;
  posterPath: string;
  releaseDate: string;
  title: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
};

export default function MovieCard({
  id,
  title,
  backdropPath,
  genreIds,
  overview,
  popularity,
  posterPath,
  releaseDate,
  voteAverage,
  voteCount,
}: Movie) {
  return (
    <div className="relative flex min-w-64 snap-start flex-col items-start overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
      {backdropPath && (
        <>
          <div className="relative w-full">
            <img
              className="h-40 w-full object-cover"
              src={`https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/${backdropPath}`}
              alt={title}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
            <div className="absolute bottom-1 left-3 right-3 flex flex-col gap-1">
              <div className="flex flex-row items-end gap-2">
                <h3 className="line-clamp-2- text-md w-full font-semibold text-white">
                  {title}
                </h3>
                <div className="flex flex-row items-center gap-1 text-xs text-white">
                  <h4 className="font-semibold">{voteAverage.toFixed(1)}/10</h4>
                  <p className="">({voteCount.toLocaleString()})</p>
                </div>
              </div>
              <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-sm dark:text-zinc-300"></div>
            </div>
          </div>
        </>
      )}
      <div className="flex h-full w-full flex-col justify-between gap-3 p-3">
        <div className="flex flex-col gap-2">
          <p className="line-clamp-4 text-sm">{overview}</p>
        </div>
      </div>
    </div>
  );
}
