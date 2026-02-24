"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import type { TMDBMovie, TMDBTVShow } from "@/types";

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
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
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
