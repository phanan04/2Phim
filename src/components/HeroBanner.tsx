"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Play, ChevronRight } from "lucide-react";
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
    // ✅ FIX 1: 100vh vì navbar là fixed (không chiếm DOM height)
    <div className="relative w-full" style={{ height: "100vh", minHeight: 560, maxHeight: 900 }}>
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

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />

      {/* ✅ FIX 2: Content ở bottom-left như Mvoov design, không phải center */}
      <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 lg:px-24 pb-20 md:pb-24 max-w-3xl">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-5">
          <span className="bg-white text-black text-xs font-bold px-2.5 py-1 rounded-md">
            {type === "movie" ? "PHIM" : "TV SHOW"}
          </span>
          {year && <span className="text-white/60 text-sm">{year}</span>}
          <span className="text-white/60 text-sm">★ {item.vote_average.toFixed(1)}</span>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4"
          style={{ textShadow: "0 2px 30px rgba(0,0,0,0.9)" }}
        >
          {title}
        </h1>

        {/* Overview */}
        <p className="text-white/70 text-sm md:text-base leading-relaxed line-clamp-3 mb-8 max-w-lg">
          {item.overview || "Không có mô tả."}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Link href={href} prefetch>
            <button className="flex items-center gap-2.5 bg-white text-black font-bold px-7 py-3 rounded-full text-sm hover:bg-white/90 active:scale-95 transition-all duration-150 shadow-lg shadow-black/30">
              <Play className="size-4 fill-black" />
              Xem Ngay
            </button>
          </Link>
          <Link href={href} prefetch>
            <button className="flex items-center gap-1.5 text-white/80 font-semibold text-sm hover:text-white transition-colors">
              Chi Tiết
              <ChevronRight className="size-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Slide indicators — above the buttons */}
      {items.length > 1 && (
        <div className="absolute bottom-8 right-8 md:right-16 flex gap-1.5">
          {items.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300 h-1",
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
