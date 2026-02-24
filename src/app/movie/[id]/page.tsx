import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Star, Clock, Calendar, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Section } from "@/components/HomeSection";
import { TrailerButton } from "@/components/TrailerButton";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ShareButton } from "@/components/ShareButton";
import { CastCarousel } from "@/components/CastCarousel";
import { getMovieDetails, getMovieCredits, getMovieVideos, getSimilarMovies, TMDBConfigError } from "@/lib/tmdb";
import { TMDB_IMG } from "@/lib/constants";
import { TrackView } from "@/components/TrackView";
import { Breadcrumb } from "@/components/Breadcrumb";

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(id);
    const image = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : undefined;
    return {
      title: `${movie.title} — 2Phim`,
      description: movie.overview,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: image ? [{ url: image, width: 1280, height: 720 }] : [],
      },
      twitter: { card: "summary_large_image", images: image ? [image] : [] },
    };
  } catch {
    return { title: "2Phim" };
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

  const [credits, videos, similar] = await Promise.all([
    getMovieCredits(id).catch(() => ({ cast: [], crew: [] })),
    getMovieVideos(id).catch(() => ({ results: [] })),
    getSimilarMovies(id).catch(() => ({ results: [] })),
  ]);

  const trailerKey =
    videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer")?.key ?? null;

  const backdrop = TMDB_IMG.backdrop(movie.backdrop_path);
  const poster = TMDB_IMG.poster(movie.poster_path, "w500");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      <TrackView id={movie.id} title={movie.title} poster_path={movie.poster_path} type="movie" vote_average={movie.vote_average} date={movie.release_date} />
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image src={backdrop} alt={movie.title} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-t from-gray-100 dark:from-gray-950 via-gray-100/40 dark:via-gray-950/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
        <Breadcrumb items={[{ label: "Phim", href: "/movies" }, { label: movie.title }]} />
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-48 md:w-64 aspect-2/3 rounded-xl overflow-hidden shadow-2xl shadow-black/60 mx-auto md:mx-0">
              <Image src={poster} alt={movie.title} fill className="object-cover" sizes="(max-width: 768px) 192px, 256px" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 pt-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-gray-500 dark:text-gray-400 italic mt-1">"{movie.tagline}"</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <Star className="size-4 fill-yellow-400" />
                {movie.vote_average.toFixed(1)}
                <span className="text-gray-500 dark:text-gray-400 font-normal">({movie.vote_count.toLocaleString()})</span>
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
                  <Link key={g.id} href={`/genre/${g.id}?type=movie`}>
                    <Badge variant="secondary" className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20 cursor-pointer transition-colors">
                      {g.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">{movie.overview}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <WatchlistButton item={{
                id: movie.id,
                type: "movie",
                title: movie.title,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                date: movie.release_date,
              }} />
              <TrailerButton youtubeKey={trailerKey} title={movie.title} />
              <ShareButton title={movie.title} />
            </div>
          </div>
        </div>

        {/* Cast */}
        {credits.cast.length > 0 && (
          <div className="mt-8">
            <CastCarousel cast={credits.cast} />
          </div>
        )}

        {/* Video Player */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Play className="size-6 text-red-500 fill-red-500" /> Xem Phim
          </h2>
          <VideoPlayer tmdbId={movie.id} type="movie" />
        </div>

        {/* Similar */}
        {similar.results.length > 0 && (
          <div className="mt-10">
            <Section
              title="🎬 Phìm Tương Tự"
              movies={similar.results.filter((m) => m.id !== movie.id).slice(0, 20)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
