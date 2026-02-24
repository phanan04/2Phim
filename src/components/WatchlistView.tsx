"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Bookmark, Film, Star } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Button } from "@/components/ui/button";
import { TMDB_IMG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ratingColor = (v: number) =>
  v >= 7 ? "text-green-400" : v >= 5 ? "text-yellow-400" : "text-orange-400";

export function WatchlistView() {
  const { items, toggle } = useWatchlist();

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
          <Bookmark className="size-10 text-gray-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-2">Danh sách trống</h2>
          <p className="text-gray-500 max-w-sm">
            Bấm vào biểu tượng{" "}
            <Bookmark className="inline size-4" />{" "}
            trên poster phim để lưu vào danh sách
          </p>
        </div>
        <Link href="/">
          <Button className="bg-red-600 hover:bg-red-700 gap-2">
            <Film className="size-4" /> Khám phá phim
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Bookmark className="size-7 text-red-500 fill-red-500" />
        Danh sách của tôi
        <span className="text-gray-400 text-xl font-normal">({items.length})</span>
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {items.map((item) => {
          const href = item.type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
          return (
            <div key={`${item.type}-${item.id}`} className="group relative">
              <Link href={href}>
                <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-gray-800 shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={TMDB_IMG.poster(item.poster_path, "w342")}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 45vw, 20vw"
                  />
                  {/* Type badge */}
                  <div
                    className={cn(
                      "absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full",
                      item.type === "movie" ? "bg-red-600" : "bg-blue-600"
                    )}
                  >
                    {item.type === "movie" ? "Phim" : "TV"}
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium line-clamp-1 text-white group-hover:text-red-400 transition-colors">
                  {item.title}
                </p>
                <p className={cn("text-xs flex items-center gap-1 mt-0.5", ratingColor(item.vote_average))}>
                  <Star className="size-3 fill-current" />
                  {item.vote_average.toFixed(1)}
                </p>
              </Link>
              {/* Delete button */}
              <button
                onClick={() => toggle(item)}
                className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-red-600 rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                title="Xóa khỏi danh sách"
              >
                <Trash2 className="size-3.5 text-white" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
