import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Star, Clock, Calendar, Play } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Section } from "@/components/HomeSection";
import { TrailerButton } from "@/components/TrailerButton";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ShareButton } from "@/components/ShareButton";
import { CastCarousel } from "@/components/CastCarousel";
import { getMovieDetails, getMovieCredits, getMovieVideos, getSimilarMovies, TMDBConfigError } from "@/lib/tmdb";
import { TMDB_IMG } from "@/lib/constants";
import { TrackView } from "@/components/TrackView";

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

  const backdrop = TMDB_IMG.backdrop(movie.backdrop_path, "original");
  const poster = TMDB_IMG.poster(movie.poster_path, "w500");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div className="min-h-screen">
      <TrackView id={movie.id} title={movie.title} poster_path={movie.poster_path} type="movie" vote_average={movie.vote_average} date={movie.release_date} />

      {/* Backdrop hero */}
      <div className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        <Image src={backdrop} alt={movie.title} fill className="object-cover" priority sizes="100vw" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#0f0f0f] via-gray-50/50 dark:via-[#0f0f0f]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 dark:from-[#0f0f0f]/60 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-44 md:w-60 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 mx-auto md:mx-0 ring-1 ring-white/10">
              <Image src={poster} alt={movie.title} fill className="object-cover" sizes="(max-width: 768px) 176px, 240px" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5 pt-2">
            {/* Breadcrumb-style nav */}
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Link href="/movies" className="hover:text-white transition-colors">Phim</Link>
              <span>/</span>
              <span className="text-white/70 line-clamp-1">{movie.title}</span>
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-white/40 italic mt-2 text-sm">&ldquo;{movie.tagline}&rdquo;</p>
              )}
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="flex items-center gap-1.5 bg-amber-400/15 text-amber-400 px-3 py-1 rounded-full font-semibold text-sm">
                <Star className="size-3.5 fill-amber-400" />
                {movie.vote_average.toFixed(1)}
                <span className="text-amber-400/60 font-normal text-xs">({movie.vote_count.toLocaleString()})</span>
              </span>
              {year !== "N/A" && (
                <span className="flex items-center gap-1.5 bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm">
                  <Calendar className="size-3.5" /> {year}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1.5 bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm">
                  <Clock className="size-3.5" /> {runtime}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <Link key={g.id} href={`/genre/${g.id}?type=movie`}>
                    <span className="px-3 py-1 rounded-full border border-white/15 text-white/60 hover:border-white/40 hover:text-white text-xs transition-colors cursor-pointer">
                      {g.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-white/65 leading-relaxed max-w-2xl text-sm md:text-base">{movie.overview}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href={`/movie/${movie.id}#player`}>
                <button className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-white/90 transition-colors">
                  <Play className="size-4 fill-black" /> Xem Phim
                </button>
              </Link>
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
          <div className="mt-12">
            <CastCarousel cast={credits.cast} />
          </div>
        )}

        {/* Video Player */}
        <div className="mt-12" id="player">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Play className="size-5 text-red-500 fill-red-500" /> Xem Phim
          </h2>
          <VideoPlayer tmdbId={movie.id} type="movie" />
        </div>

        {/* Similar */}
        {similar.results.length > 0 && (
          <div className="mt-14">
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
