"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import type { TMDBMovie, TMDBTVShow } from "@/types";

interface SectionProps {
  title: string;
  movies?: TMDBMovie[];
  shows?: TMDBTVShow[];
  viewAllHref?: string;
}

export function Section({ title, movies, shows, viewAllHref }: SectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });
  };

  const count = (movies?.length ?? 0) + (shows?.length ?? 0);
  if (count === 0) return null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-0">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
        <div className="flex items-center gap-1">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1 mr-2"
            >
              Xem thêm <ChevronRight className="size-3.5" />
            </Link>
          )}
          <button
            onClick={() => scroll("left")}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="size-4 text-white" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* Scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {movies?.map((movie) => (
          <div key={movie.id} className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
            <MovieCard type="movie" data={movie} />
          </div>
        ))}
        {shows?.map((show) => (
          <div key={show.id} className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
            <MovieCard type="tv" data={show} />
          </div>
        ))}
      </div>
    </section>
  );
}
