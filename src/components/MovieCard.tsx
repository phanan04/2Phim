import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { TMDB_IMG, TMDB_BLUR_PLACEHOLDER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CardBookmark } from "@/components/CardBookmark";
import type { TMDBMovie, TMDBTVShow } from "@/types";

type Props =
  | { type: "movie"; data: TMDBMovie }
  | { type: "tv"; data: TMDBTVShow };

export function MovieCard({ type, data }: Props) {
  const title = type === "movie" ? (data as TMDBMovie).title : (data as TMDBTVShow).name;
  const date =
    type === "movie"
      ? (data as TMDBMovie).release_date
      : (data as TMDBTVShow).first_air_date;
  const year = date ? new Date(date).getFullYear() : "N/A";
  const href = type === "movie" ? `/movie/${data.id}` : `/tv/${data.id}`;
  const poster = TMDB_IMG.poster(data.poster_path, "w342");

  const ratingColor =
    data.vote_average >= 7.5
      ? "text-emerald-400"
      : data.vote_average >= 6
        ? "text-amber-400"
        : "text-orange-500";

  return (
    <Link href={href} className="group block">
      {/* Poster */}
      <div className="relative overflow-hidden rounded-xl bg-white/5 aspect-[2/3] shadow-lg transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-2xl group-hover:shadow-black/50 group-hover:z-10">
        <Image
          src={poster}
          alt={title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          className="object-cover transition-opacity duration-300"
          placeholder="blur"
          blurDataURL={TMDB_BLUR_PLACEHOLDER}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          {/* Play button */}
          <div className="flex justify-center mb-3">
            <div className="size-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <Play className="size-4 fill-white text-white ml-0.5" />
            </div>
          </div>
          <p className="text-white text-xs font-semibold line-clamp-2 text-center">{title}</p>
        </div>

        {/* Rating pill — top right */}
        <div
          className={cn(
            "absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold",
            ratingColor
          )}
        >
          ★ {data.vote_average.toFixed(1)}
        </div>

        {/* Type badge — top left */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded",
              type === "movie" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
            )}
          >
            {type === "movie" ? "PHIM" : "TV"}
          </span>
        </div>

        {/* Bookmark */}
        <CardBookmark
          item={{
            id: data.id,
            type,
            title,
            poster_path: data.poster_path,
            vote_average: data.vote_average,
            date: date ?? "",
          }}
        />
      </div>

      {/* Info below */}
      <div className="mt-2.5 px-0.5 space-y-0.5">
        <p className="text-white text-xs font-medium line-clamp-1 group-hover:text-white/80 transition-colors">
          {title}
        </p>
        <p className="text-white/40 text-xs">{year}</p>
      </div>
    </Link>
  );
}
