import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TMDB_IMG } from "@/lib/constants";
import type { TMDBMovie, TMDBTVShow } from "@/types";

interface HeroBannerProps {
  item: TMDBMovie | TMDBTVShow;
  type: "movie" | "tv";
}

export function HeroBanner({ item, type }: HeroBannerProps) {
  const title = "title" in item ? item.title : item.name;
  const date = "release_date" in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : "";
  const href = type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
  const backdrop = TMDB_IMG.backdrop(item.backdrop_path);

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-2xl">
      <Image
        src={backdrop}
        alt={title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">{title}</h1>
        <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-4">{item.overview}</p>
        <div className="flex items-center gap-3">
          <Link href={href} prefetch>
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 px-6">
              ▶ Xem ngay
            </Button>
          </Link>
          <span className="text-gray-400 text-sm">{year}</span>
          <span className="text-yellow-400 text-sm font-semibold">
            ★ {item.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
