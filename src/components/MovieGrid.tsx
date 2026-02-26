import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { TMDBMovie, TMDBTVShow } from "@/types";

interface MovieGridProps {
  movies?: TMDBMovie[];
  shows?: TMDBTVShow[];
  loading?: boolean;
  skeletonCount?: number;
}

export function MovieGrid({ movies, shows, loading, skeletonCount = 20 }: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <Skeleton className="aspect-[2/3] rounded-xl bg-gray-200 dark:bg-white/8" />
            <Skeleton className="h-3.5 w-3/4 bg-gray-200 dark:bg-white/8 rounded" />
            <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-white/8 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (movies && movies.length > 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} type="movie" data={movie} />
        ))}
      </div>
    );
  }

  if (shows && shows.length > 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map((show) => (
          <MovieCard key={show.id} type="tv" data={show} />
        ))}
      </div>
    );
  }

  return (
    <div className="py-20 text-center text-gray-400 dark:text-white/30">
      <p>Không có nội dung nào.</p>
    </div>
  );
}
