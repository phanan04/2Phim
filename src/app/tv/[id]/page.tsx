import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Star, Calendar, Play, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EpisodeSelector } from "@/components/EpisodeSelector";
import { Section } from "@/components/HomeSection";
import { TrailerButton } from "@/components/TrailerButton";
import { WatchlistButton } from "@/components/WatchlistButton";
import { CastCarousel } from "@/components/CastCarousel";
import { getTVDetails, getTVSeason, getTVCredits, getTVVideos, getSimilarTV, TMDBConfigError } from "@/lib/tmdb";
import { TMDB_IMG } from "@/lib/constants";

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const show = await getTVDetails(id);
    const image = show.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
      : undefined;
    return {
      title: `${show.name} — 2Phim`,
      description: show.overview,
      openGraph: {
        title: show.name,
        description: show.overview,
        images: image ? [{ url: image, width: 1280, height: 720 }] : [],
      },
      twitter: { card: "summary_large_image", images: image ? [image] : [] },
    };
  } catch {
    return { title: "2Phim" };
  }
}

export default async function TVPage({ params }: Props) {
  const { id } = await params;

  let show;
  try {
    show = await getTVDetails(id);
  } catch (e) {
    if (e instanceof TMDBConfigError) redirect("/");
    notFound();
  }

  const seasons = Array.from(
    { length: show.number_of_seasons ?? 1 },
    (_, i) => i + 1
  );

  const [firstSeason, credits, videos, similar] = await Promise.all([
    getTVSeason(id, 1).catch(() => ({
      id: 0,
      name: "Season 1",
      season_number: 1,
      episodes: [],
      air_date: "",
      overview: "",
      poster_path: null,
    })),
    getTVCredits(id).catch(() => ({ cast: [], crew: [] })),
    getTVVideos(id).catch(() => ({ results: [] })),
    getSimilarTV(id).catch(() => ({ results: [] })),
  ]);

  const trailerKey =
    videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer")?.key ?? null;

  const backdrop = TMDB_IMG.backdrop(show.backdrop_path);
  const poster = TMDB_IMG.poster(show.poster_path, "w500");
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : "N/A";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image src={backdrop} alt={show.name} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-48 md:w-64 aspect-2/3 rounded-xl overflow-hidden shadow-2xl shadow-black/60 mx-auto md:mx-0">
              <Image src={poster} alt={show.name} fill className="object-cover" sizes="(max-width: 768px) 192px, 256px" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 pt-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{show.name}</h1>
              {show.tagline && <p className="text-gray-400 italic mt-1">"{show.tagline}"</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <Star className="size-4 fill-yellow-400" />
                {show.vote_average.toFixed(1)}
                <span className="text-gray-400 font-normal">({show.vote_count.toLocaleString()})</span>
              </span>
              {year !== "N/A" && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> {year}
                </span>
              )}
              {show.number_of_seasons && (
                <span className="flex items-center gap-1.5">
                  <Tv className="size-4" /> {show.number_of_seasons} mùa
                </span>
              )}
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {show.genres.map((g) => (
                  <Link key={g.id} href={`/genre/${g.id}?type=tv`}>
                    <Badge variant="secondary" className="bg-white/10 text-gray-200 hover:bg-white/20 cursor-pointer transition-colors">
                      {g.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <p className="text-gray-300 leading-relaxed max-w-2xl">{show.overview}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <WatchlistButton item={{
                id: show.id,
                type: "tv",
                title: show.name,
                poster_path: show.poster_path,
                vote_average: show.vote_average,
                date: show.first_air_date,
              }} />
              <TrailerButton youtubeKey={trailerKey} title={show.name} />
            </div>
          </div>
        </div>

        {/* Cast */}
        {credits.cast.length > 0 && (
          <div className="mt-8">
            <CastCarousel cast={credits.cast} />
          </div>
        )}

        {/* Episode Selector + Player */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Play className="size-6 text-red-500 fill-red-500" /> Xem TV Show
          </h2>
          <EpisodeSelector show={show} seasons={seasons} initialSeasonData={firstSeason} />
        </div>

        {/* Similar */}
        {similar.results.length > 0 && (
          <div className="mt-10">
            <Section
              title="📺 TV Show Tương Tự"
              shows={similar.results.filter((s) => s.id !== show.id).slice(0, 20)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
