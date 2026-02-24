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
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] rounded-lg bg-gray-800" />
            <Skeleton className="h-4 w-3/4 bg-gray-800" />
            <Skeleton className="h-3 w-1/2 bg-gray-800" />
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
    <div className="py-20 text-center text-gray-500">
      <p>Không có nội dung nào.</p>
    </div>
  );
}
