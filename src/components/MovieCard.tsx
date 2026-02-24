import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardBookmark } from "@/components/CardBookmark";
import { TMDB_IMG, TMDB_BLUR_PLACEHOLDER } from "@/lib/constants";
import { cn } from "@/lib/utils";
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
    data.vote_average >= 7
      ? "text-green-400"
      : data.vote_average >= 5
      ? "text-yellow-400"
      : "text-orange-400";

  return (
    <Link href={href} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-900 aspect-2/3 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-red-500/20 group-hover:shadow-xl">
        <Image
          src={poster}
          alt={title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw"
          className="object-cover transition-opacity duration-300"
          placeholder="blur"
          blurDataURL={TMDB_BLUR_PLACEHOLDER}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-white text-sm font-semibold line-clamp-2">{title}</p>
          <div className="flex items-center justify-between mt-1">
            <Badge
              variant="secondary"
              className={type === "movie" ? "bg-red-600 text-white text-xs" : "bg-blue-600 text-white text-xs"}
            >
              {type === "movie" ? "Phim" : "TV"}
            </Badge>
            <span className={cn("flex items-center gap-1 text-xs font-medium", ratingColor)}>
              <Star className="size-3 fill-current" />
              {data.vote_average.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Bookmark — client island, does not affect SSR of this component */}
        <CardBookmark item={{
          id: data.id,
          type,
          title,
          poster_path: data.poster_path,
          vote_average: data.vote_average,
          date: date ?? "",
        }} />

        {/* Colored rating badge */}
        <div className={cn("absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5 text-xs font-bold", ratingColor)}>
          <Star className="size-3 fill-current" />
          {data.vote_average.toFixed(1)}
        </div>
      </div>

      {/* Title below */}
      <div className="mt-2 px-0.5">
        <p className="text-gray-900 dark:text-white text-sm font-medium line-clamp-1 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
          {title}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{year}</p>
      </div>
    </Link>
  );
}
