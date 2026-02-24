import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Star, Clock, Calendar, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Section } from "@/components/HomeSection";
import { getMovieDetails, getMovieCredits, getTrendingMovies, TMDBConfigError } from "@/lib/tmdb";
import { TMDB_IMG } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(id);
    return { title: `${movie.title} — CineStream`, description: movie.overview };
  } catch {
    return { title: "CineStream" };
  }
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;

  let movie;
  try {
    movie = await getMovieDetails(id);
  } catch (e) {
    if (e instanceof TMDBConfigError) redirect("/");
    notFound();
  }

  const [credits, similar] = await Promise.all([
    getMovieCredits(id).catch(() => ({ cast: [], crew: [] })),
    getTrendingMovies().catch(() => ({ results: [] })),
  ]);

  const backdrop = TMDB_IMG.backdrop(movie.backdrop_path);
  const poster = TMDB_IMG.poster(movie.poster_path, "w500");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image src={backdrop} alt={movie.title} fill className="object-cover" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/60 mx-auto md:mx-0">
              <Image src={poster} alt={movie.title} fill className="object-cover" unoptimized />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 pt-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-gray-400 italic mt-1">"{movie.tagline}"</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <Star className="size-4 fill-yellow-400" />
                {movie.vote_average.toFixed(1)}
                <span className="text-gray-400 font-normal">({movie.vote_count.toLocaleString()})</span>
              </span>
              {year !== "N/A" && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> {year}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" /> {runtime}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <Badge key={g.id} variant="secondary" className="bg-white/10 text-gray-200">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-gray-300 leading-relaxed max-w-2xl">{movie.overview}</p>

            {/* Cast */}
            {credits.cast.length > 0 && (
              <div>
                <span className="text-gray-400 text-sm">
                  Diễn viên:{" "}
                  <span className="text-white">
                    {credits.cast
                      .slice(0, 5)
                      .map((c) => c.name)
                      .join(", ")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Play className="size-6 text-red-500 fill-red-500" /> Xem Phim
          </h2>
          <VideoPlayer tmdbId={movie.id} type="movie" />
        </div>

        {/* Similar */}
        {similar.results.length > 1 && (
          <div className="mt-10">
            <Section
              title="Phim Tương Tự"
              movies={similar.results.filter((m) => m.id !== movie.id).slice(0, 20)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
