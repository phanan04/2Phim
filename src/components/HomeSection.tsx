"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { TMDB_IMG } from "@/lib/constants";
import type { TMDBMovie, TMDBTVShow } from "@/types";

interface HeroProps {
  item: TMDBMovie | TMDBTVShow;
  type: "movie" | "tv";
}

export function Hero({ item, type }: HeroProps) {
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
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">{title}</h1>
        <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-4">{item.overview}</p>
        <div className="flex items-center gap-3">
          <Link href={href}>
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

interface SectionProps {
  title: string;
  movies?: TMDBMovie[];
  shows?: TMDBTVShow[];
}

export function Section({ title, movies, shows }: SectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  const items = movies || shows || [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-gray-400 hover:text-white"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-gray-400 hover:text-white"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {movies?.map((movie) => (
          <div key={movie.id} className="snap-start shrink-0 w-36 sm:w-44">
            <MovieCard type="movie" data={movie} />
          </div>
        ))}
        {shows?.map((show) => (
          <div key={show.id} className="snap-start shrink-0 w-36 sm:w-44">
            <MovieCard type="tv" data={show} />
          </div>
        ))}
      </div>
    </section>
  );
}
