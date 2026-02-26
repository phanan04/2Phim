import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Star, Calendar, Play, Tv } from "lucide-react";
import { EpisodeSelector } from "@/components/EpisodeSelector";
import { Section } from "@/components/HomeSection";
import { TrailerButton } from "@/components/TrailerButton";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ShareButton } from "@/components/ShareButton";
import { CastCarousel } from "@/components/CastCarousel";
import { getTVDetails, getTVSeason, getTVCredits, getTVVideos, getSimilarTV, TMDBConfigError } from "@/lib/tmdb";
import { TMDB_IMG } from "@/lib/constants";
import { TrackView } from "@/components/TrackView";

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string; ep?: string }>;
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

export default async function TVDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s, ep } = await searchParams;
  const initialSeason = s ? Math.max(1, parseInt(s, 10)) : undefined;
  const initialEpisode = ep ? Math.max(1, parseInt(ep, 10)) : undefined;

  let show;
  try {
    show = await getTVDetails(id);
  } catch (e) {
    if (e instanceof TMDBConfigError) redirect("/");
    notFound();
  }

  const seasons = Array.from({ length: show.number_of_seasons ?? 1 }, (_, i) => i + 1);

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

  const backdrop = TMDB_IMG.backdrop(show.backdrop_path, "original");
  const poster = TMDB_IMG.poster(show.poster_path, "w500");
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : "N/A";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <TrackView id={show.id} title={show.name} poster_path={show.poster_path} type="tv" vote_average={show.vote_average} date={show.first_air_date} />

      {/* Backdrop hero */}
      <div className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        <Image src={backdrop} alt={show.name} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/60 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-44 md:w-60 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 mx-auto md:mx-0 ring-1 ring-white/10">
              <Image src={poster} alt={show.name} fill className="object-cover" sizes="(max-width: 768px) 176px, 240px" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5 pt-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Link href="/tv" className="hover:text-white transition-colors">TV Show</Link>
              <span>/</span>
              <span className="text-white/70 line-clamp-1">{show.name}</span>
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">{show.name}</h1>
              {show.tagline && (
                <p className="text-white/40 italic mt-2 text-sm">&ldquo;{show.tagline}&rdquo;</p>
              )}
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="flex items-center gap-1.5 bg-amber-400/15 text-amber-400 px-3 py-1 rounded-full font-semibold text-sm">
                <Star className="size-3.5 fill-amber-400" />
                {show.vote_average.toFixed(1)}
                <span className="text-amber-400/60 font-normal text-xs">({show.vote_count.toLocaleString()})</span>
              </span>
              {year !== "N/A" && (
                <span className="flex items-center gap-1.5 bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm">
                  <Calendar className="size-3.5" /> {year}
                </span>
              )}
              {show.number_of_seasons && (
                <span className="flex items-center gap-1.5 bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm">
                  <Tv className="size-3.5" /> {show.number_of_seasons} mùa
                </span>
              )}
            </div>

            {/* Genres */}
            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {show.genres.map((g) => (
                  <Link key={g.id} href={`/genre/${g.id}?type=tv`}>
                    <span className="px-3 py-1 rounded-full border border-white/15 text-white/60 hover:border-white/40 hover:text-white text-xs transition-colors cursor-pointer">
                      {g.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-white/65 leading-relaxed max-w-2xl text-sm md:text-base">{show.overview}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href={`/tv/${show.id}#player`}>
                <button className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-white/90 transition-colors">
                  <Play className="size-4 fill-black" /> Xem Ngay
                </button>
              </Link>
              <WatchlistButton item={{
                id: show.id,
                type: "tv",
                title: show.name,
                poster_path: show.poster_path,
                vote_average: show.vote_average,
                date: show.first_air_date,
              }} />
              <TrailerButton youtubeKey={trailerKey} title={show.name} />
              <ShareButton title={show.name} />
            </div>
          </div>
        </div>

        {/* Cast */}
        {credits.cast.length > 0 && (
          <div className="mt-12">
            <CastCarousel cast={credits.cast} />
          </div>
        )}

        {/* Episode Selector + Player */}
        <div className="mt-12" id="player">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Play className="size-5 text-red-500 fill-red-500" /> Xem TV Show
          </h2>
          <EpisodeSelector show={show} seasons={seasons} initialSeasonData={firstSeason} initialSeason={initialSeason} initialEpisode={initialEpisode} />
        </div>

        {/* Similar */}
        {similar.results.length > 0 && (
          <div className="mt-14">
            <Section
              title="TV Show Tương Tự"
              shows={similar.results.filter((s) => s.id !== show.id).slice(0, 20)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
