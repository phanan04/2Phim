"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Play, ChevronRight, Info } from "lucide-react";
import { TMDB_IMG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TMDBMovie, TMDBTVShow } from "@/types";

interface HeroBannerProps {
  items: (TMDBMovie | TMDBTVShow)[];
  type: "movie" | "tv";
}

export function HeroBanner({ items, type }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [items.length]);

  const item = items[current];
  if (!item) return null;

  const title = "title" in item ? item.title : item.name;
  const date = "release_date" in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : "";
  const href = type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 64px)", minHeight: 480, maxHeight: 720 }}>
      {/* Background images */}
      {items.slice(0, 5).map((it, i) => (
        <Image
          key={it.id}
          src={TMDB_IMG.backdrop(it.backdrop_path, "original")}
          alt={"title" in it ? it.title : it.name}
          fill
          className={cn(
            "object-cover transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0"
          )}
          priority={i === 0}
          sizes="100vw"
        />
      ))}

      {/* Gradient overlays — matches Mvoov design */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-3xl">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded">
            {type === "movie" ? "PHIM" : "TV SHOW"}
          </span>
          {year && <span className="text-white/60 text-sm">{year}</span>}
          <span className="text-white/60 text-sm">
            ★ {item.vote_average.toFixed(1)}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 drop-shadow-2xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
        >
          {title}
        </h1>

        {/* Overview */}
        <p className="text-white/75 text-sm md:text-base leading-relaxed line-clamp-3 mb-8 max-w-lg">
          {item.overview || "Không có mô tả."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link href={href} prefetch>
            <button className="flex items-center gap-2.5 bg-white text-black font-bold px-7 py-3 rounded-full text-sm hover:bg-white/90 active:scale-95 transition-all duration-150 shadow-lg shadow-black/30">
              <Play className="size-4 fill-black" />
              Xem Ngay
            </button>
          </Link>
          <Link href={href} prefetch>
            <button className="flex items-center gap-2 text-white/80 font-semibold text-sm hover:text-white transition-colors">
              Chi Tiết
              <ChevronRight className="size-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Slide indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex gap-1.5">
          {items.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-400 h-1",
                i === current
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
