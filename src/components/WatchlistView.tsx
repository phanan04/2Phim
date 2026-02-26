"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Bookmark, Film, Star } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { TMDB_IMG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ratingColor = (v: number) =>
  v >= 7.5 ? "text-emerald-400" : v >= 6 ? "text-amber-400" : "text-orange-500";

export function WatchlistView() {
  const { items, toggle } = useWatchlist();

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <Bookmark className="size-10 text-gray-300 dark:text-white/30" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Danh sách trống</h2>
          <p className="text-gray-500 dark:text-white/40 max-w-sm text-sm">
            Bấm vào biểu tượng <Bookmark className="inline size-3.5" /> trên poster phim để lưu vào danh sách
          </p>
        </div>
        <Link href="/">
          <button className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-white/90 transition-colors">
            <Film className="size-4" /> Khám phá phim
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-10 pb-16 space-y-8">
      <div className="flex items-center gap-3">
        <Bookmark className="size-6 text-gray-900 dark:text-white fill-current" />
        <h1 className="text-2xl md:text-3xl font-bold">Danh sách của tôi</h1>
        <span className="text-gray-400 dark:text-white/40 font-normal">({items.length})</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const href = item.type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
          return (
            <div key={`${item.type}-${item.id}`} className="group relative">
              <Link href={href}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 shadow-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-black/60">
                  <Image
                    src={TMDB_IMG.poster(item.poster_path, "w342")}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 45vw, 20vw"
                  />
                  {/* Type badge */}
                  <div className={cn(
                    "absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded",
                    item.type === "movie" ? "bg-red-600" : "bg-blue-600"
                  )}>
                    {item.type === "movie" ? "PHIM" : "TV"}
                  </div>
                </div>
                <p className="mt-2.5 text-xs font-medium line-clamp-1 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-white/70 transition-colors">
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
